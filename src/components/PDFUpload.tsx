import React, { useCallback, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
}

export function PDFUpload({ onFileSelect }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`dropzone flex flex-col items-center justify-center p-16 cursor-pointer ${
          isDragging ? "dropzone-active" : ""
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                <FileText className="w-10 h-10 text-primary-foreground" />
              </div>
              <p className="text-lg font-semibold text-primary">Drop your PDF here!</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">
                Drag & drop your PDF here
              </p>
              <p className="text-muted-foreground">
                or <span className="text-primary font-medium">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Maximum file size: 50MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </label>
    </motion.div>
  );
}
