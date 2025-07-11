"""
Views para gestión de documentos con información de estructura
"""

import os
import json
import logging
from django.http import JsonResponse, HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import mimetypes
from django.contrib.auth.models import User

from .models import Document

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def document_list(request):
    """Lista todos los documentos con información de estructura"""
    try:
        # Por ahora, listar archivos del directorio estático
        # En el futuro, esto debería usar la base de datos
        documents_dir = os.path.join(settings.BASE_DIR, 'uploads')
        
        if not os.path.exists(documents_dir):
            return JsonResponse([], safe=False)
        
        documents = []
        
        # Obtener documentos de la base de datos si existen
        db_documents = Document.objects.all()
        db_docs_by_name = {doc.title: doc for doc in db_documents}
        
        for filename in os.listdir(documents_dir):
            if filename.endswith('.pdf'):
                file_path = os.path.join(documents_dir, filename)
                
                # Información básica del archivo
                doc_info = {
                    'name': filename,
                    'url': f'http://localhost:8000/api/documents/serve/{filename}',
                    'id': None,
                    'structure_analyzed': False,
                    'chunks_created': False,
                    'total_chunks': 0,
                    'summary': None
                }
                
                # Si existe en la base de datos, agregar información de estructura
                if filename in db_docs_by_name:
                    db_doc = db_docs_by_name[filename]
                    doc_info.update({
                        'id': str(db_doc.id),
                        'structure_analyzed': db_doc.structure_analyzed,
                        'chunks_created': db_doc.chunks_created,
                        'total_chunks': db_doc.total_chunks,
                        'summary': db_doc.get_structure_summary()
                    })
                
                documents.append(doc_info)
        
        return JsonResponse(documents, safe=False)
        
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def serve_document(request, document_id):
    """Sirve un documento por ID o nombre"""
    try:
        file_path = None
        
        # Intentar buscar por ID primero (si es un UUID válido)
        if document_id and len(document_id) == 36 and '-' in document_id:
            try:
                document = Document.objects.get(id=document_id)
                file_path = document.file_path
                logger.info(f"Documento encontrado por ID: {document_id}")
            except (ValueError, Document.DoesNotExist):
                logger.warning(f"Documento no encontrado por ID: {document_id}")
                file_path = None
        
        # Si no se encontró por ID, buscar por nombre de archivo
        if not file_path:
            documents_dir = os.path.join(settings.BASE_DIR, 'uploads')
            file_path = os.path.join(documents_dir, document_id)
            logger.info(f"Buscando archivo por nombre: {file_path}")
        
        # Verificar que el archivo existe
        if not os.path.exists(file_path):
            logger.error(f"Archivo no encontrado: {file_path}")
            raise Http404("File not found")
        
        # Determinar el tipo de contenido
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = 'application/octet-stream'
        
        # Leer y servir el archivo
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type=content_type)
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
            logger.info(f"Archivo servido exitosamente: {file_path}")
            return response
            
    except Http404:
        raise
    except Exception as e:
        logger.error(f"Error serving document {document_id}: {str(e)}")
        raise Http404("Document not found")

@csrf_exempt
@require_http_methods(["POST"])
def upload_document(request):
    """Sube un nuevo documento y analiza su estructura"""
    try:
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)
        
        uploaded_file = request.FILES['file']
        
        # Validar tipo de archivo
        if not uploaded_file.name.endswith('.pdf'):
            return JsonResponse({'error': 'Only PDF files are allowed'}, status=400)
        
        # Crear directorio uploads si no existe
        documents_dir = os.path.join(settings.BASE_DIR, 'uploads')
        os.makedirs(documents_dir, exist_ok=True)
        
        # Guardar archivo en el directorio uploads
        file_path = os.path.join(documents_dir, uploaded_file.name)
        
        # Verificar si el archivo ya existe
        if os.path.exists(file_path):
            return JsonResponse({'error': 'File already exists'}, status=400)
        
        # Guardar el archivo
        with open(file_path, 'wb') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        # Asignar usuario (autenticado o default)
        if hasattr(request, 'user') and getattr(request.user, 'is_authenticated', False):
            user = request.user
        else:
            user, _ = User.objects.get_or_create(username='default-user', defaults={'password': 'default'})
        
        # Crear registro en base de datos
        document = Document.objects.create(
            user=user,
            title=uploaded_file.name,
            file_path=file_path,
            file_size=uploaded_file.size,
            content_type=uploaded_file.content_type or 'application/pdf'
        )
        
        # Analizar estructura automáticamente
        try:
            from .api.structure_views import DocumentStructureView
            structure_view = DocumentStructureView()
            structure_view._analyze_document_structure(document)
            logger.info(f"Estructura analizada para: {uploaded_file.name}")
        except Exception as e:
            logger.error(f"Error analizando estructura para {uploaded_file.name}: {str(e)}")
            # No fallar el upload si el análisis de estructura falla
        
        return JsonResponse({
            'message': 'Document uploaded successfully',
            'document_id': str(document.id),
            'structure_analyzed': document.structure_analyzed,
            'summary': document.get_structure_summary()
        })
        
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def download_document(request, document_id):
    """Descarga un documento"""
    try:
        document = get_object_or_404(Document, id=document_id)
        
        if not os.path.exists(document.file_path):
            raise Http404("File not found")
        
        with open(document.file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type=document.content_type)
            response['Content-Disposition'] = f'attachment; filename="{document.title}"'
            return response
            
    except Exception as e:
        logger.error(f"Error downloading document {document_id}: {str(e)}")
        raise Http404("Document not found")

@csrf_exempt
@require_http_methods(["POST"])
def extract_text(request):
    """Extrae texto de un documento PDF usando el analizador propio o PyMuPDF como fallback."""
    try:
        data = json.loads(request.body)
        filename = data.get('filename')
        
        if not filename:
            return JsonResponse({'error': 'Filename is required'}, status=400)
        
        documents_dir = os.path.join(settings.BASE_DIR, 'uploads')
        file_path = os.path.join(documents_dir, filename)
        
        if not os.path.exists(file_path):
            return JsonResponse({'error': 'File not found'}, status=404)
        
        # Intentar extraer texto usando el analizador propio
        try:
            from .services.structure_analyzer import DocumentStructureAnalyzer
            analyzer = DocumentStructureAnalyzer()
            pages_text = analyzer._extract_text_from_pdf(file_path)
            full_text = '\n\n'.join(pages_text)
            num_pages = len(pages_text)
        except Exception as e:
            # Fallback: usar PyMuPDF directamente
            try:
                import fitz  # PyMuPDF
                full_text = ""
                num_pages = 0
                with fitz.open(file_path) as doc:
                    num_pages = doc.page_count
                    for page in doc:
                        full_text += page.get_text()
            except ImportError:
                return JsonResponse({'error': 'PyMuPDF is not installed, cannot extract PDF text.'}, status=501)
            except Exception as e2:
                return JsonResponse({'error': f'Error extracting text: {str(e2)}'}, status=500)
        
        # Limitar el texto para evitar contextos muy largos
        if len(full_text) > 5000:
            full_text = full_text[:5000] + "\n\n[Texto truncado - documento completo disponible]"
        
        return JsonResponse({
            'text': full_text,
            'pages': num_pages,
            'characters': len(full_text)
        })
        
    except Exception as e:
        logger.error(f"Error in extract_text: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500) 

@csrf_exempt
@require_http_methods(["GET"])
def get_document_structure(request, document_id):
    """Obtiene la estructura analizada de un documento específico por ID o nombre"""
    try:
        document = None
        
        # Intentar buscar por ID primero (si es un UUID válido)
        if document_id and len(document_id) == 36 and '-' in document_id:
            try:
                document = Document.objects.get(id=document_id)
                logger.info(f"Documento encontrado por ID: {document_id}")
            except (ValueError, Document.DoesNotExist):
                logger.warning(f"Documento no encontrado por ID: {document_id}")
                document = None
        
        # Si no se encontró por ID, buscar por nombre de archivo
        if not document:
            try:
                document = Document.objects.get(title=document_id)
                logger.info(f"Documento encontrado por nombre: {document_id}")
            except Document.DoesNotExist:
                logger.warning(f"Documento no encontrado por nombre: {document_id}")
                return JsonResponse({'error': 'Document not found'}, status=404)
        
        if not document.structure_analyzed:
            return JsonResponse({
                'error': 'Document structure not analyzed yet',
                'document_id': str(document.id),
                'document_title': document.title,
                'structure_analyzed': False
            }, status=404)
        
        # Obtener estructura desde la base de datos
        structure_data = document.structure_data or {}
        
        return JsonResponse({
            'document_id': str(document.id),
            'document_title': document.title,
            'structure_analyzed': document.structure_analyzed,
            'structure_data': structure_data,
            'analysis_metadata': structure_data.get('analysis_metadata', {}),
            'hierarchy': structure_data.get('hierarchy', {
                'units': [],
                'orphaned_elements': []
            })
        })
        
    except Exception as e:
        logger.error(f"Error getting document structure: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_document(request, document_id):
    """Elimina un documento por ID o nombre"""
    try:
        file_path = None
        document = None
        
        # Intentar buscar por ID primero (si es un UUID válido)
        if document_id and len(document_id) == 36 and '-' in document_id:
            try:
                document = Document.objects.get(id=document_id)
                file_path = document.file_path
                logger.info(f"Documento encontrado por ID para eliminar: {document_id}")
            except (ValueError, Document.DoesNotExist):
                logger.warning(f"Documento no encontrado por ID: {document_id}")
                file_path = None
        
        # Si no se encontró por ID, buscar por nombre de archivo
        if not file_path:
            documents_dir = os.path.join(settings.BASE_DIR, 'uploads')
            file_path = os.path.join(documents_dir, document_id)
            logger.info(f"Buscando archivo por nombre para eliminar: {file_path}")
        
        # Verificar que el archivo existe
        if not os.path.exists(file_path):
            logger.error(f"Archivo no encontrado para eliminar: {file_path}")
            return JsonResponse({'error': 'File not found'}, status=404)
        
        # Eliminar archivo físico
        os.remove(file_path)
        logger.info(f"Archivo físico eliminado: {file_path}")
        
        # Eliminar registro de la base de datos si existe
        if document:
            document.delete()
            logger.info(f"Registro de base de datos eliminado para: {document_id}")
        
        return JsonResponse({'message': 'Document deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500) 