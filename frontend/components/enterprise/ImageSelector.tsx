'use client'

import React, { useState } from 'react'
import { UploadCloud } from 'lucide-react'

export function ImageSelector() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setFileName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    // La lógica para subir al backend se implementará aquí
    if (!image) return
    console.log('Subiendo imagen:', fileName)
    alert('La funcionalidad de análisis de imagen aún no está implementada.')
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-enterprise-900 text-slate-500 p-8">
      <div className="w-full max-w-lg text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Selector de Imágenes</h2>
        <p className="mb-6">Carga una imagen para que la IA la analice. Puedes subir diagramas, capturas de pantalla de ejercicios, etc.</p>
        
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-gray-800/20 transition-all">
          <input
            type="file"
            id="imageUpload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <label htmlFor="imageUpload" className="cursor-pointer w-full">
            {image ? (
              <div className="relative">
                <img src={image} alt="Vista previa" className="max-h-64 mx-auto rounded-lg" />
                <p className="text-sm mt-2 text-white truncate">{fileName}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud size={48} className="mb-4 text-gray-500" />
                <p className="font-semibold text-white">Haz clic para subir o arrastra una imagen</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 10MB</p>
              </div>
            )}
          </label>
        </div>

        {image && (
          <button
            onClick={handleUpload}
            className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analizar con IA
          </button>
        )}
      </div>
    </div>
  )
} 