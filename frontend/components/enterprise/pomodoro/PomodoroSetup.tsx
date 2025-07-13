'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PREDEFINED_SUBJECTS, PomodoroSettings, DEFAULT_POMODORO_SETTINGS } from './types';
import { Play, Bell, Trophy } from 'lucide-react';
import { pomodoroService } from './PomodoroService';
import { useEffect, useState } from 'react';

interface PomodoroSetupProps {
  onStartSession: (subject: string, totalTime: number, settings: PomodoroSettings) => void;
  onShowStats?: () => void;
}

interface FormValues {
  subject: string;
  totalTime: number;
  studyTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
}

export function PomodoroSetup({ onStartSession, onShowStats }: PomodoroSetupProps) {
  const [stats, setStats] = useState<any>(null);
  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      subject: PREDEFINED_SUBJECTS[0],
      totalTime: 90,
      studyTime: DEFAULT_POMODORO_SETTINGS.studyTime,
      shortBreakTime: DEFAULT_POMODORO_SETTINGS.shortBreakTime,
      longBreakTime: DEFAULT_POMODORO_SETTINGS.longBreakTime,
      longBreakInterval: DEFAULT_POMODORO_SETTINGS.longBreakInterval,
    },
  });

  const subject = watch('subject');
  const totalTime = watch('totalTime');
  const studyTime = watch('studyTime');
  const shortBreakTime = watch('shortBreakTime');
  const longBreakTime = watch('longBreakTime');
  const longBreakInterval = watch('longBreakInterval');

  // Cargar estadísticas
  useEffect(() => {
    const statsData = pomodoroService.getStats();
    setStats(statsData);
  }, []);

  // Calcular ciclos sugeridos
  const cycles = [];
  let remaining = totalTime;
  let cycleNum = 1;
  while (remaining >= studyTime + shortBreakTime) {
    cycles.push({
      type: 'study',
      duration: studyTime,
      label: `Ciclo ${cycleNum}: Estudio (${studyTime} min)`
    });
    remaining -= studyTime;
    if (remaining >= shortBreakTime) {
      cycles.push({
        type: 'shortBreak',
        duration: shortBreakTime,
        label: `Descanso (${shortBreakTime} min)`
      });
      remaining -= shortBreakTime;
    }
    if (cycleNum % longBreakInterval === 0 && remaining >= longBreakTime) {
      cycles.push({
        type: 'longBreak',
        duration: longBreakTime,
        label: `Descanso Largo (${longBreakTime} min)`
      });
      remaining -= longBreakTime;
    }
    cycleNum++;
  }
  if (remaining > 0) {
    cycles.push({
      type: 'study',
      duration: remaining,
      label: `Ciclo final: Estudio (${remaining} min)`
    });
  }

  return (
    <div className="w-[85vw] h-[85vh] flex flex-row items-center justify-center p-2 gap-6 bg-enterprise-900 mt-4 mb-4">
      {/* Formulario (60%) */}
      <form
        className="flex-[6] h-full flex flex-col justify-between bg-enterprise-900/80 rounded-none shadow-2xl p-6 border border-enterprise-700/40"
        onSubmit={handleSubmit((data) => {
          onStartSession(data.subject, data.totalTime, {
            studyTime: data.studyTime,
            shortBreakTime: data.shortBreakTime,
            longBreakTime: data.longBreakTime,
            longBreakInterval: data.longBreakInterval,
            soundsEnabled: true,
            volume: 0.5,
            autoStartBreaks: false,
            autoStartPomodoros: false,
          });
        })}
      >
        {/* Título con icono */}
        <div className="flex items-center gap-2 mb-6 mt-0">
          <span className="w-9 h-9 rounded-none bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight drop-shadow-sm">Configura tu sesión</h2>
            <p className="text-xs text-slate-400">Personaliza tu experiencia de estudio</p>
          </div>
        </div>
        <div className="flex flex-col flex-1 justify-center">
          {/* Sección superior: materia y tiempo total */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col">
                <label className="text-slate-200 font-semibold text-xs mb-2">Materia</label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ej: Biología, Matemáticas, ..."
                      className="rounded-none p-3 bg-enterprise-800/80 text-white focus:outline-none border border-enterprise-700/60 placeholder:text-slate-400 text-sm shadow-inner transition-all focus:border-blue-500/50"
                      autoComplete="off"
                      maxLength={40}
                    />
                  )}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-slate-200 font-semibold text-xs mb-2">
                  ¿Cuánto tiempo tienes hoy? <span className="text-xs text-slate-400">(min)</span>
                </label>
                <Controller
                  name="totalTime"
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="number" 
                      min={15} 
                      max={300} 
                      step={5} 
                      {...field} 
                                             className="rounded-none p-3 bg-enterprise-800/80 text-white focus:outline-none border border-enterprise-700/60 text-sm shadow-inner transition-all focus:border-blue-500/50" 
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sección inferior: configuración de ciclos */}
          <div className="mb-6">
            <h3 className="text-slate-200 font-bold text-xs mb-4 text-center">Configuración de ciclos</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="flex flex-col">
                <label className="text-slate-200 font-semibold text-xs mb-2 text-center">
                  Estudio <span className="text-xs text-slate-400">(min)</span>
                </label>
                <Controller
                  name="studyTime"
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="number" 
                      min={10} 
                      max={60} 
                      step={5} 
                      {...field} 
                      className="rounded-none p-2 bg-enterprise-800/80 text-white focus:outline-none border border-enterprise-700/60 text-sm shadow-inner transition-all focus:border-blue-500/50 text-center" 
                    />
                  )}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-slate-200 font-semibold text-xs mb-2 text-center">
                  Descanso <span className="text-xs text-slate-400">(min)</span>
                </label>
                <Controller
                  name="shortBreakTime"
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="number" 
                      min={3} 
                      max={15} 
                      step={1} 
                      {...field} 
                      className="rounded-none p-2 bg-enterprise-800/80 text-white focus:outline-none border border-enterprise-700/60 text-sm shadow-inner transition-all focus:border-blue-500/50 text-center" 
                    />
                  )}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-slate-200 font-semibold text-xs mb-2 text-center">
                  Descanso largo <span className="text-xs text-slate-400">(min)</span>
                </label>
                <Controller
                  name="longBreakTime"
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="number" 
                      min={10} 
                      max={30} 
                      step={1} 
                      {...field} 
                      className="rounded-none p-2 bg-enterprise-800/80 text-white focus:outline-none border border-enterprise-700/60 text-sm shadow-inner transition-all focus:border-blue-500/50 text-center" 
                    />
                  )}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-slate-200 font-semibold text-xs mb-2 text-center">
                  Intervalo <span className="text-xs text-slate-400">(ciclos)</span>
                </label>
                <Controller
                  name="longBreakInterval"
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="number" 
                      min={2} 
                      max={8} 
                      step={1} 
                      {...field} 
                      className="rounded-none p-2 bg-enterprise-800/80 text-white focus:outline-none border border-enterprise-700/60 text-sm shadow-inner transition-all focus:border-blue-500/50 text-center" 
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Botón alineado abajo a la derecha */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-none text-sm transition-all shadow-xl border-2 border-blue-400/20 hover:shadow-2xl transform hover:scale-105"
          >
            <Play className="w-4 h-4" />
            Iniciar sesión
          </button>
        </div>
      </form>

      {/* Columna derecha: estadísticas y vista previa (30%) */}
      <div className="flex-[4] flex flex-col gap-4 h-full">
        {/* Card de estadísticas - mejorada */}
        {onShowStats && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-none p-3 border border-yellow-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group flex-shrink-0 h-[120px] hover:border-yellow-400/50 hover:from-yellow-500/30 hover:to-orange-500/30"
               onClick={onShowStats}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-none bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:from-yellow-400 group-hover:to-orange-500">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-slate-200 transition-colors">Mis Estadísticas</h3>
                <p className="text-xs text-slate-400">Seguimiento de tu progreso</p>
              </div>
            </div>
            <div className="flex-1 flex items-end justify-center mt-4">
              <div className="bg-yellow-500/10 group-hover:bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30 group-hover:border-yellow-400/50 transition-all mb-2">
                <p className="text-yellow-300 text-xs text-center font-medium group-hover:text-yellow-200 transition-colors flex items-center gap-1">
                  <span>Ver estadísticas completas</span>
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vista previa del plan - mejorada */}
        <div className="bg-gradient-to-br from-enterprise-800/70 to-enterprise-700/50 rounded-none p-3 border border-enterprise-700/40 flex-1 overflow-hidden hover:border-blue-500/30 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-none bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight drop-shadow-sm group-hover:text-slate-200 transition-colors">Vista previa del plan</h3>
              <p className="text-xs text-slate-400">Tu secuencia de estudio</p>
            </div>
          </div>
          <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent" style={{ maxHeight: 'calc(100% - 2.5rem)' }}>
            <ul className="space-y-1.5 text-slate-200">
              {cycles.map((cycle, idx) => (
                <li key={idx} className={`flex items-center gap-2 py-1 hover:bg-enterprise-700/20 rounded px-2 -mx-2 transition-colors ${
                  cycle.type === 'study' ? 'text-blue-400 font-semibold' : 
                  cycle.type === 'shortBreak' ? 'text-green-400' : 'text-purple-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    cycle.type === 'study' ? 'bg-blue-400' : 
                    cycle.type === 'shortBreak' ? 'bg-green-400' : 'bg-purple-400'
                  }`}></div>
                  <span className="leading-tight text-xs">{cycle.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 