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
import { ImageSelector } from '@/components/enterprise/ImageSelector'
import { ContextDisplay } from '@/components/enterprise/ContextDisplay'
import { KnowledgeMap } from '@/components/enterprise/KnowledgeMap'
import { WelcomePage } from '@/components/enterprise/WelcomePage'

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
  const [currentSection, setCurrentSection] = useState('chat')
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; id?: string } | null>(null)
  const [contextText, setContextText] = useState<string[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isImageSelectionMode, setIsImageSelectionMode] = useState(false)
  const [documentStructure, setDocumentStructure] = useState<any>(null)
  const [structureLoading, setStructureLoading] = useState(false)
  const [selectedText, setSelectedText] = useState<string>('')
  const [selectedKnowledgeNode, setSelectedKnowledgeNode] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const handleTextSelect = (text: string) => {
    setSelectedText(text);
  };

  const handleClearSelection = () => {
    setSelectedText('');
  }

  const handleContextAdd = (text: string) => {
    console.log('handleContextAdd called with:', text)
    setContextText(prev => [...prev, text]);
    setSelectedText(''); // Limpiar la selección después de añadir
    console.log('Context updated')
  };

  const handleStructureContextAdd = async (structurePath: string, elementType: string, title: string) => {
    console.log('Adding structure context:', { structurePath, elementType, title })
    
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
      
      console.log('Structure context added:', data);
    } catch (error) {
      console.error('Error adding structure context:', error);
      alert('Error al agregar contexto por estructura');
    }
  };

  const handleImageContextAdd = (imageData: string, description: string) => {
    console.log('Adding image context:', { imageDataLength: imageData.length, description })
    // Solo incluir la descripción del análisis, no la imagen base64 completa
    const imageContext = `🖼️ ANÁLISIS DE IMAGEN:\n\n${description}\n\n📄 Archivo: ${selectedFile?.name}`;
    handleContextAdd(imageContext);
  };

  const handleToggleImageSelection = () => {
    setIsImageSelectionMode(!isImageSelectionMode)
  }

  const handleImageSelection = (imageData: string, coordinates: { x: number, y: number, width: number, height: number }) => {
    // Esta función se llama cuando se captura una imagen del PDF
    console.log('Image selection received:', { coordinates, imageDataLength: imageData.length });
    
    // Procesar la imagen con análisis de IA
    processImageWithAI(imageData, coordinates);
  }

  const processImageWithAI = async (imageData: string, coordinates: { x: number, y: number, width: number, height: number }) => {
    try {
      console.log('Processing image with AI...');
      
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
      console.log('AI analysis result:', result);
      
      // Crear descripción con el análisis de IA
      const description = `🖼️ ANÁLISIS DE IMAGEN:\n\n${result.analysis}\n\n📊 Info técnica: ${result.image_info?.size || 'N/A'}`;
      
      // Agregar al contexto del chat con el análisis completo
      handleImageContextAdd(imageData, description);
      
      // Desactivar modo selección después de capturar
      setIsImageSelectionMode(false);
      
    } catch (error) {
      console.error('Error processing captured image:', error);
      
      // Fallback: agregar imagen sin análisis detallado
      const fallbackDescription = `Área seleccionada del PDF "${selectedFile?.name}" - Coordenadas: ${Math.round(coordinates.x)}, ${Math.round(coordinates.y)} - Tamaño: ${Math.round(coordinates.width)}x${Math.round(coordinates.height)}px\n\n⚠️ Error al analizar con IA. Describe qué ves en la imagen para obtener ayuda.`;
      handleImageContextAdd(imageData, fallbackDescription);
      setIsImageSelectionMode(false);
    }
  }

  const handleRemoveContext = (index: number) => {
    setContextText(prev => prev.filter((_, i) => i !== index));
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
      } else {
        console.log('Document structure not available yet');
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
      console.log('sendWelcomeMessage llamado con:', message);
      
      // Crear el mensaje de bienvenida directamente en el chat
      const welcomeMessage = {
        id: Date.now(),
        text: message,
        sender: 'ai' as const,
        timestamp: new Date(),
        agent: 'Sistema'
      };
      
      console.log('Mensaje creado:', welcomeMessage);
      console.log('setMessages disponible:', !!setMessages);
      
      // Agregar el mensaje al estado de mensajes del ChatInterface
      if (setMessages) {
        setMessages(prev => {
          console.log('Estado anterior de mensajes:', prev.length);
          const newState = [...prev, welcomeMessage];
          console.log('Nuevo estado de mensajes:', newState.length);
          return newState;
        });
      } else {
        console.log('setMessages no está disponible');
      }
      
      console.log('Mensaje de bienvenida agregado al chat');
    } catch (error) {
      console.error('Error enviando mensaje de bienvenida:', error);
    }
  };

  const handleKnowledgeNodeClick = (node: any) => {
    console.log('Knowledge node clicked:', node)
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
      case 'chat':
        return (
          <PanelGroup key="chat-panels" direction="horizontal">
            <Panel defaultSize={20} minSize={15}>
              <FileExplorer onSelectFile={setSelectedFile} />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={45} minSize={30}>
              <PdfViewer 
                selectedFile={selectedFile}
              />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={35} minSize={25}>
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
              />
            </Panel>
          </PanelGroup>
        );
      
      case 'images':
        return (
          <PanelGroup key="images-panels" direction="horizontal">
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
                onAddImageContext={handleImageContextAdd}
                isSelectionMode={isImageSelectionMode}
                onToggleSelectionMode={handleToggleImageSelection}
              />
            </Panel>
          </PanelGroup>
        );

      case 'structure':
        return (
          <PanelGroup key="structure-panels" direction="horizontal">
            <Panel defaultSize={25} minSize={20}>
              <FileExplorer onSelectFile={setSelectedFile} />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={35} minSize={25}>
              <DocumentStructure 
                structureData={documentStructure?.structure_data}
                onSelectContext={handleStructureContextSelect}
                selectedFile={selectedFile}
              />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={40} minSize={30}>
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
              />
            </Panel>
          </PanelGroup>
        );

      case 'analytics':
        return (
          <PanelGroup key="analytics-panels" direction="horizontal">
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
              />
            </Panel>
          </PanelGroup>
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
              />
            </Panel>
          </PanelGroup>
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
    <main className="flex h-screen w-full bg-gray-950 text-white overflow-hidden">
      <Sidebar 
        currentSection={currentSection} 
        setCurrentSection={setCurrentSection}
      />
      <div className="flex-1 h-full overflow-hidden">
        {renderMainContent()}
      </div>
    </main>
  )
} 