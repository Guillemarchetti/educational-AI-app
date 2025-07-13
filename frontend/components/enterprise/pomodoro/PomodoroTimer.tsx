'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw
} from 'lucide-react';
import { TimerState, PomodoroPhase, PomodoroCycle } from './types';

interface PomodoroTimerProps {
  currentCycle: PomodoroCycle;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
  onComplete: () => void;
  onBack?: () => void;
  settings: {
    soundsEnabled: boolean;
    volume: number;
  };
  onToggleSound: () => void;
}

export function PomodoroTimer({
  currentCycle,
  onStart,
  onPause,
  onResume,
  onSkip,
  onReset,
  onComplete,
  onBack,
  settings,
  onToggleSound
}: PomodoroTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(currentCycle.timeRemaining);
  const [timerState, setTimerState] = useState<TimerState>('idle');

  // Calcular progreso para la animación circular
  const totalSeconds = currentCycle.duration * 60;
  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 90; // Radio del círculo
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Formatear tiempo para mostrar
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Obtener color según el tipo de ciclo
  const getCycleColor = (): string => {
    switch (currentCycle.type) {
      case 'study':
        return '#60A5FA'; // Azul más brillante
      case 'shortBreak':
        return '#34D399'; // Verde más brillante
      case 'longBreak':
        return '#A78BFA'; // Púrpura más brillante
      default:
        return '#6B7280'; // Gris
    }
  };

  // Obtener color de gradiente para el fondo
  const getCycleGradient = (): string => {
    switch (currentCycle.type) {
      case 'study':
        return 'from-blue-500/20 to-blue-600/30';
      case 'shortBreak':
        return 'from-green-500/20 to-green-600/30';
      case 'longBreak':
        return 'from-purple-500/20 to-purple-600/30';
      default:
        return 'from-gray-500/20 to-gray-600/30';
    }
  };

  // Obtener texto del tipo de ciclo
  const getCycleText = (): string => {
    switch (currentCycle.type) {
      case 'study':
        return 'Estudio';
      case 'shortBreak':
        return 'Descanso Corto';
      case 'longBreak':
        return 'Descanso Largo';
      default:
        return 'Estudio';
    }
  };

  // Obtener icono según el tipo de ciclo
  const getCycleIcon = (): string => {
    switch (currentCycle.type) {
      case 'study':
        return '📚';
      case 'shortBreak':
        return '☕';
      case 'longBreak':
        return '🛋️';
      default:
        return '🍅';
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerState('completed');
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState, timeRemaining, onComplete]);

  // Actualizar tiempo cuando cambia el ciclo (solo si es un ciclo diferente)
  const [currentCycleId, setCurrentCycleId] = useState(currentCycle.id);
  
  useEffect(() => {
    // Solo resetear si es realmente un ciclo diferente (diferente ID)
    if (currentCycleId !== currentCycle.id) {
      setTimeRemaining(currentCycle.timeRemaining);
      setCurrentCycleId(currentCycle.id);
      setTimerState(currentCycle.isActive ? 'running' : 'idle');
    }
  }, [currentCycle.id, currentCycle.timeRemaining, currentCycle.isActive, currentCycleId]);

  // Handlers
  const handleStart = () => {
    setTimerState('running');
    onStart();
  };

  const handlePause = () => {
    setTimerState('paused');
    onPause();
  };

  const handleResume = () => {
    setTimerState('running');
    onResume();
  };

  const handleSkip = () => {
    setTimerState('idle');
    onSkip();
  };

  const handleReset = () => {
    setTimeRemaining(currentCycle.duration * 60);
    setTimerState('idle');
    onReset();
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-none px-4 pt-8 pb-12 border border-blue-500/30 mx-4 my-2 relative">
      {/* Botón de regreso */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-none bg-gray-700/50 hover:bg-gray-600/70 text-white transition-colors group"
          title="Volver al setup"
        >
          <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      )}

      {/* Header */}
      <motion.div 
        className="text-center mb-1 md:mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-lg md:text-xl font-bold text-white mb-1">
          {getCycleIcon()} {getCycleText()}
        </h1>
        <p className="text-gray-300 text-xs md:text-sm">
          {currentCycle.duration} minutos
        </p>
      </motion.div>

      {/* Timer Circular */}
      <div className="relative mb-1 md:mb-2 flex-shrink-0 flex items-center justify-center w-full">
        {/* Fondo con gradiente que cambia según el tipo de ciclo */}
        <div className={`absolute inset-0 max-w-sm mx-auto aspect-square rounded-full bg-gradient-to-br ${getCycleGradient()} ${timerState === 'running' ? 'animate-pulse' : ''}`} style={{maxWidth:'200px'}}></div>
        
        <svg className="w-full max-w-sm h-auto aspect-square mx-auto relative z-10" style={{maxWidth:'200px'}} viewBox="0 0 200 200">
          {/* Círculo de fondo */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#374151"
            strokeWidth="8"
            fill="transparent"
            className="opacity-30"
          />
          {/* Círculo de progreso con efectos mejorados */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            stroke={getCycleColor()}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={`drop-shadow-lg ${timerState === 'running' ? 'animate-pulse' : ''}`}
            style={{
              filter: timerState === 'running' ? `drop-shadow(0 0 8px ${getCycleColor()})` : 'none'
            }}
          />
        </svg>
        {/* Tiempo en el centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="text-center"
            key={timeRemaining}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className={`text-2xl md:text-3xl lg:text-4xl font-bold font-mono mb-1 md:mb-2`}
              style={{
                color: getCycleColor()
              }}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-gray-300 text-xs md:text-sm">
              {Math.round(progress)}% completado
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controles distribuidos horizontalmente */}
      <div className="w-full flex items-center justify-center gap-2 md:gap-4 mb-1 md:mb-2">
        {/* Lado izquierdo: Reset */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Botón de Reset */}
          <motion.button
            onClick={handleReset}
            className="p-2 md:p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4 md:w-6 md:h-6" />
          </motion.button>
        </div>

        {/* Botón Principal (Start/Pause/Resume) */}
        <motion.button
          onClick={timerState === 'running' ? handlePause : timerState === 'paused' ? handleResume : handleStart}
          className={`p-4 md:p-6 rounded-full text-white transition-colors ${
            timerState === 'running' 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={timerState === 'running' ? 'Pausar' : timerState === 'paused' ? 'Reanudar' : 'Iniciar'}
        >
          <AnimatePresence mode="wait">
            {timerState === 'running' ? (
              <motion.div
                key="pause"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Pause className="w-6 h-6 md:w-8 md:h-8" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Play className="w-6 h-6 md:w-8 md:h-8" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Lado derecho: Skip */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Botón de Skip */}
          <motion.button
            onClick={handleSkip}
            className="p-2 md:p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Saltar ciclo"
          >
            <SkipForward className="w-4 h-4 md:w-6 md:h-6" />
          </motion.button>
        </div>
      </div>

      {/* Estado del timer */}
      <motion.div 
        className="mt-1 md:mt-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`inline-flex items-center px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium ${
          timerState === 'running' 
            ? 'bg-green-100 text-green-800' 
            : timerState === 'paused' 
            ? 'bg-yellow-100 text-yellow-800' 
            : timerState === 'completed' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1.5 md:mr-2 ${
            timerState === 'running' 
              ? 'bg-green-500 animate-pulse' 
              : timerState === 'paused' 
              ? 'bg-yellow-500' 
              : timerState === 'completed' 
              ? 'bg-blue-500' 
              : 'bg-gray-500'
          }`} />
          {timerState === 'running' && 'En progreso'}
          {timerState === 'paused' && 'Pausado'}
          {timerState === 'completed' && 'Completado'}
          {timerState === 'idle' && 'Listo para iniciar'}
        </div>
      </motion.div>
    </div>
  );
} 