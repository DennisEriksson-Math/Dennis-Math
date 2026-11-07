/* ═══════════════════════════════════════════════════════════
   HALLWAY ESCAPE — run for the coffee machine.

   The corridor scrolls by on its own and keeps getting faster. You
   jump and you slide. Doors along the wall crack open and somebody
   steps out: read the door, work out what is coming, and get past.

   The shape in the doorway tells you what to do:
     colleague, student, Dean, visitor   → jump over them
     administrator (a huge form held out) → slide underneath; jumping will not clear it
   Some doors open on nobody. That is also a way to be caught out.

   Logical size is 320 × 192; everything is drawn with rectangles.
   The floors are put together from patterns (PATTERNS) laid along a
   strip, each leaving room to react, and the rest is tuning (LEVELS).
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Constants ──────────────────────────────────────────── */

  const VW = 320, VH = 192, GY = 160;      // GY: the floor
  const PX = 78;                           // where the runner stands on screen
  const DT = 1 / 60;

  const GRAV = 1050, JUMPV = 330;          // a jump lasts 0.63s and reaches 52px
  const SLIDE_T = 0.55;
  const HEARTS = 3;
  const COIN = 10, DODGE = 25, GOAL_BONUS = 500;
  const OPEN_T = 0.28;                     // a door takes this long to open

  /* ─── The people behind the doors ────────────────────────── */

  const PEOPLE = {
    q: { name: 'colleague', w: 11, h: 23, move: 0,
         style: { hair: '#6a4a2c', skin: '#e3b48d', top: '#4f7aa6', pants: '#33384a', glasses: true },
         lines: ['Got a minute?', 'Quick question…', 'Do you have two minutes?', 'Just a tiny thing about the timetable', 'Ah, perfect timing!', 'Sorry, one thing!', 'This will only take a sec', 'Can I borrow you?', 'Did you see my email?', 'Quick one about the room booking', 'You are just the person I wanted!', 'It is about the minutes of the minutes'] },
    s: { name: 'student', w: 11, h: 21, move: -62,
         style: { hair: '#2e2a2a', skin: '#d9a97f', top: '#c2553f', pants: '#2c3e5c', bag: '#3b8a6e' },
         lines: ['Prof! Prof! One thing!', 'Is the exam on this?', 'I sent you an email!', 'Can I get an extension?', 'Do you have office hours?', 'Can you sign this?', 'Will this be on the test?', 'It is only a short question!', 'Did you get my message?', 'Is attendance mandatory?'] },
    a: { name: 'administrator', w: 11, h: 23, move: 0, reach: true,
         style: { hair: '#3a2a22', skin: '#d4a07a', top: '#8a4f7a', pants: '#2f3446', clip: true, glasses: true },
         lines: ['Just sign here. And here. And here.', 'Form 27B. In triplicate.', 'Have you done the mandatory training?', 'You missed the deadline (yesterday).', 'Did you read the new policy?', 'The portal says you owe us a receipt.'] },
    d: { name: 'Dean', w: 16, h: 31, move: 0,
         style: { hair: '#b7b7b7', skin: '#e0b08a', top: '#25324a', pants: '#1b2236', tie: '#b8352b', glasses: true },
         lines: ['Walk with me.', 'A word, when you have a moment.', 'About the strategy…', 'Do you have a minute for the Faculty Board?', 'I have an exciting opportunity for you.', 'Have you thought about leadership?', 'Let us take a short walk.'] },
    v: { name: 'visitor', w: 11, h: 23, move: -22,
         style: { hair: '#8a7a64', skin: '#e8c19c', top: '#d6b44e', pants: '#6f5a46', bag: '#7a5a8a' },
         lines: ['Excuse me, where is room B12?', 'Is this the maths building?', 'Sorry, is there a toilet?', 'Which way to the café?', 'I am here for the seminar?', 'Is this the third floor?', 'I think I am lost, sorry!'] }
  };
  const OBJ_LINES = {
    box: ['Who leaves boxes in a corridor?', 'Ouch. Printer paper.'],
    cable: ['Ouch.', 'Who left that there?', 'Facilities will hear about this.'],
    cart: ['A trolley of exam scripts.', 'Mind the trolley!'],
    email: ['REPLY ALL', 'Re: Re: Re: Fwd: Meeting', 'URGENT (not urgent)', 'Per my last email…', 'Please find attached', 'Gentle reminder!']
  };
  const PHONE_LINES = ['…I will email you.', 'Oh, never mind.', '(waves, unheard)', 'Hello? …Right.', 'They cannot hear a word.'];
  const PIT_LINES = ['Floor closed for maintenance.', 'The sign was there. Honestly.', 'Whoops.', 'Mind the gap, said the sign.'];
  const FAKE_LINES = ['Nobody there. Probably.', 'An empty room. Suspicious.', 'Just the cleaner’s cupboard.'];

  /* ─── The floors ─────────────────────────────────────────── */

  /* len: pixels to the coffee. v0 → v1: running speed, rising along the way.
     warn: seconds between a door starting to open and you reaching it. */
  const LEVELS = [
    { name: 'The third-floor corridor', len: 4800, v0: 105, v1: 165, warn0: 0.95, warn1: 0.78, theme: 0,
      pool: { amb: 5, ambA: 2, obj: 3, pit: 2, email: 2, fake: 1, wet: 1 },
      hint: 'Doors crack open and somebody steps out. Jump over most of them. The ones holding out a clipboard you slide under.',
      done: 'Coffee. Black. No questions asked.' },
    { name: 'The long way round', len: 6200, v0: 125, v1: 205, warn0: 0.74, warn1: 0.58, theme: 1,
      pool: { amb: 4, ambA: 2, ambS: 2, obj: 2, pit: 2, email: 3, fake: 2, pair: 3, wet: 2, wetDoor: 2, bait: 2 },
      hint: 'Faster now. Students run at you, some doors open on nothing, and two in a row will not give you time to land.',
      done: 'Two sugars and a clear conscience.' },
    { name: 'The basement café', len: 7600, v0: 138, v1: 228, warn0: 0.72, warn1: 0.54, theme: 2,
      pool: { amb: 3, ambA: 2, ambS: 2, ambD: 3, obj: 2, pit: 2, email: 3, fake: 2, pair: 3, wetDoor: 2, bait: 3, gauntlet: 3, pitDoor: 2 },
      hint: 'The Dean is on this floor, and so is everybody else. Watch the shape in the doorway.',
      done: 'The machine says OUT OF ORDER.' }
  ];

  const THEMES = [
    { wall: '#d8cdb0', wall2: '#cbbf9b', trim: '#8a7b5a', top: '#9a9588', floor: '#7a7569', floor2: '#68635a', door: '#6a4a32', ceil: '#efe9d6', light: '#fff7cf', void: '#0a0e13' },
    { wall: '#b6c8b2', wall2: '#a3b69f', trim: '#5f7a5c', top: '#8a978b', floor: '#6c786f', floor2: '#5b665e', door: '#5b3f2a', ceil: '#dfe9da', light: '#f6ffd9', void: '#090d0f' },
    { wall: '#5b6c7e', wall2: '#4d5d6e', trim: '#2b3642', top: '#586271', floor: '#454d5a', floor2: '#383f4a', door: '#3b4a58', ceil: '#2f3a47', light: '#bfe0ff', void: '#06080b' }
  ];
  const DOOR_NAMES = ['B12', 'B13', 'B14', 'STAFF', 'PRINT', 'POST', 'SEMINAR', 'MATHS', 'LIFT', 'STORE', 'DEAN', 'COFFEE?'];

  /* ─── Building a floor ───────────────────────────────────── */

  const lerp = (a, b, t) => a + (b - a) * t;
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

  /* Each pattern puts hazards at x and beyond and says how far it reaches. Two
     things that both need a jump are never closer than a jump and a breath. */
  const PATTERNS = {
    amb:   (L, x, v) => { door(L, x, rnd(['q', 'q', 's', 'v'])); coinArc(L, x - 6); return 20; },
    ambA:  (L, x, v) => { door(L, x, 'a'); coinRow(L, x - 14, x + 4, GY - 6); return 20; },
    ambS:  (L, x, v) => { door(L, x, 's'); coinArc(L, x - 6); return 20; },
    ambD:  (L, x, v) => { door(L, x, 'd'); coinArc(L, x - 6); return 20; },
    fake:  (L, x, v) => { door(L, x, null); coinRow(L, x - 10, x + 14, GY - 6); return 20; },
    obj:   (L, x, v) => { const t = rnd(['box', 'cable', 'cart']); obj(L, x, t); coinArc(L, x + 6); return 24; },
    pit:   (L, x, v) => { L.h.push({ k: 'pit', x0: x, x1: x + 50 }); coinArc(L, x + 25, 3); return 50; },
    email: (L, x, v) => { L.h.push({ k: 'email', x: x + 120, high: Math.random() < 0.6 }); return 160; },
    wet:   (L, x, v) => { L.h.push({ k: 'wet', x0: x, x1: x + 100 }); coinRow(L, x + 10, x + 90, GY - 6); return 100; },
    pair:  (L, x, v) => {
      door(L, x, rnd(['q', 's']));
      door(L, x + v * 0.92 + 20, rnd(['a', 'q', 's']));
      return v * 0.92 + 40;
    },
    bait:  (L, x, v) => {                       // a door that opens on nobody, then one that does not
      door(L, x, null);
      door(L, x + v * 0.72 + 16, rnd(['q', 'a', 's']));
      return v * 0.72 + 36;
    },
    wetDoor: (L, x, v) => {                     // you skid across the wet, so the door comes sooner
      L.h.push({ k: 'wet', x0: x, x1: x + 90 });
      door(L, x + 90 + v * 0.45, rnd(['q', 'a', 's']));
      return 90 + v * 0.45 + 20;
    },
    pitDoor: (L, x, v) => {
      L.h.push({ k: 'pit', x0: x, x1: x + 50 });
      door(L, x + 50 + v * 0.82, rnd(['q', 'a', 's', 'd']));
      return 50 + v * 0.82 + 20;
    },
    gauntlet: (L, x, v) => {
      const kinds = shuffle(['q', 'a', 's', 'a', 'q']).slice(0, 3);
      let at = x;
      kinds.forEach((w) => { door(L, at, w); at += v * 0.88 + 24; });
      return at - x;
    }
  };
  function door(L, x, who) { L.h.push({ k: 'door', x: x, who: who, label: rnd(DOOR_NAMES) }); }
  function obj(L, x, type) {
    const d = { box: [16, 16], cable: [14, 4], cart: [24, 14] }[type];
    L.h.push({ k: 'obj', type: type, x: x, w: d[0], h: d[1] });
  }
  function coinRow(L, a, b, y) { for (let x = a; x <= b; x += 12) L.items.push({ type: 'o', x: x, y: y }); }
  function coinArc(L, x, n) {
    n = n || 3;
    for (let i = 0; i < n; i++) L.items.push({ type: 'o', x: x - (n - 1) * 6 + i * 12, y: GY - 14 - Math.sin(Math.PI * (i + 0.5) / n) * 26 });
  }

  function buildLevel(i) {
    const cfg = LEVELS[i];
    const L = { cfg: cfg, theme: THEMES[cfg.theme], len: cfg.len, h: [], items: [], decor: [], dummies: [], cp: Math.round(cfg.len * 0.5) };
    const speedAt = (px) => lerp(cfg.v0, cfg.v1, clamp(px / cfg.len, 0, 1));

    let x = 560;
    while (x < cfg.len - 520) {
      const v = speedAt(x);
      const names = Object.keys(cfg.pool);
      let total = 0; names.forEach((n) => { total += cfg.pool[n]; });
      let r = Math.random() * total, name = names[0];
      for (const n of names) { r -= cfg.pool[n]; if (r <= 0) { name = n; break; } }
      const warnAt = lerp(cfg.warn0, cfg.warn1, clamp(x / cfg.len, 0, 1));
      const start = L.h.length;
      const used = PATTERNS[name](L, x, v);
      for (let k = start; k < L.h.length; k++) L.h[k].warn = warnAt * (0.86 + Math.random() * 0.28);
      // Room to land, look, and get ready again before the next thing.
      x += used + v * (0.78 + Math.random() * 0.5) + 30;
    }

    // Pickups in clear stretches: a coffee in the middle, headphones when there are some to want.
    const clearSpot = (px) => {
      for (let k = 0; k < 40; k++) {
        const hit = L.h.some((h) => Math.abs((h.x != null ? h.x : h.x0) - px) < 150);
        if (!hit) return px;
        px += 30;
      }
      return px;
    };
    L.items.push({ type: 'C', x: clearSpot(Math.round(cfg.len * 0.42)), y: GY - 12 });
    if (i >= 1) L.items.push({ type: 'H', x: clearSpot(Math.round(cfg.len * 0.66)), y: GY - 12 });
    L.items.push({ type: 'b', x: clearSpot(Math.round(cfg.len * 0.22)), y: GY - 12 });

    // Plain doors along the way. These never open.
    for (let dx = 120; dx < cfg.len + 200; dx += 110 + ((Math.random() * 110) | 0)) {
      const near = L.h.some((h) => h.k === 'door' && Math.abs(h.x - dx) < 70);
      if (!near) L.dummies.push({ x: dx, label: rnd(DOOR_NAMES) });
    }
    // Wall decoration on a slower layer.
    let dx = 40;
    while (dx < cfg.len * 0.7 + VW + 80) {
      L.decor.push({ kind: rnd(['window', 'window', 'board', 'plant', 'ext', 'clock']), x: dx, v: (Math.random() * 3) | 0 });
      dx += 70 + ((Math.random() * 70) | 0);
    }
    return L;
  }

  /* ─── State ──────────────────────────────────────────────── */

  const keys = { jump: false, slide: false };
  let jumpEdge = false, slideEdge = false;

  const S = {
    mode: 'menu',               // menu | play | pause | dead | done | end
    level: 0, score: 0,
    best: Number(localStorage.getItem('hallwayescape.best') || 0),
    hearts: HEARTS, coins: 0, streak: 0, bestStreak: 0, deaths: 0,
    cp: null, lvl: null, cam: 0
  };
  let P = null, hz = [], items = [], floats = [];
  let simT = 0, toastText = '', toastT = 0;

  const $ = (id) => document.getElementById(id);
  const cv = $('cv'), ctx = cv.getContext('2d'), viewEl = $('view'), overlay = $('overlay');
  const elScore = $('score'), elCoins = $('coins'), elDist = $('dist'), elLives = $('lives'), elTag = $('level-tag');

  function instantiate(L, fromX) {
    hz = L.h.filter((h) => (h.x != null ? h.x : h.x0) >= fromX).map((h) => {
      const o = Object.assign({}, h);
      if (o.k === 'door') { o.state = 0; o.t = 0; o.px = o.x - 18; o.drift = 0; o.done = false; o.hit = false; o.said = 0; }
      if (o.k === 'email') { o.active = false; o.gone = false; o.hit = false; }
      if (o.k === 'obj') { o.hit = false; o.done = false; }
      if (o.k === 'pit') { o.done = false; }
      return o;
    });
    items = L.items.filter((it) => it.x >= fromX).map((it) => Object.assign({ got: false, ph: Math.random() * 6 }, it));
    floats = [];
  }

  function placePlayer(wx, invuln) {
    P = { wx: wx, h: 0, vy: 0, step: 0, slide: 0, pendingSlide: false, jbuf: 0, invuln: invuln || 0, stumble: 0, phones: 0, air: false };
    S.cam = wx - PX;
  }

  function beginLevel(i, retry) {
    S.level = i;
    if (!retry) S.lvl = buildLevel(i);
    const L = S.lvl;
    jumpEdge = slideEdge = false;
    if (!retry) {
      S.cp = null; S.hearts = HEARTS; S.coins = 0; S.streak = 0; S.bestStreak = 0; S.levelStartScore = S.score;
      instantiate(L, 0);
      placePlayer(0);
    } else {
      S.hearts = HEARTS; S.streak = 0;
      if (S.cp) { S.score = S.cp.score; S.coins = S.cp.coins; instantiate(L, S.cp.x); placePlayer(S.cp.x, 1.2); }
      else { S.score = S.levelStartScore; S.coins = 0; instantiate(L, 0); placePlayer(0, 1.2); }
    }
    elTag.textContent = 'Floor ' + (i + 1) + ' of ' + LEVELS.length + ' · ' + LEVELS[i].name;
    updateHud();
  }

  /* ─── Logic ──────────────────────────────────────────────── */

  function speedNow() {
    const L = S.lvl;
    let v = lerp(L.cfg.v0, L.cfg.v1, clamp(P.wx / L.len, 0, 1));
    if (P.phones > 0) v *= 1.08;
    if (P.stumble > 0) v *= 0.45;
    if (P.h === 0 && hz.some((h) => h.k === 'wet' && P.wx > h.x0 && P.wx < h.x1)) v *= 1.28;
    return v;
  }

  function floatText(x, y, text, color) { floats.push({ x: x, y: y, t: 0, text: text, color: color || '#fff' }); }
  function toast(t) { toastText = t; toastT = 2.4; }

  function hitBy(h, line) {
    if (h.hit) return;
    if (P.invuln > 0) return;
    h.hit = true;
    if (P.phones > 0) { if (h.k === 'door') { h.said = 1.3; h.line = draw(PHONE_LINES); } return; }
    S.hearts--; S.streak = 0;
    P.invuln = 1.4; P.stumble = 0.6;
    SFX.hurt();
    floatText(P.wx, GY - P.h - 24, '-1 patience', '#ff8a7a');
    if (h.k === 'door') { h.said = 1.8; h.line = line || draw(PEOPLE[h.who].lines); }
    else { toast(line || draw(OBJ_LINES[h.type || 'email'])); }
    if (S.hearts <= 0) die();
  }

  function die() {
    if (S.mode !== 'play') return;
    S.mode = 'dead'; S.deaths++;
    SFX.over();
    setTimeout(deadScreen, 500);
  }

  function dodged(h, x) {
    if (h.done) return;
    h.done = true;
    if (h.hit) return;
    S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
    const mult = Math.min(4, 1 + Math.floor(S.streak / 4));
    const pts = DODGE * mult;
    S.score += pts;
    SFX.dodge();
    floatText(x, GY - 46, '+' + pts + (mult > 1 ? ' ×' + mult : ''), '#ffe08a');
  }

  function boxHit(ax, ay, aw, ah, bx, by, bw, bh) { return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }

  function playerBox() {
    return P.slide > 0 && P.h === 0
      ? { x: P.wx - 8, y: GY - 7, w: 14, h: 7 }
      : { x: P.wx - 5, y: GY - P.h - 15, w: 10, h: 15 };
  }

  function update(dt) {
    if (S.mode !== 'play') return;
    const L = S.lvl;
    simT += dt;

    // ── the runner
    P.invuln = Math.max(0, P.invuln - dt);
    P.stumble = Math.max(0, P.stumble - dt);
    P.phones = Math.max(0, P.phones - dt);
    P.slide = Math.max(0, P.slide - dt);

    if (jumpEdge) { P.jbuf = 0.12; jumpEdge = false; } else P.jbuf -= dt;
    const grounded = P.h === 0 && P.vy === 0;
    if (P.jbuf > 0 && grounded) { P.vy = JUMPV; P.slide = 0; P.jbuf = 0; SFX.jump(); }
    if (slideEdge) {
      slideEdge = false;
      if (grounded) { P.slide = SLIDE_T; SFX.slide(); }
      else { P.vy = Math.min(P.vy, -340); P.pendingSlide = true; }     // drop fast, then slide
    }
    if (P.h > 0 || P.vy !== 0) {
      const g = GRAV * (P.vy > 0 && !keys.jump ? 2.2 : 1);
      P.vy -= g * dt;
      P.h += P.vy * dt;
      if (P.h <= 0) {
        P.h = 0; P.vy = 0;
        if (P.pendingSlide) { P.pendingSlide = false; P.slide = SLIDE_T; SFX.slide(); }
      }
    }
    P.air = P.h > 0;

    const v = speedNow();
    P.wx += v * dt;
    P.step += dt * v / 9;
    S.cam = P.wx - PX;

    // ── the doors and everything else
    const pb = playerBox();
    hz.forEach((h) => {
      if (h.k === 'door') {
        const dist = h.x - P.wx;
        if (h.state === 0 && dist < v * h.warn && dist > -40) { h.state = 1; h.t = 0; SFX.creak(); }
        if (h.state >= 1) h.t += dt;
        if (h.state === 1 && h.t >= OPEN_T) {
          h.state = h.who ? 2 : 3;
          if (!h.who) { h.said = 1.6; h.line = draw(FAKE_LINES); }
        }
        if (h.said > 0) h.said -= dt;
        if (h.state === 2) {
          const pp = PEOPLE[h.who];
          // they step out of the doorway, then stand (or come at you)
          if (pp.move) h.drift += pp.move * dt;
          h.px = h.x - 18 + h.drift + Math.max(0, 0.2 - (h.t - OPEN_T)) * 70;
          if (pp.reach) {
            // The administrator stays in the doorway and holds a form out over the corridor,
            // from head height up past the top of any jump. Only a slide gets under it.
            if (boxHit(pb.x, pb.y, pb.w, pb.h, h.x - 28, GY - 58, 24, 45)) hitBy(h);
            if (P.wx > h.x + 6) dodged(h, h.x - 12);
          } else {
            if (boxHit(pb.x, pb.y, pb.w, pb.h, h.px - pp.w / 2 + 1, GY - pp.h, pp.w - 2, pp.h)) hitBy(h);
            if (P.wx > h.px + 14) dodged(h, h.px);
          }
        }
      } else if (h.k === 'obj') {
        if (boxHit(pb.x, pb.y, pb.w, pb.h, h.x, GY - h.h, h.w, h.h)) hitBy(h);
        if (P.wx > h.x + h.w + 8) dodged(h, h.x);
      } else if (h.k === 'email') {
        if (!h.active && h.x - P.wx < VW - PX + 30) h.active = true;
        if (h.active && !h.gone) {
          h.x -= 70 * dt;
          const ey = h.high ? GY - 21 : GY - 9;
          if (boxHit(pb.x, pb.y, pb.w, pb.h, h.x - 7, ey, 14, 9)) hitBy(h);
          if (h.x < P.wx - 14) { dodged(h, h.x); h.gone = true; }
        }
      } else if (h.k === 'pit') {
        if (P.h === 0 && P.wx > h.x0 + 6 && P.wx < h.x1 - 6 && P.invuln <= 0 && P.phones <= 0) {
          S.hearts--; S.streak = 0;
          SFX.fall(); toast(draw(PIT_LINES));
          floatText(P.wx, GY - 24, '-1 patience', '#ff8a7a');
          P.wx = h.x1 + 8; P.invuln = 1.4; P.stumble = 0.7;
          if (S.hearts <= 0) die();
        } else if (P.wx > h.x1 + 6) dodged(h, h.x1);
      }
    });
    if (S.mode !== 'play') return;

    // ── pickups
    items.forEach((it) => {
      if (it.got) return;
      if (boxHit(pb.x - 2, pb.y - 3, pb.w + 4, pb.h + 6, it.x - 6, it.y - 6, 12, 12)) {
        it.got = true;
        if (it.type === 'o') { S.score += COIN; S.coins++; SFX.coin(); floatText(it.x, it.y - 6, '+' + COIN, '#ffe08a'); }
        else if (it.type === 'b') { S.score += 50; SFX.biscuit(); floatText(it.x, it.y - 6, '+50 biscuit', '#ffd5a0'); }
        else if (it.type === 'H') { P.phones = 6; SFX.power(); floatText(it.x, it.y - 8, 'headphones!', '#9fe3ff'); toast('Headphones on. Nobody can reach you.'); }
        else if (it.type === 'C') {
          SFX.power();
          if (S.hearts < HEARTS) { S.hearts++; floatText(it.x, it.y - 8, '+1 patience', '#a8e6b0'); toast('A coffee on the way. Patience restored.'); }
          else { S.score += 100; floatText(it.x, it.y - 8, '+100', '#ffe08a'); toast('A spare coffee. You were fine, really.'); }
        }
      }
    });

    if (!S.cp && P.wx >= L.cp) { S.cp = { x: L.cp, score: S.score, coins: S.coins }; floatText(L.cp, GY - 40, 'Checkpoint', '#ffffff'); SFX.power(); }
    if (P.wx >= L.len - 6) { arrive(); return; }

    for (let i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 1.1) floats.splice(i, 1); }
    toastT = Math.max(0, toastT - dt);
  }

  /* ─── Drawing ────────────────────────────────────────────── */

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
    rect(st.pants, x0 + 1, bottom - legH + (lA > 0 ? -1 : 0), 3, legH + (lA > 0 ? 1 : 0));
    rect(st.pants, x0 + w - 4, bottom - legH + (lB > 0 ? -1 : 0), 3, legH + (lB > 0 ? 1 : 0));
    rect('#1d1d24', x0 + 1, bottom - 1, 4, 1);
    rect('#1d1d24', x0 + w - 5, bottom - 1, 4, 1);
    if (st.bag) rect(st.bag, cx - dir * (w / 2 + 1) - 2, bottom - legH - torsoH + 2, 4, torsoH - 2);
    rect(st.top, x0 + 1, bottom - legH - torsoH, bw, torsoH);
    rect(st.top, cx + dir * (w / 2 - 1) - 1, bottom - legH - torsoH + 1, 2, torsoH - 2);
    if (st.tie) rect(st.tie, cx - 1 + dir, bottom - legH - torsoH + 1, 2, torsoH - 3);
    if (st.clip) { rect('#7a5a32', cx + dir * (w / 2 + 1) - 2, bottom - legH - torsoH + 3, 4, 6); rect('#ffffff', cx + dir * (w / 2 + 1) - 1, bottom - legH - torsoH + 4, 2, 4); }
    const hy = bottom - legH - torsoH - headH;
    rect(st.skin, cx - hw / 2, hy, hw, headH);
    rect(st.hair, cx - hw / 2 - 0.5, hy - 1, hw + 1, 2.5);
    const ex = cx + dir * 1.2;
    rect('#222', ex - 1.6, hy + headH * 0.42, 1, 1);
    rect('#222', ex + 1.4, hy + headH * 0.42, 1, 1);
    if (st.glasses) { ctx.strokeStyle = '#222'; ctx.lineWidth = 0.6; ctx.strokeRect(ex - 2.4, hy + headH * 0.3, 2.6, 2.4); ctx.strokeRect(ex + 0.7, hy + headH * 0.3, 2.6, 2.4); }
  }

  function bubble(x, y, text) {
    ctx.font = '6px Sora, sans-serif';
    const maxW = 104;
    const words = text.split(' '), lines = [];
    let line = '';
    words.forEach((w) => {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    lines.push(line);
    const w = Math.max.apply(null, lines.map((l) => ctx.measureText(l).width)) + 8, h = lines.length * 8 + 4;
    const bx = clamp(x - w / 2, 2, VW - w - 2);
    const by = Math.max(24, y - h - 6);
    ctx.fillStyle = '#fffdf4'; ctx.fillRect(Math.round(bx), Math.round(by), Math.round(w), h);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 0.7; ctx.strokeRect(Math.round(bx) + 0.3, Math.round(by) + 0.3, Math.round(w) - 0.6, h - 0.6);
    ctx.beginPath(); ctx.moveTo(x - 3, by + h); ctx.lineTo(x + 1, by + h + 4); ctx.lineTo(x + 3, by + h); ctx.fillStyle = '#fffdf4'; ctx.fill();
    ctx.fillStyle = '#222'; ctx.textAlign = 'center';
    lines.forEach((l, i) => ctx.fillText(l, bx + w / 2, by + 8 + i * 8 - 1));
  }

  function drawBackground(L, th) {
    const cam = S.cam;
    rect(th.wall, 0, 0, VW, GY);
    rect(th.wall2, 0, GY - 20, VW, 20);
    rect(th.ceil, 0, 0, VW, 12);
    rect(th.trim, 0, 12, VW, 2);
    const lx0 = -(((cam % 64) + 64) % 64);
    for (let x = lx0 - 64; x < VW + 64; x += 64) { rect(th.light, x + 16, 3, 32, 5); rect('rgba(255,255,255,0.08)', x + 8, 14, 48, 10); }

    const par = cam * 0.7;
    L.decor.forEach((d) => {
      const x = Math.round(d.x - par);
      if (x < -50 || x > VW + 10) return;
      if (d.kind === 'window') {
        rect(th.trim, x - 1, 29, 32, 24);
        rect(d.v === 0 ? '#9fcbe8' : d.v === 1 ? '#c8d7e6' : '#b5c9dd', x, 30, 30, 22);
        rect(th.trim, x + 14, 30, 2, 22); rect(th.trim, x, 40, 30, 2);
      } else if (d.kind === 'board') {
        rect('#7a5a38', x - 1, 54, 36, 28);
        rect('#c9b27c', x, 55, 34, 26);
        rect('#fff', x + 3, 59, 9, 11); rect('#f5e089', x + 15, 60, 8, 8); rect('#e8a6a6', x + 25, 58, 7, 12);
      } else if (d.kind === 'plant') {
        rect('#9c5a3a', x + 3, GY - 12, 10, 12);
        rect('#3a7a44', x, GY - 28, 16, 17); rect('#4c9a58', x + 4, GY - 34, 8, 10);
      } else if (d.kind === 'ext') {
        rect('#c43a2e', x + 2, GY - 22, 8, 20); rect('#222', x + 3, GY - 26, 6, 4); rect('#e7e7e7', x + 3, GY - 14, 6, 4);
      } else if (d.kind === 'clock') {
        ctx.fillStyle = '#f3f0e6'; ctx.beginPath(); ctx.arc(x + 10, 44, 9, 0, 6.3); ctx.fill();
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 10, 44); ctx.lineTo(x + 10, 38); ctx.moveTo(x + 10, 44); ctx.lineTo(x + 14, 46); ctx.stroke();
      }
    });
  }

  /* A door in the wall. `open` runs 0..1; `who` shows as a silhouette in the gap
     while it opens, which is the whole clue. */
  function drawDoor(x, th, label, open, who) {
    const gy = GY;
    rect(th.trim, x - 1, gy - 47, 26, 47);
    if (open > 0) {
      rect('#0c1015', x, gy - 46, 24, 46);
      rect('rgba(255, 235, 170, 0.22)', x + 2, gy - 44, 20, 44);
      if (who) {
        const pp = PEOPLE[who];
        ctx.globalAlpha = 0.9;
        if (pp.reach) rect('#0b0c10', x - 16, gy - 58, 24, 45);
        person(x + 12, gy, -1, 0, { hair: '#0a0a0a', skin: '#0d0d10', top: '#0b0c10', pants: '#0b0c10', glasses: false, tie: null, bag: pp.style.bag ? '#0b0c10' : null, clip: pp.style.clip || false }, pp.w, pp.h, false);
        ctx.globalAlpha = 1;
      }
      rect(th.door, x, gy - 46, 24 * (1 - open * 0.82), 46);
      ctx.fillStyle = 'rgba(255, 235, 170, ' + (0.22 * open) + ')';
      ctx.beginPath(); ctx.moveTo(x + 2, gy); ctx.lineTo(x + 22, gy); ctx.lineTo(x + 46, gy + 5); ctx.lineTo(x - 22, gy + 5); ctx.closePath(); ctx.fill();
    } else {
      rect(th.door, x, gy - 46, 24, 46);
      rect('rgba(255,255,255,0.18)', x + 7, gy - 38, 10, 14);
      rect('#caa84a', x + 19, gy - 22, 2, 3);
    }
    rect('#ddd', x + 3, gy - 56, 18, 7);
    ctx.fillStyle = '#333'; ctx.font = '5px Sora, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, x + 12, gy - 51);
  }

  function drawFloor(L, th) {
    const cam = S.cam;
    rect(th.void, 0, GY, VW, VH - GY);
    const c0 = Math.floor(cam / 16), c1 = c0 + Math.ceil(VW / 16) + 1;
    for (let c = c0; c <= c1; c++) {
      const x0 = c * 16, sx = x0 - cam;
      const inPit = hz.some((h) => h.k === 'pit' && x0 + 8 > h.x0 && x0 + 8 < h.x1);
      if (inPit) continue;
      rect(th.top, sx, GY, 16.6, 5);
      rect('rgba(255,255,255,0.18)', sx, GY, 16.6, 1);
      rect(th.floor, sx, GY + 5, 16.6, 11);
      rect(c % 2 ? th.floor2 : th.floor, sx, GY + 16, 16.6, VH - GY - 16);
      if (c % 2 === 0) rect('rgba(0,0,0,0.06)', sx, GY, 16, 5);
    }
    hz.forEach((h) => {
      if (h.k === 'pit') {
        [h.x0 - cam - 2, h.x1 - cam].forEach((ex) => {
          rect('#f2c300', ex, GY, 2, 16);
          for (let k = 0; k < 16; k += 4) rect('#222', ex, GY + k, 2, 2);
        });
        if (h.x0 - cam < VW && h.x1 - cam > 0) { rect('#f2c300', h.x0 - cam - 8, GY - 10, 5, 10); rect('#222', h.x0 - cam - 7, GY - 7, 3, 2); }
      } else if (h.k === 'wet') {
        const sx = h.x0 - cam, w = h.x1 - h.x0;
        if (sx > VW || sx + w < 0) return;
        rect('rgba(150,200,240,0.55)', sx, GY, w, 2);
        rect('rgba(220,240,255,0.5)', sx + 10, GY, 18, 1); rect('rgba(220,240,255,0.5)', sx + w - 36, GY, 12, 1);
        rect('#f2c300', sx - 8, GY - 11, 8, 11); rect('#222', sx - 5, GY - 8, 2, 4); rect('#222', sx - 5, GY - 3, 2, 1);
      }
    });
  }

  function drawObjects() {
    const cam = S.cam;
    hz.forEach((h) => {
      if (h.k === 'obj') {
        const x = h.x - cam, y = GY - h.h;
        if (x < -30 || x > VW + 10) return;
        if (h.type === 'box') { rect('#a9783f', x, y, 16, 16); rect('#8c5f2e', x, y + 14, 16, 2); rect('#d8c08a', x + 6, y, 4, 16); }
        else if (h.type === 'cable') { rect('#222', x, GY - 2, 14, 2); rect('#e33', x, GY - 3, 3, 1); rect('#222', x + 7, GY - 3, 6, 1); rect('#222', x + 3, GY - 4, 4, 1); }
        else { rect('#7a5a38', x, y + 4, 24, 6); rect('#e8e0cc', x + 2, y - 2, 20, 6); rect('#c9c2ae', x + 4, y + 1, 16, 1); rect('#333', x + 3, y + 10, 4, 4); rect('#333', x + 17, y + 10, 4, 4); }
      } else if (h.k === 'email' && h.active && !h.gone) {
        const x = h.x - cam, y = h.high ? GY - 21 : GY - 9;
        rect('#f7f7f7', x - 7, y, 14, 9); rect('#c8c8c8', x - 7, y, 14, 1);
        ctx.strokeStyle = '#999'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x, y + 5); ctx.lineTo(x + 7, y); ctx.stroke();
        rect('#e33', x + 3, y - 4, 4, 4);
      }
    });
  }

  function drawDoors(L, th) {
    const cam = S.cam;
    L.dummies.forEach((d) => {
      const x = d.x - cam - 12;
      if (x < -30 || x > VW + 10) return;
      drawDoor(x, th, d.label, 0, null);
    });
    hz.forEach((h) => {
      if (h.k !== 'door') return;
      const x = h.x - cam - 12;
      if (x < -40 || x > VW + 20) return;
      const open = h.state === 0 ? 0 : clamp(h.t / OPEN_T, 0, 1);
      drawDoor(x, th, h.label, open, h.state === 1 ? h.who : null);
    });
  }

  function drawPeople() {
    const cam = S.cam;
    hz.forEach((h) => {
      if (h.k !== 'door') return;
      const x = h.px - cam;
      if (x < -40 || x > VW + 40) return;
      if (h.state === 2) {
        const pp = PEOPLE[h.who];
        const age = h.t - OPEN_T;
        ctx.globalAlpha = clamp(age / 0.08, 0.4, 1);
        if (pp.reach) {
          const dx = h.x - cam;
          person(dx, GY, -1, 0, pp.style, pp.w, pp.h, false);
          // the form: far too big, held out at arm's length
          rect('rgba(0,0,0,0.18)', dx - 26, GY - 56, 24, 45);
          rect('#fffdf4', dx - 28, GY - 58, 24, 45);
          rect('#c9c3b0', dx - 28, GY - 58, 24, 2);
          for (let k = 0; k < 7; k++) rect('#8d8a80', dx - 25, GY - 52 + k * 5, 18 - (k % 3) * 3, 1);
          rect('#c43a2e', dx - 14, GY - 24, 9, 7); rect('#fffdf4', dx - 12, GY - 22, 5, 3);
        } else {
          person(x, GY, -1, simT * (pp.move ? 6 : 0), pp.style, pp.w, pp.h, false);
        }
        ctx.globalAlpha = 1;
      }
      if (h.said > 0 && h.line) bubble(h.state === 2 && !PEOPLE[h.who].reach ? x : h.x - cam - (h.state === 2 ? 14 : 0), GY - (h.state === 2 ? (PEOPLE[h.who].reach ? 60 : PEOPLE[h.who].h) : 46), h.line);
    });
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
        rect('rgba(255,255,255,0.5)', x - 1 + Math.sin(simT * 3), y - 8, 1, 3); rect('rgba(255,255,255,0.5)', x + 2, y - 7 - Math.sin(simT * 3), 1, 3);
      }
    });
  }

  function drawGoal(L, th) {
    const x = Math.round(L.len - S.cam - 14), y = GY;
    if (x > VW + 40) return;
    const broken = L.cfg.name.indexOf('basement') >= 0;
    rect('#2a2d33', x, y - 38, 28, 38);
    rect('#4a4f58', x + 2, y - 36, 24, 34);
    rect('#12301f', x + 5, y - 33, 18, 8);
    ctx.fillStyle = broken ? '#ff6b5a' : '#7dff9c';
    ctx.font = '5px Sora, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(broken ? 'OUT OF ORDER' : 'COFFEE', x + 14, y - 27);
    rect('#222', x + 8, y - 20, 12, 14); rect('#f7f3e8', x + 10, y - 12, 8, 6); rect('#7a4a24', x + 11, y - 13, 6, 2);
    rect('#d33', x + 22, y - 22, 3, 3); rect('#3c6', x + 22, y - 17, 3, 3);
    ctx.fillStyle = 'rgba(255, 224, 150, 0.12)';
    ctx.beginPath(); ctx.arc(x + 14, y - 20, 34 + Math.sin(simT * 3) * 2, 0, 6.3); ctx.fill();
  }

  function drawPlayer() {
    if (P.invuln > 0 && Math.floor(simT * 14) % 2 === 0 && S.mode === 'play') return;
    const x = PX, bottom = GY - P.h;
    if (P.phones > 0) { ctx.fillStyle = 'rgba(120, 200, 255, 0.18)'; ctx.beginPath(); ctx.arc(x, bottom - 12, 17 + Math.sin(simT * 8), 0, 6.3); ctx.fill(); }
    const sliding = P.slide > 0 && P.h === 0;
    const st = { hair: '#c9c9c9', skin: '#e8b98f', top: '#7b4c2a', pants: '#3a4a6b', glasses: true };
    if (sliding) {
      person(x, bottom, 1, 0, st, 14, 9, true);
      rect('rgba(255,255,255,0.4)', x - 20, bottom - 5, 8, 1); rect('rgba(255,255,255,0.3)', x - 24, bottom - 2, 10, 1);
    } else {
      person(x, bottom, 1, P.step, st, 11, 22, P.h > 0);
      rect('#f7f3e8', x + 4, bottom - 12, 4, 4); rect('#f7f3e8', x + 8, bottom - 11, 1.5, 2);   // the mug
      if (P.phones > 0) {
        ctx.strokeStyle = '#222'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(x, bottom - 20, 4.4, Math.PI, 0); ctx.stroke();
        rect('#3aa0ff', x - 5.5, bottom - 20, 2, 3); rect('#3aa0ff', x + 3.5, bottom - 20, 2, 3);
      }
    }
    if (P.h > 0) rect('rgba(0,0,0,0.25)', x - 6, GY - 1, 12, 2);        // shadow
  }

  function render() {
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.textBaseline = 'alphabetic';
    if (!S.lvl || !P) { ctx.fillStyle = '#10161e'; ctx.fillRect(0, 0, VW, VH); return; }
    const L = S.lvl, th = L.theme;
    drawBackground(L, th);
    drawDoors(L, th);
    drawFloor(L, th);
    drawGoal(L, th);
    drawObjects();
    drawItems();
    drawPeople();
    drawPlayer();

    floats.forEach((f) => {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
      ctx.fillStyle = f.color; ctx.font = 'bold 6px Sora, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f.text, clamp(f.x - S.cam, 20, VW - 20), f.y - f.t * 14);
      ctx.globalAlpha = 1;
    });

    // how far to the machine, along the bottom edge
    const frac = clamp(P.wx / L.len, 0, 1), bx = 70, bw = VW - 140;
    rect('rgba(0,0,0,0.4)', bx, 185, bw, 3);
    rect('#e0a458', bx, 185, bw * frac, 3);
    rect('rgba(255,255,255,0.7)', bx + bw * (L.cp / L.len), 183, 1, 7);
    rect('#f7f3e8', bx + bw + 4, 182, 7, 7); rect('#7a4a24', bx + bw + 5, 183, 5, 2);

    if (S.streak >= 3) {
      ctx.fillStyle = '#ffe08a'; ctx.font = 'bold 7px Sora, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Streak ' + S.streak + (S.streak >= 4 ? '  ×' + Math.min(4, 1 + Math.floor(S.streak / 4)) : ''), VW / 2, 180);
    }
    if (toastT > 0) {
      ctx.globalAlpha = Math.min(1, toastT * 2);
      ctx.font = '6.5px Sora, sans-serif'; ctx.textAlign = 'center';
      const w = ctx.measureText(toastText).width + 12;
      ctx.fillStyle = 'rgba(10, 14, 19, 0.78)'; ctx.fillRect(VW / 2 - w / 2, 34, w, 14);
      ctx.fillStyle = '#f4efe0'; ctx.fillText(toastText, VW / 2, 44);
      ctx.globalAlpha = 1;
    }
  }

  /* ─── HUD and loop ───────────────────────────────────────── */

  function updateHud() {
    elScore.textContent = S.score.toLocaleString();
    elCoins.textContent = S.coins;
    elDist.textContent = S.lvl && P ? Math.max(0, Math.ceil((S.lvl.len - P.wx) / 12)) + ' m' : '–';
    [...elLives.querySelectorAll('i')].forEach((m, i) => m.classList.toggle('is-gone', i >= S.hearts));
  }
  setInterval(updateHud, 120);

  let lastTs = 0, acc = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    if (S.mode === 'play') { acc += dt; while (acc >= DT) { update(DT); acc -= DT; } }
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
      '<p class="sheet-body">All you want is a coffee. The corridor is lined with doors, and behind some of them is somebody who wants a word.</p>' +
      '<ul class="sheet-rules">' +
        '<li>You run by yourself and it gets faster. <b>Jump</b> (Space, or the button) and <b>slide</b> (Down, or the button).</li>' +
        '<li>Watch the doors. One cracks open and a shape appears. <b>Jump</b> over most people, <b>slide</b> under a clipboard. Some doors open on nobody.</li>' +
        '<li>A hit costs <b>patience</b>. Three and you are taken to a meeting. Every dodge scores, and a streak multiplies it.</li>' +
        '<li>Mind the holes and wet floors, find coffee, and put on the headphones. A phone held sideways gives a bigger view.</li>' +
      '</ul>' +
      '<button class="btn" id="go-btn">Start running</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { SFX.unlock(); S.score = 0; S.deaths = 0; introScreen(0); });
  }

  function introScreen(i) {
    S.mode = 'menu';
    beginLevel(i, false);
    const cfg = LEVELS[i];
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Floor ' + (i + 1) + ' of ' + LEVELS.length + '</div>' +
      '<h1 class="sheet-title">' + cfg.name.replace(/^The /, 'The <span>').replace(/$/, '</span>') + '</h1>' +
      '<p class="sheet-body">' + cfg.hint + '</p>' +
      '<button class="btn" id="go-btn">Go</button>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { hide(); S.mode = 'play'; acc = 0; jumpEdge = slideEdge = false; });
  }

  function deadScreen() {
    const lines = ['You have been taken to a meeting. It is about meetings.', 'Cornered by the water cooler. It was a long conversation.', 'Someone has put you on a working group. It meets Mondays.', 'You were asked for “a quick favour”. It is not quick.'];
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Out of patience</div>' +
      '<h1 class="sheet-title">Cornered<br><span>by a door</span></h1>' +
      '<p class="sheet-body">' + rnd(lines) + '</p>' +
      '<button class="btn" id="go-btn">' + (S.cp ? 'Back to the checkpoint' : 'Try again') + '</button>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { hide(); beginLevel(S.level, true); S.mode = 'play'; acc = 0; });
  }

  function pauseScreen() {
    if (S.mode !== 'play') return;
    S.mode = 'pause';
    keys.jump = keys.slide = false;
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Paused</div>' +
      '<h1 class="sheet-title">A moment <span>to breathe</span></h1>' +
      '<button class="btn" id="go-btn">Keep running</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', resume);
  }
  function resume() { if (S.mode === 'pause') { hide(); S.mode = 'play'; acc = 0; } }

  function arrive() {
    S.mode = 'done';
    keys.jump = keys.slide = false;
    const cfg = LEVELS[S.level];
    const last = S.level + 1 >= LEVELS.length;
    const heartBonus = S.hearts * 100, streakBonus = S.bestStreak * 10;
    S.score += heartBonus + streakBonus + (last ? 0 : GOAL_BONUS);
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
        '<div><span>Longest dodge streak (' + S.bestStreak + ')</span><b>+' + streakBonus + '</b></div>' +
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
    if (S.deaths === 0) { title = 'Untouchable'; body = 'Three floors and not one conversation. Colleagues are now crossing the road when they see you.'; }
    else if (S.deaths <= 2) { title = 'Seasoned <span>corridor-walker</span>'; body = 'A few conversations got through. You have learned to read a door from the way it creaks.'; }
    else { title = 'Eventually <span>caffeinated</span>'; body = 'It took a few meetings, but you got there. The coffee is a bit cold. It was worth it. It will not be worth it again.'; }
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">The verdict</div>' +
      '<h1 class="sheet-title is-good">' + title + '</h1>' +
      '<p class="sheet-body">' + body + '</p>' +
      '<div class="tally">' +
        '<div><span>Meetings you were taken to</span><b>' + S.deaths + '</b></div>' +
        '<div><span>Best</span><b>' + S.best.toLocaleString() + '</b></div>' +
        '<div class="is-total"><span>Score</span><b>' + S.score.toLocaleString() + '</b></div>' +
      '</div>' +
      '<button class="btn" id="go-btn">Another day</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('go-btn').addEventListener('click', () => { S.score = 0; S.deaths = 0; introScreen(0); });
  }

  /* ─── Input ──────────────────────────────────────────────── */

  const KEYMAP = { ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump',
                   ArrowDown: 'slide', s: 'slide', S: 'slide', x: 'slide', X: 'slide' };
  function setKey(k, down) {
    if (down && !keys[k]) { if (k === 'jump') jumpEdge = true; else slideEdge = true; }
    keys[k] = down;
    document.querySelectorAll('.key[data-key="' + k + '"]').forEach((b) => b.classList.toggle('is-down', down));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { S.mode === 'play' ? pauseScreen() : resume(); return; }
    const k = KEYMAP[e.key];
    if (k) { e.preventDefault(); if (!e.repeat) setKey(k, true); }
  });
  document.addEventListener('keyup', (e) => { const k = KEYMAP[e.key]; if (k) setKey(k, false); });
  window.addEventListener('blur', () => { setKey('jump', false); setKey('slide', false); });

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
  instantiate(S.lvl, 0);
  placePlayer(0);
  updateHud();
  startScreen();

})();
