// ═══════════════════════════════════════════════════════════════
//  ejercicios.js — Interactive graphs & KaTeX for the exercises page
// ═══════════════════════════════════════════════════════════════

// ── Problem 1 Graph Data (Kruskal – Fiber Optic) ──────────────
const P1_NODES = {
    A: { x: 120, y: 100 },
    B: { x: 320, y: 60 },
    C: { x: 320, y: 240 },
    D: { x: 120, y: 360 },
    E: { x: 520, y: 360 },
    F: { x: 580, y: 120 }
};

const P1_EDGES = [
    { u: 'A', v: 'B', w: 14 },
    { u: 'B', v: 'F', w: 20 },
    { u: 'A', v: 'C', w: 22 },
    { u: 'A', v: 'D', w: 25 },
    { u: 'C', v: 'F', w: 27 },
    { u: 'D', v: 'E', w: 28 },
    { u: 'B', v: 'C', w: 30 },
    { u: 'C', v: 'D', w: 35 },
    { u: 'E', v: 'F', w: 38 },
    { u: 'A', v: 'E', w: 40 }
];

const P1_MST = ['A-B', 'B-F', 'A-C', 'A-D', 'D-E'];

// Part b MST (without A-D)
const P1B_MST = ['A-B', 'B-F', 'A-C', 'D-E', 'C-D'];
const P1B_REJECTED = ['A-D', 'C-F', 'B-C'];

// ── Problem 2 Graph Data (Dijkstra – Latency) ────────────────
const P2_NODES = {
    S: { x: 80, y: 240 },
    A: { x: 240, y: 120 },
    B: { x: 240, y: 360 },
    C: { x: 450, y: 120 },
    D: { x: 450, y: 360 },
    E: { x: 600, y: 240 },
    T: { x: 740, y: 240 }
};

const P2_EDGES = [
    { u: 'S', v: 'A', w: 4 },
    { u: 'S', v: 'B', w: 7 },
    { u: 'A', v: 'B', w: 2 },
    { u: 'A', v: 'C', w: 5 },
    { u: 'B', v: 'D', w: 4 },
    { u: 'C', v: 'E', w: 3 },
    { u: 'D', v: 'E', w: 2 },
    { u: 'C', v: 'T', w: 8 },
    { u: 'E', v: 'T', w: 4 },
    { u: 'D', v: 'T', w: 9 }
];

// Optimal paths
const P2_ROUTE1 = ['S', 'A', 'C', 'E', 'T'];
const P2_ROUTE2 = ['S', 'A', 'B', 'D', 'E', 'T'];

// Part b (E-T fails)
const P2B_ROUTE = ['S', 'A', 'C', 'T'];
const P2B_REMOVED = 'E-T';

// ── SVG Drawing Utilities ─────────────────────────────────────
const NS = 'http://www.w3.org/2000/svg';

function edgeKey(u, v) {
    return u < v ? `${u}-${v}` : `${v}-${u}`;
}

function routeEdges(route) {
    const set = new Set();
    for (let i = 0; i < route.length - 1; i++) {
        set.add(edgeKey(route[i], route[i + 1]));
    }
    return set;
}

function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
    }
    return el;
}

function drawGraph(svgId, nodes, edges, options = {}) {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    svg.innerHTML = '';

    const {
        mstEdges = null,        // Set of "u-v" keys in MST
        rejectedEdges = null,   // Set of "u-v" keys rejected
        removedEdges = null,    // Set of "u-v" keys removed (failed)
        route1Edges = null,     // Set of "u-v" keys for route 1
        route2Edges = null,     // Set of "u-v" keys for route 2
        nodeDistances = null,   // Map of node -> distance label
        permanentNodes = null   // Set of permanent nodes
    } = options;

    const edgesGroup = createSVGElement('g');
    const nodesGroup = createSVGElement('g');

    // Draw edges
    for (const edge of edges) {
        const p1 = nodes[edge.u];
        const p2 = nodes[edge.v];
        if (!p1 || !p2) continue;

        const key = edgeKey(edge.u, edge.v);

        // Check if this edge is removed
        if (removedEdges && removedEdges.has(key)) {
            // Draw dashed and very faded
            const line = createSVGElement('line', {
                x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
                stroke: 'rgba(179, 38, 30, 0.25)',
                'stroke-width': '2',
                'stroke-dasharray': '6,6'
            });
            edgesGroup.appendChild(line);

            // Draw a big X on it
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const cross = createSVGElement('text', {
                x: mx, y: my + 5,
                fill: 'var(--ink-red)',
                'font-family': 'var(--font-serif)',
                'font-size': '18px',
                'font-weight': 'bold',
                'text-anchor': 'middle'
            });
            cross.textContent = '✕';
            edgesGroup.appendChild(cross);
            continue;
        }

        let strokeColor = 'rgba(31, 46, 90, 0.3)';
        let strokeWidth = '2';
        let dashArray = '';
        let animate = false;

        if (mstEdges && mstEdges.has(key)) {
            strokeColor = 'var(--ink-green)';
            strokeWidth = '5';
            animate = true;
        } else if (rejectedEdges && rejectedEdges.has(key)) {
            strokeColor = 'rgba(179, 38, 30, 0.35)';
            strokeWidth = '2';
            dashArray = '5,4';
        } else if (route1Edges && route1Edges.has(key) && route2Edges && route2Edges.has(key)) {
            // Both routes share this edge
            strokeColor = 'var(--ink-green)';
            strokeWidth = '5';
            animate = true;
        } else if (route1Edges && route1Edges.has(key)) {
            strokeColor = 'var(--ink-green)';
            strokeWidth = '4';
            animate = true;
        } else if (route2Edges && route2Edges.has(key)) {
            strokeColor = 'var(--ink-ochre)';
            strokeWidth = '4';
            animate = true;
        }

        const line = createSVGElement('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: strokeColor,
            'stroke-width': strokeWidth,
            ...(dashArray ? { 'stroke-dasharray': dashArray } : {}),
            'stroke-linecap': 'round'
        });

        if (animate) {
            const anim = createSVGElement('animate', {
                attributeName: 'stroke-opacity',
                values: '0.6;1;0.6',
                dur: '2.5s',
                repeatCount: 'indefinite'
            });
            line.appendChild(anim);
        }

        edgesGroup.appendChild(line);

        // Edge weight label
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        // Offset label to avoid overlapping the line
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const ox = (-dy / len) * 14;
        const oy = (dx / len) * 14;

        const bg = createSVGElement('rect', {
            x: mx + ox - 14, y: my + oy - 12,
            width: 28, height: 18, rx: 3,
            fill: 'var(--bg-paper)',
            stroke: 'rgba(31,46,90,0.15)',
            'stroke-width': '1'
        });
        edgesGroup.appendChild(bg);

        const text = createSVGElement('text', {
            x: mx + ox, y: my + oy + 2,
            fill: 'var(--ink-red)',
            'font-family': 'var(--font-mono)',
            'font-size': '13px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        text.textContent = edge.w;
        edgesGroup.appendChild(text);
    }

    // Draw nodes
    for (const [name, pos] of Object.entries(nodes)) {
        const g = createSVGElement('g', {
            transform: `translate(${pos.x}, ${pos.y})`
        });

        let circStroke = 'var(--ink-dark)';
        let circWidth = '2';
        let circFill = 'var(--bg-paper)';

        if (permanentNodes && permanentNodes.has(name)) {
            circStroke = 'var(--ink-green)';
            circWidth = '4';
        }

        const circle = createSVGElement('circle', {
            cx: 0, cy: 0, r: 22,
            fill: circFill,
            stroke: circStroke,
            'stroke-width': circWidth
        });
        g.appendChild(circle);

        const label = createSVGElement('text', {
            y: 6,
            'text-anchor': 'middle',
            'font-family': 'var(--font-serif)',
            'font-weight': 'bold',
            'font-size': '16px',
            fill: 'var(--ink-dark)'
        });
        label.textContent = name;
        g.appendChild(label);

        // Distance label above node
        if (nodeDistances && nodeDistances.has(name)) {
            const dist = nodeDistances.get(name);
            const distBg = createSVGElement('rect', {
                x: -22, y: -42, width: 44, height: 17, rx: 3,
                fill: 'var(--bg-paper)'
            });
            g.appendChild(distBg);

            const distLabel = createSVGElement('text', {
                y: -28,
                'text-anchor': 'middle',
                'font-family': 'var(--font-hand)',
                'font-size': '15px',
                fill: permanentNodes && permanentNodes.has(name) ? 'var(--ink-green)' : 'var(--ink-ochre)'
            });
            distLabel.textContent = `d=${dist}`;
            g.appendChild(distLabel);
        }

        nodesGroup.appendChild(g);
    }

    svg.appendChild(edgesGroup);
    svg.appendChild(nodesGroup);
}

// ── Render All Graphs ─────────────────────────────────────────

function renderProblem1Graph() {
    const mstSet = new Set(P1_MST);
    const rejSet = new Set(
        P1_EDGES.map(e => edgeKey(e.u, e.v)).filter(k => !mstSet.has(k))
    );
    // Only mark truly rejected edges (those evaluated and rejected by Kruskal)
    const rejectedOnly = new Set(['C-F']);

    drawGraph('graph-p1', P1_NODES, P1_EDGES, {
        mstEdges: mstSet,
        rejectedEdges: rejectedOnly
    });
}

function renderProblem1bGraph() {
    const mstSet = new Set(P1B_MST);
    const rejSet = new Set(P1B_REJECTED);
    const removedSet = new Set(['A-D']);

    drawGraph('graph-p1b', P1_NODES, P1_EDGES, {
        mstEdges: mstSet,
        rejectedEdges: rejSet,
        removedEdges: removedSet
    });
}

function renderProblem2Graph() {
    const r1 = routeEdges(P2_ROUTE1);
    const r2 = routeEdges(P2_ROUTE2);

    const allPermanent = new Set(Object.keys(P2_NODES));
    const distances = new Map([
        ['S', 0], ['A', 4], ['B', 6], ['C', 9], ['D', 10], ['E', 12], ['T', 16]
    ]);

    drawGraph('graph-p2', P2_NODES, P2_EDGES, {
        route1Edges: r1,
        route2Edges: r2,
        nodeDistances: distances,
        permanentNodes: allPermanent
    });
}

function renderProblem2bGraph() {
    const r = routeEdges(P2B_ROUTE);
    const removedSet = new Set([P2B_REMOVED]);

    const distances = new Map([
        ['S', 0], ['A', 4], ['B', 6], ['C', 9], ['D', 10], ['E', 12], ['T', 17]
    ]);
    const allPermanent = new Set(Object.keys(P2_NODES));

    drawGraph('graph-p2b', P2_NODES, P2_EDGES, {
        route1Edges: r,
        removedEdges: removedSet,
        nodeDistances: distances,
        permanentNodes: allPermanent
    });
}

// ── Tab Switching ─────────────────────────────────────────────
function switchProblem(num) {
    document.querySelectorAll('.problem-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.prob === String(num));
    });
    document.querySelectorAll('.problem-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    const panel = document.getElementById(`panel-prob${num}`);
    if (panel) {
        panel.style.display = 'block';
        // Re-trigger animations
        panel.style.animation = 'none';
        panel.offsetHeight; // force reflow
        panel.style.animation = '';
    }

    if (num === 1) {
        renderProblem1Graph();
        renderProblem1bGraph();
    } else {
        renderProblem2Graph();
        renderProblem2bGraph();
    }
}

document.getElementById('tab-prob1')?.addEventListener('click', () => switchProblem(1));
document.getElementById('tab-prob2')?.addEventListener('click', () => switchProblem(2));

// ── KaTeX Rendering ───────────────────────────────────────────
function renderAllMath() {
    // Display math (block)
    document.querySelectorAll('.math-display[data-latex], .math-eq[data-latex]').forEach(el => {
        const latex = el.getAttribute('data-latex');
        if (!latex) return;
        if (window.katex) {
            try {
                katex.render(latex, el, {
                    throwOnError: false,
                    displayMode: el.classList.contains('math-display')
                });
            } catch (e) {
                el.textContent = latex
                    .replace(/\\boxed\{([^}]+)\}/g, '[$1]')
                    .replace(/\\text\{([^}]+)\}/g, '$1')
                    .replace(/\\infty/g, '∞')
                    .replace(/\\min/g, 'min')
                    .replace(/\\times/g, '×')
                    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
                    .replace(/\\quad/g, '  ')
                    .replace(/\\,/g, ',')
                    .replace(/\{|\}/g, '');
            }
        } else {
            el.textContent = latex
                .replace(/\\boxed\{([^}]+)\}/g, '[$1]')
                .replace(/\\text\{([^}]+)\}/g, '$1')
                .replace(/\\infty/g, '∞')
                .replace(/\\min/g, 'min')
                .replace(/\\times/g, '×')
                .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
                .replace(/\\quad/g, '  ')
                .replace(/\\,/g, ',')
                .replace(/\{|\}/g, '');
        }
    });

    // Inline math
    document.querySelectorAll('.katex-inline[data-latex]').forEach(el => {
        const latex = el.getAttribute('data-latex');
        if (!latex) return;
        if (window.katex) {
            try {
                katex.render(latex, el, { throwOnError: false, displayMode: false });
            } catch (e) {
                el.textContent = latex.replace(/\{|\}/g, '');
            }
        } else {
            el.textContent = latex.replace(/\{|\}/g, '');
        }
    });
}

// ── Initialization ────────────────────────────────────────────
function init() {
    renderAllMath();
    // Render initial graphs (Problem 1 is visible by default)
    renderProblem1Graph();
    renderProblem1bGraph();
}

// Try rendering math immediately and again on load (for deferred KaTeX)
init();
window.addEventListener('load', () => {
    renderAllMath();
    renderProblem1Graph();
    renderProblem1bGraph();
});
