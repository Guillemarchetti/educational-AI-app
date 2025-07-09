'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Star, 
  Award,
  BookOpen,
  Brain,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

interface ProgressStats {
  totalStudyTime: number // en minutos
  sessionsCompleted: number
  conceptsMastered: number
  currentStreak: number
  accuracy: number // porcentaje
  level: number
  experience: number
  experienceToNextLevel: number
}

interface ProgressTrackerProps {
  isVisible: boolean
  onToggle: () => void
}

export function ProgressTracker({ isVisible, onToggle }: ProgressTrackerProps) {
  const [stats, setStats] = useState<ProgressStats>({
    totalStudyTime: 145, // 2h 25m
    sessionsCompleted: 12,
    conceptsMastered: 8,
    currentStreak: 5,
    accuracy: 87,
    level: 3,
    experience: 750,
    experienceToNextLevel: 1000
  })

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first-step',
      title: 'Primer Paso',
      description: 'Completar tu primera sesión de estudio',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'consistent',
      title: 'Consistente',
      description: '7 días seguidos estudiando',
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-green-500/20 border-green-500/50 text-green-400',
      unlocked: false,
      progress: 5,
      maxProgress: 7
    },
    {
      id: 'analytical',
      title: 'Analítico',
      description: '90%+ precisión en evaluaciones',
      icon: <Target className="w-4 h-4" />,
      color: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
      unlocked: false,
      progress: 87,
      maxProgress: 90
    },
    {
      id: 'speedster',
      title: 'Veloz',
      description: 'Completar quiz en tiempo récord',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'master',
      title: 'Maestro',
      description: 'Dominar 100% de un tema',
      icon: <Trophy className="w-4 h-4" />,
      color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    }
  ])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'bg-purple-500'
    if (level >= 7) return 'bg-blue-500'
    if (level >= 4) return 'bg-green-500'
    return 'bg-yellow-500'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3 }}
          className="fixed right-4 top-4 w-80 bg-enterprise-900 border border-enterprise-800 rounded-xl shadow-2xl z-50 max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-enterprise-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Tu Progreso</h3>
              </div>
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Nivel y Experiencia */}
            <div className="bg-enterprise-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${getLevelColor(stats.level)} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{stats.level}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Nivel {stats.level}</h4>
                    <p className="text-xs text-slate-400">Experiencia: {stats.experience}/{stats.experienceToNextLevel} XP</p>
                  </div>
                </div>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              
              {/* Barra de experiencia */}
              <div className="w-full bg-enterprise-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.experience / stats.experienceToNextLevel) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Estadísticas Principales */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-enterprise-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-white font-semibold">{formatTime(stats.totalStudyTime)}</p>
                <p className="text-xs text-slate-400">Tiempo Total</p>
              </div>
              
              <div className="bg-enterprise-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-white font-semibold">{stats.currentStreak}</p>
                <p className="text-xs text-slate-400">Días Seguidos</p>
              </div>
              
              <div className="bg-enterprise-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-white font-semibold">{stats.conceptsMastered}</p>
                <p className="text-xs text-slate-400">Conceptos Dominados</p>
              </div>
              
              <div className="bg-enterprise-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-white font-semibold">{stats.accuracy}%</p>
                <p className="text-xs text-slate-400">Precisión</p>
              </div>
            </div>

            {/* Logros */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Logros
              </h4>
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      achievement.unlocked 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-enterprise-800/50 border-enterprise-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${achievement.color}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className={`text-sm font-medium ${
                            achievement.unlocked ? 'text-green-400' : 'text-slate-300'
                          }`}>
                            {achievement.title}
                          </h5>
                          {achievement.unlocked && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          {achievement.description}
                        </p>
                        {!achievement.unlocked && (
                          <div className="w-full bg-enterprise-700 rounded-full h-1">
                            <div 
                              className="bg-sky-400 h-1 rounded-full"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Próximos Objetivos */}
            <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-lg p-4 border border-sky-500/20">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-400" />
                Próximo Objetivo
              </h4>
              <p className="text-sm text-slate-300 mb-2">
                Mantén tu racha por 2 días más para desbloquear "Consistente"
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-full bg-enterprise-700 rounded-full h-1">
                  <div className="bg-sky-400 h-1 rounded-full" style={{ width: '71%' }} />
                </div>
                <span>5/7</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 