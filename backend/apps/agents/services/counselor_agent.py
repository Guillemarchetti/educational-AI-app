"""
Agente Counselor - Especializado en apoyo estudiantil y orientación académica
"""

from typing import Dict, Any, List
from .ai_service import BaseAIService

class CounselorAgent(BaseAIService):
    """
    Agente Counselor especializado en apoyo estudiantil y orientación académica.
    
    Capacidades:
    - Orientación académica personalizada
    - Apoyo emocional y motivacional
    - Planificación de carrera educativa
    - Identificación de problemas de aprendizaje
    - Estrategias de estudio efectivas
    - Manejo de estrés académico
    - Desarrollo de habilidades sociales
    """
    
    def get_agent_name(self) -> str:
        """Nombre del agente"""
        return "Counselor - Apoyo Estudiantil"
    
    def get_system_prompt(self) -> str:
        """Prompt del sistema para el Counselor"""
        return """
Eres un Consejero Académico y de Apoyo Estudiantil especializado en orientación educativa integral.

## TU IDENTIDAD Y PROPÓSITO
- Consejero académico con expertise en desarrollo estudiantil y apoyo psicopedagógico
- Te especializas en ayudar a estudiantes a alcanzar su máximo potencial académico y personal
- Tu enfoque es holístico: académico, emocional, social y de desarrollo personal
- Proporcionas apoyo empático y estrategias prácticas para el éxito estudiantil

## CAPACIDADES PRINCIPALES

### 1. ORIENTACIÓN ACADÉMICA
- Planificación de rutas académicas personalizadas
- Selección de cursos y especializaciones
- Establecimiento de metas académicas SMART
- Estrategias para mejorar el rendimiento académico
- Preparación para transiciones educativas

### 2. APOYO EMOCIONAL Y MOTIVACIONAL
- Manejo de ansiedad y estrés académico
- Desarrollo de autoestima y confianza
- Motivación y superación de obstáculos
- Técnicas de autorregulación emocional
- Prevención del burnout estudiantil

### 3. DESARROLLO DE HABILIDADES DE ESTUDIO
- Técnicas de estudio personalizadas
- Gestión efectiva del tiempo
- Estrategias de memorización y comprensión
- Organización y planificación académica
- Preparación para exámenes y evaluaciones

### 4. ORIENTACIÓN VOCACIONAL Y DE CARRERA
- Exploración de intereses y aptitudes
- Información sobre carreras y profesiones
- Planificación de futuro académico y profesional
- Desarrollo de competencias transversales
- Conexión entre estudios y objetivos de vida

### 5. APOYO EN DIFICULTADES DE APRENDIZAJE
- Identificación de barreras de aprendizaje
- Estrategias de adaptación académica
- Recursos de apoyo especializado
- Técnicas de estudio diferenciadas
- Accommodaciones académicas apropiadas

### 6. DESARROLLO PERSONAL Y SOCIAL
- Habilidades de comunicación interpersonal
- Trabajo en equipo y colaboración
- Liderazgo estudiantil y participación
- Equilibrio vida-estudio
- Desarrollo de resiliencia académica

## PRINCIPIOS DE INTERVENCIÓN

### ENFOQUE CENTRADO EN EL ESTUDIANTE
- Respeta la autonomía y decisiones del estudiante
- Adapta el apoyo a necesidades individuales
- Fomenta el autodescubrimiento y la reflexión
- Valora la diversidad y diferencias individuales

### APOYO INTEGRAL Y HOLÍSTICO
- Considera factores académicos, emocionales y sociales
- Conecta el bienestar personal con el éxito académico
- Aborda problemas de manera multidimensional
- Promueve el desarrollo integral del estudiante

### EMPODERAMIENTO Y AUTODETERMINACIÓN
- Desarrolla capacidades de autogestion y autonomía
- Fomenta la toma de decisiones informadas
- Enseña estrategias de autorregulación
- Promueve la responsabilidad personal

### PREVENCIÓN Y DESARROLLO
- Anticipa y previene problemas académicos
- Desarrolla factores protectores del éxito
- Fortalece recursos personales y sociales
- Promueve el crecimiento continuo

## PROTOCOLO DE INTERVENCIÓN
1. Escucha activa y comprensión empática
2. Evaluación integral de necesidades y recursos
3. Colaboración en el establecimiento de objetivos
4. Desarrollo de estrategias personalizadas
5. Seguimiento y ajuste continuo del apoyo
6. Referencia a recursos especializados cuando sea necesario

## ESTILO DE COMUNICACIÓN
- Empático, comprensivo y no enjuiciatorio
- Motivador y esperanzador
- Claro y accesible
- Respetuoso de la confidencialidad
- Orientado a soluciones y fortalezas

Siempre mantén un ambiente de seguridad emocional y confianza que facilite el crecimiento y desarrollo del estudiante.
"""

    def provide_academic_guidance(self, student_profile: Dict[str, Any], 
                                current_challenges: List[str]) -> Dict[str, Any]:
        """
        Proporcionar orientación académica personalizada
        
        Args:
            student_profile: Perfil del estudiante (nivel, intereses, fortalezas, etc.)
            current_challenges: Lista de desafíos actuales del estudiante
        """
        context = {
            'task_type': 'academic_guidance',
            'student_level': student_profile.get('level', 'unknown'),
            'num_challenges': len(current_challenges),
            'guidance_focus': 'academic_planning'
        }
        
        profile_summary = f"""
PERFIL DEL ESTUDIANTE:
- Nivel académico: {student_profile.get('level', 'No especificado')}
- Área de interés: {student_profile.get('interests', 'No especificada')}
- Fortalezas: {', '.join(student_profile.get('strengths', ['Por identificar']))}
- Objetivos académicos: {student_profile.get('goals', 'Por definir')}

DESAFÍOS ACTUALES:
{chr(10).join([f"- {challenge}" for challenge in current_challenges])}
"""
        
        query = f"""
Proporciona orientación académica integral para este estudiante:

{profile_summary}

ORIENTACIÓN REQUERIDA:
1. Análisis de la situación académica actual
2. Recomendaciones específicas para abordar cada desafío
3. Plan de acción académico a corto y mediano plazo
4. Estrategias de estudio personalizadas
5. Recursos y apoyos recomendados
6. Metas académicas SMART sugeridas
7. Seguimiento y evaluación del progreso

Enfócate en empoderar al estudiante con estrategias prácticas y motivación positiva.
"""
        
        response = self.process_query(query, context)
        
        return {
            'guidance_type': 'academic_guidance',
            'student_profile': student_profile,
            'challenges_addressed': current_challenges,
            'recommendations': response,
            'action_plan': self._extract_action_plan(response),
            'resources': self._extract_recommended_resources(response),
            'follow_up_date': self._suggest_follow_up_date()
        }
    
    def provide_emotional_support(self, emotional_state: str, 
                                stress_level: int, situation: str) -> Dict[str, Any]:
        """
        Proporcionar apoyo emocional y estrategias de manejo del estrés
        
        Args:
            emotional_state: Estado emocional actual (ansioso, desmotivado, etc.)
            stress_level: Nivel de estrés (1-10)
            situation: Descripción de la situación que causa estrés
        """
        context = {
            'task_type': 'emotional_support',
            'emotional_state': emotional_state,
            'stress_level': stress_level,
            'support_focus': 'emotional_regulation'
        }
        
        query = f"""
Proporciona apoyo emocional y estrategias para esta situación:

ESTADO EMOCIONAL: {emotional_state}
NIVEL DE ESTRÉS: {stress_level}/10
SITUACIÓN: {situation}

APOYO REQUERIDO:
1. Validación y normalización de emociones
2. Estrategias inmediatas de autorregulación
3. Técnicas de manejo del estrés específicas
4. Perspectivas positivas y reencuadre cognitivo
5. Plan de autocuidado personalizado
6. Recursos de apoyo adicionales
7. Señales de alerta para buscar ayuda profesional

Proporciona apoyo empático, práctico y esperanzador que empodere al estudiante.
"""
        
        response = self.process_query(query, context)
        
        return {
            'support_type': 'emotional_support',
            'emotional_state': emotional_state,
            'stress_level': stress_level,
            'coping_strategies': self._extract_coping_strategies(response),
            'self_care_plan': self._extract_self_care_plan(response),
            'emergency_resources': self._get_emergency_resources(),
            'response': response
        }
    
    def develop_study_strategies(self, learning_style: str, subject_difficulties: List[str],
                               available_time: int) -> Dict[str, Any]:
        """
        Desarrollar estrategias de estudio personalizadas
        
        Args:
            learning_style: Estilo de aprendizaje preferido
            subject_difficulties: Materias con dificultades
            available_time: Horas disponibles para estudio por día
        """
        context = {
            'task_type': 'study_strategies',
            'learning_style': learning_style,
            'num_difficulties': len(subject_difficulties),
            'time_available': available_time
        }
        
        query = f"""
Desarrolla estrategias de estudio personalizadas:

ESTILO DE APRENDIZAJE: {learning_style}
MATERIAS CON DIFICULTADES: {', '.join(subject_difficulties)}
TIEMPO DISPONIBLE DIARIO: {available_time} horas

ESTRATEGIAS REQUERIDAS:
1. Técnicas de estudio adaptadas al estilo de aprendizaje
2. Cronograma de estudio realista y equilibrado
3. Métodos específicos para cada materia difícil
4. Técnicas de memorización y comprensión
5. Estrategias de preparación para exámenes
6. Herramientas y recursos de estudio recomendados
7. Sistema de seguimiento del progreso

Crea un plan integral que sea prático, realista y efectivo.
"""
        
        response = self.process_query(query, context)
        
        return {
            'strategy_type': 'study_strategies',
            'learning_style': learning_style,
            'study_schedule': self._create_study_schedule(available_time),
            'subject_strategies': self._extract_subject_strategies(response),
            'tools_recommended': self._extract_recommended_tools(response),
            'response': response
        }
    
    def career_orientation(self, interests: List[str], strengths: List[str], 
                          academic_level: str) -> Dict[str, Any]:
        """
        Proporcionar orientación vocacional y de carrera
        
        Args:
            interests: Lista de intereses del estudiante
            strengths: Fortalezas identificadas
            academic_level: Nivel académico actual
        """
        context = {
            'task_type': 'career_orientation',
            'academic_level': academic_level,
            'num_interests': len(interests),
            'num_strengths': len(strengths)
        }
        
        query = f"""
Proporciona orientación vocacional y de carrera:

INTERESES: {', '.join(interests)}
FORTALEZAS: {', '.join(strengths)}
NIVEL ACADÉMICO: {academic_level}

ORIENTACIÓN REQUERIDA:
1. Análisis de compatibilidad intereses-fortalezas
2. Carreras y profesiones recomendadas
3. Rutas académicas sugeridas
4. Competencias a desarrollar
5. Experiencias recomendadas (prácticas, voluntariado)
6. Información del mercado laboral relevante
7. Próximos pasos para exploración vocacional

Proporciona orientación realista, inspiradora y con opciones diversas.
"""
        
        response = self.process_query(query, context)
        
        return {
            'orientation_type': 'career_guidance',
            'recommended_careers': self._extract_career_recommendations(response),
            'academic_paths': self._extract_academic_paths(response),
            'skills_to_develop': self._extract_skills_development(response),
            'next_steps': self._extract_next_steps(response),
            'response': response
        }
    
    def identify_learning_barriers(self, academic_performance: Dict[str, Any],
                                 study_habits: Dict[str, Any]) -> Dict[str, Any]:
        """
        Identificar barreras de aprendizaje y proponer intervenciones
        
        Args:
            academic_performance: Datos de rendimiento académico
            study_habits: Información sobre hábitos de estudio
        """
        context = {
            'task_type': 'learning_barriers',
            'performance_data': 'academic_analysis',
            'assessment_focus': 'barrier_identification'
        }
        
        performance_summary = f"""
RENDIMIENTO ACADÉMICO:
- Promedio general: {academic_performance.get('average', 'No disponible')}
- Materias con mejor desempeño: {', '.join(academic_performance.get('strengths', []))}
- Materias con dificultades: {', '.join(academic_performance.get('difficulties', []))}

HÁBITOS DE ESTUDIO:
- Horas de estudio diarias: {study_habits.get('daily_hours', 'No especificado')}
- Ambiente de estudio: {study_habits.get('environment', 'No especificado')}
- Técnicas utilizadas: {', '.join(study_habits.get('techniques', []))}
- Consistencia: {study_habits.get('consistency', 'No especificada')}
"""
        
        query = f"""
Analiza las barreras de aprendizaje y propone intervenciones:

{performance_summary}

ANÁLISIS REQUERIDO:
1. Identificación de patrones en el rendimiento
2. Barreras de aprendizaje potenciales
3. Factores que afectan el estudio efectivo
4. Intervenciones específicas recomendadas
5. Adaptaciones académicas sugeridas
6. Recursos de apoyo especializado
7. Plan de seguimiento y evaluación

Enfócate en soluciones prácticas y empoderadoras.
"""
        
        response = self.process_query(query, context)
        
        return {
            'analysis_type': 'learning_barriers',
            'identified_barriers': self._extract_learning_barriers(response),
            'interventions': self._extract_interventions(response),
            'accommodations': self._extract_accommodations(response),
            'specialist_referrals': self._extract_referrals(response),
            'response': response
        }
    
    # Métodos auxiliares para extracción de información
    def _extract_action_plan(self, response: str) -> List[Dict[str, str]]:
        """Extraer plan de acción de la respuesta"""
        return [
            {'step': 1, 'action': 'Establecer metas específicas', 'timeline': '1 semana'},
            {'step': 2, 'action': 'Implementar técnicas de estudio', 'timeline': '2 semanas'}
        ]
    
    def _extract_recommended_resources(self, response: str) -> List[str]:
        """Extraer recursos recomendados"""
        return ["Biblioteca de la institución", "Grupos de estudio", "Tutorías"]
    
    def _suggest_follow_up_date(self) -> str:
        """Sugerir fecha de seguimiento"""
        from datetime import datetime, timedelta
        next_week = datetime.now() + timedelta(weeks=2)
        return next_week.strftime("%Y-%m-%d")
    
    def _extract_coping_strategies(self, response: str) -> List[str]:
        """Extraer estrategias de afrontamiento"""
        return ["Técnicas de respiración", "Ejercicio regular", "Organización del tiempo"]
    
    def _extract_self_care_plan(self, response: str) -> Dict[str, Any]:
        """Extraer plan de autocuidado"""
        return {
            'physical': ['Ejercicio 30 min/día', 'Dormir 7-8 horas'],
            'emotional': ['Journaling', 'Mindfulness'],
            'social': ['Tiempo con amigos', 'Actividades grupales']
        }
    
    def _get_emergency_resources(self) -> List[Dict[str, str]]:
        """Obtener recursos de emergencia"""
        return [
            {'name': 'Línea de crisis', 'contact': '800-123-4567', 'availability': '24/7'},
            {'name': 'Consejería institucional', 'contact': 'counseling@institution.edu', 'availability': 'Lun-Vie 9-17h'}
        ]
    
    def _create_study_schedule(self, available_hours: int) -> Dict[str, Any]:
        """Crear horario de estudio"""
        return {
            'total_daily_hours': available_hours,
            'study_blocks': ['9:00-11:00', '14:00-16:00', '19:00-20:00'],
            'break_intervals': 15,
            'weekly_review': 'Domingos 10:00-12:00'
        }
    
    def _extract_subject_strategies(self, response: str) -> Dict[str, List[str]]:
        """Extraer estrategias por materia"""
        return {
            'matemáticas': ['Práctica diaria', 'Resolver problemas paso a paso'],
            'historia': ['Líneas de tiempo', 'Mapas conceptuales']
        }
    
    def _extract_recommended_tools(self, response: str) -> List[str]:
        """Extraer herramientas recomendadas"""
        return ["Anki para memorización", "Pomodoro Timer", "Notion para organización"]
    
    def _extract_career_recommendations(self, response: str) -> List[Dict[str, str]]:
        """Extraer recomendaciones de carrera"""
        return [
            {'career': 'Ingeniería de Software', 'match': '85%', 'reason': 'Compatibilidad alta con intereses tecnológicos'},
            {'career': 'Diseño UX/UI', 'match': '78%', 'reason': 'Combina creatividad y tecnología'}
        ]
    
    def _extract_academic_paths(self, response: str) -> List[str]:
        """Extraer rutas académicas"""
        return ["Licenciatura en Ciencias de la Computación", "Ingeniería en Sistemas"]
    
    def _extract_skills_development(self, response: str) -> List[str]:
        """Extraer habilidades a desarrollar"""
        return ["Programación", "Pensamiento analítico", "Comunicación efectiva"]
    
    def _extract_next_steps(self, response: str) -> List[str]:
        """Extraer próximos pasos"""
        return ["Investigar universidades", "Hacer shadowing profesional", "Tomar cursos online"]
    
    def _extract_learning_barriers(self, response: str) -> List[str]:
        """Extraer barreras de aprendizaje identificadas"""
        return ["Dificultades de concentración", "Falta de organización", "Ansiedad ante exámenes"]
    
    def _extract_interventions(self, response: str) -> List[str]:
        """Extraer intervenciones recomendadas"""
        return ["Técnicas de mindfulness", "Planificador académico", "Estrategias anti-ansiedad"]
    
    def _extract_accommodations(self, response: str) -> List[str]:
        """Extraer acomodaciones académicas"""
        return ["Tiempo extra en exámenes", "Ambiente libre de distracciones"]
    
    def _extract_referrals(self, response: str) -> List[str]:
        """Extraer referencias a especialistas"""
        return ["Psicólogo educativo", "Tutor especializado en TDAH"]
    
    def get_specialized_capabilities(self) -> Dict[str, Any]:
        """Capacidades específicas del Counselor"""
        base_capabilities = self.get_capabilities()
        base_capabilities.update({
            'academic_guidance': True,
            'emotional_support': True,
            'study_strategies': True,
            'career_orientation': True,
            'learning_barriers_assessment': True,
            'crisis_intervention': True,
            'student_development': True,
            'motivational_coaching': True
        })
        return base_capabilities 