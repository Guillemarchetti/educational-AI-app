'use client'

import React, { useState, useRef } from 'react'
import { Square, MousePointer, Scissors, MessageSquare } from 'lucide-react'

interface ImageSelectorProps {
  selectedFile: any
  onAddImageContext: (imageData: string, description: string) => void
}

export function ImageSelector({ selectedFile, onAddImageContext }: ImageSelectorProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'pointer' | 'select'>('pointer')

  const handleToggleSelection = () => {
    setIsSelecting(!isSelecting)
    setSelectionMode(isSelecting ? 'pointer' : 'select')
  }

  const handleAddToContext = () => {
    // Esta función se llamará cuando se haga una selección en el PDF
    const mockImageData = "data:image/png;base64,mock-image-data"
    const description = "Área seleccionada del PDF"
    onAddImageContext(mockImageData, description)
    setIsSelecting(false)
    setSelectionMode('pointer')
  }

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-enterprise-900 text-slate-500">
        <Square size={48} className="mb-4" />
        <h2 className="text-lg font-semibold">Selector de Área PDF</h2>
        <p className="text-sm">Abre un documento PDF para seleccionar áreas específicas</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/20 text-white">
      <header className="flex items-center justify-between p-4 bg-enterprise-900 border-b border-enterprise-800/50">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Herramientas de Selección</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSelection}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSelecting 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isSelecting ? <Scissors size={16} /> : <MousePointer size={16} />}
            {isSelecting ? 'Seleccionando' : 'Activar Selección'}
          </button>
        </div>
      </header>

      <div className="flex-1 p-4">
        <div className="bg-gray-800/30 rounded-lg p-6 mb-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Square size={20} />
            Cómo usar el selector:
          </h4>
          <ol className="text-sm text-gray-300 space-y-2">
            <li>1. Haz clic en "Activar Selección" arriba</li>
            <li>2. En el PDF, arrastra para seleccionar el área que quieres analizar</li>
            <li>3. La selección se agregará automáticamente al contexto del chat</li>
            <li>4. Pregunta a la IA sobre esa área específica</li>
          </ol>
        </div>

        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-300">
            <MessageSquare size={16} />
            Ejemplos de preguntas:
          </h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• "¿Qué representa este diagrama?"</li>
            <li>• "Explica esta fórmula paso a paso"</li>
            <li>• "¿Cómo funciona este proceso?"</li>
            <li>• "Dame ejemplos de este concepto"</li>
          </ul>
        </div>

        {isSelecting && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
            <p className="text-green-300 text-sm font-medium">
              ✨ Modo de selección activo. Ve al PDF y arrastra para seleccionar un área.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 