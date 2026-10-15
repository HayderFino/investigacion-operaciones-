use std::cmp::Ordering;
use std::collections::BinaryHeap;

#[derive(Copy, Clone, Eq, PartialEq)]
struct Estado {
    costo: usize,
    posicion: usize,
}

// Para usar BinaryHeap como Min-Heap (por defecto en Rust es Max-Heap)
// invertimos el orden de comparación.
impl Ord for Estado {
    fn cmp(&self, other: &Self) -> Ordering {
        other.costo.cmp(&self.costo)
            .then_with(|| self.posicion.cmp(&other.posicion))
    }
}

impl PartialOrd for Estado {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

struct Arista {
    nodo: usize,
    costo: usize,
}

// Algoritmo de Dijkstra
fn dijkstra(lista_adyacencia: &[Vec<Arista>], inicio: usize) -> Vec<usize> {
    // Inicializamos todas las distancias como "infinito" (usize::MAX)
    let mut distancias = vec![usize::MAX; lista_adyacencia.len()];
    let mut cola = BinaryHeap::new();

    // El nodo origen tiene distancia 0
    distancias[inicio] = 0;
    cola.push(Estado { costo: 0, posicion: inicio });

    while let Some(Estado { costo, posicion }) = cola.pop() {
        // Si encontramos una ruta más corta previamente, ignoramos esta
        if costo > distancias[posicion] {
            continue;
        }

        // Analizamos cada vecino
        for arista in &lista_adyacencia[posicion] {
            let siguiente = Estado {
                costo: costo + arista.costo,
                posicion: arista.nodo,
            };

            // Si la nueva distancia es menor a la guardada, actualizamos
            if siguiente.costo < distancias[siguiente.posicion] {
                cola.push(siguiente);
                distancias[siguiente.posicion] = siguiente.costo;
            }
        }
    }

    distancias
}

fn main() {
    // Este es el mismo grafo que se muestra en el archivo SVG.
    //
    //    (0)
    //   /   \
    //  2     1
    // /       \
    //(1)---3-->(2)
    
    let mut adyacencias = vec![Vec::new(); 3];
    
    // Conexiones desde el nodo 0
    adyacencias[0].push(Arista { nodo: 1, costo: 2 });
    adyacencias[0].push(Arista { nodo: 2, costo: 1 });
    
    // Conexiones desde el nodo 1
    adyacencias[1].push(Arista { nodo: 2, costo: 3 });
    
    let origen = 0;
    let distancias = dijkstra(&adyacencias, origen);
    
    println!("Distancias mínimas desde el nodo {}:", origen);
    for (nodo, &dist) in distancias.iter().enumerate() {
        if dist == usize::MAX {
            println!("Hasta el nodo {}: Inalcanzable", nodo);
        } else {
            println!("Hasta el nodo {}: {}", nodo, dist);
        }
    }
}
