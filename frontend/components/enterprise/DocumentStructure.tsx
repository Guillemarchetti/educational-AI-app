'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  GraduationCap,
  Plus,
  Loader,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface StructureElement {
  id: string
  title: string
  page_start: number
  structure_path: string
}

interface ModuleData extends StructureElement {
  classes: StructureElement[]
}

interface UnitData extends StructureElement {
  modules: ModuleData[]
}

interface DocumentStructureData {
  document_id: string
  document_title: string
  structure_analyzed: boolean
  chunks_created: boolean
  total_chunks: number
  structure: {
    units: UnitData[]
    orphaned_elements: StructureElement[]
  }
  summary: {
    units_found: number
    modules_found: number
    classes_found: number
    total_elements: number
  }
}

interface DocumentStructureProps {
  selectedDocumentId: string
  onAddToContext: (structurePath: string, elementType: string, title: string) => void
}

export function DocumentStructure({ selectedDocumentId, onAddToContext }: DocumentStructureProps) {
  const [structure, setStructure] = useState<DocumentStructureData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (selectedDocumentId) {
      fetchDocumentStructure()
    }
  }, [selectedDocumentId])

  const fetchDocumentStructure = async () => {
    if (!selectedDocumentId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/documents/structure/${selectedDocumentId}/`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch document structure')
      }

      const data = await response.json()
      
      // Transformar los datos de la nueva API al formato esperado
      const transformedData: DocumentStructureData = {
        document_id: data.document_id,
        document_title: data.title,
        structure_analyzed: data.structure_analyzed,
        chunks_created: data.chunks_created || false,
        total_chunks: data.chunks_created || 0,
        structure: {
          units: [],
          orphaned_elements: []
        },
        summary: data.summary || {
          units_found: 0,
          modules_found: 0,
          classes_found: 0,
          total_elements: 0
        }
      }

      // Organizar elementos por jerarquía
      if (data.structure && data.structure.structure_elements) {
        const elements = data.structure.structure_elements
        const units = new Map<string, UnitData>()
        const modules = new Map<string, ModuleData>()
        
        elements.forEach((element: any) => {
          const transformedElement: StructureElement = {
            id: element.element_id,
            title: element.title,
            page_start: 1, // Por ahora página 1
            structure_path: element.structure_path
          }

          if (element.element_type === 'unidad') {
            units.set(element.element_id, {
              ...transformedElement,
              modules: []
            })
          } else if (element.element_type === 'modulo') {
            modules.set(element.element_id, {
              ...transformedElement,
              classes: []
            })
          } else if (element.element_type === 'clase') {
            // Buscar el módulo padre basado en la jerarquía
            const parentModule = Array.from(modules.values()).find(m => 
              element.structure_path.includes(m.title)
            )
            if (parentModule) {
              parentModule.classes.push(transformedElement)
            } else {
              transformedData.structure.orphaned_elements.push(transformedElement)
            }
          }
        })

        // Asignar módulos a unidades
        modules.forEach(module => {
          const parentUnit = Array.from(units.values()).find(u => 
            module.structure_path.includes(u.title)
          )
          if (parentUnit) {
            parentUnit.modules.push(module)
          }
        })

        transformedData.structure.units = Array.from(units.values())
      }

      setStructure(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const reanalyzedocument = async () => {
    if (!selectedDocumentId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/documents/structure/${selectedDocumentId}/`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to re-analyze document')
      }

      const data = await response.json()
      // Refetch the structure after re-analysis
      await fetchDocumentStructure()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits)
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId)
    } else {
      newExpanded.add(unitId)
    }
    setExpandedUnits(newExpanded)
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handleAddToContext = (structurePath: string, elementType: string, title: string) => {
    onAddToContext(structurePath, elementType, title)
  }

  if (!selectedDocumentId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>Selecciona un documento para ver su estructura</p>
          <p className="text-sm mt-2">El análisis se ejecutará automáticamente</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-400">Analizando estructura del documento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-400">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p className="mb-4">Error al cargar la estructura</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchDocumentStructure}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!structure) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <p className="mb-4">No se pudo cargar la estructura</p>
          <button
            onClick={fetchDocumentStructure}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Intentar análisis
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">Estructura del Documento</h3>
          <button
            onClick={reanalyzedocument}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Re-analizar estructura"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        
        <p className="text-sm text-gray-400 mb-3">{structure.document_title}</p>
        
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-900/30 p-2 rounded">
            <div className="text-blue-300 font-medium">{structure.summary.units_found}</div>
            <div className="text-gray-400">Unidades</div>
          </div>
          <div className="bg-green-900/30 p-2 rounded">
            <div className="text-green-300 font-medium">{structure.summary.modules_found}</div>
            <div className="text-gray-400">Módulos</div>
          </div>
          <div className="bg-purple-900/30 p-2 rounded">
            <div className="text-purple-300 font-medium">{structure.summary.classes_found}</div>
            <div className="text-gray-400">Clases</div>
          </div>
          <div className="bg-yellow-900/30 p-2 rounded">
            <div className="text-yellow-300 font-medium">{structure.total_chunks}</div>
            <div className="text-gray-400">Chunks</div>
          </div>
        </div>
      </div>

      {/* Structure Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        {structure.structure.units.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
            <h4 className="text-lg font-medium text-white mb-2">Sin estructura detectada</h4>
            <p className="text-gray-400 mb-4">
              No se pudo detectar una estructura jerárquica clara en este documento.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Esto puede suceder si el documento no sigue patrones estándar de 
              Unidades → Módulos → Clases.
            </p>
            <button
              onClick={reanalyzedocument}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className="mr-2 inline" />
              Intentar re-análisis
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {structure.structure.units.map((unit) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              {/* Unit */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-center p-3">
                  <button
                    onClick={() => toggleUnit(unit.id)}
                    className="mr-2 hover:bg-blue-700/30 p-1 rounded transition-colors"
                  >
                    {expandedUnits.has(unit.id) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  
                  <BookOpen size={16} className="mr-2 text-blue-300" />
                  
                  <div className="flex-1">
                    <div className="font-medium text-blue-200">{unit.title}</div>
                    <div className="text-xs text-gray-400">Página {unit.page_start}</div>
                  </div>
                  
                  <button
                    onClick={() => handleAddToContext(unit.structure_path, 'unit', unit.title)}
                    className="ml-2 p-1 hover:bg-blue-600 rounded transition-colors"
                    title="Agregar unidad completa al contexto"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Modules */}
                <AnimatePresence>
                  {expandedUnits.has(unit.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-blue-700/30"
                    >
                      {unit.modules.map((module) => (
                        <div key={module.id} className="ml-6 border-l border-gray-600">
                          <div className="flex items-center p-3 bg-green-900/10">
                            <button
                              onClick={() => toggleModule(module.id)}
                              className="mr-2 hover:bg-green-700/30 p-1 rounded transition-colors"
                            >
                              {expandedModules.has(module.id) ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                            
                            <FileText size={14} className="mr-2 text-green-300" />
                            
                            <div className="flex-1">
                              <div className="font-medium text-green-200 text-sm">{module.title}</div>
                              <div className="text-xs text-gray-400">Página {module.page_start}</div>
                            </div>
                            
                            <button
                              onClick={() => handleAddToContext(module.structure_path, 'module', module.title)}
                              className="ml-2 p-1 hover:bg-green-600 rounded transition-colors"
                              title="Agregar módulo al contexto"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Classes */}
                          <AnimatePresence>
                            {expandedModules.has(module.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                {module.classes.map((classItem) => (
                                  <div key={classItem.id} className="ml-6 border-l border-gray-600">
                                    <div className="flex items-center p-2 bg-purple-900/10 hover:bg-purple-900/20 transition-colors">
                                      <GraduationCap size={12} className="mr-2 text-purple-300" />
                                      
                                      <div className="flex-1">
                                        <div className="font-medium text-purple-200 text-xs">{classItem.title}</div>
                                        <div className="text-xs text-gray-400">Página {classItem.page_start}</div>
                                      </div>
                                      
                                      <button
                                        onClick={() => handleAddToContext(classItem.structure_path, 'class', classItem.title)}
                                        className="ml-2 p-1 hover:bg-purple-600 rounded transition-colors"
                                        title="Agregar clase al contexto"
                                      >
                                        <Plus size={10} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Orphaned Elements */}
        {structure.structure.orphaned_elements.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Elementos Adicionales</h4>
            {structure.structure.orphaned_elements.map((element) => (
              <div key={element.id} className="flex items-center p-2 bg-gray-800/50 rounded mb-1">
                <FileText size={12} className="mr-2 text-gray-400" />
                <div className="flex-1">
                  <div className="text-xs text-gray-300">{element.title}</div>
                  <div className="text-xs text-gray-500">Página {element.page_start}</div>
                </div>
                <button
                  onClick={() => handleAddToContext(element.structure_path, 'orphaned', element.title)}
                  className="ml-2 p-1 hover:bg-gray-600 rounded transition-colors"
                  title="Agregar al contexto"
                >
                  <Plus size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 