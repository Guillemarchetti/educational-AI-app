'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'

import { ChatInterface, Message } from '@/components/enterprise/ChatInterface'
import { FileExplorer } from '@/components/enterprise/FileExplorer'
import { DocumentStructure } from '@/components/enterprise/DocumentStructure'
import { Sidebar } from '@/components/enterprise/Sidebar'
import SidebarWithSearch from '@/components/enterprise/SidebarWithSearch'
import { ImageSelector } from '@/components/enterprise/ImageSelector'
import { ContextDisplay } from '@/components/enterprise/ContextDisplay'
import { KnowledgeMap } from '@/components/enterprise/KnowledgeMap'
import { WelcomePage } from '@/components/enterprise/WelcomePage'
import { HeroSection } from '@/components/enterprise/HeroSection'
import { ProgressTracker } from '@/components/enterprise/ProgressTracker'
import WebSearchSidebar from '@/components/WebSearchSidebar';

const PdfViewer = dynamic(() => import('@/components/enterprise/PdfViewer').then(mod => mod.PdfViewer), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center bg-enterprise-900 text-slate-500"><p>Cargando visor PDF...</p></div>
})

// Esta interfaz debe coincidir con la de FileExplorer
interface FileNode {
  name: string;
  url: string;
  id?: string; // Agregamos ID para la estructura
}

export default function EnterpriseChatPage() {
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; id?: string } | null>(null)
  const [contextText, setContextText] = useState<string[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isImageSelectionMode, setIsImageSelectionMode] = useState(false)
  const [showImageSuccessNotification, setShowImageSuccessNotification] = useState(false)
  const [showDragInstruction, setShowDragInstruction] = useState(false)
  const [showSelectionSuccess, setShowSelectionSuccess] = useState(false)
  const [showContextLoadedNotification, setShowContextLoadedNotification] = useState(false)
  const [documentStructure, setDocumentStructure] = useState<any>(null)
  const [structureLoading, setStructureLoading] = useState(false)
  const [selectedKnowledgeNode, setSelectedKnowledgeNode] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showProgress, setShowProgress] = useState(false)
  const [isDocumentsPanelCollapsed, setIsDocumentsPanelCollapsed] = useState(false)

  // Resetear notificación cuando cambiamos de sección
  useEffect(() => {
    setShowImageSuccessNotification(false)
    // Ocultar progreso cuando se cambia de sección
    setShowProgress(false)
  }, [currentSection])

  const handleContextAdd = (text: string) => {
    setContextText(prev => {
      const newContext = [...prev, text];
      return newContext;
    });
  };

  const handleStructureContextAdd = async (structurePath: string, elementType: string, title: string) => {
    try {
      const response = await fetch('/api/documents/context/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_by_structure',
          structure_path: structurePath,
          document_id: selectedFile?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar contexto por estructura');
      }

      const data = await response.json();
      
      // Agregar indicador de contexto estructural
      const structureContext = `📚 ${elementType.toUpperCase()}: ${title}\n🔗 Ruta: ${structurePath}\n📄 ${data.chunks_added} fragmentos agregados`;
      handleContextAdd(structureContext);
    } catch (error) {
      console.error('Error adding structure context:', error);
      alert('Error al agregar contexto por estructura');
    }
  };

  const handleImageContextAdd = (imageData: string, description: string) => {
    // Solo incluir la descripción del análisis, no la imagen base64 completa
    const imageContext = `🖼️ ANÁLISIS DE IMAGEN:\n\n${description}\n\n📄 Archivo: ${selectedFile?.name}`;
    handleContextAdd(imageContext);
    
    // Mostrar notificación de contexto cargado
    setShowContextLoadedNotification(true);
  };

  // Función que maneja la selección de imagen
  const handleImageSelectedWithNotification = (imageData: string, description: string) => {
    // Llamar a la función original
    handleImageContextAdd(imageData, description);
  };

  const handleToggleImageSelection = () => {
    const newMode = !isImageSelectionMode
    setIsImageSelectionMode(newMode)
    
    if (newMode) {
      // Solo mostrar instrucción si hay un archivo seleccionado
      if (selectedFile) {
        setShowDragInstruction(true)
      }
    } else {
      // Ocultar todas las notificaciones cuando se desactiva      
      setShowDragInstruction(false)
      setShowImageSuccessNotification(false)
      setShowSelectionSuccess(false)
    }
  }

  const handleImageSelection = (imageData: string, coordinates: { x: number, y: number, width: number, height: number }) => {
    // Esta función se llama cuando se captura una imagen del PDF
    
    // Ocultar instrucción de arrastre y mostrar notificación de selección exitosa
    setShowDragInstruction(false);
    setShowSelectionSuccess(true);
    
    // Después de 1.5 segundos, cambiar a notificación de carga
    setTimeout(() => {
      setShowSelectionSuccess(false);
      setShowImageSuccessNotification(true);
      
      // Procesar la imagen con análisis de IA
      processImageWithAI(imageData, coordinates);
    }, 1500);
  }

  const processImageWithAI = async (imageData: string, coordinates: { x: number, y: number, width: number, height: number }) => {
    try {
      // Enviar imagen al backend para análisis
      const response = await fetch('http://localhost:8000/api/agents/analyze-image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: imageData,
          context: `Imagen seleccionada del PDF: ${selectedFile?.name}`,
          filename: selectedFile?.name,
          x: coordinates.x,
          y: coordinates.y,
          width: coordinates.width,
          height: coordinates.height
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al analizar la imagen');
      }
      
      const result = await response.json();
      
      // Crear descripción con el análisis de IA
      const description = `🖼️ ANÁLISIS DE IMAGEN:\n\n${result.analysis}\n\n📊 Info técnica: ${result.image_info?.size || 'N/A'}`;
      
      // Agregar al contexto del chat con el análisis completo
      handleImageContextAdd(imageData, description);
      
      // Ocultar notificación cuando se complete el procesamiento
      setShowImageSuccessNotification(false);
      
      // Desactivar modo selección después de capturar
      setIsImageSelectionMode(false);
      
    } catch (error) {
      console.error('Error processing captured image:', error);
      
      // Fallback: agregar imagen sin análisis detallado
      const fallbackDescription = `Área seleccionada del PDF "${selectedFile?.name}" - Coordenadas: ${Math.round(coordinates.x)}, ${Math.round(coordinates.y)} - Tamaño: ${Math.round(coordinates.width)}x${Math.round(coordinates.height)}px\n\n⚠️ Error al analizar con IA. Describe qué ves en la imagen para obtener ayuda.`;
      handleImageContextAdd(imageData, fallbackDescription);
      
      // Ocultar notificación en caso de error también
      setShowImageSuccessNotification(false);
      
      setIsImageSelectionMode(false);
    }
  }

  const handleRemoveContext = (index: number) => {
    setContextText(prev => prev.filter((_, i) => i !== index));
  }

  const handleHideImageNotifications = () => {
    setShowDragInstruction(false);
    setShowSelectionSuccess(false);
    setShowImageSuccessNotification(false);
    setShowContextLoadedNotification(false);
    
    // Desactivar modo de selección de imágenes para ocultar el ImageSelector
    if (isImageSelectionMode) {
      setIsImageSelectionMode(false);
    }
  }

  const handleHideImageSelector = () => {
    // Esta función será llamada desde ChatInterface para ocultar el ImageSelector
    console.log('Ocultando ImageSelector desde componente padre...')
  }

  const handleToggleProgress = () => {
    if (currentSection === 'progress') {
      setCurrentSection('chat') // Volver a chat si ya estamos en progreso
    } else {
      setCurrentSection('progress') // Ir a la sección de progreso
    }
  }

  const handleToggleDocumentsPanel = () => {
    setIsDocumentsPanelCollapsed(!isDocumentsPanelCollapsed);
  }

  const handleFileDrop = async (file: FileNode) => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/documents/extract_text/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al extraer el texto del archivo.');
      }

      const data = await response.json();
      // Añadimos un encabezado para que el usuario sepa de dónde vino el contexto
      const fileContext = `Contexto del archivo "${file.name}":\n\n${data.text}`;
      handleContextAdd(fileContext);

      // Cargar estructura del documento si está disponible
      await loadDocumentStructure(file.name);

      // Generar mensaje de bienvenida automático
      await generateWelcomeMessage(file.name, data.text);

    } catch (error) {
      console.error("Error en extracción de texto:", error);
      // Aquí podrías mostrar una notificación al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const loadDocumentStructure = async (fileOrId: string) => {
    setStructureLoading(true);
    try {
      // Usar el id si está disponible, si no, usar el nombre
      const idOrName = selectedFile?.id || fileOrId;
      const response = await fetch(`http://localhost:8000/api/documents/structure/${idOrName}/`);
      if (response.ok) {
        const data = await response.json();
        setDocumentStructure(data);
      }
    } catch (error) {
      console.error('Error loading document structure:', error);
    } finally {
      setStructureLoading(false);
    }
  }

  const handleStructureContextSelect = (context: string, title: string) => {
    handleContextAdd(context);
  };

  const generateWelcomeMessage = async (filename: string, extractedText: string) => {
    try {
      // Crear un resumen del contexto para el mensaje de bienvenida
      const textPreview = extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '');
      
      // Detectar el tipo de contenido basado en el texto
      const isMath = /[+\-*/=()\[\]{}]/.test(extractedText) || /matemática|matematica|math|ecuación|ecuacion/.test(extractedText.toLowerCase());
      const isScience = /ciencia|física|fisica|química|quimica|biología|biologia|experimento/.test(extractedText.toLowerCase());
      const isLanguage = /lenguaje|español|espanol|gramática|gramatica|literatura/.test(extractedText.toLowerCase());
      const isHistory = /historia|histórico|historico|pasado|antiguo/.test(extractedText.toLowerCase());
      
      let subjectType = 'general';
      if (isMath) subjectType = 'matemáticas';
      else if (isScience) subjectType = 'ciencias';
      else if (isLanguage) subjectType = 'lenguaje';
      else if (isHistory) subjectType = 'historia';
      
      const welcomeMessage = `🎓 **¡Bienvenido al análisis de tu material educativo!**

📚 **Documento cargado:** ${filename}
📖 **Tipo de contenido:** ${subjectType}
📄 **Contexto extraído:** ${extractedText.length} caracteres

💡 **¿Qué puedo hacer por ti?**
• Explicar conceptos del material
• Resolver dudas específicas
• Crear ejercicios prácticos
• Analizar diagramas o imágenes
• Generar resúmenes
• Comparar temas relacionados

🔍 **Contexto disponible:** He analizado el contenido de tu documento y estoy listo para ayudarte con cualquier pregunta sobre este material.

¡Adelante, pregunta lo que necesites! 🚀`;

      // Enviar el mensaje de bienvenida al chat
      await sendWelcomeMessage(welcomeMessage);
      
    } catch (error) {
      console.error('Error generando mensaje de bienvenida:', error);
    }
  };

  const sendWelcomeMessage = async (message: string) => {
    try {
      // Crear el mensaje de bienvenida directamente en el chat
      const welcomeMessage = {
        id: Date.now(),
        text: message,
        sender: 'ai' as const,
        timestamp: new Date(),
        agent: 'Sistema'
      };
      
      // Agregar el mensaje al estado de mensajes del ChatInterface
      if (setMessages) {
        setMessages(prev => {
          const newState = [...prev, welcomeMessage];
          return newState;
        });
      }
      
    } catch (error) {
      console.error('Error enviando mensaje de bienvenida:', error);
    }
  };

  const handleKnowledgeNodeClick = (node: any) => {
    setSelectedKnowledgeNode(node)
    
    // Agregar contexto del nodo seleccionado al chat
    const nodeContext = `🧠 CONOCIMIENTO SELECCIONADO:\n\n📖 ${node.title}\n📊 Estado: ${node.status === 'objective' ? 'Objetivo' : node.status === 'well_learned' ? 'Bien Aprendido' : node.status === 'needs_reinforcement' ? 'Necesita Refuerzo' : 'No Aprendido'}\n📈 Progreso: ${node.progress}%\n${node.description ? `📝 ${node.description}` : ''}`
    handleContextAdd(nodeContext)
  }

  useEffect(() => {
    if (selectedFile && selectedFile.id) {
      loadDocumentStructure(selectedFile.id)
    } else {
      setDocumentStructure(null)
    }
  }, [selectedFile])

  const renderMainContent = () => {

    switch (currentSection) {
      case 'dashboard':
        return (
          <HeroSection 
            onStartNow={() => setCurrentSection('chat')}
            onViewDemo={() => {
              // Simular una demo - podrías mostrar un modal o cambiar a una vista específica
              alert('Demo de la plataforma - Funcionalidades principales:\n\n• Chat con IA educativa\n• Análisis de documentos\n• Generación de contenido\n• Mapas de conocimiento\n\n¡Explora las diferentes secciones desde la barra lateral!');
            }}
            onRequestAccess={() => {
              // Simular solicitud de acceso beta
              alert('Solicitud de acceso beta enviada.\n\nTe notificaremos cuando la plataforma esté lista para pruebas.\n\nMientras tanto, puedes explorar las funcionalidades en modo demo.');
            }}
            onNavigateToChat={() => setCurrentSection('chat')}
            onShowSidebar={() => setCurrentSection('chat')}
          />
        );
      case 'chat':
        return (
          <PanelGroup key="chat-panels" direction="horizontal">
            {!isDocumentsPanelCollapsed && (
              <>
                <Panel defaultSize={20} minSize={15}>
                  <FileExplorer 
                    onSelectFile={setSelectedFile} 
                    onToggleCollapse={handleToggleDocumentsPanel}
                    isCollapsed={isDocumentsPanelCollapsed}
                  />
                </Panel>
                <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
              </>
            )}
            <Panel defaultSize={isDocumentsPanelCollapsed ? 50 : 45} minSize={30}>
              <div className="relative h-full">
                {isDocumentsPanelCollapsed && (
                  <button
                    onClick={handleToggleDocumentsPanel}
                    className="absolute top-2 left-2 z-10 p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-colors"
                    title="Mostrar documentos"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                )}
                <PdfViewer 
                  selectedFile={selectedFile}
                  isSelectionMode={isImageSelectionMode}
                  onImageSelection={handleImageSelection}
                />
              </div>
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={isDocumentsPanelCollapsed ? 50 : 35} minSize={25}>
              <ChatInterface 
                contextText={contextText}
                onRemoveContext={handleRemoveContext}
                isDraggingOver={isDraggingOver}
                setIsDraggingOver={setIsDraggingOver}
                onFileDrop={handleFileDrop}
                isExtracting={isExtracting}
                selectedFile={selectedFile}
                onSendWelcomeMessage={sendWelcomeMessage}
                messages={messages}
                setMessages={setMessages}
                isImageSelectionMode={isImageSelectionMode}
                onToggleImageSelection={handleToggleImageSelection}
                onImageContextAdd={handleImageContextAdd}
                showImageSuccessNotification={showImageSuccessNotification}
                showDragInstruction={showDragInstruction}
                showSelectionSuccess={showSelectionSuccess}
                showContextLoadedNotification={showContextLoadedNotification}
                onHideImageNotifications={handleHideImageNotifications}
                onHideImageSelector={handleHideImageSelector}
                showProgress={showProgress}
                onToggleProgress={handleToggleProgress}
              />
            </Panel>
          </PanelGroup>
        );


      
      case 'images':
        return (
          <div className="h-full flex flex-col">
            <PanelGroup key="images-panels" direction="horizontal" className="flex-1">
              <Panel defaultSize={20} minSize={15}>
                <FileExplorer onSelectFile={setSelectedFile} />
              </Panel>
              <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
              <Panel defaultSize={50} minSize={35}>
                <PdfViewer 
                  selectedFile={selectedFile}
                  isSelectionMode={isImageSelectionMode}
                  onImageSelection={handleImageSelection}
                />
              </Panel>
              <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
              <Panel defaultSize={30} minSize={25}>
                <ImageSelector 
                  selectedFile={selectedFile}
                  onAddImageContext={handleImageSelectedWithNotification}
                  isSelectionMode={isImageSelectionMode}
                  onToggleSelectionMode={handleToggleImageSelection}
                  showSuccessNotification={showImageSuccessNotification}
                />
              </Panel>
            </PanelGroup>
          </div>
        );

      case 'structure':
        return (
          <PanelGroup key="structure-panels" direction="horizontal">
            {!isDocumentsPanelCollapsed && (
              <>
                <Panel defaultSize={25} minSize={20}>
                  <FileExplorer 
                    onSelectFile={setSelectedFile} 
                    onToggleCollapse={handleToggleDocumentsPanel}
                    isCollapsed={isDocumentsPanelCollapsed}
                  />
                </Panel>
                <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
              </>
            )}
            <Panel defaultSize={isDocumentsPanelCollapsed ? 50 : 40} minSize={30}>
              <div className="relative h-full">
                {isDocumentsPanelCollapsed && (
                  <button
                    onClick={handleToggleDocumentsPanel}
                    className="absolute top-2 left-2 z-10 p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-colors"
                    title="Mostrar documentos"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                )}
                <PdfViewer 
                  selectedFile={selectedFile}
                  isSelectionMode={isImageSelectionMode}
                  onImageSelection={handleImageSelection}
                />
              </div>
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={isDocumentsPanelCollapsed ? 50 : 35} minSize={25}>
              <DocumentStructure 
                structureData={documentStructure?.structure_data}
                onSelectContext={handleStructureContextSelect}
                selectedFile={selectedFile}
              />
            </Panel>
          </PanelGroup>
        );

      case 'analytics':
        return (
          <div className="h-full w-full bg-enterprise-900">
            <KnowledgeMap 
              documentStructure={documentStructure}
              selectedFile={selectedFile}
              onNodeClick={handleKnowledgeNodeClick}
            />
          </div>
        );

      case 'progress':
        return (
          <div className="h-full w-full bg-enterprise-900">
            <ProgressTracker 
              isVisible={true}
              onToggle={handleToggleProgress}
            />
          </div>
        );

      case 'knowledge-map':
        return (
          <PanelGroup key="knowledge-map-panels" direction="horizontal">
            <Panel defaultSize={25} minSize={20}>
              <FileExplorer onSelectFile={setSelectedFile} />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={50} minSize={35}>
              <KnowledgeMap 
                documentStructure={documentStructure}
                selectedFile={selectedFile}
                onNodeClick={handleKnowledgeNodeClick}
              />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={25} minSize={20}>
              <ChatInterface 
                contextText={contextText}
                onRemoveContext={handleRemoveContext}
                isDraggingOver={isDraggingOver}
                setIsDraggingOver={setIsDraggingOver}
                onFileDrop={handleFileDrop}
                isExtracting={isExtracting}
                selectedFile={selectedFile}
                onSendWelcomeMessage={sendWelcomeMessage}
                messages={messages}
                setMessages={setMessages}
                showContextLoadedNotification={showContextLoadedNotification}
                onHideImageNotifications={handleHideImageNotifications}
                onHideImageSelector={handleHideImageSelector}
                showProgress={showProgress}
                onToggleProgress={handleToggleProgress}
              />
            </Panel>
          </PanelGroup>
        );

      case 'pomodoro':
        return (
          <div className="h-full w-full bg-enterprise-900 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Organizador</h2>
              <p className="text-slate-400 text-lg">Sistema de recordatorios con Técnica Pomodoro</p>
              <div className="bg-enterprise-800/30 rounded-lg p-6 border border-enterprise-700/50 max-w-md">
                <p className="text-slate-300 text-sm leading-relaxed">
                  🚧 <strong>En construcción</strong> 🚧
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  Próximamente: Temporizador personalizado, sesiones de estudio organizadas y sistema de recompensas.
                </p>
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="h-full w-full bg-enterprise-900 flex items-center justify-center">
            <div className="max-w-2xl w-full h-full p-6">
              <WebSearchSidebar
                currentDocument={selectedFile}
                currentTopic={selectedFile?.name}
                userLevel="secondary"
                chatMessages={messages
                  .filter(m => 
                    m.sender === 'user' && 
                    m.text && 
                    m.text.trim() !== '' && 
                    m.text.length < 200 && 
                    !m.text.includes('🎓') && 
                    !m.text.includes('¡Bienvenido') &&
                    !m.text.includes('Documento cargado') &&
                    !m.text.includes('Contexto disponible') &&
                    !m.text.includes('¿Qué puedo hacer por ti?') &&
                    !m.text.includes('¡Adelante, pregunta') &&
                    m.agent !== 'Sistema'
                  )
                  .map(m => ({
                    content: m.text,
                    role: 'user',
                    id: m.id
                  })) as any}
                chatContext={contextText as any}
              />
            </div>
          </div>
        );
      
      case 'documents':
        return (
          <PanelGroup key="documents-panels" direction="horizontal">
            <Panel defaultSize={30} minSize={25}>
              <FileExplorer onSelectFile={setSelectedFile} />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={70} minSize={50}>
              <PdfViewer 
                selectedFile={selectedFile}
              />
            </Panel>
          </PanelGroup>
        );

      default:
        return <WelcomePage />;
    }
  };

  return (
    <main className="h-screen w-full bg-gray-950 text-white overflow-hidden">
      {currentSection === 'dashboard' ? (
        // Hero section ocupa toda la pantalla sin sidebar
        <div className="h-full w-full">
          {renderMainContent()}
        </div>
      ) : (
        // Todas las demás secciones con sidebar (incluyendo search)
        <div className="flex h-full w-full">
          <Sidebar 
            currentSection={currentSection} 
            setCurrentSection={setCurrentSection}
            onToggleProgress={handleToggleProgress}
          />
          <div className="flex-1 h-full overflow-hidden">
            {renderMainContent()}
          </div>
        </div>
      )}
    </main>
  )
} 