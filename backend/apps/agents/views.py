from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import MessageSerializer
from .services.agent_manager import AgentManager
from .services.conversation_memory import ConversationMemory, ConversationAnalytics
from rag.services.enhanced_rag import EnhancedRAGService
import json
import os
import logging
from datetime import datetime
# import fitz  # PyMuPDF - Temporarily commented due to compilation issues

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class AgentChatAPIView(APIView):
    """
    API principal para comunicación con agentes especializados
    """
    
    def __init__(self):
        super().__init__()
        self.agent_manager = AgentManager()
        self.rag_service = None
        try:
            from rag.services.enhanced_rag import EnhancedRAGService
            self.rag_service = EnhancedRAGService()
        except ImportError:
            logger.warning("Enhanced RAG Service no disponible")
    
    def post(self, request):
        """Procesar consulta de usuario con agentes IA"""
        data = request.data
        user_id = data.get('userId', 'default-user')
        message = data.get('text') or data.get('message') or data.get('query')
        agent_type = data.get('agent_type')
        explicit_context = data.get('context', None)

        if not message:
            return Response(
                {"error": "El campo 'text', 'message' o 'query' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Inicializar memoria conversacional
            # Si no se especifica agente, usar routing automático
            conversation_agent_type = agent_type or 'tutor'  # Default temporal
            memory = ConversationMemory(user_id, conversation_agent_type)

            # Obtener contexto conversacional
            conversation_context = memory.get_context(limit=10)

            # Buscar documentos relevantes si RAG está disponible
            relevant_docs = []
            if self.rag_service:
                try:
                    relevant_docs = self.rag_service.search_relevant_content(
                        message, user_id, top_k=5
                    )
                except Exception as e:
                    logger.warning(f"Error en RAG search: {e}")

            # Construir contexto para el agente
            context = {
                'user_id': user_id,
                'conversation_history': conversation_context,
                'relevant_documents': relevant_docs,
                'user_profile': self._get_user_profile(user_id),
                'session_metadata': memory.get_session_metadata(),
                'explicit_context': explicit_context,
            }

            # Procesar consulta con Agent Manager
            agent_response = self.agent_manager.route_query(
                query=message,
                agent_type=agent_type,
                context=context
            )

            if agent_response['success']:
                # Guardar mensajes en memoria
                memory_agent_type = agent_response['agent_used']
                if memory_agent_type != conversation_agent_type:
                    # Cambiar a la memoria del agente correcto
                    memory = ConversationMemory(user_id, memory_agent_type)
                
                memory.add_message('user', message)
                memory.add_message('assistant', agent_response['response'])

                return Response({
                    'status': 'success',
                    'response': agent_response['response'],
                    'agent_used': agent_response['agent_used'],
                    'agent_name': agent_response['agent_name'],
                    'context_sources': len(relevant_docs),
                    'response_time': agent_response['response_time'],
                    'user_id': user_id
                }, status=status.HTTP_200_OK)
            else:
                # Error en procesamiento
                return Response({
                    'status': 'error',
                    'error': agent_response.get('error', 'Error desconocido'),
                    'response': agent_response['response'],
                    'user_id': user_id
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error en AgentChatAPIView: {e}")
            return Response({
                'status': 'error',
                'error': 'Error interno del servidor',
                'response': 'Lo siento, hubo un problema procesando tu consulta. Por favor, intenta de nuevo.',
                'user_id': user_id
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_user_profile(self, user_id: str) -> dict:
        """Obtener perfil del usuario (placeholder - implementar según modelo User)"""
        return {
            'user_id': user_id,
            'name': 'Usuario',
            'level': '7mo Grado',
            'preferences': {},
            'last_active': None
        }


@method_decorator(csrf_exempt, name='dispatch')
class SendMessageAPIView(AgentChatAPIView):
    """
    API legacy para compatibilidad - redirige a AgentChatAPIView
    """
    pass

@method_decorator(csrf_exempt, name='dispatch')
class AgentManagementAPIView(APIView):
    """
    API para gestión y información de agentes
    """
    
    def __init__(self):
        super().__init__()
        self.agent_manager = AgentManager()
    
    def get(self, request):
        """Obtener información de todos los agentes disponibles"""
        try:
            agents_info = self.agent_manager.get_available_agents()
            usage_stats = self.agent_manager.get_usage_statistics()
            health_status = self.agent_manager.health_check()
            
            return Response({
                'status': 'success',
                'agents': agents_info,
                'usage_statistics': usage_stats,
                'health_status': health_status
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error en AgentManagementAPIView: {e}")
            return Response({
                'status': 'error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class ConversationHistoryAPIView(APIView):
    """
    API para gestión del historial conversacional
    """
    
    def get(self, request, user_id):
        """Obtener historial de conversaciones de un usuario"""
        try:
            agent_type = request.GET.get('agent_type', None)
            
            if agent_type:
                # Historial específico de un agente
                memory = ConversationMemory(user_id, agent_type)
                history = memory.get_full_history()
                summary = memory.get_conversation_summary()
                
                return Response({
                    'status': 'success',
                    'user_id': user_id,
                    'agent_type': agent_type,
                    'history': history,
                    'summary': summary
                }, status=status.HTTP_200_OK)
            else:
                # Todas las conversaciones del usuario
                conversations = ConversationMemory.get_user_conversations(user_id)
                analytics = ConversationAnalytics.analyze_conversation_patterns(user_id)
                
                return Response({
                    'status': 'success',
                    'user_id': user_id,
                    'conversations': conversations,
                    'analytics': analytics
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error en ConversationHistoryAPIView: {e}")
            return Response({
                'status': 'error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, user_id):
        """Limpiar historial conversacional"""
        try:
            agent_type = request.data.get('agent_type', None)
            
            if agent_type:
                # Limpiar conversación específica
                memory = ConversationMemory(user_id, agent_type)
                success = memory.clear_memory()
                
                return Response({
                    'status': 'success' if success else 'error',
                    'message': f'Historial de {agent_type} limpiado' if success else 'Error limpiando historial'
                }, status=status.HTTP_200_OK if success else status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Limpiar todas las conversaciones
                agent_types = ['tutor', 'evaluator', 'counselor', 'curriculum', 'analytics']
                results = {}
                
                for agent in agent_types:
                    memory = ConversationMemory(user_id, agent)
                    results[agent] = memory.clear_memory()
                
                all_success = all(results.values())
                
                return Response({
                    'status': 'success' if all_success else 'partial',
                    'results': results,
                    'message': 'Historial completo limpiado' if all_success else 'Algunos historiales no se pudieron limpiar'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error en ConversationHistoryAPIView DELETE: {e}")
            return Response({
                'status': 'error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TextExtractor:
    """Clase para extraer texto de diferentes tipos de archivo."""
    @staticmethod
    def extract_text(file_obj) -> str:
        """Extrae texto de un objeto de archivo subido."""
        filename = file_obj.name.lower()
        if filename.endswith('.pdf'):
            return TextExtractor._extract_text_from_pdf(file_obj)
        elif filename.endswith('.txt'):
            return TextExtractor._extract_text_from_txt(file_obj)
        # Añadir más formatos aquí (ej. .docx)
        else:
            # Fallback para otros tipos de texto
            try:
                return file_obj.read().decode('utf-8')
            except:
                logger.warning(f"No se pudo extraer texto del formato no soportado: {filename}")
                return ""

    @staticmethod
    def _extract_text_from_pdf(file_obj) -> str:
        """Extrae texto de un PDF usando PyMuPDF."""
        try:
            doc = fitz.open(stream=file_obj.read(), filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Error extrayendo texto de PDF: {e}")
            return ""

    @staticmethod
    def _extract_text_from_txt(file_obj) -> str:
        """Extrae texto de un archivo de texto plano."""
        try:
            return file_obj.read().decode('utf-8')
        except Exception as e:
            logger.error(f"Error extrayendo texto de TXT: {e}")
            return ""

@csrf_exempt
@require_http_methods(["POST"])
def upload_file(request):
    """
    Sube y procesa un archivo para el sistema RAG.
    """
    user_id = "default-user"
    if request.user.is_authenticated:
        user_id = str(request.user.id)
    else:
        user_id = request.POST.get('userId', 'default-user')

    if 'file' not in request.FILES:
        return JsonResponse({'status': 'error', 'message': "No se encontró el campo 'file' en la petición."}, status=400)

    file_obj = request.FILES['file']
    
    try:
        file_content = TextExtractor.extract_text(file_obj)
        
        if not file_content:
             return JsonResponse({'status': 'error', 'message': f'No se pudo extraer texto o el archivo está vacío: {file_obj.name}'}, status=400)

        rag_service = EnhancedRAGService() # No necesita user_id en el constructor
        rag_service.process_document(
            document_content=file_content, 
            user_id=user_id,
            document_metadata={'filename': file_obj.name, 'size': file_obj.size}
        )
        
        return JsonResponse({
            'status': 'success',
            'message': f'Documento "{file_obj.name}" procesado y añadido al RAG.',
            'user_id': user_id,
        }, status=201)

    except Exception as e:
        logger.error(f"Error crítico en upload_file: {e}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': f"Error interno del servidor al procesar el archivo: {e}"}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Endpoint de health check para el sistema de agentes
    """
    try:
        agent_manager = AgentManager()
        health_status = agent_manager.health_check()
        
        return JsonResponse({
            'status': 'healthy',
            'timestamp': health_status['timestamp'],
            'agents_status': health_status['agents_status'],
            'system_metrics': health_status['metrics']
        }, status=200)
        
    except Exception as e:
        logger.error(f"Error en health check: {e}")
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': json.dumps(datetime.now().isoformat())
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def agent_capabilities(request, agent_id):
    """
    Obtener capacidades específicas de un agente
    """
    try:
        agent_manager = AgentManager()
        capabilities = agent_manager.get_agent_capabilities(agent_id)
        
        if not capabilities:
            return JsonResponse({
                'error': f'Agent {agent_id} not found or not available'
            }, status=404)
        
        return JsonResponse({
            'status': 'success',
            'agent_id': agent_id,
            'capabilities': capabilities
        }, status=200)
        
    except Exception as e:
        logger.error(f"Error obteniendo capacidades del agente {agent_id}: {e}")
        return JsonResponse({
            'error': str(e)
        }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ContentCreatorAPIView(APIView):
    """
    API específica para el agente creador de contenido interactivo
    """
    
    def __init__(self):
        super().__init__()
        self.agent_manager = AgentManager()
    
    def post(self, request):
        """Generar contenido interactivo matemático"""
        try:
            data = request.data
            user_id = data.get('userId', 'default-user')
            
            # Obtener contexto del frontend
            explicit_context = data.get('context', '')
            structure_context = data.get('structure_context', '')
            
            # Si no hay concepto explícito, usar el mensaje como query
            concept = data.get('concept', '')
            if not concept:
                # Usar el mensaje del usuario como query principal
                query = data.get('message', 'Crear contenido interactivo matemático')
            else:
                query = f"Crea una {data.get('content_type', 'simulacion')} interactiva para enseñar {concept}"
            
            level = data.get('level', 'Secundaria')
            content_type = data.get('content_type', 'simulacion')
            documents = data.get('documents', [])
            
            # Contexto específico para content creator con información del frontend
            context = {
                'user_id': user_id,
                'user_level': level,
                'subject': concept,
                'content_type': content_type,
                'documents': documents,
                'explicit_context': explicit_context,
                'structure_context': structure_context,
                'learning_style': 'visual-kinestésico'
            }
            
            # Procesar con el agente específico
            response = self.agent_manager.route_query(
                query=query,
                agent_type='content_creator',
                context=context
            )
            
            if response['success']:
                # Extraer concepto del contexto si no se proporcionó
                extracted_concept = concept
                if not extracted_concept and explicit_context:
                    # Intentar extraer concepto del contexto
                    if 'funciones lineales' in explicit_context.lower() or 'función lineal' in explicit_context.lower():
                        extracted_concept = 'Funciones Lineales'
                    elif 'fracciones' in explicit_context.lower():
                        extracted_concept = 'Fracciones'
                    elif 'geometría' in explicit_context.lower():
                        extracted_concept = 'Geometría'
                
                return Response({
                    'status': 'success',
                    'content': response['response'],
                    'agent_used': response['agent_used'],
                    'response_time': response['response_time'],
                    'concept': extracted_concept,
                    'level': level,
                    'content_type': content_type
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'error',
                    'error': response.get('error', 'Error generando contenido'),
                    'fallback_response': response.get('response', '')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error en ContentCreatorAPIView: {e}")
            return Response({
                'status': 'error',
                'error': 'Error interno del servidor'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Obtener información sobre tipos de contenido disponibles"""
        return Response({
            'status': 'success',
            'content_types': [
                {
                    'id': 'simulacion',
                    'name': 'Simulación Interactiva',
                    'description': 'Laboratorios virtuales y manipuladores matemáticos'
                },
                {
                    'id': 'juego',
                    'name': 'Juego Educativo',
                    'description': 'Actividades gamificadas y competencias'
                },
                {
                    'id': 'ejercicio',
                    'name': 'Ejercicio Interactivo',
                    'description': 'Práctica guiada con retroalimentación'
                },
                {
                    'id': 'laboratorio',
                    'name': 'Laboratorio Virtual',
                    'description': 'Experimentos y exploración libre'
                }
            ],
            'levels': ['Primaria', '6to Grado', 'Secundaria', 'Preparatoria', 'Universidad'],
            'subjects': [
                'Aritmética', 'Álgebra', 'Geometría', 'Trigonometría',
                'Cálculo', 'Estadística', 'Probabilidad', 'Funciones'
            ]
        })


@method_decorator(csrf_exempt, name='dispatch')
class HealthCheckAPIView(APIView):
    pass 