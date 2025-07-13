'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Headphones, Plus, Play, Pause, X, Upload } from 'lucide-react';

export interface PomodoroSoundsProps {
  enabled: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleSound: () => void;
}

export interface SoundEvent {
  type: 'session_start' | 'study_start' | 'break_start' | 'session_complete' | 'cycle_complete';
  message?: string;
}

// Mensajes motivadores por fase
const MOTIVATIONAL_MESSAGES = {
  session_start: [
    "¡Es hora de brillar! 🌟 Vamos a concentrarnos",
    "¡Perfecto! Tu mente está lista para aprender 🧠",
    "¡Comenzamos! Cada minuto cuenta hacia tu éxito 🎯",
    "¡Excelente! Tu futuro yo te agradecerá este esfuerzo 💪",
    "¡Vamos! La constancia es la clave del éxito 🔑"
  ],
  study_start: [
    "🎯 Tiempo de concentración. ¡Tú puedes!",
    "📚 Momento de absorber conocimiento",
    "🧠 Tu cerebro está listo para aprender",
    "⚡ Enfócate en este momento presente",
    "🌟 Cada segundo de estudio te acerca a tu meta"
  ],
  break_start: [
    "🌿 Respira profundo, te lo has ganado",
    "☕ Momento de recargar energías",
    "🧘‍♀️ Relájate, tu mente necesita este descanso",
    "🌸 Estira, hidrátate y prepárate para continuar",
    "💆‍♀️ Descanso merecido, ¡sigue así!"
  ],
  cycle_complete: [
    "🎉 ¡Ciclo completado! Vas por buen camino",
    "✨ ¡Excelente! Un paso más hacia tu objetivo",
    "🏆 ¡Genial! Tu disciplina está dando frutos",
    "🚀 ¡Increíble! Sigues construyendo tu éxito",
    "🎯 ¡Perfecto! Mantén este ritmo ganador"
  ],
  session_complete: [
    "🎊 ¡Sesión completada! Eres imparable",
    "🏅 ¡Felicitaciones! Has demostrado gran disciplina",
    "🌟 ¡Increíble! Tu dedicación es admirable",
    "🎯 ¡Misión cumplida! Cada sesión te hace más fuerte",
    "👏 ¡Excelente trabajo! Tu constancia es inspiradora"
  ]
};

// Playlists sugeridas para Spotify
const SPOTIFY_PLAYLISTS = {
  study: [
    { name: "Deep Focus", id: "37i9dQZF1DWZeKCadgRdKQ", description: "Música instrumental para concentración profunda" },
    { name: "Peaceful Piano", id: "37i9dQZF1DX4sWSpwq3LiO", description: "Piano relajante para estudiar" },
    { name: "Chill Lofi Study Beats", id: "37i9dQZF1DWWQRwui0ExPn", description: "Lo-fi beats perfectos para estudiar" },
    { name: "Classical Essentials", id: "37i9dQZF1DWWEJlAGA9gs0", description: "Clásicos para concentración" },
    { name: "Ambient Chill", id: "37i9dQZF1DX3Ogo9pFox5g", description: "Ambient suave para estudio" }
  ],
  break: [
    { name: "Chill Hits", id: "37i9dQZF1DX0XUsuxWHRQd", description: "Música relajante para descansar" },
    { name: "Nature Sounds", id: "37i9dQZF1DWWQRwui0ExPn", description: "Sonidos de la naturaleza" },
    { name: "Meditation Music", id: "37i9dQZF1DX9RwfGbeGQwP", description: "Música para meditar y relajarse" },
    { name: "Acoustic Chill", id: "37i9dQZF1DX1s9knjP51Oa", description: "Acústico relajante" }
  ]
};

export class PomodoroSoundsManager {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.5;
  private enabled: boolean = true;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlayingMusic: boolean = false;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.loadSounds();
    } catch (error) {
      console.warn('🔊 Audio context not supported:', error);
      // Intentar cargar sonidos sin AudioContext
      this.loadSounds();
    }
  }

  private loadSounds() {
    // Ya no necesitamos cargar archivos de audio
    // Todo se crea sintéticamente con Web Audio API
  }



  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    // El volumen se aplica directamente en los gainNodes de Web Audio API
    
    // También aplicar volumen a la música de playlist (solo si está habilitado)
    if (this.currentAudio && this.enabled) {
      this.currentAudio.volume = this.volume;
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    
    // Silenciar/des-silenciar la música de playlist sin detenerla
    if (this.currentAudio) {
      this.currentAudio.volume = enabled ? this.volume : 0;
    }
  }





  public async playSound(event: SoundEvent) {
    if (!this.enabled) {
      return;
    }

    // Reproducir el sonido correspondiente al tipo de evento
    try {
      await this.playBeep(event.type);
    } catch (error) {
      console.error('🔊 Error reproduciendo sonido:', error);
    }
  }

  private async playBeep(soundType: SoundEvent['type']): Promise<void> {
    return new Promise((resolve) => {
      try {
        // Crear contexto de audio si no existe
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Crear sonidos únicos para cada tipo
        switch (soundType) {
          case 'session_start':
            this.playSessionStart();
            break;
          case 'study_start':
            this.playStudyStart();
            break;
          case 'break_start':
            this.playBreakStart();
            break;
          case 'cycle_complete':
            this.playCycleComplete();
            break;
          case 'session_complete':
            this.playSessionComplete();
            break;
        }

        // Resolver después de un tiempo apropiado
        setTimeout(() => resolve(), 1000);

      } catch (error) {
        console.error('🔊 Error en playBeep:', error);
        resolve();
      }
    });
  }

  // 🍅 Sonido de inicio de sesión - Ascendente motivador
  private playSessionStart(): void {
    const startTime = this.audioContext!.currentTime;
    const frequencies = [440, 523, 659]; // La-Do-Mi (acorde mayor)
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'triangle'; // Sonido más suave
      
      const noteStart = startTime + (index * 0.15);
      const noteDuration = 0.3;
      
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);
      
      oscillator.start(noteStart);
      oscillator.stop(noteStart + noteDuration);
    });
  }

  // 📚 Sonido de estudio - Firme y enfocado
  // 📚 Sonido de inicio de estudio - Melodía ascendente suave y motivadora
  private playStudyStart(): void {
    const startTime = this.audioContext!.currentTime;
    
    // Melodía ascendente suave: Do - Mi - Sol - Do (octava superior)
    const melody = [
      { freq: 261.63, start: 0, duration: 0.15 },    // Do4
      { freq: 329.63, start: 0.12, duration: 0.15 }, // Mi4
      { freq: 392.00, start: 0.24, duration: 0.15 }, // Sol4
      { freq: 523.25, start: 0.36, duration: 0.25 }  // Do5 (más largo para finalizar)
    ];

    melody.forEach(note => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      // Usar sine wave para un sonido más suave y agradable
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.freq, startTime + note.start);
      
      // Envelope suave con attack y release graduales
      const noteStart = startTime + note.start;
      const noteEnd = noteStart + note.duration;
      
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.35, noteStart + 0.03);
      gainNode.gain.setValueAtTime(this.volume * 0.35, noteEnd - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, noteEnd);
      
      oscillator.start(noteStart);
      oscillator.stop(noteEnd);
    });
  }

  // ☕ Sonido de descanso - Descendente relajante
  private playBreakStart(): void {
    const startTime = this.audioContext!.currentTime;
    const frequencies = [523, 440, 349]; // Do-La-Fa (descendente)
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine'; // Sonido suave
      
      const noteStart = startTime + (index * 0.2);
      const noteDuration = 0.4;
      
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, noteStart + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);
      
      oscillator.start(noteStart);
      oscillator.stop(noteStart + noteDuration);
    });
  }

  // ✅ Sonido de ciclo completado - Doble campanada
  private playCycleComplete(): void {
    const startTime = this.audioContext!.currentTime;
    
    // Primera campanada
    this.createBell(startTime, 659, 0.5); // Mi
    // Segunda campanada
    this.createBell(startTime + 0.3, 784, 0.5); // Sol
  }

  // 🎉 Sonido de sesión completada - Fanfarria triunfal
  private playSessionComplete(): void {
    const startTime = this.audioContext!.currentTime;
    const melody = [
      { freq: 523, time: 0.0 },   // Do
      { freq: 659, time: 0.15 },  // Mi
      { freq: 784, time: 0.3 },   // Sol
      { freq: 1047, time: 0.45 }  // Do octava
    ];
    
    melody.forEach(note => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.value = note.freq;
      oscillator.type = 'sawtooth'; // Sonido más brillante
      
      const noteStart = startTime + note.time;
      const noteDuration = 0.25;
      
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);
      
      oscillator.start(noteStart);
      oscillator.stop(noteStart + noteDuration);
    });
  }

  // Función auxiliar para crear sonido de campana
  private createBell(startTime: number, frequency: number, duration: number): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Envelope de campana (ataque rápido, decay lento)
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }





  public getRandomMotivationalMessage(type: keyof typeof MOTIVATIONAL_MESSAGES): string {
    const messages = MOTIVATIONAL_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  public getSpotifyPlaylists(type: 'study' | 'break') {
    return SPOTIFY_PLAYLISTS[type];
  }

  public openSpotifyPlaylist(playlistId: string) {
    // Abrir playlist en Spotify Web Player
    const spotifyUrl = `https://open.spotify.com/playlist/${playlistId}`;
    window.open(spotifyUrl, '_blank');
  }

  // Métodos para playlist personalizada
  public playLocalMusic(file: File | string) {
    // Detener música anterior si existe
    this.stopMusic();
    
    try {
      this.currentAudio = new Audio();
      this.currentAudio.volume = this.enabled ? this.volume : 0;
      this.currentAudio.loop = true;
      
      if (typeof file === 'string') {
        // URL de archivo precargado
        this.currentAudio.src = file;
      } else {
        // Archivo desde PC
        const url = URL.createObjectURL(file);
        this.currentAudio.src = url;
      }
      
      this.currentAudio.play();
      this.isPlayingMusic = true;
      
      // Limpiar URL cuando termine
      this.currentAudio.onended = () => {
        if (typeof file !== 'string') {
          URL.revokeObjectURL(this.currentAudio!.src);
        }
      };
      
    } catch (error) {
      console.error('Error reproduciendo música:', error);
    }
  }

  public stopMusic() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlayingMusic = false;
    }
  }

  public pauseMusic() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPlayingMusic = false;
    }
  }

  public resumeMusic() {
    if (this.currentAudio) {
      this.currentAudio.play();
      this.isPlayingMusic = true;
    }
  }

  public getMusicStatus() {
    return {
      isPlaying: this.isPlayingMusic,
      hasAudio: !!this.currentAudio
    };
  }
}

export function PomodoroSounds({ 
  enabled, 
  volume, 
  onVolumeChange, 
  onToggleSound
}: PomodoroSoundsProps) {


  const [customTracks, setCustomTracks] = useState<Array<{id: string, name: string, file: File}>>([]);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundsManager = useRef<PomodoroSoundsManager | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agregar estilos CSS para scrollbar personalizado
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #374151;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #6B7280;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #9CA3AF;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!soundsManager.current) {
      soundsManager.current = new PomodoroSoundsManager();
    }
    
    const manager = soundsManager.current;
    manager.setVolume(volume);
    manager.setEnabled(enabled);
    
  }, [volume, enabled]);



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newTracks = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name.replace(/\.(mp3|wav|ogg|m4a)$/i, ''),
      file: file
    }));

    setCustomTracks(prev => [...prev, ...newTracks]);
    
    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePlayTrack = (trackId: string) => {
    const track = customTracks.find(t => t.id === trackId);
    if (!track) return;

    if (currentTrack === trackId && isPlaying) {
      soundsManager.current?.pauseMusic();
      setIsPlaying(false);
    } else {
      soundsManager.current?.playLocalMusic(track.file);
      setCurrentTrack(trackId);
      setIsPlaying(true);
    }
  };

  const handleStopTrack = () => {
    soundsManager.current?.stopMusic();
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const handleRemoveTrack = (trackId: string) => {
    setCustomTracks(prev => prev.filter(t => t.id !== trackId));
    if (currentTrack === trackId) {
      handleStopTrack();
    }
  };



  return (
    <div className="bg-enterprise-800/30 rounded-lg p-4 border border-enterprise-700/50 h-full flex flex-col min-h-0 overflow-hidden">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2 flex-shrink-0">
          <Headphones className="w-4 h-4 text-blue-400" />
          Audio
        </h3>
      
      <div className="space-y-3 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Control de sonido */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg transition-colors ${
                enabled 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-enterprise-700 text-slate-400'
              }`}
            >
              {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-sm text-slate-300">Sonidos</span>
          </div>
          
          {enabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Vol</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-enterprise-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-slate-400 w-8">{Math.round(volume * 100)}</span>
            </div>
          )}
        </div>





        {/* Playlist Personalizada */}
        <div className="border-t border-enterprise-700/50 pt-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 flex-shrink-0">
            <Headphones className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-300">Arma tu playlist para estudiar</span>
          </div>

          <div className="space-y-2 flex flex-col min-h-0">
            {/* Botón para agregar música */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                Agregar música
              </button>
              {customTracks.length > 0 && (
                <button
                  onClick={handleStopTrack}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors"
                >
                  <X className="w-3 h-3" />
                  Detener
                </button>
              )}
            </div>

            {/* Lista de canciones con scroll */}
            <div className="min-h-0">
              {customTracks.length > 0 ? (
                <div 
                  className="space-y-1 overflow-y-auto pr-1 border border-enterprise-600/20 rounded p-1 custom-scrollbar" 
                                  style={{
                  maxHeight: '100px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#6B7280 #374151'
                }}
                >
                  {customTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between p-2 rounded bg-enterprise-700/30 hover:bg-enterprise-700/50 transition-colors ${
                        currentTrack === track.id ? 'ring-1 ring-purple-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={() => handlePlayTrack(track.id)}
                          className="flex-shrink-0 p-1 hover:bg-enterprise-600 rounded transition-colors"
                        >
                          {currentTrack === track.id && isPlaying ? (
                            <Pause className="w-3 h-3 text-purple-400" />
                          ) : (
                            <Play className="w-3 h-3 text-purple-400" />
                          )}
                        </button>
                        <span className="text-xs text-white truncate">{track.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveTrack(track.id)}
                        className="flex-shrink-0 p-1 hover:bg-red-600 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs flex items-center justify-center h-full">
                  <div>
                    <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    Haz clic en "Agregar música" para cargar archivos desde tu PC
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

// Hook para usar el sistema de sonidos
export function usePomodoroSounds() {
  const soundsManager = useRef<PomodoroSoundsManager | null>(null);

  useEffect(() => {
    if (!soundsManager.current) {
      soundsManager.current = new PomodoroSoundsManager();
    }
  }, []);

  return {
    playSound: (event: SoundEvent) => soundsManager.current?.playSound(event),
    getMotivationalMessage: (type: keyof typeof MOTIVATIONAL_MESSAGES) => 
      soundsManager.current?.getRandomMotivationalMessage(type),
    getSpotifyPlaylists: (type: 'study' | 'break') => 
      soundsManager.current?.getSpotifyPlaylists(type),
    openSpotifyPlaylist: (playlistId: string) => 
      soundsManager.current?.openSpotifyPlaylist(playlistId)
  };
} 