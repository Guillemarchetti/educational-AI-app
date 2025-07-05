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
    
    # Utilidades
    path('upload-file/', views.upload_file, name='upload_file'),
    path('health/', views.health_check, name='health_check'),
] 