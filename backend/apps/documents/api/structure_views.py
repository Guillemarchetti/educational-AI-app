"""
API Views para gestión de estructura de documentos y contexto semántico
"""

import logging
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
import json

from apps.documents.models import Document, DocumentStructure, SemanticChunk, ContextSession
from apps.documents.services.structure_analyzer import DocumentStructureAnalyzer
from apps.documents.services.semantic_chunker import SemanticChunker

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
# @method_decorator(login_required, name='dispatch')  # Temporalmente deshabilitado para pruebas
class DocumentStructureView(View):
    """Vista para obtener y analizar estructura de documentos"""
    
    def get(self, request, document_id):
        """Obtiene la estructura de un documento"""
        try:
            # Usar usuario demo si no hay usuario autenticado
            from django.contrib.auth.models import User
            user = request.user if request.user.is_authenticated else User.objects.get(username='default-user')
            
            document = get_object_or_404(Document, id=document_id, user=user)
            logger.info(f"Fetching structure for document: {document.title} (ID: {document_id})")
            logger.info(f"Document structure_analyzed: {document.structure_analyzed}")
            
            # Si no está analizado, analizar ahora
            if not document.structure_analyzed:
                logger.info(f"Document not analyzed, starting analysis for: {document.title}")
                success = self._analyze_document_structure(document)
                if not success:
                    logger.error(f"Failed to analyze document structure for: {document.title}")
                    return JsonResponse({
                        'error': 'No se pudo analizar la estructura del documento',
                        'document_id': str(document.id),
                        'document_title': document.title
                    }, status=500)
                else:
                    logger.info(f"Document analysis completed successfully for: {document.title}")
            else:
                logger.info(f"Document already analyzed: {document.title}")
            
            # Obtener estructura desde la base de datos
            structure_elements = DocumentStructure.objects.filter(
                document=document
            ).order_by('page_number', 'line_number')
            
            # Construir jerarquía
            hierarchy = self._build_hierarchy_response(structure_elements)
            
            return JsonResponse({
                'document_id': str(document.id),
                'document_title': document.title,
                'structure_analyzed': document.structure_analyzed,
                'chunks_created': document.chunks_created,
                'total_chunks': document.total_chunks,
                'structure': hierarchy,
                'summary': document.get_structure_summary()
            })
            
        except Exception as e:
            logger.error(f"Error getting document structure: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    def post(self, request, document_id):
        """Fuerza el re-análisis de estructura de un documento"""
        try:
            # Usar usuario demo si no hay usuario autenticado
            from django.contrib.auth.models import User
            user = request.user if request.user.is_authenticated else User.objects.get(username='default-user')
            
            document = get_object_or_404(Document, id=document_id, user=user)
            
            # Limpiar análisis previo
            DocumentStructure.objects.filter(document=document).delete()
            SemanticChunk.objects.filter(document=document).delete()
            
            # Re-analizar
            success = self._analyze_document_structure(document)
            if success:
                return JsonResponse({
                    'message': 'Estructura re-analizada exitosamente',
                    'summary': document.get_structure_summary()
                })
            else:
                return JsonResponse({
                    'error': 'Error en el re-análisis'
                }, status=500)
                
        except Exception as e:
            logger.error(f"Error re-analyzing document structure: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    def _analyze_document_structure(self, document):
        """Analiza la estructura de un documento"""
        try:
            analyzer = DocumentStructureAnalyzer()
            
            # Construir ruta completa del archivo
            import os
            from django.conf import settings
            
            # La ruta del archivo puede ser relativa o absoluta
            if os.path.isabs(document.file_path):
                file_path = document.file_path
            else:
                # Si es relativa, construir ruta completa desde MEDIA_ROOT
                file_path = os.path.join(settings.MEDIA_ROOT, document.file_path)
            
            logger.info(f"Analyzing document structure for: {file_path}")
            
            # Verificar que el archivo existe
            if not os.path.exists(file_path):
                logger.error(f"File not found: {file_path}")
                return False
            
            # Analizar estructura
            structure = analyzer.analyze_pdf_structure(file_path)
            
            # Guardar en base de datos
            document.structure_data = structure
            document.structure_analyzed = True
            document.analysis_metadata = structure.get('analysis_metadata', {})
            document.save()
            
            # Crear elementos de estructura
            self._save_structure_elements(document, structure)
            
            # Crear chunks semánticos
            self._create_semantic_chunks(document, structure)
            
            logger.info(f"Document structure analysis completed for: {document.title}")
            return True
            
        except Exception as e:
            logger.error(f"Error analyzing document structure: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False
    
    def _save_structure_elements(self, document, structure):
        """Guarda elementos de estructura en la base de datos"""
        elements = structure.get('elements', [])
        
        for element in elements:
            # Si es objeto, conviértelo a dict
            if hasattr(element, 'to_dict'):
                element = element.to_dict()
            DocumentStructure.objects.create(
                document=document,
                element_id=element['element_id'],
                element_type=element['element_type'],
                title=element['title'],
                level=element['level'],
                page_number=element['page_number'],
                line_number=element['line_number'],
                structure_path=self._build_structure_path(element, structure),
                content_preview=element.get('content_preview', ''),
                metadata={
                    'original_element': {
                        'element_type': element['element_type'],
                        'title': element['title'],
                        'level': element['level']
                    }
                }
            )
    
    def _create_semantic_chunks(self, document, structure):
        """Crea chunks semánticos basados en la estructura"""
        try:
            # Construir ruta completa del archivo
            import os
            from django.conf import settings
            
            if os.path.isabs(document.file_path):
                file_path = document.file_path
            else:
                file_path = os.path.join(settings.MEDIA_ROOT, document.file_path)
            
            # Extraer texto completo del PDF usando PyPDF2
            import PyPDF2
            document_content = ""
            
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    try:
                        document_content += page.extract_text() + "\n"
                    except Exception as e:
                        logger.warning(f"Error extracting text from page: {str(e)}")
                        continue
            
            if not document_content.strip():
                logger.warning(f"No text content extracted from {document.title}")
                document_content = "Contenido no disponible"
            
            chunker = SemanticChunker()
            chunks = chunker.create_semantic_chunks(document_content, structure)
            
            # Guardar chunks en base de datos
            for chunk in chunks:
                # Buscar elemento de estructura relacionado
                structure_element = None
                if chunk.element_type != 'fallback':
                    try:
                        structure_element = DocumentStructure.objects.get(
                            document=document,
                            element_id=chunk.chunk_id.replace('unit_', '').replace('module_', '').replace('class_', '')
                        )
                    except DocumentStructure.DoesNotExist:
                        pass
                
                SemanticChunk.objects.create(
                    document=document,
                    chunk_id=chunk.chunk_id,
                    content=chunk.content,
                    structure_element=structure_element,
                    structure_path=chunk.structure_path,
                    element_type=chunk.element_type,
                    title=chunk.title,
                    page_start=chunk.page_start,
                    page_end=chunk.page_end,
                    metadata=chunk.metadata
                )
            
            document.chunks_created = True
            document.total_chunks = len(chunks)
            document.save()
            
        except Exception as e:
            logger.error(f"Error creating semantic chunks: {str(e)}")
    
    def _build_structure_path(self, element, all_elements):
        """Construye la ruta jerárquica de un elemento"""
        path = []
        current = element
        
        while current:
            # Si es objeto, conviértelo a dict
            if hasattr(current, 'to_dict'):
                current = current.to_dict()
            
            path.insert(0, {
                'element_id': current['element_id'],
                'title': current['title'],
                'element_type': current['element_type']
            })
            
            # Buscar el padre
            parent_id = current.get('parent_id')
            if parent_id:
                current = next((e for e in all_elements if e.get('element_id') == parent_id), None)
            else:
                current = None
        
        return path
    
    def _build_hierarchy_response(self, structure_elements):
        """Construye la respuesta de jerarquía desde elementos de BD"""
        hierarchy = {
            'units': [],
            'orphaned_elements': []
        }
        
        # Agrupar por tipo
        units = structure_elements.filter(element_type='unit')
        modules = structure_elements.filter(element_type='module')
        classes = structure_elements.filter(element_type='class')
        
        for unit in units:
            unit_data = {
                'id': unit.element_id,
                'title': unit.title,
                'page_start': unit.page_number,
                'structure_path': unit.structure_path,
                'modules': []
            }
            
            # Buscar módulos de esta unidad
            unit_modules = modules.filter(structure_path__startswith=unit.title)
            for module in unit_modules:
                module_data = {
                    'id': module.element_id,
                    'title': module.title,
                    'page_start': module.page_number,
                    'structure_path': module.structure_path,
                    'classes': []
                }
                
                # Buscar clases de este módulo
                module_classes = classes.filter(structure_path__startswith=module.structure_path)
                for class_item in module_classes:
                    class_data = {
                        'id': class_item.element_id,
                        'title': class_item.title,
                        'page_start': class_item.page_number,
                        'structure_path': class_item.structure_path
                    }
                    module_data['classes'].append(class_data)
                
                unit_data['modules'].append(module_data)
            
            hierarchy['units'].append(unit_data)
        
        return hierarchy

@method_decorator(csrf_exempt, name='dispatch')
# @method_decorator(login_required, name='dispatch')  # Temporalmente deshabilitado para pruebas
class ContextManagementView(View):
    """Vista para gestión de contexto por estructura"""
    
    def get(self, request):
        """Obtiene el contexto actual del usuario"""
        try:
            # Usar usuario demo si no hay usuario autenticado
            from django.contrib.auth.models import User
            user = request.user if request.user.is_authenticated else User.objects.get(username='default-user')
            
            session, created = ContextSession.objects.get_or_create(
                user=user,
                defaults={'metadata': {}}
            )
            
            # Obtener chunks del contexto
            context_chunks = session.context_chunks.all()
            
            chunks_data = []
            for chunk in context_chunks:
                chunks_data.append({
                    'id': chunk.chunk_id,
                    'title': chunk.title,
                    'structure_path': chunk.structure_path,
                    'element_type': chunk.element_type,
                    'content_preview': chunk.get_content_preview(),
                    'page_start': chunk.page_start
                })
            
            return JsonResponse({
                'session_id': str(session.session_id),
                'context_summary': session.get_context_summary(),
                'chunks': chunks_data,
                'context_text': session.context_text
            })
            
        except Exception as e:
            logger.error(f"Error getting context: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    def post(self, request):
        """Agrega contenido al contexto"""
        try:
            data = json.loads(request.body)
            action = data.get('action')
            
            # Usar usuario demo si no hay usuario autenticado
            from django.contrib.auth.models import User
            user = request.user if request.user.is_authenticated else User.objects.get(username='default-user')
            
            session, created = ContextSession.objects.get_or_create(
                user=user,
                defaults={'metadata': {}}
            )
            
            if action == 'add_by_structure':
                # Agregar por ruta de estructura
                structure_path = data.get('structure_path')
                document_id = data.get('document_id')
                
                document = None
                if document_id:
                    document = get_object_or_404(Document, id=document_id, user=user)
                
                chunks_added = session.add_chunk_by_structure(structure_path, document)
                
                return JsonResponse({
                    'message': f'{chunks_added} chunks agregados al contexto',
                    'chunks_added': chunks_added,
                    'context_summary': session.get_context_summary()
                })
                
            elif action == 'add_text':
                # Agregar texto libre
                text = data.get('text', '')
                session.context_text += f"\n{text}" if session.context_text else text
                session.save()
                
                return JsonResponse({
                    'message': 'Texto agregado al contexto',
                    'context_summary': session.get_context_summary()
                })
                
            elif action == 'clear':
                # Limpiar contexto
                session.clear_context()
                
                return JsonResponse({
                    'message': 'Contexto limpiado',
                    'context_summary': session.get_context_summary()
                })
            
            else:
                return JsonResponse({'error': 'Acción no válida'}, status=400)
                
        except Exception as e:
            logger.error(f"Error managing context: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
# @login_required  # Temporalmente deshabilitado para pruebas
@require_http_methods(["GET"])
def get_document_chunks(request, document_id):
    """Obtiene todos los chunks de un documento organizados por estructura"""
    try:
        # Usar usuario demo si no hay usuario autenticado
        from django.contrib.auth.models import User
        user = request.user if request.user.is_authenticated else User.objects.get(username='default-user')
        
        document = get_object_or_404(Document, id=document_id, user=user)
        
        chunks = SemanticChunk.objects.filter(document=document).order_by('page_start')
        
        # Organizar por tipo
        organized_chunks = {
            'units': [],
            'modules': [],
            'classes': [],
            'other': []
        }
        
        for chunk in chunks:
            chunk_data = {
                'id': chunk.chunk_id,
                'title': chunk.title,
                'structure_path': chunk.structure_path,
                'element_type': chunk.element_type,
                'content_preview': chunk.get_content_preview(),
                'page_start': chunk.page_start,
                'metadata': chunk.metadata
            }
            
            if chunk.element_type == 'unit':
                organized_chunks['units'].append(chunk_data)
            elif chunk.element_type == 'module':
                organized_chunks['modules'].append(chunk_data)
            elif chunk.element_type == 'class':
                organized_chunks['classes'].append(chunk_data)
            else:
                organized_chunks['other'].append(chunk_data)
        
        return JsonResponse({
            'document_id': str(document.id),
            'document_title': document.title,
            'total_chunks': len(chunks),
            'organized_chunks': organized_chunks
        })
        
    except Exception as e:
        logger.error(f"Error getting document chunks: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500) 