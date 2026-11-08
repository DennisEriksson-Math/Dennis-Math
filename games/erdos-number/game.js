/* ═══════════════════════════════════════════════════════════
   WHO DO YOU KNOW? — a weighted shortest path, drawn by hand.
   Somebody important has to read your paper, and you have to
   get there by being introduced. Every introduction costs
   favours. Match par: the cheapest way there is.
   (The folder is still called erdos-number: the last of the
   eight goals is Erdős himself.)
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

  /* Who you are trying to reach. The last one is the old joke: everybody has a number. */
  const GOALS = [
    { name: 'THE EDITOR',   brief: 'Get your paper in front of the journal editor.' },
    { name: 'KEYNOTE',      brief: 'Get yourself onto the conference programme.' },
    { name: 'GRANT CHAIR',  brief: 'Reach the chair of the funding panel.' },
    { name: 'A REFEREE',    brief: 'Find a referee who will actually read it.' },
    { name: 'THE DEAN',     brief: 'Get ten minutes in the Dean\u2019s diary.' },
    { name: 'KEY HOLDER',   brief: 'Reach the one person who knows where the seminar room key is.' },
    { name: 'FIELDS MEDAL', brief: 'Be introduced to someone with a Fields Medal.' },
    { name: 'ERDŐS',        brief: 'Reach Erdős himself. Everybody has a number; find yours.' }
  ];

  /* A cost is a number of favours, and each one has a story. */
  const REASONS = {
    1: ['your old supervisor, delighted to help', 'shares your office and cannot avoid you', 'still owes you for the 2019 workshop'],
    2: ['sat next to you at the conference dinner', 'you co-wrote a paper and nobody was hurt'],
    3: ['a former student of a friend', 'same reading group, until it folded'],
    4: ['a friend of a friend', 'you refereed their paper kindly'],
    5: ['met once at a workshop, briefly', 'they remember your face, not your name'],
    6: ['a cold email with an apology in it', 'introduced by someone who barely knows you'],
    7: ['you owe them a referee report, overdue', 'on sabbatical, replies in six weeks'],
    8: ['you disagreed with them in public', 'last spoke at a funeral'],
    9: ['they have not forgiven the referee report', 'you once corrected their proof at a seminar']
  };
  const S = {
    level: 1,
    score: 0,
    best: Number(localStorage.getItem('erdos.best') || 0),
    g: null,
    path: [],
    cost: 0,
    hopsTotal: 0,
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
  const elKicker = document.getElementById('kicker');
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

    const goal = GOALS[level - 1];
    layers.push([{ id: n++, name: 'YOU', col: 0, row: 0, rows: 1 }]);
    for (let c = 1; c < cols - 1; c++) {
      const count = 2 + rnd(width - 1);
      const layer = [];
      for (let r = 0; r < count; r++) layer.push({ id: n++, name: names.pop(), col: c, row: r, rows: count });
      layers.push(layer);
    }
    layers.push([{ id: n++, name: goal.name, col: cols - 1, row: 0, rows: 1 }]);

    const nodes = layers.flat();
    const edges = [];
    const add = (a, b) => {
      if (edges.some((e) => e.a === a.id && e.b === b.id)) return;
      const w = 1 + rnd(9);
      edges.push({ a: a.id, b: b.id, w: w, why: REASONS[w][rnd(REASONS[w].length)] });
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

    return { nodes: nodes, edges: edges, cols: cols, layers: layers, goal: goal };
  }

  /* Dijkstra over the layers: par, and the fewest introductions among the cheapest routes. */
  function optimal(g) {
    const dist = {}, hops = {};
    g.nodes.forEach((v) => { dist[v.id] = Infinity; hops[v.id] = Infinity; });
    dist[0] = 0; hops[0] = 0;
    const order = g.nodes.slice().sort((x, y) => x.col - y.col);
    for (const v of order) {
      if (dist[v.id] === Infinity) continue;
      for (const e of g.edges) {
        if (e.a !== v.id) continue;
        const d = dist[v.id] + e.w, h = hops[v.id] + 1;
        if (d < dist[e.b] || (d === dist[e.b] && h < hops[e.b])) { dist[e.b] = d; hops[e.b] = h; }
      }
    }
    const last = g.nodes[g.nodes.length - 1].id;
    return { cost: dist[last], hops: hops[last] };
  }

  // Edges run strictly left to right. Treating them as undirected let a player
  // walk backwards into a corner with no legal move and no way to Erdős — every
  // node has an outgoing edge by construction, so forward-only can never stick.
  function edgeFrom(a, b) {
    return S.g.edges.find((e) => e.a === a && e.b === b);
  }

  /* ─── Rendering ──────────────────────────────────────────── */

  /* Left to right on a wide screen. On a portrait phone there is no room for six columns of names
     side by side, so the network runs from top to bottom instead and every cost has room to breathe. */
  function positions() {
    const W = elGraph.clientWidth, H = elGraph.clientHeight;
    const vertical = H > W;
    const pos = {};
    for (const v of S.g.nodes) {
      const along = S.g.cols === 1 ? 0.5 : v.col / (S.g.cols - 1);
      const across = v.rows === 1 ? 0.5 : v.row / (v.rows - 1);
      if (vertical) {
        const padX = Math.min(48, W * 0.15), padY = Math.min(34, H * 0.08);
        pos[v.id] = { x: padX + (W - padX * 2) * across, y: padY + (H - padY * 2) * along };
      } else {
        const padX = Math.min(70, W * 0.09), padY = Math.min(34, H * 0.11);
        pos[v.id] = { x: padX + (W - padX * 2) * along, y: v.rows === 1 ? H / 2 : padY + (H - padY * 2) * across };
      }
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
      b.className = 'node' + (v.id === 0 ? ' is-you' : v.id === S.g.nodes.length - 1 ? ' is-erdos' : '');
      b.innerHTML = '<span>' + v.name + '</span>';
      b.addEventListener('click', () => step(v.id));
      b.addEventListener('mouseenter', () => preview(v.id));
      elNodes.appendChild(b);
    }
  }

  /* ─── Play ───────────────────────────────────────────────── */

  // Hovering a name you can reach says what it would cost, and why.
  function preview(id) {
    if (S.done) return;
    const head = S.path[S.path.length - 1];
    const e = edgeFrom(head, id);
    if (!e || S.path.indexOf(id) >= 0) return;
    const v = S.g.nodes[id];
    elHint.className = 'hint';
    elHint.textContent = v.name + ': ' + e.why + '. ' + e.w + (e.w === 1 ? ' favour.' : ' favours.');
  }

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
    { const v = S.g.nodes[id]; elHint.className = 'hint'; elHint.textContent = v.name + ': ' + e.why + '. +' + e.w + (e.w === 1 ? ' favour.' : ' favours.'); }

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
    const best = optimal(S.g), par = best.cost;
    const excess = S.cost - par;
    const myHops = S.path.length - 1;
    S.hopsTotal += myHops;
    const gained = excess === 0 ? 500 : Math.max(60, 500 - excess * 90);
    S.score += gained;
    if (excess === 0) SFX.par(); else SFX.ok();
    render(); draw();

    const hopLine = ' You got there in ' + myHops + (myHops === 1 ? ' introduction.' : ' introductions.');
    const line = excess === 0
      ? 'Introduced. There was no cheaper way.' + hopLine
      : 'Introduced, but ' + excess + (excess === 1 ? ' favour' : ' favours') + ' over par. A cheaper route existed.' + hopLine;

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
    const avg = (S.hopsTotal / LEVELS).toFixed(1);
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Eight introductions later</div>' +
      '<h1 class="sheet-title">Well<br><span>connected</span></h1>' +
      '<p class="sheet-body">You reached all eight, in ' + avg + ' introductions on average. ' +
      'Mathematicians call that an Erdős number. Everybody else calls it networking.</p>' +
      '<div class="result">' +
        '<div><b>' + S.score.toLocaleString() + '</b><span>Score</span></div>' +
        '<div><b>' + (LEVELS * 500).toLocaleString() + '</b><span>Perfect</span></div>' +
        '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>' +
      (isBest ? '<p class="sheet-body sheet-best">A new best.</p>' : '') +
      '<button class="btn" id="again-btn">Meet some new people</button>' +
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
    elHint.textContent = 'Click someone you know, then someone they know, and keep going. Undo is free.';
    elKicker.textContent = 'Level ' + S.level + ' · ' + S.g.goal.brief;
    buildNodes();
    render();
    draw();
  }

  function render() {
    elCost.textContent = S.cost;
    elPar.textContent = S.done ? optimal(S.g).cost : '?';
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
      '<h1 class="sheet-title">Who do <span>you know?</span></h1>' +
      '<p class="sheet-body">Somebody has to read your paper. Get introduced through the people you know.</p>' +
      '<ul class="sheet-rules">' +
        '<li>Each introduction costs <b>favours</b>: an old supervisor is cheap, a cold email is not.</li>' +
        '<li>Your total counts, not the number of introductions. Match par for full marks.</li>' +
        '<li>Click the previous name to step back. Eight goals; the last is Erdős.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Start networking</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('start-btn').addEventListener('click', start);
  }

  function start() {
    SFX.unlock();
    overlay.classList.remove('is-open');
    S.level = 1; S.score = 0; S.hopsTotal = 0;
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
