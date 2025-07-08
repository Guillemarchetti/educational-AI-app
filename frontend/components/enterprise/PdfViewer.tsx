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
  isSelectionMode?: boolean;
  onImageSelection?: (imageData: string, coordinates: { x: number, y: number, width: number, height: number }) => void;
}

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function PdfViewer({ selectedFile, isSelectionMode = false, onImageSelection }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [currentSelection, setCurrentSelection] = useState<SelectionRect | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  
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

  // Funciones para el manejo de selección
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelectionMode || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    setIsSelecting(true);
    setSelectionRect({
      startX,
      startY,
      endX: startX,
      endY: startY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionRect || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    setSelectionRect({
      ...selectionRect,
      endX,
      endY
    });
  };

  const handleMouseUp = () => {
    if (!isSelecting || !selectionRect) return;
    
    setIsSelecting(false);
    setCurrentSelection(selectionRect);
    
    // Capturar la imagen del área seleccionada
    captureSelectedArea(selectionRect);
  };

  const captureSelectedArea = async (rect: SelectionRect) => {
    if (!pageRef.current || !onImageSelection) return;
    
    try {
      // Crear un canvas temporal para capturar el área
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Obtener el elemento canvas del PDF
      const pdfCanvas = pageRef.current.querySelector('canvas');
      if (!pdfCanvas) return;
      
      // Calcular las coordenadas reales en el PDF
      const pdfRect = pdfCanvas.getBoundingClientRect();
      const scaleX = pdfCanvas.width / pdfRect.width;
      const scaleY = pdfCanvas.height / pdfRect.height;
      
      const x = Math.min(rect.startX, rect.endX) * scaleX;
      const y = Math.min(rect.startY, rect.endY) * scaleY;
      const width = Math.abs(rect.endX - rect.startX) * scaleX;
      const height = Math.abs(rect.endY - rect.startY) * scaleY;
      
      // Configurar el canvas temporal
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar el área seleccionada
      ctx.drawImage(pdfCanvas, x, y, width, height, 0, 0, width, height);
      
      // Convertir a base64
      const imageData = canvas.toDataURL('image/png');
      
      // Llamar al callback con la imagen
      onImageSelection(imageData, { x, y, width, height });
      
      // Limpiar la selección
      setSelectionRect(null);
      setCurrentSelection(null);
      
    } catch (error) {
      console.error('Error capturing selected area:', error);
    }
  };

  // Dibujar el rectángulo de selección
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar rectángulo de selección actual
    if (selectionRect) {
      const x = Math.min(selectionRect.startX, selectionRect.endX);
      const y = Math.min(selectionRect.startY, selectionRect.endY);
      const width = Math.abs(selectionRect.endX - selectionRect.startX);
      const height = Math.abs(selectionRect.endY - selectionRect.startY);
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(x, y, width, height);
    }
  }, [selectionRect]);

  // Actualizar el tamaño del canvas cuando cambie el PDF
  useEffect(() => {
    if (!canvasRef.current || !pageRef.current) return;
    
    const updateCanvasSize = () => {
      const pdfCanvas = pageRef.current?.querySelector('canvas');
      if (pdfCanvas && canvasRef.current) {
        const rect = pdfCanvas.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        canvasRef.current.style.width = `${rect.width}px`;
        canvasRef.current.style.height = `${rect.height}px`;
      }
    };
    
    // Actualizar inmediatamente y cuando cambie el tamaño
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [pageNumber, scale]);

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
          {isSelectionMode && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
              Modo Selección
            </span>
          )}
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
      <div className="flex-1 overflow-auto p-4 flex justify-center relative" ref={containerRef}>
        <div className="relative" ref={pageRef}>
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
          
          {/* Canvas overlay para selección */}
          {isSelectionMode && (
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-auto cursor-crosshair"
              style={{ zIndex: 10 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsSelecting(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
} 