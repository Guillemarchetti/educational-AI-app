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

interface SelectionRect {
  startX: number
  startY: number
  endX: number
  endY: number
  pageNumber: number
}

interface PdfViewerProps {
  selectedFile: FileNode | null;
  onTextSelect: (text: string) => void;
  selectedText: string;
  onContextAdd: (text: string) => void;
  onClearSelection: () => void;
}

export function PdfViewer({ selectedFile, onTextSelect, selectedText, onContextAdd, onClearSelection }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [currentSelection, setCurrentSelection] = useState<SelectionRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTextContent, setSelectedTextContent] = useState<string>('');

  const viewerRef = React.useRef<HTMLDivElement>(null);

  // Resetear el estado cuando cambia el archivo
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

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState<'text' | 'area'>('text')

  // Selection handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Solo activar selección de área si está en modo área y se presiona Ctrl/Cmd
    if (selectionMode !== 'area' && !(e.ctrlKey || e.metaKey)) return
    
    // Prevenir la selección si se hace clic en texto seleccionable
    const target = e.target as HTMLElement
    if (target.closest('.react-pdf__Page__textContent')) return
    
    if (!containerRef.current) return
    
    e.preventDefault()
    const rect = containerRef.current.getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top
    
    setIsSelecting(true)
    setCurrentSelection({
      startX,
      startY,
      endX: startX,
      endY: startY,
      pageNumber
    })
    setSelectionRect(null)
  }, [pageNumber, selectionMode])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !currentSelection || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top
    
    setCurrentSelection(prev => prev ? {
      ...prev,
      endX,
      endY
    } : null)
  }, [isSelecting, currentSelection])

  const handleMouseUp = useCallback(async () => {
    if (!isSelecting || !currentSelection) return
    
    setIsSelecting(false)
    setSelectionRect(currentSelection)
    
    // Extract text from the selected area
    await extractTextFromSelection(currentSelection)
  }, [isSelecting, currentSelection])

  const extractTextFromSelection = async (selection: SelectionRect) => {
    console.log('Extracting text from selection:', selection)
    try {
      // Get the PDF document and page
      const pdfDoc = await pdfjs.getDocument(selectedFile!.url).promise
      const page = await pdfDoc.getPage(selection.pageNumber)
      
      // Get text content
      const textContent = await page.getTextContent()
      console.log('Text content items:', textContent.items.length)
      
      // For now, let's extract a sample of text to test the functionality
      // Later we can improve the coordinate-based extraction
      const allText = textContent.items.map((item: any) => item.str).join(' ')
      
      // Take a portion of text based on selection size as a simple test
      const selectionSize = Math.abs(selection.endX - selection.startX) * Math.abs(selection.endY - selection.startY)
      const textLength = Math.min(Math.max(Math.floor(selectionSize / 100), 50), 500)
      
      const extractedText = allText.substring(0, textLength).trim()
      console.log('Extracted text:', extractedText)
      
      if (extractedText) {
        setSelectedTextContent(extractedText)
      } else {
        setSelectedTextContent('No se encontró texto en el área seleccionada')
      }
      
    } catch (error) {
      console.error('Error extracting text:', error)
      setSelectedTextContent('Error al extraer texto del área seleccionada')
    }
  }

  const clearSelection = () => {
    console.log('Clearing selection...')
    setSelectionRect(null)
    setSelectedTextContent('')
    setCurrentSelection(null)
    setIsSelecting(false)
    onClearSelection?.()
  }

  // Selection Overlay Component
  const SelectionOverlay = () => {
    const activeSelection = currentSelection || selectionRect
    if (!activeSelection) return null

    const left = Math.min(activeSelection.startX, activeSelection.endX)
    const top = Math.min(activeSelection.startY, activeSelection.endY)
    const width = Math.abs(activeSelection.endX - activeSelection.startX)
    const height = Math.abs(activeSelection.endY - activeSelection.startY)

    // Don't show overlay for very small selections
    if (width < 10 || height < 10) return null

    console.log('SelectionOverlay rendering with:', { 
      selectionRect, 
      selectedTextContent: selectedTextContent ? selectedTextContent.substring(0, 50) + '...' : 'empty',
      currentSelection,
      activeSelection
    })

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute z-50 pointer-events-none"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          border: '2px dashed #3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '4px'
        }}
      >
        {/* Show buttons if we have selected text, regardless of selectionRect state */}
        {selectedTextContent && (
          <motion.div 
            className="absolute -top-16 right-0 flex gap-2 pointer-events-auto z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105"
              onClick={(e) => {
                e.stopPropagation()
                console.log('Button clicked! Adding to context:', selectedTextContent)
                onContextAdd?.(selectedTextContent)
                clearSelection()
              }}
              title="Añadir texto seleccionado al contexto"
            >
              <Plus className="w-4 h-4" />
              Añadir Contexto
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
              onClick={(e) => {
                e.stopPropagation()
                console.log('Cancel button clicked')
                clearSelection()
              }}
              title="Cancelar selección"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        
        {/* Selection info tooltip */}
        {selectedTextContent && (
          <motion.div
            className="absolute -bottom-8 left-0 bg-black/80 text-white px-2 py-1 rounded text-xs max-w-xs truncate pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {selectedTextContent.length > 50 
              ? `${selectedTextContent.substring(0, 50)}...` 
              : selectedTextContent
            }
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Add debugging useEffect
  useEffect(() => {
    console.log('Selection state changed:', {
      selectionRect,
      selectedTextContent: selectedTextContent ? selectedTextContent.substring(0, 50) + '...' : 'empty',
      currentSelection,
      isSelecting
    })
  }, [selectionRect, selectedTextContent, currentSelection, isSelecting])

  // Add debugging for onContextAdd
  useEffect(() => {
    console.log('onContextAdd prop:', typeof onContextAdd, !!onContextAdd)
  }, [onContextAdd])

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
    <div 
      className={`h-full flex flex-col bg-gray-800/20 text-white relative ${
        selectionMode === 'area' ? 'select-none' : ''
      }`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ 
        cursor: isSelecting 
          ? 'crosshair' 
          : selectionMode === 'area' 
            ? 'crosshair' 
            : 'default' 
      }}
    >

      <header className="flex items-center justify-between p-2 bg-enterprise-900 border-b border-enterprise-800/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm truncate">{selectedFile.name}</h3>
          
          {/* Selector de modo */}
          <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setSelectionMode('text')}
              className={`p-1.5 rounded transition-all ${
                selectionMode === 'text' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
              title="Modo selección de texto (normal)"
            >
              <MousePointer size={14} />
            </button>
            <button
              onClick={() => setSelectionMode('area')}
              className={`p-1.5 rounded transition-all ${
                selectionMode === 'area' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
              title="Modo selección de área (Ctrl+click o click directo)"
            >
              <Square size={14} />
            </button>
          </div>
          
          {isSelecting && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 bg-blue-600/20 text-blue-300 px-2 py-1 rounded-md text-xs"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Seleccionando área...
            </motion.div>
          )}
          
          {selectionMode === 'area' && !isSelecting && (
            <div className="text-xs text-gray-400 bg-gray-700/30 px-2 py-1 rounded">
              Modo área activo - Click y arrastra para seleccionar
            </div>
          )}
          
          {selectionMode === 'text' && (
            <div className="text-xs text-gray-400 bg-gray-700/30 px-2 py-1 rounded">
              Modo texto - Ctrl+click para selección de área
            </div>
          )}
        </div>
        {numPages && (
          <div className="flex items-center space-x-2">
            <button onClick={() => setScale(s => s - 0.1)} disabled={scale <= 0.5} className="p-1.5 hover:bg-enterprise-800/60 rounded disabled:opacity-50"><ZoomOut size={16} /></button>
            <span className="text-sm w-12 text-center">{(scale * 100).toFixed(0)}%</span>
            <button onClick={() => setScale(s => s + 0.1)} disabled={scale >= 2.5} className="p-1.5 hover:bg-enterprise-800/60 rounded disabled:opacity-50"><ZoomIn size={16} /></button>
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
        <AnimatePresence>
          <SelectionOverlay />
        </AnimatePresence>
      </div>
    </div>
  )
} 