'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// Local Message interface
interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  agent?: string
  metadata?: {
    confidence?: number
    sources?: string[]
  }
}

interface MessageListProps {
  messages: Message[]
  isProcessing: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  onPromptClick?: (prompt: string) => void
}

export function MessageList({ messages, isProcessing, messagesEndRef, onPromptClick }: MessageListProps) {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Extrae preguntas sugeridas de la respuesta de IA
  function extractSuggestedPrompts(text: string): string[] {
    const match = text.match(/### Preguntas sugeridas[\s\S]*?([0-9]+\..+)/)
    if (!match) return []
    // Extraer cada línea que empiece con número punto
    return match[1]
      .split(/\n+/)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
  }

  // Elimina la sección de preguntas sugeridas del texto
  function removeSuggestedPromptsSection(text: string): string {
    return text.replace(/### Preguntas sugeridas[\s\S]*/, '').trim()
  }

  // Componente personalizado para renderizar código
  const CodeBlock = ({ children, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    return (
      <div className="relative group">
        <pre className={`${className} bg-enterprise-900/80 border border-enterprise-700/50 rounded-lg p-4 overflow-x-auto`}>
          <code {...props}>{children}</code>
        </pre>
        {language && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-enterprise-800/80 text-slate-400 px-2 py-1 rounded">
              {language}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Componente personalizado para renderizar enlaces
  const Link = ({ href, children }: any) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-sky-400 hover:text-sky-300 underline"
    >
      {children}
    </a>
  )

  // Componente personalizado para renderizar tablas
  const Table = ({ children }: any) => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-enterprise-700/50">
        {children}
      </table>
    </div>
  )

  const TypingIndicator = () => (
    <motion.div 
      className="flex space-x-1 items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="w-2 h-2 bg-genie-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
      />
      <motion.div 
        className="w-2 h-2 bg-genie-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
      />
      <motion.div 
        className="w-2 h-2 bg-genie-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
      />
      <span className="ml-2 text-sm text-slate-400">Analyzing...</span>
    </motion.div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6">
      {/* Chat History Area with Scroll */}
      <div className="flex-1 overflow-y-auto enterprise-scrollbar space-y-6 pr-2" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        {messages.map((message, index) => {
          // Si es mensaje de IA, extraer prompts sugeridos
          let prompts: string[] = []
          let mainText = message.text
          if (message.sender === 'ai') {
            prompts = extractSuggestedPrompts(message.text)
            if (prompts.length > 0) {
              mainText = removeSuggestedPromptsSection(message.text)
            }
          }
          return (
            <motion.div
              key={message.id}
              className={`flex space-x-4 message-bubble ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div
                className={`max-w-xs lg:max-w-2xl px-6 py-4 rounded-2xl relative group text-sm ${
                  message.sender === 'user'
                    ? 'bg-[#2563eb22] text-white ml-auto shadow-lg'
                    : 'enterprise-card text-slate-100 shadow-xl'
                }`}
              >
                {/* Message Content */}
                <div className="space-y-3">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        a: Link,
                        table: Table,
                        th: ({ children, ...props }: any) => (
                          <th className="border border-enterprise-700/50 bg-enterprise-800/50 px-3 py-2 text-left font-medium" {...props}>
                            {children}
                          </th>
                        ),
                        td: ({ children, ...props }: any) => (
                          <td className="border border-enterprise-700/50 px-3 py-2" {...props}>
                            {children}
                          </td>
                        ),
                        blockquote: ({ children, ...props }: any) => (
                          <blockquote className="border-l-4 border-sky-500/50 pl-4 italic bg-enterprise-800/30 py-2" {...props}>
                            {children}
                          </blockquote>
                        ),
                        ul: ({ children, ...props }: any) => (
                          <ul className="list-disc list-inside space-y-1" {...props}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children, ...props }: any) => (
                          <ol className="list-decimal list-inside space-y-1" {...props}>
                            {children}
                          </ol>
                        ),
                        li: ({ children, ...props }: any) => (
                          <li className="text-slate-200" {...props}>
                            {children}
                          </li>
                        ),
                        h1: ({ children, ...props }: any) => (
                          <h1 className="text-xl font-bold text-white mb-3" {...props}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children, ...props }: any) => (
                          <h2 className="text-lg font-semibold text-white mb-2" {...props}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children, ...props }: any) => (
                          <h3 className="text-base font-medium text-sky-300 mb-2" {...props}>
                            {children}
                          </h3>
                        ),
                        p: ({ children, ...props }: any) => (
                          <p className="text-slate-200 leading-relaxed" {...props}>
                            {children}
                          </p>
                        ),
                        strong: ({ children, ...props }: any) => (
                          <strong className="font-semibold text-white" {...props}>
                            {children}
                          </strong>
                        ),
                        em: ({ children, ...props }: any) => (
                          <em className="italic text-slate-300" {...props}>
                            {children}
                          </em>
                        ),
                        code: ({ children, className, ...props }: any) => {
                          if (className) {
                            return <CodeBlock className={className} {...props}>{children}</CodeBlock>
                          }
                          return (
                            <code className="bg-enterprise-800/50 text-sky-300 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {mainText}
                    </ReactMarkdown>
                  </div>
                  {/* Prompts sugeridos como botones */}
                  {message.sender === 'ai' && prompts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {prompts.map((prompt, i) => (
                        <button
                          key={i}
                          className="px-3 py-1 rounded-lg bg-enterprise-800/70 hover:bg-enterprise-700/80 text-xs text-sky-300 border border-enterprise-700/50 transition-colors"
                          onClick={() => onPromptClick && onPromptClick(prompt)}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Metadata for AI messages */}
                  {message.sender === 'ai' && message.metadata && (
                    <motion.div 
                      className="border-t border-enterprise-700/50 pt-3 mt-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-4">
                          <div className="text-slate-400">
                            Confidence: 
                            <span className="text-green-400 ml-1">
                              {Math.round((message.metadata.confidence || 0) * 100)}%
                            </span>
                          </div>
                          {message.metadata.sources && (
                            <div className="text-slate-500">
                              Sources: {message.metadata.sources.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Timestamp */}
                <div className={`text-xs mt-3 flex items-center justify-between ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {/* Action buttons for AI messages */}
                  {message.sender === 'ai' && (
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        className="p-1 hover:bg-enterprise-700/50 rounded"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Copy className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        className="p-1 hover:bg-enterprise-700/50 rounded"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        className="p-1 hover:bg-enterprise-700/50 rounded"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Typing Indicator */}
        {isProcessing && (
          <motion.div
            className="flex space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="enterprise-card px-6 py-4 rounded-2xl">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        {/* Scroll to bottom reference */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 