import json
import random
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from django.db import transaction
from ..models import KnowledgeNode, LearningProgress, LearningSession
from documents.models import Document

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
        
        if not structure_data or 'units' not in structure_data:
            return knowledge_nodes
        
        # Crear nodos de conocimiento basados en la estructura
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
                'name': document.name,
                'uploaded_at': document.uploaded_at.isoformat() if document.uploaded_at else None
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