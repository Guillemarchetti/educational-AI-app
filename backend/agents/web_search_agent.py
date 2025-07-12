import openai
import os
from typing import List, Dict, Any
import json
from dotenv import load_dotenv
load_dotenv()

class WebSearchContextAgent:
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
    
    def generate_search_queries(self, chat_messages: List[Dict], chat_context: List[str], 
                              current_document: Dict = None, user_level: str = "secondary") -> Dict[str, Any]:
        """
        Genera consultas de búsqueda optimizadas basadas SOLO en el contexto agregado.
        
        Args:
            chat_messages: Lista de mensajes del chat (NO usado para búsquedas)
            chat_context: Contexto agregado (documentos, imágenes, estructura)
            current_document: Documento actual si existe
            user_level: Nivel educativo del usuario
            
        Returns:
            Dict con consultas generadas basadas en el contexto agregado
        """
        try:
            # Preparar el contexto agregado para el agente
            context_summary = self._prepare_added_context_summary(chat_context, current_document)
            
            # Si no hay contexto agregado, no generar búsquedas
            if not context_summary or context_summary == "Sin contexto agregado disponible":
                return {
                    "status": "no_context",
                    "message": "No hay contexto agregado para generar búsquedas",
                    "main_query": "",
                    "related_queries": []
                }
            
            # Prompt para el agente enfocado en contexto agregado
            system_prompt = f"""
            Eres un asistente educativo especializado en generar consultas de búsqueda web basadas SOLO en el contexto agregado por el usuario.
            
            Tu objetivo es analizar el contexto agregado (documentos, imágenes, estructura) y generar 3-5 consultas de búsqueda que:
            1. Sean relevantes al contenido del contexto agregado
            2. Ayuden a encontrar recursos educativos complementarios al material
            3. Se adapten al nivel educativo del usuario ({user_level})
            4. Incluyan diferentes tipos de contenido (explicaciones, ejemplos, ejercicios, videos)
            
            IMPORTANTE: NO uses mensajes del chat, solo el contexto agregado.
            Nivel educativo: {user_level}
            
            Responde en formato JSON con la siguiente estructura:
            {{
                "analysis": "Breve análisis del contexto agregado y tema principal",
                "main_query": "Consulta principal más relevante al contexto",
                "related_queries": ["Consulta 1", "Consulta 2", "Consulta 3"],
                "educational_focus": "Enfoque educativo específico",
                "suggested_topics": ["Tema 1", "Tema 2", "Tema 3"]
            }}
            """
            
            user_prompt = f"""
            Contexto agregado por el usuario:
            {context_summary}
            
            Genera consultas de búsqueda educativas basadas SOLO en este contexto agregado.
            """
            
            # Llamar a OpenAI usando la nueva API
            client = openai.OpenAI(api_key=self.openai_api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            # Procesar respuesta
            content = response.choices[0].message.content
            try:
                result = json.loads(content)
                return {
                    "status": "success",
                    "analysis": result.get("analysis", ""),
                    "main_query": result.get("main_query", ""),
                    "related_queries": result.get("related_queries", []),
                    "educational_focus": result.get("educational_focus", ""),
                    "suggested_topics": result.get("suggested_topics", [])
                }
            except json.JSONDecodeError:
                # Fallback si no es JSON válido
                return {
                    "status": "success",
                    "analysis": "Contexto agregado analizado automáticamente",
                    "main_query": self._extract_main_topic_from_context(chat_context),
                    "related_queries": self._generate_fallback_queries_from_context(chat_context),
                    "educational_focus": f"Nivel {user_level}",
                    "suggested_topics": []
                }
                
        except Exception as e:
            print(f"Error en WebSearchContextAgent: {e}")
            return {
                "status": "error",
                "message": str(e),
                "main_query": self._extract_main_topic_from_context(chat_context),
                "related_queries": []
            }
    
    def verify_result_relevance(self, search_result: Dict, context: List[str], 
                              current_document: Dict = None) -> Dict[str, Any]:
        """
        Verifica si un resultado de búsqueda es relevante al contexto agregado.
        
        Args:
            search_result: Resultado de búsqueda a verificar
            context: Contexto agregado por el usuario
            current_document: Documento actual si existe
            
        Returns:
            Dict con verificación de relevancia
        """
        try:
            # Preparar contexto para verificación
            context_summary = self._prepare_added_context_summary(context, current_document)
            
            # Prompt para verificación de relevancia
            system_prompt = f"""
            Eres un asistente educativo especializado en verificar la relevancia de recursos web.
            
            Tu objetivo es evaluar si un resultado de búsqueda web es relevante al contexto educativo agregado por el usuario.
            
            Evalúa la relevancia considerando:
            1. ¿El contenido se relaciona con el tema del contexto agregado?
            2. ¿Es apropiado para el nivel educativo?
            3. ¿Proporciona información complementaria útil?
            4. ¿Es una fuente confiable y educativa?
            
            Responde en formato JSON:
            {{
                "is_relevant": true/false,
                "relevance_score": 0-10,
                "reasoning": "Explicación de por qué es relevante o no",
                "educational_value": "Valor educativo del recurso",
                "recommendation": "Recomendación de uso"
            }}
            """
            
            user_prompt = f"""
            Contexto agregado por el usuario:
            {context_summary}
            
            Resultado de búsqueda a verificar:
            Título: {search_result.get('title', 'N/A')}
            URL: {search_result.get('url', 'N/A')}
            Descripción: {search_result.get('snippet', 'N/A')}
            Fuente: {search_result.get('source', 'N/A')}
            
            ¿Es este resultado relevante al contexto agregado?
            """
            
            # Llamar a OpenAI para verificación
            client = openai.OpenAI(api_key=self.openai_api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            # Procesar respuesta
            content = response.choices[0].message.content
            try:
                result = json.loads(content)
                return {
                    "status": "success",
                    "is_relevant": result.get("is_relevant", False),
                    "relevance_score": result.get("relevance_score", 0),
                    "reasoning": result.get("reasoning", ""),
                    "educational_value": result.get("educational_value", ""),
                    "recommendation": result.get("recommendation", "")
                }
            except json.JSONDecodeError:
                # Fallback: verificación básica
                return {
                    "status": "fallback",
                    "is_relevant": True,  # Por defecto incluir
                    "relevance_score": 5,
                    "reasoning": "Verificación automática básica",
                    "educational_value": "Valor educativo por determinar",
                    "recommendation": "Revisar manualmente"
                }
                
        except Exception as e:
            print(f"Error en verificación de relevancia: {e}")
            return {
                "status": "error",
                "is_relevant": True,  # Por defecto incluir en caso de error
                "relevance_score": 5,
                "reasoning": f"Error en verificación: {str(e)}",
                "educational_value": "No determinado",
                "recommendation": "Revisar manualmente"
            }
    
    def _prepare_added_context_summary(self, chat_context: List[str], 
                                     current_document: Any = None) -> str:
        """Prepara un resumen del contexto agregado (NO mensajes del chat)."""
        summary_parts = []
        
        # Documento actual
        if current_document:
            if isinstance(current_document, dict):
                doc_title = current_document.get('title', 'N/A')
            else:
                doc_title = str(current_document)
            summary_parts.append(f"Documento actual: {doc_title}")
        
        # Contexto agregado (documentos, imágenes, estructura)
        if chat_context:
            # Asegurar que chat_context sea una lista
            if isinstance(chat_context, str):
                chat_context = [chat_context]
            
            # Filtrar solo contexto agregado (no mensajes del chat)
            added_context = []
            for context_item in chat_context:
                # Incluir solo contexto que no sea de mensajes del chat
                if (isinstance(context_item, str) and 
                    not context_item.startswith("user:") and 
                    not context_item.startswith("assistant:") and
                    not context_item.startswith("🎓") and
                    not context_item.startswith("¡Bienvenido")):
                    added_context.append(context_item)
            
            if added_context:
                summary_parts.append(f"Contexto agregado:\n" + "\n".join(added_context[-5:]))  # Últimos 5 elementos
        
        return "\n\n".join(summary_parts) if summary_parts else "Sin contexto agregado disponible"
    
    def _extract_main_topic_from_context(self, chat_context: List[str]) -> str:
        """Extrae el tema principal del contexto agregado."""
        if not chat_context:
            return "búsqueda educativa"
        
        # Buscar en el contexto agregado
        if isinstance(chat_context, str):
            return chat_context[:100]
        elif isinstance(chat_context, list) and chat_context:
            # Tomar el último elemento de contexto agregado
            for item in reversed(chat_context):
                if (isinstance(item, str) and 
                    not item.startswith("user:") and 
                    not item.startswith("assistant:") and
                    not item.startswith("🎓") and
                    not item.startswith("¡Bienvenido")):
                    return item[:100]
        
        return "búsqueda educativa"
    
    def _generate_fallback_queries_from_context(self, chat_context: List[str]) -> List[str]:
        """Genera consultas de respaldo basadas en el contexto agregado."""
        queries = []
        
        # Basado en el contexto agregado
        if chat_context:
            if isinstance(chat_context, str):
                context = chat_context
            elif isinstance(chat_context, list) and chat_context:
                # Buscar el último elemento de contexto agregado
                for item in reversed(chat_context):
                    if (isinstance(item, str) and 
                        not item.startswith("user:") and 
                        not item.startswith("assistant:") and
                        not item.startswith("🎓") and
                        not item.startswith("¡Bienvenido")):
                        context = item
                        break
                else:
                    context = "recursos educativos"
            else:
                context = "recursos educativos"
            
            queries.append(f"{context} explicación")
            queries.append(f"{context} ejemplos")
            queries.append(f"{context} ejercicios")
            queries.append(f"{context} tutorial")
            queries.append(f"{context} recursos educativos")
        
        return queries[:3]  # Máximo 3 consultas

# Instancia global del agente
web_search_context_agent = WebSearchContextAgent() 