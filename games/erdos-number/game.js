/* ═══════════════════════════════════════════════════════════
   ERDŐS NUMBER — a weighted shortest path, drawn by hand.
   Walk left to right from YOU to ERDŐS. Match par.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Invented surnames — this is a puzzle, not a claim about anybody real. */
  const NAMES = [
    'Vasquez', 'Okonkwo', 'Lindqvist', 'Haraldsen', 'Moreau', 'Petrov', 'Nakamura',
    'Bhattacharya', 'Kowalski', 'Adeyemi', 'Rossi', 'Fischer', 'Novak', 'Andersson',
    'Silva', 'Tanaka', 'Weber', 'Dubois', 'Kaur', 'Mbeki', 'Costa', 'Ivanov',
    'Larsen', 'Rahman', 'Ferrari', 'Yilmaz', 'Sørensen', 'Chen', 'Almeida', 'Osei',
    'Virtanen', 'Grigoryan', 'Halvorsen', 'Bakker', 'Nagy', 'Reyes'
  ];

  const LEVELS = 8;

  const S = {
    level: 1,
    score: 0,
    best: Number(localStorage.getItem('erdos.best') || 0),
    g: null,
    path: [],
    cost: 0,
    done: false
  };

  const elGraph = document.getElementById('graph');
  const elEdges = document.getElementById('edges');
  const elNodes = document.getElementById('nodes');
  const elCost  = document.getElementById('cost');
  const elPar   = document.getElementById('par');
  const elLevel = document.getElementById('level');
  const elScore = document.getElementById('score');
  const elBest  = document.getElementById('best');
  const elHint  = document.getElementById('hint');
  const overlay = document.getElementById('overlay');

  function rnd(n) { return (Math.random() * n) | 0; }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ─── Graph generation ───────────────────────────────────
     Layered left-to-right: every edge goes from one column to
     the next. That keeps the drawing readable and guarantees
     a path exists.
     ──────────────────────────────────────────────────────── */

  function makeGraph(level) {
    const cols = Math.min(6, 3 + Math.floor(level / 2));      // 3 … 6
    const width = Math.min(4, 2 + Math.floor((level - 1) / 3)); // 2 … 4 per middle column

    const layers = [];
    const names = shuffle(NAMES.slice());
    let n = 0;

    layers.push([{ id: n++, name: 'YOU', col: 0, row: 0, rows: 1 }]);
    for (let c = 1; c < cols - 1; c++) {
      const count = 2 + rnd(width - 1);
      const layer = [];
      for (let r = 0; r < count; r++) layer.push({ id: n++, name: names.pop(), col: c, row: r, rows: count });
      layers.push(layer);
    }
    layers.push([{ id: n++, name: 'ERDŐS', col: cols - 1, row: 0, rows: 1 }]);

    const nodes = layers.flat();
    const edges = [];
    const add = (a, b) => {
      if (edges.some((e) => e.a === a.id && e.b === b.id)) return;
      edges.push({ a: a.id, b: b.id, w: 1 + rnd(9) });
    };

    for (let c = 0; c < layers.length - 1; c++) {
      const left = layers[c], right = layers[c + 1];
      // Everyone on the left reaches forward at least once.
      for (const a of left) {
        const picks = shuffle(right.slice()).slice(0, 1 + rnd(Math.min(2, right.length)));
        picks.forEach((b) => add(a, b));
      }
      // Everyone on the right is reachable.
      for (const b of right) {
        if (!edges.some((e) => e.b === b.id)) add(left[rnd(left.length)], b);
      }
    }

    return { nodes: nodes, edges: edges, cols: cols, layers: layers };
  }

  /* Dijkstra — used only to compute par. */
  function optimal(g) {
    const dist = {};
    g.nodes.forEach((v) => { dist[v.id] = Infinity; });
    dist[0] = 0;
    const order = g.nodes.slice().sort((x, y) => x.col - y.col);
    for (const v of order) {
      if (dist[v.id] === Infinity) continue;
      for (const e of g.edges) {
        if (e.a !== v.id) continue;
        if (dist[v.id] + e.w < dist[e.b]) dist[e.b] = dist[v.id] + e.w;
      }
    }
    const last = g.nodes[g.nodes.length - 1].id;
    return dist[last];
  }

  // Edges run strictly left to right. Treating them as undirected let a player
  // walk backwards into a corner with no legal move and no way to Erdős — every
  // node has an outgoing edge by construction, so forward-only can never stick.
  function edgeFrom(a, b) {
    return S.g.edges.find((e) => e.a === a && e.b === b);
  }

  /* ─── Rendering ──────────────────────────────────────────── */

  function positions() {
    const W = elGraph.clientWidth, H = elGraph.clientHeight;
    const padX = Math.min(70, W * 0.09), padY = 34;
    const pos = {};
    for (const v of S.g.nodes) {
      const x = padX + (W - padX * 2) * (S.g.cols === 1 ? 0.5 : v.col / (S.g.cols - 1));
      const y = v.rows === 1 ? H / 2
        : padY + (H - padY * 2) * (v.row / (v.rows - 1));
      pos[v.id] = { x: x, y: y };
    }
    return pos;
  }

  function draw() {
    const pos = positions();
    const W = elGraph.clientWidth, H = elGraph.clientHeight;
    elEdges.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    let svg = '';
    for (const e of S.g.edges) {
      const p = pos[e.a], q = pos[e.b];
      const used = pathHasEdge(e);
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      svg += '<line x1="' + p.x + '" y1="' + p.y + '" x2="' + q.x + '" y2="' + q.y +
             '" class="edge' + (used ? ' is-used' : '') + '"/>';
      svg += '<circle cx="' + mx + '" cy="' + my + '" r="11" class="wbg' + (used ? ' is-used' : '') + '"/>';
      svg += '<text x="' + mx + '" y="' + (my + 4) + '" class="w' + (used ? ' is-used' : '') + '">' + e.w + '</text>';
    }
    elEdges.innerHTML = svg;

    const head = S.path[S.path.length - 1];
    for (const v of S.g.nodes) {
      const el = elNodes.children[v.id];
      el.style.left = pos[v.id].x + 'px';
      el.style.top  = pos[v.id].y + 'px';
      const onPath = S.path.indexOf(v.id) >= 0;
      const reachable = !S.done && !onPath && Boolean(edgeFrom(head, v.id));
      el.classList.toggle('is-on', onPath);
      el.classList.toggle('is-head', v.id === head && !S.done);
      el.classList.toggle('is-open', reachable);
    }
  }

  function pathHasEdge(e) {
    for (let i = 0; i < S.path.length - 1; i++) {
      const a = S.path[i], b = S.path[i + 1];
      if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) return true;
    }
    return false;
  }

  function buildNodes() {
    elNodes.innerHTML = '';
    for (const v of S.g.nodes) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'node' + (v.name === 'YOU' ? ' is-you' : v.name === 'ERDŐS' ? ' is-erdos' : '');
      b.innerHTML = '<span>' + v.name + '</span>';
      b.addEventListener('click', () => step(v.id));
      elNodes.appendChild(b);
    }
  }

  /* ─── Play ───────────────────────────────────────────────── */

  function step(id) {
    if (S.done) return;
    const head = S.path[S.path.length - 1];

    if (S.path.length > 1 && id === S.path[S.path.length - 2]) { undo(); return; }
    if (S.path.indexOf(id) >= 0) return;

    const e = edgeFrom(head, id);
    if (!e) {
      SFX.nope();
      const el = elNodes.children[id];
      el.classList.add('is-nope');
      setTimeout(() => el.classList.remove('is-nope'), 380);
      return;
    }

    S.path.push(id);
    S.cost += e.w;
    SFX.draw();

    const last = S.g.nodes[S.g.nodes.length - 1].id;
    if (id === last) finish();
    else { render(); draw(); }
  }

  function undo() {
    if (S.done || S.path.length < 2) return;
    const b = S.path.pop();
    const a = S.path[S.path.length - 1];
    S.cost -= edgeFrom(a, b).w;
    SFX.back();
    render(); draw();
  }

  function reset() {
    if (S.done) return;
    S.path = [0]; S.cost = 0;
    SFX.back();
    render(); draw();
  }

  function finish() {
    S.done = true;
    const par = optimal(S.g);
    const excess = S.cost - par;
    const gained = excess === 0 ? 500 : Math.max(60, 500 - excess * 90);
    S.score += gained;
    if (excess === 0) SFX.par(); else SFX.ok();
    render(); draw();

    const line = excess === 0
      ? 'Par. There is no shorter route.'
      : excess + ' over par. A shorter route existed.';

    elHint.textContent = line + '  +' + gained;
    elHint.className = 'hint ' + (excess === 0 ? 'is-good' : 'is-mid');

    setTimeout(() => {
      if (S.level >= LEVELS) { allDone(); return; }
      S.level++;
      newLevel();
    }, excess === 0 ? 1500 : 2100);
  }

  function allDone() {
    SFX.done();
    const isBest = S.score > S.best;
    if (isBest) { S.best = S.score; localStorage.setItem('erdos.best', String(S.best)); }
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Eight networks later</div>' +
      '<h1 class="sheet-title">Erdős number:<br><span>finite</span></h1>' +
      '<p class="sheet-body">Which, in the end, is the only part anybody quotes.</p>' +
      '<div class="result">' +
        '<div><b>' + S.score.toLocaleString() + '</b><span>Score</span></div>' +
        '<div><b>' + (LEVELS * 500).toLocaleString() + '</b><span>Perfect</span></div>' +
        '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>' +
      (isBest ? '<p class="sheet-body sheet-best">A new best.</p>' : '') +
      '<button class="btn" id="again-btn">Draw a new network</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', start);
  }

  /* ─── Level flow ─────────────────────────────────────────── */

  function newLevel() {
    S.g = makeGraph(S.level);
    S.path = [0];
    S.cost = 0;
    S.done = false;
    elHint.className = 'hint';
    elHint.textContent = 'Click a name joined to yours, and keep going until you reach Erdős.';
    buildNodes();
    render();
    draw();
  }

  function render() {
    elCost.textContent = S.cost;
    elPar.textContent = S.done ? optimal(S.g) : '?';
    elLevel.textContent = S.level + ' / ' + LEVELS;
    elScore.textContent = S.score.toLocaleString();
    elBest.textContent = S.best.toLocaleString();
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }

  function startScreen() {
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Six degrees, give or take</div>' +
      '<h1 class="sheet-title">Erdős <span>Number</span></h1>' +
      '<p class="sheet-body">A co-authorship network, sketched left to right. Start at ' +
      '<strong>YOU</strong> and click your way along to <strong>Erdős</strong>.</p>' +
      '<ul class="sheet-rules">' +
        '<li>Each link has a cost. Your total is what counts, not the number of hops.</li>' +
        '<li>Match par — the cheapest route there is — for full marks.</li>' +
        '<li>Click the previous name, or Undo, to step back.</li>' +
        '<li>Eight networks, each one bigger than the last.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Start writing letters</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('start-btn').addEventListener('click', start);
  }

  function start() {
    SFX.unlock();
    overlay.classList.remove('is-open');
    S.level = 1; S.score = 0;
    newLevel();
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('reset').addEventListener('click', reset);

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (S.g) draw(); }, 140);
  }, { passive: true });

  S.g = makeGraph(1);
  S.path = [0];
  buildNodes();
  render();
  draw();
  startScreen();

})();
