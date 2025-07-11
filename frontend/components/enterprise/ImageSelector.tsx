'use client'

import React, { useState, useEffect } from 'react'
import { Square, CheckCircle } from 'lucide-react'

interface ImageSelectorProps {
  selectedFile: any
  onAddImageContext: (imageData: string, description: string) => void
  isSelectionMode: boolean
  onToggleSelectionMode: () => void
  showSuccessNotification?: boolean
}

export function ImageSelector({ selectedFile, onAddImageContext, isSelectionMode, onToggleSelectionMode, showSuccessNotification: externalShowSuccess }: ImageSelectorProps) {
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)

  const showSuccessMessage = () => {
    setShowSuccessNotification(true)
  }

  // Mostrar notificación cuando se recibe la prop externa
  useEffect(() => {
    if (externalShowSuccess) {
      showSuccessMessage()
    }
  }, [externalShowSuccess])

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-enterprise-900 text-slate-500">
        <Square size={48} className="mb-4" />
        <h2 className="text-lg font-semibold">Selector de Imágenes</h2>
        <p className="text-sm">Abre un documento PDF para seleccionar imágenes</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/20 text-white">
      <div className="flex-1 p-4 relative">
        {/* Notificación de carga */}
        {showSuccessNotification && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-blue-400/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-spin">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Cargando contexto...</h4>
                  <p className="text-blue-100 text-xs">Por favor espere</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 