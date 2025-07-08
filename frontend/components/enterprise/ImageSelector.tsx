'use client'

import React, { useState, useRef } from 'react'
import { Square, MousePointer, Scissors, MessageSquare, Image as ImageIcon, CheckCircle } from 'lucide-react'

interface ImageSelectorProps {
  selectedFile: any
  onAddImageContext: (imageData: string, description: string) => void
  isSelectionMode: boolean
  onToggleSelectionMode: () => void
}

export function ImageSelector({ selectedFile, onAddImageContext, isSelectionMode, onToggleSelectionMode }: ImageSelectorProps) {
  const [capturedImages, setCapturedImages] = useState<Array<{id: string, imageData: string, timestamp: Date}>>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleClearImages = () => {
    setCapturedImages([])
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
            onClick={onToggleSelectionMode}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSelectionMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSelectionMode ? <Scissors size={16} /> : <MousePointer size={16} />}
            {isSelectionMode ? 'Desactivar' : 'Activar Selección'}
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-gray-800/30 rounded-lg p-6 mb-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Square size={20} />
            Cómo usar el selector:
          </h4>
          <ol className="text-sm text-gray-300 space-y-2">
            <li>1. Haz clic en "Activar Selección" arriba</li>
            <li>2. En el PDF, arrastra el mouse para seleccionar el área que quieres analizar</li>
            <li>3. Suelta el mouse para capturar la imagen</li>
            <li>4. La selección se procesará automáticamente y se agregará al contexto del chat</li>
            <li>5. Pregunta a la IA sobre esa área específica</li>
          </ol>
        </div>

        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-300">
            <MessageSquare size={16} />
            Ejemplos de preguntas:
          </h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• "¿Qué representa este diagrama?"</li>
            <li>• "Explica esta fórmula paso a paso"</li>
            <li>• "¿Cómo funciona este proceso?"</li>
            <li>• "Dame ejemplos de este concepto"</li>
            <li>• "¿Qué significa esta imagen?"</li>
          </ul>
        </div>

        {isSelectionMode && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
            <p className="text-green-300 text-sm font-medium flex items-center gap-2">
              <Square size={16} />
              ✨ Modo de selección activo. Ve al PDF y arrastra para seleccionar un área.
            </p>
            <p className="text-green-200 text-xs mt-1">
              Verás un cursor en forma de cruz y podrás dibujar un rectángulo sobre el contenido.
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
            <p className="text-yellow-300 text-sm font-medium">
              ⚡ Procesando imagen seleccionada...
            </p>
          </div>
        )}

        {capturedImages.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <ImageIcon size={16} />
                Imágenes Capturadas ({capturedImages.length})
              </h4>
              <button
                onClick={handleClearImages}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Limpiar Todo
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-auto">
              {capturedImages.map((img) => (
                <div key={img.id} className="flex items-center gap-3 p-2 bg-gray-700/30 rounded">
                  <img 
                    src={img.imageData} 
                    alt="Área seleccionada" 
                    className="w-12 h-12 object-cover rounded border border-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">
                      {img.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Agregado al contexto
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 