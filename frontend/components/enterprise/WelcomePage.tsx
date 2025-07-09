import { Brain, MessageSquare, FileText, Radar, Clock, Sparkles, BarChart3, BookOpen } from 'lucide-react'

export function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-blue-950 via-gray-950 to-purple-950 text-white p-2">
      {/* Logo y título */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl mb-2">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold mb-1 tracking-tight text-center">AI Education</h1>
        <p className="text-base text-slate-300 text-center max-w-lg">Plataforma inteligente para potenciar el aprendizaje con IA.</p>
      </div>

      {/* Features destacados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mt-2">
        <FeatureCard
          icon={<Brain className="w-6 h-6 text-purple-400" />}
          title="Mapa de Conocimientos"
          description="Visualiza tu progreso y áreas de mejora con radar y timeline."
        />
        <FeatureCard
          icon={<MessageSquare className="w-6 h-6 text-blue-400" />}
          title="Chat AI Contextual"
          description="Interactúa con agentes inteligentes que entienden tus documentos."
        />
        <FeatureCard
          icon={<FileText className="w-6 h-6 text-green-400" />}
          title="Análisis de Documentos"
          description="Extrae estructura y temas clave de PDFs educativos."
        />
        <FeatureCard
          icon={<Radar className="w-6 h-6 text-yellow-400" />}
          title="Radar de Aprendizaje"
          description="Explora tu avance en cada tema con una vista 360°."
        />
        <FeatureCard
          icon={<Clock className="w-6 h-6 text-pink-400" />}
          title="Línea de Tiempo"
          description="Sigue la evolución de tu aprendizaje y revisa hitos."
        />
        <FeatureCard
          icon={<Sparkles className="w-6 h-6 text-cyan-400" />}
          title="Prompts Inteligentes"
          description="Recibe sugerencias adaptadas a tu contexto y nivel."
        />
        <FeatureCard
          icon={<BarChart3 className="w-6 h-6 text-orange-400" />}
          title="Analíticas Avanzadas"
          description="Obtén estadísticas detalladas sobre tu desempeño."
        />
        <FeatureCard
          icon={<BookOpen className="w-6 h-6 text-lime-400" />}
          title="Explorador de Estructura"
          description="Navega fácilmente por la estructura de tus materiales."
        />
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-slate-500 text-center">
        Plataforma desarrollada con IA para la educación del futuro. &copy; 2025
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-gray-900/80 rounded-xl p-3 flex flex-col items-center shadow border border-gray-800 hover:scale-105 hover:shadow-xl transition-transform duration-200 min-h-[140px]">
      <div className="mb-2">{icon}</div>
      <h3 className="text-base font-bold mb-1 text-center">{title}</h3>
      <p className="text-xs text-slate-300 text-center leading-tight">{description}</p>
    </div>
  )
} 