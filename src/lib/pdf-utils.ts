import { PDFArray, PDFBool, PDFCheckBox, PDFDocument, PDFDropdown, PDFName, PDFOptionList, PDFRadioGroup, PDFSignature, PDFTextField, StandardFonts, degrees, rgb } from "pdf-lib";
import type { FieldKind } from "@/types/fields";
import { toPdfDateValue } from "@/lib/form-date";
import type { TextAlign, TextFontFamily } from "@/lib/text-style";

export type { TextAlign, TextFontFamily } from "@/lib/text-style";
export { TEXT_FONT_STACK } from "@/lib/text-style";
export interface SignatureOverlay {
  id: string;
  imageData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  opacity?: number; // 0..1
  rotation?: number; // degrees
}

export interface DrawStrokeOverlay {
  id: string;
  page: number;
  color?: string;
  width: number;
  opacity?: number; // 0..1
  points: Array<{ x: number; y: number }>;
}

export interface ImageOverlay {
  id: string;
  page: number;
  imageData: string; // data URL
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number; // 0..1
  rotation?: number; // degrees
}

export interface FieldOverlay {
  id: string;
  page: number;
  name: string;
  kind?: FieldKind;
  groupName?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  value?: string;
  values?: string[];
  multiline?: boolean;
  checked?: boolean;
  options?: string[];
  /** True when this overlay was created from an existing AcroForm widget. */
  imported?: boolean;
}

export interface TextOverlay {
  id: string;
  page: number;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontFamily?: TextFontFamily;
  bold?: boolean;
  italic?: boolean;
  align?: TextAlign;
  rotation?: number; // degrees
}

function standardFontForText(family?: TextFontFamily, bold?: boolean, italic?: boolean) {
  const f = family ?? "helvetica";
  const b = Boolean(bold);
  const i = Boolean(italic);
  if (f === "times") {
    if (b && i) return StandardFonts.TimesRomanBoldItalic;
    if (b) return StandardFonts.TimesRomanBold;
    if (i) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (f === "courier") {
    if (b && i) return StandardFonts.CourierBoldOblique;
    if (b) return StandardFonts.CourierBold;
    if (i) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  if (b && i) return StandardFonts.HelveticaBoldOblique;
  if (b) return StandardFonts.HelveticaBold;
  if (i) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

function overlayTextValue(overlay: FieldOverlay): string | undefined {
  if (typeof overlay.value !== "string") return undefined;
  if (overlay.kind === "date") return toPdfDateValue(overlay.value) || overlay.value;
  return overlay.value;
}

async function fillImportedAcroForm(pdfDoc: PDFDocument, overlays: FieldOverlay[]) {
  const imported = overlays.filter((f) => f.imported);
  if (imported.length === 0) return;

  let form: ReturnType<PDFDocument["getForm"]>;
  try {
    form = pdfDoc.getForm();
  } catch {
    return;
  }

  try {
    if (form.hasXFA()) form.deleteXFA();
  } catch {
    // ignore
  }

  const byName = new Map<string, FieldOverlay[]>();
  for (const overlay of imported) {
    const name = (overlay.name || "").trim();
    if (!name) continue;
    const list = byName.get(name) ?? [];
    list.push(overlay);
    byName.set(name, list);
  }

  for (const [name, widgets] of byName) {
    const field = form.getFieldMaybe(name);
    if (!field) continue;
    const primary = widgets[0];
    try {
      if (field instanceof PDFSignature) {
        form.removeField(field);
        continue;
      }
      if (field instanceof PDFTextField) {
        const text = overlayTextValue(primary);
        if (typeof text === "string") {
          try {
            field.setText(text);
          } catch {
            if (text !== primary.value && typeof primary.value === "string") {
              try {
                field.setText(primary.value);
              } catch {
                // Flatten below still strips widgets when possible.
              }
            }
          }
        }
        continue;
      }
      if (field instanceof PDFCheckBox) {
        applyImportedCheckbox(pdfDoc, form, field, widgets);
        continue;
      }
      if (field instanceof PDFRadioGroup) {
        const selected = widgets.find((w) => w.checked);
        const candidates = [selected?.value, selected?.name].filter(
          (v): v is string => typeof v === "string" && v.trim().length > 0
        );
        let applied = false;
        try {
          const options = field.getOptions();
          const match = options.find((opt) => candidates.includes(opt));
          if (match) {
            field.select(match);
            applied = true;
          }
        } catch {
          // ignore
        }
        if (!applied) {
          for (const candidate of candidates) {
            try {
              field.select(candidate);
              applied = true;
              break;
            } catch {
              // option name may not match
            }
          }
        }
        continue;
      }
      if (field instanceof PDFDropdown) {
        if (primary.value) field.select(primary.value);
        continue;
      }
      if (field instanceof PDFOptionList) {
        const values =
          Array.isArray(primary.values) && primary.values.length > 0
            ? primary.values
            : primary.value
              ? [primary.value]
              : [];
        if (values.length > 0) field.select(values);
      }
    } catch {
      // Keep the widget even if this value cannot be applied.
    }
  }
}

function pdfOnName(value: unknown): string | undefined {
  if (typeof value === "string") return value.replace(/^\//, "");
  if (value && typeof value === "object") {
    try {
      const named =
        (value as { decodeText?: () => string; asString?: () => string }).decodeText?.() ??
        (value as { asString?: () => string }).asString?.();
      if (named) return named.replace(/^\//, "");
    } catch {
      // ignore
    }
  }
  return undefined;
}

function lookupFlag(dict: { lookup?: (name: unknown) => unknown } | undefined): number {
  try {
    const raw = dict?.lookup?.(PDFName.of("Ff"));
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object" && "asNumber" in raw) return (raw as { asNumber: () => number }).asNumber();
  } catch {
    // ignore
  }
  return 0;
}

function widgetIsRadio(widget: { dict?: { lookup?: (name: unknown) => unknown } }): boolean {
  const own = lookupFlag(widget.dict);
  if (own & (1 << 15)) return true;
  try {
    const parent = widget.dict?.lookup?.(PDFName.of("Parent")) as { lookup?: (name: unknown) => unknown } | undefined;
    return Boolean(lookupFlag(parent) & (1 << 15));
  } catch {
    return false;
  }
}

function applyImportedCheckbox(
  pdfDoc: PDFDocument,
  form: ReturnType<PDFDocument["getForm"]>,
  field: PDFCheckBox,
  overlays: FieldOverlay[]
) {
  let pdfWidgets: ReturnType<PDFCheckBox["acroField"]["getWidgets"]> = [];
  try {
    pdfWidgets = field.acroField.getWidgets();
  } catch {
    pdfWidgets = [];
  }

  const onValues = pdfWidgets.map((widget) => pdfOnName(widget.getOnValue?.()));
  const exclusive =
    overlays.some((item) => item.kind === "radio") || pdfWidgets.some((widget) => widgetIsRadio(widget as { dict?: { lookup?: (name: unknown) => unknown } }));
  const independent = !exclusive && pdfWidgets.length > 1 && new Set(onValues.filter(Boolean)).size > 1;

  if (exclusive) {
    const selected = overlays.find((item) => item.checked);
    for (let i = 0; i < pdfWidgets.length; i++) {
      const on = onValues[i] || overlays[i]?.value;
      try {
        const dict = (pdfWidgets[i] as { dict?: { set?: (n: unknown, v: unknown) => void } }).dict;
        dict?.set?.(PDFName.of("AS"), PDFName.of(selected && on && selected.value === on ? on : "Off"));
      } catch {
        // ignore
      }
    }
    try {
      field.acroField.dict.set(PDFName.of("V"), PDFName.of(selected?.value || "Off"));
    } catch {
      try {
        if (selected) field.check();
        else field.uncheck();
      } catch {
        // ignore
      }
    }
    return;
  }

  if (!independent) {
    try {
      if (overlays[0]?.checked) field.check();
      else field.uncheck();
    } catch {
      // ignore
    }
    return;
  }

  const pages = pdfDoc.getPages();
  const planned = pdfWidgets.map((widget, i) => {
    const on = onValues[i] || overlays[i]?.value || `checkbox_${i + 1}`;
    const overlay = overlays.find((item) => item.value === on) ?? overlays[i];
    const page = pages[Math.max(0, (overlay?.page ?? 1) - 1)];
    return {
      rect: widget.getRectangle(),
      page,
      name: on,
      checked: Boolean(overlay?.checked),
    };
  });

  try {
    form.removeField(field);
  } catch {
    // still try to create replacements
  }

  for (const item of planned) {
    if (!item.page) continue;
    let name = item.name.replace(/[^a-zA-Z0-9_]+/g, "_") || "checkbox";
    let n = 1;
    while (form.getFieldMaybe(name)) {
      n += 1;
      name = `${item.name}_${n}`;
    }
    try {
      const cb = form.createCheckBox(name);
      cb.addToPage(item.page, item.rect);
      if (item.checked) cb.check();
      else cb.uncheck();
    } catch {
      // ignore a single widget failure
    }
  }
}

function pagesNeedRebuild(
  pageCount: number,
  pageOrder?: number[],
  pageRotations?: Record<number, number>
) {
  if (Array.isArray(pageOrder) && pageOrder.length === pageCount) {
    if (pageOrder.some((n, i) => n !== i + 1)) return true;
  }
  if (pageRotations) {
    for (const value of Object.values(pageRotations)) {
      if ((((value ?? 0) % 360) + 360) % 360 !== 0) return true;
    }
  }
  return false;
}

function markNeedAppearances(pdfDoc: PDFDocument) {
  try {
    const acro = pdfDoc.catalog.lookup(PDFName.of("AcroForm")) as unknown as { set?: (n: unknown, v: unknown) => void };
    acro.set?.(PDFName.of("NeedAppearances"), PDFBool.True);
  } catch {
    // ignore
  }
}

async function updateFormAppearances(pdfDoc: PDFDocument) {
  try {
    const form = pdfDoc.getForm();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    form.updateFieldAppearances(font);
  } catch {
    // /V is still written; NeedAppearances lets other viewers paint it.
  }
  markNeedAppearances(pdfDoc);
}

function stripWidgetAnnotations(pdfDoc: PDFDocument) {
  for (const page of pdfDoc.getPages()) {
    try {
      const annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
      if (!annots) continue;
      const keep: ReturnType<PDFArray["get"]>[] = [];
      for (let i = 0; i < annots.size(); i++) {
        let isWidget = false;
        try {
          const annot = annots.lookup(i) as { lookup?: (n: unknown) => { toString?: () => string } | undefined };
          const subtype = annot.lookup?.(PDFName.of("Subtype"));
          isWidget = String(subtype ?? "") === "/Widget";
        } catch {
          isWidget = false;
        }
        if (!isWidget) keep.push(annots.get(i));
      }
      const next = PDFArray.withContext(pdfDoc.context);
      for (const ref of keep) next.push(ref);
      page.node.set(PDFName.of("Annots"), next);
    } catch {
      // ignore
    }
  }
  try {
    const form = pdfDoc.getForm();
    for (const field of [...form.getFields()]) {
      try {
        form.removeField(field);
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

export async function processPDF(
  file: File,
  signatureOverlays: SignatureOverlay[],
  opts?: {
    pageOrder?: number[];
    pageRotations?: Record<number, number>;
    drawStrokes?: DrawStrokeOverlay[];
    imageOverlays?: ImageOverlay[];
    fieldOverlays?: FieldOverlay[];
    textOverlays?: TextOverlay[];
    watermark?: {
      /**
       * If provided, a light, diagonal watermark will be drawn on every page.
       * Intended for free-tier exports.
       */
      text: string;
    };
  }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const pageCount = sourceDoc.getPageCount();
  const naturalOrder = Array.from({ length: pageCount }, (_, i) => i + 1);
  const order =
    Array.isArray(opts?.pageOrder) && opts?.pageOrder.length === pageCount ? opts!.pageOrder! : naturalOrder;
  const rebuild = pagesNeedRebuild(pageCount, opts?.pageOrder, opts?.pageRotations);

  let pdfDoc = sourceDoc;
  const pageIndexByOriginal = new Map<number, number>();
  if (rebuild) {
    pdfDoc = await PDFDocument.create();
    for (let i = 0; i < order.length; i++) {
      const originalPageNum = order[i];
      pageIndexByOriginal.set(originalPageNum, i);
      const [copied] = await pdfDoc.copyPages(sourceDoc, [originalPageNum - 1]);
      const rot = opts?.pageRotations?.[originalPageNum] ?? 0;
      if (rot) copied.setRotation(degrees(rot));
      pdfDoc.addPage(copied);
    }
    stripWidgetAnnotations(pdfDoc);
  } else {
    for (let i = 1; i <= pageCount; i++) pageIndexByOriginal.set(i, i - 1);
    await fillImportedAcroForm(pdfDoc, opts?.fieldOverlays ?? []);
  }

  const pages = pdfDoc.getPages();

  const cssHexToRgb = (hex: string | undefined) => {
    const cleaned = (hex ?? "#000000").trim();
    const match = /^#?([0-9a-f]{6})$/i.exec(cleaned);
    const r = match ? parseInt(match[1].slice(0, 2), 16) / 255 : 0;
    const g = match ? parseInt(match[1].slice(2, 4), 16) / 255 : 0;
    const b = match ? parseInt(match[1].slice(4, 6), 16) / 255 : 0;
    return rgb(r, g, b);
  };

  const inferDataUrlType = (dataUrl: string) => {
    const m = /^data:([^;]+);base64,/i.exec(dataUrl);
    return m?.[1]?.toLowerCase() ?? "";
  };

  // Marker used to detect previously-signed PDFs created by scrixo.
  // We write it only when a signature was actually placed.
  if (signatureOverlays.length > 0) {
    try {
      const marker = "scrixo:signed";
      const anyDoc = pdfDoc as any;
      const existingKeywords: string[] | undefined =
        typeof anyDoc.getKeywords === "function" ? anyDoc.getKeywords() : undefined;

      if (typeof anyDoc.setKeywords === "function") {
        const next = Array.isArray(existingKeywords) ? existingKeywords.slice() : [];
        if (!next.includes(marker)) next.push(marker);
        anyDoc.setKeywords(next);
      } else if (typeof anyDoc.setSubject === "function") {
        anyDoc.setSubject(marker);
      }
    } catch {
      // If metadata can't be set for some reason, we still produce a valid PDF.
    }
  }

  // Add signature overlays
  for (const sig of signatureOverlays) {
    const pageIdx = pageIndexByOriginal.get(sig.page) ?? sig.page - 1;
    const page = pages[pageIdx];
    if (page) {
      const pngImage = await pdfDoc.embedPng(sig.imageData);
      page.drawImage(pngImage, {
        x: sig.x,
        y: page.getHeight() - sig.y - sig.height,
        width: sig.width,
        height: sig.height,
        opacity: typeof sig.opacity === "number" ? Math.max(0, Math.min(1, sig.opacity)) : 1,
        rotate: degrees(((sig.rotation ?? 0) % 360 + 360) % 360),
      });
    }
  }

  // Add image overlays
  for (const img of opts?.imageOverlays ?? []) {
    const pageIdx = pageIndexByOriginal.get(img.page) ?? img.page - 1;
    const page = pages[pageIdx];
    if (!page) continue;
    const type = inferDataUrlType(img.imageData);
    const embedded =
      type.includes("jpeg") || type.includes("jpg")
        ? await pdfDoc.embedJpg(img.imageData)
        : await pdfDoc.embedPng(img.imageData);
    page.drawImage(embedded, {
      x: img.x,
      y: page.getHeight() - img.y - img.height,
      width: img.width,
      height: img.height,
      opacity: typeof img.opacity === "number" ? Math.max(0, Math.min(1, img.opacity)) : 1,
      rotate: degrees(((img.rotation ?? 0) % 360 + 360) % 360),
    });
  }

  // Add draw strokes
  for (const stroke of opts?.drawStrokes ?? []) {
    const pageIdx = pageIndexByOriginal.get(stroke.page) ?? stroke.page - 1;
    const page = pages[pageIdx];
    if (!page) continue;
    const pts = stroke.points ?? [];
    if (pts.length < 2) continue;
    const color = cssHexToRgb(stroke.color ?? "#ef4444");
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      page.drawLine({
        start: { x: a.x, y: page.getHeight() - a.y },
        end: { x: b.x, y: page.getHeight() - b.y },
        thickness: Math.max(0.5, stroke.width || 2),
        color,
        // pdf-lib supports opacity on drawing ops; cast to keep types permissive across versions.
        opacity: typeof stroke.opacity === "number" ? Math.max(0, Math.min(1, stroke.opacity)) : 1,
      } as any);
    }
  }

  // Add form fields (basic text fields)
  if ((opts?.fieldOverlays?.length ?? 0) > 0) {
    const form = pdfDoc.getForm();
    const usedNames = new Set<string>();
    try {
      for (const existing of form.getFields()) usedNames.add(existing.getName());
    } catch {
      // ignore
    }
    const radioGroups = new Map<string, { group: any; optionIds: Set<string> }>();
    const radioSelections: Array<{ group: any; optionId: string }> = [];
    for (const f of opts!.fieldOverlays!) {
      const pageIdx = pageIndexByOriginal.get(f.page) ?? f.page - 1;
      const page = pages[pageIdx];
      if (!page) continue;
      const kind = f.kind ?? "text";

      if (f.imported && !rebuild) {
        if (kind === "signature" && typeof f.value === "string" && f.value.startsWith("data:")) {
          const type = inferDataUrlType(f.value);
          const embedded =
            type.includes("jpeg") || type.includes("jpg")
              ? await pdfDoc.embedJpg(f.value)
              : await pdfDoc.embedPng(f.value);
          page.drawImage(embedded, {
            x: f.x,
            y: page.getHeight() - f.y - f.height,
            width: f.width,
            height: f.height,
          });
        }
        continue;
      }

      const baseName =
        kind === "radio"
          ? (f.groupName || f.name || "radio_group").trim() || "radio_group"
          : (f.name || "field").trim() || "field";
      let name = baseName;
      let n = 1;
      while (usedNames.has(name) && kind !== "radio") {
        n++;
        name = `${baseName}_${n}`;
      }
      if (kind !== "radio") usedNames.add(name);
      const rect = {
        x: f.x,
        y: page.getHeight() - f.y - f.height,
        width: f.width,
        height: f.height,
      };

      try {
        if (kind === "checkbox") {
          const cb = form.createCheckBox(name);
          cb.addToPage(page, rect);
          try {
            if (f.checked) cb.check();
            else cb.uncheck();
          } catch {
            // ignore
          }
        } else if (kind === "radio") {
          // Radio buttons are grouped by `groupName` (or `name` fallback).
          const groupName = name;
          let entry = radioGroups.get(groupName);
          if (!entry) {
            // Ensure group name is unique across all non-radio fields, too.
            let gname = groupName;
            let gi = 1;
            while (usedNames.has(gname)) {
              gi++;
              gname = `${groupName}_${gi}`;
            }
            usedNames.add(gname);
            const rg = form.createRadioGroup(gname);
            entry = { group: rg, optionIds: new Set<string>() };
            radioGroups.set(groupName, entry);
          }

          const optionId = `opt_${String(f.id || "").replace(/[^a-z0-9_]/gi, "_") || Date.now()}`;
          if (!entry.optionIds.has(optionId)) {
            entry.optionIds.add(optionId);
            entry.group.addOptionToPage(optionId, page, rect);
          }
          if (f.checked) radioSelections.push({ group: entry.group, optionId });
        } else if (kind === "select") {
          const dd = form.createDropdown(name);
          const options =
            Array.isArray(f.options) && f.options.length > 0 ? f.options : ["Option 1", "Option 2"];
          dd.addOptions(options);
          dd.addToPage(page, rect);
          if (typeof f.value === "string" && f.value) {
            try {
              (dd as any).select?.(f.value);
              (dd as any).setSelected?.(f.value);
            } catch {
              // ignore
            }
          }
        } else if (kind === "list") {
          const ol = form.createOptionList(name);
          const options =
            Array.isArray(f.options) && f.options.length > 0 ? f.options : ["Option 1", "Option 2"];
          ol.addOptions(options);
          ol.addToPage(page, rect);
          const selectedValues =
            Array.isArray(f.values) && f.values.length > 0 ? f.values : typeof f.value === "string" && f.value ? [f.value] : [];
          if (selectedValues.length > 0) {
            try {
              (ol as any).select?.(selectedValues);
              (ol as any).setSelected?.(selectedValues);
            } catch {
              // ignore
            }
          }
        } else if (kind === "signature") {
          if (typeof f.value === "string" && f.value.startsWith("data:")) {
            const type = inferDataUrlType(f.value);
            const embedded =
              type.includes("jpeg") || type.includes("jpg")
                ? await pdfDoc.embedJpg(f.value)
                : await pdfDoc.embedPng(f.value);
            page.drawImage(embedded, {
              x: f.x,
              y: page.getHeight() - f.y - f.height,
              width: f.width,
              height: f.height,
            });
          } else {
            const sig = (form as any).createSignature?.(name);
            if (sig?.addToPage) sig.addToPage(page, rect);
            else {
              const tf = form.createTextField(name);
              tf.addToPage(page, rect);
            }
          }
        } else {
          // "text" + "date" fall back to text field.
          const tf = form.createTextField(name);
          tf.addToPage(page, rect);
          if (typeof f.fontSize === "number") {
            try {
              tf.setFontSize(f.fontSize);
            } catch {
              // ignore font sizing issues
            }
          }
          if (f.multiline) {
            try {
              (tf as any).enableMultiline?.();
            } catch {
              // ignore
            }
          }
          const text = overlayTextValue(f);
          if (typeof text === "string") {
            try {
              tf.setText(text);
            } catch {
              // ignore text setting issues
            }
          }
        }
      } catch {
        // If a specific field type fails (older pdf-lib behavior), degrade to a text field.
        const tf = form.createTextField(name);
        tf.addToPage(page, rect);
        if (f.multiline) {
          try {
            (tf as any).enableMultiline?.();
          } catch {
            // ignore
          }
        }
        const text = overlayTextValue(f);
        if (typeof text === "string") {
          try {
            tf.setText(text);
          } catch {
            // ignore
          }
        }
      }
    }
    for (const sel of radioSelections) {
      try {
        sel.group.select(sel.optionId);
      } catch {
        // option may already be selected
      }
    }
  }

  // Add text overlays
  const textFontCache = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedFont>>>();
  for (const textOverlay of opts?.textOverlays ?? []) {
    const pageIdx = pageIndexByOriginal.get(textOverlay.page) ?? textOverlay.page - 1;
    const page = pages[pageIdx];
    if (!page) continue;
    const textColor = cssHexToRgb(textOverlay.color ?? "#000000");
    const size = textOverlay.fontSize ?? 12;
    const standardFont = standardFontForText(textOverlay.fontFamily, textOverlay.bold, textOverlay.italic);
    let font = textFontCache.get(standardFont);
    if (!font) {
      font = await pdfDoc.embedFont(standardFont);
      textFontCache.set(standardFont, font);
    }
    const textWidth = font.widthOfTextAtSize(textOverlay.text, size);
    let x = textOverlay.x;
    if (textOverlay.align === "center") x -= textWidth / 2;
    if (textOverlay.align === "right") x -= textWidth;
    page.drawText(textOverlay.text, {
      x,
      // Screen overlays use CSS top-left; pdf-lib drawText uses baseline.
      y: page.getHeight() - textOverlay.y - size,
      size,
      font,
      color: textColor,
      rotate: degrees(((textOverlay.rotation ?? 0) % 360 + 360) % 360),
    } as any);
  }

  // Optional watermark (drawn last so it sits on top).
  if (opts?.watermark?.text) {
    const text = opts.watermark.text;
    for (const page of pages) {
      const w = page.getWidth();
      const h = page.getHeight();
      // Place it roughly across the center; pdf-lib doesn't expose text measurement without embedding fonts,
      // so we keep this intentionally simple and resilient across page sizes.
      page.drawText(text, {
        x: w * 0.08,
        y: h * 0.5,
        size: Math.max(18, Math.min(48, Math.floor(Math.min(w, h) / 14))),
        rotate: degrees(35),
        color: rgb(0.65, 0.65, 0.65),
        opacity: 0.18,
      } as any);
    }
  }

  await updateFormAppearances(pdfDoc);
  return await pdfDoc.save();
}

