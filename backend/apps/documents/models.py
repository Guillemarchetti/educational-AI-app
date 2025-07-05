from django.db import models
from django.contrib.auth.models import User
import uuid
import json

class Document(models.Model):
    """Modelo para documentos subidos"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.IntegerField()
    upload_date = models.DateTimeField(auto_now_add=True)
    content_type = models.CharField(max_length=100)
    
    # Nuevos campos para estructura
    structure_analyzed = models.BooleanField(default=False)
    structure_data = models.JSONField(null=True, blank=True)  # Estructura completa
    chunks_created = models.BooleanField(default=False)
    total_chunks = models.IntegerField(default=0)
    
    # Metadatos de análisis
    analysis_metadata = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-upload_date']
    
    def __str__(self):
        return self.title
    
    def get_structure_summary(self):
        """Retorna un resumen de la estructura"""
        if not self.structure_data:
            return None
        
        metadata = self.structure_data.get('analysis_metadata', {})
        return {
            'units_found': metadata.get('units_found', 0),
            'modules_found': metadata.get('modules_found', 0),
            'classes_found': metadata.get('classes_found', 0),
            'total_elements': metadata.get('total_elements', 0)
        }

class DocumentStructure(models.Model):
    """Modelo para almacenar elementos de estructura individualmente"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='structure_elements')
    element_id = models.CharField(max_length=100)
    element_type = models.CharField(max_length=50)  # unit, module, class, section
    title = models.CharField(max_length=500)
    level = models.IntegerField()
    page_number = models.IntegerField()
    line_number = models.IntegerField(null=True, blank=True)
    
    # Jerarquía
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    structure_path = models.CharField(max_length=1000)  # Ruta completa: "Unidad 1 > Módulo 2 > Clase 3"
    
    # Contenido
    content_preview = models.TextField(blank=True)
    
    # Metadatos adicionales
    metadata = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['page_number', 'line_number']
        unique_together = ['document', 'element_id']
    
    def __str__(self):
        return f"{self.document.title} - {self.title}"
    
    def get_full_path(self):
        """Retorna la ruta completa del elemento"""
        return self.structure_path

class SemanticChunk(models.Model):
    """Modelo para chunks semánticos"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='semantic_chunks')
    chunk_id = models.CharField(max_length=100)
    content = models.TextField()
    
    # Información de estructura
    structure_element = models.ForeignKey(DocumentStructure, on_delete=models.CASCADE, null=True, blank=True)
    structure_path = models.CharField(max_length=1000)
    element_type = models.CharField(max_length=50)
    title = models.CharField(max_length=500)
    
    # Ubicación
    page_start = models.IntegerField()
    page_end = models.IntegerField(null=True, blank=True)
    
    # Jerarquía de chunks
    parent_chunks = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='child_chunks_rel')
    
    # Metadatos
    metadata = models.JSONField(null=True, blank=True)
    
    # Vectorización (para RAG)
    vector_embeddings = models.JSONField(null=True, blank=True)
    indexed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['page_start']
        unique_together = ['document', 'chunk_id']
    
    def __str__(self):
        return f"{self.document.title} - {self.title}"
    
    def get_content_preview(self, max_length=200):
        """Retorna una vista previa del contenido"""
        if len(self.content) <= max_length:
            return self.content
        return self.content[:max_length] + "..."

class ContextSession(models.Model):
    """Modelo para sesiones de contexto del usuario"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='context_sessions')
    session_id = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Contexto actual
    context_chunks = models.ManyToManyField(SemanticChunk, blank=True, related_name='context_sessions')
    context_text = models.TextField(blank=True)  # Texto libre agregado
    
    # Metadatos de la sesión
    metadata = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Contexto {self.user.username} - {self.created_at}"
    
    def get_context_summary(self):
        """Retorna un resumen del contexto actual"""
        chunks_count = self.context_chunks.count()
        structure_paths = list(self.context_chunks.values_list('structure_path', flat=True).distinct())
        
        return {
            'chunks_count': chunks_count,
            'structure_paths': structure_paths,
            'has_text': bool(self.context_text.strip()),
            'total_content_length': sum(chunk.content.__len__() for chunk in self.context_chunks.all()) + len(self.context_text)
        }
    
    def add_chunk_by_structure(self, structure_path: str, document: Document = None):
        """Agrega chunks por ruta de estructura"""
        query = SemanticChunk.objects.filter(structure_path__startswith=structure_path)
        if document:
            query = query.filter(document=document)
        
        chunks = query.all()
        self.context_chunks.add(*chunks)
        self.save()
        
        return len(chunks)
    
    def clear_context(self):
        """Limpia todo el contexto"""
        self.context_chunks.clear()
        self.context_text = ""
        self.save()

class DocumentProcessingLog(models.Model):
    """Log de procesamiento de documentos"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='processing_logs')
    process_type = models.CharField(max_length=50)  # 'structure_analysis', 'chunking', 'vectorization'
    status = models.CharField(max_length=20)  # 'pending', 'processing', 'completed', 'failed'
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Resultados
    result_data = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.document.title} - {self.process_type} - {self.status}" 