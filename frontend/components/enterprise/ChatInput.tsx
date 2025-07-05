'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Zap, Command } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>
  isProcessing: boolean
}

export function ChatInput({ onSendMessage, isProcessing }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isProcessing) {
      await onSendMessage(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    adjustTextareaHeight()
  }



  return (
    <motion.div 
      className="relative border-t border-enterprise-800/30 bg-gradient-to-r from-enterprise-950 via-enterprise-900 to-enterprise-950 backdrop-blur-xl"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      <div className="relative p-6">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Attachment Button */}
          <motion.button
            type="button"
            className="group relative p-3 bg-enterprise-800/40 hover:bg-enterprise-700/60 border border-enterprise-700/50 hover:border-enterprise-600/60 rounded-2xl transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paperclip className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors duration-200" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>

          {/* Main Input Area */}
          <div className="flex-1 relative">
            <motion.div 
              className="relative bg-enterprise-800/30 border border-enterprise-700/40 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 focus-within:border-sky-500/50 focus-within:bg-enterprise-800/50"
              whileFocus={{ scale: 1.01 }}
            >
              {/* Input glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-blue-500/5 opacity-0 transition-opacity duration-300 focus-within:opacity-100" />
              
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Pregunta sobre los documentos o escribe tu mensaje..."
                className="relative w-full bg-transparent border-0 px-6 py-4 text-white placeholder-slate-400/70 resize-none focus:outline-none focus:ring-0 transition-all duration-200"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '120px' }}
                disabled={isProcessing}
              />
              
              {/* Character count indicator */}
              {message.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-2 right-3 text-xs text-slate-500"
                >
                  {message.length}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={!message.trim() || isProcessing}
            className={`group relative p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm ${
              message.trim() && !isProcessing
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40'
                : 'bg-enterprise-800/40 border border-enterprise-700/50 text-slate-400 cursor-not-allowed'
            }`}
            whileHover={message.trim() && !isProcessing ? { scale: 1.05, y: -1 } : {}}
            whileTap={message.trim() && !isProcessing ? { scale: 0.95 } : {}}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="relative z-10"
              >
                <Zap className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5 relative z-10 group-hover:translate-x-0.5 transition-transform duration-200" />
            )}
            
            {/* Button glow effect */}
            {message.trim() && !isProcessing && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/20 to-blue-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
          </motion.button>
        </form>

        {/* Status Bar */}
        <motion.div 
          className="flex items-center justify-between mt-4 px-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 hover:text-slate-300 transition-colors duration-200">
              <Command className="w-3 h-3" />
              <span>⏎ Enviar</span>
            </div>
            <div className="text-slate-500">
              Shift + ⏎ Nueva línea
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <motion.div 
              className="flex items-center gap-1.5"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm shadow-green-400/50"></div>
              <span className="text-slate-400">IA Activa</span>
            </motion.div>
            <div className="text-slate-500 bg-enterprise-800/30 px-2 py-1 rounded-lg border border-enterprise-700/30">
              Chat Agent
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-slate-500/80 bg-enterprise-800/20 px-4 py-2 rounded-xl border border-enterprise-700/20 inline-block">
            💡 Las respuestas de IA son informativas. Verifica información importante con múltiples fuentes.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
} 