import React, { useState } from 'react'
import { Send, Paperclip } from 'lucide-react'

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-dark-border bg-dark-surface p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-border rounded-lg transition-all duration-200"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-3 text-white placeholder-gray-400 resize-none chat-input focus:border-genie-blue transition-all duration-200"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          

        </div>

        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-3 rounded-xl transition-all duration-200 ${
            message.trim()
              ? 'genie-gradient text-white hover:shadow-lg'
              : 'bg-dark-border text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="flex items-center justify-center mt-3">
        <p className="text-xs text-gray-500 text-center">
          Genie can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  )
}

export default ChatInput 