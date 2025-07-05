"""
Agent Manager - Sistema central de gestión de agentes especializados
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

from .tutor_agent import TutorAgent
from .evaluator_agent import EvaluatorAgent
from .counselor_agent import CounselorAgent
from .curriculum_agent import CurriculumPlannerAgent
from .analytics_agent import AnalyticsAgent
from .content_creator_agent import ContentCreatorAgent

logger = logging.getLogger(__name__)

class AgentManager:
    """
    Gestor central para todos los agentes especializados.
    
    Responsabilidades:
    - Routing de consultas al agente apropiado
    - Coordinación entre agentes
    - Gestión de memoria conversacional
    - Monitoreo de rendimiento
    - Balanceamiento de carga
    """
    
    def __init__(self):
        """Inicializar el gestor de agentes"""
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Inicializar todos los agentes
        self.agents = self._initialize_agents()
        
        # Configuración de routing
        self.routing_config = self._setup_routing_config()
        
        # Métricas y monitoreo
        self.metrics = {
            'total_queries': 0,
            'agent_usage': {agent_id: 0 for agent_id in self.agents.keys()},
            'average_response_time': 0,
            'errors': 0
        }
        
        self.logger.info(f"AgentManager inicializado con {len(self.agents)} agentes")
    
    def _initialize_agents(self) -> Dict[str, Any]:
        """Inicializar todos los agentes especializados"""
        agents = {}
        
        try:
            agents['tutor'] = TutorAgent()
            self.logger.info("✅ Tutor Agent inicializado")
        except Exception as e:
            self.logger.error(f"❌ Error inicializando Tutor Agent: {e}")
        
        try:
            agents['evaluator'] = EvaluatorAgent()
            self.logger.info("✅ Evaluator Agent inicializado")
        except Exception as e:
            self.logger.error(f"❌ Error inicializando Evaluator Agent: {e}")
        
        try:
            agents['counselor'] = CounselorAgent()
            self.logger.info("✅ Counselor Agent inicializado")
        except Exception as e:
            self.logger.error(f"❌ Error inicializando Counselor Agent: {e}")
        
        try:
            agents['curriculum'] = CurriculumPlannerAgent()
            self.logger.info("✅ Curriculum Agent inicializado")
        except Exception as e:
            self.logger.error(f"❌ Error inicializando Curriculum Agent: {e}")
        
        try:
            agents['analytics'] = AnalyticsAgent()
            self.logger.info("✅ Analytics Agent inicializado")
        except Exception as e:
            self.logger.error(f"❌ Error inicializando Analytics Agent: {e}")
        
        try:
            agents['content_creator'] = ContentCreatorAgent()
            self.logger.info("✅ Content Creator Agent inicializado")
        except Exception as e:
            self.logger.error(f"❌ Error inicializando Content Creator Agent: {e}")
        
        return agents
    
    def _setup_routing_config(self) -> Dict[str, Dict[str, Any]]:
        """Configurar reglas de routing para cada agente"""
        return {
            'tutor': {
                'keywords': [
                    'explicar', 'enseñar', 'aprender', 'estudiar', 'entender',
                    'concepto', 'tema', 'materia', 'lección', 'ejercicio',
                    'tarea', 'homework', 'doubt', 'pregunta', 'ayuda'
                ],
                'description': 'Enseñanza, explicaciones y apoyo académico',
                'priority': 1
            },
            'evaluator': {
                'keywords': [
                    'evaluar', 'calificar', 'examen', 'quiz', 'test',
                    'evaluación', 'rúbrica', 'puntaje', 'nota', 'feedback',
                    'corrección', 'assessment', 'grade', 'score'
                ],
                'description': 'Evaluación y calificación académica',
                'priority': 2
            },
            'counselor': {
                'keywords': [
                    'consejo', 'orientación', 'carrera', 'futuro', 'vocacional',
                    'estrés', 'ansiedad', 'motivación', 'goals', 'metas',
                    'guidance', 'advice', 'support', 'emotional', 'personal'
                ],
                'description': 'Orientación académica y apoyo socioemocional',
                'priority': 2
            },
            'curriculum': {
                'keywords': [
                    'currículo', 'curriculum', 'plan', 'planificar', 'syllabus',
                    'programa', 'secuencia', 'objetivos', 'competencias',
                    'diseño', 'estructura', 'planning', 'course'
                ],
                'description': 'Diseño curricular y planificación educativa',
                'priority': 3
            },
            'analytics': {
                'keywords': [
                    'análisis', 'datos', 'estadísticas', 'métricas', 'reportes',
                    'tendencias', 'patterns', 'insights', 'performance',
                    'data', 'analytics', 'dashboard', 'report'
                ],
                'description': 'Análisis de datos educativos y reportes',
                'priority': 3
            },
            'content_creator': {
                'keywords': [
                    'crear', 'generar', 'diseñar', 'simulación', 'interactivo',
                    'ejercicio', 'actividad', 'juego', 'contenido', 'práctica',
                    'laboratorio', 'experimento', 'visual', 'manipulativo'
                ],
                'description': 'Creación de contenido interactivo y simulaciones matemáticas',
                'priority': 2
            }
        }
    
    def route_query(self, query: str, agent_type: Optional[str] = None, 
                   context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Enrutar consulta al agente apropiado
        
        Args:
            query: Consulta del usuario
            agent_type: Tipo de agente específico (opcional)
            context: Contexto adicional para la consulta
        
        Returns:
            Dict con la respuesta del agente y metadatos
        """
        start_time = datetime.now()
        context = context or {}
        
        try:
            # Determinar agente apropiado
            if agent_type and agent_type in self.agents:
                selected_agent_id = agent_type
            else:
                selected_agent_id = self._determine_best_agent(query)
            
            # Verificar que el agente existe
            if selected_agent_id not in self.agents:
                raise ValueError(f"Agente '{selected_agent_id}' no disponible")
            
            agent = self.agents[selected_agent_id]
            
            # Enriquecer contexto
            enriched_context = self._enrich_context(context, selected_agent_id)
            
            # Procesar consulta
            response = agent.process_query(query, enriched_context)
            
            # Calcular tiempo de respuesta
            response_time = (datetime.now() - start_time).total_seconds()
            
            # Actualizar métricas
            self._update_metrics(selected_agent_id, response_time, success=True)
            
            # Registrar interacción
            self._log_interaction(query, selected_agent_id, response, response_time)
            
            return {
                'success': True,
                'agent_used': selected_agent_id,
                'agent_name': agent.get_agent_name(),
                'response': response,
                'response_time': response_time,
                'context_used': enriched_context,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            # Manejar errores
            response_time = (datetime.now() - start_time).total_seconds()
            self._update_metrics(selected_agent_id if 'selected_agent_id' in locals() else 'unknown', 
                               response_time, success=False)
            
            self.logger.error(f"Error procesando consulta: {e}")
            
            return {
                'success': False,
                'error': str(e),
                'agent_used': selected_agent_id if 'selected_agent_id' in locals() else None,
                'response': self._get_fallback_response(),
                'response_time': response_time,
                'timestamp': datetime.now().isoformat()
            }
    
    def _determine_best_agent(self, query: str) -> str:
        """
        Determinar el mejor agente para una consulta basándose en análisis de contenido
        """
        query_lower = query.lower()
        agent_scores = {}
        
        # Analizar keywords para cada agente
        for agent_id, config in self.routing_config.items():
            score = 0
            keywords = config['keywords']
            
            # Contar matches de keywords
            for keyword in keywords:
                if keyword in query_lower:
                    score += 1
            
            # Aplicar factor de prioridad
            priority_factor = 1.0 / config['priority']
            agent_scores[agent_id] = score * priority_factor
        
        # Si no hay matches claros, usar tutor como default
        if not any(score > 0 for score in agent_scores.values()):
            return 'tutor'
        
        # Retornar agente con mayor score
        best_agent = max(agent_scores, key=agent_scores.get)
        
        self.logger.info(f"Query routing: '{query[:50]}...' -> {best_agent} (score: {agent_scores[best_agent]})")
        return best_agent
    
    def _enrich_context(self, context: Dict[str, Any], agent_id: str) -> Dict[str, Any]:
        """
        Enriquecer contexto con información específica del agente
        """
        enriched_context = context.copy()
        
        # Agregar información del agente
        enriched_context.update({
            'selected_agent': agent_id,
            'agent_capabilities': self.get_agent_capabilities(agent_id),
            'routing_timestamp': datetime.now().isoformat(),
            'session_metrics': self._get_session_metrics()
        })
        
        return enriched_context
    
    def _update_metrics(self, agent_id: str, response_time: float, success: bool):
        """Actualizar métricas de rendimiento"""
        self.metrics['total_queries'] += 1
        
        if agent_id in self.metrics['agent_usage']:
            self.metrics['agent_usage'][agent_id] += 1
        
        # Actualizar tiempo promedio de respuesta
        total_time = self.metrics['average_response_time'] * (self.metrics['total_queries'] - 1)
        self.metrics['average_response_time'] = (total_time + response_time) / self.metrics['total_queries']
        
        if not success:
            self.metrics['errors'] += 1
    
    def _log_interaction(self, query: str, agent_id: str, response: str, response_time: float):
        """Registrar interacción en logs"""
        self.logger.info(f"Interacción procesada - Agente: {agent_id}, "
                        f"Query: '{query[:50]}...', "
                        f"Response time: {response_time:.2f}s")
    
    def _get_fallback_response(self) -> str:
        """Respuesta de fallback en caso de error"""
        return """
Lo siento, hubo un problema procesando tu consulta. 

Por favor, intenta reformular tu pregunta o especifica qué tipo de ayuda necesitas:
- 📚 **Tutor**: Para explicaciones y apoyo académico
- 📝 **Evaluador**: Para evaluaciones y feedback
- 🎯 **Consejero**: Para orientación académica y personal
- 📋 **Planificador**: Para diseño curricular
- 📊 **Analítico**: Para análisis de datos educativos

¿Con cuál te gustaría que te ayude?
"""
    
    def _get_session_metrics(self) -> Dict[str, Any]:
        """Obtener métricas de la sesión actual"""
        return {
            'queries_processed': self.metrics['total_queries'],
            'average_response_time': self.metrics['average_response_time'],
            'error_rate': self.metrics['errors'] / max(self.metrics['total_queries'], 1) * 100
        }
    
    # Métodos públicos para gestión de agentes
    
    def get_available_agents(self) -> Dict[str, Dict[str, Any]]:
        """Obtener información de todos los agentes disponibles"""
        agents_info = {}
        
        for agent_id, agent in self.agents.items():
            agents_info[agent_id] = {
                'id': agent_id,
                'name': agent.get_agent_name(),
                'description': self.routing_config.get(agent_id, {}).get('description', 'N/A'),
                'status': 'active' if agent else 'inactive',
                'capabilities': self.get_agent_capabilities(agent_id),
                'usage_count': self.metrics['agent_usage'].get(agent_id, 0)
            }
        
        return agents_info
    
    def get_agent_capabilities(self, agent_id: str) -> Dict[str, Any]:
        """Obtener capacidades específicas de un agente"""
        if agent_id not in self.agents:
            return {}
        
        agent = self.agents[agent_id]
        
        try:
            if hasattr(agent, 'get_specialized_capabilities'):
                return agent.get_specialized_capabilities()
            elif hasattr(agent, 'get_capabilities'):
                return agent.get_capabilities()
            else:
                return {'basic_ai_capabilities': True}
        except Exception as e:
            self.logger.warning(f"Error obteniendo capacidades del agente {agent_id}: {e}")
            return {}
    
    def health_check(self) -> Dict[str, Any]:
        """Verificar estado de salud del sistema de agentes"""
        health_status = {
            'status': 'healthy',
            'agents_online': len(self.agents),
            'total_agents': 5,  # Número esperado de agentes
            'metrics': self.metrics.copy(),
            'timestamp': datetime.now().isoformat()
        }
        
        # Verificar estado de cada agente
        agent_health = {}
        for agent_id, agent in self.agents.items():
            try:
                if hasattr(agent, 'health_check'):
                    agent_status = agent.health_check()
                else:
                    agent_status = {'status': 'unknown', 'message': 'Health check not implemented'}
                
                agent_health[agent_id] = agent_status
            except Exception as e:
                agent_health[agent_id] = {'status': 'error', 'message': str(e)}
        
        health_status['agents_status'] = agent_health
        
        # Determinar estado general
        failed_agents = sum(1 for status in agent_health.values() 
                          if status.get('status') != 'healthy')
        
        if failed_agents > 0:
            health_status['status'] = 'degraded' if failed_agents < len(self.agents) / 2 else 'unhealthy'
        
        return health_status
    
    def get_usage_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de uso detalladas"""
        return {
            'total_queries': self.metrics['total_queries'],
            'agent_usage_distribution': self.metrics['agent_usage'].copy(),
            'average_response_time': self.metrics['average_response_time'],
            'error_rate': self.metrics['errors'] / max(self.metrics['total_queries'], 1) * 100,
            'most_used_agent': max(self.metrics['agent_usage'], 
                                 key=self.metrics['agent_usage'].get) if self.metrics['agent_usage'] else None,
            'uptime': 'Sistema activo',  # Se podría calcular tiempo real
            'last_updated': datetime.now().isoformat()
        }
    
    def reset_metrics(self):
        """Reiniciar métricas de uso"""
        self.metrics = {
            'total_queries': 0,
            'agent_usage': {agent_id: 0 for agent_id in self.agents.keys()},
            'average_response_time': 0,
            'errors': 0
        }
        self.logger.info("Métricas reiniciadas")
    
    def reload_agent(self, agent_id: str) -> bool:
        """Recargar un agente específico"""
        if agent_id not in self.agents:
            return False
        
        try:
            # Mapeo de IDs a clases
            agent_classes = {
                'tutor': TutorAgent,
                'evaluator': EvaluatorAgent,
                'counselor': CounselorAgent,
                'curriculum': CurriculumPlannerAgent,
                'analytics': AnalyticsAgent
            }
            
            if agent_id in agent_classes:
                self.agents[agent_id] = agent_classes[agent_id]()
                self.logger.info(f"Agente {agent_id} recargado exitosamente")
                return True
            
        except Exception as e:
            self.logger.error(f"Error recargando agente {agent_id}: {e}")
        
        return False 