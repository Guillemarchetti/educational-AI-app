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
  Sparkles
} from 'lucide-react'

interface SmartPrompt {
  id: string
  text: string
  category: 'explanation' | 'examples' | 'comparison' | 'application' | 'visualization' | 'evaluation'
  icon: React.ReactNode
  color: string
  description: string
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

  // Generar prompts inteligentes basados en el contexto
  const generateSmartPrompts = (): SmartPrompt[] => {
    const basePrompts: SmartPrompt[] = [
      {
        id: 'explain',
        text: 'Explica este concepto de manera clara y concisa',
        category: 'explanation',
        icon: <BookOpen className="w-4 h-4" />,
        color: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
        description: 'Obtén una explicación paso a paso'
      },
      {
        id: 'examples',
        text: 'Dame 3 ejemplos prácticos de este tema',
        category: 'examples',
        icon: <Target className="w-4 h-4" />,
        color: 'bg-green-500/20 border-green-500/50 text-green-400',
        description: 'Aprende con casos reales'
      },
      {
        id: 'compare',
        text: 'Compara este concepto con otros similares',
        category: 'comparison',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
        description: 'Entiende las diferencias'
      },
      {
        id: 'apply',
        text: '¿Cómo se aplica esto en la vida real?',
        category: 'application',
        icon: <Zap className="w-4 h-4" />,
        color: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
        description: 'Conecta teoría y práctica'
      },
      {
        id: 'visualize',
        text: 'Crea un diagrama mental de este concepto',
        category: 'visualization',
        icon: <Brain className="w-4 h-4" />,
        color: 'bg-pink-500/20 border-pink-500/50 text-pink-400',
        description: 'Visualiza el conocimiento'
      },
      {
        id: 'quiz',
        text: 'Genera un quiz de 5 preguntas sobre esto',
        category: 'evaluation',
        icon: <Lightbulb className="w-4 h-4" />,
        color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
        description: 'Pon a prueba tu conocimiento'
      }
    ]

    // Personalizar prompts basado en el contexto
    if (context.length > 0) {
      const contextText = context.join(' ').toLowerCase()
      
      // Detectar si hay matemáticas
      if (contextText.includes('matemática') || contextText.includes('math') || contextText.includes('fórmula')) {
        basePrompts.push({
          id: 'step-by-step',
          text: 'Resuelve este problema paso a paso',
          category: 'explanation',
          icon: <Sparkles className="w-4 h-4" />,
          color: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400',
          description: 'Solución detallada'
        })
      }

      // Detectar si hay ciencias
      if (contextText.includes('ciencia') || contextText.includes('science') || contextText.includes('experimento')) {
        basePrompts.push({
          id: 'experiment',
          text: 'Diseña un experimento para demostrar esto',
          category: 'application',
          icon: <Zap className="w-4 h-4" />,
          color: 'bg-red-500/20 border-red-500/50 text-red-400',
          description: 'Aprende haciendo'
        })
      }

      // Detectar si hay historia
      if (contextText.includes('historia') || contextText.includes('history') || contextText.includes('fecha')) {
        basePrompts.push({
          id: 'timeline',
          text: 'Crea una línea de tiempo de estos eventos',
          category: 'visualization',
          icon: <TrendingUp className="w-4 h-4" />,
          color: 'bg-teal-500/20 border-teal-500/50 text-teal-400',
          description: 'Ordena cronológicamente'
        })
      }
    }

    return basePrompts
  }

  const prompts = generateSmartPrompts()

  const handlePromptClick = (prompt: SmartPrompt) => {
    onPromptSelect(prompt.text)
    setSelectedCategory(prompt.category)
    
    // Reset category selection after a delay
    setTimeout(() => setSelectedCategory(null), 2000)
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
                  ${prompt.color}
                  ${selectedCategory === prompt.category ? 'ring-2 ring-sky-500/50' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {prompt.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium mb-1">
                      {prompt.text}
                    </p>
                    <p className="text-xs opacity-70">
                      {prompt.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Información de personalización */}
        <div className="mt-4 p-3 bg-enterprise-900/30 rounded-lg border border-enterprise-800/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3 h-3" />
            <span>
              Personalizado para: {subject} • {difficulty} • {learningStyle}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 