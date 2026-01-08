import { PDFDocument, degrees, rgb } from "pdf-lib";
export interface SignatureOverlay {
  id: string;
  imageData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
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
}

export interface FieldOverlay {
  id: string;
  page: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
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
    for (const f of opts!.fieldOverlays!) {
      const pageIdx = pageIndexByOriginal.get(f.page) ?? f.page - 1;
      const page = pages[pageIdx];
      if (!page) continue;
      const baseName = (f.name || "field").trim() || "field";
      let name = baseName;
      let n = 1;
      while (usedNames.has(name)) {
        n++;
        name = `${baseName}_${n}`;
      }
      usedNames.add(name);
      const tf = form.createTextField(name);
      tf.addToPage(page, {
        x: f.x,
        y: page.getHeight() - f.y - f.height,
        width: f.width,
        height: f.height,
      });
      if (typeof f.fontSize === "number") {
        try {
          tf.setFontSize(f.fontSize);
        } catch {
          // ignore font sizing issues
        }
      }
    }
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

