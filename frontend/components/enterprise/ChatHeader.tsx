'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function ChatHeader() {
  return (
    <motion.header 
      className="border-b border-enterprise-800/50 bg-enterprise-900/30 p-4 flex-shrink-0"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Asistente de Chat
        </h2>
        {/* Aquí podríamos agregar acciones futuras, como 'limpiar chat' */}
      </div>
    </motion.header>
  )
} 