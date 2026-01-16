import { PDFDocument, degrees, rgb } from "pdf-lib";
import type { FieldKind } from "@/types/fields";
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
}

export interface TextOverlay {
  id: string;
  page: number;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  rotation?: number; // degrees
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
  const sourceDoc = await PDFDocument.load(arrayBuffer);

  const pageCount = sourceDoc.getPageCount();
  const naturalOrder = Array.from({ length: pageCount }, (_, i) => i + 1);
  const order =
    Array.isArray(opts?.pageOrder) && opts?.pageOrder.length === pageCount ? opts!.pageOrder! : naturalOrder;

  // Rebuild the doc in the requested order so downstream page indexing matches.
  const pdfDoc = await PDFDocument.create();
  const pageIndexByOriginal = new Map<number, number>();
  for (let i = 0; i < order.length; i++) {
    const originalPageNum = order[i];
    const originalIdx = originalPageNum - 1;
    pageIndexByOriginal.set(originalPageNum, i);
    const [copied] = await pdfDoc.copyPages(sourceDoc, [originalIdx]);
    // Apply per-page rotation, if any (in degrees).
    const rot = opts?.pageRotations?.[originalPageNum] ?? 0;
    if (rot) copied.setRotation(degrees(rot));
    pdfDoc.addPage(copied);
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
    const radioGroups = new Map<string, { group: any; optionIds: Set<string> }>();
    for (const f of opts!.fieldOverlays!) {
      const pageIdx = pageIndexByOriginal.get(f.page) ?? f.page - 1;
      const page = pages[pageIdx];
      if (!page) continue;
      const kind = f.kind ?? "text";

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

          try {
            if (f.checked) entry.group.select?.(optionId);
          } catch {
            // ignore
          }
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
          // pdf-lib supports signature form fields in v1.17+, but keep this safe.
          const sig = (form as any).createSignature?.(name);
          if (sig?.addToPage) sig.addToPage(page, rect);
          else {
            // Fallback: create a text field placeholder if signature fields aren't available.
            const tf = form.createTextField(name);
            tf.addToPage(page, rect);
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
          if (typeof f.value === "string") {
            try {
              tf.setText(f.value);
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
        if (typeof f.value === "string") {
          try {
            tf.setText(f.value);
          } catch {
            // ignore
          }
        }
      }
    }
  }

  // Add text overlays
  for (const textOverlay of opts?.textOverlays ?? []) {
    const pageIdx = pageIndexByOriginal.get(textOverlay.page) ?? textOverlay.page - 1;
    const page = pages[pageIdx];
    if (!page) continue;
    const textColor = cssHexToRgb(textOverlay.color ?? "#000000");
    page.drawText(textOverlay.text, {
      x: textOverlay.x,
      y: page.getHeight() - textOverlay.y,
      size: textOverlay.fontSize ?? 12,
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

  return await pdfDoc.save();
}

