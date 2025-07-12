import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, BookOpen, Video, GraduationCap, Globe } from 'lucide-react';

const WebSearchSidebar = ({ currentDocument, currentTopic, userLevel = 'secondary' }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

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

  const generateContextualQuery = () => {
    if (currentDocument) {
      return `"${currentDocument.title}" explicación ejemplos`;
    }
    if (currentTopic) {
      return `${currentTopic} explicación`;
    }
    return '';
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
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
            document_id: currentDocument?.id
          },
          user_id: 'default-user'
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setSearchResults(data.results);
        setSuggestions(data.suggestions || []);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Buscador Web Contextual</h3>
      </div>

      {/* Campo de búsqueda */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar recursos educativos..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Sugerencias */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Sugerencias:</p>
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
          <span className="ml-2 text-sm text-gray-600">Buscando recursos...</span>
        </div>
      )}

      {/* Resultados */}
      {searchResults && !isSearching && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Recursos Encontrados</h4>
            <span className="text-xs text-gray-500">
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
                <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  {getResultIcon(category)}
                  {categoryLabels[category] || category}
                </h5>
                <div className="space-y-2">
                  {results.slice(0, 3).map((result, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => openInNewTab(result.url)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h6 className="text-sm font-medium text-gray-800 line-clamp-2">
                            {result.title}
                          </h6>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {result.snippet}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-blue-600 font-medium">
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
  );
};

export default WebSearchSidebar; 