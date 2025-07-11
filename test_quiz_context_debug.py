#!/usr/bin/env python3
"""
Test para verificar el envío de contexto en la generación de quiz
"""

import requests
import json

def test_quiz_context_sending():
    """Test para verificar que el contexto se envía correctamente al backend"""
    
    # Simular el contexto que se envía desde el frontend
    test_context = [
        "Contexto del archivo: Las matemáticas son fundamentales para el desarrollo del pensamiento lógico.",
        "🖼️ ANÁLISIS DE IMAGEN: La imagen muestra una gráfica de funciones cuadráticas con puntos de intersección marcados.",
        "📚 Estructura del documento - Ruta: Capítulo 3 > Sección 2 > Álgebra básica"
    ]
    
    # Simular el prompt que se envía desde el frontend
    prompt = """Genera un quiz de 5 preguntas basándote ÚNICAMENTE en el siguiente contexto específico que el usuario ha seleccionado del documento. 
    
    🚨 REGLA CRÍTICA: Solo usa el contexto proporcionado a continuación. NO uses información del documento completo ni información externa.
    
    Formato de respuesta JSON:
    {
      "questions": [
        {
          "question": "Pregunta específica sobre el contexto proporcionado",
          "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "correctAnswer": 0,
          "explanation": "Explicación basada únicamente en el contexto proporcionado",
          "difficulty": "easy"
        }
      ]
    }
    
    CONTEXTO ESPECÍFICO DEL USUARIO:
    Las matemáticas son fundamentales para el desarrollo del pensamiento lógico.
    🖼️ ANÁLISIS DE IMAGEN: La imagen muestra una gráfica de funciones cuadráticas con puntos de intersección marcados.
    📚 Estructura del documento - Ruta: Capítulo 3 > Sección 2 > Álgebra básica
    
    Genera preguntas que se enfoquen específicamente en los conceptos, detalles o elementos mencionados en el contexto proporcionado. Las preguntas deben ser claras y las opciones deben ser plausibles pero con una respuesta correcta definitiva basada únicamente en este contexto."""
    
    # Simular la petición que hace el frontend
    payload = {
        "message": prompt,
        "userId": "demo-user",
        "context": "\n\n---\n\n".join(test_context)
    }
    
    print("🔍 Enviando petición de quiz al backend...")
    print(f"📝 Prompt: {prompt[:200]}...")
    print(f"📋 Contexto: {payload['context'][:200]}...")
    
    try:
        response = requests.post(
            'http://localhost:8000/api/agents/chat/',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload),
            timeout=30
        )
        
        print(f"📡 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Respuesta exitosa del backend")
            print(f"🤖 Agente usado: {data.get('agent_used', 'N/A')}")
            print(f"📊 Fuentes de contexto: {data.get('context_sources', 'N/A')}")
            print(f"⏱️ Tiempo de respuesta: {data.get('response_time', 'N/A')}s")
            
            # Verificar si la respuesta contiene JSON de quiz
            response_text = data.get('response', '')
            print(f"📄 Respuesta (primeros 300 chars): {response_text[:300]}...")
            
            # Intentar extraer JSON
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                try:
                    quiz_json = json.loads(json_match.group())
                    print("✅ JSON de quiz encontrado y válido")
                    print(f"📝 Número de preguntas: {len(quiz_json.get('questions', []))}")
                except json.JSONDecodeError as e:
                    print(f"❌ Error parseando JSON: {e}")
            else:
                print("❌ No se encontró JSON válido en la respuesta")
                
        else:
            print(f"❌ Error en la respuesta: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

def test_backend_context_handling():
    """Test para verificar cómo el backend maneja el contexto"""
    
    print("\n" + "="*50)
    print("🔍 TEST: Manejo de contexto en el backend")
    print("="*50)
    
    # Test 1: Petición con contexto explícito
    print("\n📋 Test 1: Petición con contexto explícito")
    test_quiz_context_sending()
    
    # Test 2: Petición sin contexto (para comparar)
    print("\n📋 Test 2: Petición sin contexto explícito")
    
    payload = {
        "message": "Genera un quiz de 5 preguntas sobre matemáticas",
        "userId": "demo-user"
        # Sin campo 'context'
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/agents/chat/',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload),
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Respuesta exitosa del backend")
            print(f"🤖 Agente usado: {data.get('agent_used', 'N/A')}")
            print(f"📊 Fuentes de contexto: {data.get('context_sources', 'N/A')}")
            
            response_text = data.get('response', '')
            print(f"📄 Respuesta (primeros 300 chars): {response_text[:300]}...")
        else:
            print(f"❌ Error en la respuesta: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🧪 Iniciando tests de contexto de quiz...")
    test_backend_context_handling() 