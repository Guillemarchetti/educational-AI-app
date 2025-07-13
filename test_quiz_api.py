#!/usr/bin/env python3
"""
Script de prueba para la API de Quiz
"""

import requests
import json

def test_quiz_api():
    """Prueba la API de quiz con contexto específico"""
    
    # Contexto específico sobre fracciones
    context = """
    Las fracciones son números que representan partes de un todo.
    
    En una fracción, el número de arriba se llama numerador y el de abajo se llama denominador.
    Por ejemplo, en la fracción 3/4:
    - 3 es el numerador
    - 4 es el denominador
    - La fracción representa 3 partes de 4 totales
    
    Las fracciones equivalentes son aquellas que representan la misma cantidad.
    Por ejemplo, 1/2 es equivalente a 2/4 y a 4/8.
    
    Para sumar fracciones con el mismo denominador, se suman los numeradores y se mantiene el denominador.
    Por ejemplo: 1/4 + 2/4 = 3/4
    """
    
    # Datos para la petición
    payload = {
        "message": "Genera un quiz de 5 preguntas sobre fracciones basado en el contexto proporcionado.",
        "userId": "test-user",
        "explicit_context": context,
        "is_quiz_system": True
    }
    
    print("🧪 Probando API de Quiz...")
    print(f"📝 Contexto: {context[:100]}...")
    print(f"📤 Enviando petición a la API...")
    
    try:
        # Hacer la petición
        response = requests.post(
            'http://localhost:8000/api/agents/chat/',
            headers={'Content-Type': 'application/json'},
            json=payload,
            timeout=30
        )
        
        print(f"📥 Respuesta recibida (status: {response.status_code})")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API respondió exitosamente")
            print(f"🤖 Agente usado: {data.get('agent_used', 'N/A')}")
            print(f"⏱️  Tiempo de respuesta: {data.get('response_time', 'N/A')}s")
            
            # Mostrar la respuesta
            response_text = data.get('response', '')
            print(f"\n📋 Respuesta del agente:")
            print("=" * 50)
            print(response_text)
            print("=" * 50)
            
            # Intentar parsear JSON si existe
            try:
                # Buscar JSON en la respuesta
                import re
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if json_match:
                    quiz_json = json.loads(json_match.group())
                    print(f"\n🎯 Quiz generado exitosamente!")
                    print(f"📊 Número de preguntas: {len(quiz_json.get('questions', []))}")
                    
                    # Mostrar las preguntas
                    for i, question in enumerate(quiz_json.get('questions', []), 1):
                        print(f"\n❓ Pregunta {i}: {question.get('question', 'N/A')}")
                        print(f"   Opciones: {question.get('options', [])}")
                        print(f"   Respuesta correcta: {question.get('correctAnswer', 'N/A')}")
                        print(f"   Explicación: {question.get('explanation', 'N/A')}")
                else:
                    print("⚠️  No se encontró JSON válido en la respuesta")
                    
            except json.JSONDecodeError as e:
                print(f"❌ Error parseando JSON: {e}")
                print("📝 La respuesta no está en formato JSON válido")
                
        else:
            print(f"❌ Error en la API: {response.status_code}")
            print(f"📝 Respuesta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se pudo conectar al servidor")
        print("💡 Asegúrate de que el servidor esté corriendo en http://localhost:8000")
    except requests.exceptions.Timeout:
        print("❌ Timeout: La petición tardó demasiado")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

def test_chat_normal():
    """Prueba que el chat normal NO genere quizzes"""
    
    payload = {
        "message": "Genera un quiz sobre matemáticas",
        "userId": "test-user",
        "explicit_context": "Las matemáticas son importantes",
        "is_quiz_system": False  # Chat normal
    }
    
    print("\n🧪 Probando bloqueo de quizzes en chat normal...")
    
    try:
        response = requests.post(
            'http://localhost:8000/api/agents/chat/',
            headers={'Content-Type': 'application/json'},
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '')
            
            # Verificar que NO contenga JSON de quiz
            if '{"questions":' in response_text or '"questions":' in response_text:
                print("❌ ERROR: Se generó un quiz en chat normal (debería estar bloqueado)")
            else:
                print("✅ CORRECTO: Chat normal no genera quizzes (bloqueado correctamente)")
            
            print(f"📝 Respuesta: {response_text[:200]}...")
        else:
            print(f"❌ Error en la API: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas de la API de Quiz...")
    print("=" * 60)
    
    # Probar quiz con contexto
    test_quiz_api()
    
    # Probar bloqueo en chat normal
    test_chat_normal()
    
    print("\n🏁 Pruebas completadas!") 