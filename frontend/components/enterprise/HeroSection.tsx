'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  BookOpen, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Users, 
  Target, 
  Zap,
  CheckCircle,
  Star,
  TrendingUp,
  Award,
  Menu,
  Mail
} from 'lucide-react'

interface HeroSectionProps {
  onStartNow?: () => void;
  onViewDemo?: () => void;
  onRequestAccess?: () => void;
  onNavigateToChat?: () => void;
  onShowSidebar?: () => void;
}

export function HeroSection({ 
  onStartNow, 
  onViewDemo, 
  onRequestAccess, 
  onNavigateToChat,
  onShowSidebar
}: HeroSectionProps = {}) {
  const [showContactPopup, setShowContactPopup] = React.useState(false);
  const features = [
    {
      icon: Brain,
      title: 'Aprendizaje Simplificado',
      description: 'Convierte conceptos complejos en explicaciones claras y fáciles de entender'
    },
    {
      icon: BookOpen,
      title: 'Gamificación Educativa',
      description: 'Aprende jugando con desafíos, recompensas y progresión divertida'
    },
    {
      icon: Target,
      title: 'Organización Inteligente',
      description: 'Planifica tu tiempo de estudio de manera eficiente y personalizada'
    },
    {
      icon: Users,
      title: 'Experiencia Entretenida',
      description: 'Disfruta del aprendizaje con contenido interactivo y motivador'
    }
  ]

  const stats = [
    { number: '5+', label: 'Agentes IA Especializados', icon: Brain },
    { number: '100%', label: 'Tiempo Real', icon: Zap },
    { number: '∞', label: 'Posibilidades', icon: Sparkles },
    { number: '24/7', label: 'Disponibilidad', icon: Star }
  ]

  const achievements = [
    'Simplifica conceptos complejos de forma amena',
    'Organización inteligente del tiempo de estudio',
    'Experiencia gamificada y entretenida',
    'Aprendizaje personalizado y efectivo'
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 relative overflow-y-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-4 max-w-7xl h-full flex flex-col justify-between">
        {/* Header */}
        <motion.header 
          className="flex justify-between items-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EduAI Hub</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#top" 
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Inicio
            </a>
            <a 
              href="#features" 
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Características
            </a>
            <a 
              href="#about" 
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Acerca de
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={onShowSidebar}
            className="md:hidden w-10 h-10 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-4 h-4" />
          </motion.button>
        </motion.header>

        {/* Hero Content */}
        <motion.div 
          id="hero"
          className="text-center mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            {/* Left Content */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
                            {/* Main Title */}
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-blue-100 via-purple-100 to-cyan-100 bg-clip-text text-transparent leading-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                <span className="block -ml-8">EduAI</span>
                <span className="block ml-12 text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Hub
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-xl md:text-2xl lg:text-3xl text-slate-200 mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Haciendo el aprendizaje más{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-bold">
                  fácil, entretenido y efectivo
                </span>
              </motion.p>

              {/* Description */}
              <motion.p 
                className="text-base md:text-lg text-slate-400 mb-5 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Transforma conceptos difíciles en experiencias amenas, organiza tu tiempo de estudio 
                y disfruta de un aprendizaje gamificado potenciado por inteligencia artificial.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
              >
                <motion.button
                  onClick={onStartNow || onNavigateToChat}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg flex items-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </motion.button>
                
                <motion.button
                  onClick={onViewDemo}
                  className="px-8 py-4 border-2 border-slate-600 text-slate-300 rounded-xl font-semibold text-lg hover:border-slate-500 hover:text-white transition-all duration-300 hover:bg-slate-800/30 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver Demo
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="relative w-full h-76 md:h-[26rem] rounded-2xl overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl"></div>
                
                {/* Abstract Shapes */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>
                
                {/* Central Illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                                         {/* Main Circle */}
                     <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-600/80 via-purple-600/80 to-cyan-600/80 flex items-center justify-center shadow-xl shadow-blue-500/25 backdrop-blur-sm border border-white/20">
                       <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                         <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-white" />
                       </div>
                     </div>
                    
                                         {/* Floating Elements */}
                     <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center animate-bounce">
                       <Brain className="w-4 h-4 text-white" />
                     </div>
                     <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce delay-500">
                       <BookOpen className="w-4 h-4 text-white" />
                     </div>
                     <div className="absolute top-1/2 -right-6 w-7 h-7 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center animate-bounce delay-1000">
                       <Target className="w-3 h-3 text-white" />
                     </div>
                     <div className="absolute top-1/2 -left-6 w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center animate-bounce delay-1500">
                       <Users className="w-3 h-3 text-white" />
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col justify-center space-y-10 pt-28">
          {/* Features Section */}
          <motion.div 
            id="features"
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {/* Section Title */}
            <div className="space-y-3">
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                Características Principales
              </motion.h2>
              <motion.p 
                className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                Descubre cómo EduAI Hub revoluciona tu experiencia de aprendizaje con herramientas 
                inteligentes diseñadas para hacer el estudio más efectivo, entretenido y organizado.
              </motion.p>
            </div>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
            >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group p-3 md:p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:bg-slate-800/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -3 }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
            </motion.div>
          </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-3 md:p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 + index * 0.1, duration: 0.6 }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-slate-400 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievements Section */}
        <motion.div 
          className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-4 md:p-6 backdrop-blur-sm border border-slate-600/30 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Award className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">Logros Destacados</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.2 + index * 0.1, duration: 0.6 }}
              >
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{achievement}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div 
          id="about"
          className="space-y-8 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
        >
          {/* Section Title */}
          <div className="space-y-3">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-white mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.6 }}
            >
              Acerca de EduAI Hub
            </motion.h2>
            <motion.p 
              className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.6 }}
            >
              Una plataforma educativa innovadora que combina inteligencia artificial 
              con metodologías de aprendizaje modernas para crear experiencias educativas 
              más efectivas, entretenidas y personalizadas.
            </motion.p>
          </div>

          {/* About Content */}
          <motion.div 
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-slate-600/30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.0, duration: 0.8 }}
          >
            <div className="space-y-4 text-sm md:text-base text-slate-300">
              <p className="leading-relaxed">
                Nuestra misión es democratizar el acceso a una educación de calidad a través de 
                la tecnología, haciendo que el aprendizaje sea más accesible, divertido y efectivo 
                para todos los estudiantes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-slate-700/30">
                  <h4 className="font-semibold text-white mb-2">Nuestra Visión</h4>
                  <p className="text-slate-400 text-sm">Transformar la educación tradicional en experiencias de aprendizaje inmersivas y personalizadas.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/30">
                  <h4 className="font-semibold text-white mb-2">Nuestros Valores</h4>
                  <p className="text-slate-400 text-sm">Innovación, accesibilidad, calidad educativa y aprendizaje centrado en el estudiante.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

                {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4, duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-semibold text-sm">Sistema en desarrollo activo</span>
          </div>
          <p className="text-slate-400 mb-3 text-sm">
            Descubre una nueva forma de aprender: más  fácil, más divertida y más efectiva
          </p>
          <motion.button
            onClick={onRequestAccess}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-base hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Solicitar Acceso Beta
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.footer 
          className="border-t border-slate-700/30 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">EduAI Hub</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Transformando la educación a través de la inteligencia artificial. 
                Creando el futuro del aprendizaje, una experiencia a la vez.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="#hero" 
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('hero')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }}
                  >
                    Inicio
                  </a>
                </li>
                <li>
                  <a 
                    href="#features" 
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Características
                  </a>
                </li>
                <li>
                  <a 
                    href="#about" 
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Acerca de
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowContactPopup(true);
                    }}
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>


        </motion.footer>
        </div>
      </div>

      {/* Contact Popup */}
      {showContactPopup && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowContactPopup(false)}
        >
          <motion.div 
            className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Contacto</h3>
              <button 
                onClick={() => setShowContactPopup(false)}
                className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-slate-400 text-sm">info@eduaihub.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-white font-medium">Estado del Proyecto</p>
                  <p className="text-slate-400 text-sm">En desarrollo activo</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Acceso Beta</p>
                  <p className="text-slate-400 text-sm">Próximamente disponible</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/30">
              <p className="text-slate-400 text-sm text-center">
                ¿Tienes preguntas? Envíanos un email y te responderemos lo antes posible.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 