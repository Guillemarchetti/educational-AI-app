#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

OS_TYPE="$(uname -s)"

function close_ports() {
    echo -e "${YELLOW}🔍 Verificando puertos en uso...${NC}"
    if [[ "$OS_TYPE" == "Linux" || "$OS_TYPE" == "Darwin" ]]; then
        # Mac/Linux
        for port in 3000 8000; do
            PIDS=$(lsof -ti tcp:$port)
            if [ ! -z "$PIDS" ]; then
                echo -e "${RED}⚠️  Cerrando procesos en puerto $port...${NC}"
                kill -9 $PIDS 2>/dev/null
            fi
        done
        echo -e "${GREEN}✅ Puertos liberados (Mac/Linux)${NC}"
    else
        # Windows (Git Bash/MSYS2/WSL)
        for port in 3000 8000; do
            PIDS=$(netstat -ano | grep :$port | awk '{print $5}' | head -1)
            if [ ! -z "$PIDS" ]; then
                echo -e "${RED}⚠️  Cerrando procesos en puerto $port...${NC}"
                taskkill //PID $PIDS //F 2>/dev/null
            fi
        done
        echo -e "${GREEN}✅ Puertos liberados (Windows)${NC}"
    fi
}

function check_dependencies() {
    echo -e "${YELLOW}🔍 Verificando dependencias...${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js no está instalado${NC}"
        exit 1
    fi
    if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python no está instalado${NC}"
        exit 1
    fi
    if [ ! -f "frontend/package.json" ]; then
        echo -e "${RED}❌ package.json no encontrado en frontend/. ¿Estás en el directorio correcto?${NC}"
        exit 1
    fi
    if [ ! -d "backend" ]; then
        echo -e "${RED}❌ Directorio 'backend' no encontrado${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencias verificadas${NC}"
}

function start_backend() {
    echo -e "${YELLOW}🐍 Iniciando backend Django...${NC}"
    cd backend
    if [ -d "venv" ]; then
        if [[ "$OS_TYPE" == "Linux" || "$OS_TYPE" == "Darwin" ]]; then
            source venv/bin/activate
        else
            source venv/Scripts/activate
        fi
        echo "   - Entorno virtual activado"
    else
        echo -e "${YELLOW}⚠️  No se encontró entorno virtual${NC}"
    fi
    
    # Cargar variables de entorno del archivo .env
    if [ -f ".env" ]; then
        export $(cat .env | xargs)
        echo "   - Variables de entorno cargadas desde .env"
    else
        echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    fi
    
    if [[ "$OS_TYPE" == "Linux" || "$OS_TYPE" == "Darwin" ]]; then
        nohup python3 manage.py runserver 8000 > ../logs/backend.log 2>&1 &
    else
        nohup python manage.py runserver 8000 > ../logs/backend.log 2>&1 &
    fi
    BACKEND_PID=$!
    cd ..
    sleep 10
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200\|404"; then
        echo -e "${GREEN}✅ Backend iniciado correctamente (PID: $BACKEND_PID)${NC}"
        echo "   - URL: http://localhost:8000"
        echo "   - Logs: logs/backend.log"
    else
        echo -e "${RED}❌ Error al iniciar el backend${NC}"
        echo "   - Revisa logs/backend.log para más detalles"
    fi
}

function start_frontend() {
    echo -e "${YELLOW}⚛️  Iniciando frontend Next.js...${NC}"
    cd frontend
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    sleep 5
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo -e "${GREEN}✅ Frontend iniciado correctamente (PID: $FRONTEND_PID)${NC}"
        echo "   - URL: http://localhost:3000"
        echo "   - Logs: logs/frontend.log"
    else
        echo -e "${RED}❌ Error al iniciar el frontend${NC}"
        echo "   - Revisa logs/frontend.log para más detalles"
    fi
}

function show_status() {
    echo ""
    echo "=================================="
    echo -e "${BLUE}📊 Estado de los servidores:${NC}"
    echo ""
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200\|404"; then
        echo -e "   Backend:  ${GREEN}✅ Funcionando${NC} - http://localhost:8000"
    else
        echo -e "   Backend:  ${RED}❌ No responde${NC}"
    fi
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo -e "   Frontend: ${GREEN}✅ Funcionando${NC} - http://localhost:3000"
    else
        echo -e "   Frontend: ${RED}❌ No responde${NC}"
    fi
    echo ""
    echo -e "${BLUE}📝 Comandos útiles:${NC}"
    echo "   - Ver logs del backend:  tail -f logs/backend.log"
    echo "   - Ver logs del frontend: tail -f logs/frontend.log"
    echo "   - Parar servidores:      ./scripts/stop_servers.sh"
    echo ""
    echo -e "${GREEN}🎉 ¡Aplicación lista!${NC}"
}

close_ports
check_dependencies
start_backend
start_frontend
show_status 