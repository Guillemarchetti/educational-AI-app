from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.document_list, name='document_list'),
    path('upload/', views.upload_document, name='upload_document'),
    path('extract_text/', views.extract_text, name='extract_text'),
    path('structure/<str:document_id>/', views.get_document_structure, name='get_document_structure'),
    path('serve/<str:document_id>/', views.serve_document, name='serve_document'),
    path('delete/<str:document_id>/', views.delete_document, name='delete_document'),
] 