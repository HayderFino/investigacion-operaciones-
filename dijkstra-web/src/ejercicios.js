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

// ── Problem 3 Graph Data (Ford-Fulkerson – Max Flow) ──────────
const P3_NODES = {
    S: { x: 120, y: 240, label: 'S', sub: 'Fuente' },
    A: { x: 400, y: 110, label: 'A', sub: '' },
    B: { x: 400, y: 370, label: 'B', sub: '' },
    T: { x: 680, y: 240, label: 'T', sub: 'Sumidero' }
};

const P3_EDGES = [
    { u: 'S', v: 'A', c: 5 },
    { u: 'S', v: 'B', c: 3 },
    { u: 'A', v: 'B', c: 2 },
    { u: 'A', v: 'T', c: 4 },
    { u: 'B', v: 'T', c: 5 }
];

const P3_STEPS = [
    {
        step: 0,
        title: 'Paso 1: Inicialización',
        path: null,
        delta: '—',
        totalFlow: 0,
        status: 'Inicialización (Flujo = 0)',
        flows: { 'S-A': 0, 'S-B': 0, 'A-B': 0, 'A-T': 0, 'B-T': 0 },
        showCut: false
    },
    {
        step: 1,
        title: 'Iteración 1: S → A → T',
        path: ['S', 'A', 'T'],
        delta: 4,
        totalFlow: 4,
        status: 'Camino S → A → T (+4)',
        flows: { 'S-A': 4, 'S-B': 0, 'A-B': 0, 'A-T': 4, 'B-T': 0 },
        showCut: false
    },
    {
        step: 2,
        title: 'Iteración 2: S → B → T',
        path: ['S', 'B', 'T'],
        delta: 3,
        totalFlow: 7,
        status: 'Camino S → B → T (+3)',
        flows: { 'S-A': 4, 'S-B': 3, 'A-B': 0, 'A-T': 4, 'B-T': 3 },
        showCut: false
    },
    {
        step: 3,
        title: 'Iteración 3: S → A → B → T',
        path: ['S', 'A', 'B', 'T'],
        delta: 1,
        totalFlow: 8,
        status: 'Camino residual S → A → B → T (+1)',
        flows: { 'S-A': 5, 'S-B': 3, 'A-B': 1, 'A-T': 4, 'B-T': 4 },
        showCut: false
    },
    {
        step: 4,
        title: 'Paso 5: Condición de Parada & Corte Mínimo',
        path: null,
        delta: '0 (Sin caminos)',
        totalFlow: 8,
        status: '¡Flujo Máximo = 8! Corte Mínimo = 8',
        flows: { 'S-A': 5, 'S-B': 3, 'A-B': 1, 'A-T': 4, 'B-T': 4 },
        showCut: true
    }
];

let p3CurrentStep = 0;
let p3AutoplayTimer = null;

function updateP3Controls(stepIdx) {
    const stepData = P3_STEPS[stepIdx];
    const ind = document.getElementById('p3-step-indicator');
    if (ind) {
        ind.textContent = `Paso ${stepIdx} / 4: ${stepData.title}`;
    }

    const statFlow = document.getElementById('p3-stat-flow');
    if (statFlow) {
        statFlow.textContent = `${stepData.totalFlow} / 8`;
        statFlow.style.color = stepData.totalFlow === 8 ? 'var(--ink-green)' : 'var(--ink-dark)';
    }

    const statPath = document.getElementById('p3-stat-path');
    if (statPath) {
        statPath.textContent = stepData.path ? stepData.path.join(' → ') : '—';
    }

    const statDelta = document.getElementById('p3-stat-delta');
    if (statDelta) {
        statDelta.textContent = stepData.delta !== null ? String(stepData.delta) : '—';
    }

    const statStatus = document.getElementById('p3-stat-status');
    if (statStatus) {
        statStatus.textContent = stepData.status;
    }

    const btnPrev = document.getElementById('p3-btn-prev');
    if (btnPrev) btnPrev.disabled = stepIdx === 0;

    const btnNext = document.getElementById('p3-btn-next');
    if (btnNext) btnNext.disabled = stepIdx === P3_STEPS.length - 1;
}

function setP3Step(newStep) {
    p3CurrentStep = Math.max(0, Math.min(P3_STEPS.length - 1, newStep));
    drawFlowGraph(p3CurrentStep);
}

function stopP3Autoplay() {
    if (p3AutoplayTimer) {
        clearInterval(p3AutoplayTimer);
        p3AutoplayTimer = null;
        const btn = document.getElementById('p3-btn-autoplay');
        if (btn) btn.textContent = '▶ Auto';
    }
}

function drawFlowGraph(stepIdx) {
    const svg = document.getElementById('graph-p3');
    if (!svg) return;
    svg.innerHTML = '';

    const stepData = P3_STEPS[stepIdx];
    const pathSet = new Set();
    if (stepData.path) {
        for (let i = 0; i < stepData.path.length - 1; i++) {
            pathSet.add(`${stepData.path[i]}-${stepData.path[i+1]}`);
        }
    }

    // Definitions: markers
    const defs = createSVGElement('defs');

    const markerColors = [
        { id: 'p3-arrow-norm', color: 'rgba(31, 46, 90, 0.5)' },
        { id: 'p3-arrow-sat', color: '#b3261e' },
        { id: 'p3-arrow-act', color: '#1b6e44' },
        { id: 'p3-arrow-part', color: '#c98a1b' }
    ];

    for (const mc of markerColors) {
        const marker = createSVGElement('marker', {
            id: mc.id,
            viewBox: '0 0 10 10',
            refX: '7',
            refY: '5',
            markerWidth: '6',
            markerHeight: '6',
            orient: 'auto-start-reverse'
        });
        const path = createSVGElement('path', {
            d: 'M 0 1.5 L 9 5 L 0 8.5 z',
            fill: mc.color
        });
        marker.appendChild(path);
        defs.appendChild(marker);
    }
    svg.appendChild(defs);

    const bgGroup = createSVGElement('g');
    const edgesGroup = createSVGElement('g');
    const nodesGroup = createSVGElement('g');

    // If showCut is true, draw partition regions and dashed cut line
    if (stepData.showCut) {
        // Cut region S
        const regS = createSVGElement('rect', {
            x: 40, y: 35, width: 190, height: 410, rx: 12,
            fill: 'rgba(27, 110, 68, 0.07)',
            stroke: 'rgba(27, 110, 68, 0.3)',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,4'
        });
        bgGroup.appendChild(regS);

        const lblS = createSVGElement('text', {
            x: 135, y: 65,
            fill: 'var(--ink-green)',
            'font-family': 'var(--font-mono)',
            'font-size': '13px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        lblS.textContent = 'Conjunto S = {S}';
        bgGroup.appendChild(lblS);

        // Cut region T
        const regT = createSVGElement('rect', {
            x: 290, y: 35, width: 470, height: 410, rx: 12,
            fill: 'rgba(31, 46, 90, 0.04)',
            stroke: 'rgba(31, 46, 90, 0.2)',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,4'
        });
        bgGroup.appendChild(regT);

        const lblT = createSVGElement('text', {
            x: 525, y: 65,
            fill: 'var(--ink-dark)',
            'font-family': 'var(--font-mono)',
            'font-size': '13px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        lblT.textContent = 'Conjunto T = {A, B, T}';
        bgGroup.appendChild(lblT);

        // Cut curve line
        const cutPath = createSVGElement('path', {
            d: 'M 260 30 Q 285 240 260 450',
            stroke: 'var(--ink-red)',
            'stroke-width': '3',
            'stroke-dasharray': '8,6',
            fill: 'none'
        });
        bgGroup.appendChild(cutPath);

        // Cut badge
        const cutBadgeBg = createSVGElement('rect', {
            x: 175, y: 226, width: 180, height: 28, rx: 4,
            fill: 'var(--ink-red)',
            stroke: 'white',
            'stroke-width': '1.5'
        });
        bgGroup.appendChild(cutBadgeBg);

        const cutBadgeText = createSVGElement('text', {
            x: 265, y: 245,
            fill: 'white',
            'font-family': 'var(--font-mono)',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        cutBadgeText.textContent = '✂ Corte Mínimo = 8';
        bgGroup.appendChild(cutBadgeText);
    }

    svg.appendChild(bgGroup);

    // Node radius
    const R = 28;

    // Draw edges
    for (const edge of P3_EDGES) {
        const p1 = P3_NODES[edge.u];
        const p2 = P3_NODES[edge.v];
        const key = `${edge.u}-${edge.v}`;
        const flow = stepData.flows[key] || 0;
        const cap = edge.c;
        const res = cap - flow;
        const isSaturated = flow === cap;
        const isActivePath = pathSet.has(key);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        // Truncate line endpoints to node boundaries
        const sx = p1.x + ux * R;
        const sy = p1.y + uy * R;
        const ex = p2.x - ux * (R + 8);
        const ey = p2.y - uy * (R + 8);

        let strokeColor = 'rgba(31, 46, 90, 0.35)';
        let strokeWidth = '3';
        let markerId = 'p3-arrow-norm';
        let isAnimated = false;

        if (isActivePath) {
            strokeColor = 'var(--ink-green)';
            strokeWidth = '6';
            markerId = 'p3-arrow-act';
            isAnimated = true;
        } else if (isSaturated) {
            strokeColor = 'var(--ink-red)';
            strokeWidth = '4';
            markerId = 'p3-arrow-sat';
        } else if (flow > 0) {
            strokeColor = 'var(--ink-ochre)';
            strokeWidth = '3.5';
            markerId = 'p3-arrow-part';
        }

        const line = createSVGElement('line', {
            x1: sx, y1: sy, x2: ex, y2: ey,
            stroke: strokeColor,
            'stroke-width': strokeWidth,
            'stroke-linecap': 'round',
            'marker-end': `url(#${markerId})`
        });

        if (isAnimated) {
            const anim = createSVGElement('animate', {
                attributeName: 'stroke-opacity',
                values: '0.5;1;0.5',
                dur: '1.5s',
                repeatCount: 'indefinite'
            });
            line.appendChild(anim);
        }
        edgesGroup.appendChild(line);

        // Label position
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        let nx = -uy;
        let ny = ux;
        let offsetDist = 18;

        if (key === 'A-B') {
            nx = -1; ny = 0;
            offsetDist = 32;
        } else if (key === 'S-B' || key === 'B-T') {
            offsetDist = -20;
        }

        const lx = mx + nx * offsetDist;
        const ly = my + ny * offsetDist;

        const pillWidth = isSaturated ? 98 : 84;
        const pillHeight = 22;
        const pillBg = createSVGElement('rect', {
            x: lx - pillWidth / 2,
            y: ly - pillHeight / 2,
            width: pillWidth,
            height: pillHeight,
            rx: 4,
            fill: isActivePath ? '#e8f5e9' : isSaturated ? '#fdecea' : 'var(--bg-paper)',
            stroke: isActivePath ? 'var(--ink-green)' : isSaturated ? 'var(--ink-red)' : 'rgba(31, 46, 90, 0.25)',
            'stroke-width': isActivePath || isSaturated ? '1.5' : '1'
        });
        edgesGroup.appendChild(pillBg);

        const pillText = createSVGElement('text', {
            x: lx,
            y: ly + 4,
            'font-family': 'var(--font-mono)',
            'font-size': '11.5px',
            'font-weight': 'bold',
            'text-anchor': 'middle',
            fill: isSaturated ? 'var(--ink-red)' : isActivePath ? 'var(--ink-green)' : 'var(--ink-dark)'
        });

        if (isSaturated) {
            pillText.textContent = `${flow}/${cap} (Sat)`;
        } else {
            pillText.textContent = `${flow}/${cap} [r:${res}]`;
        }
        edgesGroup.appendChild(pillText);
    }

    svg.appendChild(edgesGroup);

    // Draw nodes
    for (const [name, node] of Object.entries(P3_NODES)) {
        const g = createSVGElement('g', {
            transform: `translate(${node.x}, ${node.y})`
        });

        let circStroke = 'var(--ink-dark)';
        let circWidth = '2.5';
        let circFill = 'white';

        if (name === 'S') {
            circStroke = 'var(--ink-ochre)';
            circFill = '#fff9ed';
            circWidth = '3.5';
        } else if (name === 'T') {
            circStroke = 'var(--ink-green)';
            circFill = '#edf7f1';
            circWidth = '3.5';
        }

        const circle = createSVGElement('circle', {
            cx: 0, cy: 0, r: R,
            fill: circFill,
            stroke: circStroke,
            'stroke-width': circWidth
        });
        g.appendChild(circle);

        const text = createSVGElement('text', {
            x: 0, y: node.sub ? 1 : 6,
            fill: 'var(--ink-dark)',
            'font-family': 'var(--font-serif)',
            'font-size': '19px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        text.textContent = node.label;
        g.appendChild(text);

        if (node.sub) {
            const sub = createSVGElement('text', {
                x: 0, y: 16,
                fill: '#666',
                'font-family': 'var(--font-mono)',
                'font-size': '9.5px',
                'text-anchor': 'middle',
                'font-weight': '600'
            });
            sub.textContent = node.sub;
            g.appendChild(sub);
        }

        nodesGroup.appendChild(g);
    }

    svg.appendChild(nodesGroup);

    // Update status controls
    updateP3Controls(stepIdx);
}

// ── Problem 4 Graph Data (Taller 5 de Noviembre 2026 – Red Logística) ──────────
const P4_NODES = {
    S: { x: 90, y: 260, label: 'S', sub: 'Consolidación' },
    A: { x: 310, y: 130, label: 'A', sub: 'Patio Norte' },
    B: { x: 310, y: 390, label: 'B', sub: 'Estación Oriental' },
    C: { x: 590, y: 130, label: 'C', sub: 'Plat. Central' },
    D: { x: 590, y: 390, label: 'D', sub: 'Patio Occid.' },
    T: { x: 810, y: 260, label: 'T', sub: 'Transformación' }
};

const P4_EDGES = [
    { u: 'S', v: 'A', c: 12 },
    { u: 'S', v: 'B', c: 10 },
    { u: 'A', v: 'B', c: 4, curve: { cx: 275, cy: 260 } },
    { u: 'A', v: 'C', c: 8 },
    { u: 'A', v: 'D', c: 5, curve: { cx: 415, cy: 305 } },
    { u: 'B', v: 'C', c: 6, curve: { cx: 485, cy: 215 } },
    { u: 'B', v: 'D', c: 7 },
    { u: 'C', v: 'D', c: 3, curve: { cx: 550, cy: 260 } },
    { u: 'C', v: 'T', c: 10 },
    { u: 'D', v: 'T', c: 12 }
];

const P4_STEPS = [
    {
        step: 0,
        title: 'Inicialización (Flujo Cero)',
        path: null,
        delta: '—',
        totalFlow: 0,
        status: 'Capacidad total disponible en la red (0 / 22 ton)',
        flows: { 'S-A': 0, 'S-B': 0, 'A-B': 0, 'A-C': 0, 'A-D': 0, 'B-C': 0, 'B-D': 0, 'C-D': 0, 'C-T': 0, 'D-T': 0 },
        showCut: false
    },
    {
        step: 1,
        title: 'Iteración 1: S → A → C → T',
        path: ['S', 'A', 'C', 'T'],
        delta: 8,
        totalFlow: 8,
        status: 'Camino 1: Cuello de botella min(12, 8, 10) = 8 ton. Satura A → C.',
        flows: { 'S-A': 8, 'S-B': 0, 'A-B': 0, 'A-C': 8, 'A-D': 0, 'B-C': 0, 'B-D': 0, 'C-D': 0, 'C-T': 8, 'D-T': 0 },
        showCut: false
    },
    {
        step: 2,
        title: 'Iteración 2: S → A → D → T',
        path: ['S', 'A', 'D', 'T'],
        delta: 4,
        totalFlow: 12,
        status: 'Camino 2: Residuales (4, 5, 12), cuello min = 4 ton. Satura S → A.',
        flows: { 'S-A': 12, 'S-B': 0, 'A-B': 0, 'A-C': 8, 'A-D': 4, 'B-C': 0, 'B-D': 0, 'C-D': 0, 'C-T': 8, 'D-T': 4 },
        showCut: false
    },
    {
        step: 3,
        title: 'Iteración 3: S → B → C → T',
        path: ['S', 'B', 'C', 'T'],
        delta: 2,
        totalFlow: 14,
        status: 'Camino 3: Residuales (10, 6, 2), cuello min = 2 ton. Satura C → T.',
        flows: { 'S-A': 12, 'S-B': 2, 'A-B': 0, 'A-C': 8, 'A-D': 4, 'B-C': 2, 'B-D': 0, 'C-D': 0, 'C-T': 10, 'D-T': 4 },
        showCut: false
    },
    {
        step: 4,
        title: 'Iteración 4: S → B → D → T',
        path: ['S', 'B', 'D', 'T'],
        delta: 7,
        totalFlow: 21,
        status: 'Camino 4: Residuales (8, 7, 8), cuello min = 7 ton. Satura B → D.',
        flows: { 'S-A': 12, 'S-B': 9, 'A-B': 0, 'A-C': 8, 'A-D': 4, 'B-C': 2, 'B-D': 7, 'C-D': 0, 'C-T': 10, 'D-T': 11 },
        showCut: false
    },
    {
        step: 5,
        title: 'Iteración 5: S → B → C → D → T',
        path: ['S', 'B', 'C', 'D', 'T'],
        delta: 1,
        totalFlow: 22,
        status: 'Camino 5: Residuales (1, 4, 3, 1), cuello min = 1 ton. Satura S → B y D → T.',
        flows: { 'S-A': 12, 'S-B': 10, 'A-B': 0, 'A-C': 8, 'A-D': 4, 'B-C': 3, 'B-D': 7, 'C-D': 1, 'C-T': 10, 'D-T': 12 },
        showCut: false
    },
    {
        step: 6,
        title: 'Paso 6: Terminación & Corte Mínimo Global',
        path: null,
        delta: '0 (Sin caminos)',
        totalFlow: 22,
        status: '¡Flujo Máximo Óptimo = 22 ton/jornada! Demostrado por Corte Mínimo = 22.',
        flows: { 'S-A': 12, 'S-B': 10, 'A-B': 0, 'A-C': 8, 'A-D': 4, 'B-C': 3, 'B-D': 7, 'C-D': 1, 'C-T': 10, 'D-T': 12 },
        showCut: true
    }
];

let p4CurrentStep = 0;
let p4AutoplayTimer = null;

function updateP4Controls(stepIdx) {
    const stepData = P4_STEPS[stepIdx];
    const ind = document.getElementById('p4-step-indicator');
    if (ind) {
        ind.textContent = `Paso ${stepIdx} / 6: ${stepData.title}`;
    }

    const statFlow = document.getElementById('p4-stat-flow');
    if (statFlow) {
        statFlow.textContent = `${stepData.totalFlow} / 22 ton`;
        statFlow.style.color = stepData.totalFlow === 22 ? 'var(--ink-green)' : 'var(--ink-dark)';
    }

    const statPath = document.getElementById('p4-stat-path');
    if (statPath) {
        statPath.textContent = stepData.path ? stepData.path.join(' → ') : '—';
    }

    const statDelta = document.getElementById('p4-stat-delta');
    if (statDelta) {
        statDelta.textContent = stepData.delta !== null ? (typeof stepData.delta === 'number' ? `+${stepData.delta} ton` : String(stepData.delta)) : '—';
    }

    const statStatus = document.getElementById('p4-stat-status');
    if (statStatus) {
        statStatus.textContent = stepData.status;
    }

    const btnPrev = document.getElementById('p4-btn-prev');
    if (btnPrev) btnPrev.disabled = stepIdx === 0;

    const btnNext = document.getElementById('p4-btn-next');
    if (btnNext) btnNext.disabled = stepIdx === P4_STEPS.length - 1;
}

function setP4Step(newStep) {
    p4CurrentStep = Math.max(0, Math.min(P4_STEPS.length - 1, newStep));
    drawP4FlowGraph(p4CurrentStep);
}

function stopP4Autoplay() {
    if (p4AutoplayTimer) {
        clearInterval(p4AutoplayTimer);
        p4AutoplayTimer = null;
        const btn = document.getElementById('p4-btn-autoplay');
        if (btn) btn.textContent = '▶ Auto';
    }
}

function drawP4FlowGraph(stepIdx) {
    const svg = document.getElementById('graph-p4');
    if (!svg) return;
    svg.innerHTML = '';

    const stepData = P4_STEPS[stepIdx];
    const pathSet = new Set();
    if (stepData.path) {
        for (let i = 0; i < stepData.path.length - 1; i++) {
            pathSet.add(`${stepData.path[i]}-${stepData.path[i+1]}`);
        }
    }

    // Definitions: markers
    const defs = createSVGElement('defs');
    const markerColors = [
        { id: 'p4-arrow-norm', color: 'rgba(31, 46, 90, 0.45)' },
        { id: 'p4-arrow-sat', color: '#b3261e' },
        { id: 'p4-arrow-act', color: '#1b6e44' },
        { id: 'p4-arrow-part', color: '#c98a1b' }
    ];

    for (const mc of markerColors) {
        const marker = createSVGElement('marker', {
            id: mc.id,
            viewBox: '0 0 10 10',
            refX: '7',
            refY: '5',
            markerWidth: '6',
            markerHeight: '6',
            orient: 'auto-start-reverse'
        });
        const path = createSVGElement('path', {
            d: 'M 0 1.5 L 9 5 L 0 8.5 z',
            fill: mc.color
        });
        marker.appendChild(path);
        defs.appendChild(marker);
    }
    svg.appendChild(defs);

    const bgGroup = createSVGElement('g');
    const edgesGroup = createSVGElement('g');
    const nodesGroup = createSVGElement('g');

    // If showCut is true, draw partition regions and dashed cut lines
    if (stepData.showCut) {
        // Cut 1: Source cut {S} vs {A, B, C, D, T}
        const regS = createSVGElement('rect', {
            x: 20, y: 30, width: 145, height: 460, rx: 12,
            fill: 'rgba(27, 110, 68, 0.08)',
            stroke: 'rgba(27, 110, 68, 0.35)',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,4'
        });
        bgGroup.appendChild(regS);

        const lblS = createSVGElement('text', {
            x: 92, y: 55,
            fill: 'var(--ink-green)',
            'font-family': 'var(--font-mono)',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        lblS.textContent = 'Corte Origen: S = {S}';
        bgGroup.appendChild(lblS);

        const cut1Path = createSVGElement('path', {
            d: 'M 200 20 Q 230 260 200 500',
            stroke: 'var(--ink-red)',
            'stroke-width': '3',
            'stroke-dasharray': '8,6',
            fill: 'none'
        });
        bgGroup.appendChild(cut1Path);

        const badge1Bg = createSVGElement('rect', {
            x: 105, y: 246, width: 190, height: 28, rx: 4,
            fill: 'var(--ink-red)',
            stroke: 'white',
            'stroke-width': '1.5'
        });
        bgGroup.appendChild(badge1Bg);

        const badge1Text = createSVGElement('text', {
            x: 200, y: 265,
            fill: 'white',
            'font-family': 'var(--font-mono)',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        badge1Text.textContent = '✂ Corte Salida = 22 ton';
        bgGroup.appendChild(badge1Text);

        // Cut 2: Sink cut {S, A, B, C, D} vs {T}
        const regT = createSVGElement('rect', {
            x: 735, y: 30, width: 145, height: 460, rx: 12,
            fill: 'rgba(179, 38, 30, 0.08)',
            stroke: 'rgba(179, 38, 30, 0.35)',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,4'
        });
        bgGroup.appendChild(regT);

        const lblT = createSVGElement('text', {
            x: 808, y: 55,
            fill: 'var(--ink-red)',
            'font-family': 'var(--font-mono)',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        lblT.textContent = 'Corte Destino: T = {T}';
        bgGroup.appendChild(lblT);

        const cut2Path = createSVGElement('path', {
            d: 'M 700 20 Q 670 260 700 500',
            stroke: 'var(--ink-red)',
            'stroke-width': '3',
            'stroke-dasharray': '8,6',
            fill: 'none'
        });
        bgGroup.appendChild(cut2Path);

        const badge2Bg = createSVGElement('rect', {
            x: 605, y: 246, width: 190, height: 28, rx: 4,
            fill: 'var(--ink-red)',
            stroke: 'white',
            'stroke-width': '1.5'
        });
        bgGroup.appendChild(badge2Bg);

        const badge2Text = createSVGElement('text', {
            x: 700, y: 265,
            fill: 'white',
            'font-family': 'var(--font-mono)',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        badge2Text.textContent = '✂ Corte Entrada = 22 ton';
        bgGroup.appendChild(badge2Text);
    }

    svg.appendChild(bgGroup);

    // Node radius
    const R = 28;

    // Draw edges
    for (const edge of P4_EDGES) {
        const p1 = P4_NODES[edge.u];
        const p2 = P4_NODES[edge.v];
        const key = `${edge.u}-${edge.v}`;
        const flow = stepData.flows[key] || 0;
        const cap = edge.c;
        const res = cap - flow;
        const isSaturated = flow === cap;
        const isActivePath = pathSet.has(key);

        let pathD = '';
        let lx = 0;
        let ly = 0;

        if (edge.curve) {
            const cx = edge.curve.cx;
            const cy = edge.curve.cy;

            const sdx = cx - p1.x;
            const sdy = cy - p1.y;
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
            const sx = p1.x + (sdx / sdist) * R;
            const sy = p1.y + (sdy / sdist) * R;

            const edx = p2.x - cx;
            const edy = p2.y - cy;
            const edist = Math.sqrt(edx * edx + edy * edy) || 1;
            const ex = p2.x - (edx / edist) * (R + 8);
            const ey = p2.y - (edy / edist) * (R + 8);

            pathD = `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
            lx = 0.25 * sx + 0.5 * cx + 0.25 * ex;
            ly = 0.25 * sy + 0.5 * cy + 0.25 * ey;

            // Extra adjustments for curved labels
            if (key === 'A-B') { lx -= 16; }
            else if (key === 'C-D') { lx -= 16; }
            else if (key === 'A-D') { ly += 14; }
            else if (key === 'B-C') { ly -= 14; }
        } else {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / dist;
            const uy = dy / dist;

            const sx = p1.x + ux * R;
            const sy = p1.y + uy * R;
            const ex = p2.x - ux * (R + 8);
            const ey = p2.y - uy * (R + 8);

            pathD = `M ${sx} ${sy} L ${ex} ${ey}`;
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            let nx = -uy;
            let ny = ux;
            let offsetDist = 18;

            if (key === 'S-A') { offsetDist = -20; }
            else if (key === 'S-B') { offsetDist = 20; }
            else if (key === 'A-C') { offsetDist = -22; }
            else if (key === 'B-D') { offsetDist = 22; }
            else if (key === 'C-T') { offsetDist = -20; }
            else if (key === 'D-T') { offsetDist = 20; }

            lx = mx + nx * offsetDist;
            ly = my + ny * offsetDist;
        }

        let strokeColor = 'rgba(31, 46, 90, 0.35)';
        let strokeWidth = '3';
        let markerId = 'p4-arrow-norm';
        let isAnimated = false;

        if (isActivePath) {
            strokeColor = 'var(--ink-green)';
            strokeWidth = '6';
            markerId = 'p4-arrow-act';
            isAnimated = true;
        } else if (isSaturated) {
            strokeColor = 'var(--ink-red)';
            strokeWidth = '4';
            markerId = 'p4-arrow-sat';
        } else if (flow > 0) {
            strokeColor = 'var(--ink-ochre)';
            strokeWidth = '3.5';
            markerId = 'p4-arrow-part';
        }

        const pathEl = createSVGElement('path', {
            d: pathD,
            stroke: strokeColor,
            'stroke-width': strokeWidth,
            'stroke-linecap': 'round',
            fill: 'none',
            'marker-end': `url(#${markerId})`
        });

        if (isAnimated) {
            const anim = createSVGElement('animate', {
                attributeName: 'stroke-opacity',
                values: '0.45;1;0.45',
                dur: '1.4s',
                repeatCount: 'indefinite'
            });
            pathEl.appendChild(anim);
        }
        edgesGroup.appendChild(pathEl);

        // Draw pill for flow/capacity
        const pillWidth = isSaturated ? 98 : 88;
        const pillHeight = 22;
        const pillBg = createSVGElement('rect', {
            x: lx - pillWidth / 2,
            y: ly - pillHeight / 2,
            width: pillWidth,
            height: pillHeight,
            rx: 4,
            fill: isActivePath ? '#e8f5e9' : isSaturated ? '#fdecea' : 'var(--bg-paper)',
            stroke: isActivePath ? 'var(--ink-green)' : isSaturated ? 'var(--ink-red)' : 'rgba(31, 46, 90, 0.25)',
            'stroke-width': isActivePath || isSaturated ? '1.5' : '1'
        });
        edgesGroup.appendChild(pillBg);

        const pillText = createSVGElement('text', {
            x: lx,
            y: ly + 4,
            'font-family': 'var(--font-mono)',
            'font-size': '11.5px',
            'font-weight': 'bold',
            'text-anchor': 'middle',
            fill: isSaturated ? 'var(--ink-red)' : isActivePath ? 'var(--ink-green)' : 'var(--ink-dark)'
        });

        if (isSaturated) {
            pillText.textContent = `${flow}/${cap} (Sat)`;
        } else {
            pillText.textContent = `${flow}/${cap} [r:${res}]`;
        }
        edgesGroup.appendChild(pillText);
    }

    svg.appendChild(edgesGroup);

    // Draw nodes
    for (const [name, node] of Object.entries(P4_NODES)) {
        const g = createSVGElement('g', {
            transform: `translate(${node.x}, ${node.y})`
        });

        let circStroke = 'var(--ink-dark)';
        let circWidth = '2.5';
        let circFill = 'white';

        if (name === 'S') {
            circStroke = 'var(--ink-ochre)';
            circFill = '#fff9ed';
            circWidth = '3.5';
        } else if (name === 'T') {
            circStroke = 'var(--ink-green)';
            circFill = '#edf7f1';
            circWidth = '3.5';
        }

        const circle = createSVGElement('circle', {
            cx: 0, cy: 0, r: R,
            fill: circFill,
            stroke: circStroke,
            'stroke-width': circWidth
        });
        g.appendChild(circle);

        const text = createSVGElement('text', {
            x: 0, y: node.sub ? 1 : 6,
            fill: 'var(--ink-dark)',
            'font-family': 'var(--font-serif)',
            'font-size': '19px',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        });
        text.textContent = node.label;
        g.appendChild(text);

        if (node.sub) {
            const sub = createSVGElement('text', {
                x: 0, y: 16,
                fill: '#666',
                'font-family': 'var(--font-mono)',
                'font-size': '9.5px',
                'text-anchor': 'middle',
                'font-weight': '600'
            });
            sub.textContent = node.sub;
            g.appendChild(sub);
        }

        nodesGroup.appendChild(g);
    }

    svg.appendChild(nodesGroup);

    // Update status controls
    updateP4Controls(stepIdx);
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
        panel.style.animation = 'none';
        panel.offsetHeight; // force reflow
        panel.style.animation = '';
    }

    try {
        const url = new URL(window.location);
        url.searchParams.set('prob', num);
        window.history.replaceState(null, '', url);
    } catch (e) {}

    if (num === 1) {
        renderProblem1Graph();
        renderProblem1bGraph();
    } else if (num === 2) {
        renderProblem2Graph();
        renderProblem2bGraph();
    } else if (num === 3) {
        drawFlowGraph(p3CurrentStep);
    } else if (num === 4) {
        drawP4FlowGraph(p4CurrentStep);
    }
}

document.getElementById('tab-prob1')?.addEventListener('click', () => switchProblem(1));
document.getElementById('tab-prob2')?.addEventListener('click', () => switchProblem(2));
document.getElementById('tab-prob3')?.addEventListener('click', () => switchProblem(3));
document.getElementById('tab-prob4')?.addEventListener('click', () => switchProblem(4));

// Controls for Problem 3
document.getElementById('p3-btn-prev')?.addEventListener('click', () => {
    stopP3Autoplay();
    setP3Step(p3CurrentStep - 1);
});

document.getElementById('p3-btn-next')?.addEventListener('click', () => {
    stopP3Autoplay();
    setP3Step(p3CurrentStep + 1);
});

document.getElementById('p3-btn-reset')?.addEventListener('click', () => {
    stopP3Autoplay();
    setP3Step(0);
});

document.getElementById('p3-btn-autoplay')?.addEventListener('click', () => {
    const btn = document.getElementById('p3-btn-autoplay');
    if (p3AutoplayTimer) {
        stopP3Autoplay();
    } else {
        if (p3CurrentStep >= P3_STEPS.length - 1) {
            p3CurrentStep = 0;
            drawFlowGraph(p3CurrentStep);
        }
        if (btn) btn.textContent = '⏸ Pausa';
        p3AutoplayTimer = setInterval(() => {
            if (p3CurrentStep < P3_STEPS.length - 1) {
                p3CurrentStep++;
                drawFlowGraph(p3CurrentStep);
            } else {
                stopP3Autoplay();
            }
        }, 2200);
    }
});

// Controls for Problem 4 (Taller 5 de Noviembre 2026)
document.getElementById('p4-btn-prev')?.addEventListener('click', () => {
    stopP4Autoplay();
    setP4Step(p4CurrentStep - 1);
});

document.getElementById('p4-btn-next')?.addEventListener('click', () => {
    stopP4Autoplay();
    setP4Step(p4CurrentStep + 1);
});

document.getElementById('p4-btn-reset')?.addEventListener('click', () => {
    stopP4Autoplay();
    setP4Step(0);
});

document.getElementById('p4-btn-autoplay')?.addEventListener('click', () => {
    const btn = document.getElementById('p4-btn-autoplay');
    if (p4AutoplayTimer) {
        stopP4Autoplay();
    } else {
        if (p4CurrentStep >= P4_STEPS.length - 1) {
            p4CurrentStep = 0;
            drawP4FlowGraph(p4CurrentStep);
        }
        if (btn) btn.textContent = '⏸ Pausa';
        p4AutoplayTimer = setInterval(() => {
            if (p4CurrentStep < P4_STEPS.length - 1) {
                p4CurrentStep++;
                drawP4FlowGraph(p4CurrentStep);
            } else {
                stopP4Autoplay();
            }
        }, 2200);
    }
});

// Copy button for Problem 4 Python script
document.getElementById('btn-copy-code-p4')?.addEventListener('click', () => {
    const codeEl = document.getElementById('code-snippet-p4');
    if (codeEl) {
        navigator.clipboard.writeText(codeEl.innerText).then(() => {
            const btn = document.getElementById('btn-copy-code-p4');
            if (btn) {
                btn.textContent = '✓ ¡Copiado!';
                setTimeout(() => { btn.textContent = '📋 Copiar Código'; }, 2000);
            }
        }).catch(() => {
            // Fallback selection
            const range = document.createRange();
            range.selectNodeContents(codeEl);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });
    }
});

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

    let initialProb = 1;
    try {
        const params = new URLSearchParams(window.location.search);
        const p = params.get('prob');
        const hashMatch = window.location.hash.match(/prob(\d)/i);
        const selected = p || (hashMatch ? hashMatch[1] : null);
        if (selected && ['1', '2', '3', '4'].includes(selected)) {
            initialProb = Number(selected);
        } else if (window.location.hash.toLowerCase().includes('taller') || window.location.hash.toLowerCase().includes('noviembre')) {
            initialProb = 4;
        }
    } catch (e) {}

    switchProblem(initialProb);
}

// Try rendering math immediately and again on load (for deferred KaTeX)
init();
window.addEventListener('load', () => {
    renderAllMath();
    init();
});
