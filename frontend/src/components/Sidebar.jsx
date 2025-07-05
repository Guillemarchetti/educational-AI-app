import React from 'react'
import { 
  MessageSquare, 
  History, 
  BarChart3, 
  Settings, 
  Moon, 
  Sparkles,
  User,
  ChevronDown,
  Home,
  TrendingUp,
  Target
} from 'lucide-react'

const Sidebar = ({ currentChat, setCurrentChat }) => {
  const menuItems = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: MessageSquare, label: 'Chat', id: 'chat', active: true },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: TrendingUp, label: 'Trading', id: 'trading' },
    { icon: Target, label: 'Strategy', id: 'strategy' },
    { icon: History, label: 'History', id: 'history' },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ]

  return (
    <div className="w-16 bg-dark-surface border-r border-dark-border flex flex-col items-center py-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl genie-gradient flex items-center justify-center genie-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col space-y-4 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentChat(item.id)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-dark-border ${
              currentChat === item.id 
                ? 'bg-genie-blue text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* User Profile */}
      <div className="mt-auto flex flex-col space-y-4">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-border transition-all duration-200">
          <Moon className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

export default Sidebar 