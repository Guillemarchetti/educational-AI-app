from typing import Dict, Any
from .ai_service import BaseAIService

class QuizAgent(BaseAIService):
    """
    Agente especializado en la generación de quizzes y evaluaciones
    """
    
    def get_agent_name(self) -> str:
        """Nombre del agente"""
        return "Quiz Generator"
    
    def get_system_prompt(self) -> str:
        """Prompt del sistema para el generador de quizzes"""
        return """
Eres un generador de quizzes especializado en crear evaluaciones educativas de alta calidad. Tu misión es generar quizzes que evalúen efectivamente el conocimiento del estudiante.

## TUS CAPACIDADES PRINCIPALES:

### 🎯 GENERACIÓN DE QUIZZES
- Crear preguntas claras y específicas basadas en el contexto proporcionado
- Generar opciones plausibles pero con una respuesta correcta definitiva
- Proporcionar explicaciones detalladas de las respuestas correctas
- Adaptar la dificultad al nivel del estudiante

### 📊 ESTRUCTURA DE QUIZ
- 5 preguntas por quiz (por defecto)
- 4 opciones por pregunta
- Una respuesta correcta definitiva
- Explicación detallada de cada respuesta
- Nivel de dificultad apropiado

### 🎓 ENFOQUE EDUCATIVO
- Preguntas basadas ÚNICAMENTE en el contexto proporcionado
- Evaluación de comprensión conceptual
- Verificación de aplicación práctica
- Medición de habilidades analíticas

## INSTRUCCIONES ESPECÍFICAS:

### CUANDO GENERES UN QUIZ:
1. **ANALIZA** el contexto proporcionado cuidadosamente
2. **IDENTIFICA** los conceptos clave y detalles importantes
3. **CREA** preguntas específicas sobre el contenido del contexto
4. **GENERA** opciones plausibles pero con una respuesta clara
5. **EXPLICA** por qué la respuesta es correcta basándose en el contexto

### FORMATO DE RESPUESTA REQUERIDO:
```json
{
  "questions": [
    {
      "question": "Pregunta específica sobre el contexto",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctAnswer": 0,
      "explanation": "Explicación detallada basada en el contexto",
      "difficulty": "easy"
    }
  ]
}
```

### REGLAS CRÍTICAS:
- **SOLO** usa información del contexto proporcionado
- **NO** agregues información externa o general
- **RESPONDE ÚNICAMENTE** en formato JSON válido
- **NO** agregues texto adicional fuera del JSON
- Las preguntas deben ser **ESPECÍFICAS** al contexto dado

### TIPOS DE PREGUNTAS:
- **Comprensión**: Verificar entendimiento de conceptos
- **Aplicación**: Evaluar uso práctico del conocimiento
- **Análisis**: Probar capacidad de análisis
- **Cálculo**: Evaluar habilidades matemáticas (si aplica)

¡Tu objetivo es crear quizzes que evalúen efectivamente el conocimiento específico del contexto proporcionado!
"""
    
    def process_specialized_query(self, query: str, context: Dict[str, Any]) -> str:
        """
        Procesamiento especializado para generación de quizzes
        """
        # Extraer contexto explícito
        explicit_context = context.get('explicit_context', '')
        
        if not explicit_context or not str(explicit_context).strip():
            return "Error: No se proporcionó contexto específico para generar el quiz."
        
        # Construir prompt para generación de quiz
        quiz_prompt = f"""
        IMPORTANTE: Responde ÚNICAMENTE en formato JSON válido. NO agregues texto adicional.

        Basándote ÚNICAMENTE en el siguiente contexto específico, genera un quiz de 5 preguntas con 4 opciones cada una.
        
        REGLAS IMPORTANTES:
        - SOLO usa el contexto proporcionado, NO agregues información externa
        - Las preguntas DEBEN estar basadas específicamente en el contenido del contexto
        - Las opciones deben ser plausibles pero con una respuesta correcta definitiva
        - Las explicaciones deben referenciar específicamente el contexto proporcionado
        - RESPONDE ÚNICAMENTE EN FORMATO JSON, NO AGREGUES TEXTO ADICIONAL
        
        CONTEXTO ESPECÍFICO:
        {explicit_context}
        
        Formato de respuesta JSON requerido:
        {{
          "questions": [
            {{
              "question": "Pregunta específica sobre el contexto proporcionado",
              "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
              "correctAnswer": 0,
              "explanation": "Explicación detallada de por qué es correcta basada ÚNICAMENTE en el contexto",
              "difficulty": "easy"
            }}
          ]
        }}
        
        Responde ÚNICAMENTE en formato JSON con el quiz basado en este contexto específico.
        """
        
        return self.process_query(quiz_prompt, context) 