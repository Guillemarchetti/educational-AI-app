'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Gamepad2, 
  Play, 
  Settings, 
  Sparkles,
  BookOpen,
  Loader2,
  Download,
  Copy,
  Eye,
  Pause,
  RotateCcw,
  Sliders
} from 'lucide-react'

interface ContentCreatorProps {
  className?: string
}

interface ContentOptions {
  concept: string
  level: string
  content_type: string
}

interface GeneratedContent {
  status: string
  content: string
  concept: string
  level: string
  content_type: string
  response_time: number
}

export function ContentCreator({ className = '' }: ContentCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [activeTab, setActiveTab] = useState<'specification' | 'simulator'>('specification')
  const [options, setOptions] = useState<ContentOptions>({
    concept: '',
    level: 'Secundaria',
    content_type: 'simulacion'
  })

  const contentTypes = [
    { id: 'simulacion', name: 'Simulación Interactiva', icon: '🎮', description: 'Laboratorios virtuales y manipuladores' },
    { id: 'juego', name: 'Juego Educativo', icon: '🎯', description: 'Actividades gamificadas y competencias' },
    { id: 'ejercicio', name: 'Ejercicio Interactivo', icon: '📝', description: 'Práctica guiada con retroalimentación' },
    { id: 'laboratorio', name: 'Laboratorio Virtual', icon: '🔬', description: 'Experimentos y exploración libre' }
  ]

  const levels = ['Primaria', '6to Grado', 'Secundaria', 'Preparatoria', 'Universidad']

  const subjects = [
    'Funciones Lineales', 'Ecuaciones Cuadráticas', 'Geometría Plana', 
    'Trigonometría', 'Estadística', 'Probabilidad', 'Fracciones', 
    'Álgebra Básica', 'Cálculo Diferencial'
  ]

  const handleGenerate = async () => {
    if (!options.concept.trim()) {
      alert('Por favor, ingresa un concepto matemático')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/agents/content-creator/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept: options.concept,
          level: options.level,
          content_type: options.content_type,
          userId: 'demo-user'
        }),
      })

      const data = await response.json()
      
      if (data.status === 'success') {
        setGeneratedContent(data)
      } else {
        alert('Error generando contenido: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error conectando con el servidor')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (generatedContent) {
      try {
        // Extraer el JSON del contenido para copiarlo de forma más limpia
        const jsonMatch = generatedContent.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const parsedContent = JSON.parse(jsonMatch[1]);
          navigator.clipboard.writeText(JSON.stringify(parsedContent, null, 2));
        } else {
          navigator.clipboard.writeText(generatedContent.content);
        }
        alert('Contenido copiado al portapapeles!')
      } catch (error) {
        navigator.clipboard.writeText(generatedContent.content);
        alert('Contenido copiado al portapapeles!')
      }
    }
  }

  return (
    <div className={`h-full bg-gray-900/50 backdrop-blur-xl ${className}`}>
      {/* Header */}
      <motion.div 
        className="border-b border-gray-800/50 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Creador de Contenido Interactivo</h1>
            <p className="text-gray-400 text-sm">Genera simulaciones y ejercicios matemáticos con IA</p>
          </div>
        </div>
      </motion.div>

      <div className="flex h-[calc(100%-120px)]">
        {/* Panel de Configuración */}
        <motion.div 
          className="w-80 border-r border-gray-800/50 p-6 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración
            </h3>

            {/* Concepto Matemático */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Concepto Matemático
              </label>
              <input
                type="text"
                value={options.concept}
                onChange={(e) => setOptions({...options, concept: e.target.value})}
                placeholder="Ej: Funciones Lineales"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              
              {/* Sugerencias rápidas */}
              <div className="flex flex-wrap gap-2">
                {subjects.slice(0, 4).map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setOptions({...options, concept: subject})}
                    className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Nivel Educativo */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Nivel Educativo
              </label>
              <select
                value={options.level}
                onChange={(e) => setOptions({...options, level: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Contenido */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Tipo de Contenido
              </label>
              <div className="space-y-2">
                {contentTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setOptions({...options, content_type: type.id})}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      options.content_type === type.id
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{type.icon}</span>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-gray-400">{type.description}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Botón Generar */}
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || !options.concept.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: isGenerating ? 1 : 1.02 }}
              whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Contenido</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Panel de Resultado */}
        <motion.div 
          className="flex-1 p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {!generatedContent ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  ¡Crea contenido interactivo!
                </h3>
                <p className="text-gray-500 max-w-md">
                  Configura los parámetros en el panel izquierdo y genera simulaciones, 
                  juegos y ejercicios matemáticos personalizados con inteligencia artificial.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Header del resultado */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Contenido Generado: {generatedContent.concept}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {generatedContent.content_type} • {generatedContent.level} • 
                    Generado en {generatedContent.response_time.toFixed(2)}s
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Copiar contenido"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Vista previa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pestañas */}
              <div className="flex space-x-1 mb-4">
                <button
                  onClick={() => setActiveTab('specification')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'specification'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  📋 Especificación
                </button>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'simulator'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  🎮 Simulador
                </button>
              </div>

              {/* Contenido generado */}
              <div className="flex-1 bg-gray-800/30 rounded-lg p-4 overflow-auto">
                {activeTab === 'specification' ? (
                  // Vista de especificación
                  (() => {
                    try {
                      // Extraer el JSON del contenido
                      const jsonMatch = generatedContent.content.match(/```json\n([\s\S]*?)\n```/);
                      if (jsonMatch) {
                        const parsedContent = JSON.parse(jsonMatch[1]);
                        return (
                          <div className="space-y-6 text-gray-300">
                            <div className="border-b border-gray-700 pb-4">
                              <h4 className="text-2xl font-bold text-blue-400 mb-2">
                                {parsedContent.titulo}
                              </h4>
                              <p className="text-gray-400">
                                {parsedContent.concepto_matematico} • {parsedContent.nivel_educativo}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-semibold text-green-400 mb-3 flex items-center">
                                  <span className="mr-2">📚</span> Objetivos de Aprendizaje
                                </h5>
                                <ul className="list-disc list-inside space-y-2 text-sm">
                                  {parsedContent.objetivos_aprendizaje?.map((objetivo: string, index: number) => (
                                    <li key={index} className="text-gray-300">{objetivo}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-semibold text-yellow-400 mb-3 flex items-center">
                                  <span className="mr-2">⚡</span> Elementos Interactivos
                                </h5>
                                <ul className="list-disc list-inside space-y-2 text-sm">
                                  {parsedContent.elementos_interactivos?.map((elemento: string, index: number) => (
                                    <li key={index} className="text-gray-300">{elemento}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold text-purple-400 mb-3 flex items-center">
                                <span className="mr-2">🎯</span> Descripción de la Simulación
                              </h5>
                              <p className="text-gray-300 leading-relaxed">{parsedContent.descripcion_simulacion}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-semibold text-pink-400 mb-3 flex items-center">
                                  <span className="mr-2">🎮</span> Gamificación
                                </h5>
                                <p className="text-sm text-gray-300">{parsedContent.mecanica_gamificacion || parsedContent.mecánica_gamificacion}</p>
                              </div>
                              
                              <div>
                                <h5 className="font-semibold text-cyan-400 mb-3 flex items-center">
                                  <span className="mr-2">🔧</span> Parámetros Configurables
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {parsedContent.parametros_configurables?.map((parametro: string, index: number) => (
                                    <li key={index} className="text-gray-300">{parametro}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-lg p-4 border border-gray-700">
                              <h5 className="font-semibold text-orange-400 mb-3 flex items-center">
                                <span className="mr-2">💡</span> Prompt para Desarrolladores
                              </h5>
                              <p className="text-sm text-gray-300 italic leading-relaxed">{parsedContent.prompt_generacion}</p>
                            </div>
                            
                            {parsedContent.retroalimentacion && (
                              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/50">
                                <h5 className="font-semibold text-blue-400 mb-2 flex items-center">
                                  <span className="mr-2">💬</span> Retroalimentación
                                </h5>
                                <p className="text-sm text-gray-300">{parsedContent.retroalimentacion}</p>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // Fallback al contenido original si no se puede parsear
                        return (
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                            {generatedContent.content}
                          </pre>
                        );
                      }
                    } catch (error) {
                      console.error('Error parsing content:', error);
                      return (
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                          {generatedContent.content}
                        </pre>
                      );
                    }
                  })()
                ) : (
                  // Vista del simulador
                  <InteractiveSimulator 
                    concept={generatedContent.concept} 
                    level={generatedContent.level} 
                  />
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Nuevo componente para simulaciones interactivas
const InteractiveSimulator = ({ concept, level }: { concept: string, level: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [parameters, setParameters] = useState({
    a: 1,
    b: 0,
    c: 0,
    speed: 1
  })
  const animationRef = useRef<number>()

  // Función para dibujar funciones cuadráticas
  const drawQuadratic = (ctx: CanvasRenderingContext2D, a: number, b: number, c: number) => {
    const canvas = ctx.canvas
    const width = canvas.width
    const height = canvas.height
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height)
    
    // Configurar sistema de coordenadas
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.scale(1, -1) // Invertir Y para que positivo sea hacia arriba
    
    // Dibujar ejes
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 1
    ctx.beginPath()
    // Eje X
    ctx.moveTo(-width/2, 0)
    ctx.lineTo(width/2, 0)
    // Eje Y
    ctx.moveTo(0, -height/2)
    ctx.lineTo(0, height/2)
    ctx.stroke()
    
    // Dibujar grilla
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.5
    const gridSize = 20
    for (let i = -width/2; i < width/2; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(i, -height/2)
      ctx.lineTo(i, height/2)
      ctx.stroke()
    }
    for (let i = -height/2; i < height/2; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(-width/2, i)
      ctx.lineTo(width/2, i)
      ctx.stroke()
    }
    
    // Dibujar función cuadrática
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    const scale = 5 // Escala para la función
    let firstPoint = true
    
    for (let x = -width/2; x < width/2; x += 1) {
      const realX = x / scale
      const y = (a * realX * realX + b * realX + c) * scale
      
      if (Math.abs(y) < height/2) {
        if (firstPoint) {
          ctx.moveTo(x, y)
          firstPoint = false
        } else {
          ctx.lineTo(x, y)
        }
      }
    }
    ctx.stroke()
    
    // Dibujar vértice
    const vertexX = -b / (2 * a)
    const vertexY = a * vertexX * vertexX + b * vertexX + c
    
    ctx.fillStyle = '#EF4444'
    ctx.beginPath()
    ctx.arc(vertexX * scale, vertexY * scale, 6, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.restore()
    
    // Agregar etiquetas
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px Inter'
    ctx.fillText(`y = ${a}x² + ${b}x + ${c}`, 10, 30)
    ctx.fillText(`Vértice: (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`, 10, 50)
  }

  // Función para dibujar funciones lineales
  const drawLinear = (ctx: CanvasRenderingContext2D, m: number, b: number) => {
    const canvas = ctx.canvas
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.scale(1, -1)
    
    // Ejes y grilla (mismo código que arriba)
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-width/2, 0)
    ctx.lineTo(width/2, 0)
    ctx.moveTo(0, -height/2)
    ctx.lineTo(0, height/2)
    ctx.stroke()
    
    // Dibujar función lineal
    ctx.strokeStyle = '#10B981'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    const scale = 10
    const x1 = -width/2
    const y1 = (m * (x1/scale) + b) * scale
    const x2 = width/2
    const y2 = (m * (x2/scale) + b) * scale
    
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    
    ctx.restore()
    
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px Inter'
    ctx.fillText(`y = ${m}x + ${b}`, 10, 30)
    ctx.fillText(`Pendiente: ${m}`, 10, 50)
    ctx.fillText(`Intersección Y: ${b}`, 10, 70)
  }

  // Animación
  const animate = () => {
    if (!canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    if (concept.toLowerCase().includes('cuadrática') || concept.toLowerCase().includes('quadratic')) {
      drawQuadratic(ctx, parameters.a, parameters.b, parameters.c)
    } else if (concept.toLowerCase().includes('lineal') || concept.toLowerCase().includes('linear')) {
      drawLinear(ctx, parameters.a, parameters.b)
    } else {
      // Simulación por defecto - función cuadrática
      drawQuadratic(ctx, parameters.a, parameters.b, parameters.c)
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }

  useEffect(() => {
    if (isPlaying) {
      animate()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, parameters])

  useEffect(() => {
    // Dibujar inicial
    animate()
  }, [concept])

  const resetParameters = () => {
    setParameters({ a: 1, b: 0, c: 0, speed: 1 })
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white flex items-center">
          <Play className="w-5 h-5 mr-2 text-green-400" />
          Simulación Interactiva
        </h4>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={resetParameters}
            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas de simulación */}
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-auto bg-gray-900 rounded-lg border border-gray-700"
          />
        </div>

        {/* Controles */}
        <div className="space-y-4">
          <div className="flex items-center mb-3">
            <Sliders className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Controles</span>
          </div>

          {/* Parámetro A */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Parámetro A: {parameters.a}
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={parameters.a}
              onChange={(e) => setParameters({...parameters, a: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Parámetro B */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Parámetro B: {parameters.b}
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={parameters.b}
              onChange={(e) => setParameters({...parameters, b: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Parámetro C (solo para cuadráticas) */}
          {(concept.toLowerCase().includes('cuadrática') || concept.toLowerCase().includes('quadratic') || !concept.toLowerCase().includes('lineal')) && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Parámetro C: {parameters.c}
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={parameters.c}
                onChange={(e) => setParameters({...parameters, c: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Información en tiempo real */}
          <div className="bg-gray-900/50 rounded-lg p-3 text-xs space-y-1">
            <div className="text-blue-400 font-medium">Información:</div>
            {concept.toLowerCase().includes('cuadrática') || concept.toLowerCase().includes('quadratic') || !concept.toLowerCase().includes('lineal') ? (
              <>
                <div className="text-gray-300">Ecuación: y = {parameters.a}x² + {parameters.b}x + {parameters.c}</div>
                <div className="text-gray-300">Vértice X: {(-parameters.b / (2 * parameters.a)).toFixed(2)}</div>
                <div className="text-gray-300">Abre: {parameters.a > 0 ? 'Hacia arriba' : 'Hacia abajo'}</div>
              </>
            ) : (
              <>
                <div className="text-gray-300">Ecuación: y = {parameters.a}x + {parameters.b}</div>
                <div className="text-gray-300">Pendiente: {parameters.a}</div>
                <div className="text-gray-300">Intersección Y: {parameters.b}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 