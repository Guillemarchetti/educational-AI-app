'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { WelcomeScreen } from './WelcomeScreen'

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
}

export function ChatInterface({ 
  contextText, 
  onRemoveContext, 
  isDraggingOver, 
  setIsDraggingOver,
  onFileDrop,
  isExtracting,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    const contextString = contextText.join('\n\n---\n\n');

    try {
      const response = await fetch('http://localhost:8000/api/agents/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          userId: 'demo-user', // Hardcoded por ahora
          context: contextString, // Enviamos el contexto
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
      
      // Limpiar contexto después del envío
      contextText.forEach((_, index) => onRemoveContext(index));

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
      <ChatHeader />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <WelcomeScreen onSendMessage={handleSendMessage} />
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <MessageList
                messages={messages}
                isProcessing={isProcessing}
                messagesEndRef={messagesEndRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
    </div>
  )
} 