'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { FileText, Search, Loader, AlertTriangle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Plus, X, MousePointer, Square } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { motion, AnimatePresence } from 'framer-motion'

// Configuración del worker de PDF.js para que use la copia local
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
  console.log('PDF.js worker configured:', pdfjs.GlobalWorkerOptions.workerSrc);
  console.log('PDF.js version:', pdfjs.version);
}

// La interfaz debe coincidir con la de la página principal y el explorador
interface FileNode {
  name: string;
  url: string;
}

interface PdfViewerProps {
  selectedFile: FileNode | null;
}

export function PdfViewer({ selectedFile }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNumPages(null);
    setPageNumber(1);
    setScale(1.0);
    setError(null);
  }, [selectedFile]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }
  
  function onDocumentLoadError(error: Error) {
    setError(`Error al cargar el PDF: ${error.message}. ¿La URL es correcta y accesible?`);
    console.error('PDF Load Error:', error);
    console.error('PDF URL:', selectedFile?.url);
  }

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-enterprise-900 text-slate-500">
        <FileText size={48} className="mb-4" />
        <h2 className="text-lg font-semibold">Selecciona un documento</h2>
        <p className="text-sm">Elige un archivo del panel de la izquierda para empezar.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/20 text-white relative">
      <header className="flex items-center justify-between p-2 bg-enterprise-900 border-b border-enterprise-800/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm truncate">{selectedFile.name}</h3>
        </div>
        {numPages && (
          <div className="flex items-center space-x-2">
            <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} disabled={scale <= 0.5} className="p-1.5 hover:bg-enterprise-800/60 rounded disabled:opacity-50"><ZoomOut size={16} /></button>
            <span className="text-sm w-12 text-center">{(scale * 100).toFixed(0)}%</span>
            <button onClick={() => setScale(s => Math.min(s + 0.1, 2.5))} disabled={scale >= 2.5} className="p-1.5 hover:bg-enterprise-800/60 rounded disabled:opacity-50"><ZoomIn size={16} /></button>
            <div className="w-px h-5 bg-enterprise-700 mx-2"></div>
            <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="p-1.5 hover:bg-enterprise-800/60 rounded disabled:opacity-50"><ChevronLeft size={16} /></button>
            <span className="text-sm w-20 text-center">Página {pageNumber} de {numPages}</span>
            <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="p-1.5 hover:bg-enterprise-800/60 rounded disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        )}
      </header>
      <div className="flex-1 overflow-auto p-4 flex justify-center relative">
        <Document
          file={selectedFile.url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onLoadStart={() => console.log('PDF loading started:', selectedFile.url)}
          loading={<div className="flex items-center"><Loader className="animate-spin mr-2" /> Cargando documento...</div>}
          error={
            <div className="flex items-center text-red-400 p-2 bg-red-900/30 rounded-lg">
                <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                <div>
                    <p className="font-bold">Error de Carga</p>
                    <p className="text-xs">{error}</p>
                    <p className="text-xs mt-1">URL: {selectedFile?.url}</p>
                </div>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  )
} 