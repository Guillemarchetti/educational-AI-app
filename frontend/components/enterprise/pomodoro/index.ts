// Componentes principales
export { PomodoroSession } from './PomodoroSession';
export { PomodoroSetup } from './PomodoroSetup';
export { PomodoroTimer } from './PomodoroTimer';
export { PomodoroStats } from './PomodoroStats';

// Servicios
export { pomodoroService } from './PomodoroService';

// Tipos
export type {
  PomodoroCycle,
  PomodoroSettings,
  TimerState,
  PomodoroPhase
} from './types';

// Tipo de sesión (renombrado para evitar conflicto)
export type { PomodoroSession as PomodoroSessionType } from './types';

// Constantes
export {
  PREDEFINED_SUBJECTS,
  DEFAULT_POMODORO_SETTINGS
} from './types'; 