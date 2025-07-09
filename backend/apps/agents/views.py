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
import base64
import io
from PIL import Image
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .services.ai_service import AIService
from .services.smart_prompts_service import SmartPromptsService

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

@api_view(['POST'])
@permission_classes([])  # Permitir acceso sin autenticación por ahora
def analyze_image(request):
    """
    Analiza una imagen usando IA y retorna explicaciones detalladas
    """
    try:
        data = json.loads(request.body)
        image_data = data.get('image_data')
        context = data.get('context', '')
        
        if not image_data:
            return JsonResponse({'error': 'No se proporcionó imagen'}, status=400)
        
        # Decodificar imagen base64
        try:
            # Remover el prefijo data:image/...;base64,
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decodificar base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convertir a RGB si es necesario
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
        except Exception as e:
            return JsonResponse({'error': f'Error al procesar la imagen: {str(e)}'}, status=400)
        
        # Crear prompt para análisis de imagen
        prompt = f"""
        Analiza esta imagen educativa en detalle. Proporciona:
        
        1. **Descripción general**: ¿Qué veo en la imagen?
        2. **Elementos clave**: Identifica los componentes principales
        3. **Conceptos educativos**: ¿Qué conceptos o temas se están explicando?
        4. **Explicación detallada**: Explica paso a paso lo que muestra
        5. **Preguntas sugeridas**: ¿Qué preguntas podrían hacer los estudiantes?
        
        Contexto adicional: {context}
        
        Responde de manera clara y educativa, como si fueras un tutor explicando a un estudiante.
        """
        
        # Usar el servicio de IA para analizar
        ai_service = AIService()
        
        # Usar OpenAI para análisis de texto (por ahora sin visión)
        analysis_context = {
            'user_level': 'Estudiante',
            'subject': 'Análisis de Imagen',
            'image_context': f"Imagen del archivo: {data.get('filename', 'documento')}"
        }
        
        try:
            # Procesar con OpenAI Vision usando la imagen original (con prefijo data:image)
            original_image_data = data.get('image_data')  # Mantener el formato data:image/...;base64,
            analysis_result = ai_service.process_image_with_openai(prompt, original_image_data, analysis_context)
            
            if not analysis_result or "Lo siento" in analysis_result:
                # Fallback si OpenAI falla
                analysis_result = f"""
                ## 📊 Análisis de Imagen Educativa
                
                **Descripción general:**
                He recibido una imagen seleccionada del PDF "{data.get('filename', 'documento')}". 
                
                **Elementos identificados:**
                - Área seleccionada de {data.get('width', 'N/A')}x{data.get('height', 'N/A')} píxeles
                - Coordenadas: ({data.get('x', 'N/A')}, {data.get('y', 'N/A')})
                
                **Análisis educativo:**
                Esta imagen contiene material educativo que puede incluir:
                - Diagramas explicativos
                - Fórmulas matemáticas
                - Gráficos o tablas
                - Texto explicativo
                - Ilustraciones conceptuales
                
                **Recomendaciones:**
                - Pregúntame sobre elementos específicos que veas
                - Pide explicaciones paso a paso
                - Solicita ejemplos relacionados
                - Pregunta sobre aplicaciones prácticas
                
                **Nota:** Para un análisis más detallado, describe qué elementos específicos ves en la imagen.
                """
        
        except Exception as e:
            logger.error(f"Error en análisis de IA: {e}")
            # Fallback si hay error
            analysis_result = f"""
            ## 📊 Análisis de Imagen Educativa
            
            **Imagen procesada exitosamente:**
            - Archivo: {data.get('filename', 'documento')}
            - Tamaño: {data.get('width', 'N/A')}x{data.get('height', 'N/A')} píxeles
            - Ubicación: ({data.get('x', 'N/A')}, {data.get('y', 'N/A')})
            
            **¿Qué puedo hacer por ti?**
            Describe qué elementos específicos ves en la imagen y te ayudo a:
            - Explicar conceptos matemáticos
            - Interpretar gráficos y diagramas
            - Resolver problemas paso a paso
            - Entender fórmulas y ecuaciones
            
            **Contexto:** {context}
            
            ¡Pregúntame sobre cualquier elemento específico que veas!
            """
        
        return JsonResponse({
            'success': True,
            'analysis': analysis_result,
            'image_info': {
                'size': f"{image.size[0]}x{image.size[1]}",
                'mode': image.mode,
                'format': image.format
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        logger.error(f"Error en analyze_image: {e}")
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500) 

@csrf_exempt
@require_http_methods(["POST"])
def generate_smart_prompts(request):
    """
    Genera prompts dinámicos basados en el contexto del chat
    """
    try:
        data = json.loads(request.body)
        context = data.get('context', [])
        
        # Inicializar el servicio de prompts inteligentes
        prompts_service = SmartPromptsService()
        
        # Generar prompts dinámicos
        prompts = prompts_service.generate_dynamic_prompts(context)
        
        # Obtener metadatos
        metadata = prompts_service.get_prompt_metadata(context)
        
        response_data = {
            'success': True,
            'prompts': prompts,
            'metadata': metadata,
            'message': 'Prompts generados exitosamente'
        }
        
        return JsonResponse(response_data, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.error(f"Error generating smart prompts: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)

# Mapa de Conocimientos - Funciones
from django.shortcuts import get_object_or_404
from apps.documents.models import Document
from .services.knowledge_analyzer import KnowledgeAnalyzer
from .models import KnowledgeNode, LearningSession, LearningProgress
from django.db import models

@csrf_exempt
@require_http_methods(["GET"])
def get_knowledge_map(request, document_id):
    """Obtiene el mapa de conocimientos para un documento"""
    try:
        # Obtener el documento
        document = get_object_or_404(Document, id=document_id)
        
        # Usar el analizador de conocimientos
        analyzer = KnowledgeAnalyzer()
        
        # Verificar si ya existe un mapa de conocimientos
        existing_nodes = KnowledgeNode.objects.filter(document=document)
        
        if not existing_nodes.exists():
            # Si no existe, crear el mapa basado en la estructura del documento
            structure_data = document.structure_data if hasattr(document, 'structure_data') else None
            
            if structure_data:
                # Crear nodos de conocimiento
                knowledge_nodes = analyzer.analyze_document_structure(document, structure_data)
                logger.info(f"Created {len(knowledge_nodes)} knowledge nodes for document {document_id}")
            else:
                # Si no hay estructura, crear nodos básicos
                knowledge_nodes = analyzer.analyze_document_structure(document, {
                    'units': [{
                        'title': document.title,
                        'description': f'Documento: {document.title}',
                        'modules': []
                    }]
                })
        
        # Obtener el mapa de conocimientos
        knowledge_map = analyzer.get_knowledge_map_for_document(document)
        
        return JsonResponse({
            'success': True,
            'knowledge_map': knowledge_map
        })
        
    except Exception as e:
        logger.error(f"Error getting knowledge map: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def update_knowledge_node(request):
    """Actualiza el estado de un nodo de conocimiento"""
    try:
        data = json.loads(request.body)
        node_id = data.get('node_id')
        new_status = data.get('status')
        progress = data.get('progress')
        
        if not node_id or not new_status:
            return JsonResponse({'error': 'Se requiere node_id y status'}, status=400)
        
        analyzer = KnowledgeAnalyzer()
        updated_node = analyzer.update_node_status(node_id, new_status, progress)
        
        return JsonResponse({
            'success': True,
            'node': {
                'id': updated_node.node_id,
                'title': updated_node.title,
                'status': updated_node.status,
                'progress': updated_node.progress
            }
        })
        
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=404)
    except Exception as e:
        logger.error(f"Error updating knowledge node: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def record_learning_session(request):
    """Registra una sesión de aprendizaje"""
    try:
        data = json.loads(request.body)
        node_id = data.get('node_id')
        session_type = data.get('session_type')
        duration = data.get('duration')
        score = data.get('score')
        
        if not all([node_id, session_type, duration]):
            return JsonResponse({'error': 'Se requiere node_id, session_type y duration'}, status=400)
        
        analyzer = KnowledgeAnalyzer()
        session = analyzer.record_learning_session(
            node_id=node_id,
            session_type=session_type,
            duration=duration,
            score=score
        )
        
        return JsonResponse({
            'success': True,
            'session': {
                'id': session.id,
                'session_type': session.session_type,
                'duration': session.duration,
                'score': session.score,
                'completed_at': session.completed_at.isoformat() if session.completed_at else None
            }
        })
        
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=404)
    except Exception as e:
        logger.error(f"Error recording learning session: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_learning_analytics(request, document_id):
    """Obtiene análisis de aprendizaje para un documento"""
    try:
        document = get_object_or_404(Document, id=document_id)
        
        # Obtener estadísticas de aprendizaje
        nodes = KnowledgeNode.objects.filter(document=document)
        sessions = LearningSession.objects.filter(knowledge_node__document=document)
        
        # Estadísticas generales
        total_nodes = nodes.count()
        completed_nodes = nodes.filter(status='well_learned').count()
        needs_attention = nodes.filter(status__in=['needs_reinforcement', 'not_learned']).count()
        
        # Tiempo total de estudio
        total_time = sum(node.time_spent for node in nodes)
        
        # Sesiones de aprendizaje
        total_sessions = sessions.count()
        avg_session_duration = sessions.aggregate(avg_duration=models.Avg('duration'))['avg_duration'] or 0
        avg_session_score = sessions.aggregate(avg_score=models.Avg('score'))['avg_score'] or 0
        
        # Progreso por tipo de nodo
        progress_by_type = {}
        for node_type in ['unit', 'module', 'class']:
            type_nodes = nodes.filter(node_type=node_type)
            if type_nodes.exists():
                avg_progress = type_nodes.aggregate(avg_progress=models.Avg('progress'))['avg_progress'] or 0
                progress_by_type[node_type] = round(avg_progress, 1)
        
        analytics = {
            'document': {
                'id': document.id,
                'name': document.title
            },
            'overview': {
                'total_nodes': total_nodes,
                'completed_nodes': completed_nodes,
                'needs_attention': needs_attention,
                'completion_rate': round((completed_nodes / total_nodes * 100), 1) if total_nodes > 0 else 0
            },
            'time_analysis': {
                'total_time_minutes': total_time,
                'total_time_hours': round(total_time / 60, 1),
                'avg_time_per_node': round(total_time / total_nodes, 1) if total_nodes > 0 else 0
            },
            'sessions': {
                'total_sessions': total_sessions,
                'avg_duration_minutes': round(avg_session_duration, 1),
                'avg_score': round(avg_session_score, 1)
            },
            'progress_by_type': progress_by_type
        }
        
        return JsonResponse({
            'success': True,
            'analytics': analytics
        })
        
    except Exception as e:
        logger.error(f"Error getting learning analytics: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def generate_knowledge_map(request):
    """Genera un mapa de conocimientos para un documento"""
    try:
        data = json.loads(request.body)
        document_id = data.get('document_id')
        
        if not document_id:
            return JsonResponse({'error': 'Se requiere document_id'}, status=400)
        
        document = get_object_or_404(Document, id=document_id)
        analyzer = KnowledgeAnalyzer()
        
        # Obtener estructura del documento
        structure_data = document.structure_data if hasattr(document, 'structure_data') else None
        
        if not structure_data:
            return JsonResponse({'error': 'No se encontró estructura de documento'}, status=400)
        
        # Generar mapa de conocimientos
        knowledge_nodes = analyzer.analyze_document_structure(document, structure_data)
        
        # Obtener el mapa completo
        knowledge_map = analyzer.get_knowledge_map_for_document(document)
        
        return JsonResponse({
            'success': True,
            'knowledge_map': knowledge_map,
            'nodes_created': len(knowledge_nodes)
        })
        
    except Exception as e:
        logger.error(f"Error generating knowledge map: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500) 

@api_view(['GET'])
def get_synthetic_knowledge_map(request, document_id):
    """
    Genera un mapa de conocimientos sintético más expresivo para demostración
    """
    try:
        document = get_object_or_404(Document, id=document_id)
        analyzer = KnowledgeAnalyzer()
        
        # Generar datos sintéticos más expresivos
        synthetic_data = analyzer.generate_synthetic_knowledge_map(document)
        
        logger.info(f"Synthetic knowledge map generated for document {document_id}")
        return Response(synthetic_data)
        
    except Document.DoesNotExist:
        return Response(
            {'error': 'Document not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error generating synthetic knowledge map: {str(e)}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 