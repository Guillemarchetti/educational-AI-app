'use client'

import React, { useState } from 'react'
import { BookOpen, FolderOpen, FileText, Eye, ChevronDown, ChevronRight } from 'lucide-react'

interface StructureElement {
  element_type: string
  title: string
  level: number
  page_number: number
  line_number: number
  parent_id?: string
  element_id?: string
  content_preview: string
}

interface HierarchyUnit {
  id: string
  title: string
  page_start: number
  modules: HierarchyModule[]
  element?: StructureElement
  classes?: StructureElement[] // Added for direct classes
}

interface HierarchyModule {
  id: string
  title: string
  page_start: number
  classes: StructureElement[]
  element?: StructureElement
}

interface DocumentStructureProps {
  structureData?: {
    elements: StructureElement[]
    hierarchy: {
      units: HierarchyUnit[]
      orphaned_elements: StructureElement[]
    }
    analysis_metadata: {
      total_elements: number
      units_found: number
      modules_found: number
      classes_found: number
    }
  }
  onSelectContext: (context: string, title: string) => void
  selectedFile?: { name: string; url: string; id?: string } | null
}

export function DocumentStructure({ structureData, onSelectContext, selectedFile }: DocumentStructureProps) {
  const [openUnits, setOpenUnits] = useState<{ [key: string]: boolean }>({})
  const [openModules, setOpenModules] = useState<{ [key: string]: boolean }>({})

  const handleToggleUnit = (unitId: string) => {
    setOpenUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }))
  }
  const handleToggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  const handleElementSelect = (element: StructureElement) => {
    const contextText = `Contexto de ${element.title} (Página ${element.page_number}):\n\n${element.content_preview}`
    onSelectContext(contextText, element.title)
  }

  if (!structureData) {
    return (
      <div className="p-6 text-center">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Estructura del Documento
        </h3>
        <p className="text-slate-400 text-sm">
          Selecciona un documento para ver su estructura
        </p>
      </div>
    )
  }

  const { hierarchy, analysis_metadata } = structureData

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-enterprise-800/50">
        <h3 className="text-lg font-semibold text-white mb-3">
          Estructura del Documento
        </h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-enterprise-800/50 rounded">
            <div className="text-blue-400 font-semibold">{analysis_metadata.units_found}</div>
            <div className="text-slate-400">Unidades</div>
          </div>
          <div className="text-center p-2 bg-enterprise-800/50 rounded">
            <div className="text-green-400 font-semibold">{analysis_metadata.modules_found}</div>
            <div className="text-slate-400">Módulos</div>
          </div>
          <div className="text-center p-2 bg-enterprise-800/50 rounded">
            <div className="text-purple-400 font-semibold">{analysis_metadata.classes_found}</div>
            <div className="text-slate-400">Clases</div>
          </div>
          <div className="text-center p-2 bg-enterprise-800/50 rounded">
            <div className="text-yellow-400 font-semibold">{analysis_metadata.total_elements}</div>
            <div className="text-slate-400">Total</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {hierarchy.units.map((unit) => (
          <div key={unit.id} className="border border-enterprise-700/50 rounded-lg mb-2">
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-enterprise-800/30" onClick={() => handleToggleUnit(unit.id)}>
              <div className="flex items-center gap-2">
                {openUnits[unit.id] ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <ChevronRight className="w-4 h-4 text-blue-400" />}
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{unit.title}</span>
              </div>
              {unit.element && (
                <button
                  onClick={e => { e.stopPropagation(); handleElementSelect(unit.element!) }}
                  className="p-1 hover:bg-enterprise-700/50 rounded"
                >
                  <Eye className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
            {openUnits[unit.id] && (
              <div className="ml-6 mt-1">
                {/* Mostrar módulos si existen */}
                {unit.modules && unit.modules.length > 0 && unit.modules.map((module) => (
                  <div key={module.id} className="mb-1">
                    <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-enterprise-800/20 rounded" onClick={() => handleToggleModule(module.id)}>
                      <div className="flex items-center gap-2">
                        {openModules[module.id] ? <ChevronDown className="w-4 h-4 text-green-400" /> : <ChevronRight className="w-4 h-4 text-green-400" />}
                        <FolderOpen className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-200">{module.title}</span>
                      </div>
                      {module.element && (
                        <button
                          onClick={e => { e.stopPropagation(); handleElementSelect(module.element!) }}
                          className="p-1 hover:bg-enterprise-700/50 rounded"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                      )}
                    </div>
                    {openModules[module.id] && module.classes && module.classes.length > 0 && (
                      <div className="ml-6 mt-1">
                        {module.classes.map((classElement) => (
                          <div key={classElement.element_id} className="flex items-center justify-between p-2 hover:bg-enterprise-800/10 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-slate-300">{classElement.title}</span>
                            </div>
                            <button
                              onClick={() => handleElementSelect(classElement)}
                              className="p-1 hover:bg-enterprise-700/50 rounded"
                            >
                              <Eye className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {/* Mostrar clases directas bajo la unidad si existen */}
                {unit.classes && unit.classes.length > 0 && (
                  <div className="ml-2 mt-2">
                    {unit.classes.map((classElement: any) => (
                      <div key={classElement.element_id} className="flex items-center justify-between p-2 hover:bg-enterprise-800/10 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-slate-300">{classElement.title}</span>
                        </div>
                        <button
                          onClick={() => handleElementSelect(classElement)}
                          className="p-1 hover:bg-enterprise-700/50 rounded"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 