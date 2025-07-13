'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PomodoroSetup } from './PomodoroSetup';
import { PomodoroTimer } from './PomodoroTimer';
import { PomodoroStats } from './PomodoroStats';
import { PomodoroSounds, usePomodoroSounds } from './PomodoroSounds';
import { PomodoroMotivationalCard } from './PomodoroMotivationalCard';
import { PomodoroProgressCard } from './PomodoroProgressCard';
import { 
  PomodoroSettings, 
  PomodoroCycle, 
  PomodoroSession as SessionType,
  TimerState,
  DEFAULT_POMODORO_SETTINGS
} from './types';

type SessionPhase = 'setup' | 'active' | 'completed' | 'stats';

interface PomodoroSessionProps {
  onSessionComplete?: (session: SessionType) => void;
}

export function PomodoroSession({ onSessionComplete }: PomodoroSessionProps) {
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('setup');
  const [currentSession, setCurrentSession] = useState<SessionType | null>(null);
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');
  
  // Hook de sonidos
  const { playSound, getMotivationalMessage } = usePomodoroSounds();

  // Generar ciclos basados en la configuración
  const generateCycles = useCallback((
    totalTime: number, 
    settings: PomodoroSettings
  ): PomodoroCycle[] => {
    const cycles: PomodoroCycle[] = [];
    let remaining = totalTime;
    let cycleNum = 1;

    while (remaining >= settings.studyTime + settings.shortBreakTime) {
      // Ciclo de estudio
      cycles.push({
        id: `cycle-${cycleNum}-study`,
        type: 'study',
        duration: settings.studyTime,
        timeRemaining: settings.studyTime * 60,
        isActive: false,
        isCompleted: false,
      });
      remaining -= settings.studyTime;

      // Descanso corto
      if (remaining >= settings.shortBreakTime) {
        cycles.push({
          id: `cycle-${cycleNum}-short-break`,
          type: 'shortBreak',
          duration: settings.shortBreakTime,
          timeRemaining: settings.shortBreakTime * 60,
          isActive: false,
          isCompleted: false,
        });
        remaining -= settings.shortBreakTime;
      }

      // Descanso largo cada N ciclos
      if (cycleNum % settings.longBreakInterval === 0 && remaining >= settings.longBreakTime) {
        cycles.push({
          id: `cycle-${cycleNum}-long-break`,
          type: 'longBreak',
          duration: settings.longBreakTime,
          timeRemaining: settings.longBreakTime * 60,
          isActive: false,
          isCompleted: false,
        });
        remaining -= settings.longBreakTime;
      }

      cycleNum++;
    }

    // Tiempo restante como ciclo final
    if (remaining > 0) {
      cycles.push({
        id: `cycle-${cycleNum}-final`,
        type: 'study',
        duration: remaining,
        timeRemaining: remaining * 60,
        isActive: false,
        isCompleted: false,
      });
    }

    return cycles;
  }, []);

  // Iniciar sesión
  const handleStartSession = useCallback((
    subject: string, 
    totalTime: number, 
    sessionSettings: PomodoroSettings
  ) => {
    const cycles = generateCycles(totalTime, sessionSettings);
    
    const newSession: SessionType = {
      id: Date.now().toString(),
      subject,
      totalTime,
      startTime: new Date(),
      cycles,
      currentCycleIndex: 0,
      status: 'active',
      totalStudyTime: 0,
      totalBreakTime: 0,
      completedCycles: 0,
      points: 0,
    };

    setCurrentSession(newSession);
    setSettings(sessionSettings);
    setCurrentCycleIndex(0);
    setSessionPhase('active');
    
    // Reproducir sonido de inicio y mostrar mensaje motivador
    if (sessionSettings.soundsEnabled) {
      playSound({ type: 'session_start' });
    }
    const message = getMotivationalMessage('session_start') || '¡Comenzamos! 🚀';
    setMotivationalMessage(message);
  }, [generateCycles, playSound, getMotivationalMessage]);

  // Manejar eventos del timer
  const handleTimerStart = useCallback(() => {
    if (!currentSession) return;

    const updatedSession = { ...currentSession, status: 'active' as const };
    const updatedCycles = [...updatedSession.cycles];
    updatedCycles[currentCycleIndex] = { 
      ...updatedCycles[currentCycleIndex], 
      isActive: true 
    };
    updatedSession.cycles = updatedCycles;

    setCurrentSession(updatedSession);
    
    // Reproducir sonido según el tipo de ciclo
    const currentCycle = updatedCycles[currentCycleIndex];
    if (settings.soundsEnabled && currentCycle) {
      const soundType = currentCycle.type === 'study' ? 'study_start' : 'break_start';
      playSound({ type: soundType });
      
      const messageType = currentCycle.type === 'study' ? 'study_start' : 'break_start';
      const message = getMotivationalMessage(messageType) || '¡Vamos! 💪';
      setMotivationalMessage(message);
    }
  }, [currentSession, currentCycleIndex, settings.soundsEnabled, playSound, getMotivationalMessage]);

  const handleTimerPause = useCallback(() => {
    if (!currentSession) return;

    const updatedSession = { ...currentSession, status: 'paused' as const };
    const updatedCycles = [...updatedSession.cycles];
    updatedCycles[currentCycleIndex] = { 
      ...updatedCycles[currentCycleIndex], 
      isActive: false 
    };
    updatedSession.cycles = updatedCycles;

    setCurrentSession(updatedSession);
  }, [currentSession, currentCycleIndex]);

  const handleTimerResume = useCallback(() => {
    if (!currentSession) return;

    const updatedSession = { ...currentSession, status: 'active' as const };
    const updatedCycles = [...updatedSession.cycles];
    updatedCycles[currentCycleIndex] = { 
      ...updatedCycles[currentCycleIndex], 
      isActive: true 
    };
    updatedSession.cycles = updatedCycles;

    setCurrentSession(updatedSession);
  }, [currentSession, currentCycleIndex]);

  const handleTimerSkip = useCallback(() => {
    if (!currentSession) return;

    // Marcar ciclo actual como completado
    const updatedCycles = [...currentSession.cycles];
    updatedCycles[currentCycleIndex] = { 
      ...updatedCycles[currentCycleIndex], 
      isCompleted: true,
      isActive: false 
    };

    // Reproducir sonido de ciclo completado
    if (settings.soundsEnabled) {
      playSound({ type: 'cycle_complete' });
      const message = getMotivationalMessage('cycle_complete') || '¡Ciclo completado! 🎉';
      setMotivationalMessage(message);
    }

    // Pasar al siguiente ciclo
    const nextIndex = currentCycleIndex + 1;
    
    if (nextIndex < updatedCycles.length) {
      // Hay más ciclos
      updatedCycles[nextIndex] = { 
        ...updatedCycles[nextIndex], 
        isActive: true 
      };
      
      const updatedSession = {
        ...currentSession,
        cycles: updatedCycles,
        currentCycleIndex: nextIndex,
        status: 'active' as const,
      };
      
      setCurrentSession(updatedSession);
      setCurrentCycleIndex(nextIndex);
    } else {
      // Sesión completada
      const completedSession = {
        ...currentSession,
        cycles: updatedCycles,
        status: 'completed' as const,
        endTime: new Date(),
      };
      
      setCurrentSession(completedSession);
      setSessionPhase('completed');
      
      // Reproducir sonido de sesión completada
      if (settings.soundsEnabled) {
        playSound({ type: 'session_complete' });
        const message = getMotivationalMessage('session_complete') || '¡Sesión completada! 🏆';
        setMotivationalMessage(message);
      }
      
      if (onSessionComplete) {
        onSessionComplete(completedSession);
      }
    }
  }, [currentSession, currentCycleIndex, onSessionComplete, settings.soundsEnabled, playSound, getMotivationalMessage]);

  const handleTimerReset = useCallback(() => {
    if (!currentSession) return;

    const updatedCycles = currentSession.cycles.map(cycle => ({
      ...cycle,
      timeRemaining: cycle.duration * 60,
      isActive: false,
      isCompleted: false,
    }));

    const resetSession = {
      ...currentSession,
      cycles: updatedCycles,
      currentCycleIndex: 0,
      isActive: false,
    };

    setCurrentSession(resetSession);
    setCurrentCycleIndex(0);
  }, [currentSession]);

  const handleTimerComplete = useCallback(() => {
    handleTimerSkip();
  }, [handleTimerSkip]);

  const handleToggleSound = useCallback(() => {
    setSettings(prev => ({ ...prev, soundsEnabled: !prev.soundsEnabled }));
  }, []);



  const handleRestartSession = useCallback(() => {
    setSessionPhase('setup');
    setCurrentSession(null);
    setCurrentCycleIndex(0);
  }, []);

  const handleShowStats = useCallback(() => {
    setSessionPhase('stats');
  }, []);

  const handleBackToSetup = useCallback(() => {
    setSessionPhase('setup');
  }, []);

  const getCurrentCycle = (): PomodoroCycle | null => {
    if (!currentSession || currentCycleIndex >= currentSession.cycles.length) {
      return null;
    }
    return currentSession.cycles[currentCycleIndex];
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {sessionPhase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PomodoroSetup onStartSession={handleStartSession} onShowStats={handleShowStats} />
          </motion.div>
        )}

        {sessionPhase === 'active' && currentSession && getCurrentCycle() && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full max-h-screen overflow-hidden flex flex-col p-4"
          >
            {/* Layout principal con dos columnas */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="w-full max-w-6xl flex gap-6 items-start">
                
                {/* Timer principal - columna central */}
                <div className="flex-1 flex items-center justify-center">
                  <PomodoroTimer
                    currentCycle={getCurrentCycle()!}
                    onStart={handleTimerStart}
                    onPause={handleTimerPause}
                    onResume={handleTimerResume}
                    onSkip={handleTimerSkip}
                    onReset={handleTimerReset}
                    onComplete={handleTimerComplete}
                    onBack={handleBackToSetup}
                    settings={settings}
                    onToggleSound={handleToggleSound}
                  />
                </div>

                {/* Panel lateral con cards apiladas */}
                <div className="w-80 flex flex-col gap-4 h-full">
                  {/* Card de mensajes motivacionales - altura fija pequeña, ajustada al margen del timer */}
                  <div className="flex-shrink-0 mt-2 h-38">
                    <PomodoroMotivationalCard
                      message={motivationalMessage}
                      isVisible={!!motivationalMessage}
                    />
                  </div>
                  
                  {/* Card de sonidos - espacio reducido para hacer lugar a la card de progreso */}
                  <div className="flex-shrink-0 overflow-hidden" style={{ height: 'calc(100% - 9.5rem - 5rem - 1rem)' }}>
                    <PomodoroSounds
                      enabled={settings.soundsEnabled}
                      volume={settings.volume}
                      onVolumeChange={(volume) => setSettings(prev => ({ ...prev, volume }))}
                      onToggleSound={handleToggleSound}
                    />
                  </div>
                  
                  {/* Card de progreso - altura fija pequeña */}
                  <div className="flex-shrink-0 h-20">
                    <PomodoroProgressCard
                      cycles={currentSession.cycles}
                      currentCycleIndex={currentCycleIndex}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {sessionPhase === 'completed' && currentSession && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl px-4 py-8 border border-green-500/30"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-white mb-2">
                ¡Sesión Completada!
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Has completado {currentSession.cycles.length} ciclos de {currentSession.subject}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">
                    {currentSession.totalTime}
                  </div>
                  <div className="text-gray-300">Minutos totales</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">
                    {currentSession.cycles.filter(c => c.type === 'study').length}
                  </div>
                  <div className="text-gray-300">Ciclos de estudio</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">
                    {currentSession.startTime && currentSession.endTime 
                      ? Math.round((currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 60000)
                      : 0
                    }
                  </div>
                  <div className="text-gray-300">Minutos reales</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestartSession}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-xl"
                >
                  Nueva Sesión
                </button>
                <button
                  onClick={handleShowStats}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-xl"
                >
                  Ver Estadísticas
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {sessionPhase === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <PomodoroStats onClose={handleBackToSetup} />
          </motion.div>
        )}
      </AnimatePresence>
      

    </div>
  );
} 