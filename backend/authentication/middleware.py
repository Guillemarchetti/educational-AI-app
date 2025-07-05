import re
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

class DisableCSRFMiddleware(MiddlewareMixin):
    """Middleware para deshabilitar CSRF en endpoints de API."""
    
    def process_request(self, request):
        """Deshabilitar CSRF para rutas de API."""
        
        # Obtener las URLs exentas de CSRF desde settings
        exempt_urls = getattr(settings, 'CSRF_EXEMPT_URLS', [])
        
        # Verificar si la URL actual está en la lista de exentas
        for url_pattern in exempt_urls:
            if re.match(url_pattern, request.path):
                # Marcar el request como exento de CSRF
                setattr(request, '_dont_enforce_csrf_checks', True)
                break
        
        return None 