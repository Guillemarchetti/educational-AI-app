'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Brain } from 'lucide-react'

interface ChatHeaderProps {
  onToggleProgress?: () => void
  onToggleQuiz?: () => void
}

export function ChatHeader({ onToggleProgress, onToggleQuiz }: ChatHeaderProps) {
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
          {onToggleQuiz && (
            <button
              onClick={onToggleQuiz}
              className="p-2 rounded-lg bg-enterprise-800/50 hover:bg-enterprise-700/50 transition-colors border border-enterprise-700/50"
              title="Iniciar Quiz"
            >
              <Brain className="w-4 h-4 text-purple-400" />
            </button>
          )}
          {onToggleProgress && (
            <button
              onClick={onToggleProgress}
              className="p-2 rounded-lg bg-enterprise-800/50 hover:bg-enterprise-700/50 transition-colors border border-enterprise-700/50"
              title="Ver progreso"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  )
} 