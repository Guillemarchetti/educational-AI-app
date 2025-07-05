import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'
import './App.css'

function App() {
  const [currentChat, setCurrentChat] = useState('chat')
  const [messages, setMessages] = useState([])

  const handleSendMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: getAIResponse(message),
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const getAIResponse = (userMessage) => {
    const responses = [
      "I understand you want to transfer 1 BTC. I can help you with that transaction. Please provide the destination wallet address.",
      "For cryptocurrency analysis, I can provide real-time market data and trading insights. What specific information do you need?",
      "I'm here to help with your crypto trading strategies. Would you like me to analyze current market conditions?",
      "I can assist with DeFi yields analysis. Which protocols are you interested in exploring?",
      "Price history analysis shows interesting patterns. Would you like me to provide detailed charts and predictions?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <Sidebar currentChat={currentChat} setCurrentChat={setCurrentChat} />
      <ChatInterface 
        messages={messages} 
        onSendMessage={handleSendMessage}
        currentChat={currentChat}
      />
    </div>
  )
}

export default App 