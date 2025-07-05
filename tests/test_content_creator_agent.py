#!/usr/bin/env python3
"""
Script de prueba para el Content Creator Agent
Demuestra la generación de contenido interactivo matemático
"""

import sys
import os
import json

# Agregar el directorio del proyecto al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Importar el agente (simulado para testing)
class MockContentCreatorAgent:
    """Versión mock del Content Creator Agent para testing"""
    
    def get_agent_name(self):
        return "Creador de Contenido Interactivo"
    
    def generate_simulation_prompt(self, concept, level, context_docs=None):
        """Generar prompt de simulación matemática"""
        
        # Simulaciones predefinidas para demostración
        simulations = {
            'funciones_lineales': {
                "titulo": "Laboratorio de Pendientes Interactivo",
                "concepto_matematico": "Funciones Lineales y = mx + b",
                "nivel_educativo": level,
                "prompt_generacion": f"""
SIMULACIÓN: Laboratorio de Pendientes Interactivo

OBJETIVO: Explorar cómo los parámetros m (pendiente) y b (ordenada al origen) afectan la gráfica de una función lineal.

ELEMENTOS INTERACTIVOS:
1. Slider para pendiente (m): rango -10 a 10, paso 0.1
2. Slider para ordenada al origen (b): rango -20 a 20, paso 0.5
3. Plano cartesiano dinámico con cuadrícula ajustable
4. Tabla de valores que se actualiza automáticamente
5. Ecuación mostrada en tiempo real: y = [m]x + [b]

IMPLEMENTACIÓN TÉCNICA:
- HTML5 sliders con eventos onchange
- Canvas 2D para renderizado de gráfica
- JavaScript para cálculos matemáticos
- CSS para animaciones suaves

GAMIFICACIÓN:
- Desafío: "Encuentra la función que pasa por estos puntos"
- Logros: "Maestro de Pendientes", "Explorador Matemático"
- Puntuación basada en precisión y velocidad

CONTEXTO EDUCATIVO: {level}
DOCUMENTOS DE REFERENCIA: {context_docs or 'Ninguno'}
                """,
                "elementos_interactivos": [
                    "Slider para pendiente (m): -10 a 10",
                    "Slider para ordenada al origen (b): -20 a 20", 
                    "Plano cartesiano interactivo",
                    "Tabla de valores dinámica",
                    "Botones de contexto (física, economía)"
                ]
            },
            
            'fracciones_equivalentes': {
                "titulo": "Fábrica de Fracciones Equivalentes",
                "concepto_matematico": "Fracciones Equivalentes",
                "nivel_educativo": level,
                "prompt_generacion": f"""
SIMULACIÓN: Fábrica de Fracciones Equivalentes

OBJETIVO: Descubrir visualmente que diferentes fracciones pueden representar la misma cantidad.

ELEMENTOS INTERACTIVOS:
1. Círculos divisibles en sectores (denominador ajustable)
2. Selector de partes coloreadas (numerador)
3. Barras de fracciones paralelas para comparación
4. Generador automático de fracciones equivalentes
5. Verificador de equivalencia con animación

MECÁNICA PRINCIPAL:
- Arrastrar para dividir círculos y barras
- Colorear partes para representar fracciones
- Animaciones de transformación entre representaciones
- Feedback inmediato de equivalencia

GAMIFICACIÓN:
- "Detective de Fracciones": encuentra todas las equivalentes
- "Constructor": crea la fracción más compleja equivalente a 1/2
- Sistema de estrellas por descubrimientos

NIVEL EDUCATIVO: {level}
DOCUMENTOS BASE: {context_docs or 'Guías de matemáticas 6to grado'}
                """,
                "elementos_interactivos": [
                    "Círculo divisible en sectores",
                    "Selector de partes coloreadas",
                    "Barra de fracciones paralela",
                    "Generador automático de equivalentes",
                    "Verificador con animación"
                ]
            },
            
            'estadistica_datos_medicos': {
                "titulo": "Laboratorio de Estadística Médica",
                "concepto_matematico": "Estadística Descriptiva con Datos Reales",
                "nivel_educativo": level,
                "prompt_generacion": f"""
SIMULACIÓN: Laboratorio de Estadística Médica

OBJETIVO: Analizar datos reales de glucosa para comprender medidas de tendencia central y dispersión.

DATOS FUENTE: Análisis de glucosa de 10 meses (archivos reales del sistema)

ELEMENTOS INTERACTIVOS:
1. Gráfica de dispersión con datos de glucosa en el tiempo
2. Calculadora interactiva de media, mediana, moda
3. Slider temporal para filtrar datos por período
4. Identificador automático de valores atípicos (outliers)
5. Generador de conclusiones médicas básicas

FUNCIONALIDADES AVANZADAS:
- Comparación entre diferentes períodos
- Predicción de tendencias
- Interpretación médica automatizada
- Exportación de reportes

GAMIFICACIÓN:
- "Detective de Datos": encuentra patrones ocultos
- "Médico Estadístico": interpreta resultados correctamente
- "Predictor": estima valores futuros con precisión

NIVEL: {level}
CONTEXTO REAL: Datos médicos anonimizados del sistema
                """,
                "elementos_interactivos": [
                    "Gráfica de dispersión temporal",
                    "Calculadora de estadísticas",
                    "Slider de filtro temporal",
                    "Detector de outliers",
                    "Generador de conclusiones"
                ]
            }
        }
        
        # Determinar qué simulación generar
        concept_key = concept.lower().replace(' ', '_')
        if concept_key in simulations:
            return simulations[concept_key]
        else:
            # Simulación genérica
            return {
                "titulo": f"Simulación Interactiva: {concept}",
                "concepto_matematico": concept,
                "nivel_educativo": level,
                "prompt_generacion": f"""
SIMULACIÓN PERSONALIZADA: {concept}

OBJETIVO: Explorar el concepto de {concept} de manera interactiva y visual.

ELEMENTOS BÁSICOS:
- Interfaz intuitiva adaptada al nivel {level}
- Controles interactivos apropiados para el concepto
- Visualización dinámica y atractiva
- Retroalimentación inmediata
- Sistema de progreso y logros

IMPLEMENTACIÓN:
- Tecnologías web modernas (HTML5, CSS3, JavaScript)
- Responsive design para múltiples dispositivos
- Accesibilidad completa
- Analytics de uso integrados

CONTEXTO: {context_docs or 'Documentos matemáticos generales'}
                """,
                "elementos_interactivos": [
                    "Controles interactivos principales",
                    "Visualización dinámica",
                    "Sistema de retroalimentación",
                    "Herramientas de exploración"
                ]
            }

def test_content_creator_agent():
    """Función principal de testing"""
    print("🎮 TESTING: Content Creator Agent")
    print("=" * 50)
    
    # Crear instancia del agente
    agent = MockContentCreatorAgent()
    
    # Casos de prueba
    test_cases = [
        {
            "concepto": "Funciones Lineales",
            "nivel": "Secundaria",
            "contexto": ["6G_GD_Modulo_16_Matemática.pdf"],
            "descripcion": "Simulación de funciones lineales para secundaria"
        },
        {
            "concepto": "Fracciones Equivalentes", 
            "nivel": "6to Grado",
            "contexto": ["6G_GD_Modulo_13_Matemática.pdf"],
            "descripcion": "Actividad interactiva de fracciones para primaria"
        },
        {
            "concepto": "Estadística Datos Médicos",
            "nivel": "Preparatoria",
            "contexto": ["analisis_glucosa_01_2024.txt", "analisis_glucosa_02_2024.txt"],
            "descripcion": "Análisis estadístico con datos reales médicos"
        },
        {
            "concepto": "Geometría Plana",
            "nivel": "Secundaria", 
            "contexto": [],
            "descripcion": "Simulación genérica de geometría"
        }
    ]
    
    # Ejecutar casos de prueba
    for i, caso in enumerate(test_cases, 1):
        print(f"\n🧪 CASO DE PRUEBA {i}: {caso['descripcion']}")
        print("-" * 40)
        
        # Generar simulación
        simulacion = agent.generate_simulation_prompt(
            caso['concepto'],
            caso['nivel'],
            caso['contexto']
        )
        
        # Mostrar resultados
        print(f"📋 TÍTULO: {simulacion['titulo']}")
        print(f"🎯 CONCEPTO: {simulacion['concepto_matematico']}")
        print(f"🎓 NIVEL: {simulacion['nivel_educativo']}")
        
        print(f"\n🔧 ELEMENTOS INTERACTIVOS:")
        for elemento in simulacion['elementos_interactivos']:
            print(f"   • {elemento}")
        
        print(f"\n📝 PROMPT PARA DESARROLLADOR:")
        print(simulacion['prompt_generacion'])
        
        print("\n" + "="*50)

def generate_implementation_examples():
    """Generar ejemplos de implementación práctica"""
    print("\n🛠️  EJEMPLOS DE IMPLEMENTACIÓN")
    print("=" * 50)
    
    # Ejemplo 1: HTML básico para simulación de funciones lineales
    html_example = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laboratorio de Pendientes</title>
    <style>
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .controls { display: flex; gap: 20px; margin-bottom: 20px; }
        .slider-group { display: flex; flex-direction: column; }
        #canvas { border: 1px solid #ccc; background: white; }
        .equation { font-size: 24px; font-weight: bold; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Laboratorio de Pendientes Interactivo</h1>
        
        <div class="controls">
            <div class="slider-group">
                <label>Pendiente (m): <span id="m-value">1</span></label>
                <input type="range" id="m-slider" min="-10" max="10" step="0.1" value="1">
            </div>
            <div class="slider-group">
                <label>Ordenada (b): <span id="b-value">0</span></label>
                <input type="range" id="b-slider" min="-20" max="20" step="0.5" value="0">
            </div>
        </div>
        
        <div class="equation" id="equation">y = 1x + 0</div>
        
        <canvas id="canvas" width="800" height="600"></canvas>
        
        <div id="points-table">
            <h3>Tabla de Valores</h3>
            <table id="values-table">
                <tr><th>x</th><th>y</th></tr>
            </table>
        </div>
    </div>
    
    <script>
        // JavaScript para la simulación interactiva
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const mSlider = document.getElementById('m-slider');
        const bSlider = document.getElementById('b-slider');
        
        function drawFunction() {
            const m = parseFloat(mSlider.value);
            const b = parseFloat(bSlider.value);
            
            // Limpiar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar ejes
            drawAxes();
            
            // Dibujar función
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let x = -400; x <= 400; x += 5) {
                const realX = x / 40; // Escala
                const realY = m * realX + b;
                const canvasX = x + 400;
                const canvasY = 300 - (realY * 40);
                
                if (x === -400) ctx.moveTo(canvasX, canvasY);
                else ctx.lineTo(canvasX, canvasY);
            }
            ctx.stroke();
            
            // Actualizar ecuación
            document.getElementById('equation').textContent = `y = ${m}x + ${b}`;
            document.getElementById('m-value').textContent = m;
            document.getElementById('b-value').textContent = b;
            
            // Actualizar tabla
            updateTable(m, b);
        }
        
        function drawAxes() {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            
            // Eje X
            ctx.beginPath();
            ctx.moveTo(0, 300);
            ctx.lineTo(800, 300);
            ctx.stroke();
            
            // Eje Y  
            ctx.beginPath();
            ctx.moveTo(400, 0);
            ctx.lineTo(400, 600);
            ctx.stroke();
        }
        
        function updateTable(m, b) {
            const table = document.getElementById('values-table');
            // Limpiar tabla excepto header
            while(table.rows.length > 1) {
                table.deleteRow(1);
            }
            
            // Agregar valores
            for (let x = -5; x <= 5; x++) {
                const y = m * x + b;
                const row = table.insertRow();
                row.insertCell(0).textContent = x;
                row.insertCell(1).textContent = y.toFixed(2);
            }
        }
        
        // Event listeners
        mSlider.addEventListener('input', drawFunction);
        bSlider.addEventListener('input', drawFunction);
        
        // Dibujo inicial
        drawFunction();
    </script>
</body>
</html>
    """
    
    print("📄 EJEMPLO HTML - Laboratorio de Pendientes:")
    print(html_example)
    
    # Ejemplo 2: Configuración React component
    react_example = """
// Componente React para simulación de fracciones
import React, { useState, useEffect } from 'react';
import { Slider, Card, Button } from '@/components/ui';

const FractionSimulator = () => {
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(2);
  const [equivalents, setEquivalents] = useState([]);

  const generateEquivalents = () => {
    const eq = [];
    for (let i = 2; i <= 6; i++) {
      eq.push({
        num: numerator * i,
        den: denominator * i
      });
    }
    setEquivalents(eq);
  };

  useEffect(() => {
    generateEquivalents();
  }, [numerator, denominator]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">🎮 Fábrica de Fracciones Equivalentes</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3>Fracción Original</h3>
          <div className="mb-4">
            <label>Numerador: {numerator}</label>
            <Slider 
              value={numerator} 
              onChange={setNumerator}
              min={1} max={10} 
            />
          </div>
          <div className="mb-4">
            <label>Denominador: {denominator}</label>
            <Slider 
              value={denominator} 
              onChange={setDenominator}
              min={2} max={12} 
            />
          </div>
          
          <div className="text-4xl text-center">
            {numerator}/{denominator}
          </div>
        </div>
        
        <div>
          <h3>Fracciones Equivalentes</h3>
          {equivalents.map((eq, i) => (
            <div key={i} className="text-2xl mb-2">
              {eq.num}/{eq.den}
            </div>
          ))}
          
          <Button onClick={generateEquivalents} className="mt-4">
            🔄 Generar Más Equivalentes
          </Button>
        </div>
      </div>
      
      <FractionVisualizer 
        numerator={numerator} 
        denominator={denominator} 
      />
    </Card>
  );
};

export default FractionSimulator;
    """
    
    print("\n⚛️  EJEMPLO REACT - Simulador de Fracciones:")
    print(react_example)

if __name__ == "__main__":
    # Ejecutar tests
    test_content_creator_agent()
    
    # Generar ejemplos de implementación
    generate_implementation_examples()
    
    print("\n✅ TESTING COMPLETADO")
    print("\n💡 PRÓXIMOS PASOS:")
    print("1. Integrar el agente real con OpenAI API")
    print("2. Implementar las simulaciones en el frontend")
    print("3. Conectar con el sistema de documentos existente")
    print("4. Agregar analytics y métricas de uso")
    print("5. Crear sistema de evaluación automática") 