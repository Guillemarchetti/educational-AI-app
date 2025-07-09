# Mensajes de Prueba para Markdown y LaTeX

## 1. Prueba de Markdown Básico
```
Explica este concepto usando markdown:

# Título Principal

## Subtítulo

**Texto en negrita** y *texto en cursiva*.

- Lista con viñetas
- Segundo elemento
- Tercer elemento

1. Lista numerada
2. Segundo elemento
3. Tercer elemento

> Cita importante sobre el tema.

`código inline` y bloques de código:

```python
def ejemplo():
    return 'Hola mundo'
```
```

## 2. Prueba de LaTeX Matemático
```
Explica estas fórmulas matemáticas:

## Ecuaciones Básicas

La ecuación cuadrática es: $ax^2 + bx + c = 0$

La fórmula cuadrática es: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

## Ecuaciones Avanzadas

La integral definida: $\int_{a}^{b} f(x) dx$

La derivada: $\frac{d}{dx} f(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$

## Matrices

Una matriz 2x2:

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

## Sumatorias

La suma de los primeros n números: $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$
```

## 3. Prueba Combinada Markdown + LaTeX
```
Crea una explicación que combine markdown y matemáticas:

# Álgebra Lineal

## Vectores

Un **vector** en $\mathbb{R}^n$ se define como:

$\vec{v} = (v_1, v_2, \ldots, v_n)$

## Producto Escalar

El producto escalar de dos vectores es:

$\vec{a} \cdot \vec{b} = \sum_{i=1}^{n} a_i b_i$

## Matriz de Transformación

Una matriz de transformación lineal:

$$
A = \begin{pmatrix}
\cos \theta & -\sin \theta \\
\sin \theta & \cos \theta
\end{pmatrix}
$$

> **Nota**: Esta matriz representa una rotación de $\theta$ radianes.
```

## 4. Prueba de Tablas y Listas
```
Crea una tabla con datos matemáticos:

| Concepto | Fórmula | Ejemplo |
|----------|---------|---------|
| Derivada | $\frac{d}{dx} x^n = nx^{n-1}$ | $\frac{d}{dx} x^3 = 3x^2$ |
| Integral | $\int x^n dx = \frac{x^{n+1}}{n+1} + C$ | $\int x^2 dx = \frac{x^3}{3} + C$ |
| Límite | $\lim_{x \to a} f(x)$ | $\lim_{x \to 0} \frac{\sin x}{x} = 1$ |

Y una lista de propiedades:

1. **Conmutatividad**: $a + b = b + a$
2. **Asociatividad**: $(a + b) + c = a + (b + c)$
3. **Distributividad**: $a(b + c) = ab + ac$
```

## 5. Prueba de Código con Matemáticas
```
Explica este código que implementa la fórmula cuadrática:

```python
import math

def quadratic_formula(a, b, c):
    """
    Resuelve la ecuación cuadrática: ax² + bx + c = 0
    
    Fórmula: x = (-b ± √(b² - 4ac)) / (2a)
    """
    discriminant = b**2 - 4*a*c
    
    if discriminant < 0:
        return "No hay soluciones reales"
    elif discriminant == 0:
        x = -b / (2*a)
        return f"x = {x}"
    else:
        x1 = (-b + math.sqrt(discriminant)) / (2*a)
        x2 = (-b - math.sqrt(discriminant)) / (2*a)
        return f"x₁ = {x1}, x₂ = {x2}"

# Ejemplo de uso
print(quadratic_formula(1, -5, 6))  # x² - 5x + 6 = 0
```

La fórmula implementada es: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
```

## 6. Prueba de Ecuaciones Complejas
```
Explica estas ecuaciones de física:

## Mecánica Clásica

### Energía Cinética
$E_k = \frac{1}{2}mv^2$

### Energía Potencial Gravitacional
$E_p = mgh$

### Conservación de Energía
$E_{total} = E_k + E_p = \text{constante}$

## Electromagnetismo

### Ley de Coulomb
$\vec{F} = k\frac{q_1 q_2}{r^2}\hat{r}$

### Campo Eléctrico
$\vec{E} = \frac{\vec{F}}{q} = k\frac{Q}{r^2}\hat{r}$

### Potencial Eléctrico
$V = k\frac{Q}{r}$
```

## Instrucciones de Prueba

1. **Abre** http://localhost:3000 en tu navegador
2. **Copia y pega** cualquiera de estos mensajes en el chat
3. **Envía el mensaje** y observa cómo se renderiza
4. **Verifica** que:
   - Los títulos se muestren correctamente
   - Las fórmulas matemáticas se rendericen
   - Las tablas tengan formato adecuado
   - Los bloques de código tengan syntax highlighting
   - Los enlaces funcionen correctamente

## Elementos a Verificar

### Markdown:
- ✅ Títulos (# ## ###)
- ✅ Negrita (**texto**)
- ✅ Cursiva (*texto*)
- ✅ Listas (- y 1.)
- ✅ Citas (> texto)
- ✅ Código inline (`código`)
- ✅ Bloques de código (``` ```)
- ✅ Tablas (| columna |)
- ✅ Enlaces ([texto](url))

### LaTeX:
- ✅ Ecuaciones inline ($...$)
- ✅ Ecuaciones display ($$...$$)
- ✅ Fracciones (\frac{a}{b})
- ✅ Raíces (\sqrt{x})
- ✅ Exponentes (x^n)
- ✅ Subíndices (x_i)
- ✅ Sumatorias (\sum)
- ✅ Integrales (\int)
- ✅ Límites (\lim)
- ✅ Matrices (\begin{pmatrix})
- ✅ Vectores (\vec{v})
- ✅ Símbolos griegos (\alpha, \pi) 