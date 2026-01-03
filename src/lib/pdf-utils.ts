import { PDFDocument, rgb } from "pdf-lib";

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  /**
   * Hex color for rendering + PDF output (e.g. "#111827").
   * Kept as a string so the UI can bind directly to <input type="color" />.
   */
  color?: string;
  /**
   * When present, this overlay is intended to replace existing PDF text.
   * We draw a cover rectangle (usually white) before drawing the new text.
   */
  coverWidth?: number;
  coverHeight?: number;
  sourceTextBlockId?: string;
  page: number;
}

export interface SignatureOverlay {
  id: string;
  imageData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export async function processPDF(
  file: File,
  textOverlays: TextOverlay[],
  signatureOverlays: SignatureOverlay[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

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

  // Add text overlays
  for (const text of textOverlays) {
    const page = pages[text.page - 1];
    if (page) {
      const hex = (text.color ?? "#000000").trim();
      const match = /^#?([0-9a-f]{6})$/i.exec(hex);
      const r = match ? parseInt(match[1].slice(0, 2), 16) / 255 : 0;
      const g = match ? parseInt(match[1].slice(2, 4), 16) / 255 : 0;
      const b = match ? parseInt(match[1].slice(4, 6), 16) / 255 : 0;

      if (text.coverWidth && text.coverHeight) {
        page.drawRectangle({
          x: text.x,
          y: page.getHeight() - text.y - text.coverHeight,
          width: text.coverWidth,
          height: text.coverHeight,
          color: rgb(1, 1, 1),
          opacity: 1,
          borderWidth: 0,
        });
      }

      page.drawText(text.text, {
        x: text.x,
        y: page.getHeight() - text.y - text.fontSize,
        size: text.fontSize,
        color: rgb(r, g, b),
      });
    }
  }

  // Add signature overlays
  for (const sig of signatureOverlays) {
    const page = pages[sig.page - 1];
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

  return await pdfDoc.save();
}

