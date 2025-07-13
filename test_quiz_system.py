#!/usr/bin/env python3
"""
Script de prueba para el sistema de Quiz
"""

import requests
import json

def test_quiz_system():
    """Prueba el sistema de quiz con contexto específico"""
    
    # Contexto específico sobre medidas de volumen
    context = """
    Contexto de 4 Cuántos centilitros hay en dos bidones con una capacidad de 20 litros cada uno (Página 4):

    20 x 2 = 40 𝓁 40 x 100 = 4000 c𝓁 5. Se preparan 3 litros de vacuna. Si la dosis es de 4 ml, ¿para cuántas dosis alcanza?
    """
    
    # Datos para la petición del Quiz System
    payload = {
        "message": "Comenzar Quiz\n\nIMPORTANTE: Responde ÚNICAMENTE en formato JSON válido.\n\nBasándote ÚNICAMENTE en el siguiente contexto específico del chat, genera un quiz de 5 preguntas con 4 opciones cada una.\n\nREGLAS IMPORTANTES:\n- SOLO usa el contexto proporcionado, NO agregues información externa\n- Las preguntas DEBEN estar basadas específicamente en el contenido del contexto\n- Las opciones deben ser plausibles pero con una respuesta correcta definitiva\n- Las explicaciones deben referenciar específicamente el contexto proporcionado\n- RESPONDE ÚNICAMENTE EN FORMATO JSON, NO AGREGUES TEXTO ADICIONAL\n\nCONTEXTO ESPECÍFICO DEL CHAT:\n" + context + "\n\nGenera preguntas que se enfoquen específicamente en los conceptos, detalles, números, fechas, nombres, o elementos mencionados en el contexto proporcionado. NO uses información general, solo lo que está en el contexto.\n\nRESPONDE ÚNICAMENTE EN FORMATO JSON.",
        "userId": "demo-user",
        "explicit_context": context,
        "is_quiz_system": True
    }
    
    print("🧪 Probando sistema de Quiz...")
    print(f"📝 Contexto: {context[:100]}...")
    print(f"📤 Enviando petición a la API...")
    
    try:
        response = requests.post(
            'http://localhost:8000/api/agents/chat/',
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📥 Respuesta recibida (status: {response.status_code})")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API respondió exitosamente")
            print(f"🤖 Agente usado: {data.get('agent_used', 'N/A')}")
            print(f"⏱️  Tiempo de respuesta: {data.get('response_time', 'N/A')}s")
            
            print("\n📋 Respuesta completa del agente:")
            print("="*60)
            print(data.get('response', 'Sin respuesta'))
            print("="*60)
            
            # Verificar si la respuesta contiene JSON
            response_text = data.get('response', '')
            if '{' in response_text and '}' in response_text:
                print("✅ La respuesta contiene JSON")
                # Intentar extraer JSON
                try:
                    json_start = response_text.find('{')
                    json_end = response_text.rfind('}') + 1
                    json_str = response_text[json_start:json_end]
                    quiz_data = json.loads(json_str)
                    print("✅ JSON válido encontrado")
                    print(f"📊 Número de preguntas: {len(quiz_data.get('questions', []))}")
                except json.JSONDecodeError as e:
                    print(f"❌ Error parsing JSON: {e}")
            else:
                print("❌ La respuesta NO contiene JSON")
                
        else:
            print(f"❌ Error en la API: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error en la petición: {e}")

if __name__ == "__main__":
    test_quiz_system() 