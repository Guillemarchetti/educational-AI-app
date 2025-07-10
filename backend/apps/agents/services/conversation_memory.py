"""
Conversation Memory - Sistema de memoria conversacional para agentes
"""

import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from django.core.cache import cache
import redis
import os

logger = logging.getLogger(__name__)

class ConversationMemory:
    """
    Sistema de memoria conversacional que mantiene el contexto de las conversaciones
    entre usuarios y agentes especializados.
    
    Funcionalidades:
    - Almacenamiento de mensajes por sesión
    - Gestión de contexto conversacional
    - Limpieza automática de memoria antigua
    - Recuperación de historial por usuario/agente
    - Análisis de patrones conversacionales
    """
    
    def __init__(self, user_id: str, agent_type: str, redis_client=None):
        """
        Inicializar memoria conversacional para un usuario y agente específico
        
        Args:
            user_id: ID único del usuario
            agent_type: Tipo de agente (tutor, evaluator, etc.)
            redis_client: Cliente Redis personalizado (opcional)
        """
        self.user_id = user_id
        self.agent_type = agent_type
        self.logger = logging.getLogger(f"{self.__class__.__name__}_{agent_type}")
        
        # Configurar cliente Redis
        self.redis_client = redis_client or self._init_redis_client()
        
        # Configuración de memoria
        self.max_messages = int(os.getenv('MAX_CONVERSATION_HISTORY', 50))
        self.max_age_days = int(os.getenv('CONVERSATION_MAX_AGE_DAYS', 30))
        self.session_timeout = int(os.getenv('SESSION_TIMEOUT_MINUTES', 60))
        
        # Claves Redis
        self.conversation_key = f"conversation:{user_id}:{agent_type}"
        self.session_key = f"session:{user_id}:{agent_type}"
        self.metadata_key = f"metadata:{user_id}:{agent_type}"
        
        self.logger.info(f"ConversationMemory inicializada para {user_id}/{agent_type}")
    
    def _init_redis_client(self):
        """Inicializar cliente Redis"""
        try:
            # Verificar si Redis está disponible
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            redis_client = redis.from_url(redis_url, decode_responses=True)
            # Probar conexión
            redis_client.ping()
            self.logger.info("Redis conectado exitosamente")
            return redis_client
        except Exception as e:
            self.logger.info(f"Redis no disponible: {e}. Usando cache de Django.")
            return None
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        """
        Agregar mensaje a la memoria conversacional
        
        Args:
            role: 'user' o 'assistant'
            content: Contenido del mensaje
            metadata: Metadatos adicionales del mensaje
        
        Returns:
            bool: True si se guardó exitosamente
        """
        try:
            message = {
                'role': role,
                'content': content,
                'timestamp': datetime.now().isoformat(),
                'metadata': metadata or {}
            }
            
            if self.redis_client:
                # Usar Redis
                self._add_message_redis(message)
            else:
                # Usar cache de Django como fallback
                self._add_message_cache(message)
            
            # Actualizar metadatos de sesión
            self._update_session_metadata()
            
            self.logger.info(f"Mensaje agregado: {role} - {len(content)} caracteres")
            return True
            
        except Exception as e:
            self.logger.error(f"Error agregando mensaje: {e}")
            return False
    
    def _add_message_redis(self, message: Dict[str, Any]):
        """Agregar mensaje usando Redis"""
        # Agregar a lista
        self.redis_client.lpush(self.conversation_key, json.dumps(message))
        
        # Mantener solo los últimos N mensajes
        self.redis_client.ltrim(self.conversation_key, 0, self.max_messages - 1)
        
        # Establecer expiración
        expire_seconds = self.max_age_days * 24 * 60 * 60
        self.redis_client.expire(self.conversation_key, expire_seconds)
    
    def _add_message_cache(self, message: Dict[str, Any]):
        """Agregar mensaje usando cache de Django"""
        # Obtener mensajes existentes
        messages = cache.get(self.conversation_key, [])
        
        # Agregar nuevo mensaje al inicio
        messages.insert(0, message)
        
        # Mantener solo los últimos N mensajes
        messages = messages[:self.max_messages]
        
        # Guardar en cache con timeout
        timeout = self.max_age_days * 24 * 60 * 60
        cache.set(self.conversation_key, messages, timeout)
    
    def get_context(self, limit: int = 10, include_system: bool = False) -> List[Dict[str, Any]]:
        """
        Obtener contexto conversacional reciente
        
        Args:
            limit: Número máximo de mensajes a recuperar
            include_system: Incluir mensajes del sistema
        
        Returns:
            Lista de mensajes ordenados del más reciente al más antiguo
        """
        try:
            if self.redis_client:
                messages = self._get_context_redis(limit)
            else:
                messages = self._get_context_cache(limit)
            
            # Filtrar mensajes del sistema si no se requieren
            if not include_system:
                messages = [msg for msg in messages if msg.get('role') != 'system']
            
            return messages[:limit]
            
        except Exception as e:
            self.logger.error(f"Error obteniendo contexto: {e}")
            return []
    
    def _get_context_redis(self, limit: int) -> List[Dict[str, Any]]:
        """Obtener contexto usando Redis"""
        raw_messages = self.redis_client.lrange(self.conversation_key, 0, limit - 1)
        messages = []
        
        for raw_msg in raw_messages:
            try:
                message = json.loads(raw_msg)
                messages.append(message)
            except json.JSONDecodeError as e:
                self.logger.warning(f"Error decodificando mensaje: {e}")
        
        return messages
    
    def _get_context_cache(self, limit: int) -> List[Dict[str, Any]]:
        """Obtener contexto usando cache de Django"""
        messages = cache.get(self.conversation_key, [])
        return messages[:limit]
    
    def get_full_history(self) -> List[Dict[str, Any]]:
        """
        Obtener historial completo de la conversación
        
        Returns:
            Lista completa de mensajes
        """
        try:
            if self.redis_client:
                raw_messages = self.redis_client.lrange(self.conversation_key, 0, -1)
                messages = []
                
                for raw_msg in raw_messages:
                    try:
                        message = json.loads(raw_msg)
                        messages.append(message)
                    except json.JSONDecodeError:
                        continue
                
                return messages
            else:
                return cache.get(self.conversation_key, [])
                
        except Exception as e:
            self.logger.error(f"Error obteniendo historial completo: {e}")
            return []
    
    def clear_memory(self) -> bool:
        """
        Limpiar completamente la memoria conversacional
        
        Returns:
            bool: True si se limpió exitosamente
        """
        try:
            if self.redis_client:
                self.redis_client.delete(self.conversation_key)
                self.redis_client.delete(self.session_key)
                self.redis_client.delete(self.metadata_key)
            else:
                cache.delete(self.conversation_key)
                cache.delete(self.session_key)
                cache.delete(self.metadata_key)
            
            self.logger.info("Memoria conversacional limpiada")
            return True
            
        except Exception as e:
            self.logger.error(f"Error limpiando memoria: {e}")
            return False
    
    def get_conversation_summary(self) -> Dict[str, Any]:
        """
        Obtener resumen de la conversación actual
        
        Returns:
            Dict con estadísticas y resumen de la conversación
        """
        messages = self.get_full_history()
        
        if not messages:
            return {
                'total_messages': 0,
                'user_messages': 0,
                'assistant_messages': 0,
                'conversation_start': None,
                'last_activity': None,
                'topics_discussed': [],
                'session_duration': 0
            }
        
        # Calcular estadísticas
        user_messages = len([m for m in messages if m.get('role') == 'user'])
        assistant_messages = len([m for m in messages if m.get('role') == 'assistant'])
        
        # Ordenar por timestamp para obtener fechas
        sorted_messages = sorted(messages, key=lambda x: x.get('timestamp', ''))
        conversation_start = sorted_messages[0].get('timestamp') if sorted_messages else None
        last_activity = sorted_messages[-1].get('timestamp') if sorted_messages else None
        
        # Calcular duración de sesión
        session_duration = 0
        if conversation_start and last_activity:
            try:
                start_time = datetime.fromisoformat(conversation_start.replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
                session_duration = (end_time - start_time).total_seconds() / 60  # en minutos
            except Exception:
                session_duration = 0
        
        return {
            'total_messages': len(messages),
            'user_messages': user_messages,
            'assistant_messages': assistant_messages,
            'conversation_start': conversation_start,
            'last_activity': last_activity,
            'session_duration': round(session_duration, 2),
            'agent_type': self.agent_type,
            'user_id': self.user_id
        }
    
    def _update_session_metadata(self):
        """Actualizar metadatos de la sesión"""
        try:
            metadata = {
                'last_activity': datetime.now().isoformat(),
                'agent_type': self.agent_type,
                'user_id': self.user_id,
                'session_active': True
            }
            
            if self.redis_client:
                self.redis_client.setex(
                    self.session_key,
                    self.session_timeout * 60,  # convertir a segundos
                    json.dumps(metadata)
                )
            else:
                cache.set(self.session_key, metadata, self.session_timeout * 60)
                
        except Exception as e:
            self.logger.warning(f"Error actualizando metadatos: {e}")
    
    def is_session_active(self) -> bool:
        """
        Verificar si la sesión está activa
        
        Returns:
            bool: True si la sesión está activa
        """
        try:
            if self.redis_client:
                metadata = self.redis_client.get(self.session_key)
                return metadata is not None
            else:
                metadata = cache.get(self.session_key)
                return metadata is not None
                
        except Exception as e:
            self.logger.error(f"Error verificando sesión: {e}")
            return False
    
    def get_session_metadata(self) -> Dict[str, Any]:
        """
        Obtener metadatos de la sesión actual
        
        Returns:
            Dict con metadatos de la sesión
        """
        try:
            if self.redis_client:
                raw_metadata = self.redis_client.get(self.session_key)
                if raw_metadata:
                    return json.loads(raw_metadata)
            else:
                metadata = cache.get(self.session_key)
                if metadata:
                    return metadata
                    
            return {}
            
        except Exception as e:
            self.logger.error(f"Error obteniendo metadatos: {e}")
            return {}
    
    # Métodos estáticos para gestión global
    
    @staticmethod
    def cleanup_old_conversations(max_age_days: int = 30):
        """
        Limpiar conversaciones antiguas (método para ejecutar periódicamente)
        
        Args:
            max_age_days: Edad máxima en días para mantener conversaciones
        """
        try:
            # Este método se implementaría como una tarea de Celery
            # o un comando de management de Django
            logger.info(f"Iniciando limpieza de conversaciones > {max_age_days} días")
            
            # Lógica de limpieza específica según el backend usado
            # Por ahora es un placeholder
            
        except Exception as e:
            logger.error(f"Error en limpieza de conversaciones: {e}")
    
    @staticmethod
    def get_user_conversations(user_id: str) -> List[Dict[str, Any]]:
        """
        Obtener todas las conversaciones de un usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Lista de conversaciones activas del usuario
        """
        conversations = []
        agent_types = ['tutor', 'evaluator', 'counselor', 'curriculum', 'analytics']
        
        for agent_type in agent_types:
            memory = ConversationMemory(user_id, agent_type)
            summary = memory.get_conversation_summary()
            
            if summary['total_messages'] > 0:
                conversations.append({
                    'agent_type': agent_type,
                    'summary': summary,
                    'is_active': memory.is_session_active()
                })
        
        return conversations
    
    def export_conversation(self, format: str = 'json') -> str:
        """
        Exportar conversación en formato específico
        
        Args:
            format: Formato de exportación ('json', 'txt', 'csv')
        
        Returns:
            String con la conversación exportada
        """
        messages = self.get_full_history()
        
        if format == 'json':
            return json.dumps({
                'user_id': self.user_id,
                'agent_type': self.agent_type,
                'export_date': datetime.now().isoformat(),
                'messages': messages
            }, indent=2, ensure_ascii=False)
        
        elif format == 'txt':
            text_export = f"Conversación: {self.user_id} - {self.agent_type}\n"
            text_export += f"Exportado: {datetime.now().isoformat()}\n"
            text_export += "=" * 50 + "\n\n"
            
            for msg in reversed(messages):  # Más reciente al final
                timestamp = msg.get('timestamp', 'Sin fecha')
                role = msg.get('role', 'unknown').upper()
                content = msg.get('content', '')
                text_export += f"[{timestamp}] {role}:\n{content}\n\n"
            
            return text_export
        
        else:
            raise ValueError(f"Formato de exportación no soportado: {format}")


class ConversationAnalytics:
    """
    Clase para análisis avanzado de conversaciones
    """
    
    @staticmethod
    def analyze_conversation_patterns(user_id: str, days: int = 30) -> Dict[str, Any]:
        """
        Analizar patrones conversacionales de un usuario
        
        Args:
            user_id: ID del usuario
            days: Número de días para el análisis
        
        Returns:
            Dict con análisis de patrones
        """
        conversations = ConversationMemory.get_user_conversations(user_id)
        
        analysis = {
            'user_id': user_id,
            'analysis_period': days,
            'total_conversations': len(conversations),
            'most_used_agent': None,
            'average_session_duration': 0,
            'total_messages': 0,
            'conversation_frequency': 0,
            'agent_preferences': {}
        }
        
        if not conversations:
            return analysis
        
        # Calcular métricas
        total_duration = 0
        total_messages = 0
        agent_usage = {}
        
        for conv in conversations:
            summary = conv['summary']
            agent_type = conv['agent_type']
            
            total_duration += summary.get('session_duration', 0)
            total_messages += summary.get('total_messages', 0)
            
            agent_usage[agent_type] = agent_usage.get(agent_type, 0) + 1
        
        # Calcular promedios
        analysis['average_session_duration'] = round(total_duration / len(conversations), 2)
        analysis['total_messages'] = total_messages
        analysis['agent_preferences'] = agent_usage
        
        if agent_usage:
            analysis['most_used_agent'] = max(agent_usage, key=agent_usage.get)
        
        return analysis 