'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Target, Zap } from 'lucide-react';

interface PomodoroMotivationalCardProps {
  message: string;
  isVisible: boolean;
}

export function PomodoroMotivationalCard({ message, isVisible }: PomodoroMotivationalCardProps) {
  // Obtener icono aleatorio para el mensaje
  const getRandomIcon = () => {
    const icons = [Heart, Star, Target, Zap];
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    return <IconComponent className="w-3 h-3" />;
  };

  return (
    <div className="w-full h-full bg-enterprise-800 border border-enterprise-700 rounded-lg p-3 shadow-lg flex flex-col">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <div className="p-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          {getRandomIcon()}
        </div>
        <span className="text-sm font-medium text-slate-300">Motivación</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center min-h-0 px-1">
        <AnimatePresence mode="wait">
          {isVisible && message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center h-full w-full"
            >
              <p className="text-white font-medium text-sm leading-relaxed text-center">
                {message}
              </p>
            </motion.div>
          )}
          
          {(!isVisible || !message) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full w-full"
            >
              <p className="text-slate-400 text-sm text-center leading-relaxed">
                Mensajes motivacionales aparecerán aquí
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 