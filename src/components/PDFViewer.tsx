import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjs from "pdfjs-dist";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  page: number;
}

interface SignatureOverlay {
  id: string;
  imageData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

interface PDFViewerProps {
  file: File;
  zoom: number;
  currentPage: number;
  onPageCountChange: (count: number) => void;
  activeTool: "select" | "text" | "sign";
  onSignRequest: () => void;
  textOverlays: TextOverlay[];
  onTextOverlaysChange: (overlays: TextOverlay[]) => void;
  signatureOverlays: SignatureOverlay[];
  onSignatureOverlaysChange: (overlays: SignatureOverlay[]) => void;
  pendingSignature: string | null;
  onPendingSignaturePlaced: () => void;
}

export function PDFViewer({
  file,
  zoom,
  currentPage,
  onPageCountChange,
  activeTool,
  onSignRequest,
  textOverlays,
  onTextOverlaysChange,
  signatureOverlays,
  onSignatureOverlaysChange,
  pendingSignature,
  onPendingSignaturePlaced,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      onPageCountChange(pdf.numPages);
      setLoading(false);
    };
    loadPDF();
  }, [file, onPageCountChange]);

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const scale = zoom / 100;
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageSize({ width: viewport.width, height: viewport.height });

      const renderContext = {
        canvasContext: context,
        viewport,
      };
      
      // @ts-ignore - pdfjs types mismatch
      await page.render(renderContext).promise;
    };

    renderPage();
  }, [pdfDoc, currentPage, zoom]);

  // Handle canvas click for placing elements
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "text") {
      const newText: TextOverlay = {
        id: `text-${Date.now()}`,
        text: "Click to edit",
        x,
        y,
        fontSize: 16 * (zoom / 100),
        page: currentPage,
      };
      onTextOverlaysChange([...textOverlays, newText]);
      setEditingTextId(newText.id);
    } else if (activeTool === "sign") {
      if (pendingSignature) {
        const newSig: SignatureOverlay = {
          id: `sig-${Date.now()}`,
          imageData: pendingSignature,
          x: x - 75,
          y: y - 25,
          width: 150,
          height: 50,
          page: currentPage,
        };
        onSignatureOverlaysChange([...signatureOverlays, newSig]);
        onPendingSignaturePlaced();
      } else {
        onSignRequest();
      }
    }
  }, [activeTool, currentPage, zoom, textOverlays, onTextOverlaysChange, signatureOverlays, onSignatureOverlaysChange, pendingSignature, onPendingSignaturePlaced, onSignRequest]);

  const handleTextChange = (id: string, newText: string) => {
    onTextOverlaysChange(
      textOverlays.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
  };

  const handleTextBlur = () => {
    setEditingTextId(null);
  };

  const currentPageTextOverlays = textOverlays.filter((t) => t.page === currentPage);
  const currentPageSignatures = signatureOverlays.filter((s) => s.page === currentPage);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-muted p-8 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        ref={containerRef}
        className="relative shadow-lg"
        style={{ width: pageSize.width, height: pageSize.height }}
        onClick={handleCanvasClick}
      >
        <canvas ref={canvasRef} className="pdf-canvas bg-card" />
        
        {/* Text overlays */}
        {currentPageTextOverlays.map((text) => (
          <div
            key={text.id}
            className="absolute"
            style={{ left: text.x, top: text.y }}
          >
            {editingTextId === text.id ? (
              <input
                type="text"
                value={text.text}
                onChange={(e) => handleTextChange(text.id, e.target.value)}
                onBlur={handleTextBlur}
                autoFocus
                className="bg-transparent border-b-2 border-primary outline-none text-foreground"
                style={{ fontSize: text.fontSize }}
              />
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(text.id);
                }}
                className="cursor-text hover:bg-primary/10 px-1 rounded"
                style={{ fontSize: text.fontSize }}
              >
                {text.text}
              </span>
            )}
          </div>
        ))}

        {/* Signature overlays */}
        {currentPageSignatures.map((sig) => (
          <img
            key={sig.id}
            src={sig.imageData}
            alt="Signature"
            className="absolute pointer-events-none"
            style={{
              left: sig.x,
              top: sig.y,
              width: sig.width,
              height: sig.height,
            }}
          />
        ))}

        {/* Cursor hint for sign tool */}
        {activeTool === "sign" && pendingSignature && (
          <div className="absolute inset-0 cursor-crosshair">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Click to place your signature
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
