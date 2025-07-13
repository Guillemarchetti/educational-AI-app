#!/usr/bin/env python3
"""
Script de debug para la API de Quiz
"""

import requests
import json

def debug_quiz_api():
    """Debug detallado de la API de quiz"""
    
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
    
    print("🔍 DEBUG: Analizando petición...")
    print(f"📤 Payload enviado:")
    print(json.dumps(payload, indent=2))
    print("\n" + "="*60)
    
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
            
            # Mostrar la respuesta completa
            response_text = data.get('response', '')
            print(f"\n📋 Respuesta completa del agente:")
            print("=" * 60)
            print(response_text)
            print("=" * 60)
            
            # Verificar si contiene el contexto
            if "fracción" in response_text.lower() or "numerador" in response_text.lower() or "denominador" in response_text.lower():
                print("✅ La respuesta contiene referencias al contexto de fracciones")
            else:
                print("❌ La respuesta NO contiene referencias al contexto de fracciones")
            
            # Intentar parsear JSON
            try:
                import re
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if json_match:
                    quiz_json = json.loads(json_match.group())
                    print(f"\n🎯 Quiz JSON encontrado!")
                    print(f"📊 Número de preguntas: {len(quiz_json.get('questions', []))}")
                    
                    # Verificar si las preguntas están basadas en el contexto
                    context_keywords = ['fracción', 'numerador', 'denominador', '3/4', '1/2', '2/4', '4/8', 'sumar']
                    questions_with_context = 0
                    
                    for i, question in enumerate(quiz_json.get('questions', []), 1):
                        question_text = question.get('question', '').lower()
                        explanation = question.get('explanation', '').lower()
                        
                        has_context = any(keyword in question_text or keyword in explanation for keyword in context_keywords)
                        
                        print(f"\n❓ Pregunta {i}: {question.get('question', 'N/A')}")
                        print(f"   Opciones: {question.get('options', [])}")
                        print(f"   Respuesta correcta: {question.get('correctAnswer', 'N/A')}")
                        print(f"   Explicación: {question.get('explanation', 'N/A')}")
                        print(f"   ¿Basada en contexto? {'✅' if has_context else '❌'}")
                        
                        if has_context:
                            questions_with_context += 1
                    
                    print(f"\n📊 Resumen: {questions_with_context}/{len(quiz_json.get('questions', []))} preguntas basadas en contexto")
                    
                else:
                    print("⚠️  No se encontró JSON válido en la respuesta")
                    
            except json.JSONDecodeError as e:
                print(f"❌ Error parseando JSON: {e}")
                
        else:
            print(f"❌ Error en la API: {response.status_code}")
            print(f"📝 Respuesta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se pudo conectar al servidor")
    except requests.exceptions.Timeout:
        print("❌ Timeout: La petición tardó demasiado")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    print("🔍 Iniciando debug de la API de Quiz...")
    debug_quiz_api() 