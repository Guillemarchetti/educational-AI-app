"""
Analizador de Estructura de Documentos Educativos
Detecta automáticamente la jerarquía: Unidades → Módulos → Clases
"""

import re
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import PyPDF2
from io import BytesIO

logger = logging.getLogger(__name__)

@dataclass
class StructureElement:
    """Representa un elemento de la estructura del documento"""
    element_type: str  # 'unit', 'module', 'class', 'section'
    title: str
    level: int
    page_number: int
    line_number: int
    parent_id: Optional[str] = None
    element_id: Optional[str] = None
    content_preview: str = ""

class DocumentStructureAnalyzer:
    """Analizador principal de estructura de documentos"""
    
    def __init__(self):
        # Patrones mejorados para detectar diferentes tipos de elementos
        self.patterns = {
            'unit': [
                # Patrones principales
                r'(?:UNIDAD|Unidad|UNIT|Unit)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:MÓDULO|Módulo|MODULE|Module)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:CAPÍTULO|Capítulo|CHAPTER|Chapter)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                # Patrones adicionales para diferentes formatos
                r'(?:PARTE|Parte|PART|Part)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:BLOQUE|Bloque|BLOCK|Block)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:SECCIÓN PRINCIPAL|Sección Principal)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                # Patrones con formato especial
                r'^(\d+)\s*[-–—]\s*(.+?)(?:\n|$)',  # 1 - Título
                r'^(\d+)\s*[\.]\s*(.+?)(?:\n|$)',   # 1. Título
                r'^([IVX]+)\s*[-–—]\s*(.+?)(?:\n|$)',  # I - Título
            ],
            'module': [
                # Patrones principales
                r'(?:MÓDULO|Módulo|MODULE|Module)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:SECCIÓN|Sección|SECTION|Section)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:TEMA|Tema|TOPIC|Topic)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                # Patrones adicionales
                r'(?:SUBMÓDULO|Submódulo|SUBMODULE|Submodule)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:APARTADO|Apartado|SECTION|Section)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:CONTENIDO|Contenido|CONTENT|Content)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                # Patrones con formato especial
                r'^(\d+\.\d+)\s*(.+?)(?:\n|$)',  # 1.1 Título
                r'^(\d+\.\d+\.\d+)\s*(.+?)(?:\n|$)',  # 1.1.1 Título
                r'^([a-z]\.\d+)\s*(.+?)(?:\n|$)',  # a.1 Título
            ],
            'class': [
                # Patrones principales
                r'(?:CLASE|Clase|CLASS|Class)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:LECCIÓN|Lección|LESSON|Lesson)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:ACTIVIDAD|Actividad|ACTIVITY|Activity)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                # Patrones adicionales
                r'(?:EJERCICIO|Ejercicio|EXERCISE|Exercise)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:PRÁCTICA|Práctica|PRACTICE|Practice)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:TALLER|Taller|WORKSHOP|Workshop)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:EVALUACIÓN|Evaluación|EVALUATION|Evaluation)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                # Patrones con formato especial
                r'^(\d+\.\d+\.\d+\.\d+)\s*(.+?)(?:\n|$)',  # 1.1.1.1 Título
                r'^([a-z]\))\s*(.+?)(?:\n|$)',  # a) Título
                r'^([A-Z]\))\s*(.+?)(?:\n|$)',  # A) Título
            ],
            'section': [
                # Patrones de secciones menores
                r'(\d+\.)\s*(.+?)(?:\n|$)',
                r'(\d+\.\d+\.?)\s*(.+?)(?:\n|$)',
                r'([a-z]\))\s*(.+?)(?:\n|$)',
                r'([A-Z]\))\s*(.+?)(?:\n|$)',
                # Patrones adicionales
                r'(?:SUBSECCIÓN|Subsección|SUBSECTION|Subsection)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:PUNTO|Punto|POINT|Point)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
                r'(?:ITEM|Item|ÍTEM|Ítem)\s+(\d+|[IVX]+)[\s\.:]\s*(.+?)(?:\n|$)',
            ]
        }
        
        # Patrones mejorados de tabla de contenidos
        self.toc_patterns = [
            r'(?:ÍNDICE|Índice|CONTENIDO|Contenido|TABLE OF CONTENTS|Contents)',
            r'(?:TABLA DE CONTENIDOS|Tabla de Contenidos)',
            r'(?:SUMARIO|Sumario|SUMMARY|Summary)',
            r'(?:CONTENIDOS|Contenidos|CONTENTS|Contents)',
            r'(?:ESTRUCTURA|Estructura|STRUCTURE|Structure)',
        ]
        
        # Palabras clave mejoradas que indican inicio de contenido real
        self.content_indicators = [
            'introducción', 'introduction', 'objetivos', 'objectives',
            'aprendizajes esperados', 'expected learning', 'competencias',
            'metodología', 'methodology', 'desarrollo', 'development',
            'conclusión', 'conclusion', 'resumen', 'summary',
            'bibliografía', 'bibliography', 'referencias', 'references'
        ]
        
        # Patrones de formato especial para detectar títulos
        self.title_indicators = [
            r'^[A-Z][A-Z\s]+$',  # TÍTULOS EN MAYÚSCULAS
            r'^[A-Z][a-z\s]+[A-Z][A-Z\s]+$',  # Títulos Con Palabras Mayúsculas
            r'^[A-Z][a-z\s]+:$',  # Títulos que terminan en :
        ]

    def analyze_pdf_structure(self, pdf_file_path: str) -> Dict:
        """
        Analiza la estructura de un archivo PDF
        
        Args:
            pdf_file_path: Ruta al archivo PDF
            
        Returns:
            Dict con la estructura detectada
        """
        try:
            # Extraer texto del PDF
            text_content = self._extract_text_from_pdf(pdf_file_path)
            
            # Detectar elementos de estructura
            elements = self._detect_structure_elements(text_content)
            
            # Construir jerarquía
            hierarchy = self._build_hierarchy(elements)
            
            # Generar estructura final
            structure = {
                'document_path': pdf_file_path,
                'total_pages': len(text_content),
                'elements': elements,
                'hierarchy': hierarchy,
                'analysis_metadata': {
                    'total_elements': len(elements),
                    'units_found': len([e for e in elements if e.element_type == 'unit']),
                    'modules_found': len([e for e in elements if e.element_type == 'module']),
                    'classes_found': len([e for e in elements if e.element_type == 'class']),
                }
            }
            
            logger.info(f"Structure analysis completed: {structure['analysis_metadata']}")
            return structure
            
        except Exception as e:
            logger.error(f"Error analyzing PDF structure: {str(e)}")
            return self._create_fallback_structure(pdf_file_path)

    def _extract_text_from_pdf(self, pdf_file_path: str) -> List[str]:
        """Extrae texto de cada página del PDF"""
        pages_text = []
        
        try:
            with open(pdf_file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        text = page.extract_text()
                        pages_text.append(text)
                    except Exception as e:
                        logger.warning(f"Error extracting text from page {page_num}: {str(e)}")
                        pages_text.append("")
                        
        except Exception as e:
            logger.error(f"Error reading PDF file: {str(e)}")
            raise
            
        return pages_text

    def _detect_structure_elements(self, pages_text: List[str]) -> List[StructureElement]:
        """Detecta elementos de estructura en el texto con patrones mejorados"""
        elements = []
        element_counter = 0
        
        for page_num, page_text in enumerate(pages_text):
            lines = page_text.split('\n')
            
            for line_num, line in enumerate(lines):
                line = line.strip()
                if not line or len(line) < 3:
                    continue
                
                # Detectar cada tipo de elemento con patrones mejorados
                for element_type, patterns in self.patterns.items():
                    for pattern in patterns:
                        match = re.search(pattern, line, re.IGNORECASE)
                        if match:
                            element_counter += 1
                            
                            # Extraer número y título con mejor manejo
                            if len(match.groups()) >= 2:
                                number = match.group(1)
                                title = match.group(2).strip()
                            else:
                                number = ""
                                title = match.group(1).strip() if match.groups() else line
                            
                            # Limpiar y mejorar el título
                            title = self._clean_title(title)
                            
                            # Crear elemento
                            element = StructureElement(
                                element_type=element_type,
                                title=f"{number} {title}".strip(),
                                level=self._determine_level(element_type),
                                page_number=page_num + 1,
                                line_number=line_num,
                                element_id=f"{element_type}_{element_counter}",
                                content_preview=self._extract_content_preview(
                                    pages_text, page_num, line_num
                                )
                            )
                            
                            elements.append(element)
                            break  # Solo el primer patrón que coincida
                    
                    if any(re.search(p, line, re.IGNORECASE) for p in patterns):
                        break  # Solo el primer tipo que coincida
                
                # Detección adicional de títulos por formato
                if not any(e.page_number == page_num + 1 and e.line_number == line_num for e in elements):
                    detected_type = self._detect_title_by_format(line)
                    if detected_type:
                        element_counter += 1
                        element = StructureElement(
                            element_type=detected_type,
                            title=line.strip(),
                            level=self._determine_level(detected_type),
                            page_number=page_num + 1,
                            line_number=line_num,
                            element_id=f"{detected_type}_{element_counter}",
                            content_preview=self._extract_content_preview(
                                pages_text, page_num, line_num
                            )
                        )
                        elements.append(element)
        
        # Filtrar y limpiar elementos
        elements = self._filter_and_clean_elements(elements)
        
        logger.info(f"Detected {len(elements)} structure elements")
        return elements

    def _clean_title(self, title: str) -> str:
        """Limpia y mejora el título del elemento"""
        # Remover caracteres especiales al inicio y final
        title = re.sub(r'^[^\w\s]+', '', title)
        title = re.sub(r'[^\w\s]+$', '', title)
        
        # Normalizar espacios
        title = re.sub(r'\s+', ' ', title).strip()
        
        # Capitalizar primera letra si es necesario
        if title and title[0].islower():
            title = title[0].upper() + title[1:]
        
        return title

    def _detect_title_by_format(self, line: str) -> Optional[str]:
        """Detecta títulos por formato especial"""
        line = line.strip()
        
        # Verificar si es un título en mayúsculas
        if re.match(r'^[A-Z][A-Z\s]{3,}$', line):
            return 'unit'
        
        # Verificar si es un título con palabras mayúsculas
        if re.match(r'^[A-Z][a-z\s]+[A-Z][A-Z\s]+$', line):
            return 'module'
        
        # Verificar si termina en dos puntos
        if re.match(r'^[A-Z][a-z\s]+:$', line):
            return 'class'
        
        # Verificar si es una línea corta con formato de título
        if len(line) < 100 and re.match(r'^[A-Z][a-z\s]+$', line):
            return 'section'
        
        return None

    def _determine_level(self, element_type: str) -> int:
        """Determina el nivel jerárquico del elemento"""
        level_map = {
            'unit': 1,
            'module': 2,
            'class': 3,
            'section': 4
        }
        return level_map.get(element_type, 5)

    def _extract_content_preview(self, pages_text: List[str], page_num: int, line_num: int) -> str:
        """Extrae una vista previa del contenido del elemento"""
        try:
            # Tomar las siguientes 3-5 líneas como preview
            page_lines = pages_text[page_num].split('\n')
            preview_lines = []
            
            for i in range(line_num + 1, min(line_num + 6, len(page_lines))):
                line = page_lines[i].strip()
                if line and not self._is_likely_header(line):
                    preview_lines.append(line)
                if len(preview_lines) >= 3:
                    break
            
            return ' '.join(preview_lines)[:200] + "..." if preview_lines else ""
            
        except Exception:
            return ""

    def _is_likely_header(self, line: str) -> bool:
        """Determina si una línea es probablemente un encabezado"""
        # Líneas muy cortas, números de página, etc.
        if len(line) < 5 or line.isdigit():
            return True
        
        # Patrones de encabezados
        header_patterns = [
            r'^\d+$',  # Solo números
            r'^página\s+\d+',  # Números de página
            r'^page\s+\d+',
        ]
        
        return any(re.search(pattern, line, re.IGNORECASE) for pattern in header_patterns)

    def _filter_and_clean_elements(self, elements: List[StructureElement]) -> List[StructureElement]:
        """Filtra y limpia elementos duplicados o incorrectos"""
        cleaned_elements = []
        seen_titles = set()
        
        for element in elements:
            # Evitar duplicados por título similar
            title_key = re.sub(r'\s+', ' ', element.title.lower().strip())
            
            if title_key not in seen_titles and len(element.title) > 3:
                seen_titles.add(title_key)
                cleaned_elements.append(element)
        
        # Ordenar por página y línea
        cleaned_elements.sort(key=lambda x: (x.page_number, x.line_number))
        
        return cleaned_elements

    def _build_hierarchy(self, elements: List[StructureElement]) -> Dict:
        """Construye la jerarquía de elementos"""
        hierarchy = {
            'units': [],
            'orphaned_elements': []
        }
        
        current_unit = None
        current_module = None
        
        for element in elements:
            if element.element_type == 'unit':
                # Nueva unidad
                current_unit = {
                    'id': element.element_id,
                    'title': element.title,
                    'page_start': element.page_number,
                    'modules': [],
                    'element': element
                }
                hierarchy['units'].append(current_unit)
                current_module = None
                
            elif element.element_type == 'module':
                # Nuevo módulo
                module_data = {
                    'id': element.element_id,
                    'title': element.title,
                    'page_start': element.page_number,
                    'classes': [],
                    'element': element
                }
                
                if current_unit:
                    current_unit['modules'].append(module_data)
                    current_module = module_data
                else:
                    # Módulo huérfano - crear unidad implícita
                    implicit_unit = {
                        'id': f"implicit_unit_{len(hierarchy['units'])}",
                        'title': "Contenido Principal",
                        'page_start': element.page_number,
                        'modules': [module_data],
                        'element': None
                    }
                    hierarchy['units'].append(implicit_unit)
                    current_unit = implicit_unit
                    current_module = module_data
                    
            elif element.element_type == 'class':
                # Nueva clase
                class_data = {
                    'id': element.element_id,
                    'title': element.title,
                    'page_start': element.page_number,
                    'element': element
                }
                
                if current_module:
                    current_module['classes'].append(class_data)
                elif current_unit:
                    # Clase directa en unidad (sin módulo)
                    if 'classes' not in current_unit:
                        current_unit['classes'] = []
                    current_unit['classes'].append(class_data)
                else:
                    hierarchy['orphaned_elements'].append(element)
            
            else:
                # Otros elementos
                hierarchy['orphaned_elements'].append(element)
        
        return hierarchy

    def _create_fallback_structure(self, pdf_file_path: str) -> Dict:
        """Crea una estructura de fallback cuando no se puede analizar"""
        return {
            'document_path': pdf_file_path,
            'total_pages': 0,
            'elements': [],
            'hierarchy': {
                'units': [{
                    'id': 'fallback_unit',
                    'title': 'Documento Completo',
                    'page_start': 1,
                    'modules': [],
                    'element': None
                }],
                'orphaned_elements': []
            },
            'analysis_metadata': {
                'total_elements': 0,
                'units_found': 0,
                'modules_found': 0,
                'classes_found': 0,
                'fallback_used': True
            }
        }

    def analyze_structure_from_content(self, content: str) -> Dict:
        """Analiza estructura desde contenido de texto directo"""
        # Simular páginas dividiendo por saltos de página o longitud
        pages = self._split_content_into_pages(content)
        elements = self._detect_structure_elements(pages)
        hierarchy = self._build_hierarchy(elements)
        
        return {
            'elements': elements,
            'hierarchy': hierarchy,
            'analysis_metadata': {
                'total_elements': len(elements),
                'units_found': len([e for e in elements if e.element_type == 'unit']),
                'modules_found': len([e for e in elements if e.element_type == 'module']),
                'classes_found': len([e for e in elements if e.element_type == 'class']),
            }
        }

    def _split_content_into_pages(self, content: str, chars_per_page: int = 2000) -> List[str]:
        """Divide contenido en páginas simuladas"""
        pages = []
        for i in range(0, len(content), chars_per_page):
            pages.append(content[i:i + chars_per_page])
        return pages 