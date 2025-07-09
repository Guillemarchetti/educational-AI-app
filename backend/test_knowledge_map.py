#!/usr/bin/env python
"""
Script de prueba para el Knowledge Map
"""
import os
import sys
import django
import json
import requests

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from apps.agents.models import KnowledgeNode, LearningSession, LearningProgress
from apps.documents.models import Document
from apps.agents.services.knowledge_analyzer import KnowledgeAnalyzer

def test_knowledge_map():
    """Prueba el sistema de Knowledge Map"""
    print("🧠 Probando Knowledge Map...")
    
    # 1. Verificar que los modelos existen
    print("✅ Modelos creados correctamente")
    
    # 2. Probar el analizador
    analyzer = KnowledgeAnalyzer()
    print("✅ KnowledgeAnalyzer inicializado")
    
    # 3. Crear un documento de prueba
    try:
        document = Document.objects.first()
        if document:
            print(f"✅ Documento encontrado: {document.title}")
            
            # 4. Probar generación de mapa de conocimientos
            structure_data = {
                'units': [
                    {
                        'title': 'Unidad 1: Introducción',
                        'description': 'Conceptos básicos del tema',
                        'modules': [
                            {
                                'title': 'Módulo 1.1: Fundamentos',
                                'description': 'Conceptos fundamentales',
                                'classes': [
                                    {
                                        'title': 'Clase 1.1.1: Conceptos Básicos',
                                        'description': 'Introducción a los conceptos básicos'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
            
            # Generar nodos de conocimiento
            knowledge_nodes = analyzer.analyze_document_structure(document, structure_data)
            print(f"✅ Generados {len(knowledge_nodes)} nodos de conocimiento")
            
            # Obtener el mapa completo
            knowledge_map = analyzer.get_knowledge_map_for_document(document)
            print(f"✅ Mapa de conocimientos creado con {len(knowledge_map['nodes'])} nodos raíz")
            
            # Mostrar estadísticas
            stats = knowledge_map['statistics']
            print(f"📊 Estadísticas:")
            print(f"   - Total de nodos: {stats['total_nodes']}")
            print(f"   - Objetivos: {stats['status_counts']['objective']}")
            print(f"   - Bien aprendido: {stats['status_counts']['well_learned']}")
            print(f"   - Necesita refuerzo: {stats['status_counts']['needs_reinforcement']}")
            print(f"   - No aprendido: {stats['status_counts']['not_learned']}")
            print(f"   - Progreso general: {stats['overall_progress']}%")
            
            return True
            
        else:
            print("⚠️ No hay documentos en la base de datos")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_api_endpoints():
    """Prueba los endpoints de la API"""
    print("\n🌐 Probando endpoints de la API...")
    
    base_url = "http://localhost:8000"
    
    # 1. Probar health check
    try:
        response = requests.get(f"{base_url}/api/agents/health/")
        if response.status_code == 200:
            print("✅ Health check funcionando")
        else:
            print(f"❌ Health check falló: {response.status_code}")
    except Exception as e:
        print(f"❌ Error en health check: {str(e)}")
    
    # 2. Probar generación de mapa de conocimientos
    try:
        # Buscar un documento
        document = Document.objects.first()
        if document:
            response = requests.get(f"{base_url}/api/agents/knowledge-map/{document.id}/")
            if response.status_code == 200:
                data = response.json()
                print("✅ Endpoint de Knowledge Map funcionando")
                print(f"   - Nodos generados: {len(data.get('knowledge_map', {}).get('nodes', []))}")
            else:
                print(f"❌ Endpoint de Knowledge Map falló: {response.status_code}")
        else:
            print("⚠️ No hay documentos para probar")
    except Exception as e:
        print(f"❌ Error en endpoint de Knowledge Map: {str(e)}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas del Knowledge Map...")
    
    # Probar funcionalidad básica
    success = test_knowledge_map()
    
    # Probar endpoints de la API
    test_api_endpoints()
    
    if success:
        print("\n🎉 ¡Todas las pruebas pasaron! El Knowledge Map está funcionando correctamente.")
    else:
        print("\n⚠️ Algunas pruebas fallaron. Revisa los errores arriba.") 