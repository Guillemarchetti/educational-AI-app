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
            
            # Debug: Imprimir API key que está usando
            if api_key:
                masked_key = f"{api_key[:10]}...{api_key[-4:]}" if len(api_key) > 14 else "***"
                print(f"🔍 AI Service usando API Key: {masked_key}")
            else:
                print("❌ AI Service: No se encontró OPENAI_API_KEY")
            
            if not api_key or api_key == 'sk-your-openai-key-here':
                self.logger.warning("OpenAI API key no configurada")
                return None
            
            # Limpiar variables de entorno que puedan causar conflictos
            env_vars_to_clean = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']
            for var in env_vars_to_clean:
                if var in os.environ:
                    del os.environ[var]
            
            # Inicializar cliente con configuración mínima
            try:
                # Inicialización completamente aislada
                import openai
                # Limpiar cualquier configuración global
                if hasattr(openai, 'api_key'):
                    del openai.api_key
                if hasattr(openai, 'api_base'):
                    del openai.api_base
                
                # Crear cliente con configuración mínima
                client = openai.OpenAI(api_key=api_key)
            except Exception as e:
                self.logger.error(f"Error en inicialización aislada: {e}")
                # Intentar con configuración manual
                try:
                    import openai
                    client = openai.OpenAI()
                    client.api_key = api_key
                except Exception as e2:
                    self.logger.error(f"Error en configuración manual: {e2}")
                    raise e2
            
            self.logger.info(f"OpenAI cliente inicializado correctamente")
            return client
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

{'🚫 RESTRICCIÓN: En el chat normal está PROHIBIDO generar quizzes, evaluaciones o respuestas en formato JSON. Solo proporciona explicaciones claras y ejercicios prácticos.' if not context.get('is_quiz_system', False) else '✅ MODO QUIZ: Responde ÚNICAMENTE en formato JSON válido para generar el quiz.'}
"""
        
        return context_prompt
    
    def process_query_with_openai(self, query: str, context: Dict[str, Any]) -> str:
        """
        Procesar consulta usando OpenAI GPT-4o-mini (más económico).
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
            
            self.logger.info(f"Procesando consulta con OpenAI GPT-4o-mini - Tokens: {total_tokens}")
            
            # Debug: Verificar API key antes de la llamada
            current_api_key = os.getenv('OPENAI_API_KEY')
            if current_api_key:
                masked_key = f"{current_api_key[:10]}...{current_api_key[-4:]}" if len(current_api_key) > 14 else "***"
                print(f"🔍 Llamada OpenAI usando API Key: {masked_key}")
            
            # Llamada a OpenAI usando gpt-4o-mini (más económico)
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Modelo más económico para consultas de texto
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
    
    def process_image_with_openai(self, prompt: str, image_data: str, context: Dict[str, Any]) -> str:
        """
        Procesar imagen usando OpenAI GPT-4o Vision (específicamente para análisis de imágenes).
        Este método usa gpt-4o que tiene capacidades de visión, a diferencia de gpt-4o-mini.
        """
        if not self.openai_client:
            return "Lo siento, el servicio de OpenAI no está disponible en este momento."
        
        try:
            self.logger.info(f"Procesando imagen con OpenAI GPT-4o Vision")
            
            # Usar GPT-4o Vision para análisis de imágenes (más costoso pero necesario para visión)
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",  # Modelo con capacidades de visión
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_data
                                }
                            }
                        ]
                    }
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                timeout=self.timeout
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error procesando imagen con OpenAI: {e}")
            return f"Lo siento, hubo un error procesando tu imagen: {str(e)}"
    
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
        Usa OpenAI exclusivamente.
        """
        start_time = datetime.now()
        
        # Validar entrada
        if not query or not query.strip():
            return "Por favor, proporciona una consulta válida."
        
        max_length = int(os.getenv('MAX_INPUT_LENGTH', 5000))
        if len(query) > max_length:
            return f"La consulta es demasiado larga. Máximo {max_length} caracteres."
        
        # Usar OpenAI exclusivamente
        if self.openai_client:
            response = self.process_query_with_openai(query, context)
            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Consulta procesada exitosamente en {processing_time:.2f}s")
            return response
        
        # Si OpenAI no está disponible
        return "Lo siento, el servicio de OpenAI no está disponible en este momento. Por favor, configura la API key de OpenAI en el archivo .env."
    
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
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'openai_available': self.openai_client is not None,
            'claude_available': self.claude_client is not None,
            'agent_name': self.get_agent_name(),
            'capabilities': self.get_capabilities()
        }


class AIService(BaseAIService):
    """
    Servicio de IA general para análisis y procesamiento de consultas.
    """
    
    def get_system_prompt(self) -> str:
        """
        Prompt del sistema para el servicio de IA general.
        """
        return """
        Eres un asistente de IA educativo especializado en análisis de contenido.
        
        Tu función principal es:
        1. Analizar imágenes y contenido educativo
        2. Proporcionar explicaciones claras y detalladas
        3. Adaptar tu lenguaje al nivel educativo apropiado
        4. Ser preciso y útil en tus respuestas
        
        Características de tu personalidad:
        - Educativo y paciente
        - Claro y conciso
        - Motivador y positivo
        - Adaptable al nivel del estudiante
        
        Siempre responde en español y estructura tus respuestas de manera clara.
        """
    
    def get_agent_name(self) -> str:
        """
        Nombre del agente de IA general.
        """
        return "Asistente de IA General"
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Capacidades del servicio de IA general.
        """
        return {
            'image_analysis': True,
            'text_processing': True,
            'educational_content': True,
            'multilingual': False,
            'real_time': True,
            'supported_formats': ['text', 'image', 'pdf_extract']
        } 