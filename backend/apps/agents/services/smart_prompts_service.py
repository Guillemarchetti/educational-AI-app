import re
from typing import List, Dict, Any
import json

class SmartPromptsService:
    """
    Servicio para generar prompts dinámicos basados en el contexto del chat
    """
    
    def __init__(self):
        self.base_prompts = {
            'explanation': [
                'Explica este concepto de manera clara y concisa',
                '¿Puedes simplificar esta idea para que sea más fácil de entender?',
                'Dame una explicación paso a paso de este tema',
                '¿Cuál es la idea principal detrás de esto?',
                'Ayúdame a entender mejor este concepto'
            ],
            'examples': [
                'Dame 3 ejemplos prácticos de este tema',
                '¿Puedes darme ejemplos de la vida real de este concepto?',
                'Muéstrame casos concretos donde se aplica esto',
                'Dame ejemplos que me ayuden a entender mejor'
            ],
            'comparison': [
                'Compara este concepto con otros similares',
                '¿Cuáles son las diferencias principales?',
                '¿En qué se parece y en qué se diferencia de otros conceptos?',
                'Haz una comparación detallada'
            ],
            'application': [
                '¿Cómo se aplica esto en la vida real?',
                '¿Dónde puedo usar este conocimiento?',
                'Dame casos de uso prácticos',
                '¿Cómo puedo aplicar esto en mi día a día?'
            ],
            'visualization': [
                'Crea un diagrama mental de este concepto',
                '¿Puedes visualizar esto de manera gráfica?',
                'Dibuja mentalmente cómo funciona esto',
                'Muéstrame una representación visual'
            ],
            'evaluation': [
                'Evalúa mi comprensión de este concepto',
                '¿Qué tan bien entiendo este tema?',
                'Dame retroalimentación sobre mi aprendizaje',
                '¿En qué áreas puedo mejorar mi comprensión?'
            ],
            'quiz': [
                'Genera un quiz de 5 preguntas sobre esto',
                'Pon a prueba mi conocimiento con preguntas',
                'Crea un test para evaluar mi comprensión',
                'Dame ejercicios tipo quiz para practicar'
            ],
            'reinforcement': [
                'Dame ejercicios prácticos para reforzar este concepto',
                'Necesito más práctica con este tema',
                'Ayúdame a consolidar mi aprendizaje con ejercicios',
                'Dame actividades para reforzar lo que aprendí'
            ]
        }
        
        self.subject_specific_prompts = {
            'mathematics': {
                'step_by_step': 'Resuelve este problema paso a paso',
                'formula_explanation': 'Explica esta fórmula matemática',
                'practice_problems': 'Genera ejercicios similares para practicar',
                'visual_math': 'Crea una representación visual de este problema'
            },
            'science': {
                'experiment_design': 'Diseña un experimento para demostrar esto',
                'scientific_method': 'Aplica el método científico a este tema',
                'hypothesis': 'Formula hipótesis sobre este fenómeno',
                'data_analysis': 'Analiza los datos de este experimento'
            },
            'history': {
                'timeline': 'Crea una línea de tiempo de estos eventos',
                'cause_effect': 'Analiza las causas y consecuencias',
                'historical_context': 'Explica el contexto histórico',
                'compare_eras': 'Compara diferentes épocas históricas'
            },
            'language': {
                'grammar_explanation': 'Explica la gramática de esta frase',
                'vocabulary_building': 'Construye vocabulario relacionado',
                'writing_practice': 'Practica la escritura con este tema',
                'reading_comprehension': 'Mejora la comprensión lectora'
            }
        }
    
    def analyze_context(self, context: List[str]) -> Dict[str, Any]:
        """
        Analiza el contexto para detectar temas, dificultad y tipo de contenido
        """
        if not context:
            return {
                'subject': 'general',
                'difficulty': 'intermediate',
                'content_type': 'text',
                'keywords': [],
                'has_formulas': False,
                'has_diagrams': False,
                'has_examples': False
            }
        
        context_text = ' '.join(context).lower()
        
        # Detectar materia
        subject = 'general'
        if any(word in context_text for word in ['matemática', 'math', 'fórmula', 'ecuación', 'cálculo']):
            subject = 'mathematics'
        elif any(word in context_text for word in ['ciencia', 'science', 'experimento', 'laboratorio', 'física', 'química']):
            subject = 'science'
        elif any(word in context_text for word in ['historia', 'history', 'fecha', 'evento', 'época']):
            subject = 'history'
        elif any(word in context_text for word in ['gramática', 'vocabulario', 'idioma', 'lenguaje']):
            subject = 'language'
        
        # Detectar dificultad
        difficulty = 'intermediate'
        if any(word in context_text for word in ['básico', 'simple', 'introductorio', 'principiante']):
            difficulty = 'beginner'
        elif any(word in context_text for word in ['avanzado', 'complejo', 'difícil', 'experto']):
            difficulty = 'advanced'
        
        # Detectar tipo de contenido
        has_formulas = bool(re.search(r'[=+\-*/()]', context_text))
        has_diagrams = any(word in context_text for word in ['diagrama', 'gráfico', 'figura', 'imagen'])
        has_examples = any(word in context_text for word in ['ejemplo', 'caso', 'ejercicio'])
        
        # Extraer palabras clave
        keywords = self._extract_keywords(context_text)
        
        return {
            'subject': subject,
            'difficulty': difficulty,
            'content_type': 'text',
            'keywords': keywords,
            'has_formulas': has_formulas,
            'has_diagrams': has_diagrams,
            'has_examples': has_examples
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """
        Extrae palabras clave del texto
        """
        # Palabras comunes a ignorar
        stop_words = {'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'pero', 'sus', 'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'están', 'estado', 'desde', 'todo', 'nos', 'durante', 'todos', 'podemos', 'después', 'otros', 'entonces', 'ellas', 'ellos', 'así', 'mismo', 'muy', 'sin', 'sobre', 'este', 'entre', 'cuando', 'todo', 'esta', 'ser', 'son', 'dos', 'también', 'era', 'años', 'más', 'ante', 'contra', 'bajo', 'cabe', 'con', 'entre', 'hacia', 'hasta', 'para', 'por', 'según', 'sin', 'sobre', 'tras', 'durante', 'mediante', 'según', 'vía', 'versus', 'vía'}
        
        # Extraer palabras de 3+ caracteres que no sean stop words
        words = re.findall(r'\b[a-záéíóúñ]{3,}\b', text)
        keywords = [word for word in words if word not in stop_words]
        
        # Contar frecuencia y devolver las más comunes
        from collections import Counter
        word_counts = Counter(keywords)
        return [word for word, count in word_counts.most_common(10)]
    
    def generate_dynamic_prompts(self, context: List[str], max_prompts: int = 8) -> List[Dict[str, Any]]:
        """
        Genera prompts dinámicos basados en el contexto
        """
        analysis = self.analyze_context(context)
        
        prompts = []
        
        # Agregar prompts base
        for category, base_prompts in self.base_prompts.items():
            # Seleccionar el prompt más apropiado para el contexto
            selected_prompt = self._select_best_prompt(base_prompts, analysis)
            prompts.append({
                'id': f'{category}_base',
                'text': selected_prompt,
                'category': category,
                'priority': 1,
                'contextual': False
            })
        
        # Agregar prompts específicos de la materia
        if analysis['subject'] in self.subject_specific_prompts:
            subject_prompts = self.subject_specific_prompts[analysis['subject']]
            for prompt_id, prompt_text in subject_prompts.items():
                prompts.append({
                    'id': f'{analysis["subject"]}_{prompt_id}',
                    'text': prompt_text,
                    'category': 'subject_specific',
                    'priority': 2,
                    'contextual': True,
                    'subject': analysis['subject']
                })
        
        # Agregar prompts basados en características del contenido
        if analysis['has_formulas']:
            prompts.append({
                'id': 'formula_explanation',
                'text': 'Explica esta fórmula paso a paso',
                'category': 'mathematics',
                'priority': 3,
                'contextual': True
            })
        
        if analysis['has_diagrams']:
            prompts.append({
                'id': 'diagram_analysis',
                'text': 'Analiza este diagrama en detalle',
                'category': 'visualization',
                'priority': 3,
                'contextual': True
            })
        
        if analysis['has_examples']:
            prompts.append({
                'id': 'more_examples',
                'text': 'Dame más ejemplos similares',
                'category': 'examples',
                'priority': 2,
                'contextual': True
            })
        
        # Ordenar por prioridad y limitar cantidad
        prompts.sort(key=lambda x: x['priority'], reverse=True)
        return prompts[:max_prompts]
    
    def _select_best_prompt(self, prompt_list: List[str], analysis: Dict[str, Any]) -> str:
        """
        Selecciona el mejor prompt de una lista basado en el análisis del contexto
        """
        # Por ahora, seleccionar el primero, pero aquí se podría implementar
        # lógica más sofisticada basada en el análisis
        return prompt_list[0]
    
    def get_prompt_metadata(self, context: List[str]) -> Dict[str, Any]:
        """
        Obtiene metadatos sobre los prompts generados
        """
        analysis = self.analyze_context(context)
        prompts = self.generate_dynamic_prompts(context)
        
        return {
            'total_prompts': len(prompts),
            'contextual_prompts': len([p for p in prompts if p.get('contextual', False)]),
            'subject': analysis['subject'],
            'difficulty': analysis['difficulty'],
            'keywords': analysis['keywords'],
            'content_features': {
                'has_formulas': analysis['has_formulas'],
                'has_diagrams': analysis['has_diagrams'],
                'has_examples': analysis['has_examples']
            }
        } 