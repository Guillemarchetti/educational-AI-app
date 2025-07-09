'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Brain, 
  Zap, 
  TrendingUp,
  Lightbulb,
  Sparkles
} from 'lucide-react'

interface WelcomeScreenProps {
  onSendMessage: (message: string) => Promise<void>
}



export function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  const quickPrompts = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      text: "Explica este concepto de manera simple",
      color: "bg-blue-500/20 border-blue-500/50 text-blue-400"
    },
    {
      icon: <Target className="w-5 h-5" />,
      text: "Dame ejemplos prácticos",
      color: "bg-green-500/20 border-green-500/50 text-green-400"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      text: "Crea un diagrama mental",
      color: "bg-purple-500/20 border-purple-500/50 text-purple-400"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "¿Cómo se aplica en la vida real?",
      color: "bg-orange-500/20 border-orange-500/50 text-orange-400"
    }
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-enterprise-950 via-enterprise-900 to-enterprise-950">
      {/* Header Principal */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="relative mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center border border-sky-500/50 shadow-lg">
            <GraduationCap className="w-10 h-10 text-sky-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-3 text-white bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
            Revolución Educativa IA
          </h1>
          <p className="text-slate-300 max-w-lg mx-auto text-lg">
            Tu tutor personal de IA que transforma el aprendizaje en una experiencia inmersiva
          </p>
        </motion.div>
      </motion.div>

      {/* Características Principales */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="flex items-start gap-4 p-6 rounded-xl bg-enterprise-900/50 border border-enterprise-800/50">
          <div className="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">IA Conversacional Natural</h3>
            <p className="text-slate-400">Diálogos educativos que se adaptan a tu estilo de aprendizaje</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 rounded-xl bg-enterprise-900/50 border border-enterprise-800/50">
          <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Análisis Visual Inteligente</h3>
            <p className="text-slate-400">Selecciona imágenes y obtén explicaciones detalladas</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 rounded-xl bg-enterprise-900/50 border border-enterprise-800/50">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Gamificación Educativa</h3>
            <p className="text-slate-400">Aprende jugando con logros y progreso visual</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 rounded-xl bg-enterprise-900/50 border border-enterprise-800/50">
          <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Personalización Real</h3>
            <p className="text-slate-400">Adaptación genuina a tu ritmo y necesidades</p>
          </div>
        </div>
      </motion.div>

      {/* Prompts Rápidos */}
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          Comienza con estos prompts inteligentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickPrompts.map((prompt, index) => (
            <motion.button
              key={index}
              onClick={() => onSendMessage(prompt.text)}
              className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg ${prompt.color}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                {prompt.icon}
                <span className="text-sm font-medium">{prompt.text}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <p className="text-slate-400 text-sm">
          💡 <span className="text-sky-400">Tip:</span> Selecciona un documento del panel izquierdo para comenzar tu aprendizaje personalizado
        </p>
      </motion.div>
    </div>
  )
} 