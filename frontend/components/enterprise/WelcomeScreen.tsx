'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

interface WelcomeScreenProps {
  onSendMessage: (message: string) => Promise<void>
}



export function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-enterprise-950 via-enterprise-900 to-enterprise-950">
      {/* Simple Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="relative mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/20 flex items-center justify-center border border-sky-500/50">
            <GraduationCap className="w-8 h-8 text-sky-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-2xl font-semibold mb-3 text-white">
            Chat Agent AI
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Selecciona un documento del panel izquierdo o haz una pregunta
          </p>
        </motion.div>
      </motion.div>


    </div>
  )
} 