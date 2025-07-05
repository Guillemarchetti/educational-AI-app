'use client'

import React, { useState, useEffect } from 'react'
import { File, Folder, ChevronDown, ChevronRight, Loader, AlertTriangle, BookOpen, Layers, GraduationCap } from 'lucide-react'

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
  onSelectFile: (file: FileNode) => void
}

export function FileExplorer({ onSelectFile }: FileExplorerProps) {
  const [treeData, setTreeData] = useState<FileNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFolderOpen, setIsFolderOpen] = useState(true)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true)
        
        // Usar el endpoint simple que lista archivos PDF de uploads
        const listResponse = await fetch('http://localhost:8000/api/documents/list/')
        
        if (!listResponse.ok) {
          throw new Error(`Error: ${listResponse.status} ${listResponse.statusText}`)
        }
        
        const listData = await listResponse.json()
        
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
        
        setTreeData(files)
      } catch (err: any) {
        setError(err.message || 'Error al cargar los archivos.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [])

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
    <div className="h-full bg-gray-900/30 text-gray-300 text-sm p-2">
      <h2 className="text-xs font-bold uppercase text-gray-400 px-2">Material de Estudio</h2>
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
  )
} 