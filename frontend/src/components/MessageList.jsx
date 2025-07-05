import React from 'react'
import { Sparkles, User } from 'lucide-react'

const MessageList = ({ messages, isTyping, messagesEndRef }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const TypingIndicator = () => (
    <div className="flex space-x-1 items-center p-2">
      <div className="w-2 h-2 bg-genie-blue rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-genie-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-genie-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex space-x-3 message-bubble ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.sender === 'ai' && (
            <div className="w-8 h-8 rounded-full genie-gradient flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
          
          <div
            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              message.sender === 'user'
                ? 'bg-genie-blue text-white ml-auto'
                : 'bg-dark-surface border border-dark-border text-gray-100'
            }`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
            <p className={`text-xs mt-2 ${
              message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>

          {message.sender === 'user' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      ))}

      {isTyping && (
        <div className="flex space-x-3">
          <div className="w-8 h-8 rounded-full genie-gradient flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-3">
            <TypingIndicator />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList 