from django.urls import path
from . import views

urlpatterns = [
    # Endpoint principal para comunicación con agentes
    path('chat/', views.AgentChatAPIView.as_view(), name='agent_chat'),
    
    # Endpoint legacy para compatibilidad
    path('send-message/', views.SendMessageAPIView.as_view(), name='send_message'),
    
    # Gestión de agentes
    path('management/', views.AgentManagementAPIView.as_view(), name='agent_management'),
    path('capabilities/<str:agent_id>/', views.agent_capabilities, name='agent_capabilities'),
    
    # Historial conversacional
    path('history/<str:user_id>/', views.ConversationHistoryAPIView.as_view(), name='conversation_history'),
    
    # Content Creator específico
    path('content-creator/', views.ContentCreatorAPIView.as_view(), name='content_creator'),
    
    # Análisis de imágenes
    path('analyze-image/', views.analyze_image, name='analyze_image'),
    
    # Prompts inteligentes dinámicos
    path('smart-prompts/', views.generate_smart_prompts, name='generate_smart_prompts'),
    
    # Mapa de Conocimientos
    path('knowledge-map/<uuid:document_id>/', views.get_knowledge_map, name='get_knowledge_map'),
    path('knowledge-map/synthetic/<uuid:document_id>/', views.get_synthetic_knowledge_map, name='get_synthetic_knowledge_map'),
    path('knowledge-map/generate/', views.generate_knowledge_map, name='generate_knowledge_map'),
    path('learning-analytics/<uuid:document_id>/', views.get_learning_analytics, name='get_learning_analytics'),
    path('knowledge-node/update/', views.update_knowledge_node, name='update_knowledge_node'),
    path('learning-session/record/', views.record_learning_session, name='record_learning_session'),
    
    # Utilidades
    path('upload-file/', views.upload_file, name='upload_file'),
    path('health/', views.health_check, name='health_check'),
    
    # Búsqueda Web Contextual
    path('web-search/', views.web_search, name='web_search'),
] 