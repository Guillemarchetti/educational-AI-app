import json
import random
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from django.db import transaction
from ..models import KnowledgeNode, LearningProgress, LearningSession
from apps.documents.models import Document

class KnowledgeAnalyzer:
    """
    Servicio para analizar documentos y generar mapas de conocimientos
    """
    
    def __init__(self):
        self.status_weights = {
            'objective': 0.3,
            'well_learned': 0.25,
            'needs_reinforcement': 0.25,
            'not_learned': 0.2
        }
    
    def analyze_document_structure(self, document: Document, structure_data: Dict[str, Any]) -> List[KnowledgeNode]:
        """
        Analiza la estructura del documento y genera nodos de conocimiento
        """
        knowledge_nodes = []
        
        # Si no hay estructura, retornar lista vacía
        if not structure_data:
            return knowledge_nodes
        
        # Procesar estructura con formato 'hierarchy' (formato actual)
        if 'hierarchy' in structure_data and 'units' in structure_data['hierarchy']:
            units = structure_data['hierarchy']['units']
            for unit_index, unit in enumerate(units):
                unit_node = self._create_knowledge_node(
                    node_id=f"unit-{unit_index}",
                    title=unit.get('title', f'Unidad {unit_index + 1}'),
                    node_type='unit',
                    description=unit.get('title', f'Unidad de aprendizaje sobre {unit.get("title", "contenido educativo")}'),
                    document=document,
                    parent=None
                )
                knowledge_nodes.append(unit_node)
                
                # Procesar clases directamente (ya que no hay módulos en la estructura actual)
                if 'classes' in unit:
                    for class_index, class_item in enumerate(unit['classes']):
                        class_node = self._create_knowledge_node(
                            node_id=f"unit-{unit_index}-class-{class_index}",
                            title=class_item.get('title', f'Clase {class_index + 1}'),
                            node_type='class',
                            description=class_item.get('title', 'Clase específica'),
                            document=document,
                            parent=unit_node
                        )
                        knowledge_nodes.append(class_node)
        
        # Procesar estructura con formato 'units' directo (formato esperado)
        elif 'units' in structure_data:
            for unit_index, unit in enumerate(structure_data['units']):
                unit_node = self._create_knowledge_node(
                    node_id=f"unit-{unit_index}",
                    title=unit.get('title', f'Unidad {unit_index + 1}'),
                    node_type='unit',
                    description=unit.get('description', f'Unidad de aprendizaje sobre {unit.get("title", "contenido educativo")}'),
                    document=document,
                    parent=None
                )
                knowledge_nodes.append(unit_node)
                
                # Procesar módulos
                if 'modules' in unit:
                    for module_index, module in enumerate(unit['modules']):
                        module_node = self._create_knowledge_node(
                            node_id=f"unit-{unit_index}-module-{module_index}",
                            title=module.get('title', f'Módulo {module_index + 1}'),
                            node_type='module',
                            description=module.get('description', 'Módulo de aprendizaje'),
                            document=document,
                            parent=unit_node
                        )
                        knowledge_nodes.append(module_node)
                        
                        # Procesar clases
                        if 'classes' in module:
                            for class_index, class_item in enumerate(module['classes']):
                                class_node = self._create_knowledge_node(
                                    node_id=f"unit-{unit_index}-module-{module_index}-class-{class_index}",
                                    title=class_item.get('title', f'Clase {class_index + 1}'),
                                    node_type='class',
                                    description=class_item.get('description', 'Clase específica'),
                                    document=document,
                                    parent=module_node
                                )
                                knowledge_nodes.append(class_node)
        
        return knowledge_nodes
    
    def _create_knowledge_node(
        self,
        node_id: str,
        title: str,
        node_type: str,
        description: str,
        document: Document,
        parent: Optional[KnowledgeNode] = None
    ) -> KnowledgeNode:
        """
        Crea un nodo de conocimiento con análisis inteligente
        """
        # Análisis de dificultad basado en el tipo y contenido
        difficulty = self._analyze_difficulty(node_type, title, description)
        
        # Análisis de importancia basado en la jerarquía
        importance = self._analyze_importance(node_type, parent)
        
        # Estado inicial basado en análisis de contenido
        status = self._analyze_initial_status(node_type, difficulty, importance)
        
        # Progreso inicial
        progress = self._calculate_initial_progress(status, difficulty)
        
        # Tiempo estimado basado en tipo y dificultad
        time_spent = self._estimate_time_spent(node_type, difficulty)
        
        # Crear el nodo
        node = KnowledgeNode.objects.create(
            node_id=node_id,
            title=title,
            node_type=node_type,
            status=status,
            progress=progress,
            difficulty=difficulty,
            importance=importance,
            description=description,
            time_spent=time_spent,
            document=document,
            parent=parent,
            metadata={
                'created_from_structure': True,
                'analysis_timestamp': datetime.now().isoformat(),
                'content_analysis': {
                    'difficulty_factors': self._get_difficulty_factors(title, description),
                    'importance_factors': self._get_importance_factors(node_type, parent),
                    'estimated_complexity': self._estimate_complexity(title, description)
                }
            }
        )
        
        return node
    
    def _analyze_difficulty(self, node_type: str, title: str, description: str) -> str:
        """
        Analiza la dificultad basada en el tipo de nodo y contenido
        """
        # Factores de dificultad
        difficulty_factors = self._get_difficulty_factors(title, description)
        complexity_score = sum(difficulty_factors.values())
        
        # Ajustar por tipo de nodo
        type_multipliers = {
            'unit': 1.2,    # Las unidades son más complejas
            'module': 1.0,   # Módulos son estándar
            'class': 0.8     # Las clases son más específicas
        }
        
        adjusted_score = complexity_score * type_multipliers.get(node_type, 1.0)
        
        if adjusted_score < 0.3:
            return 'easy'
        elif adjusted_score < 0.7:
            return 'medium'
        else:
            return 'hard'
    
    def _get_difficulty_factors(self, title: str, description: str) -> Dict[str, float]:
        """
        Calcula factores de dificultad basados en el contenido
        """
        factors = {
            'length': 0.0,
            'technical_terms': 0.0,
            'mathematical_content': 0.0,
            'abstract_concepts': 0.0
        }
        
        # Análisis de longitud
        total_length = len(title) + len(description or '')
        factors['length'] = min(total_length / 1000, 1.0)
        
        # Análisis de términos técnicos
        technical_terms = [
            'algoritmo', 'función', 'variable', 'ecuación', 'teorema',
            'derivada', 'integral', 'matriz', 'vector', 'probabilidad',
            'estadística', 'geometría', 'trigonometría', 'álgebra'
        ]
        
        text_lower = (title + ' ' + (description or '')).lower()
        technical_count = sum(1 for term in technical_terms if term in text_lower)
        factors['technical_terms'] = min(technical_count / 5, 1.0)
        
        # Análisis de contenido matemático
        math_symbols = ['=', '+', '-', '*', '/', '^', '√', '∫', '∑', 'π']
        math_count = sum(1 for symbol in math_symbols if symbol in text_lower)
        factors['mathematical_content'] = min(math_count / 10, 1.0)
        
        # Análisis de conceptos abstractos
        abstract_terms = [
            'concepto', 'teoría', 'principio', 'método', 'estrategia',
            'análisis', 'síntesis', 'evaluación', 'interpretación'
        ]
        abstract_count = sum(1 for term in abstract_terms if term in text_lower)
        factors['abstract_concepts'] = min(abstract_count / 3, 1.0)
        
        return factors
    
    def _analyze_importance(self, node_type: str, parent: Optional[KnowledgeNode]) -> str:
        """
        Analiza la importancia basada en la jerarquía y tipo
        """
        # Las unidades son más importantes
        if node_type == 'unit':
            return 'high'
        
        # Los módulos son de importancia media
        if node_type == 'module':
            return 'medium'
        
        # Las clases pueden variar según el padre
        if node_type == 'class':
            if parent and parent.importance == 'high':
                return 'medium'
            else:
                return 'low'
        
        return 'medium'
    
    def _get_importance_factors(self, node_type: str, parent: Optional[KnowledgeNode]) -> Dict[str, float]:
        """
        Calcula factores de importancia
        """
        factors = {
            'hierarchy_level': 0.0,
            'parent_importance': 0.0,
            'content_scope': 0.0
        }
        
        # Nivel jerárquico
        hierarchy_weights = {
            'unit': 1.0,
            'module': 0.7,
            'class': 0.4
        }
        factors['hierarchy_level'] = hierarchy_weights.get(node_type, 0.5)
        
        # Importancia del padre
        if parent:
            parent_importance_weights = {
                'high': 0.8,
                'medium': 0.5,
                'low': 0.2
            }
            factors['parent_importance'] = parent_importance_weights.get(parent.importance, 0.5)
        
        # Alcance del contenido
        scope_weights = {
            'unit': 1.0,    # Alcance amplio
            'module': 0.6,  # Alcance medio
            'class': 0.3    # Alcance específico
        }
        factors['content_scope'] = scope_weights.get(node_type, 0.5)
        
        return factors
    
    def _analyze_initial_status(self, node_type: str, difficulty: str, importance: str) -> str:
        """
        Determina el estado inicial basado en análisis
        """
        # Probabilidad basada en pesos
        statuses = list(self.status_weights.keys())
        weights = list(self.status_weights.values())
        
        # Ajustar pesos según dificultad e importancia
        if difficulty == 'hard' and importance == 'high':
            # Los temas difíciles e importantes tienden a ser objetivos
            weights = [0.5, 0.2, 0.2, 0.1]
        elif difficulty == 'easy' and importance == 'low':
            # Los temas fáciles y menos importantes pueden estar bien aprendidos
            weights = [0.2, 0.4, 0.3, 0.1]
        
        return random.choices(statuses, weights=weights)[0]
    
    def _calculate_initial_progress(self, status: str, difficulty: str) -> int:
        """
        Calcula el progreso inicial basado en el estado y dificultad
        """
        base_progress = {
            'objective': 0,
            'well_learned': 85,
            'needs_reinforcement': 60,
            'not_learned': 10
        }
        
        progress = base_progress.get(status, 0)
        
        # Ajustar por dificultad
        difficulty_adjustments = {
            'easy': 10,
            'medium': 0,
            'hard': -10
        }
        
        progress += difficulty_adjustments.get(difficulty, 0)
        
        return max(0, min(100, progress))
    
    def _estimate_time_spent(self, node_type: str, difficulty: str) -> int:
        """
        Estima el tiempo gastado basado en tipo y dificultad
        """
        base_times = {
            'unit': 120,    # 2 horas
            'module': 60,   # 1 hora
            'class': 30     # 30 minutos
        }
        
        difficulty_multipliers = {
            'easy': 0.7,
            'medium': 1.0,
            'hard': 1.5
        }
        
        base_time = base_times.get(node_type, 45)
        multiplier = difficulty_multipliers.get(difficulty, 1.0)
        
        return int(base_time * multiplier)
    
    def _estimate_complexity(self, title: str, description: str) -> float:
        """
        Estima la complejidad del contenido
        """
        complexity = 0.0
        
        # Factores de complejidad
        text = (title + ' ' + (description or '')).lower()
        
        # Longitud del contenido
        complexity += min(len(text) / 1000, 0.3)
        
        # Términos técnicos
        technical_terms = [
            'algoritmo', 'función', 'variable', 'ecuación', 'teorema',
            'derivada', 'integral', 'matriz', 'vector', 'probabilidad'
        ]
        technical_count = sum(1 for term in technical_terms if term in text)
        complexity += min(technical_count / 10, 0.4)
        
        # Símbolos matemáticos
        math_symbols = ['=', '+', '-', '*', '/', '^', '√', '∫', '∑', 'π']
        math_count = sum(1 for symbol in math_symbols if symbol in text)
        complexity += min(math_count / 15, 0.3)
        
        return min(complexity, 1.0)
    
    def get_knowledge_map_for_document(self, document: Document) -> Dict[str, Any]:
        """
        Obtiene el mapa de conocimientos para un documento
        """
        nodes = KnowledgeNode.objects.filter(document=document).select_related('parent')
        
        # Organizar en estructura jerárquica
        node_map = {}
        root_nodes = []
        
        for node in nodes:
            node_map[node.node_id] = {
                'id': node.node_id,
                'title': node.title,
                'type': node.node_type,
                'status': node.status,
                'progress': node.progress,
                'description': node.description,
                'timeSpent': node.time_spent,
                'lastReviewed': node.last_reviewed.isoformat() if node.last_reviewed else None,
                'difficulty': node.difficulty,
                'importance': node.importance,
                'children': []
            }
        
        # Construir jerarquía
        for node in nodes:
            node_data = node_map[node.node_id]
            
            if node.parent:
                parent_id = node.parent.node_id
                if parent_id in node_map:
                    node_map[parent_id]['children'].append(node_data)
            else:
                root_nodes.append(node_data)
        
        # Calcular estadísticas
        all_nodes = list(node_map.values())
        status_counts = {
            'objective': len([n for n in all_nodes if n['status'] == 'objective']),
            'well_learned': len([n for n in all_nodes if n['status'] == 'well_learned']),
            'needs_reinforcement': len([n for n in all_nodes if n['status'] == 'needs_reinforcement']),
            'not_learned': len([n for n in all_nodes if n['status'] == 'not_learned'])
        }
        
        overall_progress = sum(n['progress'] for n in all_nodes) / len(all_nodes) if all_nodes else 0
        
        return {
            'nodes': root_nodes,
            'statistics': {
                'total_nodes': len(all_nodes),
                'status_counts': status_counts,
                'overall_progress': round(overall_progress, 1)
            },
            'document': {
                'id': document.id,
                'name': document.title,
                'uploaded_at': document.upload_date.isoformat() if hasattr(document, 'upload_date') and document.upload_date else None
            }
        }
    
    def update_node_status(self, node_id: str, new_status: str, progress: int = None) -> KnowledgeNode:
        """
        Actualiza el estado de un nodo de conocimiento
        """
        try:
            node = KnowledgeNode.objects.get(node_id=node_id)
            node.status = new_status
            
            if progress is not None:
                node.progress = progress
            
            node.save()
            return node
        except KnowledgeNode.DoesNotExist:
            raise ValueError(f"Knowledge node with id {node_id} not found")
    
    def record_learning_session(
        self,
        node_id: str,
        session_type: str,
        duration: int,
        score: float = None,
        user_id: int = None
    ) -> LearningSession:
        """
        Registra una sesión de aprendizaje
        """
        try:
            node = KnowledgeNode.objects.get(node_id=node_id)
            
            session = LearningSession.objects.create(
                knowledge_node=node,
                session_type=session_type,
                duration=duration,
                score=score,
                completed=True,
                completed_at=datetime.now(),
                user_id=user_id
            )
            
            # Actualizar progreso del nodo
            self._update_node_progress_from_session(node, session)
            
            return session
        except KnowledgeNode.DoesNotExist:
            raise ValueError(f"Knowledge node with id {node_id} not found")
    
    def _update_node_progress_from_session(self, node: KnowledgeNode, session: LearningSession):
        """
        Actualiza el progreso del nodo basado en la sesión de aprendizaje
        """
        # Calcular nuevo progreso
        if session.score is not None:
            # Basado en el score de la sesión
            progress_increase = session.score / 100 * 20  # Máximo 20% por sesión
            new_progress = min(100, node.progress + progress_increase)
            
            # Actualizar estado basado en el progreso
            if new_progress >= 90:
                new_status = 'well_learned'
            elif new_progress >= 60:
                new_status = 'needs_reinforcement'
            elif new_progress >= 30:
                new_status = 'objective'
            else:
                new_status = 'not_learned'
            
            node.progress = int(new_progress)
            node.status = new_status
            node.time_spent += session.duration
            node.save() 

    def generate_synthetic_knowledge_map(self, document: Document) -> Dict[str, Any]:
        """
        Genera un mapa de conocimientos sintético más expresivo y detallado
        """
        synthetic_nodes = [
            {
                "id": "unit-matematicas-basicas",
                "title": "Fundamentos Matemáticos",
                "type": "unit",
                "status": "well_learned",
                "progress": 95,
                "description": "Base fundamental de las matemáticas incluyendo operaciones básicas, fracciones y decimales. Dominio avanzado demostrado en ejercicios prácticos.",
                "timeSpent": 180,
                "lastReviewed": (datetime.now() - timedelta(days=2)).isoformat(),
                "difficulty": "medium",
                "importance": "high",
                "children": [
                    {
                        "id": "module-operaciones-basicas",
                        "title": "Operaciones Básicas",
                        "type": "module",
                        "status": "well_learned",
                        "progress": 100,
                        "description": "Suma, resta, multiplicación y división con números enteros y decimales. Ejecución fluida y precisa.",
                        "timeSpent": 120,
                        "lastReviewed": (datetime.now() - timedelta(days=1)).isoformat(),
                        "difficulty": "easy",
                        "importance": "high",
                        "children": [
                            {
                                "id": "class-suma-resta",
                                "title": "Suma y Resta",
                                "type": "class",
                                "status": "well_learned",
                                "progress": 100,
                                "description": "Operaciones de suma y resta con números hasta 6 dígitos. Velocidad de cálculo: 15 operaciones/minuto.",
                                "timeSpent": 45,
                                "lastReviewed": (datetime.now() - timedelta(hours=6)).isoformat(),
                                "difficulty": "easy",
                                "importance": "high"
                            },
                            {
                                "id": "class-multiplicacion",
                                "title": "Multiplicación",
                                "type": "class",
                                "status": "well_learned",
                                "progress": 95,
                                "description": "Tablas de multiplicar del 1 al 12. Multiplicación de números de 2 dígitos.",
                                "timeSpent": 60,
                                "lastReviewed": (datetime.now() - timedelta(days=1)).isoformat(),
                                "difficulty": "medium",
                                "importance": "high"
                            }
                        ]
                    },
                    {
                        "id": "module-fracciones",
                        "title": "Fracciones y Decimales",
                        "type": "module",
                        "status": "needs_reinforcement",
                        "progress": 75,
                        "description": "Conversión entre fracciones y decimales. Necesita práctica en fracciones complejas.",
                        "timeSpent": 90,
                        "lastReviewed": (datetime.now() - timedelta(days=3)).isoformat(),
                        "difficulty": "medium",
                        "importance": "high",
                        "children": [
                            {
                                "id": "class-fracciones-simples",
                                "title": "Fracciones Simples",
                                "type": "class",
                                "status": "well_learned",
                                "progress": 90,
                                "description": "Fracciones con denominadores hasta 12. Suma y resta de fracciones con mismo denominador.",
                                "timeSpent": 45,
                                "lastReviewed": (datetime.now() - timedelta(days=2)).isoformat(),
                                "difficulty": "easy",
                                "importance": "medium"
                            },
                            {
                                "id": "class-fracciones-complejas",
                                "title": "Fracciones Complejas",
                                "type": "class",
                                "status": "needs_reinforcement",
                                "progress": 60,
                                "description": "Fracciones con denominadores diferentes. Multiplicación y división de fracciones.",
                                "timeSpent": 45,
                                "lastReviewed": (datetime.now() - timedelta(days=5)).isoformat(),
                                "difficulty": "hard",
                                "importance": "high"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "unit-geometria",
                "title": "Geometría y Medidas",
                "type": "unit",
                "status": "objective",
                "progress": 45,
                "description": "Conceptos geométricos básicos, perímetros, áreas y volúmenes. En proceso de aprendizaje activo.",
                "timeSpent": 120,
                "lastReviewed": (datetime.now() - timedelta(hours=4)).isoformat(),
                "difficulty": "medium",
                "importance": "high",
                "children": [
                    {
                        "id": "module-perimetros-areas",
                        "title": "Perímetros y Áreas",
                        "type": "module",
                        "status": "objective",
                        "progress": 50,
                        "description": "Cálculo de perímetros y áreas de figuras planas básicas. Requiere más práctica.",
                        "timeSpent": 60,
                        "lastReviewed": (datetime.now() - timedelta(hours=2)).isoformat(),
                        "difficulty": "medium",
                        "importance": "high",
                        "children": [
                            {
                                "id": "class-cuadrado-rectangulo",
                                "title": "Cuadrado y Rectángulo",
                                "type": "class",
                                "status": "well_learned",
                                "progress": 85,
                                "description": "Perímetro y área de cuadrados y rectángulos. Fórmulas memorizadas correctamente.",
                                "timeSpent": 30,
                                "lastReviewed": (datetime.now() - timedelta(hours=1)).isoformat(),
                                "difficulty": "easy",
                                "importance": "medium"
                            },
                            {
                                "id": "class-triangulo-circulo",
                                "title": "Triángulo y Círculo",
                                "type": "class",
                                "status": "objective",
                                "progress": 30,
                                "description": "Área de triángulos y circunferencia del círculo. Necesita repaso de fórmulas.",
                                "timeSpent": 30,
                                "lastReviewed": (datetime.now() - timedelta(days=1)).isoformat(),
                                "difficulty": "medium",
                                "importance": "high"
                            }
                        ]
                    },
                    {
                        "id": "module-volumenes",
                        "title": "Volúmenes",
                        "type": "module",
                        "status": "not_learned",
                        "progress": 20,
                        "description": "Cálculo de volúmenes de cuerpos geométricos. Tema nuevo en desarrollo.",
                        "timeSpent": 30,
                        "lastReviewed": (datetime.now() - timedelta(days=2)).isoformat(),
                        "difficulty": "hard",
                        "importance": "medium",
                        "children": [
                            {
                                "id": "class-cubo-prisma",
                                "title": "Cubo y Prisma",
                                "type": "class",
                                "status": "not_learned",
                                "progress": 15,
                                "description": "Volumen de cubos y prismas rectangulares. Concepto en introducción.",
                                "timeSpent": 15,
                                "lastReviewed": (datetime.now() - timedelta(days=3)).isoformat(),
                                "difficulty": "medium",
                                "importance": "medium"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "unit-algebra",
                "title": "Álgebra Básica",
                "type": "unit",
                "status": "not_learned",
                "progress": 10,
                "description": "Introducción a conceptos algebraicos. Ecuaciones simples y patrones numéricos.",
                "timeSpent": 45,
                "lastReviewed": (datetime.now() - timedelta(days=7)).isoformat(),
                "difficulty": "hard",
                "importance": "medium",
                "children": [
                    {
                        "id": "module-ecuaciones",
                        "title": "Ecuaciones Simples",
                        "type": "module",
                        "status": "not_learned",
                        "progress": 5,
                        "description": "Ecuaciones de primer grado con una incógnita. Concepto en fase inicial.",
                        "timeSpent": 20,
                        "lastReviewed": (datetime.now() - timedelta(days=10)).isoformat(),
                        "difficulty": "hard",
                        "importance": "medium",
                        "children": [
                            {
                                "id": "class-ecuaciones-suma",
                                "title": "Ecuaciones con Suma",
                                "type": "class",
                                "status": "not_learned",
                                "progress": 10,
                                "description": "Ecuaciones del tipo x + a = b. Ejemplos básicos resueltos.",
                                "timeSpent": 10,
                                "lastReviewed": (datetime.now() - timedelta(days=12)).isoformat(),
                                "difficulty": "medium",
                                "importance": "low"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "unit-problemas",
                "title": "Resolución de Problemas",
                "type": "unit",
                "status": "needs_reinforcement",
                "progress": 65,
                "description": "Aplicación de conceptos matemáticos en problemas del mundo real. Estrategias de resolución.",
                "timeSpent": 150,
                "lastReviewed": (datetime.now() - timedelta(days=1)).isoformat(),
                "difficulty": "medium",
                "importance": "high",
                "children": [
                    {
                        "id": "module-problemas-cotidiano",
                        "title": "Problemas del Cotidiano",
                        "type": "module",
                        "status": "needs_reinforcement",
                        "progress": 70,
                        "description": "Problemas de compras, distancias y tiempo. Mejora en interpretación de enunciados.",
                        "timeSpent": 90,
                        "lastReviewed": (datetime.now() - timedelta(hours=8)).isoformat(),
                        "difficulty": "medium",
                        "importance": "high",
                        "children": [
                            {
                                "id": "class-problemas-dinero",
                                "title": "Problemas con Dinero",
                                "type": "class",
                                "status": "well_learned",
                                "progress": 85,
                                "description": "Cálculos de precios, descuentos y cambio. Dominio en operaciones monetarias.",
                                "timeSpent": 45,
                                "lastReviewed": (datetime.now() - timedelta(hours=4)).isoformat(),
                                "difficulty": "easy",
                                "importance": "high"
                            },
                            {
                                "id": "class-problemas-tiempo",
                                "title": "Problemas de Tiempo",
                                "type": "class",
                                "status": "needs_reinforcement",
                                "progress": 55,
                                "description": "Cálculo de duraciones y horarios. Necesita práctica en conversiones de tiempo.",
                                "timeSpent": 45,
                                "lastReviewed": (datetime.now() - timedelta(days=2)).isoformat(),
                                "difficulty": "medium",
                                "importance": "medium"
                            }
                        ]
                    }
                ]
            }
        ]

        # Calcular estadísticas
        total_nodes = self._count_nodes(synthetic_nodes)
        status_counts = self._calculate_status_counts(synthetic_nodes)
        overall_progress = self._calculate_overall_progress(synthetic_nodes)

        return {
            "success": True,
            "knowledge_map": {
                "nodes": synthetic_nodes,
                "statistics": {
                    "total_nodes": total_nodes,
                    "status_counts": status_counts,
                    "overall_progress": overall_progress
                },
                "document": {
                    "id": str(document.id),
                    "name": document.title,
                    "uploaded_at": document.upload_date.isoformat() if hasattr(document, 'upload_date') and document.upload_date else None
                }
            }
        }

    def _count_nodes(self, nodes: List[Dict]) -> int:
        """Cuenta el número total de nodos recursivamente"""
        count = len(nodes)
        for node in nodes:
            if 'children' in node and node['children']:
                count += self._count_nodes(node['children'])
        return count

    def _calculate_status_counts(self, nodes: List[Dict]) -> Dict[str, int]:
        """Calcula el conteo de estados recursivamente"""
        counts = {'objective': 0, 'well_learned': 0, 'needs_reinforcement': 0, 'not_learned': 0}
        
        for node in nodes:
            status = node.get('status', 'objective')
            counts[status] += 1
            if 'children' in node and node['children']:
                child_counts = self._calculate_status_counts(node['children'])
                for key in counts:
                    counts[key] += child_counts[key]
        
        return counts

    def _calculate_overall_progress(self, nodes: List[Dict]) -> float:
        """Calcula el progreso general promedio"""
        total_progress = 0
        total_nodes = 0
        
        def sum_progress(node_list):
            nonlocal total_progress, total_nodes
            for node in node_list:
                total_progress += node.get('progress', 0)
                total_nodes += 1
                if 'children' in node and node['children']:
                    sum_progress(node['children'])
        
        sum_progress(nodes)
        return round(total_progress / total_nodes, 1) if total_nodes > 0 else 0.0 