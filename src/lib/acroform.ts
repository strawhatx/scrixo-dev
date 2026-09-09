import { PDFArray, PDFCheckBox, PDFDocument, PDFDropdown, PDFName, PDFOptionList, PDFRadioGroup, PDFSignature, PDFTextField } from "pdf-lib";
import { getPdfDocument } from "@/lib/pdfjs-doc";
import { looksLikeDate, toDateInputValue } from "@/lib/form-date";
import type { FieldOverlay } from "@/lib/pdf-utils";
import type { FieldKind } from "@/types/fields";

type PdfPage = {
  rotate?: number;
  getViewport: (opts: { scale: number; rotation?: number }) => {
    width: number;
    height: number;
    convertToViewportRectangle: (rect: number[]) => number[];
  };
  getAnnotations: (opts: { intent: string }) => Promise<WidgetAnnot[]>;
  render: (params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
    annotationMode?: number;
  }) => { promise: Promise<void> };
};

type WidgetAnnot = {
  subtype?: string;
  annotationType?: number;
  fieldName?: string;
  fieldType?: unknown;
  fieldValue?: unknown;
  buttonValue?: unknown;
  rect?: number[];
  hidden?: boolean;
  checkbox?: boolean;
  checkBox?: boolean;
  radioButton?: boolean;
  pushButton?: boolean;
  combo?: boolean;
  multiSelect?: boolean;
  multiLine?: boolean;
  bitmap?: unknown;
  exportValue?: unknown;
  appearanceState?: unknown;
  checked?: boolean;
  options?: Array<{ exportValue?: string; displayValue?: string } | string>;
};

const DATE_NAME = /date|dob|birth|signed.?on/i;
const SIG_NAME = /sig(nature)?|initials/i;
const APPEARANCE_SCALE = 2;
const WIDGET_ANNOTATION_TYPE = 20;

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) return asString(value[0]);
  if (value && typeof value === "object") {
    const named = (value as { name?: unknown }).name;
    if (typeof named === "string") return named;
    try {
      const decoded = (value as { decodeText?: () => string; asString?: () => string }).decodeText?.()
        ?? (value as { asString?: () => string }).asString?.();
      if (decoded) return String(decoded).replace(/^\//, "");
    } catch {
      // ignore
    }
  }
  return undefined;
}

function fieldTypeName(raw: unknown): string {
  return (asString(raw) ?? "").replace(/^\//, "");
}

function isOffValue(value: string | undefined): boolean {
  return !value || /^(off|no|0|false|unchecked)$/i.test(value.trim());
}

function widgetOnValue(annot: WidgetAnnot): string | undefined {
  return asString(annot.exportValue) ?? asString(annot.buttonValue);
}

function widgetIsChecked(annot: WidgetAnnot, fieldValue: string | undefined, onValue: string | undefined): boolean {
  if (typeof annot.checked === "boolean") return annot.checked;
  const appearance = asString(annot.appearanceState);
  if (appearance) return !isOffValue(appearance) && (!onValue || appearance === onValue);
  if (onValue) return Boolean(fieldValue) && fieldValue === onValue;
  if (annot.radioButton) return false;
  return !isOffValue(fieldValue);
}

const RADIO_FLAG = 1 << 15;
const PUSHBUTTON_FLAG = 1 << 16;

function asFlag(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && "asNumber" in value) {
    try {
      return (value as { asNumber: () => number }).asNumber();
    } catch {
      return 0;
    }
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function inheritedLookup(annot: { lookup?: (name: unknown) => unknown } | undefined, key: string): unknown {
  let current: { lookup?: (name: unknown) => unknown } | undefined = annot;
  for (let depth = 0; depth < 6 && current; depth++) {
    try {
      const value = current.lookup?.(PDFName.of(key));
      if (value != null) return value;
      current = current.lookup?.(PDFName.of("Parent")) as { lookup?: (name: unknown) => unknown } | undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function buttonKindFromFlags(ff: number, radioHint?: boolean, pushHint?: boolean): FieldKind | null {
  if (pushHint || (ff & PUSHBUTTON_FLAG)) return null;
  if (radioHint || (ff & RADIO_FLAG)) return "radio";
  return "checkbox";
}

function inferKind(annot: WidgetAnnot, fieldName: string, fieldValue?: string): FieldKind | null {
  const type = fieldTypeName(annot.fieldType);
  if (type === "Sig") return "signature";
  if (type === "Tx") return DATE_NAME.test(fieldName) || looksLikeDate(fieldValue) ? "date" : "text";
  if (type === "Ch") return annot.combo ? "select" : "list";
  if (type === "Btn") {
    return buttonKindFromFlags(0, annot.radioButton, annot.pushButton);
  }
  if (annot.radioButton) return "radio";
  if (annot.checkbox || annot.checkBox) return "checkbox";
  if (annot.combo) return "select";
  if (SIG_NAME.test(fieldName)) return "signature";
  if (annot.fieldName || type) return DATE_NAME.test(fieldName) ? "date" : "text";
  return "text";
}

function isWidgetAnnot(annot: WidgetAnnot): boolean {
  if ((annot.subtype ?? "") === "Widget") return true;
  if (annot.annotationType === WIDGET_ANNOTATION_TYPE) return true;
  return Boolean(annot.fieldType || annot.fieldName);
}

function widgetAppearanceState(widget: { dict?: unknown }): string | undefined {
  try {
    const dict = widget.dict as { lookup?: (name: unknown) => unknown } | undefined;
    return pdfNameString(dict?.lookup?.(PDFName.of("AS")));
  } catch {
    return undefined;
  }
}

function expandImportedBox(kind: FieldKind, box: { x: number; y: number; width: number; height: number }) {
  if (kind === "signature") {
    if (box.height >= 44) return box;
    const extra = 44 - box.height;
    return { ...box, y: box.y - extra / 2, height: 44 };
  }
  if (kind === "checkbox" || kind === "radio") {
    const min = 16;
    if (box.width >= min && box.height >= min) return box;
    return {
      x: box.x + box.width / 2 - min / 2,
      y: box.y + box.height / 2 - min / 2,
      width: min,
      height: min,
    };
  }
  if (kind === "date") return { ...box, height: Math.max(box.height, 28) };
  if (box.height >= 24) return box;
  return { ...box, height: Math.max(box.height * 2, 24) };
}

function viewportRect(viewport: { convertToViewportRectangle: (rect: number[]) => number[] }, rect: number[]) {
  const mapped = viewport.convertToViewportRectangle(rect);
  const left = Math.min(mapped[0], mapped[2]);
  const top = Math.min(mapped[1], mapped[3]);
  return {
    x: left,
    y: top,
    width: Math.abs(mapped[2] - mapped[0]),
    height: Math.abs(mapped[3] - mapped[1]),
  };
}

function choiceOptions(annot: WidgetAnnot): string[] | undefined {
  const raw = annot.options;
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  return raw.map((opt) => (typeof opt === "string" ? opt : asString(opt.exportValue ?? opt.displayValue) ?? "")).filter(Boolean);
}

function pdfNameString(value: unknown): string | undefined {
  const s = asString(value);
  return s ? s.replace(/^\//, "") : undefined;
}

function pageIndexForWidget(pdfDoc: PDFDocument, widget: { dict?: unknown; ref?: unknown; P?: () => unknown }): number {
  const pages = pdfDoc.getPages();
  try {
    const finder = (pdfDoc as PDFDocument & { findPageForAnnotationRef?: (ref: unknown) => unknown }).findPageForAnnotationRef;
    if (finder && widget.ref) {
      const page = finder(widget.ref);
      const idx = pages.findIndex((p) => p === page || p.ref === (page as { ref?: unknown } | undefined)?.ref);
      if (idx >= 0) return idx;
    }
  } catch {
    // ignore
  }
  try {
    const pageObj = widget.P?.();
    if (pageObj) {
      const idx = pages.findIndex((page) => page.node === pageObj || page.ref === pageObj);
      if (idx >= 0) return idx;
    }
  } catch {
    // ignore
  }
  try {
    for (let i = 0; i < pages.length; i++) {
      const annots = pages[i].node.lookupMaybe(PDFName.of("Annots"), PDFArray);
      if (!annots) continue;
      for (let j = 0; j < annots.size(); j++) {
        if (annots.lookup(j) === widget.dict) return i;
      }
    }
  } catch {
    // ignore
  }
  return 0;
}

function widgetExportValue(widget: { getOnValue?: () => unknown }): string | undefined {
  try {
    return pdfNameString(widget.getOnValue?.());
  } catch {
    return undefined;
  }
}

async function extractWithPdfLib(data: Uint8Array): Promise<FieldOverlay[]> {
  const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const overlays: FieldOverlay[] = [];
  const pages = pdfDoc.getPages();
  let fields: ReturnType<ReturnType<PDFDocument["getForm"]>["getFields"]> = [];
  try {
    fields = pdfDoc.getForm().getFields();
  } catch {
    fields = [];
  }

  for (const field of fields) {
    const name = field.getName();
    let widgets: Array<{ getRectangle: () => { x: number; y: number; width: number; height: number }; dict?: unknown; ref?: unknown; P?: () => unknown; getOnValue?: () => unknown }>;
    try {
      widgets = field.acroField.getWidgets() as typeof widgets;
    } catch {
      continue;
    }
    if (!widgets.length) continue;

    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      let rect: { x: number; y: number; width: number; height: number };
      try {
        rect = widget.getRectangle();
      } catch {
        continue;
      }
      if (rect.width < 2 || rect.height < 2) continue;

      const pageIndex = pageIndexForWidget(pdfDoc, widget);
      const page = pages[pageIndex] ?? pages[0];
      if (!page) continue;
      const pageNum = pageIndex + 1;
      const nativeBox = {
        x: rect.x,
        y: page.getHeight() - rect.y - rect.height,
        width: rect.width,
        height: rect.height,
      };

      let kind: FieldKind = "text";
      const overlay: FieldOverlay = {
        id: `acro-${pageNum}-${i}-${name.replace(/[^a-zA-Z0-9_]+/g, "_")}`,
        page: pageNum,
        name,
        imported: true,
        x: nativeBox.x,
        y: nativeBox.y,
        width: nativeBox.width,
        height: nativeBox.height,
      };

      if (field instanceof PDFSignature || SIG_NAME.test(name)) {
        kind = "signature";
      } else if (field instanceof PDFCheckBox) {
        const ff = asFlag(inheritedLookup(widget.dict as { lookup?: (name: unknown) => unknown }, "Ff"));
        kind = buttonKindFromFlags(ff) ?? "checkbox";
        overlay.value = widgetExportValue(widget) ?? "Yes";
        if (kind === "radio") overlay.groupName = name;
        const appearance = widgetAppearanceState(widget);
        overlay.checked = appearance
          ? appearance === overlay.value
          : widgets.length === 1
            ? (() => {
                try {
                  return field.isChecked();
                } catch {
                  return false;
                }
              })()
            : false;
      } else if (field instanceof PDFRadioGroup) {
        kind = "radio";
        overlay.groupName = name;
        overlay.value = widgetExportValue(widget);
        try {
          overlay.checked = Boolean(overlay.value && field.getSelected() === overlay.value);
        } catch {
          overlay.checked = false;
        }
      } else if (field instanceof PDFDropdown) {
        kind = "select";
        try {
          overlay.options = field.getOptions();
          const selected = field.getSelected() as string | string[] | undefined;
          overlay.value = Array.isArray(selected) ? selected[0] ?? "" : selected ?? "";
        } catch {
          overlay.value = "";
        }
      } else if (field instanceof PDFOptionList) {
        kind = "list";
        try {
          overlay.options = field.getOptions();
          overlay.values = field.getSelected();
          overlay.value = overlay.values?.[0] ?? "";
        } catch {
          overlay.value = "";
        }
      } else if (field instanceof PDFTextField) {
        let text = "";
        try {
          text = field.getText() ?? "";
        } catch {
          text = "";
        }
        kind = DATE_NAME.test(name) || looksLikeDate(text) ? "date" : "text";
        overlay.value = kind === "date" ? toDateInputValue(text) || text : text;
        overlay.fontSize = 12;
        try {
          overlay.multiline = field.isMultiline();
        } catch {
          overlay.multiline = false;
        }
      } else {
        continue;
      }

      const box = expandImportedBox(kind, nativeBox);
      overlay.kind = kind;
      overlay.x = box.x;
      overlay.y = box.y;
      overlay.width = box.width;
      overlay.height = box.height;
      overlays.push(overlay);
    }
  }

  addOrphanWidgets(pdfDoc, overlays);
  return overlays;
}

function pdfLiteral(value: unknown): string | undefined {
  if (!value) return undefined;
  const raw = String(value);
  const paren = /^\((.*)\)$/.exec(raw);
  if (paren) return paren[1];
  return asString(value) ?? raw.replace(/^\//, "") ?? undefined;
}

function annotRect(annot: { lookup: (name: unknown) => unknown }, pageHeight: number) {
  const rect = annot.lookup(PDFName.of("Rect")) as { size?: () => number; get?: (i: number) => { asNumber?: () => number } };
  if (!rect?.get || !rect.size || rect.size() < 4) return null;
  const nums = [0, 1, 2, 3].map((i) => rect.get?.(i)?.asNumber?.() ?? 0);
  const x = Math.min(nums[0], nums[2]);
  const yPdf = Math.min(nums[1], nums[3]);
  const width = Math.abs(nums[2] - nums[0]);
  const height = Math.abs(nums[3] - nums[1]);
  if (width < 2 || height < 2) return null;
  return { x, y: pageHeight - yPdf - height, width, height };
}

function coversPoint(overlays: FieldOverlay[], page: number, x: number, y: number) {
  return overlays.some((o) => o.page === page && x >= o.x && x <= o.x + o.width && y >= o.y && y <= o.y + o.height);
}

function addOrphanWidgets(pdfDoc: PDFDocument, overlays: FieldOverlay[]) {
  const pages = pdfDoc.getPages();
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    let annots: PDFArray | undefined;
    try {
      annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
    } catch {
      continue;
    }
    if (!annots) continue;
    const pageNum = pageIndex + 1;
    for (let i = 0; i < annots.size(); i++) {
      let annot: { lookup: (name: unknown) => unknown };
      try {
        annot = annots.lookup(i) as unknown as { lookup: (name: unknown) => unknown };
      } catch {
        continue;
      }
      if (String(annot.lookup(PDFName.of("Subtype")) ?? "") !== "/Widget") continue;
      const box = annotRect(annot, page.getHeight());
      if (!box) continue;
      if (coversPoint(overlays, pageNum, box.x + box.width / 2, box.y + box.height / 2)) continue;

      const type = fieldTypeName(inheritedLookup(annot, "FT"));
      const name =
        pdfLiteral(inheritedLookup(annot, "T")) ||
        pdfLiteral(annot.lookup(PDFName.of("T"))) ||
        `field_p${pageNum}_${i + 1}`;
      const ff = asFlag(inheritedLookup(annot, "Ff"));
      const kind =
        type === "Sig"
          ? "signature"
          : type === "Btn"
            ? buttonKindFromFlags(ff)
            : type === "Tx"
              ? DATE_NAME.test(name)
                ? "date"
                : "text"
              : type === "Ch"
                ? "select"
                : SIG_NAME.test(name)
                  ? "signature"
                  : DATE_NAME.test(name)
                    ? "date"
                    : type
                      ? "text"
                      : null;
      if (!kind) continue;

      const sized = expandImportedBox(kind, box);
      overlays.push({
        id: `acro-${pageNum}-${i}-${name.replace(/[^a-zA-Z0-9_]+/g, "_")}`,
        page: pageNum,
        name,
        kind,
        groupName: kind === "radio" ? name : undefined,
        imported: true,
        x: sized.x,
        y: sized.y,
        width: sized.width,
        height: sized.height,
      });
    }
  }
}

async function bitmapToDataUrl(bitmap: unknown): Promise<string | undefined> {
  if (!bitmap || typeof document === "undefined") return undefined;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  try {
    if (typeof ImageBitmap !== "undefined" && bitmap instanceof ImageBitmap) {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
    } else if (bitmap instanceof HTMLCanvasElement) {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
    } else {
      return undefined;
    }
    return canvas.toDataURL("image/png");
  } catch {
    return undefined;
  }
}

async function renderPageWithAnnotations(page: PdfPage) {
  if (typeof document === "undefined") return null;
  const viewport = page.getViewport({ scale: APPEARANCE_SCALE, rotation: page.rotate ?? 0 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  try {
    await page.render({
      canvasContext: ctx,
      viewport,
      annotationMode: 1,
    }).promise;
  } catch {
    return null;
  }
  return canvas;
}

function cropAppearance(
  source: HTMLCanvasElement,
  box: { x: number; y: number; width: number; height: number }
): string | undefined {
  const sx = Math.max(0, Math.floor(box.x * APPEARANCE_SCALE));
  const sy = Math.max(0, Math.floor(box.y * APPEARANCE_SCALE));
  const sw = Math.max(1, Math.floor(box.width * APPEARANCE_SCALE));
  const sh = Math.max(1, Math.floor(box.height * APPEARANCE_SCALE));
  if (sx >= source.width || sy >= source.height) return undefined;
  const crop = document.createElement("canvas");
  crop.width = sw;
  crop.height = sh;
  const ctx = crop.getContext("2d");
  if (!ctx) return undefined;
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
  return crop.toDataURL("image/png");
}

async function fillSignatureAppearances(file: File, overlays: FieldOverlay[]) {
  const signatures = overlays.filter((f) => f.kind === "signature" && !f.value);
  if (signatures.length === 0) return overlays;
  const data = new Uint8Array(await file.arrayBuffer());
  let pdf: Awaited<ReturnType<typeof getPdfDocument>>["pdf"] | null = null;
  let task: Awaited<ReturnType<typeof getPdfDocument>>["task"] | null = null;
  try {
    const opened = await getPdfDocument(data);
    pdf = opened.pdf;
    task = opened.task;
    const byPage = new Map<number, FieldOverlay[]>();
    for (const overlay of signatures) {
      const list = byPage.get(overlay.page) ?? [];
      list.push(overlay);
      byPage.set(overlay.page, list);
    }
    for (const [pageNum, pageOverlays] of byPage) {
      const page = (await pdf.getPage(pageNum)) as unknown as PdfPage;
      const rendered = await renderPageWithAnnotations(page);
      if (!rendered) continue;
      for (const overlay of pageOverlays) {
        overlay.value = cropAppearance(rendered, overlay);
      }
    }
  } catch {
    // keep unsigned signature overlays
  } finally {
    try {
      await pdf?.destroy();
    } catch {
      // ignore
    }
    try {
      await task?.destroy();
    } catch {
      // ignore
    }
  }
  return overlays;
}

async function extractWithPdfJs(file: File): Promise<FieldOverlay[]> {
  const data = new Uint8Array(await file.arrayBuffer());
  let pdf: Awaited<ReturnType<typeof getPdfDocument>>["pdf"] | null = null;
  let task: Awaited<ReturnType<typeof getPdfDocument>>["task"] | null = null;
  try {
    const opened = await getPdfDocument(data);
    pdf = opened.pdf;
    task = opened.task;
    const overlays: FieldOverlay[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = (await pdf.getPage(pageNum)) as unknown as PdfPage;
      const viewport = page.getViewport({ scale: 1, rotation: page.rotate ?? 0 });
      const annots = (await page.getAnnotations({ intent: "any" })) as WidgetAnnot[];

      for (let i = 0; i < annots.length; i++) {
        const annot = annots[i];
        if (!isWidgetAnnot(annot)) continue;
        if (!Array.isArray(annot.rect) || annot.rect.length < 4) continue;

        const fieldName = (annot.fieldName ?? "").trim() || `field_p${pageNum}_${i + 1}`;
        const fieldValue = asString(annot.fieldValue);
        const kind = inferKind(annot, fieldName, fieldValue);
        if (!kind) continue;

        const nativeBox = viewportRect(viewport, annot.rect);
        const box = expandImportedBox(kind, nativeBox);
        if (box.width < 4 || box.height < 4) continue;

        const buttonValue = widgetOnValue(annot);
        const overlay: FieldOverlay = {
          id: `acro-${pageNum}-${i}-${fieldName.replace(/[^a-zA-Z0-9_]+/g, "_")}`,
          page: pageNum,
          name: fieldName,
          kind,
          imported: true,
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        };

        if (kind === "radio") {
          overlay.groupName = fieldName;
          overlay.value = buttonValue ?? fieldValue;
          overlay.checked = widgetIsChecked(annot, fieldValue, buttonValue);
        } else if (kind === "checkbox") {
          overlay.value = buttonValue ?? fieldValue;
          overlay.checked = widgetIsChecked(annot, fieldValue, buttonValue);
        } else if (kind === "select" || kind === "list") {
          overlay.options = choiceOptions(annot);
          overlay.value = fieldValue;
          if (kind === "list" && Array.isArray(annot.fieldValue)) {
            overlay.values = annot.fieldValue.filter((v): v is string => typeof v === "string");
          }
        } else if (kind === "date") {
          overlay.value = toDateInputValue(fieldValue) || fieldValue || "";
          overlay.fontSize = 12;
        } else if (kind === "text") {
          overlay.value = fieldValue ?? "";
          overlay.multiline = Boolean(annot.multiLine);
          overlay.fontSize = 12;
        } else if (kind === "signature") {
          overlay.value = await bitmapToDataUrl(annot.bitmap);
        }

        overlays.push(overlay);
      }
    }

    return overlays;
  } catch {
    return [];
  } finally {
    try {
      await pdf?.destroy();
    } catch {
      // ignore
    }
    try {
      await task?.destroy();
    } catch {
      // ignore
    }
  }
}

function mergeOverlays(primary: FieldOverlay[], extra: FieldOverlay[]) {
  const merged = primary.slice();
  for (const item of extra) {
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    const existing = merged.find((o) => o.page === item.page && cx >= o.x && cx <= o.x + o.width && cy >= o.y && cy <= o.y + o.height);
    if (!existing) {
      merged.push(item);
      continue;
    }
    if (!existing.value && item.value) existing.value = item.value;
    if (existing.checked == null && item.checked != null) existing.checked = item.checked;
    if (!existing.kind && item.kind) existing.kind = item.kind;
    if (!existing.groupName && item.groupName) existing.groupName = item.groupName;
  }
  return merged;
}

export async function extractAcroFormFields(file: File): Promise<FieldOverlay[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let overlays: FieldOverlay[] = [];
  try {
    overlays = await extractWithPdfLib(bytes);
  } catch {
    overlays = [];
  }
  try {
    const fromJs = await extractWithPdfJs(file);
    overlays = mergeOverlays(overlays, fromJs);
  } catch {
    // pdf-lib result is enough when pdf.js cannot run
  }
  return fillSignatureAppearances(file, overlays);
}
