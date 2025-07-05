from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),  # URLs de autenticación
    path('api/agents/', include('apps.agents.urls')),  # URLs de agentes
    path('api/documents/', include('apps.documents.urls')), # URLs de documentos
    # RAG System endpoints
    path('api/rag/', include('rag.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 