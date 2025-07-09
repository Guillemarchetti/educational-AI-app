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
import { ChevronDown, ChevronRight } from 'lucide-react'

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
}: ChatInterfaceProps) {
  const [internalMessages, setInternalMessages] = useState<Message[]>([])
  
  // Usar mensajes externos si están disponibles, si no, usar internos
  const messages = externalMessages || internalMessages;
  const setMessages = externalSetMessages || setInternalMessages;
  const [isProcessing, setIsProcessing] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [isContextOpen, setIsContextOpen] = useState(true)
  const [persistentContext, setPersistentContext] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    console.log('useEffect para mensaje de bienvenida:', {
      selectedFile: selectedFile?.name,
      contextTextLength: contextText.length,
      messagesLength: messages.length
    });
    
    // Generar mensaje de bienvenida cuando se selecciona un archivo y no hay mensajes
    if (selectedFile && messages.length === 0) {
      console.log('Archivo seleccionado y no hay mensajes, generando mensaje de bienvenida');
      generateWelcomeMessage();
    } else {
      console.log('No se cumplen las condiciones básicas para el mensaje de bienvenida');
    }
  }, [selectedFile, messages.length]);

  // Generar mensaje de bienvenida cuando se agrega contexto de un archivo
  useEffect(() => {
    console.log('useEffect para contexto agregado:', {
      contextTextLength: contextText.length,
      selectedFile: selectedFile?.name
    });
    
    if (contextText.length > 0 && selectedFile) {
      const lastContext = contextText[contextText.length - 1];
      if (lastContext.includes(`Contexto del archivo "${selectedFile.name}"`)) {
        console.log('Contexto de archivo agregado, verificando si generar mensaje de bienvenida');
        // Solo generar si no hay mensajes o si el último mensaje no es de bienvenida
        if (messages.length === 0 || messages[messages.length - 1].agent !== 'Sistema') {
          console.log('Generando mensaje de bienvenida por contexto agregado');
          generateWelcomeMessage();
        }
      }
    }
  }, [contextText, selectedFile, messages.length]);

  const generateWelcomeMessage = async () => {
    if (!selectedFile) return;

    try {
      console.log('Generando mensaje de bienvenida para:', selectedFile.name);
      
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
      
      console.log('Agregando mensaje de bienvenida al chat:', welcomeMessageObj);
      setMessages(prev => [...prev, welcomeMessageObj]);
      
    } catch (error) {
      console.error('Error generando mensaje de bienvenida:', error);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isProcessing) return

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
        onToggleProgress={() => setShowProgress(!showProgress)}
        onToggleQuiz={() => setShowQuiz(!showQuiz)}
        onClearContext={clearPersistentContext}
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
      
      {/* Smart Prompts */}
      <SmartPrompts 
        context={contextText}
        onPromptSelect={handleSendMessage}
        subject="general"
        difficulty="intermediate"
        learningStyle="visual"
      />
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <MessageList
          messages={messages}
          isProcessing={isProcessing}
          messagesEndRef={messagesEndRef}
        />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
      
      {/* Progress Tracker */}
      <ProgressTracker 
        isVisible={showProgress}
        onToggle={() => setShowProgress(!showProgress)}
      />
      
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