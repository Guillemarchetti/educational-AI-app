# 🚀 Scripts de Gestión de Servidores - ContextAI

Este proyecto incluye scripts automatizados para gestionar fácilmente los servidores frontend y backend.

## 📋 Scripts Disponibles

### `start_servers.sh` - Iniciar Aplicación
**Función**: Cierra todos los puertos ocupados e inicia ambos servidores automáticamente.

```bash
./start_servers.sh
```

**¿Qué hace?**
1. 🔍 Verifica puertos en uso (3000 y 8000)
2. 🛑 Cierra procesos existentes si los hay
3. ✅ Verifica dependencias (Node.js, Python, archivos)
4. 🐍 Inicia backend Django en puerto 8000
5. ⚛️ Inicia frontend Next.js en puerto 3000
6. 📊 Muestra estado final de ambos servidores

### `stop_servers.sh` - Parar Aplicación
**Función**: Detiene todos los servidores y limpia archivos temporales.

```bash
./stop_servers.sh
```

**¿Qué hace?**
1. 🔍 Busca procesos en puertos 3000 y 8000
2. 🛑 Detiene servidores de forma segura (TERM → KILL)
3. 🧹 Limpia archivos de logs
4. ✅ Verifica que los puertos estén libres

## 🎯 Uso Rápido

```bash
# Iniciar todo
./start_servers.sh

# Parar todo
./stop_servers.sh
```

## 📊 Monitoreo

### Ver Logs en Tiempo Real
```bash
# Backend Django
tail -f backend.log

# Frontend Next.js
tail -f frontend.log
```

### Verificar Estado
```bash
# Manual
curl http://localhost:3000  # Frontend
curl http://localhost:8000  # Backend

# O simplemente ejecuta el script de inicio para ver el estado
./start_servers.sh
```

## 🌐 URLs de la Aplicación

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin/
- **API Documentos**: http://localhost:8000/api/documents/

## 🔧 Requisitos

- **Node.js** (para el frontend)
- **Python 3** (para el backend)
- **Entorno virtual Python** en `backend/venv/` (recomendado)

## 📁 Estructura de Archivos

```
Chat_agent_AI/
├── start_servers.sh          # 🚀 Script de inicio
├── stop_servers.sh           # 🛑 Script de parada
├── backend.log               # 📄 Logs del backend (auto-generado)
├── frontend.log              # 📄 Logs del frontend (auto-generado)
├── package.json              # Frontend Next.js
└── backend/                  # Backend Django
    ├── manage.py
    ├── venv/                 # Entorno virtual Python
    └── ...
```

## 🚨 Solución de Problemas

### Puerto Ocupado
```bash
# El script automáticamente cierra puertos, pero si necesitas hacerlo manualmente:
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
```

### Error de Dependencias
```bash
# Verificar Node.js
node --version

# Verificar Python
python --version

# Verificar entorno virtual
cd backend && source venv/bin/activate
```

### Logs No Aparecen
```bash
# Los logs se crean automáticamente, pero si no existen:
touch backend.log frontend.log
```

## 🎨 Características del Script

- ✨ **Colores**: Output colorizado para mejor legibilidad
- 🔄 **Automático**: Cierra puertos automáticamente antes de iniciar
- 📊 **Estado**: Verifica que los servidores estén funcionando
- 🧹 **Limpieza**: Limpia logs automáticamente al parar
- 🛡️ **Seguro**: Manejo graceful de procesos (TERM antes de KILL)
- 📝 **Informativo**: Muestra PIDs, URLs y comandos útiles

## 💡 Tips

1. **Desarrollo**: Usa `./start_servers.sh` al comenzar a trabajar
2. **Finalizar**: Usa `./stop_servers.sh` al terminar
3. **Debugging**: Revisa `backend.log` y `frontend.log` si hay problemas
4. **Estado**: El script te dice exactamente qué está funcionando y qué no

¡Ahora puedes gestionar tu aplicación con un solo comando! 🎉 