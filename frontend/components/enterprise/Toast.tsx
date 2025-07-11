'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface ToastProps {
  type: ToastType
  title: string
  message?: string
  onClose: () => void
  duration?: number
}

const toastStyles = {
  success: {
    bg: 'bg-green-900/80',
    border: 'border-green-500/50',
    icon: CheckCircle,
    iconColor: 'text-green-400'
  },
  error: {
    bg: 'bg-red-900/80',
    border: 'border-red-500/50',
    icon: XCircle,
    iconColor: 'text-red-400'
  },
  warning: {
    bg: 'bg-yellow-900/80',
    border: 'border-yellow-500/50',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400'
  }
}

export function Toast({ type, title, message, onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const styles = toastStyles[type]
  const IconComponent = styles.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start space-x-3">
          <IconComponent size={20} className={`${styles.iconColor} flex-shrink-0 mt-0.5`} />
          
          <div className="flex-1 min-w-0">
            <h4 className="text-gray-200 font-medium text-sm">
              {title}
            </h4>
            {message && (
              <p className="text-gray-300 text-xs mt-1">
                {message}
              </p>
            )}
          </div>
          
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook simple para manejar toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: ToastType
    title: string
    message?: string
  }>>([])

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, title, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (title: string, message?: string) => addToast('success', title, message)
  const showError = (title: string, message?: string) => addToast('error', title, message)
  const showWarning = (title: string, message?: string) => addToast('warning', title, message)

  return {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning
  }
}

// Componente contenedor
export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
} 