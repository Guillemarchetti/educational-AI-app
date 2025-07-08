'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'

import { ChatInterface } from '@/components/enterprise/ChatInterface'
import { FileExplorer } from '@/components/enterprise/FileExplorer'
import { DocumentStructure } from '@/components/enterprise/DocumentStructure'
import { Sidebar } from '@/components/enterprise/Sidebar'
import { ImageSelector } from '@/components/enterprise/ImageSelector'

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
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  const [contextText, setContextText] = useState<string[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [currentSection, setCurrentSection] = useState('chat')

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
    console.log('Adding image context:', { imageData, description })
    const imageContext = `🖼️ IMAGEN SELECCIONADA: ${description}\n📄 Archivo: ${selectedFile?.name}\n🔍 Analiza esta imagen y explícame lo que ves.`;
    handleContextAdd(imageContext);
  };

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

    } catch (error) {
      console.error("Error en extracción de texto:", error);
      // Aquí podrías mostrar una notificación al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsExtracting(false);
    }
  };

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
            <Panel defaultSize={45} minSize={30}>
              <PdfViewer 
                selectedFile={selectedFile}
              />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-gray-800/50 hover:bg-blue-400/50 transition-colors" />
            <Panel defaultSize={35} minSize={25}>
              <ImageSelector 
                selectedFile={selectedFile}
                onAddImageContext={handleImageContextAdd}
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
                selectedDocumentId={selectedFile?.id || ''} 
                onAddToContext={handleStructureContextAdd}
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
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Chat Agent AI</h2>
              <p>Selecciona una sección del menú lateral</p>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex h-screen w-full bg-gray-950 text-white">
      <Sidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <div className="flex-1">
        {renderMainContent()}
      </div>
    </main>
  )
} 