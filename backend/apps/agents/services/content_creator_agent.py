"""
Agente Creador de Contenido Interactivo
Especializado en generar ejercicios y simulaciones matemáticas interactivas.
"""

from typing import Dict, Any, List
from .ai_service import BaseAIService
import json

class ContentCreatorAgent(BaseAIService):
    """
    Agente especializado en crear contenido interactivo para matemáticas.
    
    Capacidades:
    - Generar ejercicios interactivos basados en contexto
    - Crear simulaciones matemáticas
    - Diseñar actividades gamificadas
    - Generar prompts para simulaciones específicas
    - Adaptar contenido al nivel educativo
    """
    
    def get_agent_name(self) -> str:
        """Nombre del agente"""
        return "Creador de Contenido Interactivo"
    
    def get_system_prompt(self) -> str:
        """Prompt del sistema para el Creador de Contenido"""
        return """
Eres un Creador de Contenido Interactivo especializado en matemáticas. Tu misión es transformar conceptos matemáticos en experiencias de aprendizaje interactivas, simulaciones y ejercicios gamificados.

## TUS CAPACIDADES PRINCIPALES:

### 🎮 CREACIÓN DE CONTENIDO INTERACTIVO
- Diseñar simulaciones matemáticas interactivas
- Crear ejercicios gamificados y atractivos
- Generar actividades hands-on para conceptos abstractos
- Desarrollar experiencias de aprendizaje inmersivas

### 🧮 ESPECIALIZACIÓN MATEMÁTICA
- Álgebra: Ecuaciones, funciones, gráficas interactivas
- Geometría: Construcciones, transformaciones, visualizaciones 3D
- Cálculo: Derivadas, integrales, límites animados
- Estadística: Simulaciones de datos, probabilidades interactivas
- Aritmética: Operaciones visuales, fracciones manipulables

### 🎯 GENERACIÓN DE SIMULACIONES
- Crear prompts detallados para simulaciones específicas
- Definir parámetros interactivos y variables
- Establecer objetivos de aprendizaje claros
- Incluir elementos de gamificación y retroalimentación

### 📊 VISUALIZACIÓN DE DATOS
- Gráficas interactivas y manipulables
- Representaciones visuales de conceptos abstractos
- Animaciones paso a paso de procesos matemáticos
- Herramientas de exploración matemática

## TIPOS DE CONTENIDO QUE PUEDES CREAR:

### 🎲 SIMULACIONES INTERACTIVAS
1. **Manipuladores Virtuales**: Bloques algebraicos, fracciones visuales
2. **Laboratorios Matemáticos**: Exploración de funciones, geometría dinámica
3. **Juegos Educativos**: Desafíos matemáticos, competencias numéricas
4. **Experimentos Probabilísticos**: Simulaciones de Monte Carlo, distribuciones

### 🔧 HERRAMIENTAS INTERACTIVAS
1. **Calculadoras Especializadas**: Gráficas, matrices, estadísticas
2. **Constructores Geométricos**: Regla y compás virtuales
3. **Exploradores de Funciones**: Manipulación de parámetros en tiempo real
4. **Simuladores de Problemas**: Contextos del mundo real interactivos

## ESTRUCTURA DE RESPUESTA PARA SIMULACIONES:

### FORMATO ESTÁNDAR:
```json
{
  "titulo": "Nombre de la simulación",
  "concepto_matematico": "Concepto principal",
  "nivel_educativo": "Grado/Nivel apropiado",
  "objetivos_aprendizaje": ["objetivo1", "objetivo2"],
  "descripcion_simulacion": "Descripción detallada",
  "elementos_interactivos": ["elemento1", "elemento2"],
  "prompt_generacion": "Prompt específico para crear la simulación",
  "parametros_configurables": ["param1", "param2"],
  "mecanica_gamificacion": "Sistema de puntos/logros",
  "retroalimentacion": "Tipo de feedback proporcionado"
}
```

## INSTRUCCIONES ESPECÍFICAS:

### CUANDO GENERES CONTENIDO:
1. **ANALIZA** el contexto matemático proporcionado
2. **IDENTIFICA** el concepto central a enseñar
3. **DISEÑA** la mecánica interactiva apropiada
4. **CREA** el prompt detallado para la simulación
5. **INCLUYE** elementos de gamificación y motivación

### PRINCIPIOS DE DISEÑO:
- **Interactividad Significativa**: Cada interacción debe tener propósito educativo
- **Progresión Gradual**: De simple a complejo, paso a paso
- **Feedback Inmediato**: Respuesta instantánea a las acciones del usuario
- **Múltiples Representaciones**: Visual, numérica, algebraica, gráfica
- **Conexión con la Realidad**: Contextos auténticos y relevantes

### ADAPTACIÓN POR NIVEL:
- **Primaria (6-12 años)**: Visual, manipulativo, lúdico
- **Secundaria (13-15 años)**: Exploración guiada, descubrimiento
- **Preparatoria (16-18 años)**: Análisis profundo, aplicaciones reales
- **Universidad (18+ años)**: Modelado avanzado, investigación

¡Tu objetivo es hacer que las matemáticas cobren vida a través de experiencias interactivas memorables!
"""
    
    def process_specialized_query(self, query: str, context: Dict[str, Any]) -> str:
        """
        Procesamiento especializado para creación de contenido interactivo.
        """
        # Extraer información del contexto matemático
        math_context = self._extract_math_context(context)
        
        # Identificar tipo de contenido a crear
        content_type = self._identify_content_type(query)
        
        # Generar contenido específico según el tipo
        if content_type == 'simulacion':
            return self._generate_simulation_design(query, math_context)
        elif content_type == 'ejercicio_interactivo':
            return self._generate_interactive_exercise(query, math_context)
        elif content_type == 'juego_matematico':
            return self._generate_math_game(query, math_context)
        else:
            return self._generate_general_interactive_content(query, math_context)
    
    def _extract_math_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Extraer contexto matemático específico del contexto de documentos"""
        # Obtener contexto explícito (documentos seleccionados)
        explicit_context = context.get('explicit_context', '')
        relevant_documents = context.get('relevant_documents', [])
        
        # Extraer conceptos matemáticos del contexto
        extracted_concept = self._extract_concept_from_context(explicit_context, relevant_documents)
        
        return {
            'nivel_educativo': context.get('user_level', 'Secundaria'),
            'tema_matematico': extracted_concept or context.get('subject', 'Matemáticas Generales'),
            'documentos_referencia': relevant_documents,
            'contexto_explicito': explicit_context,
            'dificultad': context.get('difficulty', 'intermedio'),
            'estilo_aprendizaje': context.get('learning_style', 'visual-kinestésico')
        }
    
    def _extract_concept_from_context(self, explicit_context: str, documents: List[str]) -> str:
        """Extraer concepto matemático específico del contexto de documentos"""
        # Combinar todo el contexto disponible
        full_context = explicit_context + " " + " ".join(str(doc) for doc in documents)
        
        # Conceptos matemáticos comunes a buscar
        math_concepts = {
            'funciones lineales': ['función lineal', 'pendiente', 'ordenada al origen', 'y = mx + b', 'recta'],
            'ecuaciones cuadráticas': ['ecuación cuadrática', 'parábola', 'ax² + bx + c', 'discriminante'],
            'fracciones': ['fracción', 'numerador', 'denominador', 'equivalente', 'simplificar'],
            'geometría plana': ['triángulo', 'círculo', 'área', 'perímetro', 'ángulo'],
            'estadística': ['media', 'mediana', 'moda', 'datos', 'gráfica', 'distribución'],
            'probabilidad': ['probabilidad', 'evento', 'muestra', 'azar', 'frecuencia'],
            'trigonometría': ['seno', 'coseno', 'tangente', 'ángulo', 'triángulo rectángulo'],
            'álgebra': ['variable', 'ecuación', 'expresión', 'término', 'coeficiente'],
            'cálculo': ['derivada', 'integral', 'límite', 'función', 'continuidad'],
            'números enteros': ['entero', 'positivo', 'negativo', 'suma', 'resta']
        }
        
        # Buscar coincidencias en el contexto
        context_lower = full_context.lower()
        for concept, keywords in math_concepts.items():
            if any(keyword in context_lower for keyword in keywords):
                return concept.title()
        
        # Si no encuentra conceptos específicos, intentar extraer de títulos o encabezados
        import re
        
        # Buscar patrones como "Módulo X: Concepto" o "Tema: Concepto"
        patterns = [
            r'módulo\s+\d+[:\-]\s*([^.\n]+)',
            r'tema[:\-]\s*([^.\n]+)',
            r'capítulo[:\-]\s*([^.\n]+)',
            r'unidad[:\-]\s*([^.\n]+)',
            r'lección[:\-]\s*([^.\n]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, context_lower)
            if match:
                extracted = match.group(1).strip().title()
                if len(extracted) > 3:  # Evitar extracciones muy cortas
                    return extracted
        
        # Fallback: buscar conceptos en mayúsculas o con formato especial
        concept_pattern = r'([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)'
        matches = re.findall(concept_pattern, full_context)
        if matches:
            # Filtrar palabras comunes y quedarse con conceptos matemáticos
            math_words = ['Matemática', 'Función', 'Ecuación', 'Geometría', 'Álgebra', 'Cálculo']
            for match in matches:
                if any(word in match for word in math_words):
                    return match
        
        return None
    
    def process_specialized_query(self, query: str, context: Dict[str, Any]) -> str:
        """
        Procesamiento especializado para creación de contenido interactivo.
        """
        # Extraer información del contexto matemático
        math_context = self._extract_math_context(context)
        
        # Identificar tipo de contenido a crear
        content_type = self._identify_content_type(query)
        
        # Generar contenido específico según el tipo
        if content_type == 'simulacion':
            return self._generate_simulation_design(query, math_context)
        elif content_type == 'ejercicio_interactivo':
            return self._generate_interactive_exercise(query, math_context)
        elif content_type == 'juego_matematico':
            return self._generate_math_game(query, math_context)
        else:
            return self._generate_general_interactive_content(query, math_context)
    
    def _identify_content_type(self, query: str) -> str:
        """Identificar qué tipo de contenido crear"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['simulación', 'simular', 'laboratorio', 'experimento']):
            return 'simulacion'
        elif any(word in query_lower for word in ['juego', 'gamificar', 'competencia', 'desafío']):
            return 'juego_matematico'
        elif any(word in query_lower for word in ['ejercicio', 'práctica', 'actividad']):
            return 'ejercicio_interactivo'
        else:
            return 'contenido_general'
    
    def generate_simulation_prompt(self, concept: str, level: str, context_docs: List[str] = None) -> Dict[str, Any]:
        """
        Generar prompt específico para crear una simulación matemática.
        """
        simulation_design = {
            "titulo": f"Simulación Interactiva: {concept}",
            "concepto_matematico": concept,
            "nivel_educativo": level,
            "prompt_generacion": self._create_detailed_prompt(concept, level),
            "elementos_interactivos": self._define_interactive_elements(concept),
            "recursos_adicionales": context_docs or []
        }
        
        return simulation_design
    
    def _create_detailed_prompt(self, concept: str, level: str) -> str:
        """Crear prompt detallado para generar la simulación"""
        return f"""
PROMPT PARA SIMULACIÓN MATEMÁTICA INTERACTIVA:

CONCEPTO: {concept}
NIVEL: {level}

INSTRUCCIONES PARA EL DESARROLLADOR:

1. INTERFAZ PRINCIPAL:
   - Crear una interfaz limpia y intuitiva
   - Usar colores matemáticamente apropiados
   - Incluir título claro y instrucciones breves
   - Diseñar para dispositivos táctiles y desktop

2. ELEMENTOS INTERACTIVOS:
   {chr(10).join(f'   - {element}' for element in self._define_interactive_elements(concept))}

3. MECÁNICA DE INTERACCIÓN:
   - Respuesta inmediata a cambios (< 100ms)
   - Animaciones suaves para transiciones
   - Feedback visual claro para acciones del usuario

OBJETIVO FINAL: Crear una experiencia que haga que los estudiantes digan "¡Ahora entiendo!"
"""
    
    def _define_interactive_elements(self, concept: str) -> List[str]:
        """Definir elementos interactivos específicos"""
        elements_map = {
            'funciones_lineales': [
                'Sliders para pendiente (m) y ordenada (b)',
                'Plano cartesiano interactivo',
                'Tabla de valores dinámica'
            ],
            'geometria_plana': [
                'Herramientas de construcción virtuales',
                'Puntos y líneas arrastrables',
                'Medidor de ángulos dinámico'
            ]
        }
        
        concept_key = concept.lower().replace(' ', '_')
        return elements_map.get(concept_key, [
            'Controles interactivos principales',
            'Visualización dinámica',
            'Herramientas de medición'
        ])
    
    def _generate_simulation_design(self, query: str, math_context: Dict[str, Any]) -> str:
        """Generar diseño completo de simulación"""
        concept = math_context.get('tema_matematico', 'Concepto Matemático')
        level = math_context.get('nivel_educativo', 'Secundaria')
        
        simulation_design = self.generate_simulation_prompt(concept, level)
        
        # Convertir el diseño a formato JSON legible
        design_json = json.dumps(simulation_design, indent=2, ensure_ascii=False)
        
        return f"""
## 🎮 DISEÑO DE SIMULACIÓN INTERACTIVA

He creado un diseño completo para una simulación matemática interactiva basada en tu consulta:

{design_json}

## 🚀 PRÓXIMOS PASOS PARA IMPLEMENTACIÓN:

1. **Desarrollo Frontend**: Usar el prompt detallado para implementar la interfaz
2. **Lógica Matemática**: Programar los cálculos y validaciones
3. **Interactividad**: Implementar los elementos interactivos definidos
4. **Gamificación**: Agregar el sistema de recompensas y logros
5. **Testing**: Probar con estudiantes del nivel objetivo

## 💡 SUGERENCIAS ADICIONALES:

- Considera usar bibliotecas como GeoGebra, Desmos, o D3.js
- Implementa analytics para medir el engagement
- Incluye opciones de accesibilidad
- Permite exportar/compartir creaciones de los estudiantes

¿Te gustaría que desarrolle algún aspecto específico de esta simulación o que cree diseños para otros conceptos matemáticos?
"""
    
    def _generate_interactive_exercise(self, query: str, math_context: Dict[str, Any]) -> str:
        """Generar ejercicio interactivo específico"""
        return self.process_query(f"""
        Crear un ejercicio interactivo basado en: {query}
        
        Contexto: {math_context}
        
        El ejercicio debe incluir:
        1. Mecánica interactiva clara
        2. Retroalimentación inmediata
        3. Múltiples niveles de dificultad
        4. Elementos visuales atractivos
        5. Sistema de puntuación
        """, math_context)
    
    def _generate_math_game(self, query: str, math_context: Dict[str, Any]) -> str:
        """Generar juego matemático gamificado"""
        return self.process_query(f"""
        Diseñar un juego matemático basado en: {query}
        
        Contexto: {math_context}
        
        El juego debe incluir:
        1. Mecánicas de juego atractivas
        2. Progresión de niveles
        3. Sistema de recompensas
        4. Competencia saludable
        5. Aprendizaje implícito del concepto
        """, math_context)
    
    def _generate_general_interactive_content(self, query: str, math_context: Dict[str, Any]) -> str:
        """Generar contenido interactivo general"""
        return self.process_query(f"""
        Crear contenido interactivo matemático para: {query}
        
        Contexto: {math_context}
        
        Incluir:
        1. Elementos interactivos apropiados
        2. Objetivos de aprendizaje claros
        3. Actividades hands-on
        4. Conexiones con la vida real
        5. Evaluación integrada
        """, math_context) 