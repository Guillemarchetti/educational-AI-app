'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  BookOpen, 
  Target, 
  Brain, 
  Zap, 
  TrendingUp,
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react'

interface SmartPrompt {
  id: string
  text: string
  category: string
  priority: number
  contextual: boolean
  subject?: string
}

interface SmartPromptsProps {
  context: string[]
  onPromptSelect: (prompt: string) => void
  subject?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic'
}

export function SmartPrompts({ 
  context, 
  onPromptSelect, 
  subject = 'general',
  difficulty = 'intermediate',
  learningStyle = 'visual'
}: SmartPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [prompts, setPrompts] = useState<SmartPrompt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [metadata, setMetadata] = useState<any>(null)

  // Función para obtener prompts dinámicos del backend
  const fetchDynamicPrompts = async () => {
    if (context.length === 0) {
      setPrompts([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/agents/smart-prompts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: context
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setPrompts(data.prompts)
        setMetadata(data.metadata)
      } else {
        console.error('Error fetching prompts:', data.error)
        setPrompts([])
      }
    } catch (error) {
      console.error('Error fetching dynamic prompts:', error)
      setPrompts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar prompts cuando cambie el contexto
  useEffect(() => {
    fetchDynamicPrompts()
  }, [context])

  const handlePromptClick = (prompt: SmartPrompt) => {
    onPromptSelect(prompt.text)
    setSelectedCategory(prompt.category)
    
    // Reset category selection after a delay
    setTimeout(() => setSelectedCategory(null), 2000)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'explanation':
        return <BookOpen className="w-4 h-4" />
      case 'examples':
        return <Target className="w-4 h-4" />
      case 'comparison':
        return <TrendingUp className="w-4 h-4" />
      case 'application':
        return <Zap className="w-4 h-4" />
      case 'visualization':
        return <Brain className="w-4 h-4" />
      case 'evaluation':
        return <Lightbulb className="w-4 h-4" />
      case 'mathematics':
        return <Sparkles className="w-4 h-4" />
      case 'subject_specific':
        return <Sparkles className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string, contextual: boolean) => {
    const baseColors = {
      explanation: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
      examples: 'bg-green-500/20 border-green-500/50 text-green-400',
      comparison: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
      application: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
      visualization: 'bg-pink-500/20 border-pink-500/50 text-pink-400',
      evaluation: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
      mathematics: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400',
      subject_specific: 'bg-teal-500/20 border-teal-500/50 text-teal-400'
    }

    const color = baseColors[category as keyof typeof baseColors] || 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    
    // Resaltar prompts contextuales
    if (contextual) {
      return color + ' ring-1 ring-sky-500/30'
    }
    
    return color
  }

  if (!isExpanded) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors text-sm"
        >
          <Lightbulb className="w-4 h-4" />
          <span>Ver prompts recomendados</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-enterprise-800/50 bg-enterprise-950/50"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-medium text-slate-300">
              Prompts Inteligentes
            </h3>
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            )}
          </div>
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-slate-500 hover:text-slate-400"
            >
              Ocultar
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            <span className="ml-2 text-sm text-slate-400">Generando prompts inteligentes...</span>
          </div>
        ) : prompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {prompts.map((prompt, index) => (
                <motion.button
                  key={prompt.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    backgroundColor: selectedCategory === prompt.category ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.1 
                  }}
                  onClick={() => handlePromptClick(prompt)}
                  className={`
                    p-3 rounded-lg border transition-all duration-200
                    hover:scale-105 hover:shadow-lg
                    ${getCategoryColor(prompt.category, prompt.contextual)}
                    ${selectedCategory === prompt.category ? 'ring-2 ring-sky-500/50' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(prompt.category)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium mb-1">
                        {prompt.text}
                      </p>
                      <div className="flex items-center gap-2">
                        {prompt.contextual && (
                          <span className="text-xs bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">
                            Contextual
                          </span>
                        )}
                        <span className="text-xs opacity-70">
                          {prompt.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay contexto disponible para generar prompts</p>
          </div>
        )}

        {/* Información de personalización */}
        {metadata && (
          <div className="mt-4 p-3 bg-enterprise-900/30 rounded-lg border border-enterprise-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>
                Análisis: {metadata.subject} • {metadata.difficulty} • {metadata.total_prompts} prompts
              </span>
            </div>
            {metadata.keywords && metadata.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {metadata.keywords.slice(0, 5).map((keyword: string, index: number) => (
                  <span key={index} className="text-xs bg-enterprise-800/50 text-slate-300 px-2 py-1 rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
} 