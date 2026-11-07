/* ═══════════════════════════════════════════════════════════
   HALLWAY ESCAPE — run for the coffee machine.

   You run down a corridor, into the screen, and it keeps getting
   faster. Three lanes: move left and right to get round people,
   jump low things, slide under high ones. Doors along the walls
   crack open and somebody steps out, and everyone has something to
   say. Nobody can be jumped over.

     people, tall stacks   → another lane
     boxes, cables, holes  → jump (or another lane)
     banners, forms, mail  → slide (or another lane)

   The view is a simple perspective projection (pj): the corridor is
   a strip of quads, everything else is a billboard scaled by its
   distance. All drawn with rectangles and polygons, no images.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Constants ──────────────────────────────────────────── */

  const VW = 320, VH = 240;
  const VPX = 160, VPY = 84, F = 100, CAMH = 40;     // vanishing point, focal length, camera height
  const ZN = 24, ZF = 560, PZ = 52;                  // near, far, and where the runner stands
  const LANE = 36, HW = 60, WALLH = 74;              // lane width, half the corridor, wall height
  const DT = 1 / 60;

  const GRAV = 760, JUMPV = 192;                     // a jump lasts half a second and reaches 24
  const PH = 30, SH = 12;                            // standing and sliding height
  const SLIDE_T = 0.5;
  const HEARTS = 3;
  const COIN = 10, DODGE = 25, GOAL_BONUS = 500;
  const OPEN_T = 0.28;                               // a door takes this long to open

  /* ─── The people behind the doors ────────────────────────── */

  const PEOPLE = {
    q: { name: 'colleague', w: 14, h: 34, speed: 120,
         style: { hair: '#6a4a2c', skin: '#e3b48d', top: '#4f7aa6', pants: '#33384a', glasses: true },
         lines: ['Got a minute?', 'Quick question…', 'Do you have two minutes?', 'Just a tiny thing about the timetable', 'Ah, perfect timing!', 'Sorry, one thing!', 'This will only take a sec', 'Can I borrow you?', 'Did you see my email?', 'Quick one about the room booking', 'You are just the person I wanted!', 'It is about the minutes of the minutes'] },
    s: { name: 'student', w: 14, h: 32, speed: 82, track: true,
         style: { hair: '#2e2a2a', skin: '#d9a97f', top: '#c2553f', pants: '#2c3e5c', bag: '#3b8a6e', phone: true },
         lines: ['Prof! Prof! One thing!', 'Is the exam on this?', 'I sent you an email!', 'Can I get an extension?', 'Do you have office hours?', 'Can you sign this?', 'Will this be on the test?', 'It is only a short question!', 'Did you get my message?', 'Is attendance mandatory?'] },
    a: { name: 'administrator', w: 14, h: 34, speed: 0, form: true,
         style: { hair: '#3a2a22', skin: '#d4a07a', top: '#8a4f7a', pants: '#2f3446', glasses: true, lanyard: '#2e9d7a' },
         lines: ['Just sign here. And here. And here.', 'Form 27B. In triplicate.', 'Have you done the mandatory training?', 'You missed the deadline (yesterday).', 'Did you read the new policy?', 'The portal says you owe us a receipt.'] },
    d: { name: 'Dean', w: 44, h: 44, speed: 90,
         style: { hair: '#b7b7b7', skin: '#e0b08a', top: '#25324a', pants: '#1b2236', tie: '#b8352b', glasses: true },
         lines: ['Walk with me.', 'A word, when you have a moment.', 'About the strategy…', 'Do you have a minute for the Faculty Board?', 'I have an exciting opportunity for you.', 'Have you thought about leadership?', 'Let us take a short walk.'] },
    v: { name: 'visitor', w: 14, h: 34, speed: 40, cross: true,
         style: { hair: '#8a7a64', skin: '#e8c19c', top: '#d6b44e', pants: '#6f5a46', bag: '#7a5a8a' },
         lines: ['Excuse me, where is room B12?', 'Is this the maths building?', 'Sorry, is there a toilet?', 'Which way to the café?', 'I am here for the seminar?', 'Is this the third floor?', 'I think I am lost, sorry!'] }
  };
  const CHAT_LINES = ['…and then I said to the Dean…', 'Did you hear about the budget?', 'Honestly, the timetable is a disgrace.', 'We should write that up.', 'Have you seen the new forms?', 'It was a very long meeting.', 'Anyway, as I was saying…', 'So I replied to all.'];

  const MORE = {
    q: ['Have you got five minutes? Ten, tops.', 'I just need a signature. Well, an opinion.', 'Is now a bad time? It is, isn’t it.', 'Walk and talk?', 'Do you know who is chairing the Thursday thing?', 'I was going to email you, but here you are!', 'Have you read the new strategy? Nobody has.', 'You were cc’d on something. Do you know what?', 'Can you review my draft? It is forty pages.', 'I have a tiny favour. It has an appendix.', 'Do you know how the printer works? Nobody does.', 'Are you going to the retirement do?', 'Quick sanity check on my proof…', 'Could you co-supervise someone? He is very nice.', 'Did you get the fire-drill email?', 'Have you got a moment for a lemma?', 'I need a second opinion on a referee report.', 'Can you cover my lecture on Tuesday?', 'Is it okay if I put your name on the grant?', 'Did you hear we are merging with another department?', 'Sorry, did you say you were free on Wednesday?', 'I wondered if you had thoughts on the curriculum…', 'Quick one: what is the password for the shared drive?', 'Do you know whose umbrella this is?', 'You look busy. Do you have a minute?', 'Is it true the coffee machine is being replaced?', 'Can we sync? Just you, me and four others.'],
    s: ['Can I ask a question about the exam? It is long.', 'I missed the last three lectures. What happened?', 'Is the deadline really today?', 'Can you write me a reference? For tomorrow.', 'I think there is a typo on slide 12, or I understand nothing.', 'My dog ate my proof.', 'Can I hand it in in ten minutes? Hours? Weeks?', 'I have an idea for a thesis. It is about everything.', 'Can I switch to your group?', 'Why did I get 49? Is 50 possible?', 'Sorry, I have only a tiny question about chapter one…', 'Do you accept late homework? Very late?', 'Could you explain the whole course in a minute?', 'I emailed you at 3 a.m. Did you see?', 'Can I borrow your pen? And your notes?', 'What is the definition of a group again?', 'Is the exam open book? Open mind?', 'I have a different solution. It is wrong but interesting.', 'How many points is this worth?', 'Can I retake the midterm? And the final?', 'Do I need to know the proofs? All of them?', 'Excuse me, what is a lemma?', 'Is this on the syllabus? Is anything?', 'Could you sign my form? It is quite a lot of forms.', 'I did not understand the question. Or the answer.'],
    a: ['You need to complete the annual risk assessment.', 'Your parking permit has expired. Since 2019.', 'Please confirm your travel claim. Receipts in triplicate.', 'Have you submitted your outside-activities declaration?', 'The audit needs your signature. Blue ink only.', 'The new system needs everything re-entered.', 'You have three unread compliance modules.', 'Form 12-C, then 12-D, then a form about the forms.', 'Your office has been reassigned. Pending.', 'Your desk survey is overdue.', 'Please justify the coffee budget.', 'Have you done the data-protection refresher?', 'We cannot reimburse a sandwich.', 'Your leave request needs three approvals.', 'Did you see the new template for templates?', 'Your training certificate expires in ninety seconds.'],
    d: ['I wanted a quick word about priorities.', 'Do you have a moment to discuss the future?', 'We are reviewing everything. Starting with you.', 'The Faculty needs volunteers. You, specifically.', 'I would like you on a task force.', 'Could you chair the committee on committees?', 'We are reshaping the curriculum. Walk with me.', 'I have exciting news about the budget. It is not exciting.', 'Let us take this offline. Offline is my office.', 'I admire your independence. Please be more collaborative.', 'There is an opening on the strategic board.', 'How is your teaching load? Light, I hope.', 'We should sit down. Bring your calendar.', 'The Vice-Chancellor asked about your research impact.', 'Remind me what you do again?'],
    v: ['Excuse me, is this the way to the conference?', 'Do you know where I can get a coffee? Any coffee?', 'I am looking for Professor… somebody.', 'Is there Wi-Fi here? Which password?', 'Could you tell me where the lecture is? Any lecture.', 'I think I am supposed to give a talk in ten minutes.', 'Where is the nearest exit? Or entrance?', 'Is this the right building? It was a different building.', 'Sorry, do you work here?', 'How do I get to room 4.317? The numbers confuse me.', 'Is the seminar on mathematics or on cake?', 'Where are the toilets? Please say it is near.', 'I have a delivery for the Dean. Is he here?', 'Do you know a good place for lunch?', 'Is that the way to the lift? Which lift?']
  };
  Object.keys(MORE).forEach((k) => { PEOPLE[k].lines = PEOPLE[k].lines.concat(MORE[k]); });

  /* Everybody looks a little different each time. */
  const SKINS = ['#f1c9a5', '#e3b48d', '#c98f63', '#9a6a45', '#6b4429'];
  const HAIRS = ['#2a2626', '#5b3d24', '#a87b45', '#cfcfd2', '#16161a', '#7e3426', '#d8b36a'];
  const HSTYLES = ['short', 'short', 'long', 'bun', 'curly', 'bald'];
  function variant(st, o) {
    o = o || {};
    const v = Object.assign({}, st);
    v.skin = rnd(SKINS);
    if (o.keepHair) v.hs = 'short';
    else { v.hair = rnd(HAIRS); v.hs = rnd(HSTYLES); if (v.hs === 'bald') v.hair = shade(v.skin, -0.06); }
    if (o.skirt && Math.random() < 0.45) v.skirt = shade(v.top, -0.28);
    return v;
  }
  const OBJ_LINES = {
    box: ['Who leaves boxes in a corridor?', 'Ouch. Printer paper.'],
    cart: ['A trolley of exam scripts.', 'Mind the trolley!'],
    cable: ['Ouch.', 'Who left that there?', 'Facilities will hear about this.'],
    stack: ['A tower of box files.', 'Archive day, apparently.'],
    over: ['A banner. At head height. Why.', 'MIND YOUR HEAD, said the banner. Too late.'],
    email: ['REPLY ALL', 'Re: Re: Re: Fwd: Meeting', 'URGENT (not urgent)', 'Per my last email…', 'Please find attached', 'Gentle reminder!'],
    form: ['Form 27B. In triplicate.']
  };
  const PHONE_LINES = ['…I will email you.', 'Oh, never mind.', '(waves, unheard)', 'Hello? …Right.', 'They cannot hear a word.'];
  const PIT_LINES = ['Floor closed for maintenance.', 'The sign was there. Honestly.', 'Whoops.', 'Mind the gap, said the sign.'];
  const FAKE_LINES = ['Nobody there. Probably.', 'An empty room. Suspicious.', 'Just the cleaner’s cupboard.'];

  /* ─── The floors ─────────────────────────────────────────── */

  /* len: distance to the coffee. v0 → v1: running speed, rising along the way.
     warn: seconds between a door starting to open and you reaching it. */
  const LEVELS = [
    { name: 'The third-floor corridor', len: 4100, v0: 86, v1: 132, warn0: 1.0, warn1: 0.8, theme: 0,
      pool: { amb: 5, ambA: 2, chat: 3, low: 3, stack: 2, over: 2, pit: 2, email: 2, fake: 1, wet: 1 },
      hint: 'Doors open and people step out. Move to another lane to get round them. Jump low things, slide under high ones.',
      done: 'Coffee. Black. No questions asked.' },
    { name: 'The long way round', len: 5200, v0: 98, v1: 156, warn0: 0.82, warn1: 0.64, theme: 1,
      pool: { amb: 4, ambA: 2, ambD: 1, chat: 2, low: 2, stack: 2, over: 2, pit: 2, email: 3, fake: 2, pair: 3, wet: 2, bait: 3 },
      hint: 'Faster now. Students follow you, some doors open on nothing, and the Dean takes up two lanes.',
      done: 'Two sugars and a clear conscience.' },
    { name: 'The basement café', len: 6300, v0: 108, v1: 172, warn0: 0.72, warn1: 0.54, theme: 2,
      pool: { amb: 3, ambA: 2, ambD: 3, chat: 1, low: 2, stack: 1, over: 2, pit: 2, email: 3, fake: 2, pair: 3, bait: 3, gauntlet: 3 },
      hint: 'The Dean is on this floor, and so is everybody else. Watch the doors.',
      done: 'The machine says OUT OF ORDER.' }
  ];

  const THEMES = [
    { wallA: '#d9cfb3', wallB: '#cdc2a2', wain: '#9c8f6d', floorA: '#8d897d', floorB: '#7d796e', ceilA: '#efe9d6', ceilB: '#e2dac2', light: '#fffbe0', door: '#6a4a32', fog: '#d6ccb0', glow: '255,244,200', sun: '255,236,190', grade: 'rgba(255,190,110,0.045)' },
    { wallA: '#b8cab4', wallB: '#a9bda6', wain: '#6c8668', floorA: '#7e8b81', floorB: '#6f7c72', ceilA: '#e0eadb', ceilB: '#d0dccb', light: '#f6ffd9', door: '#5b3f2a', fog: '#c6d6c2', glow: '230,255,200', sun: '230,255,210', grade: 'rgba(120,200,150,0.04)' },
    { wallA: '#5d6e80', wallB: '#516274', wain: '#334150', floorA: '#4d5663', floorB: '#424a56', ceilA: '#323e4b', ceilB: '#2a3541', light: '#cfe6ff', door: '#3b4a58', fog: '#10161d', glow: '150,200,255', sun: '120,170,255', grade: 'rgba(60,110,200,0.06)', pipes: true }
  ];

  /* ─── Building a floor ───────────────────────────────────── */

  const lerp = (a, b, t) => a + (b - a) * t;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
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
  const laneX = (l) => l * LANE;
  const randLane = () => ((Math.random() * 3) | 0) - 1;
  const randSide = () => (Math.random() < 0.5 ? -1 : 1);

  function addDoor(L, oz, side, who) { L.ob.push({ k: 'door', oz: oz, side: side, who: who }); }
  function addPerson(L, oz, lane, who) { L.ob.push({ k: 'person', oz: oz, x: laneX(lane), who: who, still: true }); }
  function addBlock(L, oz, lane, type) { L.ob.push({ k: 'block', oz: oz, x: laneX(lane), type: type }); }
  function addOver(L, oz, lanes) {
    const xs = lanes.map(laneX);
    L.ob.push({ k: 'over', oz: oz, x0: Math.min.apply(null, xs) - LANE / 2, x1: Math.max.apply(null, xs) + LANE / 2 });
  }
  function addPit(L, oz, lanes, len) {
    const xs = lanes.map(laneX);
    L.ob.push({ k: 'pit', oz: oz, len: len || 30, x0: Math.min.apply(null, xs) - LANE / 2, x1: Math.max.apply(null, xs) + LANE / 2 });
  }
  function addEmail(L, oz, lane, high) { L.ob.push({ k: 'email', oz: oz, x: laneX(lane), high: high }); }
  function coinsAt(L, oz, lane, n, y) { for (let i = 0; i < n; i++) L.items.push({ type: 'o', oz: oz + i * 14, x: laneX(lane), y: y || 9 }); }
  function freeLanes(taken) { return [-1, 0, 1].filter((l) => taken.indexOf(l) < 0); }

  /* Each pattern puts things at oz and beyond and says how deep it goes. Every one has
     a way through: a free lane, or something to jump or slide under. */
  const PATTERNS = {
    amb:   (L, oz, v) => { addDoor(L, oz, randSide(), rnd(['q', 'q', 's', 'v'])); coinsAt(L, oz - 40, randLane(), 3); return 20; },
    ambA:  (L, oz, v) => { addDoor(L, oz, randSide(), 'a'); coinsAt(L, oz - 40, randLane(), 3); return 20; },
    ambD:  (L, oz, v) => { addDoor(L, oz, randSide(), 'd'); return 20; },
    fake:  (L, oz, v) => { addDoor(L, oz, randSide(), null); coinsAt(L, oz - 30, randLane(), 4); return 20; },
    chat:  (L, oz, v) => {
      const free = randLane();
      freeLanes([free]).forEach((l) => addPerson(L, oz, l, rnd(['q', 'v', 'q'])));
      coinsAt(L, oz - 10, free, 4);
      return 14;
    },
    low:   (L, oz, v) => {
      const type = rnd(['box', 'cart', 'cable']);
      const lanes = Math.random() < 0.4 ? [-1, 0, 1] : freeLanes([randLane()]);
      lanes.forEach((l) => addBlock(L, oz, l, type));
      lanes.slice(0, 2).forEach((l) => coinsAt(L, oz + 2, l, 1, 20));
      return 16;
    },
    stack: (L, oz, v) => {
      const free = randLane();
      freeLanes([free]).forEach((l) => addBlock(L, oz, l, 'stack'));
      coinsAt(L, oz - 10, free, 4);
      return 16;
    },
    over:  (L, oz, v) => { addOver(L, oz, Math.random() < 0.6 ? [-1, 0, 1] : freeLanes([randLane()])); return 8; },
    pit:   (L, oz, v) => { addPit(L, oz, Math.random() < 0.5 ? [-1, 0, 1] : freeLanes([randLane()]), 30); return 30; },
    email: (L, oz, v) => {
      const a = randLane();
      addEmail(L, oz + 40, a, Math.random() < 0.6);
      if (Math.random() < 0.5) addEmail(L, oz + 90, rnd(freeLanes([a])), Math.random() < 0.6);
      return 140;
    },
    wet:   (L, oz, v) => { L.ob.push({ k: 'wet', oz: oz, len: 90 }); return 90; },
    pair:  (L, oz, v) => {
      addDoor(L, oz, randSide(), rnd(['q', 's']));
      addOver(L, oz + v * 0.95 + 20, [-1, 0, 1]);
      return v * 0.95 + 30;
    },
    bait:  (L, oz, v) => {                      // a door that opens on nobody, and then one that does not
      const side = randSide();
      addDoor(L, oz, side, null);
      addDoor(L, oz + v * 0.7 + 14, -side, rnd(['q', 'a', 's']));
      return v * 0.7 + 34;
    },
    gauntlet: (L, oz, v) => {
      let at = oz;
      addDoor(L, at, randSide(), rnd(['q', 's'])); at += v * 0.9 + 16;
      addOver(L, at, [-1, 0, 1]); at += v * 0.85 + 16;
      addBlock(L, at, -1, 'box'); addBlock(L, at, 0, 'box'); addBlock(L, at, 1, 'box'); at += v * 0.85 + 16;
      addDoor(L, at, randSide(), rnd(['a', 'd']));
      return at - oz + 20;
    }
  };

  function buildLevel(i) {
    const cfg = LEVELS[i];
    const L = { cfg: cfg, theme: THEMES[cfg.theme], len: cfg.len, ob: [], items: [], dummies: [], decor: [], cp: Math.round(cfg.len * 0.5) };
    const speedAt = (d) => lerp(cfg.v0, cfg.v1, clamp(d / cfg.len, 0, 1));

    let oz = 620;
    while (oz < cfg.len - 520) {
      const v = speedAt(oz);
      const names = Object.keys(cfg.pool);
      let total = 0; names.forEach((n) => { total += cfg.pool[n]; });
      let r = Math.random() * total, name = names[0];
      for (const n of names) { r -= cfg.pool[n]; if (r <= 0) { name = n; break; } }
      const warnAt = lerp(cfg.warn0, cfg.warn1, clamp(oz / cfg.len, 0, 1));
      const start = L.ob.length;
      const used = PATTERNS[name](L, oz, v);
      for (let k = start; k < L.ob.length; k++) {
        const o = L.ob[k];
        o.warn = warnAt * (0.86 + Math.random() * 0.28);
        // the Dean takes two lanes and the administrator's form is already fully out, so they need longer to see coming
        if (o.k === 'door' && (o.who === 'd' || o.who === 'a')) o.warn += 0.24;
      }
      oz += used + v * (0.74 + Math.random() * 0.44) + 26;
    }

    // Pickups in clear stretches, one per lane at most.
    const clear = (d) => {
      for (let k = 0; k < 60; k++) {
        if (!L.ob.some((o) => Math.abs((o.oz != null ? o.oz : 0) - d) < 140)) return d;
        d += 25;
      }
      return d;
    };
    L.items.push({ type: 'C', oz: clear(Math.round(cfg.len * 0.42)), x: laneX(randLane()), y: 12 });
    if (i >= 1) L.items.push({ type: 'H', oz: clear(Math.round(cfg.len * 0.66)), x: laneX(randLane()), y: 12 });
    L.items.push({ type: 'b', oz: clear(Math.round(cfg.len * 0.22)), x: laneX(randLane()), y: 12 });

    // Windows, notice boards, pictures, plants: what a corridor has on its walls.
    L.decor = [];
    for (let d = 90; d < cfg.len + 200; d += 70 + ((Math.random() * 60) | 0)) {
      const side = randSide();
      if (L.ob.some((o) => o.k === 'door' && o.side === side && Math.abs(o.oz - d) < 50)) continue;
      L.decor.push({ oz: d, side: side, kind: rnd(['window', 'window', 'board', 'picture', 'plant', 'ext', 'bench', 'alarm']), v: (Math.random() * 3) | 0 });
    }
    // signs hanging from the ceiling, over the middle of the corridor
    for (let d = 260; d < cfg.len + 100; d += 300 + ((Math.random() * 120) | 0)) L.decor.push({ oz: d, side: 0, kind: 'sign', v: (Math.random() * 6) | 0 });

    // Plain doors along both walls. These never open.
    for (let d = 140; d < cfg.len + 200; d += 120 + ((Math.random() * 90) | 0)) {
      [-1, 1].forEach((side) => {
        if (Math.random() < 0.7 && !L.ob.some((o) => o.k === 'door' && o.side === side && Math.abs(o.oz - d) < 70) && !L.decor.some((x) => x.side === side && Math.abs(x.oz - d) < 36)) L.dummies.push({ oz: d, side: side, exit: Math.random() < 0.18 });
      });
    }
    return L;
  }

  /* ─── State ──────────────────────────────────────────────── */

  const keys = { left: false, right: false, jump: false, slide: false };
  let edges = { left: false, right: false, jump: false, slide: false };

  const S = {
    mode: 'menu',               // menu | play | pause | dead | done | end
    level: 0, score: 0,
    best: Number(localStorage.getItem('hallwayescape.best') || 0),
    hearts: HEARTS, coins: 0, streak: 0, bestStreak: 0, deaths: 0,
    cp: null, lvl: null
  };
  let P = null, ob = [], items = [], floats = [];
  let D = 0, simT = 0, toastText = '', toastT = 0, flash = 0, CAMX = 0, lastV = 0, shake = 0, dustT = 0;
  let parts = [];

  const $ = (id) => document.getElementById(id);
  const cv = $('cv'), ctx = cv.getContext('2d'), viewEl = $('view'), overlay = $('overlay');
  const elScore = $('score'), elCoins = $('coins'), elDist = $('dist'), elLives = $('lives'), elTag = $('level-tag');

  function instantiate(L, fromD) {
    ob = L.ob.filter((o) => o.oz >= fromD).map((o) => {
      const r = Object.assign({ hit: false, done: false }, o);
      if (r.k === 'door') { r.state = 0; r.t = 0; r.label = null; }
      if (r.k === 'email') { r.speed = 42; }
      if (r.k === 'person') { r.say = draw(PEOPLE[r.who].lines); r.sayT = 99; r.step = 0; r.look = variant(PEOPLE[r.who].style, { skirt: true }); }
      return r;
    });
    items = L.items.filter((it) => it.oz >= fromD).map((it) => Object.assign({ got: false, ph: Math.random() * 6 }, it));
    floats = []; parts = [];
  }

  function placePlayer(d, invuln) {
    D = d;
    P = { x: 0, lane: 0, h: 0, vy: 0, step: 0, slide: 0, pendingSlide: false, jbuf: 0, invuln: invuln || 0, stumble: 0, phones: 0, lean: 0, vx: 0, land: 0, crouch: 0 };
    CAMX = 0; camVx = 0; camH = CAMH; Fv = F; roll = 0; parts = []; lastV = S.lvl ? S.lvl.cfg.v0 : 100;
  }

  function beginLevel(i, retry) {
    S.level = i;
    if (!retry) S.lvl = buildLevel(i);
    const L = S.lvl;
    edges = { left: false, right: false, jump: false, slide: false };
    if (!retry) {
      S.cp = null; S.hearts = HEARTS; S.coins = 0; S.streak = 0; S.bestStreak = 0; S.levelStartScore = S.score;
      instantiate(L, 0); placePlayer(0);
    } else {
      S.hearts = HEARTS; S.streak = 0;
      if (S.cp) { S.score = S.cp.score; S.coins = S.cp.coins; instantiate(L, S.cp.d); placePlayer(S.cp.d, 1.2); }
      else { S.score = S.levelStartScore; S.coins = 0; instantiate(L, 0); placePlayer(0, 1.2); }
    }
    elTag.textContent = 'Floor ' + (i + 1) + ' of ' + LEVELS.length + ' · ' + LEVELS[i].name;
    updateHud();
  }

  /* ─── Logic ──────────────────────────────────────────────── */

  function speedNow() {
    const L = S.lvl;
    let v = lerp(L.cfg.v0, L.cfg.v1, clamp(D / L.len, 0, 1));
    if (P.phones > 0) v *= 1.08;
    if (P.stumble > 0) v *= 0.45;
    if (P.h === 0 && ob.some((o) => o.k === 'wet' && o.oz - D < 4 && o.oz + o.len - D > -4)) v *= 1.25;
    return v;
  }

  function floatText(x, y, text, color) { floats.push({ x: x, y: y, t: 0, text: text, color: color || '#fff' }); }
  function toast(t) { toastText = t; toastT = 2.4; }

  function hurt(o, line) {
    if (o.hit || P.invuln > 0) return;
    o.hit = true;
    if (P.phones > 0) { if (o.k === 'person') { o.say = draw(PHONE_LINES); o.sayT = 1.4; } return; }
    S.hearts--; S.streak = 0;
    P.invuln = 1.4; P.stumble = 0.55; flash = 0.45; shake = 1;
    SFX.hurt();
    { const f = pj(P.x, PH * 0.6 + P.h, PZ); burst(f[0], f[1], 12, 'rgba(255,120,100,0.95)', 60, 10); burst(f[0], f[1], 6, 'rgba(255,255,255,0.9)', 40, 6); }
    floatText(P.x, PH + P.h + 8, '-1 patience', '#ff8a7a');
    if (o.k === 'person') { o.say = line || draw(PEOPLE[o.who].lines); o.sayT = 2; }
    else toast(line || draw(OBJ_LINES[o.type || o.k] || OBJ_LINES.box));
    if (S.hearts <= 0) die();
  }

  function die() {
    if (S.mode !== 'play') return;
    S.mode = 'dead'; S.deaths++;
    SFX.over();
    setTimeout(deadScreen, 500);
  }

  function dodged(o, x) {
    if (o.done) return;
    o.done = true;
    if (o.hit) return;
    S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
    const mult = Math.min(4, 1 + Math.floor(S.streak / 4));
    const pts = DODGE * mult;
    S.score += pts;
    SFX.dodge();
    { const f = pj(P.x, 4, PZ); burst(f[0], f[1], 5, 'rgba(255,255,255,0.7)', 40, 2); }
    floatText(x, 46, '+' + pts + (mult > 1 ? ' ×' + mult : ''), '#ffe08a');
  }

  /* Does the runner overlap this box, and is the runner at this depth? */
  function overlaps(o, x0, x1, y0, y1) {
    const px0 = P.x - 6, px1 = P.x + 6;
    const py0 = P.h, py1 = P.slide > 0 && P.h === 0 ? SH : P.h + PH;
    return px0 < x1 && px1 > x0 && py0 < y1 && py1 > y0;
  }

  function spawnPerson(d) {
    const pp = PEOPLE[d.who];
    const x0 = d.side * (HW - 8);
    const lane = Math.round(P.x / LANE);
    const p = {
      k: 'person', who: d.who, oz: d.oz + 7, x: x0, hit: false, done: false, door: d, look: variant(pp.style, { keepHair: d.who === 'd', skirt: d.who !== 'd' }),
      tx: pp.cross ? -d.side * (HW - 10) : pp.track ? P.x : d.who === 'd' ? d.side * LANE * 0.5 : d.who === 'a' ? x0 : laneX(lane),
      say: draw(pp.lines), sayT: 99, step: 0
    };
    ob.push(p);
    if (pp.form) {
      // the administrator stays in the doorway and holds a form out over two lanes, at head height
      ob.push({ k: 'form', oz: d.oz + 7, x0: Math.min(d.side * HW, -d.side * 10), x1: Math.max(d.side * HW, -d.side * 10), hit: false, done: false, owner: p });
    }
    return p;
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
    flash = Math.max(0, flash - dt);

    if (edges.left)  { P.lane = Math.max(-1, P.lane - 1); edges.left = false; SFX.slide(); }
    if (edges.right) { P.lane = Math.min(1, P.lane + 1); edges.right = false; SFX.slide(); }
    if (edges.jump) { P.jbuf = 0.12; edges.jump = false; } else P.jbuf -= dt;
    const grounded = P.h === 0 && P.vy === 0;
    if (P.jbuf > 0 && grounded) { P.vy = JUMPV; P.slide = 0; P.jbuf = 0; SFX.jump(); }
    if (edges.slide) {
      edges.slide = false;
      if (grounded) { P.slide = SLIDE_T; SFX.slide(); }
      else { P.vy = Math.min(P.vy, -300); P.pendingSlide = true; }
    }
    if (P.h > 0 || P.vy !== 0) {
      P.vy -= GRAV * dt;                          // a jump is always the same height, so a swipe is as good as a held button
      P.h += P.vy * dt;
      if (P.h <= 0) {
        if (P.vy < -90) { P.land = 0.16; const f = pj(P.x, 0, PZ); burst(f[0], f[1], 7, 'rgba(235,225,205,0.8)', 26, 6); }
        P.h = 0; P.vy = 0; if (P.pendingSlide) { P.pendingSlide = false; P.slide = SLIDE_T; SFX.slide(); }
      }
    }
    // sideways: a stiff spring (quick, no wobble), softer on the wet
    const onWet = grounded && ob.some((o) => o.k === 'wet' && o.oz - D < 4 && o.oz + o.len - D > -4);
    const kk = onWet ? 330 : 1300, cc = onWet ? 36 : 74;
    P.vx += ((P.lane * LANE - P.x) * kk - P.vx * cc) * dt;
    P.x += P.vx * dt;
    P.lean += (clamp(P.vx / 230, -1, 1) - P.lean) * Math.min(1, dt * 14);

    // the camera follows a little late, rolls into the turn, rises with a jump and widens with speed
    const v = speedNow();
    lastV = v;
    const sf = clamp((v - S.lvl.cfg.v0) / Math.max(40, S.lvl.cfg.v1 - S.lvl.cfg.v0), 0, 1);
    camVx += (((P.x * 0.55) - CAMX) * 70 - camVx * 15) * dt;
    CAMX += camVx * dt;
    roll += ((-clamp(P.vx, -260, 260) * 0.00011) - roll) * Math.min(1, dt * 7);
    camH += ((CAMH + P.h * 0.32 - P.crouch * 3 + Math.sin(simT * v / 17) * 0.28 * (P.h === 0 ? 1 : 0)) - camH) * Math.min(1, dt * 10);
    Fv += ((F + sf * 14 + (P.stumble > 0 ? -6 : 0)) - Fv) * Math.min(1, dt * 4);
    P.crouch += (((P.slide > 0 && P.h === 0) ? 1 : 0) - P.crouch) * Math.min(1, dt * 18);
    P.land = Math.max(0, P.land - dt * 5);
    shake = Math.max(0, shake - dt * 3);

    D += v * dt;
    P.step += dt * v / 22;

    // dust behind the runner's heels
    dustT -= dt;
    if (P.h === 0 && dustT <= 0) { dustT = 0.06; const f = pj(P.x, 0, PZ); parts.push({ x: f[0] + (Math.random() - 0.5) * 6, y: f[1], vx: (Math.random() - 0.5) * 12, vy: -4 - Math.random() * 6, t: 0, ttl: 0.35, r: 1.2, c: 'rgba(235,225,205,0.7)' }); }
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 40 * dt; if (q.t > q.ttl) parts.splice(i, 1); }

    // ── the corridor
    for (let i = 0; i < ob.length; i++) {
      const o = ob[i];
      const zr = o.oz - D;
      if (o.k === 'door') {
        if (o.state === 0 && zr < v * (o.warn || 0.8) && zr > -20) { o.state = 1; o.t = 0; SFX.creak(); }
        if (o.state >= 1) o.t += dt;
        if (o.state === 1 && o.t >= OPEN_T) {
          if (o.who) { o.state = 2; o.person = spawnPerson(o); }
          else { o.state = 3; o.said = 1.6; o.line = draw(FAKE_LINES); }
        }
        if (o.said > 0) o.said -= dt;
      } else if (o.k === 'person') {
        const pp = PEOPLE[o.who];
        if (!o.still) {
          if (pp.track && zr > 50) o.tx = P.x;
          const d = o.tx - o.x, sp = pp.speed * dt;
          if (Math.abs(d) <= sp) o.x = o.tx; else { o.x += Math.sign(d) * sp; o.step += dt * 2; }
        }
        if (o.sayT < 90 && o.sayT > 0) o.sayT -= dt;
        const half = pp.w / 2;
        if (zr < 4 && zr > -9 && !o.hit && overlaps(o, o.x - half, o.x + half, 0, pp.h)) hurt(o);
        if (zr < -9) dodged(o, o.x);
      } else if (o.k === 'block') {
        const sz = BLOCKS[o.type];
        if (zr < 4 && zr + sz.d > -4 && !o.hit && overlaps(o, o.x - sz.w / 2, o.x + sz.w / 2, 0, sz.h)) hurt(o);
        if (zr + sz.d < -4) dodged(o, o.x);
      } else if (o.k === 'over' || o.k === 'form') {
        if (zr < 4 && zr + 6 > -4 && !o.hit && overlaps(o, o.x0, o.x1, 14, 56)) hurt(o, o.k === 'form' ? draw(OBJ_LINES.form) : null);
        if (zr + 6 < -4) dodged(o, (o.x0 + o.x1) / 2);
      } else if (o.k === 'email') {
        o.oz -= o.speed * dt;
        const y0 = o.high ? 14 : 0, y1 = o.high ? 26 : 8;
        if (zr < 4 && zr > -6 && !o.hit && overlaps(o, o.x - 9, o.x + 9, y0, y1)) hurt(o);
        if (zr < -6) dodged(o, o.x);
      } else if (o.k === 'pit') {
        if (zr < 2 && zr + o.len > -2 && !o.done && P.h === 0 && P.invuln <= 0 && P.phones <= 0 && P.x + 6 > o.x0 && P.x - 6 < o.x1) {
          S.hearts--; S.streak = 0; o.done = true;
          SFX.fall(); toast(draw(PIT_LINES)); flash = 0.35;
          floatText(P.x, 40, '-1 patience', '#ff8a7a');
          D = o.oz + o.len + 6; P.invuln = 1.4; P.stumble = 0.7;
          if (S.hearts <= 0) die();
        } else if (zr + o.len < -4) dodged(o, (o.x0 + o.x1) / 2);
      }
    }
    if (S.mode !== 'play') return;

    // ── pickups
    items.forEach((it) => {
      if (it.got) return;
      const zr = it.oz - D;
      if (zr < 6 && zr > -6 && Math.abs(P.x - it.x) < 14) {
        it.got = true;
        if (it.type === 'o') { S.score += COIN; S.coins++; SFX.coin(); floatText(it.x, it.y + 14, '+' + COIN, '#ffe08a'); { const f = pj(it.x, it.y, PZ); burst(f[0], f[1] - 8, 6, 'rgba(255,225,120,0.95)', 34, 8); } }
        else if (it.type === 'b') { S.score += 50; SFX.biscuit(); floatText(it.x, it.y + 14, '+50 biscuit', '#ffd5a0'); }
        else if (it.type === 'H') { P.phones = 6; SFX.power(); floatText(it.x, it.y + 14, 'headphones!', '#9fe3ff'); toast('Headphones on. Nobody can reach you.'); }
        else if (it.type === 'C') {
          SFX.power();
          if (S.hearts < HEARTS) { S.hearts++; floatText(it.x, it.y + 14, '+1 patience', '#a8e6b0'); toast('A coffee on the way. Patience restored.'); }
          else { S.score += 100; floatText(it.x, it.y + 14, '+100', '#ffe08a'); toast('A spare coffee. You were fine, really.'); }
        }
      }
    });

    if (!S.cp && D >= L.cp) { S.cp = { d: L.cp, score: S.score, coins: S.coins }; floatText(0, 50, 'Checkpoint', '#ffffff'); SFX.power(); }
    if (D >= L.len - 4) { arrive(); return; }

    for (let i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 1.1) floats.splice(i, 1); }
    toastT = Math.max(0, toastT - dt);
    // forget what is far behind us
    if (ob.length > 60) ob = ob.filter((o) => o.oz - D > -80);
  }

  /* ─── Projection and drawing ─────────────────────────────── */

  let SC = 1;
  let vig = null;
  function layout() {
    const w = viewEl.clientWidth, h = viewEl.clientHeight;
    const s = Math.min(w / VW, h / VH);
    const cw = Math.max(1, Math.floor(VW * s)), ch = Math.max(1, Math.floor(VH * s));
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    SC = cv.width / VW;
    // the vignette is drawn once and stamped every frame
    vig = document.createElement('canvas'); vig.width = cv.width; vig.height = cv.height;
    const v = vig.getContext('2d'); v.scale(SC, SC);
    const g = v.createRadialGradient(VW / 2, VH * 0.46, VH * 0.28, VW / 2, VH * 0.5, VH * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
    v.fillStyle = g; v.fillRect(0, 0, VW, VH);
    if (!grain) {
      grain = document.createElement('canvas'); grain.width = 192; grain.height = 144;
      const gx = grain.getContext('2d'), id = gx.createImageData(192, 144);
      for (let i = 0; i < id.data.length; i += 4) { const n = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = n; id.data[i + 3] = 255; }
      gx.putImageData(id, 0, 0);
    }
  }
  window.addEventListener('resize', layout);

  /* The camera: it follows the runner a little late, sways, and widens a touch with speed. */
  let camH = CAMH, Fv = F, roll = 0, camVx = 0, RD = 0;

  /* x across, y up, z away from the camera. */
  function pj(x, y, z) {
    if (z < ZN) z = ZN;
    const s = Fv / z;
    return [VPX + (x - CAMX) * s, VPY + (camH - y) * s, s];
  }
  function poly(col, pts) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fill();
  }
  function face(col, pts) { poly(col, pts.map((p) => pj(p[0], p[1], p[2]))); }
  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  const mixCache = new Map();
  function mix(a, b, t) {
    t = Math.round(clamp(t, 0, 1) * 32) / 32;
    const key = a + b + t;
    let r = mixCache.get(key);
    if (r) return r;
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
    r = '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1);   // always hex, so colours can be mixed again
    mixCache.set(key, r);
    return r;
  }
  const shade = (c, t) => (t >= 0 ? mix(c, '#ffffff', t) : mix(c, '#000000', -t));

  /* A soft light: an additive radial glow. */
  function glow(x, y, rx, ry, rgb, a) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.3); ctx.fill();
    ctx.restore();
  }

  const BLOCKS = {
    box:   { w: 26, h: 11, d: 14, front: '#b8864a', top: '#d9ad70', side: '#8c5f2e' },
    cart:  { w: 28, h: 12, d: 18, front: '#8a6a42', top: '#ece5d2', side: '#6e5232' },
    cable: { w: 30, h: 3,  d: 6,  front: '#222',    top: '#3a3a3a', side: '#111' },
    stack: { w: 28, h: 38, d: 16, front: '#9aa4ae', top: '#c9d1d9', side: '#6f7984' }
  };

  function cuboid(x0, x1, y0, y1, z0, z1, cF, cT, cS) {
    if (camH > y1) face(cT, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]);
    if (CAMX < x0) face(cS, [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]]);
    else if (CAMX > x1) face(cS, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]);
    face(cF, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]);
    // a soft edge highlight along the front top
    face('rgba(255,255,255,0.18)', [[x0, y1, z0], [x1, y1, z0], [x1, y1 - 1, z0], [x0, y1 - 1, z0]]);
  }

  /* ── the corridor ── */

  function drawCorridor(L, th) {
    ctx.fillStyle = th.fog; ctx.fillRect(0, 0, VW, VH);
    const BL = 16;
    const kmax = Math.floor((RD + ZF - PZ) / BL), kmin = Math.floor((RD + ZN - PZ) / BL);
    for (let k = kmax; k >= kmin; k--) {
      const zn = Math.max(ZN, k * BL - RD + PZ), zf = k * BL - RD + PZ + BL + 0.5;
      if (zf <= ZN) continue;
      const t = Math.pow(clamp(zn / ZF, 0, 1), 0.8);
      const odd = (k & 1) === 1, band = ((k >> 1) & 1) === 1;
      // polished floor, ceiling panels
      face(mix(odd ? th.floorA : th.floorB, th.fog, t), [[-HW, 0, zn], [HW, 0, zn], [HW, 0, zf], [-HW, 0, zf]]);
      face(mix(odd ? th.ceilA : th.ceilB, th.fog, t), [[-HW, WALLH, zn], [HW, WALLH, zn], [HW, WALLH, zf], [-HW, WALLH, zf]]);
      // seams
      face(mix(shade(th.floorA, -0.25), th.fog, t), [[-HW, 0, zn], [HW, 0, zn], [HW, 0, zn + 0.35], [-HW, 0, zn + 0.35]]);
      [-HW, HW].forEach((wx) => {
        const s = wx < 0 ? 1 : -1;
        face(mix(shade(th.wain, band ? 0 : -0.06), th.fog, t), [[wx, 2, zn], [wx, 16, zn], [wx, 16, zf], [wx, 2, zf]]);
        face(mix(shade(odd ? th.wallA : th.wallB, 0), th.fog, t), [[wx, 16, zn], [wx, WALLH - 5, zn], [wx, WALLH - 5, zf], [wx, 16, zf]]);
        face(mix(shade(th.wain, -0.3), th.fog, t), [[wx, 0, zn], [wx, 2, zn], [wx, 2, zf], [wx, 0, zf]]);              // skirting
        face(mix(shade(th.wain, 0.25), th.fog, t * 0.9), [[wx, 15.4, zn], [wx, 16.4, zn], [wx, 16.4, zf], [wx, 15.4, zf]]); // rail
        face(mix(th.light, th.fog, t * 0.75), [[wx + s * 0.1, WALLH - 5, zn], [wx + s * 0.1, WALLH - 3.4, zn], [wx + s * 0.1, WALLH - 3.4, zf], [wx + s * 0.1, WALLH - 5, zf]]);   // the cove light
        face(mix(shade(odd ? th.ceilA : th.ceilB, -0.1), th.fog, t), [[wx, WALLH - 3.4, zn], [wx, WALLH, zn], [wx, WALLH, zf], [wx, WALLH - 3.4, zf]]);
        // a panel seam
        face(mix(shade(th.wallA, -0.2), th.fog, t), [[wx, 16, zn], [wx, WALLH - 5, zn], [wx, WALLH - 5, zn + 0.3], [wx, 16, zn + 0.3]]);
      });
      // lane lines, a little glossy
      [-LANE / 2, LANE / 2].forEach((lx) => face(mix('#ffffff', th.fog, 0.5 + t * 0.45), [[lx - 0.45, 0, zn], [lx + 0.45, 0, zn], [lx + 0.45, 0, zf], [lx - 0.45, 0, zf]]));
      // a strip light every fourth band
      if (k % 4 === 0) {
        face(mix(th.light, th.fog, t * 0.7), [[-13, WALLH - 0.15, zn + 4], [13, WALLH - 0.15, zn + 4], [13, WALLH - 0.15, zf - 4], [-13, WALLH - 0.15, zf - 4]]);
      }
    }
    // tile grout down the floor, and a soft shadow where the walls meet it and the ceiling
    for (let gx = -48; gx <= 48; gx += 12) face('rgba(0,0,0,0.055)', [[gx - 0.18, 0, ZN], [gx + 0.18, 0, ZN], [gx + 0.18, 0, ZF], [gx - 0.18, 0, ZF]]);
    [-HW, HW].forEach((wx) => {
      const inw = wx < 0 ? 1 : -1;
      [3, 6.5, 11].forEach((wd) => {
        face('rgba(0,0,0,0.05)', [[wx, 0.05, ZN], [wx + inw * wd, 0.05, ZN], [wx + inw * wd, 0.05, ZF], [wx, 0.05, ZF]]);
        face('rgba(0,0,0,0.05)', [[wx, WALLH - 0.05, ZN], [wx + inw * wd, WALLH - 0.05, ZN], [wx + inw * wd, WALLH - 0.05, ZF], [wx, WALLH - 0.05, ZF]]);
      });
    });
    // pipes along the ceiling in the basement
    if (th.pipes) {
      [-36, 36].forEach((px) => {
        [[5.4, '#232c36'], [3.8, '#3a4857'], [1.5, '#7f95aa']].forEach((q) => face(q[1], [[px - q[0] / 2, WALLH - 3.4, ZN], [px + q[0] / 2, WALLH - 3.4, ZN], [px + q[0] / 2, WALLH - 3.4, ZF], [px - q[0] / 2, WALLH - 3.4, ZF]]));
        for (let k = kmax; k >= kmin; k--) if (k % 3 === 0) { const z0 = Math.max(ZN, k * BL - RD + PZ); face('#1c232b', [[px - 3.4, WALLH - 3.5, z0], [px + 3.4, WALLH - 3.5, z0], [px + 3.4, WALLH, z0], [px - 3.4, WALLH, z0]]); }
      });
    }
    // a glossy sheen down the middle of the floor, and the glow of each light
    for (let k = kmax; k >= kmin; k--) {
      if (k % 4 !== 0) continue;
      const z = k * BL - RD + PZ + BL / 2;
      if (z < ZN + 4 || z > ZF) continue;
      const c = pj(0, WALLH, z), f = pj(0, 0, z), a = clamp(1 - z / ZF, 0, 1);
      glow(c[0], c[1], 46 * c[2] + 8, 20 * c[2] + 4, th.glow, 0.36 * a);
      glow(f[0], f[1], 40 * f[2] + 8, 8 * f[2] + 2, th.glow, 0.32 * a);          // its reflection on the floor
      // the long streak a light leaves on a polished floor, and a wash on each wall
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const sg = ctx.createLinearGradient(0, f[1], 0, f[1] + 90 * f[2]); sg.addColorStop(0, 'rgba(' + th.glow + ',' + (0.2 * a) + ')'); sg.addColorStop(1, 'rgba(' + th.glow + ',0)');
      ctx.fillStyle = sg; ctx.fillRect(f[0] - 7 * f[2], f[1], 14 * f[2], 90 * f[2]);
      ctx.restore();
      [-HW + 1, HW - 1].forEach((wx) => { const wp = pj(wx, WALLH - 12, z); glow(wp[0], wp[1], 20 * wp[2] + 3, 30 * wp[2] + 3, th.glow, 0.2 * a); });
    }
  }

  function drawFloorThings(L, th) {
    ob.forEach((o) => {
      const z = o.oz - RD + PZ;
      if (z > ZF || z < ZN - 30) return;
      if (o.k === 'pit') {
        face('#05070a', [[o.x0, 0.2, z], [o.x1, 0.2, z], [o.x1, 0.2, z + o.len], [o.x0, 0.2, z + o.len]]);
        face('rgba(255,255,255,0.05)', [[o.x0, 0.25, z + o.len * 0.7], [o.x1, 0.25, z + o.len * 0.7], [o.x1, 0.25, z + o.len], [o.x0, 0.25, z + o.len]]);
        face('#f2c300', [[o.x0, 0.3, z - 1.5], [o.x1, 0.3, z - 1.5], [o.x1, 0.3, z], [o.x0, 0.3, z]]);
        face('#f2c300', [[o.x0, 0.3, z + o.len], [o.x1, 0.3, z + o.len], [o.x1, 0.3, z + o.len + 1.5], [o.x0, 0.3, z + o.len + 1.5]]);
        const n = Math.round((o.x1 - o.x0) / 6);
        for (let i = 0; i < n; i += 2) face('#1b1b1b', [[o.x0 + i * 6, 0.35, z - 1.5], [o.x0 + i * 6 + 6, 0.35, z - 1.5], [o.x0 + i * 6 + 6, 0.35, z], [o.x0 + i * 6, 0.35, z]]);
      } else if (o.k === 'wet') {
        face('rgba(150,205,245,0.42)', [[-HW + 4, 0.2, z], [HW - 4, 0.2, z], [HW - 4, 0.2, z + o.len], [-HW + 4, 0.2, z + o.len]]);
        face('rgba(235,248,255,0.4)', [[-26, 0.3, z + 12], [-8, 0.3, z + 12], [-8, 0.3, z + 28], [-26, 0.3, z + 28]]);
        face('rgba(235,248,255,0.4)', [[10, 0.3, z + 40], [30, 0.3, z + 40], [30, 0.3, z + 52], [10, 0.3, z + 52]]);
      } else if (o.k === 'door' && o.state >= 1) {
        const open = ease(clamp(o.t / OPEN_T, 0, 1)), sx = o.side;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        face('rgba(255,224,150,' + (0.16 * open) + ')', [[sx * HW, 0.3, z], [sx * (HW - 40), 0.3, z - 8], [sx * (HW - 40), 0.3, z + 24], [sx * HW, 0.3, z + 14]]);
        ctx.restore();
      } else if (o.k === 'window') { /* handled with the wall */ }
    });
    // light from the windows falls across the floor
    L.decor.forEach((d) => {
      if (d.kind !== 'window') return;
      const z = d.oz - RD + PZ;
      if (z > ZF || z < ZN - 24) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const a = clamp(1 - z / ZF, 0, 1) * 0.16;
      face('rgba(' + th.sun + ',' + a + ')', [[d.side * HW, 0.2, z + 2], [d.side * (HW - 34), 0.2, z + 18], [d.side * (HW - 34), 0.2, z + 44], [d.side * HW, 0.2, z + 24]]);
      face('rgba(' + th.sun + ',' + (a * 0.5) + ')', [[d.side * HW, 58, z + 1], [d.side * HW, 58, z + 19], [d.side * (HW - 34), 0.4, z + 44], [d.side * (HW - 34), 0.4, z + 18]]);
      ctx.restore();
    });
  }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── people: smooth limbs, soft shading, a walk cycle. Feet at 0,0; units are world units. ── */

  function limb(x1, y1, x2, y2, w, col) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  const OUT = 'rgba(22,18,30,0.42)';

  /* People: stylised, with a tapering body, shoulders, two-part arms, a shaded head with a face, and
     several hair styles. Feet at 0,0; units are world units.
     o: dark (silhouette), back (seen from behind), moving, talk (gesturing), mug, phone, seed */
  function figure(st, w, h, step, o) {
    o = o || {};
    const dark = !!o.dark, back = !!o.back;
    const C = (c) => (dark ? '#07080b' : c);
    const line = (lw) => { if (!dark) { ctx.strokeStyle = OUT; ctx.lineWidth = lw || 0.5; ctx.lineJoin = 'round'; ctx.stroke(); } };
    const ph = step * 6.4, sw = o.moving ? Math.sin(ph) : 0, cw = o.moving ? Math.cos(ph) : 0;
    const seed = o.seed || 0;
    const sho = -h * 0.715, waist = -h * 0.475, hip = -h * 0.43, neckY = -h * 0.76;
    const headR = h * 0.125, headY = -h * 0.875;
    const SW = w * 0.56, WW = w * 0.42;
    const bob = o.moving ? -Math.abs(cw) * h * 0.02 : Math.sin(simT * 2.1 + seed) * 0.22;
    const hs = st.hs || 'short';

    ctx.save();
    ctx.translate(0, bob);

    // long hair falls behind the shoulders
    if (hs === 'long' || (back && hs === 'bun')) {
      ctx.fillStyle = C(st.hair); rr(-headR * 1.1, headY - headR * 0.3, headR * 2.2, headR * (hs === 'long' ? 3.9 : 2.1), headR * 0.7); ctx.fill();
    }

    // legs, tapered, one foot lifting as the other plants
    [-1, 1].forEach((side, i) => {
      const lift = o.moving ? Math.max(0, (i ? sw : -sw)) * h * 0.075 : 0;
      const hx = side * w * 0.2, fx = side * w * (0.22 + (o.moving ? 0.03 * (i ? sw : -sw) : 0)), fy = -1.3 - lift;
      const g = ctx.createLinearGradient(hx - w * 0.2, 0, hx + w * 0.2, 0);
      g.addColorStop(0, shade(st.pants, 0.1)); g.addColorStop(1, shade(st.pants, -0.22));
      ctx.fillStyle = dark ? '#07080b' : g;
      ctx.beginPath(); ctx.moveTo(hx - w * 0.2, hip); ctx.lineTo(hx + w * 0.2, hip); ctx.lineTo(fx + w * 0.13, fy - 1.6); ctx.lineTo(fx - w * 0.13, fy - 1.6); ctx.closePath(); ctx.fill(); line(0.45);
      ctx.fillStyle = C(st.shoes || '#1d1b22'); ctx.beginPath(); ctx.ellipse(fx, fy - 0.2, w * 0.2, 1.9, 0, 0, 6.3); ctx.fill(); line(0.4);
      if (!dark) { ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(fx - w * 0.05, fy - 0.9, w * 0.09, 0.5, 0, 0, 6.3); ctx.fill(); }
    });
    // a skirt over the legs
    if (st.skirt) {
      ctx.fillStyle = C(st.skirt); ctx.beginPath(); ctx.moveTo(-WW, waist + 1); ctx.lineTo(WW, waist + 1); ctx.lineTo(w * 0.62, -h * 0.2); ctx.quadraticCurveTo(0, -h * 0.17, -w * 0.62, -h * 0.2); ctx.closePath(); ctx.fill(); line(0.45);
    }

    // a bag behind (seen from behind), or a satchel on the hip
    if (st.bag && back) { ctx.fillStyle = C(st.bag); rr(-w * 0.38, sho + 1.5, w * 0.76, h * 0.3, 2.4); ctx.fill(); line(0.45); }

    // torso: shoulders, a waist, a collar
    const tg = ctx.createLinearGradient(-SW, 0, SW, 0);
    tg.addColorStop(0, shade(st.top, 0.16)); tg.addColorStop(0.5, st.top); tg.addColorStop(1, shade(st.top, -0.26));
    ctx.fillStyle = dark ? '#07080b' : tg;
    ctx.beginPath(); ctx.moveTo(-WW, waist); ctx.lineTo(-SW * 0.96, sho + 2.4);
    ctx.quadraticCurveTo(-SW, sho - 0.4, -SW * 0.72, sho - 0.9); ctx.lineTo(SW * 0.72, sho - 0.9);
    ctx.quadraticCurveTo(SW, sho - 0.4, SW * 0.96, sho + 2.4); ctx.lineTo(WW, waist); ctx.quadraticCurveTo(0, waist + 1.8, -WW, waist); ctx.closePath(); ctx.fill(); line(0.55);
    if (!dark) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(-SW * 0.8, sho + 1); ctx.lineTo(-SW * 0.25, sho + 1); ctx.lineTo(-WW * 0.4, waist - 1); ctx.lineTo(-WW * 0.9, waist - 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(st.pants, -0.12); ctx.fillRect(-WW, waist - 0.6, WW * 2, 1.6);                               // belt
      if (back) {
        ctx.strokeStyle = shade(st.top, -0.3); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(0, sho + 1); ctx.lineTo(0, waist); ctx.stroke();      // the back seam
        if (st.patches) { ctx.fillStyle = shade(st.top, -0.35); ctx.beginPath(); ctx.ellipse(-SW - 1.2, sho + h * 0.2, 1.6, 2.2, 0, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.ellipse(SW + 1.2, sho + h * 0.2, 1.6, 2.2, 0, 0, 6.3); ctx.fill(); }
      } else {
        // an open jacket over a pale shirt
        ctx.fillStyle = '#eceae2'; ctx.beginPath(); ctx.moveTo(-w * 0.12, sho - 0.4); ctx.lineTo(w * 0.12, sho - 0.4); ctx.lineTo(w * 0.07, waist - 1); ctx.lineTo(-w * 0.07, waist - 1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = shade(st.top, -0.35); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-w * 0.13, sho - 0.4); ctx.lineTo(-w * 0.08, waist - 1); ctx.moveTo(w * 0.13, sho - 0.4); ctx.lineTo(w * 0.08, waist - 1); ctx.stroke();
        if (st.tie) { ctx.fillStyle = st.tie; ctx.beginPath(); ctx.moveTo(-1, sho); ctx.lineTo(1, sho); ctx.lineTo(1.4, sho + 2); ctx.lineTo(1.9, waist - 3); ctx.lineTo(0, waist - 1.2); ctx.lineTo(-1.9, waist - 3); ctx.lineTo(-1.4, sho + 2); ctx.closePath(); ctx.fill(); }
        if (st.lanyard) { ctx.strokeStyle = st.lanyard; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-w * 0.12, sho - 0.4); ctx.lineTo(0, waist - 3); ctx.lineTo(w * 0.12, sho - 0.4); ctx.stroke(); ctx.fillStyle = '#f4f4f4'; rr(-1.8, waist - 4, 3.6, 4.2, 0.6); ctx.fill(); line(0.35); }
        if (st.bag) { ctx.fillStyle = st.bag; ctx.fillRect(-SW * 0.62, sho, 1.8, waist - sho - 1); ctx.fillRect(SW * 0.62 - 1.8, sho, 1.8, waist - sho - 1); }
      }
    }

    // arms: shoulder, elbow, hand. They swing against the legs; a talker gestures; the runner holds a mug.
    [-1, 1].forEach((side, i) => {
      const swing = o.moving ? (i ? sw : -sw) : 0;
      const S = [side * SW * 0.93, sho + 2.2];
      let H = [side * (SW + 1.1) + swing * 0.0, sho + h * 0.29 - swing * h * 0.07];
      let E = [side * (SW + 1.7), sho + h * 0.15 - swing * h * 0.025];
      if (o.mug && side === 1) { H = [side * (SW + 3.6), sho + h * 0.2]; E = [side * (SW + 2.8), sho + h * 0.13]; }
      if (o.talk && side === 1) { const wv = Math.sin(simT * 7 + seed) * 2; H = [side * (SW + 4.5), sho + h * 0.1 + wv]; E = [side * (SW + 3), sho + h * 0.15]; }
      if (!dark) { limb(S[0], S[1], E[0], E[1], w * 0.22 + 0.9, OUT); limb(E[0], E[1], H[0], H[1], w * 0.2 + 0.9, OUT); }
      limb(S[0], S[1], E[0], E[1], w * 0.22, C(shade(st.top, side < 0 ? 0.04 : -0.16)));
      limb(E[0], E[1], H[0], H[1], w * 0.2, C(shade(st.top, side < 0 ? 0.04 : -0.16)));
      ctx.fillStyle = C(st.skin); ctx.beginPath(); ctx.arc(H[0], H[1] + 0.5, w * 0.1, 0, 6.3); ctx.fill();
      if (o.mug && side === 1) {
        ctx.fillStyle = C('#f7f3e8'); rr(H[0] - 2, H[1] - 4.8, 4, 5, 0.9); ctx.fill(); line(0.35);
        ctx.fillStyle = C('#7a4a24'); ctx.fillRect(H[0] - 1.6, H[1] - 4.3, 3.2, 1.1);
        if (!dark) { ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.6; for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(H[0] - 0.8 + k * 1.8, H[1] - 6); ctx.quadraticCurveTo(H[0] - 2 + k * 1.8 + Math.sin(simT * 4 + k) * 0.9, H[1] - 8.5, H[0] - 0.8 + k * 1.8, H[1] - 11); ctx.stroke(); } }
      }
      if (o.talk && side === 1 && st.phone && !dark) { ctx.fillStyle = '#1b1b20'; rr(H[0] - 1.2, H[1] - 3.6, 2.6, 4.4, 0.5); ctx.fill(); ctx.fillStyle = '#6ec2ff'; ctx.fillRect(H[0] - 0.8, H[1] - 3.1, 1.8, 3.2); }
    });

    // neck
    ctx.fillStyle = C(shade(st.skin, -0.14)); ctx.fillRect(-w * 0.1, neckY - 1, w * 0.2, (sho - neckY) + 2);

    // head
    const hg = ctx.createRadialGradient(-headR * 0.35, headY - headR * 0.35, headR * 0.15, 0, headY, headR * 1.3);
    hg.addColorStop(0, shade(st.skin, 0.14)); hg.addColorStop(0.7, st.skin); hg.addColorStop(1, shade(st.skin, -0.2));
    // ears
    ctx.fillStyle = C(shade(st.skin, -0.06));
    ctx.beginPath(); ctx.ellipse(-headR * 1.0, headY + headR * 0.1, headR * 0.2, headR * 0.28, 0, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headR * 1.0, headY + headR * 0.1, headR * 0.2, headR * 0.28, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = dark ? '#07080b' : hg; ctx.beginPath(); ctx.ellipse(0, headY, headR * 0.98, headR * 1.06, 0, 0, 6.3); ctx.fill(); line(0.5);

    // hair
    const hc = C(st.hair), hl = dark ? '#07080b' : shade(st.hair, 0.28);
    ctx.fillStyle = hc;
    if (back) {
      ctx.beginPath(); ctx.ellipse(0, headY - headR * 0.04, headR * 1.04, headR * 1.08, 0, 0, 6.3); ctx.fill();
    } else if (hs !== 'bald') {
      ctx.beginPath();
      ctx.moveTo(-headR * 1.02, headY + headR * 0.1);
      ctx.bezierCurveTo(-headR * 1.12, headY - headR * 1.2, headR * 1.12, headY - headR * 1.2, headR * 1.02, headY + headR * 0.1);
      ctx.quadraticCurveTo(headR * 0.85, headY - headR * 0.42, 0, headY - headR * 0.6);                       // the fringe
      ctx.quadraticCurveTo(-headR * 0.85, headY - headR * 0.42, -headR * 1.02, headY + headR * 0.1);
      ctx.closePath(); ctx.fill();
      if (hs === 'long') { ctx.fillRect(-headR * 1.04, headY - headR * 0.1, headR * 0.3, headR * 1.5); ctx.fillRect(headR * 0.74, headY - headR * 0.1, headR * 0.3, headR * 1.5); }
    } else {
      ctx.beginPath(); ctx.ellipse(-headR * 0.98, headY + headR * 0.0, headR * 0.16, headR * 0.34, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.ellipse(headR * 0.98, headY + headR * 0.0, headR * 0.16, headR * 0.34, 0, 0, 6.3); ctx.fill();
    }
    if (hs === 'bun') { ctx.fillStyle = hc; ctx.beginPath(); ctx.arc(0, headY - headR * 1.2, headR * 0.5, 0, 6.3); ctx.fill(); }
    if (hs === 'curly') { ctx.fillStyle = hc; for (let k = 0; k < 7; k++) { const a = Math.PI * (1.0 + k / 6); ctx.beginPath(); ctx.arc(Math.cos(a) * headR * 1.05, headY - headR * 0.1 + Math.sin(a) * headR * 1.08, headR * 0.34, 0, 6.3); ctx.fill(); } }
    if (!dark && hs !== 'bald') { ctx.strokeStyle = hl; ctx.globalAlpha = 0.5; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(-headR * 0.1, headY - headR * 0.15, headR * 0.86, Math.PI * 1.15, Math.PI * 1.6); ctx.stroke(); ctx.globalAlpha = 1; }

    // face
    if (!back && !dark) {
      const ey = headY + headR * 0.08;
      ctx.fillStyle = '#fbfaf6'; ctx.beginPath(); ctx.ellipse(-headR * 0.4, ey, headR * 0.23, headR * 0.17, 0, 0, 6.3); ctx.ellipse(headR * 0.4, ey, headR * 0.23, headR * 0.17, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#2a2522'; ctx.beginPath(); ctx.arc(-headR * 0.4, ey + 0.1, headR * 0.115, 0, 6.3); ctx.arc(headR * 0.4, ey + 0.1, headR * 0.115, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(-headR * 0.43, ey - 0.25, 0.45, 0.45); ctx.fillRect(headR * 0.37, ey - 0.25, 0.45, 0.45);
      ctx.strokeStyle = shade(st.hair, -0.2); ctx.lineWidth = 0.55; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-headR * 0.66, ey - headR * 0.3); ctx.quadraticCurveTo(-headR * 0.4, ey - headR * 0.44, -headR * 0.16, ey - headR * 0.3); ctx.moveTo(headR * 0.16, ey - headR * 0.3); ctx.quadraticCurveTo(headR * 0.4, ey - headR * 0.44, headR * 0.66, ey - headR * 0.3); ctx.stroke();
      ctx.strokeStyle = shade(st.skin, -0.28); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(0, ey + headR * 0.08); ctx.quadraticCurveTo(headR * 0.14, ey + headR * 0.4, -headR * 0.02, ey + headR * 0.44); ctx.stroke();      // the nose
      ctx.fillStyle = 'rgba(230,110,110,0.2)'; ctx.beginPath(); ctx.ellipse(-headR * 0.6, ey + headR * 0.42, headR * 0.2, headR * 0.12, 0, 0, 6.3); ctx.ellipse(headR * 0.6, ey + headR * 0.42, headR * 0.2, headR * 0.12, 0, 0, 6.3); ctx.fill();
      if (o.talk) { ctx.fillStyle = '#6a2c2c'; ctx.beginPath(); ctx.ellipse(0, ey + headR * 0.72, headR * 0.2, headR * (0.07 + Math.abs(Math.sin(simT * 9 + seed)) * 0.15), 0, 0, 6.3); ctx.fill(); }
      else { ctx.strokeStyle = '#7a3a34'; ctx.lineWidth = 0.55; ctx.beginPath(); ctx.moveTo(-headR * 0.2, ey + headR * 0.68); ctx.quadraticCurveTo(0, ey + headR * 0.82, headR * 0.2, ey + headR * 0.68); ctx.stroke(); }
      if (st.glasses) { ctx.strokeStyle = 'rgba(30,28,40,0.9)'; ctx.lineWidth = 0.55; ctx.beginPath(); ctx.arc(-headR * 0.4, ey, headR * 0.34, 0, 6.3); ctx.moveTo(headR * 0.74, ey); ctx.arc(headR * 0.4, ey, headR * 0.34, 0, 6.3); ctx.moveTo(-headR * 0.06, ey); ctx.lineTo(headR * 0.06, ey); ctx.stroke(); }
    }
    ctx.restore();
  }

  function billboard(x, y, z, fn, reflect) {
    const p = pj(x, y, z);
    ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(p[2], p[2]);
    fn();
    if (reflect) {
      ctx.save(); ctx.scale(1, -0.55); ctx.globalAlpha *= 0.13; fn(); ctx.restore();
    }
    ctx.restore();
    // a soft contact shadow, after so it sits under the feet
    return p;
  }
  function softShadow(x, z, w, a) {
    const p = pj(x, 0, z);
    ctx.fillStyle = 'rgba(0,0,0,' + a + ')';
    ctx.beginPath(); ctx.ellipse(p[0], p[1] + 0.5, w * p[2], w * 0.28 * p[2], 0, 0, 6.3); ctx.fill();
  }

  function fade(z) { return clamp((ZF - z) / 90, 0, 1); }

  /* A door in the wall. It swings open into the corridor, with a warm room behind it. */
  function drawDoor(side, z, o, dummy) {
    const th = S.lvl.theme, t = clamp(z / ZF, 0, 1);
    const x = side * (HW - 0.3);
    const open = !dummy && o.state >= 1 ? ease(clamp(o.t / OPEN_T, 0, 1)) : 0;
    face(mix(shade(th.wain, 0.3), th.fog, t), [[x, 0, z - 1.4], [x, 53, z - 1.4], [x, 53, z + 15.4], [x, 0, z + 15.4]]);       // frame
    if (open > 0) {
      face('#0b0e13', [[x, 0, z], [x, 51, z], [x, 51, z + 14], [x, 0, z + 14]]);
      face('rgba(255,226,160,' + (0.5 * open) + ')', [[x, 0, z + 1], [x, 49, z + 1], [x, 49, z + 13], [x, 0, z + 13]]);
      face('rgba(255,240,200,' + (0.25 * open) + ')', [[x, 0, z + 3], [x, 45, z + 3], [x, 45, z + 8], [x, 0, z + 8]]);
      // the leaf, hinged on its near edge, swinging out into the corridor
      const a = open * 1.7, dx = -side * 14 * Math.sin(a), dz = 14 * Math.cos(a);
      face(mix(th.door, th.fog, t), [[x, 0, z], [x, 51, z], [x + dx, 51, z + dz], [x + dx, 0, z + dz]]);
      face('rgba(0,0,0,0.18)', [[x + dx * 0.9, 0, z + dz * 0.9], [x + dx * 0.9, 51, z + dz * 0.9], [x + dx, 51, z + dz], [x + dx, 0, z + dz]]);
    } else {
      face(mix(th.door, th.fog, t), [[x, 0, z], [x, 51, z], [x, 51, z + 14], [x, 0, z + 14]]);
      face('rgba(255,255,255,0.08)', [[x, 4, z + 1.5], [x, 24, z + 1.5], [x, 24, z + 12.5], [x, 4, z + 12.5]]);
      face('rgba(255,255,255,0.08)', [[x, 28, z + 1.5], [x, 47, z + 1.5], [x, 47, z + 12.5], [x, 28, z + 12.5]]);
      face('#d9bd62', [[x, 24, z + 2], [x, 26, z + 2], [x, 26, z + 4], [x, 24, z + 4]]);
      face('#e8e2d0', [[x, 52.5, z + 3], [x, 56.5, z + 3], [x, 56.5, z + 11], [x, 52.5, z + 11]]);                                  // nameplate
      if (dummy && o && o.exit) {
        face('#12602d', [[x, 58, z + 2], [x, 66, z + 2], [x, 66, z + 12], [x, 58, z + 12]]);
        face('#7dffa0', [[x, 59.4, z + 3.4], [x, 64.6, z + 3.4], [x, 64.6, z + 10.6], [x, 59.4, z + 10.6]]);
        const c = pj(x, 62, z + 7); glow(c[0], c[1], 16 * c[2] + 3, 12 * c[2] + 3, '110,255,160', 0.4 * (1 - t));
      }
    }
  }

  /* things on the walls: windows, notice boards, pictures */
  function drawWallThing(d, z) {
    const th = S.lvl.theme, t = clamp(z / ZF, 0, 1), x = d.side * (HW - 0.2);
    if (d.kind === 'window') {
      face(mix(shade(th.wain, 0.2), th.fog, t), [[x, 22, z - 1], [x, 60, z - 1], [x, 60, z + 21], [x, 22, z + 21]]);
      const a = pj(x, 60, z), b = pj(x, 24, z + 20);
      const g = ctx.createLinearGradient(0, a[1], 0, b[1]);
      g.addColorStop(0, mix('#bfe0ff', th.fog, t * 0.5)); g.addColorStop(1, mix('#fff3d6', th.fog, t * 0.5));
      poly(g, [pj(x, 58, z + 1), pj(x, 58, z + 19), pj(x, 24, z + 19), pj(x, 24, z + 1)]);
      face(mix(shade(th.wain, 0.2), th.fog, t), [[x, 40, z + 1], [x, 41.4, z + 1], [x, 41.4, z + 19], [x, 40, z + 19]]);
      face(mix(shade(th.wain, 0.2), th.fog, t), [[x, 24, z + 9.4], [x, 58, z + 9.4], [x, 58, z + 10.6], [x, 24, z + 10.6]]);
      const c = pj(x, 42, z + 10);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(c[0], c[1], 26 * c[2] + 4, 26 * c[2] + 4, th.sun, 0.2 * (1 - t));
      ctx.restore();
    } else if (d.kind === 'board') {
      face(mix('#6b4c2e', th.fog, t), [[x, 26, z], [x, 52, z], [x, 52, z + 20], [x, 26, z + 20]]);
      face(mix('#c9b27c', th.fog, t), [[x, 27.5, z + 1.2], [x, 50.5, z + 1.2], [x, 50.5, z + 18.8], [x, 27.5, z + 18.8]]);
      face(mix('#ffffff', th.fog, t), [[x, 40, z + 3], [x, 49, z + 3], [x, 49, z + 8], [x, 40, z + 8]]);
      face(mix('#f5e089', th.fog, t), [[x, 31, z + 9], [x, 38, z + 9], [x, 38, z + 14], [x, 31, z + 14]]);
      face(mix('#e8a6a6', th.fog, t), [[x, 41, z + 11], [x, 48, z + 11], [x, 48, z + 17], [x, 41, z + 17]]);
    } else if (d.kind === 'alarm') {
      face(mix('#7a1d16', th.fog, t), [[x, 33, z + 2], [x, 41, z + 2], [x, 41, z + 8], [x, 33, z + 8]]);
      face(mix('#e5483c', th.fog, t), [[x, 35, z + 3], [x, 39, z + 3], [x, 39, z + 7], [x, 35, z + 7]]);
      const c = pj(x, 37, z + 5); glow(c[0], c[1], 6 * c[2] + 2, 6 * c[2] + 2, '255,70,50', 0.28 * (1 - t));
    } else if (d.kind === 'picture') {
      face(mix('#2a2a2a', th.fog, t), [[x, 28, z], [x, 48, z], [x, 48, z + 14], [x, 28, z + 14]]);
      face(mix(d.v === 0 ? '#c0704a' : d.v === 1 ? '#4a7ec0' : '#6aa86a', th.fog, t), [[x, 29.5, z + 1.3], [x, 46.5, z + 1.3], [x, 46.5, z + 12.7], [x, 29.5, z + 12.7]]);
      face(mix('#f2e3b6', th.fog, t), [[x, 29.5, z + 1.3], [x, 36, z + 1.3], [x, 36, z + 12.7], [x, 29.5, z + 12.7]]);
    }
  }

  /* A sign hanging over the corridor, lit from inside. */
  const SIGNS = [['COFFEE  ▲', '255,200,120', '#3a2a14'], ['EXIT', '120,255,160', '#0f3a1c'], ['ROOM B12  ◀', '200,220,255', '#14233a'], ['LIFT  ▶', '200,220,255', '#14233a'], ['STAFF ONLY', '255,160,150', '#3a1612'], ['LECTURE HALL  ▲', '200,220,255', '#14233a']];
  function drawSign(d, z) {
    const sg = SIGNS[d.v % SIGNS.length], a = fade(z);
    ctx.globalAlpha = a;
    billboard(0, WALLH - 16, z, () => {
      ctx.strokeStyle = 'rgba(40,40,40,0.8)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-14, -7); ctx.lineTo(-14, -16); ctx.moveTo(14, -7); ctx.lineTo(14, -16); ctx.stroke();
      glow(0, 0, 40, 18, sg[1], 0.34);
      ctx.fillStyle = '#1b1b1f'; rr(-21, -7, 42, 14, 2.5); ctx.fill();
      ctx.fillStyle = sg[2]; rr(-19.6, -5.8, 39.2, 11.6, 2); ctx.fill();
      ctx.fillStyle = 'rgb(' + sg[1] + ')'; ctx.font = 'bold 5.4px Sora, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(sg[0], 0, 1.9);
    }, false);
    ctx.globalAlpha = 1;
  }

  /* A bench against the wall. */
  function drawBench(d, z) {
    const s = d.side, x0 = s < 0 ? -(HW - 1) : HW - 15, x1 = s < 0 ? -(HW - 15) : HW - 1;
    softShadow(s * (HW - 8), z + 14, 12, 0.22);
    cuboid(Math.min(x0, x1), Math.max(x0, x1), 0, 6, z, z + 28, '#5a4630', '#8a6a46', '#3f3020');
    cuboid(Math.min(x0, x1), Math.max(x0, x1), 6, 9, z, z + 28, '#2f4f7a', '#4a73ad', '#22385a');
  }

  function drawCoin(it) {
    const bob = Math.sin(simT * 4 + it.ph) * 1.2;
    billboard(it.x, it.y + bob, it.oz - RD + PZ, () => {
      if (it.type === 'o') {
        const sq = Math.abs(Math.cos(simT * 3 + it.ph));                // the coin turns
        ctx.save(); ctx.scale(0.35 + 0.65 * sq, 1);
        const g = ctx.createRadialGradient(-1.2, -6, 0.5, 0, -4.5, 5.5); g.addColorStop(0, '#fff2a8'); g.addColorStop(1, '#d9a21b');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -4.5, 4.6, 0, 6.3); ctx.fill();
        ctx.strokeStyle = '#a9780f'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(0, -4.5, 3, 0, 6.3); ctx.stroke();
        ctx.restore();
        glow(0, -4.5, 9, 9, '255,220,120', 0.28);
      } else if (it.type === 'b') {
        const g = ctx.createRadialGradient(-2, -8, 1, 0, -6, 7); g.addColorStop(0, '#f0b878'); g.addColorStop(1, '#b97b36');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -6, 6, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#5a3416'; [[-2, -8], [1.5, -4], [-1, -3], [2.5, -8]].forEach((p) => { ctx.beginPath(); ctx.arc(p[0], p[1], 0.7, 0, 6.3); ctx.fill(); });
        glow(0, -6, 11, 11, '255,200,140', 0.25);
      } else if (it.type === 'H') {
        ctx.strokeStyle = '#222'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(0, -8, 6, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = '#3aa0ff'; rr(-8, -8, 3.6, 6.5, 1.4); ctx.fill(); rr(4.4, -8, 3.6, 6.5, 1.4); ctx.fill();
        glow(0, -8, 12, 12, '90,170,255', 0.3);
      } else if (it.type === 'C') {
        ctx.fillStyle = '#f7f3e8'; rr(-5, -9.5, 10, 9.5, 1.5); ctx.fill();
        ctx.fillStyle = '#7a4a24'; ctx.fillRect(-4, -8.5, 8, 2.2); ctx.fillStyle = '#f7f3e8'; rr(4.4, -7.5, 3, 5, 1.4); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.9;
        for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-1.5 + i * 3.4, -11); ctx.quadraticCurveTo(-3 + i * 3.4 + Math.sin(simT * 3 + i) * 1.4, -14, -1.5 + i * 3.4, -17); ctx.stroke(); }
        glow(0, -8, 13, 13, '255,210,140', 0.3);
      }
    });
  }

  function drawGoal(L) {
    const z = L.len - RD + PZ;
    if (z > ZF) return;
    const broken = L.cfg.name.indexOf('basement') >= 0;
    billboard(0, 0, z, () => {
      glow(0, -34, 60, 60, broken ? '255,110,90' : '255,214,140', 0.4 + Math.sin(simT * 3) * 0.04);
      const g = ctx.createLinearGradient(-22, 0, 22, 0); g.addColorStop(0, '#3b3f47'); g.addColorStop(0.5, '#555b66'); g.addColorStop(1, '#2f333a');
      ctx.fillStyle = '#1f2227'; rr(-24, -68, 48, 68, 3); ctx.fill();
      ctx.fillStyle = g; rr(-22, -66, 44, 62, 2); ctx.fill();
      ctx.fillStyle = '#0d2417'; rr(-17, -61, 34, 13, 1.5); ctx.fill();
      ctx.fillStyle = broken ? '#ff6b5a' : '#7dff9c'; ctx.font = 'bold 6px Sora, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(broken ? 'OUT OF ORDER' : 'COFFEE', 0, -52);
      ctx.fillStyle = '#16181c'; rr(-13, -44, 26, 26, 2); ctx.fill();
      ctx.fillStyle = '#f7f3e8'; rr(-7, -30, 14, 11, 1.5); ctx.fill(); ctx.fillStyle = '#7a4a24'; ctx.fillRect(-6, -31, 12, 3);
      ctx.fillStyle = '#d33'; ctx.beginPath(); ctx.arc(16, -46, 2, 0, 6.3); ctx.fill(); ctx.fillStyle = '#3c6'; ctx.beginPath(); ctx.arc(16, -39, 2, 0, 6.3); ctx.fill();
    });
  }

  function drawPlayer(hv, xv) {
    if (P.invuln > 0 && Math.floor(simT * 14) % 2 === 0 && S.mode === 'play') return;
    const st = { hair: '#dcdce0', hs: 'curly', skin: '#e8b98f', top: '#7b4c2a', pants: '#3a4a6b', shoes: '#2a2118', patches: true };
    const p = pj(xv, hv, PZ);
    softShadow(xv, PZ, 8 * (1 - clamp(hv / 90, 0, 0.7)), 0.34 * (1 - clamp(hv / 90, 0, 0.7)));
    if (P.phones > 0) glow(p[0], p[1] - 28 * p[2], 30, 30, '110,190,255', 0.22 + Math.sin(simT * 8) * 0.04);
    ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(p[2], p[2]);
    // stretch going up, squash on landing, down low in a slide, leaning into a lane change
    const air = clamp(hv / 20, 0, 1), up = P.vy > 0 ? 1 : 0;
    let sy = 1 + air * 0.06 * (up ? 1 : -0.4) - P.land * 0.9, sx = 1 - air * 0.04 + P.land * 0.7;
    sy *= 1 - P.crouch * 0.52; sx *= 1 + P.crouch * 0.2;
    ctx.rotate(P.lean * 0.12);
    ctx.scale(sx, sy);
    figure(st, 13, PH, P.step, { back: true, moving: hv < 1, mug: true, seed: 1 });
    if (P.phones > 0) {
      ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -PH * 0.885, 6.1, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#3aa0ff'; rr(-7.6, -PH * 0.885 - 1, 2.8, 5, 1.2); ctx.fill(); rr(4.8, -PH * 0.885 - 1, 2.8, 5, 1.2); ctx.fill();
    }
    ctx.restore();
    // its reflection on the polished floor
    ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(p[2], -p[2] * 0.5); ctx.globalAlpha = 0.12;
    figure(st, 13, PH, P.step, { back: true, moving: hv < 1 });
    ctx.restore();
  }

  /* A speech bubble in screen space, so it stays readable however far away they are. */
  function bubble(x, y, text, a, placed) {
    ctx.font = '600 7.2px Sora, sans-serif';
    const maxW = 104;
    const words = text.split(' '), lines = [];
    let line = '';
    words.forEach((w) => {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    lines.push(line);
    const w = Math.max.apply(null, lines.map((l) => ctx.measureText(l).width)) + 10, h = lines.length * 8.2 + 5;
    const bx = clamp(x - w / 2, 3, VW - w - 3);
    let by = clamp(y - h - 6, 24, VH - h - 44);
    // two people talking at once: the second bubble goes above the first rather than over it
    if (placed) {
      for (let tries = 0; tries < 4 && placed.some((r) => bx < r.x + r.w + 2 && bx + w + 2 > r.x && by < r.y + r.h + 2 && by + h + 2 > r.y); tries++) by = Math.max(24, by - (h + 4));
      placed.push({ x: bx, y: by, w: w, h: h });
    }
    const tx = clamp(x, bx + 6, bx + w - 6);
    ctx.save(); ctx.globalAlpha = a == null ? 1 : a;
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 1.5;
    ctx.fillStyle = '#fffdf6'; rr(bx, by, w, h, 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - 3.5, by + h - 0.5); ctx.lineTo(tx, by + h + 4.5); ctx.lineTo(tx + 3.5, by + h - 0.5); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#23242c'; ctx.textAlign = 'center';
    lines.forEach((l, i) => ctx.fillText(l, bx + w / 2, by + 8 + i * 8.2));
    ctx.restore();
  }

  /* ── particles, in screen space ── */

  function burst(x, y, n, color, speed, up) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.3, s = speed * (0.4 + Math.random() * 0.8);
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (up || 0), t: 0, ttl: 0.4 + Math.random() * 0.4, r: 1 + Math.random() * 1.6, c: color });
    }
  }
  function drawParticles() {
    parts.forEach((p) => {
      const k = 1 - p.t / p.ttl;
      ctx.globalAlpha = clamp(k, 0, 1) * 0.9; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.5 + k * 0.7), 0, 6.3); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  let motes = null, grain = null;
  function drawMotes(th) {
    if (!motes) motes = Array.from({ length: 80 }, () => ({ x: (Math.random() - 0.5) * HW * 1.8, y: 6 + Math.random() * 62, off: Math.random() * ZF, ph: Math.random() * 6, s: Math.random() }));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    motes.forEach((m) => {
      const z = (((m.off - RD * 0.9 + simT * 3 * m.s) % ZF) + ZF) % ZF + ZN + 8;
      const p = pj(m.x + Math.sin(simT * 0.6 + m.ph) * 3, m.y + Math.cos(simT * 0.5 + m.ph) * 2, z);
      const a = clamp(1 - z / ZF, 0, 1) * 0.55 * (0.35 + 0.65 * Math.abs(Math.sin(simT * 1.3 + m.ph)));
      ctx.fillStyle = 'rgba(' + th.glow + ',' + a + ')';
      ctx.beginPath(); ctx.arc(p[0], p[1], 0.3 + p[2] * 0.8, 0, 6.3); ctx.fill();
    });
    ctx.restore();
  }
  function speedLines(frac) {
    if (frac < 0.25) return;
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,' + (0.06 + frac * 0.1) + ')'; ctx.lineWidth = 0.8;
    const t = Math.floor(simT * 24);
    for (let i = 0; i < 16; i++) {
      const h = Math.sin((i + 1) * 12.9898 + t * 78.233) * 43758.5453, r = h - Math.floor(h);
      const a = r * 6.2832, r0 = 90 + r * 40, r1 = r0 + 24 + frac * 40;
      ctx.beginPath(); ctx.moveTo(VPX + Math.cos(a) * r0 * 1.2, VPY + 40 + Math.sin(a) * r0 * 0.9); ctx.lineTo(VPX + Math.cos(a) * r1 * 1.2, VPY + 40 + Math.sin(a) * r1 * 0.9); ctx.stroke();
    }
    ctx.restore();
  }

  function render(acc) {
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.textBaseline = 'alphabetic';
    if (!S.lvl || !P) { ctx.fillStyle = '#10161e'; ctx.fillRect(0, 0, VW, VH); return; }
    const L = S.lvl, th = L.theme;
    const playing = S.mode === 'play';
    // between physics steps, carry everything on a little further, so it is smooth at any refresh rate
    const a = playing ? acc : 0;
    RD = D + lastV * a;
    const hv = Math.max(0, P.h + P.vy * a), xv = P.x + P.vx * a;
    const cx = CAMX + camVx * a;
    const saveCX = CAMX; CAMX = cx;

    ctx.save();
    ctx.translate(VPX, VPY + 40); ctx.rotate(roll); ctx.scale(1.035, 1.035); ctx.translate(-VPX, -(VPY + 40));
    ctx.translate((Math.random() - 0.5) * shake * 4, (Math.random() - 0.5) * shake * 4);

    drawCorridor(L, th);
    drawFloorThings(L, th);

    // everything standing in the corridor, farthest first, with the runner among them
    const list = [];
    L.dummies.forEach((d) => { const z = d.oz - RD + PZ; if (z < ZF && z > ZN - 16) list.push({ z: z + 14, f: () => drawDoor(d.side, z, d, true) }); });
    L.decor.forEach((d) => { const z = d.oz - RD + PZ; if (z < ZF && z > ZN - 24) {
      if (d.kind === 'sign') list.push({ z: z, f: () => drawSign(d, z) });
      else if (d.kind === 'bench') list.push({ z: z + 14, f: () => drawBench(d, z) });
      else if (d.kind === 'plant' || d.kind === 'ext') list.push({ z: z, f: () => { const x = d.side * (HW - (d.kind === 'plant' ? 8 : 3)); softShadow(x, z, 7, 0.25); billboard(x, 0, z, () => drawProp(d.kind), false); } });
      else list.push({ z: z + 10, f: () => drawWallThing(d, z) });
    } });
    ob.forEach((o) => {
      const z = o.oz - RD + PZ;
      if (z > ZF || z < ZN - 30) return;
      const al = fade(z);
      if (o.k === 'door') {
        list.push({ z: z + 14, f: () => drawDoor(o.side, z, o, false) });
        if (o.state === 1 && o.who) list.push({ z: z + 6, f: () => { const pp = PEOPLE[o.who]; ctx.globalAlpha = 0.95; billboard(o.side * (HW - 9), 0, z + 7, () => figure(pp.style, pp.w > 20 ? 18 : pp.w, pp.h, 0, { dark: true }), false); ctx.globalAlpha = 1; } });
      } else if (o.k === 'person') {
        const pp = PEOPLE[o.who];
        const moving = !o.still && Math.abs(o.tx - o.x) > 1;
        list.push({ z: z, f: () => {
          ctx.globalAlpha = al; softShadow(o.x, z, pp.w > 20 ? 20 : 7, 0.28);
          if (o.who === 'd') {
            billboard(o.x - 9, 0, z, () => figure(o.look || pp.style, 22, pp.h, o.step, { moving: moving, talk: o.sayT > 0, seed: 3 }), true);
            billboard(o.x + 13, 0, z, () => figure(o.aide || (o.aide = variant(PEOPLE.a.style, { skirt: true })), 14, 34, o.step + 1, { moving: moving, seed: 5 }), true);
          } else {
            billboard(o.x, 0, z, () => figure(o.look || pp.style, pp.w, pp.h, o.step, { moving: moving, talk: o.sayT > 0, seed: o.oz % 7 }), true);
          }
          ctx.globalAlpha = 1; } });
      } else if (o.k === 'block') {
        const sz = BLOCKS[o.type];
        list.push({ z: z, f: () => { ctx.globalAlpha = al; softShadow(o.x, z + sz.d / 2, sz.w * 0.62, 0.24); cuboid(o.x - sz.w / 2, o.x + sz.w / 2, 0, sz.h, z, z + sz.d, sz.front, sz.top, sz.side);
          if (o.type === 'box') { face('#e6d3a0', [[o.x - 2, sz.h, z], [o.x + 2, sz.h, z], [o.x + 2, 0, z], [o.x - 2, 0, z]]); face('#e6d3a0', [[o.x - 2, sz.h, z], [o.x + 2, sz.h, z], [o.x + 2, sz.h, z + sz.d], [o.x - 2, sz.h, z + sz.d]]); }
          if (o.type === 'stack') for (let r = 1; r < 4; r++) face('rgba(0,0,0,0.18)', [[o.x - sz.w / 2, r * 9.5, z - 0.05], [o.x + sz.w / 2, r * 9.5, z - 0.05], [o.x + sz.w / 2, r * 9.5 - 0.6, z - 0.05], [o.x - sz.w / 2, r * 9.5 - 0.6, z - 0.05]]);
          ctx.globalAlpha = 1; } });
      } else if (o.k === 'over') {
        // You slide under this, so you must be able to see through it: two striped rails and a
        // faint tinted mesh between them, and the corridor shows through.
        list.push({ z: z, f: () => { ctx.globalAlpha = al;
          [o.x0, o.x1 - 2].forEach((px) => face('#2a2a2a', [[px, WALLH, z + 3], [px + 2, WALLH, z + 3], [px + 2, 44, z + 3], [px, 44, z + 3]]));
          face('rgba(255,214,60,0.10)', [[o.x0, 44, z], [o.x1, 44, z], [o.x1, 19, z], [o.x0, 19, z]]);
          const n = Math.max(2, Math.round((o.x1 - o.x0) / 12)), w = (o.x1 - o.x0) / n;
          for (let i = 0; i <= n * 2; i++) { const xx = o.x0 + i * w / 2; face('rgba(255,214,60,0.22)', [[xx - 0.3, 44, z], [xx + 0.3, 44, z], [xx + 0.3, 19, z], [xx - 0.3, 19, z]]); }
          [[44, 52], [14, 19]].forEach((r) => {
            face('#f2c300', [[o.x0, r[1], z], [o.x1, r[1], z], [o.x1, r[0], z], [o.x0, r[0], z]]);
            for (let i = 0; i < n; i += 2) face('#1d1d1d', [[o.x0 + i * w, r[1], z - 0.1], [o.x0 + (i + 1) * w, r[1], z - 0.1], [o.x0 + (i + 1) * w, r[0], z - 0.1], [o.x0 + i * w, r[0], z - 0.1]]);
            face('rgba(255,255,255,0.28)', [[o.x0, r[1], z - 0.2], [o.x1, r[1], z - 0.2], [o.x1, r[1] - 1.2, z - 0.2], [o.x0, r[1] - 1.2, z - 0.2]]);
          });
          ctx.globalAlpha = 1; } });
      } else if (o.k === 'form') {
        list.push({ z: z - 2, f: () => { ctx.globalAlpha = al;
          const w = o.x1 - o.x0;
          // a translucent sheet with a frame: you can see the corridor through the paper
          face('rgba(255,253,246,0.34)', [[o.x0, 56, z], [o.x1, 56, z], [o.x1, 14, z], [o.x0, 14, z]]);
          [[56, 54.4], [15.6, 14]].forEach((r) => face('rgba(230,224,204,0.9)', [[o.x0, r[0], z - 0.05], [o.x1, r[0], z - 0.05], [o.x1, r[1], z - 0.05], [o.x0, r[1], z - 0.05]]));
          [o.x0, o.x1 - 1.4].forEach((xx) => face('rgba(230,224,204,0.9)', [[xx, 56, z - 0.05], [xx + 1.4, 56, z - 0.05], [xx + 1.4, 14, z - 0.05], [xx, 14, z - 0.05]]));
          for (let r = 0; r < 7; r++) face('rgba(70,68,60,0.55)', [[o.x0 + 4, 50 - r * 5, z - 0.1], [o.x1 - 4 - (r % 3) * w * 0.12, 50 - r * 5, z - 0.1], [o.x1 - 4 - (r % 3) * w * 0.12, 49.2 - r * 5, z - 0.1], [o.x0 + 4, 49.2 - r * 5, z - 0.1]]);
          face('rgba(196,58,46,0.85)', [[o.x0 + w * 0.5, 30, z - 0.1], [o.x0 + w * 0.5 + 12, 30, z - 0.1], [o.x0 + w * 0.5 + 12, 21, z - 0.1], [o.x0 + w * 0.5, 21, z - 0.1]]);
          ctx.globalAlpha = 1; } });
      } else if (o.k === 'email') {
        list.push({ z: z, f: () => billboard(o.x, o.high ? 14 : 0, z, () => {
          glow(0, -6, 16, 12, '255,255,255', 0.16);
          ctx.fillStyle = '#f9f9f9'; rr(-9, -12, 18, 12, 1.2); ctx.fill(); ctx.fillStyle = '#d4d4d4'; ctx.fillRect(-9, -12, 18, 1.2);
          ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-9, -12); ctx.lineTo(0, -5); ctx.lineTo(9, -12); ctx.stroke();
          ctx.fillStyle = '#e33'; ctx.beginPath(); ctx.arc(7, -14, 3.6, 0, 6.3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(6.4, -16.2, 1.2, 3);
        }, false) });
      }
    });
    items.forEach((it) => { if (it.got) return; const z = it.oz - RD + PZ; if (z < ZF && z > ZN - 10) list.push({ z: z, f: () => drawCoin(it) }); });
    if (L.len - RD + PZ < ZF) list.push({ z: L.len - RD + PZ, f: () => drawGoal(L) });
    list.push({ z: PZ, f: () => drawPlayer(hv, xv) });
    list.sort((p, q) => q.z - p.z);
    list.forEach((e) => e.f());

    drawMotes(th);
    speedLines(clamp((lastV - L.cfg.v0) / (L.cfg.v1 - L.cfg.v0 + 30) + 0.2, 0, 1));
    drawParticles();
    ctx.restore();
    CAMX = saveCX;

    // the soft dark at the edges, and a colour wash for each floor
    ctx.drawImage(vig, 0, 0, VW, VH);
    ctx.fillStyle = th.grade; ctx.fillRect(0, 0, VW, VH);
    { const gg = ctx.createLinearGradient(0, 0, 0, VH); gg.addColorStop(0, 'rgba(90,120,190,0.07)'); gg.addColorStop(0.5, 'rgba(0,0,0,0)'); gg.addColorStop(1, 'rgba(255,170,100,0.06)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, VW, VH); }
    if (grain) { ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07; ctx.drawImage(grain, (Math.random() * 40) | 0, (Math.random() * 30) | 0, 150, 112, 0, 0, VW, VH); ctx.restore(); }

    // speech bubbles, nearest two people
    const talkers = [];
    ob.forEach((o) => {
      const z = o.oz - RD + PZ;
      if (z > 400 || z < 30) return;
      if (o.k === 'person' && o.sayT > 0 && o.say) {
        const pp = PEOPLE[o.who], p = pj(o.x, pp.h, z);
        talkers.push({ z: z, x: p[0], y: p[1], t: o.say });
      } else if (o.k === 'door' && o.said > 0 && o.line) {
        const p = pj(o.side * (HW - 8), 52, z + 7);
        talkers.push({ z: z, x: p[0], y: p[1], t: o.line });
      }
    });
    talkers.sort((p, q) => p.z - q.z);
    const placed = [];
    talkers.slice(0, 2).forEach((t) => bubble(t.x, t.y, t.t, clamp((400 - t.z) / 60, 0, 1), placed));

    // floating text
    floats.forEach((f) => {
      const p = pj(f.x, f.y, PZ + 8);
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
      ctx.fillStyle = f.color; ctx.font = 'bold 7px Sora, sans-serif'; ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 3;
      ctx.fillText(f.text, clamp(p[0], 28, VW - 28), p[1] - 40 - ease(f.t / 1.1) * 22);
      ctx.shadowColor = 'transparent'; ctx.globalAlpha = 1;
    });

    // how far to the machine, along the bottom
    const frac = clamp(D / L.len, 0, 1), bx = 56, bw = VW - 112;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; rr(bx, VH - 10, bw, 4, 2); ctx.fill();
    const pg = ctx.createLinearGradient(bx, 0, bx + bw, 0); pg.addColorStop(0, '#e0a458'); pg.addColorStop(1, '#ffd48a');
    ctx.fillStyle = pg; rr(bx, VH - 10, Math.max(4, bw * frac), 4, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(bx + bw * (L.cp / L.len), VH - 12, 1, 8);
    ctx.fillStyle = '#f7f3e8'; rr(bx + bw + 5, VH - 13, 8, 8, 1.5); ctx.fill(); ctx.fillStyle = '#7a4a24'; ctx.fillRect(bx + bw + 6, VH - 12, 6, 2);

    if (S.streak >= 3) {
      ctx.fillStyle = '#ffe08a'; ctx.font = 'bold 8px Sora, sans-serif'; ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 3;
      ctx.fillText('Streak ' + S.streak + (S.streak >= 4 ? '  ×' + Math.min(4, 1 + Math.floor(S.streak / 4)) : ''), VW / 2, VH - 17);
      ctx.shadowColor = 'transparent';
    }
    if (toastT > 0) {
      ctx.globalAlpha = Math.min(1, toastT * 2);
      ctx.font = '600 7px Sora, sans-serif'; ctx.textAlign = 'center';
      const w = ctx.measureText(toastText).width + 16;
      ctx.fillStyle = 'rgba(10, 14, 19, 0.78)'; rr(VW / 2 - w / 2, 22, w, 16, 6); ctx.fill();
      ctx.fillStyle = '#f4efe0'; ctx.fillText(toastText, VW / 2, 33);
      ctx.globalAlpha = 1;
    }
    if (flash > 0) { ctx.fillStyle = 'rgba(210, 40, 30, ' + (flash * 0.5) + ')'; ctx.fillRect(0, 0, VW, VH); }
  }

  /* Plants and fire extinguishers stand against the wall. */
  function drawProp(kind) {
    if (kind === 'plant') {
      const g = ctx.createLinearGradient(-6, 0, 6, 0); g.addColorStop(0, '#b06a44'); g.addColorStop(1, '#7c452a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-5.5, -13); ctx.lineTo(5.5, -13); ctx.lineTo(4.2, 0); ctx.lineTo(-4.2, 0); ctx.closePath(); ctx.fill();
      [['#2f7a40', -7, -26, 9], ['#3f9a52', 2, -29, 10], ['#58b868', -3, -33, 8], ['#2f7a40', 7, -22, 7]].forEach((b) => { ctx.fillStyle = b[0]; ctx.beginPath(); ctx.ellipse(b[1], b[2], b[3] * 0.62, b[3], 0.3, 0, 6.3); ctx.fill(); });
    } else {
      ctx.fillStyle = '#c43a2e'; rr(-3.4, -22, 6.8, 20, 3); ctx.fill();
      ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-2.2, -26, 4.4, 4); ctx.fillStyle = '#e7e7e7'; ctx.fillRect(-3.4, -14, 6.8, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-2.6, -20, 1.4, 16);
    }
  }

  /* ─── HUD and loop ───────────────────────────────────────── */

  function updateHud() {
    elScore.textContent = S.score.toLocaleString();
    elCoins.textContent = S.coins;
    elDist.textContent = S.lvl && P ? Math.max(0, Math.ceil((S.lvl.len - D) / 14)) + ' m' : '–';
    [...elLives.querySelectorAll('i')].forEach((m, i) => m.classList.toggle('is-gone', i >= S.hearts));
  }
  setInterval(updateHud, 120);

  let lastTs = 0, acc = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    if (S.mode === 'play') { acc += dt; while (acc >= DT) { update(DT); acc -= DT; } }
    render(acc);
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
      '<p class="sheet-body">All you want is a coffee. The corridor is long, the doors are many, and behind some of them is somebody who wants a word.</p>' +
      '<ul class="sheet-rules">' +
        '<li>You run by yourself, and it gets faster. <b>Left and right</b> change lane, <b>jump</b> and <b>slide</b> (arrows or WASD, or the buttons; on a phone you can also swipe).</li>' +
        '<li>Get round people by changing lane. Jump over boxes, cables and holes; slide under banners, forms and emails.</li>' +
        '<li>A door cracks open and somebody steps out. They have a lot to say.</li>' +
        '<li>A hit costs <b>patience</b>: three and you are taken to a meeting. Every dodge scores, and a streak multiplies it. Find coffee and the headphones.</li>' +
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
    $('go-btn').addEventListener('click', () => { hide(); S.mode = 'play'; acc = 0; edges = { left: false, right: false, jump: false, slide: false }; });
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
    keys.left = keys.right = keys.jump = keys.slide = false;
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
    keys.left = keys.right = keys.jump = keys.slide = false;
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

  const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
                   ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump',
                   ArrowDown: 'slide', s: 'slide', S: 'slide', x: 'slide', X: 'slide' };
  function setKey(k, down) {
    if (down && !keys[k]) edges[k] = true;
    keys[k] = down;
    document.querySelectorAll('.key[data-key="' + k + '"]').forEach((b) => b.classList.toggle('is-down', down));
  }
  function tap(k) { edges[k] = true; }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { S.mode === 'play' ? pauseScreen() : resume(); return; }
    const k = KEYMAP[e.key];
    if (k) { e.preventDefault(); if (!e.repeat) setKey(k, true); }
  });
  document.addEventListener('keyup', (e) => { const k = KEYMAP[e.key]; if (k) setKey(k, false); });
  window.addEventListener('blur', () => { ['left', 'right', 'jump', 'slide'].forEach((k) => setKey(k, false)); });

  document.querySelectorAll('.key').forEach((b) => {
    const k = b.getAttribute('data-key');
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} SFX.unlock(); setKey(k, true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, () => setKey(k, false)));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  // Swiping on the corridor itself: sideways to change lane, up to jump, down to slide.
  let sw = null;
  cv.addEventListener('pointerdown', (e) => { sw = { x: e.clientX, y: e.clientY, done: false }; SFX.unlock(); });
  cv.addEventListener('pointermove', (e) => {
    if (!sw || sw.done) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    sw.done = true;
    if (Math.abs(dx) > Math.abs(dy)) tap(dx < 0 ? 'left' : 'right'); else tap(dy < 0 ? 'jump' : 'slide');
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => cv.addEventListener(ev, () => { sw = null; }));

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
