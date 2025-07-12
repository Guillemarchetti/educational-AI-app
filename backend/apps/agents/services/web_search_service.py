"""
Servicio de Búsqueda Web Contextual
Busca recursos educativos relevantes usando APIs gratuitas y scraping controlado
"""

import requests
import json
import logging
from typing import Dict, List, Optional, Any
from urllib.parse import quote_plus, urlparse
import re
from datetime import datetime
import time

logger = logging.getLogger(__name__)

class WebSearchService:
    """
    Servicio para búsqueda web contextual de recursos educativos
    """
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Configuración de APIs gratuitas
        self.duckduckgo_api = "https://api.duckduckgo.com/"
        self.wikipedia_api = "https://es.wikipedia.org/api/rest_v1/"
        self.youtube_api = "https://www.googleapis.com/youtube/v3/"
        
        # Sitios educativos confiables para scraping
        self.educational_sites = [
            "khanacademy.org",
            "coursera.org", 
            "edx.org",
            "mit.edu",
            "harvard.edu",
            "stanford.edu",
            "wikipedia.org",
            "britannica.com",
            "sciencedaily.com",
            "nature.com"
        ]
        
        # Headers para requests
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def search_contextual_resources(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Busca recursos web relevantes basados en el contexto del usuario
        
        Args:
            query: Término de búsqueda
            context: Contexto del usuario (tema, nivel, idioma, etc.)
            
        Returns:
            Dict con resultados organizados por tipo
        """
        try:
            self.logger.info(f"Buscando recursos para: {query}")
            
            # Enriquecer query con contexto
            enriched_query = self._enrich_query_with_context(query, context)
            
            # Realizar búsquedas paralelas
            results = {
                'web_results': self._search_duckduckgo(enriched_query),
                'wikipedia_results': self._search_wikipedia(enriched_query),
                'educational_videos': self._search_educational_videos(enriched_query),
                'academic_resources': self._search_academic_sites(enriched_query),
                'search_metadata': {
                    'query': query,
                    'enriched_query': enriched_query,
                    'context': context,
                    'timestamp': datetime.now().isoformat()
                }
            }
            
            # Filtrar y rankear resultados
            filtered_results = self._filter_and_rank_results(results, context)
            
            return {
                'status': 'success',
                'results': filtered_results,
                'total_results': len(filtered_results.get('all_results', [])),
                'search_time': time.time()
            }
            
        except Exception as e:
            self.logger.error(f"Error en búsqueda web: {str(e)}")
            return {
                'status': 'error',
                'error': str(e),
                'results': {}
            }
    
    def _enrich_query_with_context(self, query: str, context: Dict[str, Any] = None) -> str:
        """Enriquece la query con información del contexto"""
        if not context:
            return query
        
        # Agregar términos educativos según el contexto
        educational_terms = []
        
        if context.get('level') == 'primary':
            educational_terms.extend(['para niños', 'explicación simple', 'básico'])
        elif context.get('level') == 'secondary':
            educational_terms.extend(['explicación', 'ejemplos', 'ejercicios'])
        elif context.get('level') == 'university':
            educational_terms.extend(['académico', 'investigación', 'paper'])
        
        if context.get('language') == 'es':
            educational_terms.extend(['en español', 'explicación en español'])
        
        if context.get('subject'):
            subject = context['subject']
            educational_terms.extend([f'{subject}', f'educación {subject}'])
        
        # Construir query enriquecida
        enriched_terms = [query] + educational_terms
        return ' '.join(enriched_terms)
    
    def _search_duckduckgo(self, query: str) -> List[Dict]:
        """Búsqueda usando DuckDuckGo API (gratuito)"""
        try:
            params = {
                'q': query,
                'format': 'json',
                'no_html': '1',
                'skip_disambig': '1'
            }
            
            response = requests.get(self.duckduckgo_api, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = []
            
            # Procesar resultados principales
            if 'AbstractURL' in data and data['AbstractURL']:
                results.append({
                    'title': data.get('Abstract', ''),
                    'url': data['AbstractURL'],
                    'snippet': data.get('AbstractText', ''),
                    'source': 'DuckDuckGo',
                    'type': 'web_result'
                })
            
            # Procesar resultados relacionados
            for result in data.get('RelatedTopics', [])[:5]:
                if isinstance(result, dict) and 'FirstURL' in result:
                    results.append({
                        'title': result.get('Text', ''),
                        'url': result['FirstURL'],
                        'snippet': result.get('Text', '')[:200],
                        'source': 'DuckDuckGo',
                        'type': 'related_result'
                    })
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error en búsqueda DuckDuckGo: {str(e)}")
            return []
    
    def _search_wikipedia(self, query: str) -> List[Dict]:
        """Búsqueda en Wikipedia API (gratuito)"""
        try:
            # Buscar artículos
            search_url = f"https://es.wikipedia.org/w/api.php"
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': query,
                'srlimit': 5,
                'srnamespace': 0
            }
            
            response = requests.get(search_url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = []
            
            for page in data.get('query', {}).get('search', []):
                # Obtener extracto del artículo
                extract_url = f"https://es.wikipedia.org/w/api.php"
                extract_params = {
                    'action': 'query',
                    'format': 'json',
                    'prop': 'extracts',
                    'exintro': '1',
                    'explaintext': '1',
                    'titles': page['title']
                }
                
                extract_response = requests.get(extract_url, params=extract_params, headers=self.headers, timeout=10)
                if extract_response.status_code == 200:
                    extract_data = extract_response.json()
                    pages = extract_data.get('query', {}).get('pages', {})
                    
                    for page_id, page_data in pages.items():
                        if 'extract' in page_data:
                            results.append({
                                'title': page_data.get('title', ''),
                                'url': f"https://es.wikipedia.org/wiki/{quote_plus(page_data['title'])}",
                                'snippet': page_data['extract'][:300] + '...',
                                'source': 'Wikipedia',
                                'type': 'encyclopedia'
                            })
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error en búsqueda Wikipedia: {str(e)}")
            return []
    
    def _search_educational_videos(self, query: str) -> List[Dict]:
        """Búsqueda de videos educativos (simulada por ahora)"""
        try:
            # Simular búsqueda de videos educativos
            # En una implementación real, usarías YouTube Data API
            educational_channels = [
                'Khan Academy',
                'Coursera',
                'MIT OpenCourseWare',
                'Harvard Online',
                'Stanford Online'
            ]
            
            results = []
            for channel in educational_channels:
                results.append({
                    'title': f"Videos educativos sobre {query} - {channel}",
                    'url': f"https://www.youtube.com/results?search_query={quote_plus(query + ' ' + channel)}",
                    'snippet': f"Encuentra videos educativos sobre {query} en {channel}",
                    'source': channel,
                    'type': 'video'
                })
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error en búsqueda de videos: {str(e)}")
            return []
    
    def _search_academic_sites(self, query: str) -> List[Dict]:
        """Búsqueda en sitios académicos específicos"""
        try:
            results = []
            
            # Buscar en sitios educativos conocidos
            academic_sites = [
                ('Khan Academy', 'https://es.khanacademy.org/search?page_search_query='),
                ('Coursera', 'https://www.coursera.org/search?query='),
                ('MIT OpenCourseWare', 'https://ocw.mit.edu/search/?t='),
                ('Harvard Online', 'https://online-learning.harvard.edu/search?keywords='),
            ]
            
            for site_name, base_url in academic_sites:
                results.append({
                    'title': f"Recursos sobre {query} en {site_name}",
                    'url': f"{base_url}{quote_plus(query)}",
                    'snippet': f"Busca cursos y recursos sobre {query} en {site_name}",
                    'source': site_name,
                    'type': 'academic'
                })
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error en búsqueda académica: {str(e)}")
            return []
    
    def _filter_and_rank_results(self, results: Dict, context: Dict = None) -> Dict:
        """Filtra y rankea los resultados según el contexto"""
        try:
            all_results = []
            
            # Combinar todos los resultados
            for result_type, result_list in results.items():
                if result_type != 'search_metadata':
                    for result in result_list:
                        result['result_type'] = result_type
                        all_results.append(result)
            
            # Filtrar por relevancia y calidad
            filtered_results = []
            for result in all_results:
                # Verificar que la URL sea válida
                if not self._is_valid_url(result.get('url', '')):
                    continue
                
                # Filtrar por idioma si se especifica
                if context and context.get('language') == 'es':
                    if 'wikipedia.org' in result.get('url', '') and 'en.wikipedia.org' in result.get('url', ''):
                        continue  # Evitar Wikipedia en inglés si se busca español
                
                # Asignar score de relevancia
                result['relevance_score'] = self._calculate_relevance_score(result, context)
                filtered_results.append(result)
            
            # Ordenar por relevancia
            filtered_results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            
            # Organizar por tipo
            organized_results = {
                'web_results': [r for r in filtered_results if r.get('type') == 'web_result'],
                'encyclopedia': [r for r in filtered_results if r.get('type') == 'encyclopedia'],
                'videos': [r for r in filtered_results if r.get('type') == 'video'],
                'academic': [r for r in filtered_results if r.get('type') == 'academic'],
                'all_results': filtered_results[:20]  # Top 20 resultados
            }
            
            return organized_results
            
        except Exception as e:
            self.logger.error(f"Error filtrando resultados: {str(e)}")
            return {'all_results': []}
    
    def _calculate_relevance_score(self, result: Dict, context: Dict = None) -> float:
        """Calcula un score de relevancia para un resultado"""
        score = 0.0
        
        # Score base por tipo de fuente
        source_scores = {
            'Wikipedia': 0.8,
            'Khan Academy': 0.9,
            'Coursera': 0.9,
            'MIT OpenCourseWare': 0.95,
            'Harvard Online': 0.95,
            'DuckDuckGo': 0.6
        }
        
        source = result.get('source', '')
        score += source_scores.get(source, 0.5)
        
        # Bonus por sitios educativos
        url = result.get('url', '')
        if any(site in url for site in self.educational_sites):
            score += 0.3
        
        # Bonus por contenido en español (si se especifica)
        if context and context.get('language') == 'es':
            if 'es.wikipedia.org' in url or 'es.khanacademy.org' in url:
                score += 0.2
        
        return score
    
    def _is_valid_url(self, url: str) -> bool:
        """Verifica si una URL es válida"""
        try:
            parsed = urlparse(url)
            return bool(parsed.scheme and parsed.netloc)
        except:
            return False
    
    def get_search_suggestions(self, query: str) -> List[str]:
        """Genera sugerencias de búsqueda basadas en la query"""
        suggestions = []
        
        # Agregar términos educativos comunes
        educational_terms = [
            'explicación', 'ejemplos', 'ejercicios', 'tutorial',
            'curso', 'lección', 'aprender', 'estudiar'
        ]
        
        for term in educational_terms:
            suggestions.append(f"{query} {term}")
        
        return suggestions[:5] 