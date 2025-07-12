'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import WebSearchSidebar from '../WebSearchSidebar';

interface SidebarWithSearchProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  onToggleProgress?: () => void;
  currentDocument?: any;
  currentTopic?: string;
  userLevel?: string;
}

const SidebarWithSearch: React.FC<SidebarWithSearchProps> = ({
  currentSection,
  setCurrentSection,
  onToggleProgress,
  currentDocument,
  currentTopic,
  userLevel = 'secondary'
}) => {
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Mostrar panel de búsqueda cuando se selecciona la sección search
  React.useEffect(() => {
    setShowSearchPanel(currentSection === 'search');
  }, [currentSection]);

  return (
    <div className="flex h-screen">
      {/* Sidebar principal */}
      <Sidebar
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        onToggleProgress={onToggleProgress}
      />

      {/* Panel de búsqueda web contextual */}
      <AnimatePresence>
        {showSearchPanel && (
          <motion.div
            className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-4">
              <WebSearchSidebar
                currentDocument={currentDocument}
                currentTopic={currentTopic}
                userLevel={userLevel}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarWithSearch; 