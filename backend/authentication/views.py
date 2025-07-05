from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import IntegrityError
import json

# Create your views here.

@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """
    Vista para iniciar sesión
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'status': 'success',
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    """
    Vista para cerrar sesión
    """
    logout(request)
    return JsonResponse({
        'status': 'success',
        'message': 'Logout successful'
    })

@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    """
    Vista para registrar un nuevo usuario
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        if not username or not email or not password:
            return JsonResponse({'error': 'Username, email and password required'}, status=400)
        
        # Validar que el usuario no exista
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=409)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=409)
        
        # Crear usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def user_info_view(request):
    """
    Vista para obtener información del usuario actual
    """
    if request.user.is_authenticated:
        return JsonResponse({
            'status': 'success',
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'is_authenticated': True
            }
        })
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'User not authenticated',
            'user': {'is_authenticated': False}
        }, status=401)

@require_http_methods(["GET"])
def auth_status(request):
    """
    Vista para verificar el estado de autenticación
    """
    return JsonResponse({
        'is_authenticated': request.user.is_authenticated,
        'user_id': request.user.id if request.user.is_authenticated else None,
        'username': request.user.username if request.user.is_authenticated else None
    })

@csrf_exempt
@require_http_methods(["POST"])
def create_demo_users(request):
    """
    Vista para crear usuarios de demostración
    """
    demo_users = [
        {
            'username': 'demo_doctor',
            'email': 'doctor@demo.com',
            'password': 'demo123',
            'first_name': 'Dr. María',
            'last_name': 'González'
        },
        {
            'username': 'demo_patient',
            'email': 'patient@demo.com',
            'password': 'demo123',
            'first_name': 'Juan',
            'last_name': 'Pérez'
        },
        {
            'username': 'admin_demo',
            'email': 'admin@demo.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'Sistema'
        }
    ]
    
    created_users = []
    errors = []
    
    for user_data in demo_users:
        try:
            # Verificar si ya existe
            if User.objects.filter(username=user_data['username']).exists():
                errors.append(f"User {user_data['username']} already exists")
                continue
            
            # Crear usuario
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name']
            )
            
            # Hacer superuser al admin
            if 'admin' in user_data['username']:
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
            created_users.append({
                'username': user.username,
                'email': user.email,
                'full_name': f"{user.first_name} {user.last_name}"
            })
            
        except Exception as e:
            errors.append(f"Error creating {user_data['username']}: {str(e)}")
    
    return JsonResponse({
        'status': 'success' if created_users else 'partial',
        'created_users': created_users,
        'errors': errors,
        'total_created': len(created_users)
    }) 