'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

export function AnalyticsDashboard() {
  return (
    <motion.div 
      className="flex-1 flex items-center justify-center bg-gradient-to-br from-enterprise-950 via-enterprise-900 to-enterprise-950"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center space-y-6 max-w-md">
        <motion.div
          className="w-24 h-24 mx-auto rounded-3xl genie-gradient flex items-center justify-center floating-element"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <BarChart3 className="w-12 h-12 text-white" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold genie-gradient-text mb-3">
            Analytics Dashboard
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Advanced financial analytics and data visualization tools coming soon.
          </p>
        </div>
      </div>
    </motion.div>
  )
} 