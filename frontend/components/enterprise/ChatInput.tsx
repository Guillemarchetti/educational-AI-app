'use client'

import React, { useState, useRef } from 'react'

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
    <div className="w-full px-2 pb-3 pt-2 bg-transparent">
      <form onSubmit={handleSubmit} className="relative flex items-end w-full">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="w-full bg-[#23272F] border border-[#3A3F4B] rounded-2xl text-white placeholder-[#A0A4AE] px-4 py-3 pr-12 shadow-[0_2px_8px_rgba(0,0,0,0.12)] resize-none focus:outline-none text-base transition-all duration-200 min-h-[44px] max-h-[120px]"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
            disabled={isProcessing}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!message.trim() || isProcessing}
            className={`absolute right-3 bottom-3 flex items-center justify-center rounded-full h-9 w-9 transition-colors duration-200
              ${message.trim() && !isProcessing ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white cursor-pointer' : 'bg-[#3A3F4B] text-[#A0A4AE] cursor-not-allowed'}`}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.25 8.25l11-4.5a.5.5 0 01.65.65l-4.5 11a.5.5 0 01-.92-.06l-1.13-3.4a.5.5 0 00-.32-.32l-3.4-1.13a.5.5 0 01-.06-.92z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
} 