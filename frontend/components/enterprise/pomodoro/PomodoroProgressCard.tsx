'use client';

import React from 'react';
import { PomodoroCycle } from './types';

interface PomodoroProgressCardProps {
  cycles: PomodoroCycle[];
  currentCycleIndex: number;
}

export function PomodoroProgressCard({ cycles, currentCycleIndex }: PomodoroProgressCardProps) {
  const completedCycles = cycles.filter(cycle => cycle.isCompleted);
  const studyCycles = cycles.filter(cycle => cycle.type === 'study');
  const completedStudyCycles = completedCycles.filter(cycle => cycle.type === 'study');
  const remainingStudyCycles = studyCycles.length - completedStudyCycles.length;

  const getCycleIcon = (cycle: PomodoroCycle, index: number) => {
    const isCompleted = cycle.isCompleted;
    const isCurrent = index === currentCycleIndex;
    
    let colorClass = '';
    let borderClass = '';
    
    switch (cycle.type) {
      case 'study':
        if (isCompleted) {
          colorClass = 'bg-blue-500';
        } else if (isCurrent) {
          colorClass = 'bg-blue-400 animate-pulse';
        } else {
          colorClass = 'bg-gray-700';
          borderClass = 'border-2 border-blue-400';
        }
        break;
      case 'shortBreak':
        if (isCompleted) {
          colorClass = 'bg-green-500';
        } else if (isCurrent) {
          colorClass = 'bg-green-400 animate-pulse';
        } else {
          colorClass = 'bg-gray-700';
          borderClass = 'border-2 border-green-400';
        }
        break;
      case 'longBreak':
        if (isCompleted) {
          colorClass = 'bg-purple-500';
        } else if (isCurrent) {
          colorClass = 'bg-purple-400 animate-pulse';
        } else {
          colorClass = 'bg-gray-700';
          borderClass = 'border-2 border-purple-400';
        }
        break;
    }

    return (
      <div
        key={index}
        className={`w-4 h-4 rounded-full ${colorClass} ${borderClass} transition-all duration-300`}
        title={`${cycle.type === 'study' ? 'Estudio' : cycle.type === 'shortBreak' ? 'Descanso' : 'Descanso largo'} - ${cycle.duration} min`}
      />
    );
  };

  return (
    <div className="w-full h-full bg-enterprise-800 border border-enterprise-700 rounded-lg p-2 shadow-lg flex flex-col">
      <div className="flex items-center gap-2 mb-1 flex-shrink-0">
        <div className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-xs font-medium text-slate-300">Progreso</span>
      </div>
      
      {/* Progreso visual con bolitas */}
      <div className="flex flex-wrap gap-1 mb-1 flex-shrink-0 justify-center">
        {cycles.map((cycle, index) => getCycleIcon(cycle, index))}
      </div>
      
      {/* Texto informativo */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className="text-xs text-slate-400 text-center leading-tight">
          {remainingStudyCycles > 0 ? (
            <>Quedan <span className="text-blue-400 font-semibold">{remainingStudyCycles}</span> ciclos</>
          ) : (
            <span className="text-green-400 font-semibold">¡Completado!</span>
          )}
        </p>
      </div>
    </div>
  );
} 