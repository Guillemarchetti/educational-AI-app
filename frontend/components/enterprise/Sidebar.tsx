'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Settings, 
  Moon, 
  Sparkles,
  User,
  Home,
  Search,
  History,
  Upload,
  BarChart3,
  GraduationCap,
  Library,
  Gamepad2
} from 'lucide-react'

interface SidebarProps {
  currentSection: string
  setCurrentSection: (section: string) => void
}

const menuItems = [
  { icon: Home, label: 'Inicio', id: 'dashboard', category: 'main' },
  { icon: MessageSquare, label: 'Chat AI', id: 'chat', category: 'main' },
  { icon: FileText, label: 'Documentos', id: 'documents', category: 'content' },
  { icon: BookOpen, label: 'Estructura', id: 'structure', category: 'content' },
  { icon: Library, label: 'Biblioteca', id: 'library', category: 'content' },
  { icon: Search, label: 'Búsqueda', id: 'search', category: 'tools' },
  { icon: BarChart3, label: 'Análisis', id: 'analytics', category: 'tools' },
  { icon: Upload, label: 'Subir', id: 'upload', category: 'tools' },
  { icon: History, label: 'Historial', id: 'history', category: 'system' },
  { icon: Settings, label: 'Configuración', id: 'settings', category: 'system' }
]

export function Sidebar({ currentSection, setCurrentSection }: SidebarProps) {
  return (
    <motion.aside 
      className="w-20 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 flex flex-col items-center py-6 relative"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo */}
      <motion.div 
        className="mb-8 relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg relative overflow-hidden">
          <GraduationCap className="w-6 h-6 text-white relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 shimmer"></div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 status-online"></div>
      </motion.div>

      {/* Navigation Menu */}
      <nav className="flex flex-col space-y-3 flex-1">
        {menuItems.map((item, index) => {
          const isActive = currentSection === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-5 h-5 relative z-10" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700/50">
                {item.label}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800/95 rotate-45 border-l border-b border-gray-700/50"></div>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* User Profile & Controls */}
      <div className="flex flex-col space-y-3 mt-auto">
        {/* Theme Toggle */}
        <motion.button 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Moon className="w-5 h-5" />
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700/50">
            Modo Oscuro
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800/95 rotate-45 border-l border-b border-gray-700/50"></div>
          </div>
        </motion.button>

        {/* Status Indicator */}
        <motion.div 
          className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800/30 border border-gray-700/50 group relative"
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles className="w-4 h-4 text-green-400" />
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700/50">
            Sistema: Activo
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800/95 rotate-45 border-l border-b border-gray-700/50"></div>
          </div>
        </motion.div>
        
        {/* User Avatar */}
        <motion.div 
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 flex items-center justify-center cursor-pointer relative group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <User className="w-5 h-5 text-white" />
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700/50">
            Usuario Educativo
            <div className="text-xs text-gray-300 mt-1">Profesor/Estudiante</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800/95 rotate-45 border-l border-b border-gray-700/50"></div>
          </div>
          
          {/* Online status */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 status-online"></div>
        </motion.div>
      </div>
    </motion.aside>
  )
} 