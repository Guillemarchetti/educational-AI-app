#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Parando ContextAI...${NC}"
echo "=================================="

# Función para cerrar puertos específicos
stop_servers() {
    echo -e "${YELLOW}🔍 Buscando servidores en ejecución...${NC}"
    
    # Buscar procesos en puertos 3000 y 8000
    FRONTEND_PIDS=$(lsof -ti:3000 2>/dev/null)
    BACKEND_PIDS=$(lsof -ti:8000 2>/dev/null)
    
    STOPPED_COUNT=0
    
    if [ ! -z "$FRONTEND_PIDS" ]; then
        echo -e "${YELLOW}🔄 Parando frontend (puerto 3000)...${NC}"
        for PID in $FRONTEND_PIDS; do
            kill -TERM $PID 2>/dev/null
            sleep 2
            # Si no se cerró con TERM, usar KILL
            if kill -0 $PID 2>/dev/null; then
                kill -9 $PID 2>/dev/null
            fi
            echo "   - Proceso $PID terminado"
            STOPPED_COUNT=$((STOPPED_COUNT + 1))
        done
    fi
    
    if [ ! -z "$BACKEND_PIDS" ]; then
        echo -e "${YELLOW}🔄 Parando backend (puerto 8000)...${NC}"
        for PID in $BACKEND_PIDS; do
            kill -TERM $PID 2>/dev/null
            sleep 2
            # Si no se cerró con TERM, usar KILL
            if kill -0 $PID 2>/dev/null; then
                kill -9 $PID 2>/dev/null
            fi
            echo "   - Proceso $PID terminado"
            STOPPED_COUNT=$((STOPPED_COUNT + 1))
        done
    fi
    
    if [ $STOPPED_COUNT -eq 0 ]; then
        echo -e "${GREEN}✅ No hay servidores ejecutándose${NC}"
    else
        echo -e "${GREEN}✅ $STOPPED_COUNT servidor(es) detenido(s)${NC}"
    fi
}

# Función para limpiar archivos de logs
cleanup_logs() {
    echo -e "${YELLOW}🧹 Limpiando archivos de logs...${NC}"
    
    if [ -f "backend.log" ]; then
        rm backend.log
        echo "   - backend.log eliminado"
    fi
    
    if [ -f "frontend.log" ]; then
        rm frontend.log
        echo "   - frontend.log eliminado"
    fi
    
    if [ -f "nohup.out" ]; then
        rm nohup.out
        echo "   - nohup.out eliminado"
    fi
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función para verificar estado final
verify_shutdown() {
    echo -e "${YELLOW}🔍 Verificando que los puertos estén libres...${NC}"
    
    sleep 2
    
    REMAINING_FRONTEND=$(lsof -ti:3000 2>/dev/null)
    REMAINING_BACKEND=$(lsof -ti:8000 2>/dev/null)
    
    if [ -z "$REMAINING_FRONTEND" ] && [ -z "$REMAINING_BACKEND" ]; then
        echo -e "${GREEN}✅ Todos los puertos están libres${NC}"
        echo "   - Puerto 3000: libre"
        echo "   - Puerto 8000: libre"
    else
        echo -e "${RED}⚠️  Algunos procesos aún están ejecutándose:${NC}"
        if [ ! -z "$REMAINING_FRONTEND" ]; then
            echo "   - Puerto 3000: $REMAINING_FRONTEND"
        fi
        if [ ! -z "$REMAINING_BACKEND" ]; then
            echo "   - Puerto 8000: $REMAINING_BACKEND"
        fi
    fi
}

# Función para mostrar estado final
show_final_status() {
    echo ""
    echo "=================================="
    echo -e "${BLUE}📊 Estado final:${NC}"
    echo ""
    
    # Verificar que los puertos estén libres
    if ! lsof -ti:3000,8000 >/dev/null 2>&1; then
        echo -e "   Servidores: ${GREEN}✅ Todos detenidos${NC}"
    else
        echo -e "   Servidores: ${YELLOW}⚠️  Algunos aún ejecutándose${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📝 Para reiniciar:${NC}"
    echo "   ./start_servers.sh"
    echo ""
    echo -e "${GREEN}🎉 ¡Servidores detenidos!${NC}"
}

# Ejecutar funciones principales
stop_servers
cleanup_logs
verify_shutdown
show_final_status 