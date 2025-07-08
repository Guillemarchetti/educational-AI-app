'use client'

import React from 'react'
import { X, FileText, Image as ImageIcon, Eye } from 'lucide-react'

interface ContextDisplayProps {
  contextText: string[]
  onRemoveContext: (index: number) => void
}

export function ContextDisplay({ contextText, onRemoveContext }: ContextDisplayProps) {
  const parseContextItem = (text: string, index: number) => {
    // Detectar si es contexto de imagen
    const isImageContext = text.includes('🖼️ ANÁLISIS DE IMAGEN:') || text.includes('🖼️ IMAGEN SELECCIONADA:')
    
    if (isImageContext) {
      // Extraer la imagen base64 si existe
      const imageDataMatch = text.match(/data:image\/[^;]+;base64,[^"]+/)
      const imageData = imageDataMatch ? imageDataMatch[0] : null
      
      // Extraer el análisis de texto
      const analysisMatch = text.match(/🖼️ ANÁLISIS DE IMAGEN:\s*\n\n(.+?)(?:\n\n📊|$)/)
      const analysis = analysisMatch ? analysisMatch[1] : text
      
      return (
        <div key={index} className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 relative group">
          <button
            onClick={() => onRemoveContext(index)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <ImageIcon size={20} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Imagen Seleccionada</h4>
              {imageData && (
                <div className="mb-3">
                  <img 
                    src={imageData} 
                    alt="Imagen seleccionada" 
                    className="max-w-full h-auto max-h-32 rounded border border-blue-700/50"
                  />
                </div>
              )}
              <div className="text-xs text-blue-200 space-y-1">
                {analysis.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('**') ? 'font-semibold' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // Contexto de texto normal
    return (
      <div key={index} className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 relative group">
        <button
          onClick={() => onRemoveContext(index)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
        >
          <X size={16} />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <FileText size={20} className="text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Contexto de Texto</h4>
            <div className="text-xs text-gray-400 space-y-1 max-h-20 overflow-y-auto">
              {text.split('\n').slice(0, 5).map((line, i) => (
                <p key={i} className="truncate">
                  {line}
                </p>
              ))}
              {text.split('\n').length > 5 && (
                <p className="text-gray-500 italic">... y {text.split('\n').length - 5} líneas más</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (contextText.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Eye size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay contexto agregado</p>
        <p className="text-xs mt-1">Selecciona texto o imágenes para agregar contexto</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">Contexto Agregado</h3>
        <span className="text-xs text-gray-400">{contextText.length} elemento(s)</span>
      </div>
      {contextText.map((text, index) => parseContextItem(text, index))}
    </div>
  )
} 