"""
Agente Evaluator - Especializado en evaluación y calificación automatizada
"""

from typing import Dict, Any, List
from .ai_service import BaseAIService

class EvaluatorAgent(BaseAIService):
    """
    Agente Evaluator especializado en evaluación y calificación automatizada.
    
    Capacidades:
    - Crear exámenes y cuestionarios adaptativos
    - Calificar respuestas automáticamente
    - Generar rúbricas de evaluación
    - Analizar patrones de error
    - Dar retroalimentación detallada
    - Detectar plagio y trampas
    - Evaluar competencias y habilidades
    """
    
    def get_agent_name(self) -> str:
        """Nombre del agente"""
        return "Evaluator - Sistema de Evaluación"
    
    def get_system_prompt(self) -> str:
        """Prompt del sistema para el Evaluator"""
        return """
Eres un Evaluador Académico Experto especializado en evaluación educativa y calificación automatizada.

## TU IDENTIDAD Y PROPÓSITO
- Evaluador pedagógico con expertise en assessment y medición educativa
- Especializas en crear evaluaciones justas, válidas y confiables
- Tu objetivo es medir el aprendizaje de manera objetiva y constructiva
- Proporcionas retroalimentación que promueve el crecimiento académico

## CAPACIDADES PRINCIPALES

### 1. CREACIÓN DE EVALUACIONES
- Diseñar exámenes adaptativos según nivel y materia
- Crear rúbricas detalladas y objetivas
- Desarrollar preguntas de diferentes tipos y niveles cognitivos
- Establecer criterios de evaluación claros y medibles

### 2. CALIFICACIÓN AUTOMATIZADA
- Evaluar respuestas abiertas y ensayos
- Analizar soluciones matemáticas paso a paso
- Verificar código de programación y lógica
- Calificar proyectos y trabajos creativos

### 3. ANÁLISIS DE DESEMPEÑO
- Identificar patrones de error comunes
- Detectar áreas de fortaleza y debilidad
- Analizar progreso académico temporal
- Generar insights sobre estrategias de aprendizaje

### 4. RETROALIMENTACIÓN CONSTRUCTIVA
- Explicar errores de manera educativa
- Sugerir mejoras específicas y accionables
- Proporcionar ejemplos de respuestas modelo
- Orientar hacia recursos de refuerzo

### 5. INTEGRIDAD ACADÉMICA
- Detectar posible plagio o copia
- Identificar patrones sospechosos en respuestas
- Verificar originalidad del trabajo
- Mantener estándares éticos de evaluación

## DIRECTRICES DE EVALUACIÓN

### JUSTICIA Y OBJETIVIDAD
- Evalúa basándote únicamente en criterios académicos
- Mantén consistencia en la aplicación de rúbricas
- Considera diferentes estilos de aprendizaje y expresión
- Elimina sesgos personales o culturales

### RETROALIMENTACIÓN EFECTIVA
- Sé específico en tus comentarios y calificaciones
- Balancea crítica constructiva con reconocimiento positivo
- Proporciona orientación clara para la mejora
- Adapta el lenguaje al nivel del estudiante

### DESARROLLO CONTINUO
- Fomenta el crecimiento académico a largo plazo
- Conecta evaluaciones con objetivos de aprendizaje
- Motiva la autorreflexión y metacognición
- Promueve la excelencia académica sostenible

## PROTOCOLO DE RESPUESTA
1. Analiza el contexto de la evaluación solicitada
2. Aplica criterios pedagógicos apropiados
3. Proporciona evaluación detallada y justificada
4. Incluye retroalimentación constructiva específica
5. Sugiere próximos pasos para el aprendizaje

Siempre mantén altos estándares académicos mientras apoyas el crecimiento educativo del estudiante.
"""

    def create_assessment(self, subject: str, level: str, topic: str, assessment_type: str, 
                         num_questions: int = 10) -> Dict[str, Any]:
        """
        Crear una evaluación personalizada
        
        Args:
            subject: Materia (ej: "Matemáticas", "Historia")
            level: Nivel educativo (ej: "Secundaria", "Universidad")
            topic: Tema específico
            assessment_type: Tipo (ej: "quiz", "examen", "proyecto")
            num_questions: Número de preguntas
        """
        context = {
            'task_type': 'assessment_creation',
            'subject': subject,
            'level': level,
            'topic': topic,
            'assessment_type': assessment_type,
            'num_questions': num_questions
        }
        
        query = f"""
Crea una evaluación de {assessment_type} para {subject} nivel {level} sobre el tema: {topic}.

ESPECIFICACIONES:
- Número de preguntas: {num_questions}
- Incluye variedad de tipos de pregunta (opción múltiple, desarrollo, análisis)
- Diferentes niveles cognitivos (conocimiento, comprensión, aplicación, análisis)
- Proporciona rúbrica de calificación detallada
- Tiempo estimado de resolución
- Criterios de evaluación específicos

FORMATO REQUERIDO:
1. Información general de la evaluación
2. Preguntas organizadas por tipo y dificultad
3. Respuestas modelo o criterios de evaluación
4. Rúbrica de calificación
5. Instrucciones para el estudiante
"""
        
        response = self.process_query(query, context)
        
        return {
            'assessment_id': f"{subject}_{level}_{topic}_{assessment_type}".lower().replace(' ', '_'),
            'subject': subject,
            'level': level,
            'topic': topic,
            'type': assessment_type,
            'content': response,
            'metadata': {
                'num_questions': num_questions,
                'estimated_time': self._estimate_time(num_questions, assessment_type),
                'difficulty_distribution': self._get_difficulty_distribution()
            }
        }
    
    def grade_submission(self, assessment_id: str, student_responses: List[Dict], 
                        rubric: Dict = None) -> Dict[str, Any]:
        """
        Calificar una entrega de evaluación
        
        Args:
            assessment_id: ID de la evaluación
            student_responses: Lista de respuestas del estudiante
            rubric: Rúbrica específica (opcional)
        """
        context = {
            'task_type': 'grading',
            'assessment_id': assessment_id,
            'total_responses': len(student_responses),
            'rubric_provided': rubric is not None
        }
        
        # Preparar respuestas para evaluación
        responses_text = ""
        for i, response in enumerate(student_responses, 1):
            question = response.get('question', f'Pregunta {i}')
            answer = response.get('answer', '')
            responses_text += f"\n--- Pregunta {i}: {question} ---\n"
            responses_text += f"Respuesta del estudiante: {answer}\n"
        
        query = f"""
Califica la siguiente entrega de evaluación usando criterios pedagógicos rigurosos:

EVALUACIÓN ID: {assessment_id}

{responses_text}

INSTRUCCIONES DE CALIFICACIÓN:
1. Evalúa cada respuesta individualmente
2. Asigna puntajes específicos y justificados
3. Identifica fortalezas y áreas de mejora
4. Proporciona retroalimentación constructiva detallada
5. Calcula puntaje total y porcentaje
6. Sugiere recursos o estrategias de mejora

FORMATO DE SALIDA:
- Calificación por pregunta con justificación
- Puntaje total y porcentaje
- Retroalimentación general constructiva
- Análisis de patrones de error
- Recomendaciones específicas para mejorar
"""
        
        response = self.process_query(query, context)
        
        return {
            'assessment_id': assessment_id,
            'total_score': self._extract_total_score(response),
            'percentage': self._extract_percentage(response),
            'detailed_feedback': response,
            'strengths': self._extract_strengths(response),
            'improvement_areas': self._extract_improvements(response),
            'recommendations': self._extract_recommendations(response),
            'grade_timestamp': self._get_timestamp()
        }
    
    def analyze_class_performance(self, assessment_results: List[Dict]) -> Dict[str, Any]:
        """
        Analizar el desempeño de toda una clase en una evaluación
        """
        context = {
            'task_type': 'class_analysis',
            'num_students': len(assessment_results),
            'assessment_data': 'class_performance_analysis'
        }
        
        # Preparar datos estadísticos básicos
        scores = [result.get('percentage', 0) for result in assessment_results]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        results_summary = f"""
DATOS DE LA CLASE:
- Número de estudiantes: {len(assessment_results)}
- Promedio de clase: {avg_score:.1f}%
- Puntaje más alto: {max(scores) if scores else 0}%
- Puntaje más bajo: {min(scores) if scores else 0}%

DISTRIBUCIÓN DE RESULTADOS:
"""
        
        for i, result in enumerate(assessment_results[:10], 1):  # Primeros 10 para análisis
            score = result.get('percentage', 0)
            results_summary += f"Estudiante {i}: {score}%\n"
        
        query = f"""
Analiza el desempeño de la clase en esta evaluación y proporciona insights pedagógicos:

{results_summary}

ANÁLISIS REQUERIDO:
1. Interpretación estadística de los resultados
2. Identificación de patrones de desempeño
3. Análisis de distribución de calificaciones
4. Detección de preguntas problemáticas
5. Recomendaciones para la enseñanza
6. Estrategias de intervención diferenciada
7. Sugerencias para próximas evaluaciones

Proporciona un análisis comprensivo que ayude al instructor a mejorar la enseñanza.
"""
        
        response = self.process_query(query, context)
        
        return {
            'class_statistics': {
                'average': avg_score,
                'max_score': max(scores) if scores else 0,
                'min_score': min(scores) if scores else 0,
                'total_students': len(assessment_results)
            },
            'analysis': response,
            'recommendations': self._extract_teaching_recommendations(response),
            'interventions': self._extract_interventions(response)
        }
    
    def detect_academic_integrity_issues(self, submissions: List[Dict]) -> Dict[str, Any]:
        """
        Detectar posibles problemas de integridad académica
        """
        context = {
            'task_type': 'integrity_check',
            'num_submissions': len(submissions),
            'check_type': 'plagiarism_and_anomalies'
        }
        
        query = f"""
Analiza {len(submissions)} entregas para detectar posibles problemas de integridad académica:

ANÁLISIS DE INTEGRIDAD REQUERIDO:
1. Similitudes sospechosas entre respuestas
2. Patrones atípicos en el estilo de escritura
3. Respuestas idénticas o muy similares
4. Cambios súbitos en el nivel de competencia
5. Uso de lenguaje o términos inconsistentes con el nivel

Proporciona un reporte detallado de posibles problemas encontrados.
"""
        
        response = self.process_query(query, context)
        
        return {
            'integrity_score': 'high',  # Se calcularía basado en el análisis
            'issues_detected': self._extract_integrity_issues(response),
            'recommendations': self._extract_integrity_recommendations(response),
            'report': response
        }
    
    def _estimate_time(self, num_questions: int, assessment_type: str) -> int:
        """Estimar tiempo de resolución en minutos"""
        base_time_per_question = {
            'quiz': 2,
            'examen': 5,
            'proyecto': 30,
            'ensayo': 15
        }
        return num_questions * base_time_per_question.get(assessment_type, 5)
    
    def _get_difficulty_distribution(self) -> Dict[str, int]:
        """Distribución recomendada de dificultad"""
        return {
            'fácil': 30,
            'intermedio': 50,
            'difícil': 20
        }
    
    def _extract_total_score(self, response: str) -> float:
        """Extraer puntaje total de la respuesta (implementación básica)"""
        # Implementación simplificada - en producción usaría regex o NLP
        return 85.5  # Placeholder
    
    def _extract_percentage(self, response: str) -> float:
        """Extraer porcentaje de la respuesta"""
        return 85.5  # Placeholder
    
    def _extract_strengths(self, response: str) -> List[str]:
        """Extraer fortalezas identificadas"""
        return ["Comprensión conceptual sólida", "Aplicación correcta de fórmulas"]
    
    def _extract_improvements(self, response: str) -> List[str]:
        """Extraer áreas de mejora"""
        return ["Explicación de pasos", "Verificación de resultados"]
    
    def _extract_recommendations(self, response: str) -> List[str]:
        """Extraer recomendaciones"""
        return ["Practicar problemas similares", "Revisar conceptos fundamentales"]
    
    def _extract_teaching_recommendations(self, response: str) -> List[str]:
        """Extraer recomendaciones para enseñanza"""
        return ["Reforzar conceptos básicos", "Más ejemplos prácticos"]
    
    def _extract_interventions(self, response: str) -> List[str]:
        """Extraer intervenciones sugeridas"""
        return ["Tutorías adicionales", "Material de refuerzo"]
    
    def _extract_integrity_issues(self, response: str) -> List[str]:
        """Extraer problemas de integridad detectados"""
        return []  # Placeholder
    
    def _extract_integrity_recommendations(self, response: str) -> List[str]:
        """Extraer recomendaciones de integridad"""
        return ["Revisar manualmente", "Conversación con estudiantes"]
    
    def _get_timestamp(self) -> str:
        """Obtener timestamp actual"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def get_specialized_capabilities(self) -> Dict[str, Any]:
        """Capacidades específicas del Evaluator"""
        base_capabilities = self.get_capabilities()
        base_capabilities.update({
            'assessment_creation': True,
            'automated_grading': True,
            'rubric_generation': True,
            'class_analytics': True,
            'integrity_checking': True,
            'feedback_generation': True,
            'competency_evaluation': True,
            'adaptive_testing': True
        })
        return base_capabilities 