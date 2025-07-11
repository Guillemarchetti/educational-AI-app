'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  BookOpen,
  TrendingUp,
  Brain,
  Zap,
  Star,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Clock,
  Award
} from 'lucide-react'

interface KnowledgeNode {
  id: string
  title: string
  type: 'unit' | 'module' | 'class'
  status: 'objective' | 'well_learned' | 'needs_reinforcement' | 'not_learned'
  progress: number // 0-100
  children?: KnowledgeNode[]
  description?: string
  timeSpent?: number // en minutos
  lastReviewed?: Date
  difficulty?: 'easy' | 'medium' | 'hard'
  importance?: 'low' | 'medium' | 'high'
}

interface KnowledgeMapProps {
  documentStructure: any
  selectedFile: { name: string; url: string; id?: string } | null
  onNodeClick?: (node: KnowledgeNode) => void
}

export function KnowledgeMap({ documentStructure, selectedFile, onNodeClick }: KnowledgeMapProps) {
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeNode[]>([])
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'tree' | 'radar' | 'timeline'>('tree')
  const [isLoading, setIsLoading] = useState(false)
  const [useSyntheticData, setUseSyntheticData] = useState(false)

  // Generar mapa de conocimientos basado en la estructura del documento
  useEffect(() => {
    if (documentStructure && selectedFile?.id) {
      generateKnowledgeMap()
    }
  }, [documentStructure, selectedFile, useSyntheticData])

  const generateKnowledgeMap = async (forceSynthetic?: boolean) => {
    if (!selectedFile?.id) return
    
    const shouldUseSynthetic = forceSynthetic !== undefined ? forceSynthetic : useSyntheticData
    setIsLoading(true)
    
    try {
      // Usar endpoint sintético si está habilitado
      const endpoint = shouldUseSynthetic 
        ? `http://localhost:8000/api/agents/knowledge-map/synthetic/${selectedFile.id}/`
        : `http://localhost:8000/api/agents/knowledge-map/${selectedFile.id}/`
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.knowledge_map) {
          setKnowledgeMap(data.knowledge_map.nodes || [])
        } else {
          // Si no existe, generar uno nuevo
          await generateNewKnowledgeMap()
        }
      } else {
        // Si hay error, generar uno nuevo
        await generateNewKnowledgeMap()
      }
    } catch (error) {
      console.error('💥 Error fetching knowledge map:', error)
      // Fallback a datos simulados
      const map = convertStructureToKnowledgeMap(documentStructure)
      setKnowledgeMap(map)
    } finally {
      setIsLoading(false)
    }
  }

  const generateNewKnowledgeMap = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/agents/knowledge-map/generate/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: selectedFile?.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.knowledge_map) {
          setKnowledgeMap(data.knowledge_map.nodes || [])
        } else {
          // Fallback a datos simulados
          const map = convertStructureToKnowledgeMap(documentStructure)
          setKnowledgeMap(map)
        }
      } else {
        // Fallback a datos simulados
        const map = convertStructureToKnowledgeMap(documentStructure)
        setKnowledgeMap(map)
      }
    } catch (error) {
      console.error('Error generating knowledge map:', error)
      // Fallback a datos simulados
      const map = convertStructureToKnowledgeMap(documentStructure)
      setKnowledgeMap(map)
    }
  }

  const convertStructureToKnowledgeMap = (structure: any): KnowledgeNode[] => {
    if (!structure || !structure.units) return []

    return structure.units.map((unit: any, unitIndex: number) => ({
      id: `unit-${unitIndex}`,
      title: unit.title || `Unidad ${unitIndex + 1}`,
      type: 'unit',
      status: getRandomStatus(),
      progress: getRandomProgress(),
      description: unit.description || `Unidad de aprendizaje sobre ${unit.title}`,
      timeSpent: Math.floor(Math.random() * 120) + 30, // 30-150 minutos
      lastReviewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      difficulty: getRandomDifficulty(),
      importance: getRandomImportance(),
      children: unit.modules?.map((module: any, moduleIndex: number) => ({
        id: `unit-${unitIndex}-module-${moduleIndex}`,
        title: module.title || `Módulo ${moduleIndex + 1}`,
        type: 'module',
        status: getRandomStatus(),
        progress: getRandomProgress(),
        description: module.description || `Módulo de aprendizaje`,
        timeSpent: Math.floor(Math.random() * 60) + 15,
        lastReviewed: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        difficulty: getRandomDifficulty(),
        importance: getRandomImportance(),
        children: module.classes?.map((classItem: any, classIndex: number) => ({
          id: `unit-${unitIndex}-module-${moduleIndex}-class-${classIndex}`,
          title: classItem.title || `Clase ${classIndex + 1}`,
          type: 'class',
          status: getRandomStatus(),
          progress: getRandomProgress(),
          description: classItem.description || `Clase específica`,
          timeSpent: Math.floor(Math.random() * 30) + 5,
          lastReviewed: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          difficulty: getRandomDifficulty(),
          importance: getRandomImportance()
        })) || []
      })) || []
    }))
  }

  const getRandomStatus = (): KnowledgeNode['status'] => {
    const statuses: KnowledgeNode['status'][] = ['objective', 'well_learned', 'needs_reinforcement', 'not_learned']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const getRandomProgress = (): number => {
    return Math.floor(Math.random() * 100)
  }

  const getRandomDifficulty = (): 'easy' | 'medium' | 'hard' => {
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard']
    return difficulties[Math.floor(Math.random() * difficulties.length)]
  }

  const getRandomImportance = (): 'low' | 'medium' | 'high' => {
    const importances: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high']
    return importances[Math.floor(Math.random() * importances.length)]
  }

  const getStatusIcon = (status: KnowledgeNode['status']) => {
    switch (status) {
      case 'objective':
        return <Target className="w-4 h-4 text-blue-400" />
      case 'well_learned':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'needs_reinforcement':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'not_learned':
        return <XCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusColor = (status: KnowledgeNode['status']) => {
    switch (status) {
      case 'objective':
        return 'border-blue-500/30 bg-blue-500/10'
      case 'well_learned':
        return 'border-green-500/30 bg-green-500/10'
      case 'needs_reinforcement':
        return 'border-yellow-500/30 bg-yellow-500/10'
      case 'not_learned':
        return 'border-red-500/30 bg-red-500/10'
    }
  }

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'hard':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getImportanceColor = (importance: string | undefined) => {
    switch (importance) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node)
    onNodeClick?.(node)
  }

  const renderKnowledgeNode = (node: KnowledgeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    return (
      <motion.div
        key={node.id}
        className="mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.1 }}
      >
        <motion.div
          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105 ${
            getStatusColor(node.status)
          } ${selectedNode?.id === node.id ? 'ring-2 ring-blue-500/50' : ''}`}
          onClick={() => handleNodeClick(node)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(node.status)}
                <span className="text-sm font-medium text-slate-200">
                  {node.title}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="flex-1 max-w-xs">
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${node.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-xs text-slate-400 mt-1">
                  {node.progress}% completado
                </span>
              </div>

              {/* Difficulty and Importance */}
              <div className="flex items-center gap-2 text-xs">
                <span className={getDifficultyColor(node.difficulty)}>
                  {node.difficulty}
                </span>
                <span className={getImportanceColor(node.importance)}>
                  {node.importance}
                </span>
              </div>

              {/* Time spent */}
              {node.timeSpent && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{node.timeSpent}m</span>
                </div>
              )}
            </div>

            {/* Expand/Collapse button */}
            {hasChildren && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNodeExpansion(node.id)
                }}
                className="p-1 hover:bg-white/10 rounded"
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              className="ml-6 border-l border-gray-700/50 pl-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {node.children?.map(child => renderKnowledgeNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const getOverallProgress = () => {
    if (knowledgeMap.length === 0) return 0
    
    const allNodes = flattenNodes(knowledgeMap)
    const totalProgress = allNodes.reduce((sum, node) => sum + node.progress, 0)
    return Math.round(totalProgress / allNodes.length)
  }

  const flattenNodes = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
    let result: KnowledgeNode[] = []
    nodes.forEach(node => {
      result.push(node)
      if (node.children) {
        result = result.concat(flattenNodes(node.children))
      }
    })
    return result
  }

  const getStatusCounts = () => {
    const allNodes = flattenNodes(knowledgeMap)
    return {
      objective: allNodes.filter(n => n.status === 'objective').length,
      well_learned: allNodes.filter(n => n.status === 'well_learned').length,
      needs_reinforcement: allNodes.filter(n => n.status === 'needs_reinforcement').length,
      not_learned: allNodes.filter(n => n.status === 'not_learned').length
    }
  }

  const statusCounts = getStatusCounts()

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">Generando mapa de conocimientos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-enterprise-900 mx-8 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-enterprise-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Mapa de Conocimientos</h2>
              <p className="text-sm text-slate-400">
                {selectedFile?.name || 'Documento no seleccionado'}
              </p>
              {useSyntheticData && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                    🎯 Datos Sintéticos
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* Toggle Synthetic Data */}
            <button
              onClick={() => {
                const newState = !useSyntheticData
                setUseSyntheticData(newState)
                
                // Forzar recarga inmediata si hay un archivo seleccionado
                if (selectedFile?.id) {
                  setTimeout(() => {
                    generateKnowledgeMap(newState)
                  }, 100)
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                useSyntheticData
                  ? 'bg-purple-500 text-white'
                  : 'bg-enterprise-800/50 text-slate-400 hover:text-white'
              }`}
              title={useSyntheticData ? 'Usando datos sintéticos' : 'Usando datos reales'}
            >
              {useSyntheticData ? '🎯 Sintético' : '📊 Real'}
            </button>
            
            {['tree', 'radar', 'timeline'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'bg-enterprise-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'tree' && 'Árbol'}
                {mode === 'radar' && 'Radar'}
                {mode === 'timeline' && 'Línea'}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {useSyntheticData && (
            <div className="col-span-4 mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-purple-300">🎯</span>
                <span className="text-purple-300 font-medium">Modo Sintético Activado</span>
                <span className="text-purple-400 text-sm">- Datos de demostración cargados</span>
              </div>
            </div>
          )}
          
          <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Objetivos</span>
            </div>
            <span className="text-lg font-semibold text-blue-400">{statusCounts.objective}</span>
          </div>
          
          <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Bien Aprendido</span>
            </div>
            <span className="text-lg font-semibold text-green-400">{statusCounts.well_learned}</span>
          </div>
          
          <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-400">Necesita Refuerzo</span>
            </div>
            <span className="text-lg font-semibold text-yellow-400">{statusCounts.needs_reinforcement}</span>
          </div>
          
          <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-400">No Aprendido</span>
            </div>
            <span className="text-lg font-semibold text-red-400">{statusCounts.not_learned}</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Progreso General</span>
            <span className="text-sm text-slate-300">{getOverallProgress()}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${getOverallProgress()}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-8">
        {viewMode === 'tree' && (
          <div className="space-y-4">
            {knowledgeMap.map(node => renderKnowledgeNode(node))}
          </div>
        )}

        {viewMode === 'radar' && (
          <div className="text-center py-8">
            <div className="w-32 h-32 mx-auto mb-4">
              <motion.div
                className="w-full h-full border-2 border-blue-500/30 rounded-full relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-4 border-2 border-green-500/30 rounded-full" />
                <div className="absolute inset-8 border-2 border-yellow-500/30 rounded-full" />
                <div className="absolute inset-12 border-2 border-red-500/30 rounded-full" />
              </motion.div>
            </div>
            <p className="text-slate-400">Visualización de Radar en desarrollo...</p>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="text-center py-8">
            <div className="w-full h-32 bg-enterprise-800/30 rounded-lg border border-enterprise-700/50 flex items-center justify-center">
              <p className="text-slate-400">Timeline de Aprendizaje en desarrollo...</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="border-t border-enterprise-800/50 p-4 bg-enterprise-800/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">{selectedNode.title}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Estado:</span>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedNode.status)}
                  <span className="text-white">
                    {selectedNode.status === 'objective' && 'Objetivo'}
                    {selectedNode.status === 'well_learned' && 'Bien Aprendido'}
                    {selectedNode.status === 'needs_reinforcement' && 'Necesita Refuerzo'}
                    {selectedNode.status === 'not_learned' && 'No Aprendido'}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-slate-400">Progreso:</span>
                <div className="mt-1">
                  <span className="text-white">{selectedNode.progress}%</span>
                </div>
              </div>
              
              {selectedNode.description && (
                <div className="col-span-2">
                  <span className="text-slate-400">Descripción:</span>
                  <p className="text-white mt-1">{selectedNode.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 