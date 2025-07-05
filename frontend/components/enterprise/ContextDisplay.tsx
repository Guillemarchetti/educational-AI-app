'use client'

import React from 'react';
import { X, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextDisplayProps {
  contextText: string[];
  onRemoveContext: (index: number) => void;
}

export function ContextDisplay({ contextText, onRemoveContext }: ContextDisplayProps) {
  console.log('ContextDisplay received:', contextText)
  
  if (contextText.length === 0) {
    return null;
  }

  return (
    <div className="p-2 border-t border-enterprise-800/50 bg-enterprise-900/50">
      <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center">
        <Paperclip size={14} className="mr-2" />
        Contexto Añadido ({contextText.length})
      </h3>
      <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
        <AnimatePresence>
          {contextText.map((text, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-sky-900/50 border border-sky-700/50 p-2 rounded-lg text-xs text-slate-300 flex items-start justify-between"
            >
              <p className="truncate pr-2">"{text}"</p>
              <button 
                onClick={() => onRemoveContext(index)}
                className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 