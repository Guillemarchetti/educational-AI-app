'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  // Navigation icons
  ChatBubbleLeftIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  
  // User interface icons
  UserCircleIcon,
  ShareIcon,
  Cog6ToothIcon,
  
  // Educational icons
  BookOpenIcon,
  AcademicCapIcon,
  CalculatorIcon,
  GlobeAltIcon,
  BeakerIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  HeartIcon,
  
  // AI Agent icons
  UserIcon,
  ChartBarIcon,
  LightBulbIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  
  // Action icons
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  ChevronDownIcon,
  
  // Status icons
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  
  // Educational level icons
  StarIcon,
  TrophyIcon,
  FireIcon,
} from '@heroicons/react/24/outline'

import {
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid'

export interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  agent?: string
}

export interface UserProfile {
  name: string
  role: 'student' | 'teacher' | 'director' | 'minister'
  grade?: string
  subject?: string
  level?: 'primaria' | 'media' | 'secundaria'
}

export interface AIAgent {
  id: string
  name: string
  description: string
  type: 'tutor' | 'evaluator' | 'counselor' | 'curriculum' | 'analytics'
  active: boolean
}

// Educational AI Agents with Heroicons
const aiAgents: AIAgent[] = [
  {
    id: 'tutor',
    name: 'Tutor Virtual',
    description: 'Aprendizaje personalizado y adaptativo',
    type: 'tutor',
    active: true
  },
  {
    id: 'evaluador',
    name: 'Evaluador',
    description: 'Evaluación y seguimiento académico',
    type: 'evaluator',
    active: true
  },
  {
    id: 'consejero',
    name: 'Consejero',
    description: 'Orientación académica y personal',
    type: 'counselor',
    active: true
  },
  {
    id: 'planificador',
    name: 'Planificador',
    description: 'Diseño curricular y planificación',
    type: 'curriculum',
    active: true
  },
  {
    id: 'analitico',
    name: 'Analítico',
    description: 'Análisis de datos educativos',
    type: 'analytics',
    active: true
  }
]

// Educational subjects with Heroicons
const subjects = [
  { name: 'Matemáticas', level: 'primary' },
  { name: 'Lengua Española', level: 'primary' },
  { name: 'Ciencias Naturales', level: 'middle' },
  { name: 'Ciencias Sociales', level: 'middle' },
  { name: 'Educación Artística', level: 'secondary' },
  { name: 'Educación Musical', level: 'secondary' },
  { name: 'Educación Física', level: 'primary' },
  { name: 'Tecnología', level: 'secondary' }
]

// Educational capabilities with Heroicons
const capabilities = [
  {
    title: 'Aprendizaje Personalizado',
    description: 'Adapto mi enseñanza a tu ritmo y estilo de aprendizaje único'
  },
  {
    title: 'Evaluación Continua',
    description: 'Monitoreo tu progreso y proporciono retroalimentación constante'
  },
  {
    title: 'Recursos Multimodales',
    description: 'Aprende con textos, imágenes, videos y actividades interactivas'
  },
  {
    title: 'Apoyo 24/7',
    description: 'Estoy disponible cuando necesites ayuda con tus estudios'
  }
]

export default function MinisterioEducacionPage() {
  const [selectedAgent, setSelectedAgent] = useState('tutor')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userRole, setUserRole] = useState('student')
  const [userGrade, setUserGrade] = useState('5to')
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // User profile - This would come from authentication in real app
  const [userProfile] = useState<UserProfile>({
    name: 'María González',
    role: 'student',
    grade: '7mo Grado',
    level: 'secundaria'
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (message: string) => {
    if (!message.trim() || isTyping) return

    const newMessage: Message = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage('')
    setIsTyping(true)
    
    // Simulate AI response based on selected agent
    setTimeout(() => {
      const selectedAgentData = aiAgents.find(agent => agent.id === selectedAgent)
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: generateEducationalResponse(message, selectedAgentData),
        sender: 'ai',
        timestamp: new Date(),
        agent: selectedAgentData?.name
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateEducationalResponse = (userMessage: string, agent?: AIAgent): string => {
    const agentResponses = {
      tutor: `Como tu **Tutor Virtual**, puedo ayudarte con:

**📚 Explicaciones Personalizadas**
• Conceptos adaptados a tu nivel (${userProfile.grade})
• Ejemplos prácticos y ejercicios
• Métodos de estudio efectivos

**🎯 Apoyo Específico**
• Resolución paso a paso de problemas
• Estrategias de comprensión lectora
• Técnicas de memorización

**📈 Seguimiento del Progreso**
• Identificación de áreas de mejora
• Refuerzo de conocimientos previos
• Preparación para evaluaciones

¿En qué materia específica te gustaría que te ayude hoy?`,

      evaluador: `Como **Evaluador Educativo**, puedo asistirte con:

**📊 Evaluación Formativa**
• Diagnóstico de conocimientos previos
• Evaluación continua del progreso
• Identificación de dificultades de aprendizaje

**📋 Seguimiento Académico**
• Análisis de resultados por competencias
• Recomendaciones de mejora personalizadas
• Informes de progreso detallados

**🎯 Preparación para Exámenes**
• Simulacros de evaluación
• Estrategias de resolución
• Manejo de ansiedad ante exámenes

¿Te gustaría realizar una evaluación diagnóstica o revisar tu progreso actual?`,

      counselor: `Como **Consejero Educativo**, estoy aquí para:

**🎓 Orientación Académica**
• Planificación de estudios personalizados
• Elección de materias optativas
• Preparación para la educación superior

**💪 Desarrollo Personal**
• Técnicas de motivación y autoestima
• Manejo del estrés académico
• Habilidades socioemocionales

**🤝 Apoyo Integral**
• Resolución de conflictos estudiantiles
• Adaptación al entorno escolar
• Comunicación efectiva

¿Hay algún aspecto específico de tu experiencia educativa que te preocupe?`,

      curriculum: `Como **Planificador Curricular**, puedo ayudarte con:

**📚 Diseño de Contenidos**
• Secuenciación de objetivos de aprendizaje
• Integración de competencias transversales
• Adaptación a diferentes estilos de aprendizaje

**🗓️ Planificación Didáctica**
• Cronogramas de actividades
• Recursos educativos apropiados
• Metodologías activas de enseñanza

**📈 Evaluación Curricular**
• Indicadores de logro por grado
• Criterios de evaluación alineados
• Retroalimentación constructiva

¿Necesitas apoyo con la planificación de alguna unidad temática específica?`,

      analytics: `Como **Analista de Datos Educativos**, puedo proporcionarte:

**📊 Métricas de Rendimiento**
• Análisis estadístico del progreso estudiantil
• Comparativas por grupos y niveles
• Tendencias de aprendizaje identificadas

**🎯 Insights Personalizados**
• Patrones de fortalezas y debilidades
• Recomendaciones basadas en datos
• Predicciones de rendimiento futuro

**📈 Reportes Institucionales**
• Indicadores de calidad educativa
• Efectividad de metodologías aplicadas
• Áreas de oportunidad identificadas

¿Te interesa revisar algún aspecto específico del rendimiento académico?`
    }

    return agentResponses[agent?.type as keyof typeof agentResponses || 'tutor'] || agentResponses.tutor
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(message)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Educational Sidebar */}
      <div className="edu-sidebar flex flex-col">
        {/* Ministry Header */}
        <div className="edu-header">
          <div className="edu-logo">
            <div className="edu-logo-icon">
              <AcademicCapIconSolid className="w-6 h-6 text-white" />
            </div>
            <span>Ministerio de Educación</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="edu-user-profile">
          <div className={`edu-user-avatar ${userProfile.role}`}>
            {userProfile.name.charAt(0)}
          </div>
          <div className="edu-user-info">
            <div className="edu-user-name">{userProfile.name}</div>
            <div className="edu-user-role">
              {userProfile.role === 'student' ? 'Estudiante' : 
               userProfile.role === 'teacher' ? 'Docente' :
               userProfile.role === 'director' ? 'Director' : 'Ministro'}
            </div>
            {userProfile.grade && (
              <div className="edu-user-grade">{userProfile.grade}</div>
            )}
          </div>
        </div>

        {/* AI Agents Section */}
        <div className="edu-agents-section">
          <div className="edu-section-title">
            <AcademicCapIcon className="w-4 h-4" />
            Agentes AI
          </div>
          
          {aiAgents.map((agent) => {
            const agentConfig = {
              tutor: { icon: AcademicCapIcon, color: 'student' },
              evaluator: { icon: ClipboardDocumentListIcon, color: 'teacher' },
              counselor: { icon: HeartIcon, color: 'director' },
              curriculum: { icon: PresentationChartLineIcon, color: 'minister' },
              analytics: { icon: ChartBarIcon, color: 'student' }
            }[agent.type] || { icon: AcademicCapIcon, color: 'student' }
            
            return (
              <div
                key={agent.id}
                className={`edu-agent-item ${selectedAgent === agent.id ? 'active' : ''}`}
                onClick={() => setSelectedAgent(agent.id)}
              >
                <div className={`edu-agent-icon ${agentConfig.color} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <agentConfig.icon className="w-4 h-4 text-white" />
                </div>
                <div className="edu-agent-info">
                  <div className="edu-agent-name">{agent.name}</div>
                  <div className="edu-agent-description">{agent.description}</div>
                </div>
                <div className="edu-agent-status"></div>
              </div>
            )
          })}
        </div>

        {/* Progress Section for Students */}
        {userProfile.role === 'student' && (
          <div className="edu-progress-section">
            <div className="edu-progress-title">
              <AcademicCapIcon className="w-4 h-4" />
              Progreso Académico
            </div>
            <div className="edu-progress-bar">
              <div className="edu-progress-fill" style={{ width: '73%' }}></div>
            </div>
            <div className="edu-progress-text">
              <span>Progreso General</span>
              <span>73%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="edu-main flex flex-col">
        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="edu-welcome-container">
              {/* Welcome Icon */}
              <div className="edu-welcome-icon">
                <AcademicCapIconSolid className="w-8 h-8 text-white" />
              </div>
              
              {/* Welcome Title */}
              <h1 className="text-4xl font-bold text-[var(--edu-text-primary)] mb-4">
                Hola, estudiante
              </h1>
              <p className="text-xl text-[var(--edu-text-secondary)] mb-12 max-w-2xl mx-auto">
                Estoy aquí para ayudarte en tu proceso de aprendizaje con tecnología de inteligencia artificial avanzada.
              </p>

              {/* Educational Capabilities */}
              <div className="edu-capabilities">
                {capabilities.map((capability, index) => (
                  <button 
                    key={index}
                    className="edu-capability-item"
                    onClick={() => handleSendMessage(`Ayúdame con ${capability.title.toLowerCase()}`)}
                  >
                    <div className="edu-capability-content">
                      <div className="edu-capability-text">
                        <h3 className="edu-capability-title">{capability.title}</h3>
                        <p className="edu-capability-description">{capability.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Subjects Grid */}
              <div className="edu-subjects-grid">
                {subjects.map((subject, index) => (
                  <div 
                    key={index}
                    className="edu-subject-card"
                    onClick={() => handleSendMessage(`Necesito ayuda con ${subject.name}`)}
                  >
                    <div className="edu-subject-content">
                      <div className="edu-subject-name">{subject.name}</div>
                      <div className="edu-subject-level">
                        {subject.level === 'primary' ? 'Primaria' : 
                         subject.level === 'middle' ? 'Media' : 'Secundaria'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="edu-messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`edu-message ${message.sender}`}
                >
                  <div className={`edu-message-avatar ${message.sender}`}>
                    {message.sender === 'user' ? (
                      userProfile.name.charAt(0)
                    ) : (
                      <AcademicCapIconSolid className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="edu-message-content">
                    {message.agent && (
                      <div style={{ fontSize: '12px', color: 'var(--edu-green)', marginBottom: '8px', fontWeight: '600' }}>
                        {message.agent}
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ 
                      __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/• /g, '• ')
                        .replace(/\n/g, '<br/>') 
                    }} />
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="edu-message ai">
                  <div className="edu-message-avatar assistant">
                    <AcademicCapIconSolid className="w-5 h-5" />
                  </div>
                  <div className="edu-message-content">
                    <div style={{ fontSize: '12px', color: 'var(--edu-green)', marginBottom: '8px', fontWeight: '600' }}>
                      {aiAgents.find(agent => agent.id === selectedAgent)?.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span className="ml-2 text-sm">está escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Educational Input Area */}
      <div className="edu-input-container">
        <div className="edu-input-wrapper">
          <div className="edu-input-inner">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyPress={handleKeyPress}
              placeholder={`Pregúntale al ${aiAgents.find(a => a.id === selectedAgent)?.name}...`}
              className="edu-input"
              disabled={isTyping}
              rows={1}
              maxLength={5000}
            />
            
            <button
              onClick={() => handleSendMessage(message)}
              disabled={!message.trim() || isTyping}
              className="edu-send-btn"
            >
              <AcademicCapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 