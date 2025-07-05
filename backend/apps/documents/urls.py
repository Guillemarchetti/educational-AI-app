from django.urls import path
from . import views
from .api.structure_views import DocumentStructureView, ContextManagementView, get_document_chunks

urlpatterns = [
    # Vistas principales de documentos
    path('', views.document_list, name='document_list'),
    path('list/', views.document_list, name='document_list'),
    # path('list-simple/', views.document_list_simple, name='document_list_simple'),  # Nueva vista simple
    path('upload/', views.upload_document, name='upload_document'),
    path('serve/<str:document_id>/', views.serve_document, name='serve_document'),
    path('<uuid:document_id>/', views.serve_document, name='serve_document_by_id'),
    path('<uuid:document_id>/download/', views.download_document, name='download_document'),
    path('extract_text/', views.extract_text, name='extract_text'),
    
    # APIs para estructura
    path('api/structure/<uuid:document_id>/', DocumentStructureView.as_view(), name='document_structure'),
    path('api/chunks/<uuid:document_id>/', get_document_chunks, name='document_chunks'),
    
    # APIs para gestión de contexto
    path('api/context/', ContextManagementView.as_view(), name='context_management'),
] 