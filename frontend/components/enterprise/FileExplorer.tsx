'use client'

import React, { useState, useEffect, useRef } from 'react'
import { File, Folder, ChevronDown, ChevronRight, Loader, AlertTriangle, BookOpen, Layers, GraduationCap, Upload, Plus, Trash2 } from 'lucide-react'
import { useToast } from './Toast'

interface FileNode {
  name: string;
  url: string;
  id?: string;
  structure_analyzed?: boolean;
  chunks_created?: boolean;
  total_chunks?: number;
  summary?: {
    units_found: number;
    modules_found: number;
    classes_found: number;
    total_elements: number;
  };
}

interface FileExplorerProps {
  onSelectFile: (file: FileNode) => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
}

export function FileExplorer({ onSelectFile, onToggleCollapse, isCollapsed }: FileExplorerProps) {
  const [treeData, setTreeData] = useState<FileNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFolderOpen, setIsFolderOpen] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadArea, setShowUploadArea] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<FileNode | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showSuccess, showError, showWarning } = useToast()

  const fetchFiles = async () => {
    try {
      console.log('Iniciando fetchFiles...')
      setIsLoading(true)
      
      // Usar el endpoint simple que lista archivos PDF de uploads
      const listResponse = await fetch('http://localhost:8000/api/documents/list/')
      
      console.log('Respuesta de list:', listResponse.status, listResponse.statusText)
      
      if (!listResponse.ok) {
        throw new Error(`Error: ${listResponse.status} ${listResponse.statusText}`)
      }
      
      const listData = await listResponse.json()
      console.log('Datos recibidos:', listData)
      
      // Mapear los datos directamente
      const files: FileNode[] = listData.map((file: any) => ({
        id: file.id,
        name: file.name,
        url: file.url,
        structure_analyzed: file.structure_analyzed || false,
        chunks_created: file.chunks_created || false,
        total_chunks: file.total_chunks || 0,
        summary: file.summary
      }))
      
      console.log('Archivos mapeados:', files)
      console.log('URLs de los archivos:', files.map(f => ({ name: f.name, url: f.url })))
      setTreeData(files)
    } catch (err: any) {
      console.error('Error en fetchFiles:', err)
      setError(err.message || 'Error al cargar los archivos.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])



  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showError('Tipo de archivo no válido', 'Solo se permiten archivos PDF')
      return
    }

    console.log('Iniciando upload del archivo:', file.name, 'Tamaño:', file.size)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('Enviando archivo al servidor...')
      const response = await fetch('http://localhost:8000/api/documents/upload/', {
        method: 'POST',
        body: formData
      })

      console.log('Respuesta del servidor:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error del servidor:', errorData)
        throw new Error(errorData.error || 'Error al subir el archivo')
      }

      const result = await response.json()
      console.log('Resultado del upload:', result)
      setUploadProgress(100)
      
      // Recargar la lista de archivos
      console.log('Recargando lista de archivos...')
      await fetchFiles()
      
      // Cerrar área de upload
      setShowUploadArea(false)
      
      // Mostrar mensaje de éxito
      showSuccess('Archivo subido exitosamente', `"${file.name}" se ha subido correctamente`)
      
    } catch (error: any) {
      console.error('Error uploading file:', error)
      showError('Error al subir archivo', error.message)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.name.toLowerCase().endsWith('.pdf'))
    
    if (pdfFile) {
      handleFileUpload(pdfFile)
    } else {
      showWarning('Archivo no válido', 'Por favor, arrastra un archivo PDF')
    }
  }

  const handleDeleteFile = async (file: FileNode, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se seleccione el archivo
    
    // Mostrar confirmación elegante
    setFileToDelete(file)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!fileToDelete) return

    console.log('Iniciando eliminación de archivo:', fileToDelete)
    
    try {
      const documentId = fileToDelete.id || fileToDelete.name
      const deleteUrl = `http://localhost:8000/api/documents/delete/${documentId}/`
      
      console.log('URL de eliminación:', deleteUrl)
      console.log('Document ID:', documentId)
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE'
      })

      console.log('Respuesta del servidor:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error del servidor:', errorData)
        throw new Error(errorData.error || 'Error al eliminar el archivo')
      }

      const result = await response.json()
      console.log('Resultado de eliminación:', result)

      // Recargar la lista de archivos
      console.log('Recargando lista de archivos...')
      await fetchFiles()
      
      // Mostrar mensaje de éxito
      showSuccess('Archivo eliminado', `"${fileToDelete.name}" se ha eliminado correctamente`)
      
    } catch (error: any) {
      console.error('Error deleting file:', error)
      showError('Error al eliminar archivo', error.message)
    } finally {
      setShowDeleteConfirm(false)
      setFileToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setFileToDelete(null)
  }

  const getStructureIcon = (file: FileNode) => {
    if (!file.structure_analyzed) {
      return <File size={16} className="text-gray-500" />
    }
    
    if (file.summary && file.summary.total_elements > 0) {
      return <BookOpen size={16} className="text-blue-400" />
    }
    
    return <File size={16} className="text-green-400" />
  }

  const getStructureInfo = (file: FileNode) => {
    if (!file.structure_analyzed) {
      return <span className="text-xs text-gray-500 ml-2">Sin analizar</span>
    }
    
    if (!file.summary) {
      return <span className="text-xs text-yellow-500 ml-2">Analizando...</span>
    }

    const { units_found, modules_found, classes_found } = file.summary
    
    if (units_found === 0 && modules_found === 0 && classes_found === 0) {
      return <span className="text-xs text-gray-500 ml-2">Sin estructura</span>
    }

    return (
      <div className="text-xs text-gray-400 ml-2 flex items-center space-x-2">
        {units_found > 0 && (
          <span className="flex items-center">
            <BookOpen size={10} className="mr-1 text-blue-400" />
            {units_found}U
          </span>
        )}
        {modules_found > 0 && (
          <span className="flex items-center">
            <Layers size={10} className="mr-1 text-green-400" />
            {modules_found}M
          </span>
        )}
        {classes_found > 0 && (
          <span className="flex items-center">
            <GraduationCap size={10} className="mr-1 text-purple-400" />
            {classes_found}C
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900/30 text-gray-300 text-sm p-2 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold uppercase text-gray-400 px-2">Material de Estudio</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowUploadArea(!showUploadArea)}
            className="p-1 rounded hover:bg-gray-800/50 transition-colors"
            title="Subir archivo"
          >
            <Plus size={14} className="text-blue-400" />
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded hover:bg-gray-800/50 transition-colors"
              title={isCollapsed ? "Expandir" : "Colapsar"}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Área de Upload */}
      {showUploadArea && (
        <div className="mb-3">
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
              dragOver 
                ? 'border-blue-400 bg-blue-900/20' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-2">
                <Loader size={20} className="animate-spin text-blue-400 mx-auto" />
                <p className="text-sm">Subiendo archivo...</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload size={24} className="text-gray-400 mx-auto" />
                <p className="text-sm font-medium">Arrastra un archivo PDF aquí</p>
                <p className="text-xs text-gray-500">o</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                >
                  Seleccionar archivo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de archivos */}
      <div className="flex-1 overflow-auto">
        <ul className="mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader size={20} className="animate-spin text-blue-400" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : error ? (
            <div className="flex items-center text-red-400 p-2 bg-red-900/30 rounded-lg">
              <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
              <div>
                  <p className="font-bold">Error de Conexión</p>
                  <p className="text-xs">No se pudo cargar la lista de archivos. ¿El servidor de Django está funcionando?</p>
              </div>
            </div>
          ) : (
            <li>
              <div 
                className="flex items-center space-x-2 p-1 rounded hover:bg-gray-800/50 cursor-pointer"
                onClick={() => setIsFolderOpen(!isFolderOpen)}
              >
                {isFolderOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Folder size={16} className="text-blue-400" />
                <span>Guías Docentes</span>
                <span className="text-xs text-gray-500 ml-auto">{treeData.length} archivos</span>
              </div>
              {isFolderOpen && (
                <ul className="pl-4 border-l border-gray-700/50 ml-3">
                  {treeData.map((file) => (
                    <li 
                      key={file.id || file.name} 
                      className="mt-1"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(file));
                      }}
                    >
                      <div 
                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800/50 cursor-pointer transition-colors group"
                        onClick={() => onSelectFile(file)}
                      >
                        {getStructureIcon(file)}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{file.name}</div>
                          {getStructureInfo(file)}
                        </div>
                        
                        {/* Status indicators */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.structure_analyzed && (
                            <div className="w-2 h-2 bg-green-400 rounded-full" title="Estructura analizada" />
                          )}
                          {file.chunks_created && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full" title="Chunks creados" />
                          )}
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDeleteFile(file, e)}
                            className="p-1 rounded hover:bg-red-900/50 transition-colors"
                            title="Eliminar archivo"
                          >
                            <Trash2 size={12} className="text-red-400 hover:text-red-300" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && fileToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 border border-gray-700/50 rounded-xl p-6 max-w-sm w-full shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle size={20} className="text-yellow-400" />
              <h3 className="text-lg font-medium text-gray-100">Confirmar eliminación</h3>
            </div>
            
            <p className="text-gray-300 mb-5 text-sm leading-relaxed">
              ¿Estás seguro de que quieres eliminar{' '}
              <span className="font-medium text-white">"{fileToDelete.name}"</span>?
              <br />
              <span className="text-xs text-gray-400 mt-1 block">
                Esta acción no se puede deshacer.
              </span>
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600/80 hover:bg-red-500/80 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 