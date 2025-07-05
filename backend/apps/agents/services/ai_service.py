"""
Servicio Base de IA para Agentes Educativos
Este módulo contiene la clase base que todos los agentes especializados heredarán.
"""

import os
import logging
import asyncio
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime

import tiktoken
from openai import OpenAI
from anthropic import Anthropic
from django.conf import settings

# Configurar logging
logger = logging.getLogger(__name__)

class BaseAIService(ABC):
    """
    Clase base para todos los servicios de IA.
    Proporciona funcionalidad común para interactuar con APIs de IA.
    """
    
    def __init__(self):
        """Inicializar el servicio base de IA"""
        # Configurar logging primero
        self.logger = logging.getLogger(self.__class__.__name__)
        self.encoding = tiktoken.get_encoding("cl100k_base")
        
        self.openai_client = self._init_openai_client()
        self.claude_client = self._init_claude_client()
        
        # Configuración por defecto
        self.max_tokens = int(os.getenv('OPENAI_MAX_TOKENS', 1500))
        self.temperature = float(os.getenv('OPENAI_TEMPERATURE', 0.7))
        self.timeout = int(os.getenv('AGENT_RESPONSE_TIMEOUT', 30))
    
    def _init_openai_client(self) -> Optional[OpenAI]:
        """Inicializar cliente de OpenAI"""
        try:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key or api_key == 'sk-your-openai-key-here':
                self.logger.warning("OpenAI API key no configurada")
                return None
            return OpenAI(api_key=api_key)
        except Exception as e:
            self.logger.error(f"Error inicializando cliente OpenAI: {e}")
            return None
    
    def _init_claude_client(self) -> Optional[Anthropic]:
        """Inicializar cliente de Claude"""
        try:
            api_key = os.getenv('ANTHROPIC_API_KEY')
            if not api_key or api_key == 'your-claude-key-here':
                self.logger.warning("Claude API key no configurada")
                return None
            return Anthropic(api_key=api_key)
        except Exception as e:
            self.logger.error(f"Error inicializando cliente Claude: {e}")
            return None
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """
        Obtener el prompt del sistema para el agente específico.
        Debe ser implementado por cada agente especializado.
        """
        pass
    
    @abstractmethod
    def get_agent_name(self) -> str:
        """
        Obtener el nombre del agente.
        Debe ser implementado por cada agente especializado.
        """
        pass
    
    def count_tokens(self, text: str) -> int:
        """Contar tokens en un texto"""
        try:
            return len(self.encoding.encode(text))
        except Exception as e:
            self.logger.error(f"Error contando tokens: {e}")
            return len(text.split()) * 1.3  # Estimación aproximada
    
    def truncate_to_token_limit(self, text: str, max_tokens: int) -> str:
        """Truncar texto para que no exceda el límite de tokens"""
        try:
            tokens = self.encoding.encode(text)
            if len(tokens) <= max_tokens:
                return text
            
            truncated_tokens = tokens[:max_tokens]
            return self.encoding.decode(truncated_tokens)
        except Exception as e:
            self.logger.error(f"Error truncando texto: {e}")
            # Fallback: truncar por caracteres
            char_limit = max_tokens * 4  # Aproximación
            return text[:char_limit] + "..." if len(text) > char_limit else text
    
    def _build_context_prompt(self, query: str, context: Dict[str, Any]) -> str:
        """
        Construir el prompt con contexto para el agente.
        """
        user_level = context.get('user_level', 'Estudiante')
        subject = context.get('subject', 'General')
        conversation_history = context.get('conversation_history', [])
        relevant_documents = context.get('relevant_documents', [])
        user_profile = context.get('user_profile', {})
        explicit_context = context.get('explicit_context', None)
        
        # Construir contexto explícito del usuario
        explicit_context_prompt = ""
        if explicit_context:
            explicit_context_prompt = f"""
--- Contexto Explícito Proporcionado por el Usuario ---
El usuario ha seleccionado el siguiente texto del documento para que lo uses como contexto principal para tu respuesta. Préstale especial atención:

<context>
{explicit_context}
</context>
"""

        # Construir contexto de conversación
        conversation_context = ""
        if conversation_history:
            conversation_context = "\n--- Historial de Conversación Reciente ---\n"
            for msg in conversation_history[-5:]:  # Últimos 5 mensajes
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')
                conversation_context += f"{role.upper()}: {content}\n"
        
        # Construir contexto de documentos
        documents_context = ""
        if relevant_documents:
            documents_context = "\n--- Documentos Relevantes ---\n"
            for i, doc in enumerate(relevant_documents[:3]):  # Top 3 documentos
                documents_context += f"Documento {i+1}: {doc[:300]}...\n"
        
        # Construir perfil de usuario
        profile_context = ""
        if user_profile:
            profile_context = f"\n--- Perfil del Usuario ---\n"
            profile_context += f"Nombre: {user_profile.get('name', 'Usuario')}\n"
            profile_context += f"Nivel: {user_level}\n"
            profile_context += f"Área de interés: {subject}\n"
        
        # Prompt final
        context_prompt = f"""
{explicit_context_prompt}
{profile_context}
{conversation_context}
{documents_context}

--- Consulta Actual ---
{query}

Por favor, responde como {self.get_agent_name()} considerando todo el contexto proporcionado.
"""
        
        return context_prompt
    
    def process_query_with_openai(self, query: str, context: Dict[str, Any]) -> str:
        """
        Procesar consulta usando OpenAI GPT.
        """
        if not self.openai_client:
            return "Lo siento, el servicio de OpenAI no está disponible en este momento."
        
        try:
            # Construir prompt con contexto
            context_prompt = self._build_context_prompt(query, context)
            system_prompt = self.get_system_prompt()
            
            # Verificar límites de tokens
            total_tokens = self.count_tokens(system_prompt + context_prompt)
            if total_tokens > 3000:  # Dejar espacio para la respuesta
                context_prompt = self.truncate_to_token_limit(context_prompt, 2000)
            
            self.logger.info(f"Procesando consulta con OpenAI - Tokens: {total_tokens}")
            
            # Llamada a OpenAI
            response = self.openai_client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', 'gpt-4-turbo'),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": context_prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                timeout=self.timeout
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error procesando consulta con OpenAI: {e}")
            return f"Lo siento, hubo un error procesando tu consulta: {str(e)}"
    
    def process_query_with_claude(self, query: str, context: Dict[str, Any]) -> str:
        """
        Procesar consulta usando Claude de Anthropic.
        """
        if not self.claude_client:
            return "Lo siento, el servicio de Claude no está disponible en este momento."
        
        try:
            # Construir prompt con contexto
            context_prompt = self._build_context_prompt(query, context)
            system_prompt = self.get_system_prompt()
            
            self.logger.info(f"Procesando consulta con Claude")
            
            # Llamada a Claude
            response = self.claude_client.messages.create(
                model=os.getenv('CLAUDE_MODEL', 'claude-3-sonnet-20240229'),
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": context_prompt}
                ]
            )
            
            return response.content[0].text
            
        except Exception as e:
            self.logger.error(f"Error procesando consulta con Claude: {e}")
            return f"Lo siento, hubo un error procesando tu consulta: {str(e)}"
    
    def process_query(self, query: str, context: Dict[str, Any]) -> str:
        """
        Método principal para procesar consultas.
        Intenta OpenAI primero, luego Claude como fallback.
        """
        start_time = datetime.now()
        
        # Validar entrada
        if not query or not query.strip():
            return "Por favor, proporciona una consulta válida."
        
        max_length = int(os.getenv('MAX_INPUT_LENGTH', 5000))
        if len(query) > max_length:
            return f"La consulta es demasiado larga. Máximo {max_length} caracteres."
        
        # Intentar con OpenAI primero
        if self.openai_client:
            response = self.process_query_with_openai(query, context)
            if not response.startswith("Lo siento"):
                processing_time = (datetime.now() - start_time).total_seconds()
                self.logger.info(f"Consulta procesada exitosamente en {processing_time:.2f}s")
                return response
        
        # Fallback a Claude
        if self.claude_client:
            response = self.process_query_with_claude(query, context)
            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Consulta procesada con Claude en {processing_time:.2f}s")
            return response
        
        # Si ninguno está disponible
        return "Lo siento, los servicios de IA no están disponibles en este momento. Por favor, configura las API keys en el archivo .env."
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Obtener las capacidades del agente.
        """
        return {
            'agent_name': self.get_agent_name(),
            'openai_available': self.openai_client is not None,
            'claude_available': self.claude_client is not None,
            'max_tokens': self.max_tokens,
            'temperature': self.temperature,
            'timeout': self.timeout
        }
    
    def health_check(self) -> Dict[str, Any]:
        """
        Verificar el estado de salud del servicio.
        """
        return {
            'agent_name': self.get_agent_name(),
            'status': 'healthy' if (self.openai_client or self.claude_client) else 'unhealthy',
            'openai_configured': self.openai_client is not None,
            'claude_configured': self.claude_client is not None,
            'timestamp': datetime.now().isoformat()
        } 