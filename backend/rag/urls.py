from django.urls import path
from . import views

urlpatterns = [
    # Endpoint de prueba para categorización
    path('test-categorization/', views.test_medical_categorization, name='test_categorization'),
    
    # Endpoint para verificar sistema de embeddings
    path('embedding-status/', views.embedding_service_status, name='embedding_status'),
    
    # Endpoint principal para consultas de chat
    path('chat/', views.chat_query, name='chat_query'),
    
    # ENDPOINTS DE INVESTIGACIÓN Y ESTADÍSTICAS
    path('confidence-stats/', views.confidence_stats, name='confidence_stats'),
    path('pattern-detection-test/', views.pattern_detection_test, name='pattern_detection_test'),
    path('system-improvements/', views.system_improvements, name='system_improvements'),
] 