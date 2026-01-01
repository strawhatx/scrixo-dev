import { PDFDocument } from "pdf-lib";

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
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

  // Add text overlays
  for (const text of textOverlays) {
    const page = pages[text.page - 1];
    if (page) {
      page.drawText(text.text, {
        x: text.x,
        y: page.getHeight() - text.y - text.fontSize,
        size: text.fontSize,
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

