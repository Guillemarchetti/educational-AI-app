from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
import json
import logging
from .models import Conversation, Message, KnowledgeNode, LearningSession, LearningProgress
from .services.knowledge_analyzer import KnowledgeAnalyzer
from documents.models import Document
from .services.ai_service import AIService
from .services.conversation_memory import ConversationMemory
from django.db import models

logger = logging.getLogger(__name__)

# ... existing code ...

@csrf_exempt
@require_http_methods(["POST"])
def analyze_image(request):
    """Analiza una imagen seleccionada del PDF"""
    try:
        data = json.loads(request.body)
        image_data = data.get('image_data')
        context = data.get('context', '')
        filename = data.get('filename', '')
        coordinates = data.get('coordinates', {})
        
        if not image_data:
            return JsonResponse({'error': 'No se proporcionó imagen'}, status=400)
        
        # Usar el servicio de IA para analizar la imagen
        ai_service = AIService()
        
        # Crear prompt para análisis de imagen
        prompt = f"""
        Analiza esta imagen de un documento educativo.
        
        Contexto: {context}
        Archivo: {filename}
        Coordenadas: {coordinates}
        
        Proporciona:
        1. Descripción detallada del contenido
        2. Conceptos educativos identificados
        3. Dificultad estimada
        4. Sugerencias de aprendizaje
        
        Responde en español de manera clara y educativa.
        """
        
        # Analizar con IA
        analysis = ai_service.analyze_image_with_ai(image_data, prompt)
        
        # Información técnica de la imagen
        image_info = {
            'size': f"{coordinates.get('width', 0)}x{coordinates.get('height', 0)}px",
            'position': f"({coordinates.get('x', 0)}, {coordinates.get('y', 0)})",
            'filename': filename
        }
        
        return JsonResponse({
            'analysis': analysis,
            'image_info': image_info,
            'success': True
        })
        
    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

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
                        'title': document.name,
                        'description': f'Documento: {document.name}',
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
                'name': document.name
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