'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Star,
  Award,
  BarChart3,
  Zap,
  Filter,
  ChevronDown,
  Flame,
  Hourglass
} from 'lucide-react';
import { PomodoroStats as StatsType, PomodoroAchievement } from './types';
import { pomodoroService } from './PomodoroService';

interface PomodoroStatsProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function PomodoroStats({ isVisible = true, onClose }: PomodoroStatsProps) {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [achievements, setAchievements] = useState<PomodoroAchievement[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'week' | 'month'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setLoading(true);
    const statsData = pomodoroService.getStats();
    const achievementsData = pomodoroService.getAchievements();
    
    setStats(statsData);
    setAchievements(achievementsData);
    setLoading(false);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 60) return 'text-yellow-400';
    if (progress >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getLevelColor = (level: number): string => {
    if (level >= 20) return 'text-purple-400';
    if (level >= 15) return 'text-blue-400';
    if (level >= 10) return 'text-green-400';
    if (level >= 5) return 'text-yellow-400';
    return 'text-gray-400';
  };

  // Calcular datos para el gráfico de donuts
  const getDonutData = () => {
    if (!stats) return { studyTime: 0, breakTime: 0, totalTime: 0, studyPercentage: 0, breakPercentage: 0 };
    
    const studyTime = stats.totalStudyTime;
    const breakTime = stats.totalBreakTime;
    const totalTime = studyTime + breakTime;
    
    return {
      studyTime,
      breakTime,
      totalTime,
      studyPercentage: totalTime > 0 ? (studyTime / totalTime) * 100 : 0,
      breakPercentage: totalTime > 0 ? (breakTime / totalTime) * 100 : 0
    };
  };

  // Componente del gráfico de donuts
  const DonutChart = () => {
    const data = getDonutData();
    const radius = 80;
    const strokeWidth = 16;
    const center = 100;
    const circumference = 2 * Math.PI * radius;
    const studyOffset = circumference - (data.studyPercentage / 100) * circumference;
    const breakOffset = circumference - (data.breakPercentage / 100) * circumference;

    return (
      <div className="relative w-48 h-48">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Fondo del círculo */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgb(55, 65, 81)"
            strokeWidth={strokeWidth}
          />
          
          {/* Arco de tiempo de estudio */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={studyOffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: studyOffset }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          {/* Arco de tiempo de descanso */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius - strokeWidth - 4}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth={strokeWidth - 4}
            strokeDasharray={circumference}
            strokeDashoffset={breakOffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: breakOffset }}
            transition={{ duration: 1, delay: 0.8 }}
          />
        </svg>
        
        {/* Centro del gráfico */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">{data.totalTime}</div>
          <div className="text-xs text-slate-400">min total</div>
        </div>
        
        {/* Leyenda */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-slate-300">Estudio ({Math.round(data.studyPercentage)}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-300">Descanso ({Math.round(data.breakPercentage)}%)</span>
          </div>
        </div>
      </div>
    );
  };

  // Obtener materias principales
  const getTopSubjects = () => {
    if (!stats) return [];
    
    const subjectStats = stats.recentSessions.reduce((acc, session) => {
      acc[session.subject] = (acc[session.subject] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(subjectStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([subject, time]) => ({ subject, time }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-enterprise-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-full flex items-center justify-center bg-enterprise-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-300 mb-2">Sin datos aún</h2>
          <p className="text-slate-500">Completa tu primera sesión para ver estadísticas</p>
        </div>
      </div>
    );
  }

  const topSubjects = getTopSubjects();

  return (
    <div className="h-full flex flex-col bg-enterprise-900 mx-8 overflow-y-auto scrollbar-thin scrollbar-thumb-enterprise-700 scrollbar-track-enterprise-800 relative">
      {/* Header */}
      <div className="p-6 border-b border-enterprise-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Botón de regreso integrado */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-none bg-gray-700/50 hover:bg-gray-600/70 text-white transition-colors group mr-2"
                title="Volver al setup"
              >
                <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Dashboard</h2>
              <p className="text-sm text-slate-400">
                Visualiza tu progreso y hábitos de estudio
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: 'Todo', icon: BarChart3 },
              { key: 'week', label: 'Semana', icon: Calendar },
              { key: 'month', label: 'Mes', icon: TrendingUp }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeFilter === filter.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-enterprise-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <filter.icon className="w-3 h-3" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-slate-400">Racha Actual</span>
            </div>
            <span className="text-lg font-semibold text-orange-400">{stats.currentStreak}</span>
          </div>
          
          <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Sesiones</span>
            </div>
            <span className="text-lg font-semibold text-green-400">{stats.totalSessions}</span>
          </div>
          
          <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Promedio</span>
            </div>
            <span className="text-lg font-semibold text-blue-400">{stats.averageSessionLength}m</span>
          </div>
          
          <div className="bg-enterprise-800/30 rounded-lg p-3 border border-enterprise-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Completado</span>
            </div>
            <span className="text-lg font-semibold text-purple-400">{Math.round(stats.completionRate)}%</span>
          </div>
        </div>

        {/* Progreso general */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Progreso de Productividad</span>
            <span className="text-sm text-slate-300">{Math.round((stats.totalStudyTime / (stats.totalStudyTime + stats.totalBreakTime)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((stats.totalStudyTime / (stats.totalStudyTime + stats.totalBreakTime)) * 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 pb-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de donuts */}
          <div className="bg-enterprise-800/30 rounded-lg p-6 border border-enterprise-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Distribución de Tiempo
            </h3>
            <div className="flex flex-col items-center">
              <DonutChart />
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatTime(stats.totalStudyTime)}</div>
                  <div className="text-xs text-slate-400">Tiempo de estudio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatTime(stats.totalBreakTime)}</div>
                  <div className="text-xs text-slate-400">Tiempo de descanso</div>
                </div>
              </div>
            </div>
          </div>

          {/* Materias principales */}
          <div className="bg-enterprise-800/30 rounded-lg p-6 border border-enterprise-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-400" />
              Materias Principales
            </h3>
            <div className="space-y-4">
              {topSubjects.map((item, index) => (
                <motion.div
                  key={item.subject}
                  className="flex items-center justify-between p-3 bg-enterprise-700/30 rounded-lg border border-enterprise-600/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-yellow-400' : 
                      index === 1 ? 'bg-blue-400' : 'bg-green-400'
                    }`} />
                    <span className="text-white font-medium">{item.subject}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-300 font-semibold">{formatTime(item.time)}</div>
                    <div className="text-xs text-slate-500">#{index + 1}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Historial de sesiones */}
        <div className="bg-enterprise-800/30 rounded-lg p-6 border border-enterprise-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Historial Reciente
          </h3>
          <div className="space-y-2">
            {stats.recentSessions.slice(0, 8).map((session, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-enterprise-700/20 rounded-lg border border-enterprise-600/30 hover:bg-enterprise-700/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <div>
                    <div className="text-white font-medium">{session.subject}</div>
                    <div className="text-slate-400 text-sm">{formatDate(session.date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-semibold">{formatTime(session.duration)}</div>
                  <div className="text-slate-500 text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {session.points} pts
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 