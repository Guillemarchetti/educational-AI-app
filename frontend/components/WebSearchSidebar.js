import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, BookOpen, Video, GraduationCap, Globe, Brain } from 'lucide-react';

const WebSearchSidebar = ({ currentDocument, currentTopic, userLevel = 'secondary', chatMessages = [], chatContext = [] }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showChatSuggestions, setShowChatSuggestions] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  // Generar query contextual automáticamente
  useEffect(() => {
    if (currentDocument || currentTopic) {
      const contextualQuery = generateContextualQuery();
      setQuery(contextualQuery);
      if (contextualQuery) {
        performSearch(contextualQuery);
      }
    }
  }, [currentDocument, currentTopic]);

  // Búsqueda automática al abrir el panel (solo si hay contexto agregado)
  useEffect(() => {
    if (!query && !isSearching && !searchResults) {
      // Solo hacer búsqueda automática si hay contexto agregado
      const hasAddedContext = chatContext && chatContext.length > 0;
      
      if (hasAddedContext) {
        console.log('🚀 Lanzando búsqueda automática con contexto agregado...');
        // Usar el agente para generar query basada en contexto agregado
        performSearchWithContext();
      } else {
        console.log('🚀 No hay contexto agregado, mostrando mensaje informativo...');
        setQuery('');
        setSearchResults({
          status: 'no_context',
          message: 'Agrega contexto (documentos, imágenes, estructura) para generar búsquedas automáticas'
        });
      }
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  // Actualizar búsqueda cuando cambie el contexto agregado
  useEffect(() => {
    if (chatContext && chatContext.length > 0 && !isUserTyping) {
      console.log('🔄 Contexto agregado actualizado, regenerando búsqueda...');
      performSearchWithContext();
    }
  }, [chatContext, isUserTyping]); // Se ejecuta cuando cambia el contexto agregado

  // Lanzar búsqueda automática si el agente sugiere una consulta principal
  useEffect(() => {
    if (
      searchResults &&
      searchResults.agent_analysis &&
      searchResults.agent_analysis.main_query &&
      !isSearching &&
      (!query || query === prevMainQueryRef.current)
    ) {
      setQuery(searchResults.agent_analysis.main_query);
      performSearch(searchResults.agent_analysis.main_query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults && searchResults.agent_analysis && searchResults.agent_analysis.main_query]);

  // Guardar la última main_query para evitar loops
  const prevMainQueryRef = React.useRef("");
  useEffect(() => {
    if (searchResults && searchResults.agent_analysis && searchResults.agent_analysis.main_query) {
      prevMainQueryRef.current = searchResults.agent_analysis.main_query;
    }
  }, [searchResults && searchResults.agent_analysis && searchResults.agent_analysis.main_query]);

  const generateContextualQuery = () => {
    // Solo usar main_query del agente si existe
    if (searchResults && searchResults.agent_analysis && searchResults.agent_analysis.main_query) {
      return searchResults.agent_analysis.main_query;
    }
    return '';
  };

  const performSearchWithContext = async () => {
    if (!chatContext || chatContext.length === 0) return;

    setIsSearching(true);
    try {
      console.log('🔍 Realizando búsqueda basada en contexto agregado...');
      console.log('📝 Contexto agregado:', chatContext);
      
      const response = await fetch('/api/agents/web-search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '', // Query vacío para que el agente genere basado en contexto
          context: {
            level: userLevel,
            language: 'es',
            subject: currentDocument?.title || currentTopic,
            document_id: currentDocument?.id,
            chat_context: chatContext, // Solo contexto agregado
            chat_messages: [] // No usar mensajes del chat
          },
          user_id: 'default-user'
        }),
      });

      const data = await response.json();
      console.log('📊 Respuesta del backend:', data);
      
      if (data.status === 'success') {
        setSearchResults(data.results);
        setSuggestions(data.suggestions || []);
        console.log('✅ Búsqueda exitosa, resultados:', data.results);
      } else {
        console.error('Error en búsqueda:', data.message);
      }
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      console.log('🔍 Realizando búsqueda manual:', searchQuery);
      
      const response = await fetch('/api/agents/web-search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          context: {
            level: userLevel,
            language: 'es',
            subject: currentDocument?.title || currentTopic,
            document_id: currentDocument?.id,
            chat_context: chatContext, // Contexto agregado
            chat_messages: [] // No usar mensajes del chat
          },
          user_id: 'default-user'
        }),
      });

      const data = await response.json();
      console.log('📊 Respuesta del backend:', data);
      
      if (data.status === 'success') {
        setSearchResults(data.results);
        setSuggestions(data.suggestions || []);
        console.log('✅ Búsqueda exitosa, resultados:', data.results);
      } else {
        console.error('Error en búsqueda:', data.message);
      }
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const handleChatMessageClick = (msg) => {
    setQuery(msg.content);
    performSearch(msg.content);
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'encyclopedia':
        return <BookOpen className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'academic':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Estilo similar al chat history
  return (
    <div className="bg-enterprise-800 rounded-xl shadow border border-enterprise-700/50 p-0 overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-6 pt-6 pb-2 flex-shrink-0">
        <Search className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Buscador Web Contextual</h3>
      </div>

      {/* Campo de búsqueda */}
      <form onSubmit={handleSearch} className="px-6 pt-2 pb-4 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsUserTyping(true);
              // Resetear el flag después de un delay
              setTimeout(() => setIsUserTyping(false), 2000);
            }}
            onFocus={() => setIsUserTyping(true)}
            onBlur={() => setTimeout(() => setIsUserTyping(false), 1000)}
            placeholder="Escribe tu búsqueda o selecciona una sugerencia..."
            className="w-full px-3 py-2 bg-enterprise-900 border border-enterprise-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto">
        {/* Sugerencias rápidas del agente */}
        {searchResults && searchResults.agent_analysis && searchResults.agent_analysis.related_queries?.length > 0 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-gray-400 mb-1">Sugerencias rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {searchResults.agent_analysis.related_queries.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(query)}
                  className="px-3 py-1 rounded-full bg-blue-700/80 text-white text-xs font-medium hover:bg-blue-500 transition"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sugerencias rápidas del chat */}
        {(chatMessages && chatMessages.length > 0) && (
          <div className="px-6 pb-2">
            <p className="text-xs text-gray-400 mb-1">Buscar sobre mensajes recientes del chat:</p>
            <div className="flex flex-col gap-1">
              {chatMessages
                .slice(-5)
                .reverse()
                .filter(msg => msg && msg.content && msg.content.trim() !== "")
                .map((msg, idx) => (
                  <button
                    key={msg.id || idx}
                    onClick={() => handleChatMessageClick(msg)}
                    className="text-xs text-left bg-enterprise-900 text-blue-200 px-3 py-1 rounded hover:bg-enterprise-700 border border-enterprise-700/50 truncate"
                    title={msg.content}
                  >
                    {msg.content.length > 80 ? msg.content.slice(0, 80) + '…' : msg.content}
                  </button>
              ))}
            </div>
          </div>
        )}

        {/* Análisis del agente de contexto */}
        {searchResults && searchResults.agent_analysis && (
          <div className="px-6 pb-4 border-b border-enterprise-700/50">
            <div className="bg-enterprise-900/50 rounded-lg p-3 border border-enterprise-700/30">
              <h5 className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-1">
                <Brain className="w-4 h-4" />
                Análisis del Contexto
              </h5>
              
              {searchResults.agent_analysis.analysis && (
                <p className="text-xs text-gray-300 mb-2">
                  {searchResults.agent_analysis.analysis}
                </p>
              )}
              
              {searchResults.agent_analysis.educational_focus && (
                <div className="text-xs text-blue-300 mb-2">
                  <span className="font-medium">Enfoque:</span> {searchResults.agent_analysis.educational_focus}
                </div>
              )}
              
              {searchResults.agent_analysis.related_queries && searchResults.agent_analysis.related_queries.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">Consultas relacionadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {searchResults.agent_analysis.related_queries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(query)}
                        className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-600/30 border border-blue-600/30"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {searchResults.agent_analysis.suggested_topics && searchResults.agent_analysis.suggested_topics.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Temas sugeridos:</p>
                  <div className="flex flex-wrap gap-1">
                    {searchResults.agent_analysis.suggested_topics.map((topic, index) => (
                      <span
                        key={index}
                        className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded border border-green-600/30"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sugerencias */}
        {suggestions.length > 0 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-gray-400 mb-1">Sugerencias:</p>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Estado de carga */}
        {isSearching && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-400">Buscando recursos...</span>
          </div>
        )}

        {/* Resultados */}
        {searchResults && !isSearching && (
          <div className="space-y-4 px-6 pb-6">
            <div className="flex items-center justify-between pt-2">
              <h4 className="font-medium text-white">Recursos Encontrados</h4>
              <span className="text-xs text-gray-400">
                {searchResults.total_results || 0} resultados
              </span>
            </div>

            {/* Resultados organizados por tipo */}
            {Object.entries(searchResults).map(([category, results]) => {
              if (category === 'all_results' || !Array.isArray(results) || results.length === 0) {
                return null;
              }

              const categoryLabels = {
                encyclopedia: 'Enciclopedia',
                videos: 'Videos',
                academic: 'Recursos Académicos',
                web_results: 'Web'
              };

              return (
                <div key={category} className="space-y-2">
                  <h5 className="text-sm font-medium text-blue-200 flex items-center gap-1">
                    {getResultIcon(category)}
                    {categoryLabels[category] || category}
                  </h5>
                  <div className="space-y-2">
                    {results.slice(0, 3).map((result, index) => (
                      <div
                        key={index}
                        className="p-3 bg-enterprise-900 rounded-lg hover:bg-enterprise-800 transition-colors cursor-pointer border border-enterprise-700/50"
                        onClick={() => openInNewTab(result.url)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h6 className="text-sm font-medium text-white line-clamp-2">
                              {result.title}
                            </h6>
                            <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                              {result.snippet}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-blue-400 font-medium">
                                {result.source}
                              </span>
                              {result.relevance_score && (
                                <span className="text-xs text-gray-500">
                                  Relevancia: {Math.round(result.relevance_score * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {searchResults && searchResults.total_results === 0 && !isSearching && (
          <div className="text-center py-4 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron recursos para esta búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSearchSidebar; 