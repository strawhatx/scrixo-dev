import * as pdfjs from "pdfjs-dist/build/pdf.min.mjs";

import type { FieldOverlay } from "@/lib/pdf-utils";
import type { FieldKind } from "@/types/fields";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

type WidgetAnnot = {
  subtype?: string;
  fieldName?: string;
  fieldType?: string;
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
  options?: Array<{ exportValue?: string; displayValue?: string } | string>;
};

const DATE_NAME = /date|dob|birth/i;
const SIG_NAME = /sig(nature)?|initials/i;

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function inferKind(annot: WidgetAnnot, fieldName: string): FieldKind | null {
  const type = (annot.fieldType ?? "").toString();
  if (type === "Sig" || SIG_NAME.test(fieldName)) return "signature";
  if (type === "Tx") return DATE_NAME.test(fieldName) ? "date" : "text";
  if (type === "Ch") return annot.combo ? "select" : "list";
  if (type === "Btn") {
    if (annot.pushButton) return null;
    if (annot.radioButton) return "radio";
    if (annot.checkbox || annot.checkBox) return "checkbox";
    return "checkbox";
  }
  if (annot.radioButton) return "radio";
  if (annot.checkbox) return "checkbox";
  if (annot.combo) return "select";
  return "text";
}

function expandImportedBox(kind: FieldKind, box: { x: number; y: number; width: number; height: number }) {
  if (kind === "checkbox" || kind === "radio") return box;
  if (kind === "signature") {
    return {
      ...box,
      width: Math.max(box.width, 180),
      height: Math.max(box.height, 52),
    };
  }
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

export async function extractAcroFormFields(file: File): Promise<FieldOverlay[]> {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data, isEvalSupported: false });
  try {
    const pdf = await loadingTask.promise;
    const overlays: FieldOverlay[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1, rotation: page.rotate ?? 0 });
      const annots = (await page.getAnnotations({ intent: "display" })) as WidgetAnnot[];

      for (let i = 0; i < annots.length; i++) {
        const annot = annots[i];
        if ((annot.subtype ?? "") !== "Widget") continue;
        if (annot.hidden) continue;
        if (!Array.isArray(annot.rect) || annot.rect.length < 4) continue;

        const fieldName = (annot.fieldName ?? "").trim() || `field_p${pageNum}_${i + 1}`;
        const kind = inferKind(annot, fieldName);
        if (!kind) continue;

        const box = expandImportedBox(kind, viewportRect(viewport, annot.rect));
        if (box.width < 4 || box.height < 4) continue;

        const fieldValue = asString(annot.fieldValue);
        const buttonValue = asString(annot.buttonValue);
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
          overlay.checked = Boolean(buttonValue && fieldValue && buttonValue === fieldValue);
        } else if (kind === "checkbox") {
          const off = !fieldValue || /^(off|no|0|false)$/i.test(fieldValue);
          overlay.checked = buttonValue ? fieldValue === buttonValue : !off;
        } else if (kind === "select" || kind === "list") {
          overlay.options = choiceOptions(annot);
          overlay.value = fieldValue;
          if (kind === "list" && Array.isArray(annot.fieldValue)) {
            overlay.values = annot.fieldValue.filter((v): v is string => typeof v === "string");
          }
        } else if (kind === "text" || kind === "date") {
          overlay.value = fieldValue ?? "";
          overlay.multiline = Boolean(annot.multiLine);
          overlay.fontSize = 12;
        }

        overlays.push(overlay);
      }
    }

    try {
      await pdf.destroy();
    } catch {
      // ignore
    }
    return overlays;
  } catch {
    return [];
  } finally {
    try {
      await loadingTask.destroy();
    } catch {
      // ignore
    }
  }
}
