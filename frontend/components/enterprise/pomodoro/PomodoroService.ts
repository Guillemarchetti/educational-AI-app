// 🍅 StudyService - Lógica de negocio y persistencia local

import { 
  PomodoroSession, 
  PomodoroStats, 
  PomodoroAchievement, 
  PomodoroSettings,
  POMODORO_ACHIEVEMENTS,
  DEFAULT_POMODORO_SETTINGS
} from './types';

// Claves para localStorage
const STORAGE_KEYS = {
  SESSIONS: 'pomodoro_sessions',
  STATS: 'pomodoro_stats',
  ACHIEVEMENTS: 'pomodoro_achievements',
  SETTINGS: 'pomodoro_settings',
  USER_PREFERENCES: 'pomodoro_user_preferences'
};

// Datos mockeados para testing
const MOCK_SESSIONS: Omit<PomodoroSession, 'cycles'>[] = [
  {
    id: "1",
    subject: "Matemáticas",
    totalTime: 90,
    startTime: new Date("2024-01-15T10:00:00"),
    endTime: new Date("2024-01-15T11:30:00"),
    currentCycleIndex: 0,
    status: "completed",
    totalStudyTime: 75,
    totalBreakTime: 15,
    completedCycles: 3,
    points: 150
  },
  {
    id: "2",
    subject: "Física",
    totalTime: 60,
    startTime: new Date("2024-01-16T14:00:00"),
    endTime: new Date("2024-01-16T15:00:00"),
    currentCycleIndex: 0,
    status: "completed",
    totalStudyTime: 50,
    totalBreakTime: 10,
    completedCycles: 2,
    points: 100
  },
  {
    id: "3",
    subject: "Matemáticas",
    totalTime: 120,
    startTime: new Date("2024-01-17T09:00:00"),
    endTime: new Date("2024-01-17T11:00:00"),
    currentCycleIndex: 0,
    status: "completed",
    totalStudyTime: 100,
    totalBreakTime: 20,
    completedCycles: 4,
    points: 200
  },
  {
    id: "4",
    subject: "Química",
    totalTime: 45,
    startTime: new Date("2024-01-18T16:00:00"),
    endTime: new Date("2024-01-18T16:45:00"),
    currentCycleIndex: 0,
    status: "completed",
    totalStudyTime: 37,
    totalBreakTime: 8,
    completedCycles: 1,
    points: 75
  },
  {
    id: "5",
    subject: "Biología",
    totalTime: 75,
    startTime: new Date("2024-01-19T13:00:00"),
    endTime: new Date("2024-01-19T14:15:00"),
    currentCycleIndex: 0,
    status: "completed",
    totalStudyTime: 62,
    totalBreakTime: 13,
    completedCycles: 2,
    points: 125
  }
];

const MOCK_STATS: PomodoroStats = {
  totalSessions: 25,
  totalStudyTime: 1800, // 30 horas
  totalBreakTime: 300,  // 5 horas
  averageSessionLength: 72, // minutos
  completionRate: 92, // porcentaje
  
  currentStreak: 7,     // 7 días consecutivos
  longestStreak: 15,    // 15 días
  totalPoints: 2500,
  level: 8,
  
  subjectStats: {
    "Matemáticas": {
      sessions: 12,
      totalTime: 900,
      averageTime: 75
    },
    "Física": {
      sessions: 8,
      totalTime: 600,
      averageTime: 75
    },
    "Química": {
      sessions: 3,
      totalTime: 225,
      averageTime: 75
    },
    "Biología": {
      sessions: 2,
      totalTime: 150,
      averageTime: 75
    }
  },
  
  recentSessions: [
    { date: "2024-01-19", subject: "Biología", duration: 75, completed: true, points: 125 },
    { date: "2024-01-18", subject: "Química", duration: 45, completed: true, points: 75 },
    { date: "2024-01-17", subject: "Matemáticas", duration: 120, completed: true, points: 200 },
    { date: "2024-01-16", subject: "Física", duration: 60, completed: true, points: 100 },
    { date: "2024-01-15", subject: "Matemáticas", duration: 90, completed: true, points: 150 }
  ]
};

const MOCK_ACHIEVEMENTS: PomodoroAchievement[] = [
  {
    id: "first_session",
    name: "Primer Paso",
    description: "Completa tu primera sesión de estudio",
    icon: "🎯",
    unlocked: true,
    unlockedAt: new Date("2024-01-01"),
    progress: 100,
    target: 1,
    type: "sessions"
  },
  {
    id: "streak_3",
    name: "Constancia",
    description: "Estudia 3 días consecutivos",
    icon: "🔥",
    unlocked: true,
    unlockedAt: new Date("2024-01-03"),
    progress: 100,
    target: 3,
    type: "streak"
  },
  {
    id: "streak_7",
    name: "Semana de Éxito",
    description: "Estudia 7 días consecutivos",
    icon: "🌟",
    unlocked: true,
    unlockedAt: new Date("2024-01-07"),
    progress: 100,
    target: 7,
    type: "streak"
  },
  {
    id: "streak_30",
    name: "Maestro del Tiempo",
    description: "Estudia 30 días consecutivos",
    icon: "👑",
    unlocked: false,
    progress: 23, // 23 de 30 días
    target: 30,
    type: "streak"
  },
  {
    id: "total_time_10",
    name: "Dedicación",
    description: "Acumula 10 horas de estudio",
    icon: "⏰",
    unlocked: true,
    unlockedAt: new Date("2024-01-10"),
    progress: 100,
    target: 600,
    type: "time"
  },
  {
    id: "total_time_50",
    name: "Experto",
    description: "Acumula 50 horas de estudio",
    icon: "🎓",
    unlocked: false,
    progress: 60, // 30 horas de 50
    target: 3000,
    type: "time"
  },
  {
    id: "sessions_10",
    name: "Persistente",
    description: "Completa 10 sesiones",
    icon: "📚",
    unlocked: true,
    unlockedAt: new Date("2024-01-12"),
    progress: 100,
    target: 10,
    type: "sessions"
  },
  {
    id: "sessions_100",
    name: "Veterano",
    description: "Completa 100 sesiones",
    icon: "🏆",
    unlocked: false,
    progress: 25, // 25 de 100 sesiones
    target: 100,
    type: "sessions"
  }
];

export class PomodoroService {
  private static instance: PomodoroService;

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): PomodoroService {
    if (!PomodoroService.instance) {
      PomodoroService.instance = new PomodoroService();
    }
    return PomodoroService.instance;
  }

  // Inicializar datos mockeados si no existen
  private initializeMockData(): void {
    if (!this.getSessions().length) {
      this.saveSessions(MOCK_SESSIONS as PomodoroSession[]);
    }
    
    if (!this.getStats()) {
      this.saveStats(MOCK_STATS);
    }
    
    if (!this.getAchievements().length) {
      this.saveAchievements(MOCK_ACHIEVEMENTS);
    }
  }

  // ===== PERSISTENCIA LOCAL =====
  
  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }

  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  // ===== SESIONES =====
  
  public saveSession(session: PomodoroSession): void {
    const sessions = this.getSessions();
    sessions.push(session);
    this.saveSessions(sessions);
    this.updateStats(session);
    this.checkAchievements(session);
  }

  public getSessions(): PomodoroSession[] {
    return this.getFromStorage<PomodoroSession[]>(STORAGE_KEYS.SESSIONS, []);
  }

  private saveSessions(sessions: PomodoroSession[]): void {
    this.saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
  }

  // ===== ESTADÍSTICAS =====
  
  public getStats(): PomodoroStats | null {
    return this.getFromStorage<PomodoroStats | null>(STORAGE_KEYS.STATS, null);
  }

  private saveStats(stats: PomodoroStats): void {
    this.saveToStorage(STORAGE_KEYS.STATS, stats);
  }

  private updateStats(session: PomodoroSession): void {
    const stats = this.getStats() || this.createEmptyStats();
    
    // Actualizar estadísticas generales
    stats.totalSessions++;
    stats.totalStudyTime += session.totalStudyTime || 0;
    stats.totalBreakTime += session.totalBreakTime || 0;
    stats.averageSessionLength = Math.round(stats.totalStudyTime / stats.totalSessions);
    stats.totalPoints += session.points || 0;
    
    // Actualizar estadísticas por materia
    if (!stats.subjectStats[session.subject]) {
      stats.subjectStats[session.subject] = { sessions: 0, totalTime: 0, averageTime: 0 };
    }
    stats.subjectStats[session.subject].sessions++;
    stats.subjectStats[session.subject].totalTime += session.totalTime;
    stats.subjectStats[session.subject].averageTime = Math.round(
      stats.subjectStats[session.subject].totalTime / stats.subjectStats[session.subject].sessions
    );
    
    // Actualizar sesiones recientes
    const recentSession = {
      date: session.startTime.toISOString().split('T')[0],
      subject: session.subject,
      duration: session.totalTime,
      completed: session.status === 'completed',
      points: session.points || 0
    };
    
    stats.recentSessions.unshift(recentSession);
    stats.recentSessions = stats.recentSessions.slice(0, 10); // Mantener solo las 10 más recientes
    
    // Calcular nivel basado en puntos
    stats.level = Math.floor(stats.totalPoints / 100) + 1;
    
    this.saveStats(stats);
  }

  private createEmptyStats(): PomodoroStats {
    return {
      totalSessions: 0,
      totalStudyTime: 0,
      totalBreakTime: 0,
      averageSessionLength: 0,
      completionRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPoints: 0,
      level: 1,
      subjectStats: {},
      recentSessions: []
    };
  }

  // ===== LOGROS =====
  
  public getAchievements(): PomodoroAchievement[] {
    return this.getFromStorage<PomodoroAchievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
  }

  private saveAchievements(achievements: PomodoroAchievement[]): void {
    this.saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  private checkAchievements(session: PomodoroSession): void {
    const achievements = this.getAchievements();
    const stats = this.getStats();
    
    if (!stats) return;

    achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let progress = 0;
      let shouldUnlock = false;

      switch (achievement.type) {
        case 'sessions':
          progress = stats.totalSessions;
          shouldUnlock = progress >= achievement.target;
          break;
        case 'time':
          progress = stats.totalStudyTime;
          shouldUnlock = progress >= achievement.target;
          break;
        case 'streak':
          progress = stats.currentStreak;
          shouldUnlock = progress >= achievement.target;
          break;
        case 'points':
          progress = stats.totalPoints;
          shouldUnlock = progress >= achievement.target;
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        achievement.progress = 100;
        
        // Aquí podrías mostrar una notificación
        this.showAchievementNotification(achievement);
      } else {
        achievement.progress = Math.min(100, (progress / achievement.target) * 100);
      }
    });

    this.saveAchievements(achievements);
  }

  private showAchievementNotification(achievement: PomodoroAchievement): void {
    // Implementar notificación de logro desbloqueado
    console.log(`🎉 ¡Logro desbloqueado: ${achievement.name}!`);
    
    // Aquí podrías usar una librería de notificaciones o crear un toast
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('¡Logro Desbloqueado!', {
        body: achievement.description,
        icon: '/favicon.ico'
      });
    }
  }

  // ===== CONFIGURACIÓN =====
  
  public getSettings(): PomodoroSettings {
    return this.getFromStorage<PomodoroSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_POMODORO_SETTINGS);
  }

  public saveSettings(settings: PomodoroSettings): void {
    this.saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  // ===== UTILIDADES =====
  
  public calculateSessionPoints(session: PomodoroSession): number {
    // Fórmula simple: 10 puntos por ciclo completado + bonus por tiempo
    const basePoints = (session.completedCycles || 0) * 10;
    const timeBonus = Math.floor((session.totalStudyTime || 0) / 5); // 1 punto cada 5 minutos
    return basePoints + timeBonus;
  }

  public getCurrentStreak(): number {
    const sessions = this.getSessions();
    if (!sessions.length) return 0;

    // Ordenar por fecha descendente
    const sortedSessions = sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  }

  public clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Exportar instancia singleton
export const pomodoroService = PomodoroService.getInstance(); 