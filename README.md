# Investigación de Operaciones

Repositorio con implementaciones y cuaderno interactivo para algoritmos fundamentales de **Investigación de Operaciones** y teoría de grafos:

- **Algoritmo de Dijkstra**: Cálculo de la ruta más corta en grafos dirigidos y no dirigidos con pesos no negativos.
- **Algoritmo de Kruskal**: Determinación del Árbol de Expansión Mínima (MST) utilizando conjuntos disjuntos (Disjoint-Set / Union-Find) con compresión de caminos y unión por rango.

---

## Estructura del Proyecto

- **`dijkstra-web/`**: Aplicación web interactiva tipo "cuaderno de notas" con soporte para Dijkstra y Kruskal:
  - Visualización gráfica dinámica en SVG.
  - Tablas paso a paso y desglose de ecuaciones formateadas con KaTeX.
  - Soporte de presets, importación/exportación JSON y animación automática.
  - Pruebas unitarias y de integración en `tests/`.
- **`src/main.rs`** y **`Cargo.toml`**: Implementación en Rust del algoritmo de Dijkstra utilizando `BinaryHeap` (Min-Heap).
- **`dijkstra_ejemplo.svg`**: Esquema de ejemplo del grafo.

---

## Ejecución Local

### Aplicación Web
Para abrir la aplicación interactiva, puedes levantar un servidor local sencillo:

```bash
cd dijkstra-web
python3 -m http.server 8000
```

Y abrir en tu navegador: [http://localhost:8000/dijkstra-web/](http://localhost:8000/dijkstra-web/)

### Proyecto en Rust
Para compilar y ejecutar la versión CLI en Rust:

```bash
cargo run
```
