// 🍅 Tipos para el Sistema de Estudio Personalizado

export interface PomodoroSettings {
  // Configuración básica
  studyTime: number; // minutos (default: 25)
  shortBreakTime: number; // minutos (default: 5)
  longBreakTime: number; // minutos (default: 15)
  longBreakInterval: number; // cada cuántos ciclos (default: 4)
  
  // Configuración de sonidos
  soundsEnabled: boolean;
  volume: number; // 0-1
  

  
  // Configuración de auto-start
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface PomodoroCycle {
  id: string;
  type: 'study' | 'shortBreak' | 'longBreak';
  duration: number; // minutos
  timeRemaining: number; // segundos
  isActive: boolean;
  isCompleted: boolean;
  startTime?: Date;
  endTime?: Date;
  objectives?: string[];
}

export interface PomodoroSession {
  id: string;
  subject: string; // materia (ej: "Biología")
  totalTime: number; // tiempo total disponible en minutos
  cycles: PomodoroCycle[];
  currentCycleIndex: number;
  status: 'setup' | 'active' | 'paused' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  totalStudyTime: number; // tiempo total de estudio efectivo
  totalBreakTime: number; // tiempo total de descanso
  completedCycles: number;
  points: number; // puntos ganados
}

export interface PomodoroStats {
  // Estadísticas generales
  totalSessions: number;
  totalStudyTime: number; // minutos
  totalBreakTime: number; // minutos
  averageSessionLength: number; // minutos
  completionRate: number; // porcentaje
  
  // Rachas y logros
  currentStreak: number; // días consecutivos
  longestStreak: number; // días consecutivos más larga
  totalPoints: number;
  level: number;
  
  // Estadísticas por materia
  subjectStats: {
    [subject: string]: {
      sessions: number;
      totalTime: number;
      averageTime: number;
    };
  };
  
  // Historial de sesiones
  recentSessions: {
    date: string;
    subject: string;
    duration: number;
    completed: boolean;
    points: number;
  }[];
}

export interface PomodoroAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
  target: number; // objetivo para desbloquear
  type: 'streak' | 'time' | 'sessions' | 'points';
}

export interface PomodoroObjective {
  id: string;
  text: string;
  cycleId: string;
  completed: boolean;
  type: 'reading' | 'practice' | 'review' | 'quiz';
}

export interface PomodoroNotification {
  type: 'cycle_start' | 'cycle_end' | 'break_start' | 'break_end' | 'session_complete';
  title: string;
  message: string;
  sound?: string;
  duration?: number;
}

// Estados del timer
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

// Fases del estudio
export type PomodoroPhase = 'setup' | 'study' | 'shortBreak' | 'longBreak' | 'completed';

// Configuración por defecto
export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  studyTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  soundsEnabled: true,
  volume: 0.5,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

// Materias predefinidas
export const PREDEFINED_SUBJECTS = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Historia',
  'Geografía',
  'Literatura',
  'Inglés',
  'Programación',
  'Diseño',
  'Música',
  'Arte',
  'Filosofía',
  'Psicología',
  'Economía',
  'Otro'
];

// Logros predefinidos
export const POMODORO_ACHIEVEMENTS: Omit<PomodoroAchievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_session',
    name: 'Primer Paso',
    description: 'Completa tu primera sesión de estudio',
    icon: '🎯',
    target: 1,
    type: 'sessions'
  },
  {
    id: 'streak_3',
    name: 'Constancia',
    description: 'Estudia 3 días consecutivos',
    icon: '🔥',
    target: 3,
    type: 'streak'
  },
  {
    id: 'streak_7',
    name: 'Semana de Éxito',
    description: 'Estudia 7 días consecutivos',
    icon: '🌟',
    target: 7,
    type: 'streak'
  },
  {
    id: 'streak_30',
    name: 'Maestro del Tiempo',
    description: 'Estudia 30 días consecutivos',
    icon: '👑',
    target: 30,
    type: 'streak'
  },
  {
    id: 'total_time_10',
    name: 'Dedicación',
    description: 'Acumula 10 horas de estudio',
    icon: '⏰',
    target: 600, // 10 horas en minutos
    type: 'time'
  },
  {
    id: 'total_time_50',
    name: 'Experto',
    description: 'Acumula 50 horas de estudio',
    icon: '🎓',
    target: 3000, // 50 horas en minutos
    type: 'time'
  },
  {
    id: 'sessions_10',
    name: 'Persistente',
    description: 'Completa 10 sesiones',
    icon: '📚',
    target: 10,
    type: 'sessions'
  },
  {
    id: 'sessions_100',
    name: 'Veterano',
    description: 'Completa 100 sesiones',
    icon: '🏆',
    target: 100,
    type: 'sessions'
  }
]; 