from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Conversation {self.session_id}"

class Message(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."

class KnowledgeNode(models.Model):
    STATUS_CHOICES = [
        ('objective', 'Objetivo'),
        ('well_learned', 'Bien Aprendido'),
        ('needs_reinforcement', 'Necesita Refuerzo'),
        ('not_learned', 'No Aprendido'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Fácil'),
        ('medium', 'Medio'),
        ('hard', 'Difícil'),
    ]
    
    IMPORTANCE_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
    ]
    
    NODE_TYPE_CHOICES = [
        ('unit', 'Unidad'),
        ('module', 'Módulo'),
        ('class', 'Clase'),
    ]

    # Identificación
    node_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    node_type = models.CharField(max_length=10, choices=NODE_TYPE_CHOICES)
    
    # Estado de aprendizaje
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='objective')
    progress = models.IntegerField(default=0)  # 0-100
    
    # Características
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    importance = models.CharField(max_length=10, choices=IMPORTANCE_CHOICES, default='medium')
    
    # Metadatos
    description = models.TextField(blank=True, null=True)
    time_spent = models.IntegerField(default=0)  # en minutos
    last_reviewed = models.DateTimeField(auto_now=True)
    
    # Relaciones jerárquicas
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    document = models.ForeignKey('documents.Document', on_delete=models.CASCADE, null=True, blank=True)
    
    # Usuario (opcional para personalización)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metadata adicional
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['node_id']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['node_type']),
            models.Index(fields=['document']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    @property
    def is_completed(self):
        return self.progress >= 100

    @property
    def needs_attention(self):
        return self.status in ['needs_reinforcement', 'not_learned']

class LearningSession(models.Model):
    SESSION_TYPE_CHOICES = [
        ('study', 'Estudio'),
        ('quiz', 'Quiz'),
        ('review', 'Repaso'),
        ('practice', 'Práctica'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    knowledge_node = models.ForeignKey(KnowledgeNode, on_delete=models.CASCADE, related_name='learning_sessions')
    session_type = models.CharField(max_length=10, choices=SESSION_TYPE_CHOICES)
    duration = models.IntegerField(default=0)  # en minutos
    score = models.FloatField(null=True, blank=True)  # 0-100
    completed = models.BooleanField(default=False)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.get_session_type_display()} - {self.knowledge_node.title}"

class LearningProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    knowledge_node = models.ForeignKey(KnowledgeNode, on_delete=models.CASCADE, related_name='progress_records')
    
    # Métricas de progreso
    time_spent = models.IntegerField(default=0)  # en minutos
    attempts = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    
    # Estado de aprendizaje
    confidence_level = models.FloatField(default=0.0)  # 0-1
    last_practice_date = models.DateTimeField(auto_now=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ['user', 'knowledge_node']
        ordering = ['-last_practice_date']

    def __str__(self):
        return f"Progress for {self.knowledge_node.title}"

    @property
    def accuracy_rate(self):
        if self.total_questions == 0:
            return 0.0
        return (self.correct_answers / self.total_questions) * 100 