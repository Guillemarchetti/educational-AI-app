import React from 'react'
import { ChevronDown, Wifi } from 'lucide-react'

const ChatHeader = () => {
  return (
    <div className="border-b border-dark-border bg-dark-surface">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-semibold">Chat with Genie</h1>
        
        <div className="flex items-center space-x-4">
          {/* Network Selector */}
          <div className="flex items-center space-x-2 bg-dark-bg px-3 py-1.5 rounded-lg">
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-300">Ethereum</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          
          {/* User Avatar */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500"></div>
            <span className="text-sm text-gray-300">0xh3l_h3FG5</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 px-6">
        <button className="py-3 text-white border-b-2 border-genie-blue font-medium">
          Chat
        </button>
        <button className="py-3 text-gray-400 hover:text-white transition-colors">
          History
        </button>
      </div>
    </div>
  )
}

export default ChatHeader 