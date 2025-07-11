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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col bg-enterprise-900 mx-8 overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-enterprise-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Tu Progreso</h2>
                <p className="text-sm text-slate-400">Seguimiento de tu aprendizaje</p>
              </div>
            </div>

            {/* Nivel y Experiencia */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30 mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className={`${getLevelColor(stats.level)} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{stats.level}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Nivel {stats.level}</h3>
                  <p className="text-sm text-slate-300">Experiencia: {stats.experience}/{stats.experienceToNextLevel} XP</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Progreso al siguiente nivel</span>
                <span className="text-sm text-slate-300">{Math.round((stats.experience / stats.experienceToNextLevel) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.experience / stats.experienceToNextLevel) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Estadísticas Principales */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="text-xs text-slate-400">Tiempo Total</span>
                </div>
                <span className="text-lg font-semibold text-sky-400">{formatTime(stats.totalStudyTime)}</span>
              </div>
              
              <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">Días Seguidos</span>
                </div>
                <span className="text-lg font-semibold text-green-400">{stats.currentStreak}</span>
              </div>
              
              <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-400">Conceptos</span>
                </div>
                <span className="text-lg font-semibold text-purple-400">{stats.conceptsMastered}</span>
              </div>
              
              <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-400">Precisión</span>
                </div>
                <span className="text-lg font-semibold text-orange-400">{stats.accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pb-8">
            {/* Logros */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Logros</h3>
              </div>
              
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      achievement.unlocked 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-enterprise-800/30 border-enterprise-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked 
                          ? 'bg-green-500/20 border-green-500/50' 
                          : 'bg-enterprise-700/50 border-enterprise-600/50'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${
                            achievement.unlocked ? 'text-green-400' : 'text-slate-300'
                          }`}>
                            {achievement.title}
                          </h4>
                          {achievement.unlocked && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          {achievement.description}
                        </p>
                        {!achievement.unlocked && (
                          <div className="w-full bg-enterprise-700/50 rounded-full h-1.5">
                            <div 
                              className="bg-sky-400 h-1.5 rounded-full"
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

            {/* Próximo Objetivo */}
            <div className="bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-lg p-4 border border-sky-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-medium text-white">Próximo Objetivo</h3>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Mantén tu racha por 2 días más para desbloquear "Consistente"
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-full bg-enterprise-700/50 rounded-full h-1.5">
                  <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: '71%' }} />
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