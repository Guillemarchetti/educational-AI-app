import React, { useState, useRef, useEffect } from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import WelcomeScreen from './WelcomeScreen'

const ChatInterface = ({ messages, onSendMessage, currentChat }) => {
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (message) => {
    if (message.trim()) {
      onSendMessage(message)
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }
  }

  if (currentChat !== 'chat') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">
            {currentChat.charAt(0).toUpperCase() + currentChat.slice(1)}
          </h2>
          <p className="text-gray-500">This section is coming soon...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />
      
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <WelcomeScreen onSendMessage={handleSendMessage} />
        ) : (
          <MessageList 
            messages={messages} 
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default ChatInterface 