'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Trophy,
  Zap,
  BookOpen,
  RotateCcw
} from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuizSession {
  id: string
  questions: QuizQuestion[]
  currentQuestion: number
  answers: number[]
  startTime: Date
  endTime?: Date
  score: number
  totalQuestions: number
  timeLimit?: number // en minutos
}

interface QuizSystemProps {
  context: string[]
  onClose: () => void
  onSendMessage: (message: string) => void
  selectedFile?: { name: string; url: string; id?: string } | null
}

export function QuizSystem({ context, onClose, onSendMessage, selectedFile }: QuizSystemProps) {
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [showErrorSummary, setShowErrorSummary] = useState(false)

  // Generar quiz basado en el contexto
  const generateQuiz = async () => {
    // Verificar si hay contexto agregado al chat
    if (context.length === 0) {
      alert('Por favor, agrega contexto al chat primero (selecciona texto o imágenes del documento)')
      return
    }
    
    // Usar solo el contexto agregado al chat
    const contextString = context.join('\n\n---\n\n');
    await generateQuizFromContext(contextString);
  }

  const generateQuizFromContext = async (contextString: string) => {

    setIsGenerating(true)
    
    try {
      const prompt = `Basándote en el siguiente contexto específico del chat, genera un quiz de 5 preguntas con 4 opciones cada una. 
      
      IMPORTANTE: Solo usa el contexto proporcionado, no agregues información externa.
      
      Formato de respuesta JSON:
      {
        "questions": [
          {
            "question": "Pregunta específica sobre el contexto",
            "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
            "correctAnswer": 0,
            "explanation": "Explicación detallada de por qué es correcta basada en el contexto",
            "difficulty": "easy"
          }
        ]
      }
      
      Contexto del chat: ${contextString}
      
      Genera preguntas específicas que se enfoquen en los conceptos, detalles o elementos mencionados en el contexto. Las preguntas deben ser claras y las opciones deben ser plausibles pero con una respuesta correcta definitiva.`

      const response = await fetch('http://localhost:8000/api/agents/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          userId: 'demo-user',
          context: contextString,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Intentar parsear la respuesta JSON
      let quizData
      try {
        // Buscar JSON en la respuesta
        const jsonMatch = data.response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          quizData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No se encontró JSON válido en la respuesta')
        }
      } catch (parseError) {
        console.error('Error parsing quiz JSON:', parseError)
        // Crear quiz de ejemplo si falla el parsing
        quizData = {
          questions: [
            {
              question: "¿Qué tema principal se aborda en este documento?",
              options: ["Matemáticas", "Historia", "Ciencias", "Literatura"],
              correctAnswer: 0,
              explanation: "Basado en el contenido del documento",
              difficulty: "easy"
            }
          ]
        }
      }

      const newQuizSession: QuizSession = {
        id: Date.now().toString(),
        questions: quizData.questions || [],
        currentQuestion: 0,
        answers: [],
        startTime: new Date(),
        score: 0,
        totalQuestions: quizData.questions?.length || 0,
        timeLimit: 10 // 10 minutos por defecto
      }

      setQuizSession(newQuizSession)
      setTimeRemaining(newQuizSession.timeLimit! * 60) // Convertir a segundos

    } catch (error) {
      console.error('Error generando quiz:', error)
      alert('Error generando el quiz. Intenta de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Manejar respuesta seleccionada
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  // Confirmar respuesta
  const confirmAnswer = () => {
    if (selectedAnswer === null || !quizSession) return

    const newAnswers = [...quizSession.answers, selectedAnswer]
    const isCorrect = selectedAnswer === quizSession.questions[quizSession.currentQuestion].correctAnswer
    const newScore = isCorrect ? quizSession.score + 1 : quizSession.score

    if (quizSession.currentQuestion + 1 >= quizSession.questions.length) {
      // Quiz completado
      const completedSession = {
        ...quizSession,
        answers: newAnswers,
        score: newScore,
        endTime: new Date(),
        currentQuestion: quizSession.currentQuestion + 1
      }
      setQuizSession(completedSession)
      setShowResults(true)
    } else {
      // Siguiente pregunta
      setQuizSession({
        ...quizSession,
        answers: newAnswers,
        score: newScore,
        currentQuestion: quizSession.currentQuestion + 1
      })
      setSelectedAnswer(null)
    }
  }

  // Reiniciar quiz
  const restartQuiz = () => {
    setQuizSession(null)
    setShowResults(false)
    setSelectedAnswer(null)
    setTimeRemaining(0)
  }

  // Generar mensaje de refuerzo basado en errores
  const generateReinforcementMessage = () => {
    if (!quizSession) return ""

    const wrongAnswers = quizSession.answers.map((answer, index) => {
      const question = quizSession.questions[index]
      const isCorrect = answer === question.correctAnswer
      return {
        question: question.question,
        userAnswer: question.options[answer],
        correctAnswer: question.options[question.correctAnswer],
        explanation: question.explanation,
        isCorrect
      }
    }).filter(item => !item.isCorrect)

    if (wrongAnswers.length === 0) {
      return "¡Excelente! No necesitas refuerzo, has respondido todo correctamente. ¿Te gustaría que profundice en algún concepto específico del tema?"
    }

    const reinforcementPrompt = `Necesito refuerzo en los siguientes conceptos que fallé en el quiz:

${wrongAnswers.map((item, index) => `
**Pregunta ${index + 1}:** ${item.question}
**Mi respuesta:** ${item.userAnswer} ❌
**Respuesta correcta:** ${item.correctAnswer} ✅
**Explicación:** ${item.explanation}

`).join('')}

Por favor, ayúdame a entender mejor estos conceptos y dame ejercicios prácticos para reforzar mi aprendizaje.`

    return reinforcementPrompt
  }

  // Enviar refuerzo al chat
  const sendReinforcementToChat = () => {
    const reinforcementMessage = generateReinforcementMessage()
    onSendMessage(reinforcementMessage)
    onClose()
  }

  // Obtener errores del quiz
  const getQuizErrors = () => {
    if (!quizSession) return []
    
    return quizSession.answers.map((answer, index) => {
      const question = quizSession.questions[index]
      const isCorrect = answer === question.correctAnswer
      return {
        question: question.question,
        userAnswer: question.options[answer],
        correctAnswer: question.options[question.correctAnswer],
        explanation: question.explanation,
        isCorrect
      }
    }).filter(item => !item.isCorrect)
  }

  // Timer effect
  useEffect(() => {
    if (quizSession && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Tiempo agotado
            const completedSession = {
              ...quizSession,
              endTime: new Date(),
              currentQuestion: quizSession.questions.length
            }
            setQuizSession(completedSession)
            setShowResults(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizSession, timeRemaining, showResults])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScorePercentage = () => {
    if (!quizSession) return 0
    return Math.round((quizSession.score / quizSession.totalQuestions) * 100)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return '¡Excelente! Eres un maestro'
    if (percentage >= 80) return '¡Muy bien! Tienes buen dominio'
    if (percentage >= 60) return 'Bien, pero puedes mejorar'
    return 'Necesitas repasar más el contenido'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
    >
      <motion.div
        className="bg-enterprise-900 border border-enterprise-800 rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[98vh] overflow-hidden flex flex-col"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-enterprise-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Quiz Inteligente</h2>
                <p className="text-sm text-slate-400">Pon a prueba tu conocimiento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {!quizSession && !isGenerating && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="mb-4">
                  <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-white mb-1">
                    ¿Listo para el desafío?
                  </h3>
                  <p className="text-slate-400 mb-4 text-sm">
                    Generaremos un quiz personalizado basado en el contexto que has agregado al chat
                  </p>
                  
                  {/* Información del contexto */}
                  {context.length > 0 && (
                    <div className="bg-enterprise-800/50 rounded-lg p-3 border border-enterprise-700 mb-4">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm">Contexto Disponible</h4>
                          <p className="text-slate-400 text-xs mb-2">{context.length} elemento(s) agregado(s)</p>
                          
                          {/* Mostrar tipos de contexto */}
                          <div className="flex flex-wrap gap-2">
                            {context.map((item, index) => {
                              const isImage = item.includes('🖼️ ANÁLISIS DE IMAGEN:') || item.includes('🖼️ IMAGEN SELECCIONADA:')
                              const isText = item.includes('Contexto del archivo') || item.includes('Contexto del documento')
                              const isStructure = item.includes('📚') && item.includes('Ruta:')
                              
                              // Filtrar elementos de imagen
                              if (isImage) return null;
                              
                              return (
                                <span 
                                  key={index}
                                  className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                                    isText
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                      : isStructure
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                  }`}
                                >
                                  {isText ? '📄 Texto' : isStructure ? '📚 Estructura' : '📝 Contexto'}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-3 bg-enterprise-800/50 rounded-lg border border-enterprise-700 text-center">
                    <Clock className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                    <p className="text-white font-semibold text-sm">10 min</p>
                    <p className="text-xs text-slate-400">Tiempo límite</p>
                  </div>
                  <div className="p-3 bg-enterprise-800/50 rounded-lg border border-enterprise-700 text-center">
                    <BookOpen className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-white font-semibold text-sm">5 preguntas</p>
                    <p className="text-xs text-slate-400">Basadas en tu PDF</p>
                  </div>
                  <div className="p-3 bg-enterprise-800/50 rounded-lg border border-enterprise-700 text-center">
                    <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-white font-semibold text-sm">Puntuación</p>
                    <p className="text-xs text-slate-400">Con explicaciones</p>
                  </div>
                </div>

                <button
                  onClick={generateQuiz}
                  disabled={context.length === 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                    context.length === 0
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
                  }`}
                >
                  {context.length === 0 ? 'Agrega contexto primero' : 'Comenzar Quiz'}
                </button>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-2">
                  Generando tu quiz personalizado...
                </h3>
                <p className="text-slate-400 text-sm">
                  Analizando el contenido de tu documento
                </p>
              </motion.div>
            )}

            {quizSession && !showResults && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Progress y Timer */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-400">
                      Pregunta {quizSession.currentQuestion + 1} de {quizSession.totalQuestions}
                    </div>
                    <div className="w-24 bg-enterprise-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((quizSession.currentQuestion + 1) / quizSession.totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className={timeRemaining <= 60 ? 'text-red-400' : 'text-slate-400'}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>

                {/* Pregunta actual */}
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-white mb-4">
                    {quizSession.questions[quizSession.currentQuestion]?.question}
                  </h3>

                  <div className="space-y-2">
                    {quizSession.questions[quizSession.currentQuestion]?.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                          selectedAnswer === index
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-enterprise-800/50 border-enterprise-700 text-slate-300 hover:bg-enterprise-700/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === index
                              ? 'border-purple-400 bg-purple-400'
                              : 'border-slate-500'
                          }`}>
                            {selectedAnswer === index && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="font-medium text-sm">{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Botón confirmar */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={confirmAnswer}
                    disabled={selectedAnswer === null}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm ${
                      selectedAnswer === null
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
                    }`}
                  >
                    {quizSession.currentQuestion + 1 === quizSession.totalQuestions ? 'Finalizar' : 'Siguiente'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}

            {showResults && quizSession && !showErrorSummary && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center h-full flex flex-col"
              >
                <div className="mb-4 flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    getScorePercentage() >= 80 ? 'bg-green-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <Trophy className={`w-8 h-8 ${getScoreColor(getScorePercentage())}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    ¡Quiz Completado!
                  </h3>
                  <p className={`text-lg font-semibold ${getScoreColor(getScorePercentage())}`}>
                    {quizSession.score}/{quizSession.totalQuestions} correctas
                  </p>
                  <p className="text-slate-400 mt-2">
                    {getScoreMessage(getScorePercentage())}
                  </p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-3 mb-4 flex-shrink-0">
                  <div className="p-3 bg-enterprise-800/50 rounded-lg">
                    <p className="text-xl font-bold text-white">{getScorePercentage()}%</p>
                    <p className="text-xs text-slate-400">Precisión</p>
                  </div>
                  <div className="p-3 bg-enterprise-800/50 rounded-lg">
                    <p className="text-xl font-bold text-white">
                      {quizSession.endTime && quizSession.startTime 
                        ? Math.round((quizSession.endTime.getTime() - quizSession.startTime.getTime()) / 1000 / 60)
                        : 0} min
                    </p>
                    <p className="text-xs text-slate-400">Tiempo</p>
                  </div>
                  <div className="p-3 bg-enterprise-800/50 rounded-lg">
                    <p className="text-xl font-bold text-white">
                      {quizSession.questions.filter((_, i) => quizSession.answers[i] === quizSession.questions[i].correctAnswer).length}
                    </p>
                    <p className="text-xs text-slate-400">Correctas</p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-3 justify-center flex-shrink-0">
                  <button
                    onClick={restartQuiz}
                    className="px-4 py-2 rounded-lg bg-enterprise-700 hover:bg-enterprise-600 text-white font-semibold transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Nuevo Quiz
                  </button>
                  {getQuizErrors().length > 0 && (
                    <button
                      onClick={() => setShowErrorSummary(true)}
                      className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Ver Errores ({getQuizErrors().length})
                    </button>
                  )}
                  <button
                    onClick={sendReinforcementToChat}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors text-sm"
                  >
                    <Brain className="w-4 h-4 inline mr-2" />
                    Repasar Conceptos
                  </button>
                </div>
              </motion.div>
            )}

            {showErrorSummary && quizSession && (
              <motion.div
                key="error-summary"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col"
              >
                {/* Header compacto */}
                <div className="mb-3 flex-shrink-0 text-center">
                  <h3 className="text-base font-bold text-white mb-1">
                    Errores del Quiz
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {getQuizErrors().length} pregunta(s) incorrecta(s)
                  </p>
                </div>

                {/* Lista de errores - Usa todo el espacio disponible */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-500/50 scrollbar-track-transparent">
                  <div className="space-y-3">
                    {getQuizErrors().map((error, index) => (
                      <div key={index} className="p-3 bg-enterprise-800/50 rounded-lg border border-red-500/30">
                        <h4 className="font-semibold text-white mb-2 text-sm">
                          Pregunta {index + 1}
                        </h4>
                        <p className="text-slate-300 mb-3 text-sm leading-relaxed">{error.question}</p>
                        
                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex items-start gap-2">
                            <span className="text-red-400 flex-shrink-0">❌ Tu respuesta:</span>
                            <span className="text-slate-300">{error.userAnswer}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-400 flex-shrink-0">✅ Respuesta correcta:</span>
                            <span className="text-slate-300">{error.correctAnswer}</span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-enterprise-900/50 rounded border-l-4 border-blue-500">
                          <p className="text-blue-300 text-sm leading-relaxed">
                            <strong>Explicación:</strong> {error.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción fijos abajo */}
                <div className="flex flex-wrap gap-3 justify-center mt-4 flex-shrink-0 pt-3 border-t border-enterprise-700">
                  <button
                    onClick={restartQuiz}
                    className="px-4 py-2 rounded-lg bg-enterprise-700 hover:bg-enterprise-600 text-white font-semibold transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Nuevo Quiz
                  </button>
                  <button
                    onClick={() => setShowErrorSummary(false)}
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors text-sm"
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Ver Resultados
                  </button>
                  <button
                    onClick={sendReinforcementToChat}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors text-sm"
                  >
                    <Brain className="w-4 h-4 inline mr-2" />
                    Repasar Conceptos
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
} 