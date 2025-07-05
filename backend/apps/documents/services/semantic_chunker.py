"""
Chunker Semántico para Documentos Educativos
Crea chunks basados en la estructura del documento (Unidades, Módulos, Clases)
en lugar de tamaños fijos
"""

import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from .structure_analyzer import DocumentStructureAnalyzer, StructureElement

logger = logging.getLogger(__name__)

@dataclass
class SemanticChunk:
    """Representa un chunk semántico basado en estructura"""
    chunk_id: str
    content: str
    metadata: Dict
    structure_path: str
    element_type: str
    title: str
    page_start: int
    page_end: Optional[int] = None
    parent_chunks: List[str] = None
    child_chunks: List[str] = None

class SemanticChunker:
    """Chunker que divide documentos basado en estructura semántica"""
    
    def __init__(self, max_chunk_size: int = 4000, overlap_size: int = 200):
        self.max_chunk_size = max_chunk_size
        self.overlap_size = overlap_size
        self.analyzer = DocumentStructureAnalyzer()
    
    def create_semantic_chunks(self, document_content: str, structure: Dict) -> List[SemanticChunk]:
        """
        Crea chunks semánticos basados en la estructura del documento
        
        Args:
            document_content: Contenido completo del documento
            structure: Estructura analizada del documento
            
        Returns:
            Lista de chunks semánticos
        """
        chunks = []
        
        try:
            # Dividir contenido en páginas
            pages = self._split_content_into_pages(document_content)
            
            # Crear chunks por jerarquía
            hierarchy = structure.get('hierarchy', {})
            
            for unit in hierarchy.get('units', []):
                unit_chunks = self._create_unit_chunks(unit, pages)
                chunks.extend(unit_chunks)
            
            # Procesar elementos huérfanos
            orphaned_elements = hierarchy.get('orphaned_elements', [])
            if orphaned_elements:
                orphaned_chunks = self._create_orphaned_chunks(orphaned_elements, pages)
                chunks.extend(orphaned_chunks)
            
            # Si no hay estructura, usar chunking tradicional
            if not chunks:
                chunks = self._create_fallback_chunks(document_content)
            
            logger.info(f"Created {len(chunks)} semantic chunks")
            return chunks
            
        except Exception as e:
            logger.error(f"Error creating semantic chunks: {str(e)}")
            return self._create_fallback_chunks(document_content)
    
    def _create_unit_chunks(self, unit: Dict, pages: List[str]) -> List[SemanticChunk]:
        """Crea chunks para una unidad completa"""
        chunks = []
        
        # Chunk principal de la unidad
        unit_content = self._extract_unit_content(unit, pages)
        if unit_content:
            unit_chunk = SemanticChunk(
                chunk_id=f"unit_{unit['id']}",
                content=unit_content,
                metadata={
                    'element_type': 'unit',
                    'title': unit['title'],
                    'level': 1,
                    'page_start': unit['page_start'],
                    'structure_path': unit['title'],
                    'has_modules': len(unit.get('modules', [])) > 0,
                    'module_count': len(unit.get('modules', [])),
                    'class_count': sum(len(m.get('classes', [])) for m in unit.get('modules', []))
                },
                structure_path=unit['title'],
                element_type='unit',
                title=unit['title'],
                page_start=unit['page_start'],
                child_chunks=[]
            )
            chunks.append(unit_chunk)
        
        # Chunks de módulos
        for module in unit.get('modules', []):
            module_chunks = self._create_module_chunks(module, pages, unit['title'])
            chunks.extend(module_chunks)
            
            # Actualizar relaciones padre-hijo
            if unit_content:
                unit_chunk.child_chunks.extend([c.chunk_id for c in module_chunks])
                for module_chunk in module_chunks:
                    if module_chunk.parent_chunks is None:
                        module_chunk.parent_chunks = []
                    module_chunk.parent_chunks.append(unit_chunk.chunk_id)
        
        # Clases directas en la unidad (sin módulo)
        for class_data in unit.get('classes', []):
            class_chunks = self._create_class_chunks(class_data, pages, unit['title'])
            chunks.extend(class_chunks)
            
            if unit_content:
                unit_chunk.child_chunks.extend([c.chunk_id for c in class_chunks])
                for class_chunk in class_chunks:
                    if class_chunk.parent_chunks is None:
                        class_chunk.parent_chunks = []
                    class_chunk.parent_chunks.append(unit_chunk.chunk_id)
        
        return chunks
    
    def _create_module_chunks(self, module: Dict, pages: List[str], unit_title: str) -> List[SemanticChunk]:
        """Crea chunks para un módulo"""
        chunks = []
        
        # Chunk principal del módulo
        module_content = self._extract_module_content(module, pages)
        if module_content:
            structure_path = f"{unit_title} > {module['title']}"
            
            module_chunk = SemanticChunk(
                chunk_id=f"module_{module['id']}",
                content=module_content,
                metadata={
                    'element_type': 'module',
                    'title': module['title'],
                    'level': 2,
                    'page_start': module['page_start'],
                    'structure_path': structure_path,
                    'unit_title': unit_title,
                    'class_count': len(module.get('classes', []))
                },
                structure_path=structure_path,
                element_type='module',
                title=module['title'],
                page_start=module['page_start'],
                child_chunks=[]
            )
            chunks.append(module_chunk)
        
        # Chunks de clases
        for class_data in module.get('classes', []):
            class_chunks = self._create_class_chunks(class_data, pages, unit_title, module['title'])
            chunks.extend(class_chunks)
            
            # Actualizar relaciones
            if module_content:
                module_chunk.child_chunks.extend([c.chunk_id for c in class_chunks])
                for class_chunk in class_chunks:
                    if class_chunk.parent_chunks is None:
                        class_chunk.parent_chunks = []
                    class_chunk.parent_chunks.append(module_chunk.chunk_id)
        
        return chunks
    
    def _create_class_chunks(self, class_data: Dict, pages: List[str], unit_title: str, module_title: str = None) -> List[SemanticChunk]:
        """Crea chunks para una clase"""
        chunks = []
        
        # Extraer contenido de la clase
        class_content = self._extract_class_content(class_data, pages)
        
        if class_content:
            # Determinar path de estructura
            if module_title:
                structure_path = f"{unit_title} > {module_title} > {class_data['title']}"
            else:
                structure_path = f"{unit_title} > {class_data['title']}"
            
            # Si el contenido es muy largo, dividir en sub-chunks
            if len(class_content) > self.max_chunk_size:
                sub_chunks = self._split_large_content(class_content, class_data, structure_path)
                chunks.extend(sub_chunks)
            else:
                # Chunk único para la clase
                class_chunk = SemanticChunk(
                    chunk_id=f"class_{class_data['id']}",
                    content=class_content,
                    metadata={
                        'element_type': 'class',
                        'title': class_data['title'],
                        'level': 3,
                        'page_start': class_data['page_start'],
                        'structure_path': structure_path,
                        'unit_title': unit_title,
                        'module_title': module_title
                    },
                    structure_path=structure_path,
                    element_type='class',
                    title=class_data['title'],
                    page_start=class_data['page_start']
                )
                chunks.append(class_chunk)
        
        return chunks
    
    def _extract_unit_content(self, unit: Dict, pages: List[str]) -> str:
        """Extrae el contenido principal de una unidad"""
        try:
            start_page = unit['page_start'] - 1  # Convertir a índice 0
            
            # Determinar página final
            end_page = start_page + 1  # Por defecto, una página
            
            # Si hay módulos, tomar hasta el primer módulo
            if unit.get('modules'):
                first_module_page = min(m['page_start'] for m in unit['modules']) - 1
                end_page = min(first_module_page, len(pages))
            
            # Extraer contenido
            content_parts = []
            for page_idx in range(start_page, min(end_page, len(pages))):
                if page_idx < len(pages):
                    content_parts.append(pages[page_idx])
            
            return '\n'.join(content_parts)
            
        except Exception as e:
            logger.warning(f"Error extracting unit content: {str(e)}")
            return ""
    
    def _extract_module_content(self, module: Dict, pages: List[str]) -> str:
        """Extrae el contenido principal de un módulo"""
        try:
            start_page = module['page_start'] - 1
            
            # Determinar página final
            end_page = start_page + 2  # Por defecto, dos páginas
            
            # Si hay clases, tomar hasta la primera clase
            if module.get('classes'):
                first_class_page = min(c['page_start'] for c in module['classes']) - 1
                end_page = min(first_class_page, len(pages))
            
            # Extraer contenido
            content_parts = []
            for page_idx in range(start_page, min(end_page, len(pages))):
                if page_idx < len(pages):
                    content_parts.append(pages[page_idx])
            
            return '\n'.join(content_parts)
            
        except Exception as e:
            logger.warning(f"Error extracting module content: {str(e)}")
            return ""
    
    def _extract_class_content(self, class_data: Dict, pages: List[str]) -> str:
        """Extrae el contenido completo de una clase"""
        try:
            start_page = class_data['page_start'] - 1
            
            # Por defecto, tomar 3-5 páginas para una clase
            end_page = start_page + 4
            
            # Extraer contenido
            content_parts = []
            for page_idx in range(start_page, min(end_page, len(pages))):
                if page_idx < len(pages):
                    content_parts.append(pages[page_idx])
            
            return '\n'.join(content_parts)
            
        except Exception as e:
            logger.warning(f"Error extracting class content: {str(e)}")
            return ""
    
    def _split_large_content(self, content: str, class_data: Dict, structure_path: str) -> List[SemanticChunk]:
        """Divide contenido grande en sub-chunks"""
        chunks = []
        
        # Dividir por párrafos o secciones
        sections = content.split('\n\n')
        current_chunk = ""
        chunk_counter = 1
        
        for section in sections:
            if len(current_chunk) + len(section) > self.max_chunk_size and current_chunk:
                # Crear chunk
                chunk = SemanticChunk(
                    chunk_id=f"class_{class_data['id']}_part_{chunk_counter}",
                    content=current_chunk.strip(),
                    metadata={
                        'element_type': 'class_part',
                        'title': f"{class_data['title']} (Parte {chunk_counter})",
                        'level': 4,
                        'page_start': class_data['page_start'],
                        'structure_path': f"{structure_path} (Parte {chunk_counter})",
                        'part_number': chunk_counter,
                        'parent_class': class_data['id']
                    },
                    structure_path=f"{structure_path} (Parte {chunk_counter})",
                    element_type='class_part',
                    title=f"{class_data['title']} (Parte {chunk_counter})",
                    page_start=class_data['page_start']
                )
                chunks.append(chunk)
                
                # Reiniciar con overlap
                current_chunk = section
                chunk_counter += 1
            else:
                current_chunk += "\n\n" + section if current_chunk else section
        
        # Último chunk
        if current_chunk.strip():
            chunk = SemanticChunk(
                chunk_id=f"class_{class_data['id']}_part_{chunk_counter}",
                content=current_chunk.strip(),
                metadata={
                    'element_type': 'class_part',
                    'title': f"{class_data['title']} (Parte {chunk_counter})",
                    'level': 4,
                    'page_start': class_data['page_start'],
                    'structure_path': f"{structure_path} (Parte {chunk_counter})",
                    'part_number': chunk_counter,
                    'parent_class': class_data['id']
                },
                structure_path=f"{structure_path} (Parte {chunk_counter})",
                element_type='class_part',
                title=f"{class_data['title']} (Parte {chunk_counter})",
                page_start=class_data['page_start']
            )
            chunks.append(chunk)
        
        return chunks
    
    def _create_orphaned_chunks(self, orphaned_elements: List[StructureElement], pages: List[str]) -> List[SemanticChunk]:
        """Crea chunks para elementos sin estructura clara"""
        chunks = []
        
        for element in orphaned_elements:
            content = self._extract_element_content(element, pages)
            if content:
                chunk = SemanticChunk(
                    chunk_id=f"orphaned_{element.element_id}",
                    content=content,
                    metadata={
                        'element_type': 'orphaned',
                        'title': element.title,
                        'level': element.level,
                        'page_start': element.page_number,
                        'structure_path': f"Contenido Adicional > {element.title}",
                        'original_type': element.element_type
                    },
                    structure_path=f"Contenido Adicional > {element.title}",
                    element_type='orphaned',
                    title=element.title,
                    page_start=element.page_number
                )
                chunks.append(chunk)
        
        return chunks
    
    def _extract_element_content(self, element: StructureElement, pages: List[str]) -> str:
        """Extrae contenido de un elemento específico"""
        try:
            start_page = element.page_number - 1
            end_page = min(start_page + 2, len(pages))
            
            content_parts = []
            for page_idx in range(start_page, end_page):
                if page_idx < len(pages):
                    content_parts.append(pages[page_idx])
            
            return '\n'.join(content_parts)
            
        except Exception:
            return element.content_preview
    
    def _create_fallback_chunks(self, content: str) -> List[SemanticChunk]:
        """Crea chunks tradicionales cuando no hay estructura"""
        chunks = []
        
        # Dividir en chunks de tamaño fijo con overlap
        for i, start in enumerate(range(0, len(content), self.max_chunk_size - self.overlap_size)):
            end = min(start + self.max_chunk_size, len(content))
            chunk_content = content[start:end]
            
            chunk = SemanticChunk(
                chunk_id=f"fallback_chunk_{i + 1}",
                content=chunk_content,
                metadata={
                    'element_type': 'fallback',
                    'title': f"Sección {i + 1}",
                    'level': 1,
                    'page_start': 1,
                    'structure_path': f"Documento > Sección {i + 1}",
                    'chunk_number': i + 1
                },
                structure_path=f"Documento > Sección {i + 1}",
                element_type='fallback',
                title=f"Sección {i + 1}",
                page_start=1
            )
            chunks.append(chunk)
        
        return chunks
    
    def _split_content_into_pages(self, content: str, chars_per_page: int = 2000) -> List[str]:
        """Divide contenido en páginas simuladas"""
        pages = []
        for i in range(0, len(content), chars_per_page):
            pages.append(content[i:i + chars_per_page])
        return pages
    
    def get_chunk_by_structure_path(self, chunks: List[SemanticChunk], structure_path: str) -> List[SemanticChunk]:
        """Obtiene chunks por path de estructura"""
        return [chunk for chunk in chunks if chunk.structure_path.startswith(structure_path)]
    
    def get_chunks_by_type(self, chunks: List[SemanticChunk], element_type: str) -> List[SemanticChunk]:
        """Obtiene chunks por tipo de elemento"""
        return [chunk for chunk in chunks if chunk.element_type == element_type] 