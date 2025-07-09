'use client'

import React, { useState, useRef, useEffect } from 'react'
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

// Educational AI Agents with Heroicons
const aiAgents = [
  {
    id: 'tutor',
    name: 'Tutor Virtual',
    description: 'Aprendizaje personalizado y adaptativo',
    icon: AcademicCapIcon,
    color: 'student',
    capabilities: ['Explicaciones personalizadas', 'Ejercicios adaptativos', 'Seguimiento de progreso']
  },
  {
    id: 'evaluador',
    name: 'Evaluador',
    description: 'Evaluación y seguimiento académico',
    icon: ClipboardDocumentListIcon,
    color: 'teacher',
    capabilities: ['Evaluaciones automáticas', 'Análisis de desempeño', 'Retroalimentación detallada']
  },
  {
    id: 'consejero',
    name: 'Consejero',
    description: 'Orientación académica y personal',
    icon: HeartIcon,
    color: 'director',
    capabilities: ['Orientación vocacional', 'Apoyo emocional', 'Desarrollo personal']
  },
  {
    id: 'planificador',
    name: 'Planificador',
    description: 'Diseño curricular y planificación',
    icon: PresentationChartLineIcon,
    color: 'minister',
    capabilities: ['Planes de estudio', 'Cronogramas', 'Recursos educativos']
  },
  {
    id: 'analitico',
    name: 'Analítico',
    description: 'Análisis de datos educativos',
    icon: ChartBarIcon,
    color: 'student',
    capabilities: ['Métricas de aprendizaje', 'Tendencias educativas', 'Informes detallados']
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

export default function MinisterioEducacionChat() {
  const [selectedAgent, setSelectedAgent] = useState('tutor')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userRole, setUserRole] = useState('student')
  const [userGrade, setUserGrade] = useState('5to')
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      agent: selectedAgent
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')
    setIsTyping(true)

    // Simular respuesta del agente AI
    setTimeout(() => {
      const agent = aiAgents.find(a => a.id === selectedAgent)
      const responses = {
        tutor: `Como tu Tutor Virtual, he analizado tu consulta. Te ayudo a entender este tema paso a paso, adaptándome a tu nivel de ${userGrade} grado. ¿Te gustaría que profundicemos en algún aspecto específico?`,
        evaluador: `He evaluado tu pregunta desde una perspectiva académica. Basándome en los estándares curriculares para ${userGrade} grado, puedo proporcionarte una evaluación detallada y sugerencias de mejora.`,
        consejero: `Como tu Consejero Académico, entiendo que cada estudiante tiene necesidades únicas. Te ofrezco orientación personalizada para tu desarrollo académico y personal en ${userGrade} grado.`,
        planificador: `Desde mi rol de Planificador Curricular, puedo ayudarte a estructurar tu aprendizaje de manera efectiva, considerando los objetivos específicos para ${userGrade} grado.`,
        analitico: `He analizado los datos relacionados con tu consulta. Los estudiantes de ${userGrade} grado muestran mejor rendimiento cuando abordan este tema con metodologías específicas que puedo recomendarte.`
      }

      const aiResponse = {
        id: Date.now() + 1,
        text: (responses as any)[selectedAgent] || 'Estoy aquí para ayudarte con tus estudios. ¿En qué puedo asistirte hoy?',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        agent: selectedAgent,
        agentName: agent?.name || 'Asistente Educativo'
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  const currentAgent = aiAgents.find(agent => agent.id === selectedAgent)

  return (
    <div className="flex h-screen bg-[var(--edu-bg-primary)] text-[var(--edu-text-primary)] font-inter">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--edu-bg-secondary)] border border-[var(--edu-border)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--edu-blue)] to-[var(--edu-blue-hover)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIconSolid className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--edu-text-primary)] mb-2">
                  Sistema Educativo IA
                </h2>
                <p className="text-[var(--edu-text-secondary)]">
                  Descubre todo lo que puedes hacer con nuestros agentes de inteligencia artificial
                </p>
              </div>

              {/* AI Agents Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {aiAgents.map((agent) => {
                  const IconComponent = agent.icon
                  return (
                    <div key={agent.id} className="bg-[var(--edu-bg-tertiary)] border border-[var(--edu-border)] rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br from-[var(--edu-blue)] to-[var(--edu-blue-hover)] rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[var(--edu-text-primary)] mb-2">
                            {agent.name}
                          </h3>
                          <p className="text-sm text-[var(--edu-text-secondary)] mb-3">
                            {agent.description}
                          </p>
                          <div className="space-y-1">
                            {agent.capabilities.map((capability, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs text-[var(--edu-text-muted)]">
                                <CheckCircleIconSolid className="w-3 h-3 text-[var(--edu-blue)]" />
                                <span>{capability}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Key Features */}
              <div className="bg-[var(--edu-bg-input)] border border-[var(--edu-border)] rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-[var(--edu-text-primary)] mb-4 text-center">
                  Características Principales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-[var(--edu-blue)] rounded-lg flex items-center justify-center mx-auto mb-2">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[var(--edu-text-primary)] mb-1">Personalizado</h4>
                    <p className="text-xs text-[var(--edu-text-muted)]">Adaptado a tu nivel y estilo de aprendizaje</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-[var(--edu-blue)] rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ClockIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[var(--edu-text-primary)] mb-1">24/7 Disponible</h4>
                    <p className="text-xs text-[var(--edu-text-muted)]">Asistencia educativa cuando la necesites</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-[var(--edu-blue)] rounded-lg flex items-center justify-center mx-auto mb-2">
                      <BookOpenIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-medium text-[var(--edu-text-primary)] mb-1">Multimodal</h4>
                    <p className="text-xs text-[var(--edu-text-muted)]">Textos, imágenes, videos y actividades</p>
                  </div>
                </div>
              </div>

              {/* Educational Levels */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[var(--edu-text-primary)] mb-4 text-center">
                  Niveles Educativos Cubiertos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--edu-bg-tertiary)] border border-[var(--edu-border)] rounded-lg p-4 text-center">
                    <StarIcon className="w-8 h-8 text-[var(--edu-primary)] mx-auto mb-2" />
                    <h4 className="font-semibold text-[var(--edu-text-primary)]">Primaria</h4>
                    <p className="text-sm text-[var(--edu-text-muted)]">1ro - 3ro Grado</p>
                  </div>
                  <div className="bg-[var(--edu-bg-tertiary)] border border-[var(--edu-border)] rounded-lg p-4 text-center">
                    <TrophyIcon className="w-8 h-8 text-[var(--edu-middle)] mx-auto mb-2" />
                    <h4 className="font-semibold text-[var(--edu-text-primary)]">Media</h4>
                    <p className="text-sm text-[var(--edu-text-muted)]">4to - 6to Grado</p>
                  </div>
                  <div className="bg-[var(--edu-bg-tertiary)] border border-[var(--edu-border)] rounded-lg p-4 text-center">
                    <FireIcon className="w-8 h-8 text-[var(--edu-secondary)] mx-auto mb-2" />
                    <h4 className="font-semibold text-[var(--edu-text-primary)]">Secundaria</h4>
                    <p className="text-sm text-[var(--edu-text-muted)]">7mo - 9no Grado</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-[var(--edu-blue)] to-[var(--edu-blue-hover)] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Comenzar a Aprender
                </button>
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="px-8 py-3 bg-[var(--edu-bg-input)] border border-[var(--edu-border)] text-[var(--edu-text-primary)] rounded-xl font-semibold hover:bg-[var(--edu-bg-tertiary)] transition-all duration-200"
                >
                  Explorar Agentes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-[var(--edu-bg-sidebar)] border-r border-[var(--edu-border)] flex flex-col overflow-hidden`}>
        {/* Header fijo del sidebar */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--edu-border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--edu-blue)] to-[var(--edu-blue-hover)] rounded-lg flex items-center justify-center">
                <AcademicCapIconSolid className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[var(--edu-text-primary)]">MinEdu AI</h1>
                <p className="text-xs text-[var(--edu-text-muted)]">Asistente Educativo</p>
              </div>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-center space-x-2 bg-[var(--edu-blue)] hover:bg-[var(--edu-blue-hover)] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium">
            <PlusIcon className="w-4 h-4" />
            <span>Nueva conversación</span>
          </button>
        </div>

        {/* Navegación fija */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--edu-border)]">
          <div className="flex items-center space-x-2 text-[var(--edu-text-secondary)] mb-2">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Agentes Educativos</span>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto edu-scrollbar">
          {/* AI Agents Section */}
          <div className="p-4">
            <div className="space-y-2">
              {aiAgents.map((agent) => {
                const IconComponent = agent.icon
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`edu-agent-item w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedAgent === agent.id ? 'active' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`edu-agent-icon ${agent.color} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{agent.name}</div>
                        <div className="text-xs text-[var(--edu-text-muted)] truncate">{agent.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Educational Levels Section */}
          <div className="p-4 border-t border-[var(--edu-border)]">
            <h3 className="text-xs font-semibold text-[var(--edu-text-muted)] uppercase tracking-wider mb-3">Niveles Educativos</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-[var(--edu-bg-tertiary)]">
                <StarIcon className="w-4 h-4 text-[var(--edu-primary)]" />
                <span className="text-sm">Primaria (1ro-3ro)</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-[var(--edu-bg-tertiary)]">
                <TrophyIcon className="w-4 h-4 text-[var(--edu-middle)]" />
                <span className="text-sm">Media (4to-6to)</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-[var(--edu-bg-tertiary)]">
                <FireIcon className="w-4 h-4 text-[var(--edu-secondary)]" />
                <span className="text-sm">Secundaria (7mo-9no)</span>
              </div>
            </div>
          </div>

          {/* Subjects Section */}
          <div className="p-4 border-t border-[var(--edu-border)]">
            <h3 className="text-xs font-semibold text-[var(--edu-text-muted)] uppercase tracking-wider mb-3">Materias</h3>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((subject, index) => (
                <div key={index} className="edu-subject-card p-3 rounded-lg border border-[var(--edu-border)] hover:border-[var(--edu-blue)] transition-all duration-200 cursor-pointer">
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
        </div>

        {/* User menu fijo en la parte inferior */}
        <div className="flex-shrink-0 p-4 border-t border-[var(--edu-border)] bg-[var(--edu-bg-sidebar)] backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <UserCircleIconSolid className="w-8 h-8 text-[var(--edu-blue)]" />
            <div className="flex-1">
              <div className="text-sm font-medium">Estudiante</div>
              <div className="text-xs text-[var(--edu-text-muted)] flex items-center space-x-2">
                <span>{userGrade} Grado</span>
                <span className="edu-user-grade">Activo</span>
              </div>
            </div>
            <Cog6ToothIcon className="w-4 h-4 text-[var(--edu-text-muted)] hover:text-[var(--edu-text-primary)] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="edu-header">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-3">
              {currentAgent && (
                <>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <currentAgent.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-white">{currentAgent.name}</h1>
                    <p className="text-sm text-white/80">{currentAgent.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              <ShareIcon className="w-4 h-4" />
              <span className="text-sm">Compartir</span>
            </button>
            <UserCircleIcon className="w-8 h-8 text-white/80 hover:text-white cursor-pointer" />
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col bg-[var(--edu-bg-chat)]">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="edu-welcome-icon mb-8">
                  <AcademicCapIconSolid className="w-16 h-16 text-white" />
                </div>
                
                <h1 className="text-4xl font-bold text-[var(--edu-text-primary)] mb-4">
                  Hola, estudiante
                </h1>
                <p className="text-xl text-[var(--edu-text-secondary)] mb-12 max-w-2xl mx-auto">
                  Estoy aquí para ayudarte en tu proceso de aprendizaje con tecnología de inteligencia artificial avanzada.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {capabilities.map((capability, index) => (
                    <button 
                      key={index}
                      className="edu-capability-item"
                      onClick={() => setMessage(capability.title)}
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
                      onClick={() => setMessage(`Ayúdame con ${subject.name}`)}
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

                <div className="text-center">
                  <p className="text-[var(--edu-text-muted)] mb-4">Selecciona un agente educativo y comienza a aprender</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-[var(--edu-text-dimmed)]">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIconSolid className="w-4 h-4 text-[var(--edu-success)]" />
                      <span>Contenido oficial MinEdu</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIconSolid className="w-4 h-4 text-[var(--edu-success)]" />
                      <span>Aprendizaje personalizado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIconSolid className="w-4 h-4 text-[var(--edu-success)]" />
                      <span>Disponible 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start space-x-4 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`edu-message-avatar ${msg.sender} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}>
                    {msg.sender === 'user' ? (
                      <UserCircleIconSolid className="w-6 h-6" />
                    ) : (
                      <AcademicCapIconSolid className="w-5 h-5" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-3xl ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.sender === 'assistant' && (
                      <div className="text-sm text-[var(--edu-blue)] font-medium mb-1">{msg.agentName}</div>
                    )}
                    <div className={`edu-message-bubble ${msg.sender} p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-[var(--edu-blue)] text-white ml-auto' : 'bg-[var(--edu-bg-secondary)] text-[var(--edu-text-primary)]'}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="text-xs text-[var(--edu-text-muted)] mt-1">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-4">
                  <div className="edu-message-avatar assistant w-8 h-8 rounded-full flex items-center justify-center">
                    <AcademicCapIconSolid className="w-5 h-5" />
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <div className="text-sm text-[var(--edu-blue)] font-medium mb-1">{currentAgent?.name}</div>
                    <div className="edu-message-bubble assistant p-4 rounded-2xl bg-[var(--edu-bg-secondary)]">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[var(--edu-blue)] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[var(--edu-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-[var(--edu-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-[var(--edu-text-muted)] text-sm">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          <div className="flex-shrink-0 p-6 border-t border-[var(--edu-border)]">
            <div className="max-w-4xl mx-auto">
              <div className="edu-input-wrapper relative bg-[var(--edu-bg-input)] border border-[var(--edu-border)] rounded-2xl p-4 transition-all duration-300">
                <div className="flex items-end space-x-4">
                  <div className="flex space-x-2">
                    <button className="p-2 text-[var(--edu-text-muted)] hover:text-[var(--edu-text-primary)] hover:bg-[var(--edu-bg-tertiary)] rounded-lg transition-all duration-200">
                      <PaperClipIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-[var(--edu-text-muted)] hover:text-[var(--edu-text-primary)] hover:bg-[var(--edu-bg-tertiary)] rounded-lg transition-all duration-200">
                      <MicrophoneIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu pregunta sobre cualquier materia..."
                      className="w-full bg-transparent text-[var(--edu-text-primary)] placeholder-[var(--edu-text-muted)] resize-none border-none outline-none min-h-[24px] max-h-[120px] edu-scrollbar"
                      rows={1}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 text-xs text-[var(--edu-text-muted)]">
                      <span>{message.length}/2000</span>
                    </div>
                    <button className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--edu-bg-tertiary)] hover:bg-[var(--edu-bg-secondary)] rounded-lg transition-all duration-200 text-sm">
                      <span>MinEdu AI</span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="edu-send-btn p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center mt-4 text-xs text-[var(--edu-text-dimmed)]">
                <p>MinEdu AI puede cometer errores. Verifica la información importante con tus docentes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 