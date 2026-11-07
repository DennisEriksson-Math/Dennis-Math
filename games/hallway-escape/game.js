/* ═══════════════════════════════════════════════════════════
   HALLWAY ESCAPE — get to the coffee machine.

   A side-scroller in the old style: run, jump, collect citations,
   do not be stopped. Each floor is put together from twenty-column
   chunks, so no two walks are the same. Everything that can stop
   you is in ENT below; the chunks are in CHUNKS.

   Logical size is 320 × 192 (20 × 12 tiles of 16px). Everything
   is drawn with rectangles, so there are no image files.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Constants ──────────────────────────────────────────── */

  const VW = 320, VH = 192, T = 16, ROWS = 12, FL = 10;   // FL: the row of the floor
  const DT = 1 / 60;

  const RUN = 105, ACC = 620, FRIC = 760, AIR_ACC = 360, AIR_FRIC = 80;
  const WET_ACC = 150, WET_FRIC = 55;
  const GRAV = 900, JUMP = 330, MAXFALL = 420;
  const PW = 10, PH = 15;               // the player's box

  const COIN = 10, BISCUIT = 50, GOAL_BONUS = 500;
  const HEARTS = 3;

  /* ─── What stands in your way ────────────────────────────── */

  /* hearts: patience lost. stuck: seconds you cannot move while they talk.
     time: seconds lost from the clock. slow: seconds at half speed. */
  const ENT = {
    q: { name: 'colleague', w: 11, h: 23, hearts: 1, stuck: 1.1, speed: 0,
         style: { hair: '#6a4a2c', skin: '#e3b48d', top: '#4f7aa6', pants: '#33384a', glasses: true },
         lines: ['Got a minute?', 'Quick question…', 'Do you have two minutes?', 'Just a tiny thing about the timetable', 'Ah, perfect timing!', 'Sorry, one thing!', 'This will only take a sec', 'Can I borrow you?', 'Did you see my email?', 'Quick one about the room booking', 'You are just the person I wanted!', 'It is about the minutes of the minutes'] },
    s: { name: 'student', w: 11, h: 21, hearts: 1, stuck: 0.8, speed: 34, range: 3,
         style: { hair: '#2e2a2a', skin: '#d9a97f', top: '#c2553f', pants: '#2c3e5c', bag: '#3b8a6e' },
         lines: ['Prof! Prof! One thing!', 'Is the exam on this?', 'I sent you an email!', 'Can I get an extension?', 'Do you have office hours?', 'Can you sign this?', 'Will this be on the test?', 'It is only a short question!', 'Did you get my message?', 'Is attendance mandatory?'] },
    d: { name: 'Dean', w: 15, h: 30, hearts: 1, stuck: 2.0, speed: 14, range: 2,
         style: { hair: '#b7b7b7', skin: '#e0b08a', top: '#25324a', pants: '#1b2236', tie: '#b8352b', glasses: true },
         lines: ['Walk with me.', 'A word, when you have a moment.', 'About the strategy…', 'Do you have a minute for the Faculty Board?', 'I have an exciting opportunity for you.', 'Have you thought about leadership?', 'Let us take a short walk.'] },
    v: { name: 'visitor', w: 11, h: 23, hearts: 0, slow: 3.5, speed: 20, range: 3,
         style: { hair: '#8a7a64', skin: '#e8c19c', top: '#d6b44e', pants: '#6f5a46', bag: '#7a5a8a' },
         lines: ['Excuse me, where is room B12?', 'Is this the maths building?', 'Sorry, is there a toilet?', 'Which way to the café?', 'I am here for the seminar?', 'Is this the third floor?', 'I think I am lost, sorry!'] },
    a: { name: 'administrator', w: 11, h: 23, hearts: 0, stuck: 1.6, time: 6, speed: 0,
         style: { hair: '#3a2a22', skin: '#d4a07a', top: '#8a4f7a', pants: '#2f3446', clip: true, glasses: true },
         lines: ['Just sign here. And here. And here.', 'Form 27B. In triplicate.', 'Have you done the mandatory training?', 'You missed the deadline (yesterday).', 'Did you read the new policy?', 'The portal says you owe us a receipt.'] },
    e: { name: 'email', w: 12, h: 8, hearts: 0, stuck: 0.6, time: 4, speed: 58, flying: true,
         lines: ['REPLY ALL', 'Re: Re: Re: Fwd: Meeting', 'URGENT (not urgent)', 'Per my last email…', 'Please find attached', 'Gentle reminder!'] },
    z: { name: 'cable', w: 14, h: 4, hearts: 0, stuck: 0.5, time: 2, speed: 0, still: true,
         lines: ['Ouch.', 'Who left that there?', 'Trip.', 'Facilities will hear about this.'] }
  };
  const PHONE_LINES = ['…I will email you.', 'Oh, never mind.', '(waves, unheard)', 'Hello? …Right.', 'They cannot hear a word.'];
  const PIT_LINES = ['Floor closed for maintenance.', 'The sign was there. Honestly.', 'Whoops.', 'Mind the gap, said the sign.'];

  /* ─── The chunks ─────────────────────────────────────────── */

  function Grid(w) {
    this.w = w;
    this.r = [];
    for (let y = 0; y < ROWS; y++) this.r.push(new Array(w).fill(y >= FL ? '#' : '.'));
  }
  Grid.prototype.put = function (ch, c, r) { if (c >= 0 && c < this.w && r >= 0 && r < ROWS) this.r[r][c] = ch; return this; };
  Grid.prototype.stand = function (ch, c) { return this.put(ch, c, FL - 1); };
  Grid.prototype.pit = function (a, b) { for (let c = a; c <= b; c++) { this.r[FL][c] = '.'; this.r[FL + 1][c] = '.'; } return this; };
  Grid.prototype.wet = function (a, b) { for (let c = a; c <= b; c++) this.r[FL][c] = 'W'; return this; };
  Grid.prototype.coins = function (a, b, row) { for (let c = a; c <= b; c++) this.put('o', c, row); return this; };
  Grid.prototype.stack = function (ch, c, n) { for (let i = 0; i < n; i++) this.put(ch, c, FL - 1 - i); return this; };
  Grid.prototype.shelf = function (a, b, row) { for (let c = a; c <= b; c++) this.put('p', c, row); return this; };

  /* Each chunk keeps one thing in mind: the floor at its two ends is flat, so
     any chunk can follow any other. */
  const CHUNKS = {
    start:  { w: 14, build: (g) => g.coins(6, 8, 9) },
    goal:   { w: 16, build: (g) => g.coins(3, 8, 9).put('K', 11, FL - 1) },
    checkpoint: { w: 14, build: (g) => g.put('k', 6, FL - 1).coins(9, 11, 9) },

    plain:  { w: 20, build: (g) => g.coins(4, 6, 9).coins(8, 10, 8).coins(13, 15, 9) },
    boxes:  { w: 20, build: (g) => g.put('B', 6, 9).put('B', 12, 9).put('B', 13, 9).coins(6, 6, 7).coins(12, 13, 7).coins(17, 18, 9) },
    quick:  { w: 20, build: (g) => g.stand('q', 10).coins(9, 11, 7).coins(3, 4, 9) },
    pit3:   { w: 20, build: (g) => g.pit(8, 10).coins(8, 10, 7).coins(3, 5, 9) },
    pit2b:  { w: 20, build: (g) => g.pit(5, 6).pit(12, 14).coins(5, 6, 7).coins(12, 14, 7) },
    shelves:{ w: 20, build: (g) => g.shelf(4, 6, 7).coins(4, 6, 6).shelf(9, 11, 6).coins(9, 11, 5).put('b', 15, 8).coins(16, 18, 9) },
    wet:    { w: 20, build: (g) => g.wet(4, 9).stand('q', 14).coins(5, 8, 8).coins(16, 17, 9) },
    cabinets:{ w: 20, build: (g) => g.stack('F', 6, 1).stack('F', 7, 2).stack('F', 8, 1).stack('F', 13, 2).coins(7, 7, 6).coins(13, 13, 6).coins(16, 18, 9) },
    copier: { w: 20, build: (g) => g.put('X', 8, 8).put('X', 9, 8).put('X', 8, 9).put('X', 9, 9).coins(8, 9, 6).coins(3, 5, 9).coins(13, 15, 9) },
    cable:  { w: 20, build: (g) => g.stand('z', 6).stand('z', 11).stand('z', 15).coins(8, 9, 8).coins(12, 13, 8) },
    student:{ w: 20, build: (g) => g.stand('s', 12).coins(5, 7, 9).coins(16, 17, 8) },
    visitor:{ w: 20, build: (g) => g.stand('v', 11).put('B', 4, 9).coins(4, 4, 7).coins(16, 18, 9) },
    email:  { w: 20, build: (g) => g.stand('e', 17).put('B', 8, 9).coins(8, 8, 7).coins(3, 5, 9) },
    admin:  { w: 20, build: (g) => g.stand('a', 8).put('T', 13, 9).coins(13, 13, 7).coins(16, 18, 9) },
    island: { w: 20, build: (g) => g.pit(3, 5).pit(9, 11).coins(3, 5, 7).coins(9, 11, 7).coins(14, 16, 9) },
    dean:   { w: 20, build: (g) => g.stand('d', 10).coins(9, 11, 7).coins(3, 5, 9).coins(15, 17, 9) },
    gauntlet:{ w: 20, build: (g) => g.stand('q', 5).stand('s', 11).stand('v', 16).coins(4, 6, 7).coins(10, 12, 7) },
    headphones: { w: 20, build: (g) => g.shelf(6, 8, 7).put('H', 7, 6).stand('q', 13).stand('s', 17).coins(10, 11, 9) },
    coffee: { w: 20, build: (g) => g.stack('F', 6, 1).stack('F', 7, 2).stack('F', 8, 3).stack('F', 9, 2).stack('F', 10, 1).put('C', 8, 6).coins(13, 15, 9).put('b', 17, 8) }
  };

  /* What each floor is like: how long you get, how many chunks, and which ones. */
  const LEVELS = [
    { name: 'The third-floor corridor', time: 80, mids: 7, theme: 0,
      pool: { plain: 1, boxes: 3, quick: 3, pit3: 2, shelves: 2, wet: 2, cabinets: 2, copier: 1, cable: 1 },
      forced: ['coffee'],
      hint: 'Run, jump, and do not stop to chat. Colleagues cost you patience. Citations are worth collecting.',
      done: 'Coffee. Black. No questions asked.' },
    { name: 'The long way round', time: 100, mids: 9, theme: 1,
      pool: { boxes: 1, quick: 2, pit3: 2, pit2b: 2, shelves: 1, wet: 2, cabinets: 1, copier: 1, cable: 2, student: 3, visitor: 3, email: 3, admin: 2, island: 1 },
      forced: ['coffee', 'headphones'],
      hint: 'Students follow you, visitors are lost, and an email can find you anywhere. Headphones make you unreachable for a while.',
      done: 'Two sugars and a clear conscience.' },
    { name: 'The basement café', time: 125, mids: 12, theme: 2,
      pool: { quick: 2, pit3: 1, pit2b: 2, wet: 2, cable: 1, student: 2, visitor: 2, email: 3, admin: 2, island: 2, dean: 3, gauntlet: 3, copier: 1 },
      forced: ['coffee', 'headphones', 'dean'],
      hint: 'The Dean is on this floor. So is everybody else. Jump high, and keep your headphones for the bad moments.',
      done: 'The machine says OUT OF ORDER.' }
  ];

  const THEMES = [
    { wall: '#d8cdb0', wall2: '#cbbf9b', trim: '#8a7b5a', top: '#9a9588', floor: '#7a7569', floor2: '#68635a', door: '#6a4a32', accent: '#2e7d7a', ceil: '#efe9d6', light: '#fff7cf', void: '#0a0e13' },
    { wall: '#b6c8b2', wall2: '#a3b69f', trim: '#5f7a5c', top: '#8a978b', floor: '#6c786f', floor2: '#5b665e', door: '#5b3f2a', accent: '#b8762e', ceil: '#dfe9da', light: '#f6ffd9', void: '#090d0f' },
    { wall: '#5b6c7e', wall2: '#4d5d6e', trim: '#2b3642', top: '#586271', floor: '#454d5a', floor2: '#383f4a', door: '#3b4a58', accent: '#e0a458', ceil: '#2f3a47', light: '#bfe0ff', void: '#06080b' }
  ];

  const DOOR_NAMES = ['B12', 'B13', 'B14', 'STAFF', 'PRINT', 'POST', 'SEMINAR', 'MATHS', 'LIFT', 'STORE', 'DEAN', 'COFFEE?'];

  const SOLID = { '#': 1, W: 1, B: 1, F: 1, T: 1, X: 1 };

  /* ─── State ──────────────────────────────────────────────── */

  const keys = { left: false, right: false, jump: false };
  let jumpEdge = false;

  const S = {
    mode: 'menu',          // menu | play | pause | dead | done | end
    level: 0,
    score: 0,
    best: Number(localStorage.getItem('hallwayescape.best') || 0),
    hearts: HEARTS,
    time: 100,
    coins: 0,
    deaths: 0,
    lates: 0,
    cp: null,
    paused: false,
    lvl: null,
    cam: 0
  };
  let P = null;
  let ents = [], items = [], floats = [];
  let simT = 0;

  const $ = (id) => document.getElementById(id);
  const cv = $('cv'), ctx = cv.getContext('2d'), viewEl = $('view'), overlay = $('overlay');
  const elScore = $('score'), elCoins = $('coins'), elClock = $('clock'), elLives = $('lives'), elTag = $('level-tag');

  /* ─── Helpers ────────────────────────────────────────────── */

  function rnd(a) { return a[(Math.random() * a.length) | 0]; }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const bags = new Map();
  function draw(list) {
    let b = bags.get(list);
    if (!b || !b.length) { b = shuffle(list.slice()); bags.set(list, b); }
    return b.pop();
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ─── Building a floor ───────────────────────────────────── */

  function weighted(pool, avoid) {
    const names = Object.keys(pool).filter((n) => n !== avoid);
    let total = 0; names.forEach((n) => { total += pool[n]; });
    let r = Math.random() * total;
    for (const n of names) { r -= pool[n]; if (r <= 0) return n; }
    return names[0];
  }

  function buildLevel(i) {
    const cfg = LEVELS[i];
    const mids = [];
    let prev = null;
    while (mids.length < cfg.mids - cfg.forced.length) {
      const n = weighted(cfg.pool, prev);
      mids.push(n); prev = n;
    }
    // Forced chunks go at random places, but never first.
    cfg.forced.forEach((f) => { mids.splice(1 + ((Math.random() * mids.length) | 0), 0, f); });
    const half = Math.ceil(mids.length / 2);
    const seq = ['start'].concat(mids.slice(0, half), ['checkpoint'], mids.slice(half), ['goal']);

    const grid = [];
    for (let y = 0; y < ROWS; y++) grid.push([]);
    seq.forEach((name) => {
      const c = CHUNKS[name];
      const g = new Grid(c.w);
      c.build(g);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < c.w; x++) grid[y].push(g.r[y][x]);
    });

    const cols = grid[0].length;
    const lvl = { cfg: cfg, theme: THEMES[cfg.theme], grid: grid, cols: cols, width: cols * T, checkpoints: [], goal: null, spawns: [], itemSpawns: [], decor: [] };

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = grid[y][x];
        if ('qsdvaez'.indexOf(ch) >= 0) { lvl.spawns.push({ type: ch, col: x, row: y }); grid[y][x] = '.'; }
        else if ('obHC'.indexOf(ch) >= 0) { lvl.itemSpawns.push({ type: ch, col: x, row: y }); grid[y][x] = '.'; }
        else if (ch === 'k') { lvl.checkpoints.push({ x: x * T + T / 2 }); grid[y][x] = '.'; }
        else if (ch === 'K') { lvl.goal = { x: x * T, y: y * T - T }; grid[y][x] = '.'; }
      }
    }

    // Wall decoration, drawn on a slower layer.
    let dx = 40;
    const span = lvl.width * 0.7 + VW + 60;
    while (dx < span) {
      const kind = rnd(['door', 'door', 'door', 'window', 'board', 'plant', 'ext', 'clock']);
      lvl.decor.push({ kind: kind, x: dx, label: rnd(DOOR_NAMES), v: (Math.random() * 3) | 0 });
      dx += 54 + ((Math.random() * 60) | 0);
    }
    return lvl;
  }

  function solid(c, r) {
    const L = S.lvl;
    if (c < 0 || c >= L.cols) return c < 0;
    if (r < 0 || r >= ROWS) return false;
    return !!SOLID[L.grid[r][c]];
  }
  function tileAt(c, r) {
    const L = S.lvl;
    if (c < 0 || c >= L.cols || r < 0 || r >= ROWS) return '.';
    return L.grid[r][c];
  }

  /* ─── Starting and restarting ────────────────────────────── */

  function makeEntities() {
    ents = S.lvl.spawns.map((s) => {
      const d = ENT[s.type];
      const x = s.col * T + T / 2, y = (s.row + 1) * T;
      return {
        type: s.type, d: d, x: x, y: y - (d.flying ? 3 : 0), x0: x, dir: -1,
        range: (d.range || 0) * T, say: null, sayT: 0, cool: 0, near: false, active: !d.flying, gone: false, ph: Math.random() * 6
      };
    });
  }
  function makeItems() {
    items = S.lvl.itemSpawns.map((s) => ({ type: s.type, x: s.col * T + T / 2, y: s.row * T + T / 2, got: false, ph: Math.random() * 6 }));
  }

  function placePlayer(x) {
    P = {
      x: x, y: FL * T - PH, vx: 0, vy: 0, face: 1, ground: true, coyote: 0, jbuf: 0,
      stuck: 0, invuln: 0, slow: 0, phones: 0, step: 0, safeX: x, safeY: FL * T - PH, wetNow: false
    };
    S.cam = clamp(x - 110, 0, S.lvl.width - VW);
  }

  function beginLevel(i, retry) {
    S.level = i;
    if (!retry) S.lvl = buildLevel(i);
    makeEntities(); makeItems();
    floats = []; jumpEdge = false;
    if (!retry) {
      S.cp = null; S.time = LEVELS[i].time; S.hearts = HEARTS; S.coins = 0;
      S.levelStartScore = S.score; S.late = false;
    } else {
      // Back to the last checkpoint: what came before it stays done, what came after is as it was.
      S.hearts = HEARTS; S.time = Math.max(S.time, 40);
      if (S.cp) {
        S.score = S.cp.score; S.coins = S.cp.coins;
        items.forEach((it) => { if (it.x < S.cp.x) it.got = true; });
        ents.forEach((e) => { if (e.x < S.cp.x - 20) e.gone = true; });
      } else { S.score = S.levelStartScore; S.coins = 0; }
    }
    placePlayer(retry && S.cp ? S.cp.x : 24);
    P.invuln = 1.2;
    elTag.textContent = 'Floor ' + (i + 1) + ' of ' + LEVELS.length + ' · ' + LEVELS[i].name;
    updateHud();
  }

  /* ─── Game logic ─────────────────────────────────────────── */

  function floatText(x, y, text, color) { floats.push({ x: x, y: y, t: 0, text: text, color: color || '#fff' }); }

  function hurtBy(e) {
    const d = e.d;
    if (P.invuln > 0 || e.cool > 0 || e.gone) return;
    e.cool = 1.8;
    if (P.phones > 0) { say(e, draw(PHONE_LINES), 1.3); return; }

    say(e, draw(d.lines), 1.9);
    P.invuln = 1.9;
    P.vx = 0;
    if (d.stuck) P.stuck = d.stuck;
    if (d.slow) { P.slow = d.slow; floatText(P.x, P.y - 6, 'slowed', '#f2d98a'); }
    if (d.time) { S.time -= d.time; floatText(P.x, P.y - 6, '-' + d.time + 's', '#ff9c8a'); }
    // Step clear of them, on the side you came from.
    const side = P.x < e.x ? -1 : 1;
    if (!d.flying && !d.still) {
      const nx = e.x + side * (d.w / 2 + PW / 2 + 2);
      if (!boxHitsSolid(nx, P.y)) P.x = nx;
    }
    if (d.hearts) {
      S.hearts -= d.hearts;
      floatText(P.x, P.y - 12, '-1 patience', '#ff8a7a');
      SFX.hurt();
      if (S.hearts <= 0) { die(); return; }
    } else { SFX.trip(); }
    if (d.flying) e.gone = true;
  }

  function boxHitsSolid(x, y) {
    const c0 = Math.floor((x - PW / 2) / T), c1 = Math.floor((x + PW / 2) / T);
    const r0 = Math.floor(y / T), r1 = Math.floor((y + PH - 1) / T);
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) if (solid(c, r)) return true;
    return false;
  }

  function say(e, text, t) { e.say = text; e.sayT = t; }

  function die() {
    if (S.mode !== 'play') return;
    S.mode = 'dead';
    S.deaths++;
    SFX.over();
    setTimeout(deadScreen, 450);
  }

  function updatePlayer(dt) {
    const L = S.lvl;
    P.stuck = Math.max(0, P.stuck - dt);
    P.invuln = Math.max(0, P.invuln - dt);
    P.slow = Math.max(0, P.slow - dt);
    P.phones = Math.max(0, P.phones - dt);
    const can = P.stuck <= 0;

    const dir = can ? (keys.right ? 1 : 0) - (keys.left ? 1 : 0) : 0;
    const maxV = RUN * (P.slow > 0 ? 0.5 : 1) * (P.phones > 0 ? 1.2 : 1);
    const wet = P.ground && tileAt(Math.floor(P.x / T), FL) === 'W';
    P.wetNow = wet;
    const acc = P.ground ? (wet ? WET_ACC : ACC) : AIR_ACC;
    const fric = P.ground ? (wet ? WET_FRIC : FRIC) : AIR_FRIC;

    if (dir) {
      const turning = Math.sign(P.vx) === -dir;
      P.vx += dir * acc * (turning && !wet ? 1.8 : 1) * dt;
      P.vx = clamp(P.vx, -maxV, maxV);
      P.face = dir;
    } else if (P.vx) {
      const dv = fric * dt;
      P.vx = Math.abs(P.vx) <= dv ? 0 : P.vx - Math.sign(P.vx) * dv;
    }
    if (!can) P.vx = 0;

    if (jumpEdge) { P.jbuf = 0.11; jumpEdge = false; } else P.jbuf -= dt;
    if (P.ground) P.coyote = 0.09; else P.coyote -= dt;
    if (P.jbuf > 0 && P.coyote > 0 && can) {
      P.vy = -JUMP; P.ground = false; P.coyote = 0; P.jbuf = 0; SFX.jump();
    }
    const g = GRAV * (P.vy < 0 && !keys.jump ? 2.3 : 1);
    P.vy = Math.min(MAXFALL, P.vy + g * dt);

    // Horizontal move, then vertical, each against the tiles.
    P.x += P.vx * dt;
    const left = Math.max(S.cam + 2, 0);
    if (P.x - PW / 2 < left) { P.x = left + PW / 2; if (P.vx < 0) P.vx = 0; }
    if (P.x + PW / 2 > L.width) { P.x = L.width - PW / 2; P.vx = 0; }
    const r0 = Math.floor((P.y + 1) / T), r1 = Math.floor((P.y + PH - 1) / T);
    if (P.vx > 0) {
      const c = Math.floor((P.x + PW / 2) / T);
      for (let r = r0; r <= r1; r++) if (solid(c, r)) { P.x = c * T - PW / 2 - 0.01; P.vx = 0; break; }
    } else if (P.vx < 0) {
      const c = Math.floor((P.x - PW / 2) / T);
      for (let r = r0; r <= r1; r++) if (solid(c, r)) { P.x = (c + 1) * T + PW / 2 + 0.01; P.vx = 0; break; }
    }

    const prevBottom = P.y + PH;
    P.y += P.vy * dt;
    P.ground = false;
    const c0 = Math.floor((P.x - PW / 2 + 0.5) / T), c1 = Math.floor((P.x + PW / 2 - 0.5) / T);
    if (P.vy >= 0) {
      const r = Math.floor((P.y + PH) / T);
      for (let c = c0; c <= c1; c++) {
        const ch = tileAt(c, r);
        const top = r * T;
        if (SOLID[ch] || (ch === 'p' && prevBottom <= top + 0.5)) {
          P.y = top - PH; P.vy = 0; P.ground = true; break;
        }
      }
    } else {
      const r = Math.floor(P.y / T);
      for (let c = c0; c <= c1; c++) if (solid(c, r)) { P.y = (r + 1) * T; P.vy = 0; break; }
    }

    // Walking animation, and a place to come back to after a fall.
    if (P.ground && Math.abs(P.vx) > 8) P.step += dt * (Math.abs(P.vx) / 9);
    if (P.ground && solid(Math.floor((P.x - 24) / T), FL) && solid(Math.floor(P.x / T), FL) && solid(Math.floor((P.x + 24) / T), FL)) {
      P.safeX = P.x; P.safeY = P.y;
    }

    // Fell down a hole in the floor.
    if (P.y > VH + 30) {
      S.hearts--; SFX.fall();
      floatText(P.safeX, P.safeY - 10, '-1 patience', '#ff8a7a');
      if (S.hearts <= 0) { die(); return; }
      P.x = Math.max(S.cam + 20, P.safeX - 28); P.y = P.safeY; P.vx = 0; P.vy = 0; P.invuln = 1.6;
      P.stuck = 0.6;
      toast(draw(PIT_LINES));
    }
  }

  let toastText = '', toastT = 0;
  function toast(t) { toastText = t; toastT = 2.2; }

  function overlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function updateWorld(dt) {
    const L = S.lvl;
    simT += dt;

    ents.forEach((e) => {
      if (e.gone) return;
      const d = e.d;
      e.cool = Math.max(0, e.cool - dt);
      if (e.sayT > 0) e.sayT -= dt;
      const dx = P.x - e.x;
      const wasNear = e.near;
      e.near = !d.flying && !d.still && Math.abs(dx) < 70 && Math.abs(P.y + PH - e.y) < 30 && !(P.phones > 0);
      if (e.near && !wasNear && e.sayT <= 0) SFX.alert();

      if (d.flying) {
        if (!e.active && e.x - S.cam < VW + 24) e.active = true;
        if (e.active) {
          e.x -= d.speed * dt;
          e.yy = e.y + Math.sin(simT * 4 + e.ph) * 3;
          if (e.x < S.cam - 30) e.gone = true;
        }
      } else if (d.speed) {
        // Students come for you; the rest wander.
        if (e.type === 's' && Math.abs(dx) < 90 && Math.abs(e.x - e.x0) < e.range + 16) e.dir = Math.sign(dx) || e.dir;
        e.x += e.dir * d.speed * dt;
        if (e.x < e.x0 - e.range) { e.x = e.x0 - e.range; e.dir = 1; }
        if (e.x > e.x0 + e.range) { e.x = e.x0 + e.range; e.dir = -1; }
      }

      const ey = (e.yy != null ? e.yy : e.y) - d.h;
      if (e.active && overlap(P.x - PW / 2 + 1, P.y + 1, PW - 2, PH - 1, e.x - d.w / 2, ey, d.w, d.h)) hurtBy(e);
    });

    items.forEach((it) => {
      if (it.got) return;
      if (overlap(P.x - PW / 2, P.y, PW, PH, it.x - 6, it.y - 6, 12, 12)) {
        it.got = true;
        if (it.type === 'o') { S.score += COIN; S.coins++; SFX.coin(); floatText(it.x, it.y - 6, '+' + COIN, '#ffe08a'); }
        else if (it.type === 'b') { S.score += BISCUIT; SFX.biscuit(); floatText(it.x, it.y - 6, '+' + BISCUIT + ' biscuit', '#ffd5a0'); }
        else if (it.type === 'H') { P.phones = 8; SFX.power(); floatText(it.x, it.y - 8, 'headphones!', '#9fe3ff'); toast('Headphones on. Nobody can reach you.'); }
        else if (it.type === 'C') {
          SFX.power();
          if (S.hearts < HEARTS) { S.hearts++; floatText(it.x, it.y - 8, '+1 patience', '#a8e6b0'); toast('A coffee on the way. Patience restored.'); }
          else { S.score += 100; floatText(it.x, it.y - 8, '+100', '#ffe08a'); toast('A spare coffee. You were fine, really.'); }
        }
      }
    });

    // Checkpoints.
    L.checkpoints.forEach((c) => {
      if (P.x > c.x && (!S.cp || S.cp.x < c.x)) {
        S.cp = { x: c.x, score: S.score, coins: S.coins };
        floatText(c.x, FL * T - 30, 'Checkpoint', '#ffffff'); SFX.power();
      }
    });

    // The coffee machine.
    if (L.goal && P.x > L.goal.x + 4 && S.mode === 'play') arrive();

    S.time -= dt;
    if (S.time < 0 && !S.late) { S.late = true; S.lates++; toast('The meeting has started. Keep going, you are very late.'); }

    for (let i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 1.1) floats.splice(i, 1); }
    toastT = Math.max(0, toastT - dt);

    // The camera leads a little in the direction you are running.
    const target = clamp(P.x - 110, 0, L.width - VW);
    S.cam += (target - S.cam) * Math.min(1, 7 * dt);
  }

  function update(dt) {
    if (S.mode !== 'play') return;
    updatePlayer(dt);
    if (S.mode !== 'play') return;
    updateWorld(dt);
  }

  /* ─── Rendering ──────────────────────────────────────────── */

  let SC = 1;
  function layout() {
    const w = viewEl.clientWidth, h = viewEl.clientHeight;
    const s = Math.min(w / VW, h / VH);
    const cw = Math.max(1, Math.floor(VW * s)), ch = Math.max(1, Math.floor(VH * s));
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    SC = cv.width / VW;
  }
  window.addEventListener('resize', layout);

  function rect(c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }

  function person(cx, bottom, dir, step, st, w, h, air) {
    const sc = h / 23;
    const headH = Math.round(7 * sc), legH = Math.round(7 * sc), torsoH = h - headH - legH;
    const bw = w - 2, hw = Math.round(w * 0.58);
    const x0 = cx - w / 2;
    const swing = air ? 0 : Math.sin(step * 2.2);
    const lA = Math.round(swing * 2), lB = -lA;
    // legs
    rect(st.pants, x0 + 1, bottom - legH + (lA > 0 ? -1 : 0), 3, legH + (lA > 0 ? 1 : 0));
    rect(st.pants, x0 + w - 4, bottom - legH + (lB > 0 ? -1 : 0), 3, legH + (lB > 0 ? 1 : 0));
    rect('#1d1d24', x0 + 1 + (lA > 0 ? 0 : 0), bottom - 1, 4, 1);
    rect('#1d1d24', x0 + w - 5, bottom - 1, 4, 1);
    // backpack, behind
    if (st.bag) rect(st.bag, cx - dir * (w / 2 + 1) - 2, bottom - legH - torsoH + 2, 4, torsoH - 2);
    // torso and arms
    rect(st.top, x0 + 1, bottom - legH - torsoH, bw, torsoH);
    rect(st.top, cx + dir * (w / 2 - 1) - 1, bottom - legH - torsoH + 1, 2, torsoH - 2);
    if (st.tie) rect(st.tie, cx - 1 + dir, bottom - legH - torsoH + 1, 2, torsoH - 3);
    if (st.clip) { rect('#7a5a32', cx + dir * (w / 2 + 1) - 2, bottom - legH - torsoH + 3, 4, 6); rect('#ffffff', cx + dir * (w / 2 + 1) - 1, bottom - legH - torsoH + 4, 2, 4); }
    // head
    const hy = bottom - legH - torsoH - headH;
    rect(st.skin, cx - hw / 2, hy, hw, headH);
    rect(st.hair, cx - hw / 2 - 0.5, hy - 1, hw + 1, 2.5);
    // face
    const ex = cx + dir * 1.2;
    rect('#222', ex - 1.6, hy + headH * 0.42, 1, 1);
    rect('#222', ex + 1.4, hy + headH * 0.42, 1, 1);
    if (st.glasses) { ctx.strokeStyle = '#222'; ctx.lineWidth = 0.6; ctx.strokeRect(ex - 2.4, hy + headH * 0.3, 2.6, 2.4); ctx.strokeRect(ex + 0.7, hy + headH * 0.3, 2.6, 2.4); }
  }

  function drawBackground(L, th) {
    const cam = S.cam;
    rect(th.wall, 0, 0, VW, FL * T);
    rect(th.wall2, 0, FL * T - 20, VW, 20);
    // ceiling with lights
    rect(th.ceil, 0, 0, VW, 12);
    rect(th.trim, 0, 12, VW, 2);
    const lx0 = -((cam * 0.9) % 64);
    for (let x = lx0 - 64; x < VW + 64; x += 64) { rect(th.light, x + 16, 3, 32, 5); rect('rgba(255,255,255,0.08)', x + 8, 14, 48, 10); }

    // wall decoration on a slower layer
    const par = cam * 0.7;
    L.decor.forEach((d) => {
      const x = Math.round(d.x - par);
      if (x < -50 || x > VW + 10) return;
      const gy = FL * T;
      if (d.kind === 'door') {
        rect(th.trim, x - 1, gy - 47, 26, 47);
        rect(th.door, x, gy - 46, 24, 46);
        rect('rgba(255,255,255,0.18)', x + 7, gy - 38, 10, 14);
        rect('#ddd', x + 3, gy - 56, 18, 7);
        ctx.fillStyle = '#333'; ctx.font = '5px Sora, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(d.label, x + 12, gy - 51);
        rect('#caa84a', x + 19, gy - 22, 2, 3);
      } else if (d.kind === 'window') {
        rect(th.trim, x - 1, 29, 32, 24);
        rect(d.v === 0 ? '#9fcbe8' : d.v === 1 ? '#c8d7e6' : '#b5c9dd', x, 30, 30, 22);
        rect(th.trim, x + 14, 30, 2, 22); rect(th.trim, x, 40, 30, 2);
      } else if (d.kind === 'board') {
        rect('#7a5a38', x - 1, 54, 36, 28);
        rect('#c9b27c', x, 55, 34, 26);
        rect('#fff', x + 3, 59, 9, 11); rect('#f5e089', x + 15, 60, 8, 8); rect('#e8a6a6', x + 25, 58, 7, 12);
        rect('#d33', x + 7, 59, 1, 1); rect('#36c', x + 19, 60, 1, 1);
      } else if (d.kind === 'plant') {
        rect('#9c5a3a', x + 3, gy - 12, 10, 12);
        rect('#3a7a44', x, gy - 28, 16, 17); rect('#4c9a58', x + 4, gy - 34, 8, 10);
      } else if (d.kind === 'ext') {
        rect('#c43a2e', x + 2, gy - 22, 8, 20); rect('#222', x + 3, gy - 26, 6, 4); rect('#e7e7e7', x + 3, gy - 14, 6, 4);
      } else if (d.kind === 'clock') {
        ctx.fillStyle = '#f3f0e6'; ctx.beginPath(); ctx.arc(x + 10, 44, 9, 0, 6.3); ctx.fill();
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 10, 44); ctx.lineTo(x + 10, 38); ctx.moveTo(x + 10, 44); ctx.lineTo(x + 14, 46); ctx.stroke();
      }
    });
  }

  function drawTiles(L, th) {
    const cam = Math.round(S.cam);
    const c0 = Math.max(0, Math.floor(cam / T)), c1 = Math.min(L.cols - 1, Math.floor((cam + VW) / T) + 1);
    // the dark under the floor shows through the holes
    rect(th.void, 0, FL * T, VW, VH - FL * T);
    for (let c = c0; c <= c1; c++) {
      for (let r = 0; r < ROWS; r++) {
        const ch = L.grid[r][c];
        if (ch === '.') continue;
        const x = c * T - cam, y = r * T;
        if (ch === '#' || ch === 'W') {
          if (r === FL) {
            rect(th.top, x, y, T + 0.6, 5);
            rect('rgba(255,255,255,0.18)', x, y, T + 0.6, 1);
            rect(th.floor, x, y + 5, T + 0.6, T - 5);
            if ((c + (r >> 1)) % 2 === 0) rect('rgba(0,0,0,0.06)', x, y, T, 5);
            if (ch === 'W') { rect('rgba(150,200,240,0.55)', x, y, T + 0.6, 2); rect('rgba(220,240,255,0.5)', x + 3 + ((c * 5) % 6), y, 4, 1); }
          } else {
            rect((c + r) % 2 ? th.floor2 : th.floor, x, y, T + 0.6, T + 0.6);
          }
          // a striped edge where the floor ends at a hole
          if (r >= FL && c > 0 && tileAt(c - 1, r) === '.') this_edge(x, y);
          if (r >= FL && c < L.cols - 1 && tileAt(c + 1, r) === '.') this_edge(x + T - 2, y);
        } else if (ch === 'B') {
          rect('#a9783f', x, y, T, T); rect('#8c5f2e', x, y + T - 2, T, 2);
          rect('#d8c08a', x + 6, y, 4, T); rect('rgba(0,0,0,0.12)', x, y, 1, T);
        } else if (ch === 'F') {
          rect('#8e9aa6', x, y, T, T); rect('#a9b5c0', x + 1, y + 1, T - 2, T - 2);
          rect('#5f6b76', x + 1, y + 7, T - 2, 1); rect('#3d4650', x + 6, y + 3, 4, 1); rect('#3d4650', x + 6, y + 11, 4, 1);
        } else if (ch === 'T') {
          rect('#8a5a30', x, y, T, 4); rect('#6a4222', x + 1, y + 4, 2, T - 4); rect('#6a4222', x + T - 3, y + 4, 2, T - 4);
          rect('#e8e0cc', x + 3, y - 3, 6, 3); rect('#caa', x + 9, y - 2, 3, 2);
        } else if (ch === 'X') {
          rect('#c9ccd0', x, y, T, T); rect('#aeb2b8', x, y + T - 3, T, 3);
          if (tileAt(c, r - 1) !== 'X') { rect('#dfe2e6', x, y, T, 3); rect('#444', x + 2, y + 5, 12, 4); }
          if (tileAt(c - 1, r) !== 'X' && tileAt(c, r - 1) !== 'X') { ctx.fillStyle = '#d33'; ctx.font = '4px Sora, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('JAM', x + 2, y + 9); }
          if (tileAt(c - 1, r) === 'X' && tileAt(c, r - 1) !== 'X') { rect(Math.floor(simT * 3) % 2 ? '#f33' : '#722', x + 11, y + 11, 3, 3); }
        } else if (ch === 'p') {
          rect('#7d5a36', x, y, T, 4); rect('#a47a4c', x, y, T, 1);
          if (tileAt(c - 1, r) !== 'p') rect('#555', x + 1, y + 4, 2, 5);
          if (tileAt(c + 1, r) !== 'p') rect('#555', x + T - 3, y + 4, 2, 5);
        }
      }
    }
    // wet-floor signs
    for (let c = c0; c <= c1; c++) {
      if (L.grid[FL][c] === 'W' && L.grid[FL][c - 1] !== 'W') {
        const x = c * T - cam - 3;
        rect('#f2c300', x, FL * T - 11, 8, 11); rect('#222', x + 3, FL * T - 8, 2, 4); rect('#222', x + 3, FL * T - 3, 2, 1);
      }
    }
  }
  function this_edge(x, y) {
    rect('#f2c300', x, y, 2, T);
    for (let k = 0; k < T; k += 4) rect('#222', x, y + k, 2, 2);
  }

  function drawGoal(L, th) {
    if (!L.goal) return;
    const x = Math.round(L.goal.x - S.cam), y = FL * T;
    rect('#2a2d33', x, y - 38, 28, 38);
    rect('#4a4f58', x + 2, y - 36, 24, 34);
    rect('#12301f', x + 5, y - 33, 18, 8);
    ctx.fillStyle = L.cfg.name.indexOf('basement') >= 0 ? '#ff6b5a' : '#7dff9c';
    ctx.font = '5px Sora, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(L.cfg.name.indexOf('basement') >= 0 ? 'OUT OF ORDER' : 'COFFEE', x + 14, y - 27);
    rect('#222', x + 8, y - 20, 12, 14); rect('#f7f3e8', x + 10, y - 12, 8, 6); rect('#7a4a24', x + 11, y - 13, 6, 2);
    rect('#d33', x + 22, y - 22, 3, 3); rect('#3c6', x + 22, y - 17, 3, 3);
    // a welcome glow
    ctx.fillStyle = 'rgba(255, 224, 150, 0.12)';
    ctx.beginPath(); ctx.arc(x + 14, y - 20, 34 + Math.sin(simT * 3) * 2, 0, 6.3); ctx.fill();
  }

  function drawItems() {
    items.forEach((it) => {
      if (it.got) return;
      const x = it.x - S.cam, bob = Math.sin(simT * 4 + it.ph) * 1.5, y = it.y + bob;
      if (x < -10 || x > VW + 10) return;
      if (it.type === 'o') {
        ctx.fillStyle = '#f4c542'; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#c9961a'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#ffe88a'; ctx.fillRect(Math.round(x - 1), Math.round(y - 3), 1, 3);
      } else if (it.type === 'b') {
        ctx.fillStyle = '#d99a52'; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 6.3); ctx.fill();
        rect('#6a3f1e', x - 2, y - 2, 1, 1); rect('#6a3f1e', x + 1, y + 1, 1, 1); rect('#6a3f1e', x - 1, y + 2, 1, 1); rect('#6a3f1e', x + 2, y - 2, 1, 1);
      } else if (it.type === 'H') {
        ctx.strokeStyle = '#222'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, 5, Math.PI, 0); ctx.stroke();
        rect('#3aa0ff', x - 7, y, 3, 5); rect('#3aa0ff', x + 4, y, 3, 5);
      } else if (it.type === 'C') {
        rect('#f7f3e8', x - 4, y - 3, 8, 8); rect('#7a4a24', x - 3, y - 2, 6, 2); rect('#f7f3e8', x + 4, y - 1, 2, 4);
        rect('rgba(255,255,255,0.5)', x - 1 + Math.sin(simT * 3) * 1, y - 8, 1, 3); rect('rgba(255,255,255,0.5)', x + 2, y - 7 - Math.sin(simT * 3), 1, 3);
      }
    });
  }

  function bubble(x, y, text) {
    ctx.font = '6px Sora, sans-serif';
    const maxW = 104;
    // wrap into at most two lines
    const words = text.split(' '), lines = [];
    let line = '';
    words.forEach((w) => {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    lines.push(line);
    const w = Math.max.apply(null, lines.map((l) => ctx.measureText(l).width)) + 8, h = lines.length * 8 + 4;
    let bx = clamp(x - w / 2, 2, VW - w - 2);
    const by = Math.max(14, y - h - 6);
    ctx.fillStyle = '#fffdf4'; ctx.fillRect(Math.round(bx), Math.round(by), Math.round(w), h);
    ctx.fillStyle = '#222'; ctx.strokeStyle = '#222'; ctx.lineWidth = 0.7; ctx.strokeRect(Math.round(bx) + 0.3, Math.round(by) + 0.3, Math.round(w) - 0.6, h - 0.6);
    ctx.beginPath(); ctx.moveTo(x - 3, by + h); ctx.lineTo(x + 1, by + h + 4); ctx.lineTo(x + 3, by + h); ctx.fillStyle = '#fffdf4'; ctx.fill();
    ctx.fillStyle = '#222'; ctx.textAlign = 'center';
    lines.forEach((l, i) => ctx.fillText(l, bx + w / 2, by + 8 + i * 8 - 1));
  }

  function drawEntities() {
    const cam = S.cam;
    ents.forEach((e) => {
      if (e.gone || !e.active) return;
      const d = e.d, x = e.x - cam;
      if (x < -30 || x > VW + 30) return;
      const y = e.yy != null ? e.yy : e.y;
      const dir = e.dir < 0 ? -1 : 1;

      if (e.type === 'e') {
        // an envelope
        rect('#f7f7f7', x - 6, y - 8, 12, 8); rect('#c8c8c8', x - 6, y - 8, 12, 1);
        ctx.strokeStyle = '#999'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x - 6, y - 8); ctx.lineTo(x, y - 3); ctx.lineTo(x + 6, y - 8); ctx.stroke();
        rect('#e33', x + 3, y - 12, 4, 4); rect('#fff', x + 4.5, y - 11, 1, 2);
      } else if (e.type === 'z') {
        rect('#222', x - 7, y - 2, 14, 2); rect('#e33', x - 7, y - 3, 3, 1); rect('#222', x + 2, y - 3, 6, 1);
      } else {
        const face = P.x < e.x ? -1 : 1;
        person(x, y, e.near ? face : dir, simT * (d.speed ? 3.2 : 0), d.style, d.w, d.h, false);
      }
      if (e.sayT > 0 && e.say) bubble(x, y - d.h, e.say);
      else if (e.near) {
        ctx.fillStyle = '#ffd24a'; ctx.font = 'bold 8px Sora, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(e.type === 'v' ? '?' : '!', x, y - d.h - 3);
      }
    });
  }

  function drawPlayer() {
    if (!P) return;
    if (P.invuln > 0 && Math.floor(simT * 14) % 2 === 0 && S.mode === 'play') return;
    const x = P.x - S.cam, bottom = P.y + PH;
    if (P.phones > 0) { ctx.fillStyle = 'rgba(120, 200, 255, 0.18)'; ctx.beginPath(); ctx.arc(x, bottom - 12, 17 + Math.sin(simT * 8), 0, 6.3); ctx.fill(); }
    person(x, bottom, P.face, P.step, { hair: '#c9c9c9', skin: '#e8b98f', top: '#7b4c2a', pants: '#3a4a6b', glasses: true }, 11, 22, !P.ground);
    // the mug, empty and hopeful
    rect('#f7f3e8', x + P.face * 6 - 2, bottom - 12, 4, 4); rect('#f7f3e8', x + P.face * 8, bottom - 11, 1.5, 2);
    if (P.phones > 0) {
      ctx.strokeStyle = '#222'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(x, bottom - 20, 4.4, Math.PI, 0); ctx.stroke();
      rect('#3aa0ff', x - 5.5, bottom - 20, 2, 3); rect('#3aa0ff', x + 3.5, bottom - 20, 2, 3);
    }
  }

  function render() {
    if (!S.lvl) { ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.fillStyle = '#10161e'; ctx.fillRect(0, 0, VW, VH); return; }
    const L = S.lvl, th = L.theme;
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.textBaseline = 'alphabetic';
    drawBackground(L, th);
    drawTiles(L, th);
    drawGoal(L, th);
    drawItems();
    drawEntities();
    drawPlayer();

    floats.forEach((f) => {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
      ctx.fillStyle = f.color; ctx.font = 'bold 6px Sora, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x - S.cam, f.y - f.t * 14);
      ctx.globalAlpha = 1;
    });

    if (toastT > 0) {
      ctx.globalAlpha = Math.min(1, toastT * 2);
      ctx.font = '6.5px Sora, sans-serif'; ctx.textAlign = 'center';
      const w = ctx.measureText(toastText).width + 12;
      ctx.fillStyle = 'rgba(10, 14, 19, 0.78)'; ctx.fillRect(VW / 2 - w / 2, VH - 24, w, 14);
      ctx.fillStyle = '#f4efe0'; ctx.fillText(toastText, VW / 2, VH - 14);
      ctx.globalAlpha = 1;
    }
  }

  /* ─── HUD ────────────────────────────────────────────────── */

  function updateHud() {
    elScore.textContent = S.score.toLocaleString();
    elCoins.textContent = S.coins;
    const t = Math.max(0, Math.ceil(S.time));
    elClock.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    elClock.classList.toggle('is-late', S.time < 10);
    [...elLives.querySelectorAll('i')].forEach((m, i) => m.classList.toggle('is-gone', i >= S.hearts));
  }
  setInterval(updateHud, 120);

  /* ─── The loop ───────────────────────────────────────────── */

  let lastTs = 0, acc = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    if (S.mode === 'play') {
      acc += dt;
      while (acc >= DT) { update(DT); acc -= DT; }
    }
    render();
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }
  function hide() { overlay.classList.remove('is-open'); }

  function startScreen() {
    S.mode = 'menu';
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Ten to ten · the meeting is at ten</div>' +
      '<h1 class="sheet-title">Hallway <span>Escape</span></h1>' +
      '<p class="sheet-body">All you want is a coffee. Everybody else wants a word. Get from one end of the building to the other.</p>' +
      '<ul class="sheet-rules">' +
        '<li><b>Move</b> with the arrows or A and D, <b>jump</b> with Space. Hold jump for height. On a phone, use the buttons.</li>' +
        '<li>Colleagues, students and the Dean cost you <b>patience</b>. Three hits and you are taken to a meeting.</li>' +
        '<li>Forms, emails and cables cost you <b>time</b>. Visitors and wet floors just slow you down.</li>' +
        '<li>Mind the holes in the floor. Collect citations and biscuits, find coffee, put on the headphones. A phone held sideways gives a bigger view.</li>' +
      '</ul>' +
      '<button class="btn" id="go-btn">Start walking</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { SFX.unlock(); S.score = 0; S.deaths = 0; S.lates = 0; introScreen(0); });
  }

  function introScreen(i) {
    S.mode = 'menu';
    beginLevel(i, false);
    S.late = false;
    const cfg = LEVELS[i];
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Floor ' + (i + 1) + ' of ' + LEVELS.length + '</div>' +
      '<h1 class="sheet-title">' + cfg.name.replace(/^The /, 'The <span>').replace(/$/, '</span>') + '</h1>' +
      '<p class="sheet-body">' + cfg.hint + '</p>' +
      '<button class="btn" id="go-btn">Go</button>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { hide(); S.mode = 'play'; acc = 0; });
  }

  function deadScreen() {
    const lines = ['You have been taken to a meeting. It is about meetings.', 'Cornered by the water cooler. It was a long conversation.', 'Someone has put you on a working group. It meets Mondays.', 'You were asked for “a quick favour”. It is not quick.'];
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Out of patience</div>' +
      '<h1 class="sheet-title">Cornered<br><span>by the printer</span></h1>' +
      '<p class="sheet-body">' + rnd(lines) + '</p>' +
      '<button class="btn" id="go-btn">' + (S.cp ? 'Back to the checkpoint' : 'Try again') + '</button>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { hide(); beginLevel(S.level, true); S.mode = 'play'; acc = 0; });
  }

  function pauseScreen() {
    if (S.mode !== 'play') return;
    S.mode = 'pause';
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Paused</div>' +
      '<h1 class="sheet-title">A moment <span>to breathe</span></h1>' +
      '<button class="btn" id="go-btn">Keep walking</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', resume);
  }
  function resume() { if (S.mode === 'pause') { hide(); S.mode = 'play'; acc = 0; } }

  function arrive() {
    S.mode = 'done';
    keys.left = keys.right = keys.jump = false;
    const cfg = LEVELS[S.level];
    const last = S.level + 1 >= LEVELS.length;
    const timeBonus = Math.max(0, Math.floor(S.time)) * 10;
    const heartBonus = S.hearts * 100;
    S.score += timeBonus + heartBonus + (last ? 0 : GOAL_BONUS);
    if (S.score > S.best) { S.best = S.score; localStorage.setItem('hallwayescape.best', String(S.best)); }
    SFX.win();
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">' + (last ? 'The last floor' : 'Floor ' + (S.level + 1) + ' done') + '</div>' +
      '<h1 class="sheet-title is-good">' + (last ? 'Out <span>of order</span>' : 'You made <span>it</span>') + '</h1>' +
      '<p class="sheet-body">' + (last
        ? 'The machine is out of order. A sign explains that there is a perfectly good one on the third floor. You are, at this point, a legend on all three.'
        : cfg.done) + '</p>' +
      '<div class="tally">' +
        '<div><span>Time left</span><b>+' + timeBonus + '</b></div>' +
        '<div><span>Patience left</span><b>+' + heartBonus + '</b></div>' +
        (last ? '' : '<div><span>Reached the coffee</span><b>+' + GOAL_BONUS + '</b></div>') +
        '<div class="is-total"><span>Score</span><b>' + S.score.toLocaleString() + '</b></div>' +
      '</div>' +
      '<button class="btn" id="go-btn">' + (last ? 'See the verdict' : 'Next floor') + '</button>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { last ? finalScreen() : introScreen(S.level + 1); });
  }

  function finalScreen() {
    S.mode = 'end';
    let title, body;
    if (S.deaths === 0 && S.lates === 0) { title = 'Untouchable'; body = 'Three floors, no meetings, no minutes lost. Colleagues are now crossing the road when they see you.'; }
    else if (S.deaths <= 1) { title = 'Seasoned <span>corridor-walker</span>'; body = 'A few conversations got through. You have learned where to stand so nobody catches your eye.'; }
    else { title = 'Eventually <span>caffeinated</span>'; body = 'It took a few meetings, but you got there. The coffee is a bit cold. It was worth it. It will not be worth it again.'; }
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">The verdict</div>' +
      '<h1 class="sheet-title is-good">' + title + '</h1>' +
      '<p class="sheet-body">' + body + '</p>' +
      '<div class="tally">' +
        '<div><span>Meetings you were taken to</span><b>' + S.deaths + '</b></div>' +
        '<div><span>Floors you were late on</span><b>' + S.lates + '</b></div>' +
        '<div><span>Best</span><b>' + S.best.toLocaleString() + '</b></div>' +
        '<div class="is-total"><span>Score</span><b>' + S.score.toLocaleString() + '</b></div>' +
      '</div>' +
      '<button class="btn" id="go-btn">Another day</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { S.score = 0; S.deaths = 0; S.lates = 0; introScreen(0); });
  }

  /* ─── Input ──────────────────────────────────────────────── */

  const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
                   ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump' };
  function setKey(k, down) {
    if (k === 'jump' && down && !keys.jump) jumpEdge = true;
    keys[k] = down;
    document.querySelectorAll('.key[data-key="' + k + '"]').forEach((b) => b.classList.toggle('is-down', down));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { S.mode === 'play' ? pauseScreen() : resume(); return; }
    const k = KEYMAP[e.key];
    if (k) { e.preventDefault(); if (!e.repeat) setKey(k, true); }
  });
  document.addEventListener('keyup', (e) => { const k = KEYMAP[e.key]; if (k) setKey(k, false); });
  window.addEventListener('blur', () => { setKey('left', false); setKey('right', false); setKey('jump', false); });

  // On a touch screen a button is held for as long as a finger is on it.
  document.querySelectorAll('.key').forEach((b) => {
    const k = b.getAttribute('data-key');
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} SFX.unlock(); setKey(k, true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, () => setKey(k, false)));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
  $('pause').addEventListener('click', () => { S.mode === 'play' ? pauseScreen() : resume(); });

  document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode === 'play') pauseScreen(); });

  /* ─── Go ─────────────────────────────────────────────────── */

  layout();
  setTimeout(layout, 120);
  requestAnimationFrame(frame);
  S.lvl = buildLevel(0);
  makeEntities(); makeItems(); placePlayer(24);
  updateHud();
  startScreen();

})();
