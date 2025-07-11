'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Trash2, Lightbulb, Image } from 'lucide-react'

interface ChatHeaderProps {
  onToggleQuiz?: () => void
  onClearContext?: () => void
  onToggleSmartPrompts?: () => void
  onToggleImageSelector?: () => void
}

export function ChatHeader({ onToggleQuiz, onClearContext, onToggleSmartPrompts, onToggleImageSelector }: ChatHeaderProps) {
  return (
    <motion.header 
      className="border-b border-enterprise-800/50 bg-enterprise-900/30 p-4 flex-shrink-0"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Asistente de Chat
        </h2>
        <div className="flex items-center gap-2">
          {onToggleSmartPrompts && (
            <button
              onClick={onToggleSmartPrompts}
              className="p-2 rounded-lg bg-enterprise-800/50 hover:bg-enterprise-700/50 transition-colors border border-enterprise-700/50"
              title="Prompts Inteligentes"
            >
              <Lightbulb className="w-4 h-4 text-blue-400" />
            </button>
          )}
          {onToggleImageSelector && (
            <button
              onClick={onToggleImageSelector}
              className="p-2 rounded-lg bg-enterprise-800/50 hover:bg-enterprise-700/50 transition-colors border border-enterprise-700/50"
              title="Selector de Imágenes"
            >
              <Image className="w-4 h-4 text-green-400" />
            </button>
          )}
          {onClearContext && (
            <button
              onClick={onClearContext}
              className="p-2 rounded-lg bg-enterprise-800/50 hover:bg-enterprise-700/50 transition-colors border border-enterprise-700/50"
              title="Limpiar contexto"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
          {onToggleQuiz && (
            <button
              onClick={onToggleQuiz}
              className="p-2 rounded-lg bg-enterprise-800/50 hover:bg-enterprise-700/50 transition-colors border border-enterprise-700/50"
              title="Iniciar Quiz"
            >
              <Brain className="w-4 h-4 text-purple-400" />
            </button>
          )}

        </div>
      </div>
    </motion.header>
  )
} 