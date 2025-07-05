from django.urls import path
from . import views

urlpatterns = [
    # Autenticación básica
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    
    # Información del usuario
    path('user-info/', views.user_info_view, name='user_info'),
    path('auth-status/', views.auth_status, name='auth_status'),
    
    # Usuarios de demostración
    path('create-demo-users/', views.create_demo_users, name='create_demo_users'),
] 