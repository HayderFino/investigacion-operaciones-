---
name: "Reglas Generales de Trabajo"
description: "Establece las reglas de planificación, código limpio, pruebas y diseño estético para todo el proyecto."
---

# REGLAS GENERALES DE TRABAJO (aplican a todo el proyecto)

1. **PLANIFICA ANTES DE ESCRIBIR CÓDIGO**
   Primero entrega un plan breve: estructura de archivos, responsabilidad de cada uno y orden de construcción. Espera mi confirmación solo si encuentras una ambigüedad que cambie el resultado; si no, continúa.

2. **SI ALGO NO ESTÁ CLARO, PREGUNTA O DECLARA TU SUPUESTO**
   No adivines en silencio. Si tomas una decisión por tu cuenta, anótala en una línea ("Supuesto: ...") para que yo pueda corregirla.

3. **LA LÓGICA VA PRIMERO Y SE DEMUESTRA**
   Construye el algoritmo y sus pruebas antes que la interfaz. No afirmes que algo "funciona" sin haberlo verificado con pruebas. Si no puedes ejecutar el código, dilo explícitamente y explica cómo lo verificaría yo.

4. **NADA INVENTADO**
   Ningún número, ecuación ni explicación puede estar escrito a mano para un grafo específico. Todo se genera a partir del estado real del algoritmo.

5. **SIN SOLUCIONES PARCIALES DISFRAZADAS**
   No uses "// TODO", "aquí va el resto", funciones vacías ni datos de relleno. Si no alcanzas a terminar algo, dime exactamente qué falta en lugar de entregarlo a medias como si estuviera completo.

6. **ALCANCE CONTROLADO**
   Implementa lo que pido, sin agregar funciones, librerías ni pantallas que no están en el prompt. Si crees que algo extra aportaría valor, propónlo al final sin implementarlo.

7. **CÓDIGO LIMPIO Y MANTENIBLE**
   Archivos pequeños con una sola responsabilidad, nombres descriptivos en español para lo educativo (mensajes, textos) y consistentes en el código, sin código duplicado y sin variables globales innecesarias.

8. **DEPENDENCIAS MÍNIMAS**
   Solo KaTeX o MathJax y las fuentes indicadas. Nada de frameworks ni dependencias que requieran instalación o compilación. Si algo debe cargarse desde internet, incluye una alternativa de respaldo.

9. **EL DISEÑO SIGUE LA DIRECCIÓN ESTÉTICA INDICADA**
   No uses estilos por defecto de la IA. Si dudas entre una opción "segura" y una fiel a la dirección estética del prompt, elige la fiel.

10. **REVISIÓN FINAL ANTES DE ENTREGAR**
    Antes de darme el resultado, repasa la lista del criterio de aceptación y la sección de casos especiales, y dime qué cumple, qué no y qué no pudiste comprobar.

11. **FORMATO DE LA RESPUESTA**
    Responde en español. Muestra el avance por etapas (algoritmo, historial, interfaz) y resume al final qué se hizo, cómo ejecutarlo y qué queda pendiente.
