import React from 'react'
import { Sparkles } from 'lucide-react'

const WelcomeScreen = ({ onSendMessage }) => {
  const suggestions = [
    'Analyse BTC',
    'Analyse BTC', 
    'DeFi Yields',
    'DeFi Yields',
    'Price History',
    'Price History',
    'Price History',
    'Trading Strategy',
    'Trading Strategy',
    'Trading Strategy',
    'Trading Strategy',
    'Candle patterns',
    'Analyse BTC'
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* Genie Logo */}
      <div className="mb-8">
        <div className="w-20 h-20 rounded-3xl genie-gradient flex items-center justify-center genie-glow mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Chat with Genie</h2>
          <p className="text-gray-400 text-sm">powered by Xeus</p>
        </div>
      </div>

      {/* Suggestion Pills */}
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl mb-8">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(suggestion)}
            className="px-4 py-2 bg-dark-surface border border-dark-border rounded-full text-sm text-gray-300 hover:bg-dark-border hover:text-white transition-all duration-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WelcomeScreen 