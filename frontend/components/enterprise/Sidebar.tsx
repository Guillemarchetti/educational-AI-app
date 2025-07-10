'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  Search,
  ChevronDown,
  Moon,
  User
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, setCurrentSection }) => {
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Inicio', color: 'text-blue-400' },
    { id: 'chat', icon: MessageSquare, label: 'Chat IA', color: 'text-green-400' },
    { id: 'documents', icon: FileText, label: 'Documentos', color: 'text-purple-400' },
    { id: 'analytics', icon: BarChart3, label: 'Analíticas', color: 'text-orange-400' },
    { id: 'structure', icon: BookOpen, label: 'Estructura', color: 'text-pink-400' },
    { id: 'images', icon: Users, label: 'Imágenes', color: 'text-indigo-400' },
    { id: 'knowledge-map', icon: Search, label: 'Conocimiento', color: 'text-cyan-400' },
  ];

  const bottomControls = [
    { icon: Moon, label: 'Modo Oscuro', color: 'text-purple-300' },
    { icon: Settings, label: 'Configuración', color: 'text-gray-300' },
  ];

  const accountOptions = [
    { icon: User, label: 'Mi Perfil', color: 'text-blue-300' },
    { icon: BarChart3, label: 'Estadísticas', color: 'text-green-300' },
    { icon: BookOpen, label: 'Historial', color: 'text-orange-300' },
  ];

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollContainerRef.current;
        setShowScrollArrow(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = scrollContainerRef.current;
      setShowScrollArrow(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight);
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <aside className="w-16 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800/50 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800/50">
        <motion.button 
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center relative group user-menu-container shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-400/20 hover:border-blue-400/40"
          onClick={() => setShowUserMenu(!showUserMenu)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <User className="w-5 h-5 text-white drop-shadow-sm" />
          
          {/* Status Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900 shadow-sm">
            <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* User Menu Dropdown */}
          {showUserMenu && (
            <motion.div 
              className="absolute left-full ml-3 top-0 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl z-[9999] min-w-48"
              initial={{ opacity: 0, scale: 0.95, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 border-b border-gray-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Juan Pérez</div>
                    <div className="text-gray-400 text-xs">usuario@ejemplo.com</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-green-400 font-medium">Premium</span>
                </div>
              </div>
              
              <div className="p-2">
                {/* Account Options */}
                <div className="mb-2">
                  <div className="text-xs text-gray-500 font-medium px-3 py-1 uppercase tracking-wide">Cuenta</div>
                  {accountOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    
                    return (
                      <motion.button
                        key={index}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700/50 my-2"></div>

                {/* System Options */}
                <div>
                  <div className="text-xs text-gray-500 font-medium px-3 py-1 uppercase tracking-wide">Sistema</div>
                  {bottomControls.map((control, index) => {
                    const IconComponent = control.icon;
                    
                    return (
                      <motion.button
                        key={index}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm font-medium">{control.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Navigation Items */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
        onScroll={handleScroll}
      >
        <div className="flex flex-col space-y-2 p-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <motion.button
                key={item.id}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
                onClick={() => setCurrentSection(item.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-5 h-5" />
                <div className="absolute left-full ml-3 px-4 py-2.5 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[9999] border border-gray-700/50 shadow-2xl">
                  <span className={`font-semibold ${item.color}`}>{item.label}</span>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/95 rotate-45 border-l border-b border-gray-700/50"></div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Scroll Arrow */}
      {showScrollArrow && (
        <motion.button
          className="w-12 h-12 mx-2 mb-2 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
          onClick={scrollToBottom}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      )}
    </aside>
  );
};

export { Sidebar };
export default Sidebar; 