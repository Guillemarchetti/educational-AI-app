'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
}

export function MessageList({ messages, isProcessing, messagesEndRef }: MessageListProps) {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

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
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            className={`flex space-x-4 message-bubble ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            {message.sender === 'ai' && (
              <motion.div 
                className="w-10 h-10 rounded-xl genie-gradient flex items-center justify-center flex-shrink-0 shadow-genie"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            )}
            
            <div
              className={`max-w-xs lg:max-w-2xl px-6 py-4 rounded-2xl relative group ${
                message.sender === 'user'
                  ? 'bg-genie-600 text-white ml-auto shadow-lg'
                  : 'enterprise-card text-slate-100 shadow-xl'
              }`}
            >
              {/* Message Content */}
              <div className="space-y-3">
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
                
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

            {message.sender === 'user' && (
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.05 }}
              >
                <User className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isProcessing && (
          <motion.div
            className="flex space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="w-10 h-10 rounded-xl genie-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="enterprise-card px-6 py-4 rounded-2xl">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 