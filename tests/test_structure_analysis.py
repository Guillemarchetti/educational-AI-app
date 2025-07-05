#!/usr/bin/env python3
"""
Script de prueba para verificar el análisis automático de estructura
"""

import os
import sys
import django
from django.conf import settings

# Configurar Django
sys.path.append('backend')
os.chdir('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from apps.documents.models import Document
from apps.documents.api.structure_views import DocumentStructureView
from django.contrib.auth.models import User
from django.test import RequestFactory

def test_structure_analysis():
    """Prueba el análisis automático de estructura"""
    
    # Obtener un usuario de prueba
    try:
        user = User.objects.first()
        if not user:
            print("❌ No hay usuarios en la base de datos")
            return
        
        print(f"✅ Usuario encontrado: {user.username}")
        
        # Obtener documentos del usuario
        documents = Document.objects.filter(user=user)
        
        if not documents.exists():
            print("❌ No hay documentos para el usuario")
            return
            
        print(f"✅ Encontrados {documents.count()} documentos")
        
        # Probar análisis en el primer documento no analizado
        unanalyzed_docs = documents.filter(structure_analyzed=False)
        
        if not unanalyzed_docs.exists():
            print("ℹ️  Todos los documentos ya están analizados")
            # Resetear el primer documento para prueba
            doc = documents.first()
            doc.structure_analyzed = False
            doc.structure_data = None
            doc.save()
            print(f"🔄 Reseteado documento para prueba: {doc.title}")
        else:
            doc = unanalyzed_docs.first()
            
        print(f"📄 Analizando documento: {doc.title}")
        print(f"📁 Ruta del archivo: {doc.file_path}")
        
        # Verificar que el archivo existe
        if os.path.isabs(doc.file_path):
            file_path = doc.file_path
        else:
            file_path = os.path.join(settings.MEDIA_ROOT, doc.file_path)
            
        if not os.path.exists(file_path):
            print(f"❌ Archivo no encontrado: {file_path}")
            return
            
        print(f"✅ Archivo encontrado: {file_path}")
        
        # Crear una vista para probar
        view = DocumentStructureView()
        
        # Crear request factory
        factory = RequestFactory()
        request = factory.get(f'/api/documents/api/structure/{doc.id}/')
        request.user = user
        
        # Probar el análisis
        print("🔍 Iniciando análisis...")
        response = view.get(request, str(doc.id))
        
        if response.status_code == 200:
            print("✅ Análisis completado exitosamente")
            
            # Recargar documento
            doc.refresh_from_db()
            print(f"📊 Estructura analizada: {doc.structure_analyzed}")
            print(f"📦 Chunks creados: {doc.chunks_created}")
            print(f"🔢 Total chunks: {doc.total_chunks}")
            
            if doc.structure_data:
                metadata = doc.structure_data.get('analysis_metadata', {})
                print(f"📈 Estadísticas:")
                print(f"   - Unidades: {metadata.get('units_found', 0)}")
                print(f"   - Módulos: {metadata.get('modules_found', 0)}")
                print(f"   - Clases: {metadata.get('classes_found', 0)}")
                print(f"   - Total elementos: {metadata.get('total_elements', 0)}")
        else:
            print(f"❌ Error en análisis: {response.status_code}")
            import json
            try:
                error_data = json.loads(response.content)
                print(f"Error: {error_data}")
            except:
                print(f"Response content: {response.content}")
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_structure_analysis() 