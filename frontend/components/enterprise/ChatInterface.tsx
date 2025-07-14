'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

import { ContextDisplay } from './ContextDisplay'
import { SmartPrompts } from './SmartPrompts'
import { ProgressTracker } from './ProgressTracker'
import { QuizSystem } from './QuizSystem'
import { ImageSelector } from './ImageSelector'
import { ChevronDown, ChevronRight, CheckCircle, Square } from 'lucide-react'

// Definimos la interfaz Message aquí mismo para que el componente sea autocontenido
export interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  agent?: string
}

// Interfaz para el objeto FileNode, debe ser consistente
interface FileNode {
  name: string;
  url: string;
}

interface ChatInterfaceProps {
  contextText: string[];
  onRemoveContext: (index: number) => void;
  isDraggingOver: boolean;
  setIsDraggingOver: (isDragging: boolean) => void;
  onFileDrop: (file: FileNode) => void;
  isExtracting: boolean;
  selectedFile?: { name: string; url: string; id?: string } | null;
  onSendWelcomeMessage?: (message: string) => void;
  messages?: Message[];
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
  isImageSelectionMode?: boolean;
  onToggleImageSelection?: () => void;
  onImageContextAdd?: (imageData: string, description: string) => void;
  showImageSuccessNotification?: boolean;
  showDragInstruction?: boolean;
  showSelectionSuccess?: boolean;
  showContextLoadedNotification?: boolean;
  onHideImageNotifications?: () => void;
  onHideImageSelector?: () => void;
  showProgress?: boolean;
  onToggleProgress?: () => void;
  hideHeaderIcons?: boolean;
}

export function ChatInterface({ 
  contextText, 
  onRemoveContext, 
  isDraggingOver, 
  setIsDraggingOver,
  onFileDrop,
  isExtracting,
  selectedFile,
  onSendWelcomeMessage,
  messages: externalMessages,
  setMessages: externalSetMessages,
  isImageSelectionMode: externalImageSelectionMode,
  onToggleImageSelection: externalToggleImageSelection,
  onImageContextAdd: externalImageContextAdd,
  showImageSuccessNotification,
  showDragInstruction,
  showSelectionSuccess,
  showContextLoadedNotification,
  onHideImageNotifications,
  onHideImageSelector,
  showProgress: externalShowProgress,
  onToggleProgress: externalOnToggleProgress,
  hideHeaderIcons = false,
}: ChatInterfaceProps) {
  const [internalMessages, setInternalMessages] = useState<Message[]>([])
  
  // Usar mensajes externos si están disponibles, si no, usar internos
  const messages = externalMessages || internalMessages;
  const setMessages = externalSetMessages || setInternalMessages;
  const [isProcessing, setIsProcessing] = useState(false)
  // Usar estado externo si está disponible, si no, usar interno
  const showProgress = externalShowProgress !== undefined ? externalShowProgress : false;
  const onToggleProgress = externalOnToggleProgress || (() => {});
  const [showQuiz, setShowQuiz] = useState(false)
  const [showSmartPrompts, setShowSmartPrompts] = useState(false)
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [internalImageSelectionMode, setInternalImageSelectionMode] = useState(false)
  const [isContextOpen, setIsContextOpen] = useState(false)
  const [persistentContext, setPersistentContext] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Usar estado externo si está disponible, si no, usar interno
  const isImageSelectionMode = externalImageSelectionMode !== undefined ? externalImageSelectionMode : internalImageSelectionMode;
  const onToggleImageSelection = externalToggleImageSelection || (() => setInternalImageSelectionMode(!internalImageSelectionMode));
  const onImageContextAdd = externalImageContextAdd || (() => {});

  // Mantener contexto persistente actualizado
  useEffect(() => {
    setPersistentContext(prev => {
      // Solo agregar nuevo contexto que no esté ya en persistentContext
      const newItems = contextText.filter(item => !prev.includes(item))
      const updatedContext = [...prev, ...newItems]
      // Mantener solo los últimos 15 elementos para evitar sobrecarga
      return updatedContext.slice(-15)
    })
  }, [contextText])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Debug: Monitorear cambios en showSmartPrompts
  useEffect(() => {
    console.log('showSmartPrompts cambió a:', showSmartPrompts)
  }, [showSmartPrompts])

  // Debug: Verificar el estado actual
  console.log('Estado actual - showSmartPrompts:', showSmartPrompts, 'isProcessing:', isProcessing)

  // Sonido al recibir mensaje de IA
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'ai') {
      const audio = new Audio('/beep.mp3')
      audio.volume = 0.25
      audio.play()
    }
  }, [messages])

  // Generar mensaje de bienvenida cuando se selecciona un archivo
  useEffect(() => {
    // Generar mensaje de bienvenida cuando se selecciona un archivo y no hay mensajes
    if (selectedFile && messages.length === 0) {
      generateWelcomeMessage();
    }
  }, [selectedFile, messages.length]);

  // Generar mensaje de bienvenida cuando se agrega contexto de un archivo
  useEffect(() => {
    if (contextText.length > 0 && selectedFile) {
      const lastContext = contextText[contextText.length - 1];
      if (lastContext.includes(`Contexto del archivo "${selectedFile.name}"`)) {
        // Solo generar si no hay mensajes o si el último mensaje no es de bienvenida
        if (messages.length === 0 || messages[messages.length - 1].agent !== 'Sistema') {
          generateWelcomeMessage();
        }
      }
    }
  }, [contextText, selectedFile, messages.length]);

  const generateWelcomeMessage = async () => {
    if (!selectedFile) return;

    try {
      // Crear un mensaje de bienvenida personalizado
      const welcomeMessage = `🎓 **¡Bienvenido al análisis de tu material educativo!**

📚 **Documento cargado:** ${selectedFile.name}
📖 **Contexto disponible:** He analizado el contenido de tu documento y estoy listo para ayudarte.

💡 **¿Qué puedo hacer por ti?**
• Explicar conceptos del material
• Resolver dudas específicas
• Crear ejercicios prácticos
• Analizar diagramas o imágenes
• Generar resúmenes
• Comparar temas relacionados

¡Adelante, pregunta lo que necesites! 🚀`;

      // Crear el mensaje directamente en el estado local
      const welcomeMessageObj = {
        id: Date.now(),
        text: welcomeMessage,
        sender: 'ai' as const,
        timestamp: new Date(),
        agent: 'Sistema'
      };
      
      setMessages(prev => [...prev, welcomeMessageObj]);
      
    } catch (error) {
      console.error('Error generando mensaje de bienvenida:', error);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isProcessing) return

    // Ocultar SmartPrompts cuando se envía un mensaje
    console.log('Ocultando SmartPrompts...')
    setShowSmartPrompts(false)
    
    // Ocultar ImageSelector si está visible
    if (showImageSelector) {
      console.log('Ocultando ImageSelector...')
      setShowImageSelector(false)
    }
    
    // Ocultar notificaciones de imagen que puedan estar bloqueando
    if (showDragInstruction || showSelectionSuccess || showImageSuccessNotification) {
      console.log('Ocultando notificaciones de imagen...')
      if (onHideImageNotifications) {
        onHideImageNotifications()
      }
      // También ocultar ImageSelector si está visible
      if (showImageSelector) {
        console.log('Ocultando ImageSelector desde notificaciones...')
        setShowImageSelector(false)
      }
    }
    
    // Forzar actualización inmediata
    setTimeout(() => {
      if (showSmartPrompts) {
        console.log('Forzando ocultar SmartPrompts...')
        setShowSmartPrompts(false)
      }
    }, 0)

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    // Usar contexto persistente + contexto actual
    const allContext = [...persistentContext, ...contextText]
    const contextString = allContext.join('\n\n---\n\n');

    try {
      const response = await fetch('http://localhost:8000/api/agents/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          userId: 'demo-user', // Hardcoded por ahora
          context: contextString, // Enviamos todo el contexto
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        agent: data.agent_name,
      }
      setMessages(prev => [...prev, aiMessage])
      
      // NO limpiar contexto después del envío - mantener memoria
      // contextText.forEach((_, index) => onRemoveContext(index));

    } catch (error) {
      console.error('Error al contactar al agente de IA:', error)
      const errorMessage: Message = {
        id: Date.now() + 1,
        text:
          'Lo siento, hubo un problema de conexión con el servidor. Revisa la consola para más detalles.',
        sender: 'ai',
        timestamp: new Date(),
        agent: 'System',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    try {
      const fileData = e.dataTransfer.getData('application/json');
      if (fileData) {
        const fileNode: FileNode = JSON.parse(fileData);
        onFileDrop(fileNode);
      }
    } catch (error) {
      console.error("Error al procesar el archivo soltado:", error);
    }
  };

  // Limpiar contexto persistente
  const clearPersistentContext = () => {
    setPersistentContext([])
    // También limpiar contexto actual
    contextText.forEach((_, index) => onRemoveContext(index))
  }

  // Función para ocultar ImageSelector y notificaciones (como el segundo clic del icono)
  const hideImageSelectorAndNotifications = () => {
    console.log('Ocultando ImageSelector y notificaciones...')
    
    // Ocultar ImageSelector (como el segundo clic del icono)
    setShowImageSelector(false)
    
    // Ocultar notificaciones de imagen
    if (onHideImageNotifications) {
      onHideImageNotifications()
    }
  }


  
  return (
    <div 
      className={`flex-1 flex flex-col h-full bg-enterprise-900 transition-all duration-300 ${isDraggingOver ? 'bg-sky-900/50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
          <p className="text-xl font-semibold text-white">Suelta el archivo para añadirlo como contexto</p>
        </div>
      )}
      {isExtracting && (
         <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <p className="text-xl font-semibold text-white">Extrayendo texto del PDF...</p>
        </div>
      )}
      <ChatHeader 
        onToggleQuiz={hideHeaderIcons ? undefined : () => setShowQuiz(!showQuiz)}
        onToggleSmartPrompts={hideHeaderIcons ? undefined : () => setShowSmartPrompts(!showSmartPrompts)}
        onToggleImageSelector={hideHeaderIcons ? undefined : () => {
          setShowImageSelector(!showImageSelector)
          // Solo activar modo de selección si se está mostrando el selector y hay archivo
          if (!showImageSelector && selectedFile && onToggleImageSelection) {
            onToggleImageSelection()
          }
        }}
        onClearContext={hideHeaderIcons ? undefined : clearPersistentContext}
      />
      
      {/* Mostrar contexto si hay alguno */}
      {(contextText.length > 0 || persistentContext.length > 0) && (
        <div className="border-b border-enterprise-800/50">
          {/* Acordeón de contexto */}
          <button
            className="flex items-center gap-2 px-4 py-2 w-full text-left bg-enterprise-950/70 hover:bg-enterprise-900/80 transition-colors"
            onClick={() => setIsContextOpen((prev) => !prev)}
          >
            {isContextOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="font-medium text-slate-200 text-sm">Contexto Agregado</span>
            <span className="ml-2 text-xs text-slate-400">({contextText.length} + {persistentContext.length} persistente)</span>
            <span className="flex-1" />
            <span className="text-xs text-slate-500">{isContextOpen ? 'Ocultar' : 'Mostrar'}</span>
          </button>
          <div
            style={{
              maxHeight: isContextOpen ? 260 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {isContextOpen && (
              <ContextDisplay 
                contextText={[...persistentContext, ...contextText]} 
                onRemoveContext={onRemoveContext} 
              />
            )}
          </div>
        </div>
      )}
      
      {/* Notificaciones de imagen (después del contexto) */}
      {showDragInstruction && selectedFile && (
        <div className="flex items-center justify-center py-4 px-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-blue-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Square className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Arrastre para seleccionar</h4>
                <p className="text-blue-100 text-xs">Haga clic y arrastre sobre la imagen</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showSelectionSuccess && (
        <div className="flex items-center justify-center py-4 px-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-green-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">¡Selección exitosa!</h4>
                <p className="text-green-100 text-xs">Procesando imagen...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showImageSuccessNotification && (
        <div className="flex items-center justify-center py-4 px-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-blue-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-spin">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Cargando contexto...</h4>
                <p className="text-blue-100 text-xs">Por favor espere</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showContextLoadedNotification && (
        <div className="flex items-center justify-center py-4 px-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-green-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Contexto cargado</h4>
                <p className="text-green-100 text-xs">Puede seguir seleccionando imágenes o salir</p>
              </div>
              <button
                onClick={hideImageSelectorAndNotifications}
                className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Smart Prompts */}
      {showSmartPrompts && (
        <SmartPrompts 
          context={contextText}
          onPromptSelect={handleSendMessage}
          subject="general"
          difficulty="intermediate"
          learningStyle="visual"
        />
      )}

      {/* Image Selector */}
      {showImageSelector && (
        <ImageSelector 
          selectedFile={selectedFile}
          onAddImageContext={onImageContextAdd}
          isSelectionMode={isImageSelectionMode}
          onToggleSelectionMode={onToggleImageSelection}
        />
      )}
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <MessageList
          messages={messages}
          isProcessing={isProcessing}
          messagesEndRef={messagesEndRef}
        />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
      

      
      {/* Quiz System */}
      {showQuiz && (
        <QuizSystem 
          context={contextText}
          onClose={() => setShowQuiz(false)}
          onSendMessage={handleSendMessage}
          selectedFile={selectedFile}
        />
      )}
    </div>
  )
} 