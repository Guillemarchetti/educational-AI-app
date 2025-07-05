#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detectar sistema operativo de manera más robusta
detect_os() {
    echo -e "${YELLOW}🔍 Detectando sistema operativo...${NC}"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS_TYPE="Linux"
        echo -e "${GREEN}✅ Sistema detectado: Linux${NC}"
        PACKAGE_MANAGER="apt"
        if command -v dnf &> /dev/null; then
            PACKAGE_MANAGER="dnf"
        elif command -v yum &> /dev/null; then
            PACKAGE_MANAGER="yum"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS_TYPE="macOS"
        echo -e "${GREEN}✅ Sistema detectado: macOS${NC}"
        PACKAGE_MANAGER="brew"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS_TYPE="Windows"
        echo -e "${GREEN}✅ Sistema detectado: Windows${NC}"
        PACKAGE_MANAGER="choco"
    elif [[ "$OSTYPE" == "msys2" ]]; then
        OS_TYPE="Windows"
        echo -e "${GREEN}✅ Sistema detectado: Windows (MSYS2)${NC}"
        PACKAGE_MANAGER="pacman"
    else
        # Fallback para detección adicional
        if [[ "$(uname)" == "Darwin" ]]; then
            OS_TYPE="macOS"
            echo -e "${GREEN}✅ Sistema detectado: macOS${NC}"
            PACKAGE_MANAGER="brew"
        elif [[ "$(uname)" == "Linux" ]]; then
            OS_TYPE="Linux"
            echo -e "${GREEN}✅ Sistema detectado: Linux${NC}"
            PACKAGE_MANAGER="apt"
        elif [[ "$(uname)" == "MINGW"* ]] || [[ "$(uname)" == "MSYS"* ]]; then
            OS_TYPE="Windows"
            echo -e "${GREEN}✅ Sistema detectado: Windows (Git Bash/MSYS)${NC}"
            PACKAGE_MANAGER="choco"
        else
            echo -e "${RED}❌ Sistema operativo no soportado: $OSTYPE${NC}"
            echo -e "${YELLOW}💡 Por favor, instala manualmente:${NC}"
            echo "   - Python 3.8+"
            echo "   - Node.js 16+"
            echo "   - Git"
            exit 1
        fi
    fi
}

# Función para verificar/instalar dependencias del sistema
install_system_deps() {
    echo -e "${YELLOW}📦 Verificando dependencias del sistema...${NC}"
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git no está instalado${NC}"
        echo -e "${YELLOW}💡 Instala Git desde: https://git-scm.com/${NC}"
        exit 1
    fi
    
    # Verificar Python con mejor detección
    PYTHON_CMD=""
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2)
    else
        echo -e "${RED}❌ Python no está instalado${NC}"
        if [[ "$PACKAGE_MANAGER" == "apt" ]]; then
            echo -e "${YELLOW}💡 Ejecuta: sudo apt update && sudo apt install python3 python3-pip python3-venv${NC}"
        elif [[ "$PACKAGE_MANAGER" == "brew" ]]; then
            echo -e "${YELLOW}💡 Ejecuta: brew install python${NC}"
        elif [[ "$PACKAGE_MANAGER" == "choco" ]]; then
            echo -e "${YELLOW}💡 Ejecuta: choco install python${NC}"
        fi
        exit 1
    fi
    
    echo -e "${GREEN}✅ Python encontrado: $PYTHON_CMD ($PYTHON_VERSION)${NC}"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js no está instalado${NC}"
        if [[ "$PACKAGE_MANAGER" == "apt" ]]; then
            echo -e "${YELLOW}💡 Ejecuta: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs${NC}"
        elif [[ "$PACKAGE_MANAGER" == "brew" ]]; then
            echo -e "${YELLOW}💡 Ejecuta: brew install node${NC}"
        elif [[ "$PACKAGE_MANAGER" == "choco" ]]; then
            echo -e "${YELLOW}💡 Ejecuta: choco install nodejs${NC}"
        fi
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js encontrado: $NODE_VERSION${NC}"
    
    echo -e "${GREEN}✅ Dependencias del sistema verificadas${NC}"
}

# Función para configurar el entorno virtual de Python
setup_python_env() {
    echo -e "${YELLOW}🐍 Configurando entorno virtual de Python...${NC}"
    
    cd backend
    
    if [ -d "venv" ]; then
        echo -e "${YELLOW}⚠️  Entorno virtual ya existe, eliminando...${NC}"
        rm -rf venv
    fi
    
    # Crear entorno virtual usando el comando Python detectado
    echo -e "${YELLOW}📦 Creando entorno virtual...${NC}"
    if [[ "$OS_TYPE" == "Windows" ]]; then
        # En Windows, usar python -m venv
        python -m venv venv
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Error creando entorno virtual${NC}"
            echo -e "${YELLOW}💡 Asegúrate de que python -m venv esté disponible${NC}"
            exit 1
        fi
    else
        # En Linux/macOS, usar python3 -m venv
        python3 -m venv venv
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Error creando entorno virtual${NC}"
            echo -e "${YELLOW}💡 Asegúrate de que python3 -m venv esté disponible${NC}"
            exit 1
        fi
    fi
    
    # Activar entorno virtual según el sistema operativo
    echo -e "${YELLOW}🔧 Activando entorno virtual...${NC}"
    if [[ "$OS_TYPE" == "Windows" ]]; then
        if [ -f "venv/Scripts/activate" ]; then
            source venv/Scripts/activate
        else
            echo -e "${RED}❌ No se pudo encontrar el script de activación${NC}"
            exit 1
        fi
    else
        if [ -f "venv/bin/activate" ]; then
            source venv/bin/activate
        else
            echo -e "${RED}❌ No se pudo encontrar el script de activación${NC}"
            exit 1
        fi
    fi
    
    # Verificar que el entorno virtual esté activado
    if [[ "$VIRTUAL_ENV" == "" ]]; then
        echo -e "${RED}❌ El entorno virtual no se activó correctamente${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Entorno virtual activado: $VIRTUAL_ENV${NC}"
    
    # Actualizar pip
    echo -e "${YELLOW}📦 Actualizando pip...${NC}"
    python -m pip install --upgrade pip
    
    # Instalar dependencias
    echo -e "${YELLOW}📦 Instalando dependencias de Python...${NC}"
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    else
        echo -e "${YELLOW}⚠️  requirements.txt no encontrado, instalando dependencias básicas...${NC}"
        pip install django djangorestframework django-cors-headers
    fi
    
    cd ..
    echo -e "${GREEN}✅ Entorno virtual configurado${NC}"
}

# Función para configurar el frontend
setup_frontend() {
    echo -e "${YELLOW}⚛️  Configurando frontend Next.js...${NC}"
    
    cd frontend
    
    # Verificar si package.json existe
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json no encontrado en el directorio frontend${NC}"
        echo -e "${YELLOW}💡 Asegúrate de que el directorio frontend contenga un proyecto Next.js válido${NC}"
        exit 1
    fi
    
    # Instalar dependencias
    echo -e "${YELLOW}📦 Instalando dependencias de Node.js...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error instalando dependencias de Node.js${NC}"
        exit 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ Frontend configurado${NC}"
}

# Función para configurar variables de entorno
setup_env() {
    echo -e "${YELLOW}🔧 Configurando variables de entorno...${NC}"
    
    cd backend
    
    if [ ! -f .env ]; then
        if [ -f env_example ]; then
            cp env_example .env
            echo -e "${GREEN}✅ Archivo .env creado desde env_example${NC}"
        else
            echo -e "${YELLOW}⚠️  Creando archivo .env básico...${NC}"
            cat > .env << EOF
# Django Configuration
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# API Keys (IMPORTANTE: Configura estas claves)
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Model Configuration
OPENAI_MODEL=gpt-4
RAG_MAX_CONTEXT_LENGTH=4000
RAG_MAX_DOCUMENTS=10
RAG_EMBEDDING_MODEL=all-MiniLM-L6-v2
EOF
            echo -e "${GREEN}✅ Archivo .env básico creado${NC}"
        fi
    else
        echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
    fi
    
    cd ..
}

# Función para crear directorios necesarios
create_directories() {
    echo -e "${YELLOW}📁 Creando directorios necesarios...${NC}"
    
    mkdir -p logs
    mkdir -p backend/uploads
    mkdir -p backend/static
    
    echo -e "${GREEN}✅ Directorios creados${NC}"
}

# Función para ejecutar migraciones
run_migrations() {
    echo -e "${YELLOW}🗃️  Ejecutando migraciones de Django...${NC}"
    
    cd backend
    
    # Activar entorno virtual
    if [[ "$OS_TYPE" == "Windows" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    # Verificar que Django esté instalado
    if ! python -c "import django" 2>/dev/null; then
        echo -e "${RED}❌ Django no está instalado${NC}"
        echo -e "${YELLOW}💡 Instalando Django...${NC}"
        pip install django
    fi
    
    # Ejecutar migraciones
    python manage.py migrate
    
    cd ..
    echo -e "${GREEN}✅ Migraciones completadas${NC}"
}

# Función para verificar la instalación
verify_installation() {
    echo -e "${YELLOW}🔍 Verificando instalación...${NC}"
    
    # Verificar backend
    cd backend
    if [[ "$OS_TYPE" == "Windows" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    # Verificar Django
    if python -c "import django; print('Django version:', django.get_version())" 2>/dev/null; then
        echo -e "${GREEN}✅ Django instalado correctamente${NC}"
    else
        echo -e "${RED}❌ Django no está instalado${NC}"
    fi
    
    # Verificar que manage.py existe y funciona
    if [ -f "manage.py" ]; then
        python manage.py check --deploy 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Django project configurado correctamente${NC}"
        else
            echo -e "${YELLOW}⚠️  Django project tiene algunos warnings${NC}"
        fi
    else
        echo -e "${RED}❌ manage.py no encontrado${NC}"
    fi
    
    cd ..
    
    # Verificar frontend
    cd frontend
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ node_modules instalado${NC}"
    else
        echo -e "${RED}❌ node_modules no encontrado${NC}"
    fi
    
    if [ -f "package.json" ]; then
        echo -e "${GREEN}✅ package.json encontrado${NC}"
    else
        echo -e "${RED}❌ package.json no encontrado${NC}"
    fi
    
    cd ..
    
    echo -e "${GREEN}✅ Verificación completada${NC}"
}

# Función para mostrar instrucciones finales
show_final_instructions() {
    echo ""
    echo "=================================="
    echo -e "${BLUE}🎉 ¡Configuración completada!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Configura tus API keys${NC}"
    echo "   Edita el archivo backend/.env y configura:"
    echo "   - OPENAI_API_KEY=tu-api-key-aqui"
    echo "   - ANTHROPIC_API_KEY=tu-api-key-aqui"
    echo ""
    echo -e "${BLUE}📋 Para iniciar los servidores:${NC}"
    echo "   bash scripts/start_servers.sh"
    echo ""
    echo -e "${BLUE}📋 Para detener los servidores:${NC}"
    echo "   bash scripts/stop_servers.sh"
    echo ""
    echo -e "${BLUE}🌐 URLs de la aplicación:${NC}"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend:  http://localhost:8000"
    echo ""
    echo -e "${GREEN}🚀 ¡Listo para usar!${NC}"
}

# Función principal
main() {
    echo -e "${BLUE}🚀 Configurando Chat Agent AI desde cero...${NC}"
    echo "=================================="
    
    detect_os
    install_system_deps
    setup_python_env
    setup_frontend
    setup_env
    create_directories
    run_migrations
    verify_installation
    show_final_instructions
}

# Ejecutar función principal
main 