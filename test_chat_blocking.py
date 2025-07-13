#!/usr/bin/env python3
"""
Script de prueba para verificar que el chat normal NO genere quizzes
"""

import requests
import json

def test_chat_blocking():
    """Prueba que el chat normal no genere quizzes"""
    
    # Casos de prueba para verificar el bloqueo
    test_cases = [
        {
            "name": "Consulta normal de explicación",
            "message": "Explica este concepto de manera clara y concisa",
            "expected": "explicación normal (no JSON)"
        },
        {
            "name": "Solicitud de ayuda",
            "message": "Necesito ayuda con este tema",
            "expected": "explicación normal (no JSON)"
        },
        {
            "name": "Pregunta sobre concepto",
            "message": "¿Puedes explicar las fracciones?",
            "expected": "explicación normal (no JSON)"
        },
        {
            "name": "Solicitud de quiz (debería ser bloqueada)",
            "message": "Hazme un quiz sobre matemáticas",
            "expected": "mensaje de bloqueo (no JSON)"
        },
        {
            "name": "Solicitud de test (debería ser bloqueada)",
            "message": "Genera un test de fracciones",
            "expected": "mensaje de bloqueo (no JSON)"
        }
    ]
    
    print("🧪 Probando bloqueo de quizzes en chat normal...")
    print("="*60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['name']}")
        print(f"💬 Mensaje: {test_case['message']}")
        print(f"🎯 Esperado: {test_case['expected']}")
        
        # Datos para la petición
        payload = {
            "message": test_case['message'],
            "userId": "test-user",
            "is_quiz_system": False  # Chat normal
        }
        
        try:
            response = requests.post(
                'http://localhost:8000/api/agents/chat/',
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                response_text = data.get('response', '')
                
                print(f"✅ Status: {response.status_code}")
                print(f"🤖 Agente: {data.get('agent_used', 'N/A')}")
                
                # Verificar si contiene JSON (no debería)
                contains_json = '{' in response_text and '}' in response_text
                contains_quiz_keywords = any(word in response_text.lower() for word in [
                    'quiz', 'test', 'evaluación', 'preguntas', 'opciones'
                ])
                
                print(f"📋 Respuesta: {response_text[:200]}...")
                print(f"🔍 Contiene JSON: {'❌ SÍ' if contains_json else '✅ NO'}")
                print(f"🔍 Contiene palabras de quiz: {'❌ SÍ' if contains_quiz_keywords else '✅ NO'}")
                
                # Evaluar resultado
                if contains_json:
                    print("❌ ERROR: Se generó JSON en chat normal")
                elif contains_quiz_keywords:
                    print("❌ ERROR: Se mencionaron palabras de quiz")
                else:
                    print("✅ CORRECTO: Respuesta normal sin quiz")
                    
            else:
                print(f"❌ Error en API: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Error en petición: {e}")
        
        print("-" * 40)

def test_quiz_system_allowed():
    """Prueba que el sistema de quiz SÍ genere quizzes cuando se solicita"""
    
    print("\n🧪 Probando que el sistema de quiz SÍ funcione...")
    print("="*60)
    
    # Contexto de prueba
    context = """
    Las fracciones son números que representan partes de un todo.
    En una fracción, el número de arriba se llama numerador y el de abajo se llama denominador.
    Por ejemplo, en la fracción 3/4: 3 es el numerador y 4 es el denominador.
    """
    
    payload = {
        "message": "Genera un quiz sobre fracciones",
        "userId": "test-user",
        "explicit_context": context,
        "is_quiz_system": True  # Sistema de quiz
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/agents/chat/',
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '')
            
            print(f"✅ Status: {response.status_code}")
            print(f"🤖 Agente: {data.get('agent_used', 'N/A')}")
            
            # Verificar si contiene JSON (debería)
            contains_json = '{' in response_text and '}' in response_text
            
            print(f"📋 Respuesta: {response_text[:200]}...")
            print(f"🔍 Contiene JSON: {'✅ SÍ' if contains_json else '❌ NO'}")
            
            if contains_json:
                print("✅ CORRECTO: Se generó quiz en formato JSON")
            else:
                print("❌ ERROR: No se generó quiz en formato JSON")
                
        else:
            print(f"❌ Error en API: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error en petición: {e}")

if __name__ == "__main__":
    test_chat_blocking()
    test_quiz_system_allowed() 