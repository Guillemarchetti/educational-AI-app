'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'
import { 
  Search, 
  Play, 
  ExternalLink, 
  BookOpen, 
  Calculator, 
  Beaker,
  Ruler,
  Youtube,
  Globe,
  FileText,
  Volume2,
  Download,
  Heart,
  Share2,
  Eye,
  Clock
} from 'lucide-react'
import { ChatInterface } from './ChatInterface'
import { Message } from './ChatInterface'

interface MultimediaContent {
  id: string
  title: string
  type: 'video' | 'article' | 'interactive' | 'document'
  url: string
  thumbnail?: string
  description: string
  duration?: string
  difficulty: 'básico' | 'intermedio' | 'avanzado'
  subject: string
  topics: string[]
  views?: number
  rating?: number
  source: string
}

interface FileNode {
  name: string;
  url: string;
  id?: string;
}

interface ContextSearchProps {
  contextText: string[]
  onRemoveContext: (index: number) => void
  isDraggingOver: boolean
  setIsDraggingOver: (dragging: boolean) => void
  onFileDrop: (file: FileNode) => void
  isExtracting: boolean
  selectedFile?: { name: string; url: string; id?: string } | null
  onSendWelcomeMessage: (message: string) => void
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  showProgress: boolean
  onToggleProgress: () => void
}

export function ContextSearch({
  contextText,
  onRemoveContext,
  isDraggingOver,
  setIsDraggingOver,
  onFileDrop,
  isExtracting,
  selectedFile,
  onSendWelcomeMessage,
  messages,
  setMessages,
  showProgress,
  onToggleProgress
}: ContextSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [multimediaContent, setMultimediaContent] = useState<MultimediaContent[]>([])
  const [selectedContent, setSelectedContent] = useState<MultimediaContent | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'video' | 'article' | 'interactive' | 'document'>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'básico' | 'intermedio' | 'avanzado'>('all')

  // Contenido multimedia de ejemplo para matemáticas, volumen y litros
  const sampleContent: MultimediaContent[] = [
    {
      id: '1',
      title: 'Volumen de Prismas y Cilindros - Explicación Completa',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=ejemplo1',
      thumbnail: 'https://img.youtube.com/vi/ejemplo1/maxresdefault.jpg',
      description: 'Aprende a calcular el volumen de prismas rectangulares y cilindros. Incluye ejemplos prácticos con litros y medidas reales.',
      duration: '12:34',
      difficulty: 'intermedio',
      subject: 'Matemáticas',
      topics: ['volumen', 'prismas', 'cilindros', 'litros', 'geometría'],
      views: 45623,
      rating: 4.8,
      source: 'YouTube - Matemáticas Fáciles'
    },
    {
      id: '2',
      title: 'Conversión de Unidades de Volumen: ml, litros, m³',
      type: 'interactive',
      url: 'https://ejemplo.com/conversor-volumen',
      description: 'Herramienta interactiva para convertir entre diferentes unidades de volumen. Practica con ejercicios guiados.',
      difficulty: 'básico',
      subject: 'Matemáticas',
      topics: ['conversión', 'unidades', 'volumen', 'litros', 'mililitros'],
      views: 23456,
      rating: 4.6,
      source: 'MathTools Online'
    },
    {
      id: '3',
      title: 'Problemas Resueltos: Volumen en la Vida Cotidiana',
      type: 'document',
      url: 'https://ejemplo.com/problemas-volumen.pdf',
      description: 'Colección de 50 problemas resueltos sobre cálculo de volumen aplicado a situaciones reales: tanques, piscinas, envases.',
      difficulty: 'avanzado',
      subject: 'Matemáticas',
      topics: ['problemas', 'volumen', 'aplicaciones', 'tanques', 'piscinas'],
      views: 12890,
      rating: 4.9,
      source: 'Editorial Matemática'
    },
    {
      id: '4',
      title: 'Fórmulas de Volumen - Guía Visual Interactiva',
      type: 'interactive',
      url: 'https://ejemplo.com/formulas-volumen',
      description: 'Explora las fórmulas de volumen de diferentes figuras geométricas con animaciones 3D y calculadoras integradas.',
      difficulty: 'intermedio',
      subject: 'Matemáticas',
      topics: ['fórmulas', 'volumen', '3D', 'geometría', 'calculadora'],
      views: 34567,
      rating: 4.7,
      source: 'GeoMath 3D'
    },
    {
      id: '5',
      title: 'Experimentos con Volumen y Capacidad',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=ejemplo2',
      thumbnail: 'https://img.youtube.com/vi/ejemplo2/maxresdefault.jpg',
      description: 'Experimentos prácticos para entender el concepto de volumen y capacidad usando materiales caseros.',
      duration: '8:45',
      difficulty: 'básico',
      subject: 'Matemáticas',
      topics: ['experimentos', 'volumen', 'capacidad', 'práctico', 'casero'],
      views: 78901,
      rating: 4.5,
      source: 'YouTube - Ciencia Divertida'
    },
    {
      id: '6',
      title: 'Cálculo de Volumen de Figuras Irregulares',
      type: 'article',
      url: 'https://ejemplo.com/volumen-irregular',
      description: 'Métodos avanzados para calcular el volumen de objetos con formas irregulares usando desplazamiento de agua.',
      difficulty: 'avanzado',
      subject: 'Matemáticas',
      topics: ['volumen', 'irregular', 'desplazamiento', 'agua', 'método'],
      views: 15678,
      rating: 4.4,
      source: 'Revista Matemática'
    },
    {
      id: '7',
      title: 'Simulador de Llenado de Tanques',
      type: 'interactive',
      url: 'https://ejemplo.com/simulador-tanques',
      description: 'Simula el llenado de diferentes tipos de tanques y aprende sobre velocidad de llenado y volumen.',
      difficulty: 'intermedio',
      subject: 'Matemáticas',
      topics: ['simulador', 'tanques', 'llenado', 'velocidad', 'volumen'],
      views: 28934,
      rating: 4.6,
      source: 'SimuMath'
    },
    {
      id: '8',
      title: 'Historia del Sistema Métrico y las Unidades de Volumen',
      type: 'article',
      url: 'https://ejemplo.com/historia-sistema-metrico',
      description: 'Fascinante recorrido por la historia del sistema métrico y cómo se establecieron las unidades de volumen.',
      difficulty: 'básico',
      subject: 'Matemáticas',
      topics: ['historia', 'sistema métrico', 'unidades', 'volumen', 'litro'],
      views: 9876,
      rating: 4.3,
      source: 'Historia de la Ciencia'
    }
  ]

  // Generar contenido basado en el contexto
  const generateContextBasedContent = async (context: string[]) => {
    console.log('ContextSearch: Starting content generation with context:', context)
    setIsSearching(true)
    
    // Simular búsqueda basada en contexto
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Filtrar contenido relevante basado en palabras clave del contexto
    const contextString = context.join(' ').toLowerCase()
    console.log('ContextSearch: Context string for filtering:', contextString.substring(0, 200) + '...')
    
    const searchTerms = ['volumen', 'litro', 'matemática', 'geometría', 'prisma', 'cilindro', 'capacidad', 'math', 'matematicas']
    const relevantContent = sampleContent.filter(item => {
      const matches = searchTerms.some(term => 
        contextString.includes(term) || 
        item.topics.some(topic => topic.toLowerCase().includes(term)) ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      )
      return matches
    })
    
    console.log('ContextSearch: Found', relevantContent.length, 'relevant items out of', sampleContent.length)
    setMultimediaContent(relevantContent.length > 0 ? relevantContent : sampleContent)
    setIsSearching(false)
  }

  // Buscar contenido manual
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const filtered = sampleContent.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    
    setMultimediaContent(filtered.length > 0 ? filtered : sampleContent)
    setIsSearching(false)
  }

  // Filtrar contenido
  const filteredContent = multimediaContent.filter(item => {
    const typeMatch = filterType === 'all' || item.type === filterType
    const difficultyMatch = filterDifficulty === 'all' || item.difficulty === filterDifficulty
    return typeMatch && difficultyMatch
  })

  // Cargar contenido inicial
  useEffect(() => {
    console.log('ContextSearch: contextText changed:', contextText)
    if (contextText.length > 0) {
      console.log('ContextSearch: Generating content based on context')
      generateContextBasedContent(contextText)
    } else {
      console.log('ContextSearch: No context, clearing content')
      setMultimediaContent([])
    }
  }, [contextText])

  // Generar contenido cuando hay mensajes del chat
  useEffect(() => {
    console.log('ContextSearch: messages changed:', messages.length, 'contextText:', contextText.length)
    if (messages.length > 0 && contextText.length === 0) {
      // Extraer términos relevantes de los mensajes del chat
      const chatContext = messages.map(msg => msg.text).join(' ')
      console.log('ContextSearch: Checking chat context for relevant terms:', chatContext.substring(0, 100) + '...')
      if (chatContext.toLowerCase().includes('volumen') || 
          chatContext.toLowerCase().includes('litro') || 
          chatContext.toLowerCase().includes('matemática') ||
          chatContext.toLowerCase().includes('geometría')) {
        console.log('ContextSearch: Found relevant terms, generating content')
        generateContextBasedContent([chatContext])
      }
    }
  }, [messages, contextText])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />
      case 'article': return <FileText className="w-4 h-4" />
      case 'interactive': return <Calculator className="w-4 h-4" />
      case 'document': return <BookOpen className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'article': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'interactive': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'document': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'básico': return 'bg-green-500/20 text-green-400'
      case 'intermedio': return 'bg-yellow-500/20 text-yellow-400'
      case 'avanzado': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const handleContentClick = (content: MultimediaContent) => {
    setSelectedContent(content)
    
    // Crear un mensaje automático en el chat sobre el contenido seleccionado
    const contentMessage = `He seleccionado el contenido "${content.title}" sobre ${content.topics.join(', ')}. ¿Puedes explicarme más sobre este tema y cómo se relaciona con el volumen y las matemáticas?`
    
    // Simular envío de mensaje al chat
    const userMessage: Message = {
      id: Date.now(),
      text: contentMessage,
      sender: 'user',
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Simular respuesta de la IA después de un momento
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: `Perfecto! Has seleccionado "${content.title}". Este contenido de nivel ${content.difficulty} aborda temas clave como ${content.topics.slice(0, 3).join(', ')}. 

${content.description}

Te recomiendo este recurso porque se alinea perfectamente con el contexto de matemáticas y volumen que estamos trabajando. ¿Te gustaría que profundice en algún aspecto específico o que busque contenido complementario?`,
        sender: 'ai',
        timestamp: new Date(),
        agent: 'Asistente de Búsqueda'
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  return (
    <div className="h-full bg-enterprise-900">
      <PanelGroup key="context-search-panels" direction="horizontal">
        {/* Panel Multimedia - 70% */}
        <Panel defaultSize={70} minSize={50}>
          <div className="h-full flex flex-col bg-enterprise-900/50">
        {/* Header del Panel Multimedia */}
        <div className="p-4 border-b border-enterprise-800/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Contenido Multimedia</h2>
              <p className="text-sm text-slate-400">
                {isSearching 
                  ? 'Analizando contexto...' 
                  : contextText.length > 0 || messages.length > 0 
                  ? `Recursos relacionados al contexto (${contextText.length} contextos)` 
                  : 'Esperando consulta o contexto'
                }
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar contenido específico..."
                className="w-full bg-enterprise-800/50 border border-enterprise-700 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500/50"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {isSearching ? '...' : 'Buscar'}
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 text-xs">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-enterprise-800/50 border border-enterprise-700 rounded px-2 py-1 text-white text-xs"
            >
              <option value="all">Todos los tipos</option>
              <option value="video">Videos</option>
              <option value="article">Artículos</option>
              <option value="interactive">Interactivos</option>
              <option value="document">Documentos</option>
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as any)}
              className="bg-enterprise-800/50 border border-enterprise-700 rounded px-2 py-1 text-white text-xs"
            >
              <option value="all">Todas las dificultades</option>
              <option value="básico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>

        {/* Lista de Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Buscando contenido relevante...</p>
            </div>
          ) : contextText.length === 0 && messages.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Búsqueda por Contexto</h3>
              <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">
                Para ver contenido multimedia relevante, puedes:
              </p>
              <div className="space-y-2 text-sm text-slate-300 max-w-sm mx-auto mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Hacer una consulta en el chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Cargar contexto desde un documento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Buscar términos específicos</span>
                </div>
              </div>
              
              {/* Información de debug */}
              <div className="bg-enterprise-800/30 rounded-lg p-4 border border-enterprise-700/50 max-w-md mx-auto">
                <h4 className="text-white font-semibold text-sm mb-2">Estado del Contexto</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Contextos cargados: {contextText.length}</div>
                  <div>Mensajes en chat: {messages.length}</div>
                  <div>Archivo seleccionado: {selectedFile?.name || 'Ninguno'}</div>
                </div>
                {contextText.length > 0 && (
                  <div className="mt-3 text-xs text-slate-300">
                    <div className="font-medium mb-1">Contextos disponibles:</div>
                    {contextText.slice(0, 2).map((ctx, i) => (
                      <div key={i} className="truncate bg-enterprise-700/30 rounded px-2 py-1 mb-1">
                        {ctx.substring(0, 60)}...
                      </div>
                    ))}
                    {contextText.length > 2 && (
                      <div className="text-slate-400">+{contextText.length - 2} más</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContent.map((content) => (
                <motion.div
                  key={content.id}
                  className="bg-enterprise-800/30 border border-enterprise-700/50 rounded-lg p-3 hover:bg-enterprise-800/50 transition-colors cursor-pointer"
                  onClick={() => handleContentClick(content)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(content.type)} border`}>
                      {getTypeIcon(content.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
                        {content.title}
                      </h3>
                      <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                        {content.description}
                      </p>
                      
                      {/* Metadatos */}
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <span className={`px-2 py-0.5 rounded-full ${getDifficultyColor(content.difficulty)}`}>
                          {content.difficulty}
                        </span>
                        {content.duration && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {content.duration}
                          </span>
                        )}
                        {content.views && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Eye className="w-3 h-3" />
                            {content.views.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Temas */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {content.topics.slice(0, 3).map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-enterprise-700/50 text-slate-300 rounded text-xs"
                          >
                            {topic}
                          </span>
                        ))}
                        {content.topics.length > 3 && (
                          <span className="px-2 py-0.5 bg-enterprise-700/50 text-slate-400 rounded text-xs">
                            +{content.topics.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Fuente y rating */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">{content.source}</span>
                        {content.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-slate-400 text-xs">{content.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-enterprise-700/30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(content.url, '_blank')
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Abrir
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Agregar a favoritos
                        console.log('Agregado a favoritos:', content.title)
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-enterprise-700/50 hover:bg-enterprise-700/70 text-slate-400 rounded text-xs transition-colors"
                    >
                      <Heart className="w-3 h-3" />
                      Guardar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Compartir
                        navigator.clipboard.writeText(content.url)
                        console.log('Enlace copiado al portapapeles')
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-enterprise-700/50 hover:bg-enterprise-700/70 text-slate-400 rounded text-xs transition-colors"
                    >
                      <Share2 className="w-3 h-3" />
                      Compartir
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredContent.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">No se encontró contenido</h3>
              <p className="text-slate-400 text-sm">
                Intenta ajustar los filtros o buscar términos diferentes
              </p>
            </div>
          )}
        </div>

        {/* Footer con estadísticas */}
        <div className="p-3 border-t border-enterprise-800/50 bg-enterprise-900/70 flex-shrink-0">
          <div className="flex items-center justify-center text-xs text-slate-400">
            <span>
              {contextText.length === 0 && messages.length === 0 
                ? 'Esperando consulta o contexto...' 
                : `${filteredContent.length} recursos encontrados`
              }
            </span>
          </div>
        </div>
                </div>
        </Panel>

        {/* Panel Resize Handle */}
        <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />

        {/* Panel de Chat - 30% */}
        <Panel defaultSize={30} minSize={25}>
          <ChatInterface
            contextText={contextText}
            onRemoveContext={onRemoveContext}
            isDraggingOver={isDraggingOver}
            setIsDraggingOver={setIsDraggingOver}
            onFileDrop={onFileDrop}
            isExtracting={isExtracting}
            selectedFile={selectedFile}
            onSendWelcomeMessage={onSendWelcomeMessage}
            messages={messages}
            setMessages={setMessages}
            showProgress={showProgress}
            onToggleProgress={onToggleProgress}
            hideHeaderIcons={true}
          />
        </Panel>
      </PanelGroup>
    </div>
  )
} 