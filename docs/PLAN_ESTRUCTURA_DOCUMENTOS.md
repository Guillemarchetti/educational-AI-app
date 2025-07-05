# 📚 Plan de Implementación: Sistema de Estructura Semántica de Documentos

## 🎯 Objetivo Principal
Implementar un sistema que analice automáticamente la estructura jerárquica de documentos PDF educativos (Unidades → Módulos → Clases) y permita agregar contexto de manera granular según esta estructura.

## 📋 Funcionalidades Objetivo

### ✅ Funcionalidades Principales
1. **Análisis automático de estructura** de PDFs educativos
2. **Chunking semántico** basado en la estructura (no por tamaño)
3. **Panel de navegación** de estructura jerárquica
4. **Adición de contexto por niveles** (Unidad/Módulo/Clase)
5. **Visualización organizada** del contexto agregado
6. **Integración con el chat** para consultas específicas por estructura

---

## 🏗️ Arquitectura del Sistema

```
Frontend (React/TypeScript)
├── DocumentStructurePanel     # Panel de navegación de estructura
├── ContextDisplayEnhanced     # Visualización de contexto por niveles  
├── StructuredContextButtons   # Botones para agregar contexto por nivel
└── ChatInterface             # Chat con contexto estructurado

Backend (Django/Python)
├── StructureAnalyzer         # Análisis de estructura PDF
├── SemanticChunker          # Chunking basado en estructura
├── StructuredContextAPI     # API para contexto por niveles
└── DocumentStructureModel   # Modelo de datos de estructura
```

---

## 📅 Plan de Implementación por Fases

### 🔍 **FASE 1: Análisis de Estructura (Backend)**
**Tiempo estimado: 2-3 días**

#### 1.1 Crear Analizador de Estructura
- [ ] **Archivo**: `Archivo/apps/documents/services/structure_analyzer.py`
- [ ] Implementar detección de patrones textuales:
  - Unidades: "Unidad 1", "UNIDAD I", "Unit 1", etc.
  - Módulos: "Módulo 1", "MÓDULO A", "Module 1", etc.  
  - Clases: "Clase 1", "Lección 1", "Class 1", etc.
- [ ] Usar regex y NLP para identificar jerarquías
- [ ] Extraer tabla de contenidos si existe
- [ ] Detectar numeración y estructura anidada

#### 1.2 Crear Modelo de Datos
- [ ] **Archivo**: `Archivo/apps/documents/models.py`
- [ ] Modelo `DocumentStructure`:
  ```python
  class DocumentStructure(models.Model):
      document = models.OneToOneField(Document)
      structure_json = models.JSONField()  # Estructura jerárquica
      created_at = models.DateTimeField(auto_now_add=True)
  
  class StructureElement(models.Model):
      document_structure = models.ForeignKey(DocumentStructure)
      element_type = models.CharField()  # 'unit', 'module', 'class'
      title = models.CharField()
      level = models.IntegerField()
      parent = models.ForeignKey('self', null=True)
      page_start = models.IntegerField()
      page_end = models.IntegerField()
      content_preview = models.TextField()
  ```

#### 1.3 Integrar con Upload de Documentos
- [ ] **Archivo**: `Archivo/apps/documents/views.py`
- [ ] Modificar proceso de upload para analizar estructura
- [ ] Guardar estructura en base de datos
- [ ] Manejar errores de análisis

### 🧩 **FASE 2: Chunking Semántico (Backend)**
**Tiempo estimado: 2 días**

#### 2.1 Crear Chunker Semántico
- [ ] **Archivo**: `Archivo/apps/documents/services/semantic_chunker.py`
- [ ] Implementar chunking basado en estructura:
  ```python
  def create_semantic_chunks(document, structure):
      chunks = []
      for element in structure.elements:
          chunk = {
              'content': extract_element_content(element),
              'metadata': {
                  'element_type': element.element_type,
                  'title': element.title,
                  'level': element.level,
                  'structure_path': get_structure_path(element)
              }
          }
          chunks.append(chunk)
      return chunks
  ```

#### 2.2 Actualizar ChromaDB
- [ ] **Archivo**: `Archivo/rag/services/enhanced_rag.py`
- [ ] Modificar para incluir metadata de estructura
- [ ] Indexar chunks con información jerárquica
- [ ] Permitir búsquedas por nivel de estructura

### 🎨 **FASE 3: Frontend - Panel de Estructura**
**Tiempo estimado: 3 días**

#### 3.1 Crear Componente de Estructura
- [ ] **Archivo**: `components/enterprise/DocumentStructurePanel.tsx`
- [ ] Componente árbol navegable:
  ```tsx
  interface StructureNode {
    id: string
    type: 'unit' | 'module' | 'class'
    title: string
    level: number
    children?: StructureNode[]
    pageStart: number
    pageEnd: number
  }
  ```

#### 3.2 Diseñar UI de Estructura
- [ ] Árbol colapsable/expandible
- [ ] Iconos por tipo de elemento (📚 📖 📝)
- [ ] Botones de contexto por nivel
- [ ] Indicadores de contenido agregado al contexto
- [ ] Navegación directa a páginas del PDF

#### 3.3 Integrar con FileExplorer
- [ ] **Archivo**: `components/enterprise/FileExplorer.tsx`
- [ ] Mostrar estructura cuando se selecciona un documento
- [ ] Toggle entre vista de archivos y vista de estructura

### 🔗 **FASE 4: Sistema de Contexto Estructurado**
**Tiempo estimado: 3 días**

#### 4.1 API de Contexto Estructurado
- [ ] **Archivo**: `Archivo/apps/documents/api/structured_context.py`
- [ ] Endpoints:
  ```python
  POST /api/documents/add-structured-context/
  GET /api/documents/get-structure/{document_id}/
  POST /api/documents/remove-structured-context/
  ```

#### 4.2 Componente de Contexto Mejorado
- [ ] **Archivo**: `components/enterprise/StructuredContextDisplay.tsx`
- [ ] Mostrar contexto organizado por niveles:
  ```tsx
  <ContextDisplay>
    <ContextSection title="Unidades" icon="📚">
      <ContextItem type="unit" title="Unidad 1: Matemática" />
    </ContextSection>
    <ContextSection title="Módulos" icon="📖">
      <ContextItem type="module" title="Módulo 2: Operaciones" />
    </ContextSection>
  </ContextDisplay>
  ```

#### 4.3 Botones de Acción por Estructura
- [ ] **Archivo**: `components/enterprise/StructureContextButtons.tsx`
- [ ] Botones contextuales en cada nivel
- [ ] Estados: disponible, agregado, cargando
- [ ] Confirmaciones y feedback visual

### 🤖 **FASE 5: Integración con Chat**
**Tiempo estimado: 2 días**

#### 5.1 Mejorar Prompt del Chat
- [ ] **Archivo**: `Archivo/apps/agents/services/ai_service.py`
- [ ] Incluir información de estructura en prompts
- [ ] Permitir consultas específicas por nivel:
  - "Explica los objetivos de la Unidad 1"
  - "Resume el Módulo 2"
  - "Qué conceptos cubre la Clase 3"

#### 5.2 Indicadores de Contexto en Chat
- [ ] **Archivo**: `components/enterprise/ChatInterface.tsx`
- [ ] Mostrar qué estructura está en contexto
- [ ] Tags por tipo de contexto activo
- [ ] Sugerencias de preguntas por estructura

### 🧪 **FASE 6: Testing y Optimización**
**Tiempo estimado: 2 días**

#### 6.1 Testing de Análisis
- [ ] Probar con diferentes tipos de documentos
- [ ] Validar detección de estructura
- [ ] Manejar casos edge (documentos sin estructura clara)

#### 6.2 Testing de UI
- [ ] Navegación fluida entre estructuras
- [ ] Performance con documentos grandes
- [ ] Responsive design

#### 6.3 Optimizaciones
- [ ] Cache de estructuras analizadas
- [ ] Lazy loading de contenido
- [ ] Compresión de chunks grandes

---

## 🗂️ Estructura de Archivos a Crear/Modificar

### Backend
```
Archivo/
├── apps/documents/
│   ├── services/
│   │   ├── structure_analyzer.py      # NUEVO
│   │   └── semantic_chunker.py        # NUEVO
│   ├── api/
│   │   └── structured_context.py      # NUEVO
│   ├── models.py                      # MODIFICAR
│   └── views.py                       # MODIFICAR
└── rag/services/
    └── enhanced_rag.py                # MODIFICAR
```

### Frontend
```
components/enterprise/
├── DocumentStructurePanel.tsx         # NUEVO
├── StructuredContextDisplay.tsx       # NUEVO
├── StructureContextButtons.tsx        # NUEVO
├── FileExplorer.tsx                   # MODIFICAR
└── ChatInterface.tsx                  # MODIFICAR
```

---

## 📊 Criterios de Éxito

### ✅ Funcionalidad
- [ ] Detecta estructura en al menos 80% de documentos educativos
- [ ] Permite agregar contexto por cualquier nivel de estructura
- [ ] Contexto estructurado mejora relevancia de respuestas del chat
- [ ] UI intuitiva para navegación de estructura

### ⚡ Performance
- [ ] Análisis de estructura < 30 segundos por documento
- [ ] Carga de estructura en UI < 2 segundos
- [ ] Adición de contexto < 1 segundo

### 🎨 UX
- [ ] Navegación fluida entre niveles de estructura
- [ ] Feedback visual claro del contexto activo
- [ ] Integración seamless con funcionalidades existentes

---

## 🚀 Comandos de Inicio

### Para empezar la implementación:
```bash
# 1. Crear rama para la funcionalidad
git checkout -b feature/document-structure

# 2. Crear archivos base
touch Archivo/apps/documents/services/structure_analyzer.py
touch Archivo/apps/documents/services/semantic_chunker.py
touch components/enterprise/DocumentStructurePanel.tsx

# 3. Instalar dependencias adicionales si es necesario
pip install nltk spacy  # Para análisis de texto
```

---

## 📝 Notas Importantes

1. **Mantener compatibilidad** con sistema actual de documentos
2. **Fallback** para documentos sin estructura clara detectada
3. **Internacionalización** para detectar estructura en diferentes idiomas
4. **Escalabilidad** para documentos muy grandes
5. **Backup** de estructuras analizadas para no re-procesar

---

## 🔄 Próximos Pasos

1. **Revisar y aprobar** este plan
2. **Analizar un documento existente** manualmente para entender patrones
3. **Comenzar con FASE 1** - Análisis de Estructura
4. **Iterar y ajustar** según resultados de cada fase

---

*Documento creado: $(date)*
*Versión: 1.0*
*Estado: Pendiente de aprobación* 