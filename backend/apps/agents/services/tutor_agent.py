"""
Agente Tutor Virtual
Especializado en educación personalizada y enseñanza adaptativa.
"""

from typing import Dict, Any
from .ai_service import BaseAIService

class TutorAgent(BaseAIService):
    """
    Agente Tutor Virtual especializado en educación personalizada.
    
    Capacidades:
    - Adaptar explicaciones al nivel del estudiante
    - Crear ejercicios personalizados
    - Dar retroalimentación constructiva
    - Identificar áreas de mejora
    - Sugerir recursos adicionales
    """
    
    def get_agent_name(self) -> str:
        """Nombre del agente"""
        return "Tutor Virtual"
    
    def get_system_prompt(self) -> str:
        """Prompt del sistema para el Tutor Virtual"""
        return """
Eres un Tutor Virtual especializado en educación personalizada y enseñanza adaptativa. Tu misión es ayudar a estudiantes de todos los niveles a comprender conceptos, resolver problemas y desarrollar habilidades de aprendizaje.

## TUS CAPACIDADES PRINCIPALES:

### 📚 ENSEÑANZA ADAPTATIVA
- Adaptar explicaciones al nivel educativo del estudiante
- Usar ejemplos relevantes y apropiados para la edad
- Simplificar conceptos complejos paso a paso
- Identificar diferentes estilos de aprendizaje

### 🎯 PERSONALIZACIÓN
- Considerar el historial de preguntas del estudiante
- Adaptar el ritmo según las necesidades individuales
- Proporcionar múltiples enfoques para el mismo concepto
- Reconocer fortalezas y áreas de mejora

### 💡 METODOLOGÍA PEDAGÓGICA
- Usar el método socrático (preguntas guía)
- Proporcionar retroalimentación constructiva
- Fomentar el pensamiento crítico
- Celebrar los logros y motivar el aprendizaje

### 🔧 HERRAMIENTAS EDUCATIVAS
- Crear ejercicios prácticos personalizados
- Sugerir recursos adicionales
- Proponer actividades de refuerzo
- Diseñar planes de estudio graduales

## INSTRUCCIONES ESPECÍFICAS:

### CUANDO RESPONDAS:
1. **SIEMPRE** comienza reconociendo la pregunta del estudiante
2. Evalúa el nivel de complejidad apropiado
3. Proporciona una explicación clara y estructurada
4. Incluye ejemplos prácticos y relevantes
5. Termina con una pregunta o ejercicio para verificar comprensión

### ESTRUCTURA DE RESPUESTA:
- **Explicación Principal**: Concepto central claro
- **Ejemplos**: 1-2 ejemplos prácticos
- **Aplicación**: Cómo usar este conocimiento
- **Verificación**: Pregunta para confirmar entendimiento
- **Próximos Pasos**: Qué estudiar después

### TONO Y ESTILO:
- Amigable y alentador
- Paciente y comprensivo
- Entusiasta por el aprendizaje
- Claro y directo
- Adaptado a la edad del estudiante

### MANEJO DE DOCUMENTOS:
Si el estudiante ha subido documentos (apuntes, tareas, exámenes):
- Analiza el contenido para entender el contexto
- Identifica conceptos clave y áreas de dificultad
- Proporciona explicaciones basadas en el material
- Sugiere mejoras o aclaraciones

¡Tu objetivo es hacer que cada estudiante se sienta confiado y emocionado por aprender!
"""
    
    def process_specialized_query(self, query: str, context: Dict[str, Any]) -> str:
        """
        Procesamiento especializado para consultas educativas.
        """
        # Extraer información específica del contexto
        user_level = context.get('user_level', 'Estudiante')
        subject = context.get('subject', 'General')
        user_profile = context.get('user_profile', {})
        
        # Añadir contexto educativo específico
        educational_context = {
            **context,
            'learning_objectives': self._identify_learning_objectives(query, subject),
            'difficulty_level': self._assess_difficulty_level(query, user_level),
            'suggested_approach': self._suggest_teaching_approach(query, user_level)
        }
        
        return self.process_query(query, educational_context)
    
    def _identify_learning_objectives(self, query: str, subject: str) -> list:
        """Identificar objetivos de aprendizaje basados en la consulta"""
        # Lógica básica para identificar objetivos
        objectives = []
        
        keywords_map = {
            'matemáticas': ['resolver problemas', 'aplicar fórmulas', 'razonamiento lógico'],
            'ciencias': ['experimentar', 'observar', 'analizar datos'],
            'historia': ['contextualizar', 'analizar causas', 'comparar épocas'],
            'literatura': ['interpretar textos', 'analizar estilo', 'expresión escrita'],
            'general': ['comprender conceptos', 'aplicar conocimientos', 'desarrollar habilidades']
        }
        
        subject_lower = subject.lower()
        for key, objs in keywords_map.items():
            if key in subject_lower:
                objectives.extend(objs)
                break
        else:
            objectives = keywords_map['general']
        
        return objectives
    
    def _assess_difficulty_level(self, query: str, user_level: str) -> str:
        """Evaluar el nivel de dificultad apropiado"""
        level_mapping = {
            'primaria': 'básico',
            'secundaria': 'intermedio', 
            'preparatoria': 'intermedio-avanzado',
            'universidad': 'avanzado',
            'default': 'intermedio'
        }
        
        level_lower = user_level.lower()
        for key, difficulty in level_mapping.items():
            if key in level_lower:
                return difficulty
        
        return level_mapping['default']
    
    def _suggest_teaching_approach(self, query: str, user_level: str) -> str:
        """Sugerir enfoque pedagógico apropiado"""
        approaches = {
            'primaria': 'visual y lúdico',
            'secundaria': 'práctico y estructurado',
            'preparatoria': 'analítico y aplicativo',
            'universidad': 'teórico y crítico',
            'default': 'equilibrado y adaptativo'
        }
        
        level_lower = user_level.lower()
        for key, approach in approaches.items():
            if key in level_lower:
                return approach
        
        return approaches['default']
    
    def create_practice_exercise(self, topic: str, difficulty: str = 'intermedio') -> str:
        """
        Crear un ejercicio de práctica personalizado.
        """
        exercise_prompt = f"""
        Crea un ejercicio de práctica sobre el tema: {topic}
        Nivel de dificultad: {difficulty}
        
        El ejercicio debe incluir:
        1. Enunciado claro del problema
        2. Datos necesarios
        3. Pasos sugeridos para resolverlo
        4. Respuesta esperada
        5. Explicación del proceso
        """
        
        return self.process_query(exercise_prompt, {
            'topic': topic,
            'difficulty': difficulty,
            'format': 'ejercicio_practica'
        })
    
    def provide_study_plan(self, subject: str, timeframe: str, user_level: str) -> str:
        """
        Crear un plan de estudio personalizado.
        """
        plan_prompt = f"""
        Crea un plan de estudio para:
        - Materia: {subject}
        - Duración: {timeframe}
        - Nivel: {user_level}
        
        El plan debe incluir:
        1. Objetivos específicos
        2. Cronograma semanal
        3. Recursos recomendados
        4. Métodos de evaluación
        5. Consejos de estudio
        """
        
        return self.process_query(plan_prompt, {
            'subject': subject,
            'timeframe': timeframe,
            'user_level': user_level,
            'format': 'plan_estudio'
        })
    
    def analyze_student_work(self, work_content: str, assignment_type: str) -> str:
        """
        Analizar trabajo del estudiante y proporcionar retroalimentación.
        """
        analysis_prompt = f"""
        Analiza el siguiente trabajo de estudiante:
        Tipo: {assignment_type}
        
        Trabajo del estudiante:
        {work_content}
        
        Proporciona:
        1. Evaluación general
        2. Fortalezas identificadas
        3. Áreas de mejora
        4. Sugerencias específicas
        5. Calificación constructiva
        """
        
        return self.process_query(analysis_prompt, {
            'work_content': work_content,
            'assignment_type': assignment_type,
            'format': 'analisis_trabajo'
        }) 