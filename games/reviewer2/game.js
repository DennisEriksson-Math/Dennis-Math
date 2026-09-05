/* ═══════════════════════════════════════════════════════════
   REVIEWER № 2 — a whack-a-mole about academic dread.
   Click the dread before it piles up. Collect the rare good
   news. Survive Reviewer 2.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── The dread pool ─────────────────────────────────────
     `form` picks the paper it arrives on:
       sticky   — handwritten note
       memo     — typed slip with a red margin
       email    — manila envelope with an unread badge
     ──────────────────────────────────────────────────────── */

  const DREAD = [
    /* ── Generic academic dread ── */
    { text: 'Major\nrevisions',                     form: 'memo'   },
    { text: 'Desk reject',                          form: 'memo'   },
    { text: 'Deadline is\ntomorrow',                form: 'sticky' },
    { text: 'Grant:\nnot funded',                   form: 'email'  },
    { text: "You've been\nscooped",                 form: 'email'  },
    { text: 'Can you review\nthis by Friday?',      form: 'email'  },
    { text: '"Quick chat?"\n— your advisor',        form: 'email'  },
    { text: 'Co-author has\nnot replied\nin six weeks', form: 'sticky' },
    { text: 'Reformat for\nanother journal',        form: 'memo'   },
    { text: 'Page charges:\n$3,400',                form: 'memo'   },
    { text: "Where's the\ndraft?",                  form: 'email'  },
    { text: 'Rebuttal\ndue Monday',                 form: 'sticky' },
    { text: 'Teaching load\ndoubled',               form: 'email'  },
    { text: '"Please cite\nmy paper"',              form: 'email'  },
    { text: 'Abstract\ndeadline\npassed',           form: 'sticky' },
    { text: 'Visa renewal',                         form: 'memo'   },
    { text: 'Nobody came\nto the seminar',          form: 'sticky' },
    { text: 'Reviewer 3\ndisagrees with\nReviewer 1', form: 'memo' },
    { text: 'Upload failed.\nTry again.',           form: 'memo'   },
    { text: 'Impostor\nsyndrome',                   form: 'sticky' },
    { text: 'h-index: 2',                           form: 'sticky' },
    { text: 'Funding ends\nin 3 months',            form: 'email'  },
    { text: 'Conflict of\ninterest form',           form: 'email'  },
    { text: 'Your ORCID\nis wrong',                 form: 'email'  },
    { text: 'Cite more of\nthe literature',         form: 'memo'   },
    { text: 'Annual review\nform due',              form: 'email'  },
    { text: 'Word limit:\nover by 2,400',           form: 'memo'   },

    /* ── Mathematics ── */
    { text: 'There is a gap\non page 17',           form: 'memo'   },
    { text: 'The proof of\nLemma 3.2\nis circular',  form: 'memo'   },
    { text: 'A counter-\nexample in\ndimension 4',   form: 'memo'   },
    { text: 'Sign error\nin (4.7)',                 form: 'sticky' },
    { text: 'Theorem 1\nis false',                  form: 'memo'   },
    { text: 'The induction\nstep fails',            form: 'memo'   },
    { text: 'Diagram does\nnot commute',            form: 'memo'   },
    { text: 'Does it hold\nin char p?',             form: 'email'  },
    { text: 'Why is this\nWLOG?',                   form: 'email'  },
    { text: '"By a routine\ncomputation"',          form: 'memo'   },
    { text: 'The constant\nis not\neffective',      form: 'memo'   },
    { text: '"Special case\nof a known\ntheorem"',  form: 'memo'   },
    { text: 'Already proved\nin 1974',              form: 'memo'   },
    { text: 'Numerical\nevidence only',             form: 'memo'   },
    { text: 'Erratum\nrequired',                    form: 'email'  },
    { text: 'Referee report\nis 40 pages',          form: 'email'  },
    { text: 'Overleaf\nis down',                    form: 'sticky' },
    { text: 'Undefined\ncontrol\nsequence',         form: 'memo'   },
    { text: 'Overfull \\hbox',                      form: 'sticky' },
    { text: 'arXiv:\non hold',                      form: 'sticky' },
    { text: 'Cross-listed\nto math.GM',             form: 'memo'   },
    { text: 'You are the\nseminar\nspeaker',        form: 'email'  },
    { text: 'Colloquium\ntalk in\nten minutes',     form: 'sticky' },
    { text: 'Out of\nHagoromo chalk',               form: 'sticky' },
    { text: 'Blackboard\nalready erased',           form: 'sticky' },
    { text: 'Off by one',                           form: 'sticky' }
  ];

  const RELIEF = [
    { text: 'QED' },
    { text: 'Accepted!' },
    { text: 'Grant\nfunded' },
    { text: 'It compiles' },
    { text: 'The proof\nholds' },
    { text: 'Someone\ncited you' },
    { text: 'Reviewer 1\nliked it' },
    { text: 'Minor\nrevisions' },
    { text: 'Sabbatical' },
    { text: 'Meeting\ncancelled' },
    { text: 'A new box\nof chalk' },
    { text: 'Zero typos' },
    { text: 'Coffee' },
    { text: 'Free lunch\nat the seminar' }
  ];

  const TAUNTS = [
    'Have you read my 2011 paper?',
    'This is a special case of [17].',
    'The proof of Lemma 3.2 is circular.',
    'There is a gap on page 17.',
    'Why is this WLOG?',
    'Does it hold in characteristic p?',
    'I could not verify equation (4.7).',
    'The constant is not effective.',
    'The English needs work.',
    'Novelty is unclear.',
    'See my earlier comment.',
    'This has been done before.',
    'Major revisions. Again.'
  ];

  /* ─── Tuning ─────────────────────────────────────────────── */

  const MAX_STRESS   = 100;
  const STRESS_MISS  = 8;     // a dread you let expire
  const STRESS_BOSS  = 20;    // Reviewer 2 escaping
  const STRESS_RELIEF= 12;    // recovered by good news
  const BOSS_HITS    = 3;
  const RELIEF_CHANCE= 0.11;
  const BOSS_AFTER   = 15000; // ms before Reviewer 2 shows up at all
  const MAX_RELIEF   = 1;     // good news should feel scarce

  /* ─── State ──────────────────────────────────────────────── */

  const S = {
    running: false,
    score: 0,
    best: Number(localStorage.getItem('reviewer2.best') || 0),
    stress: 0,
    combo: 1,
    banished: 0,
    started: 0,
    spawnTimer: null,
    items: [],
    slots: [],
    sinceBoss: 0
  };

  const field   = document.getElementById('field');
  const elScore = document.getElementById('score');
  const elBest  = document.getElementById('best');
  const elCombo = document.getElementById('combo');
  const elStress= document.getElementById('stress-fill');
  const overlay = document.getElementById('overlay');

  /* ─── Slot grid: where things are allowed to pop up ──────── */

  function buildSlots() {
    const W = window.innerWidth  || document.documentElement.clientWidth  || 1024;
    const H = window.innerHeight || document.documentElement.clientHeight || 768;

    const top = W < 620 ? 92 : 104;      // clear the HUD
    const bottom = 30;
    const side = Math.max(14, W * 0.035);

    const usableW = W - side * 2;
    const usableH = H - top - bottom;

    // Fewer, larger columns on phones: small notes clip at the edges once
    // they're rotated, and long words like "Supplementary" stop fitting.
    const cols = W < 480 ? 2 : (W < 760 ? 3 : (W < 1100 ? 4 : (W < 1500 ? 5 : 6)));
    const rows = usableH < 420 ? 2 : (usableH < 640 ? 3 : 4);

    const cellW = usableW / cols;
    const cellH = usableH / rows;

    S.W = W; S.H = H; S.top = top;
    S.size = Math.max(92, Math.min(168, Math.min(cellW, cellH) * 0.84));

    S.slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        S.slots.push({
          x: side + cellW * (c + 0.5),
          y: top  + cellH * (r + 0.5),
          jx: cellW * 0.16,
          jy: cellH * 0.16,
          busy: false
        });
      }
    }
  }

  function freeSlot() {
    const open = S.slots.filter((s) => !s.busy);
    if (!open.length) return null;
    return open[(Math.random() * open.length) | 0];
  }

  /* ─── Difficulty ramps with elapsed time ─────────────────── */

  function elapsed() { return S.running ? Date.now() - S.started : 0; }

  function spawnDelay() {
    const t = Math.min(1, elapsed() / 95000);
    return 1150 - 720 * t + Math.random() * 260;
  }

  function lifetime() {
    const t = Math.min(1, elapsed() / 95000);
    return 3500 - 1750 * t;
  }

  // How much may sit on the desk at once. Difficulty should come from pace,
  // not from an unreadable pile of paper.
  function maxActive() {
    const t = Math.min(1, elapsed() / 95000);
    return Math.min(S.slots.length, Math.round(4 + 5 * t));
  }

  // Every spawn goes through here, so two chains can never run at once.
  function schedule(ms) {
    clearTimeout(S.spawnTimer);
    S.spawnTimer = setTimeout(spawn, ms);
  }

  /* ─── DOM ────────────────────────────────────────────────── */

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) {
      text.split('\n').forEach((line, i) => {
        if (i) n.appendChild(document.createElement('br'));
        n.appendChild(document.createTextNode(line));
      });
    }
    return n;
  }

  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* ─── Spawning ───────────────────────────────────────────── */

  function spawn() {
    if (!S.running) return;

    const slot = S.items.length < maxActive() ? freeSlot() : null;
    if (slot) {
      S.sinceBoss++;
      const bossDue = elapsed() > BOSS_AFTER && S.sinceBoss > 7 && Math.random() < 0.4;
      const reliefOut = S.items.filter((i) => i.kind === 'relief').length;

      if (bossDue) {
        make(slot, 'boss', pick(TAUNTS), 'stamp');
      } else if (reliefOut < MAX_RELIEF && Math.random() < RELIEF_CHANCE) {
        make(slot, 'relief', pick(RELIEF).text, 'sticky');
      } else {
        const d = pick(DREAD);
        make(slot, 'dread', d.text, d.form);
      }
    }

    schedule(spawnDelay());
  }

  function make(slot, kind, text, form) {
    if (!slot || slot.busy) return;
    slot.busy = true;
    if (kind === 'boss') S.sinceBoss = 0;

    const size = kind === 'boss' ? S.size * 1.22 : S.size;
    const rot  = (Math.random() * 14 - 7).toFixed(2);
    const half = size * 0.62;            // bounding radius once rotated
    const x = clamp(slot.x + (Math.random() * 2 - 1) * slot.jx, half + 4, S.W - half - 4);
    const y = clamp(slot.y + (Math.random() * 2 - 1) * slot.jy, S.top + half * 0.5, S.H - half - 4);

    const node = el('button', 'item is-' + kind + ' form-' + form);
    node.type = 'button';
    node.style.cssText =
      '--x:' + x + 'px; --y:' + y + 'px; --size:' + size + 'px; --rot:' + rot + 'deg;';

    const paper = el('div', 'item-paper');
    if (form === 'sticky') paper.appendChild(el('div', 'item-tape'));
    if (form === 'email')  paper.appendChild(el('div', 'item-flap'));

    if (kind === 'boss') {
      paper.appendChild(el('div', 'boss-stamp', 'Reviewer\n№ 2'));
      paper.appendChild(el('div', 'boss-quote', '"' + text + '"'));
      paper.appendChild(el('div', 'boss-pips'));
    } else {
      paper.appendChild(el('div', 'item-text', text));
    }

    node.appendChild(paper);

    const item = {
      kind: kind,
      node: node,
      slot: slot,
      hits: 0,
      x: x, y: y,
      dead: false,
      expireAt: Date.now() + (kind === 'boss' ? lifetime() * 1.7 : lifetime())
    };

    node.addEventListener('pointerdown', (e) => { e.preventDefault(); hit(item); });

    S.items.push(item);
    field.appendChild(node);
    if (kind !== 'boss') SFX.pop(); else SFX.thud();

    updatePips(item);
  }

  function updatePips(item) {
    if (item.kind !== 'boss') return;
    const pips = item.node.querySelector('.boss-pips');
    pips.innerHTML = '';
    for (let i = 0; i < BOSS_HITS; i++) {
      const p = el('i', i < BOSS_HITS - item.hits ? 'pip' : 'pip is-gone');
      pips.appendChild(p);
    }
  }

  /* ─── Hitting things ─────────────────────────────────────── */

  function hit(item) {
    if (!S.running || item.dead) return;

    if (item.kind === 'boss') {
      item.hits++;
      if (item.hits < BOSS_HITS) {
        SFX.thud();
        item.node.classList.remove('is-struck');
        void item.node.offsetWidth;              // restart the shake
        item.node.classList.add('is-struck');
        item.node.querySelector('.boss-quote').textContent = '"' + pick(TAUNTS) + '"';
        updatePips(item);
        award(item, 150, false);
        return;
      }
      SFX.defeat();
      award(item, 700, true, 'REVIEWER 2 DEFEATED');
      S.stress = Math.max(0, S.stress - 10);
      bump(1);
      remove(item, 'banished');
      return;
    }

    if (item.kind === 'relief') {
      SFX.chime();
      S.stress = Math.max(0, S.stress - STRESS_RELIEF);
      award(item, 250, true, '+ relief');
      bump(0);
      remove(item, 'collected');
      return;
    }

    SFX.whack();
    award(item, 100 * S.combo, true);
    bump(1);
    remove(item, 'banished');
  }

  function bump(inc) {
    S.banished += inc;
    S.combo = Math.min(5, 1 + Math.floor(S.banished / 5));
    render();
  }

  function award(item, points, floatIt, label) {
    S.score += points;
    if (floatIt) floatText(item.x, item.y, label || ('+' + points), item.kind);
    render();
  }

  function floatText(x, y, text, kind) {
    const n = el('div', 'pop pop-' + (kind || 'dread'), text);
    n.style.cssText = '--x:' + x + 'px; --y:' + y + 'px;';
    field.appendChild(n);
    setTimeout(() => n.remove(), 900);
  }

  function remove(item, how) {
    if (item.dead) return;
    item.dead = true;
    item.slot.busy = false;
    item.node.classList.add('is-' + how);
    item.node.style.pointerEvents = 'none';
    setTimeout(() => item.node.remove(), 450);
    S.items = S.items.filter((i) => i !== item);
  }

  function expire(item) {
    if (item.dead) return;
    if (item.kind === 'relief') { remove(item, 'faded'); return; }

    SFX.miss();
    S.stress += item.kind === 'boss' ? STRESS_BOSS : STRESS_MISS;
    S.banished = 0;
    S.combo = 1;
    document.body.classList.add('is-shaken');
    setTimeout(() => document.body.classList.remove('is-shaken'), 320);
    remove(item, 'escaped');
    render();
    if (S.stress >= MAX_STRESS) gameOver();
  }

  /* ─── Loop ───────────────────────────────────────────────── */

  // Logic runs on a timer rather than requestAnimationFrame. rAF stops dead in
  // a background tab, which would freeze expiry while the spawn timers kept
  // running — dread would pile up and nothing would ever time out.
  function tick() {
    if (!S.running || S.paused) return;
    const now = Date.now();
    for (const item of S.items.slice()) {
      const left = item.expireAt - now;
      if (left <= 0) expire(item);
      else if (left < 900) item.node.classList.add('is-urgent');
    }
  }

  function render() {
    elScore.textContent = S.score.toLocaleString();
    elBest.textContent  = S.best.toLocaleString();
    elCombo.textContent = '×' + S.combo;
    elCombo.classList.toggle('is-hot', S.combo >= 3);
    const pct = Math.min(100, (S.stress / MAX_STRESS) * 100);
    elStress.style.width = pct + '%';
    elStress.classList.toggle('is-critical', pct >= 70);
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function showOverlay(html) {
    overlay.innerHTML = html;
    overlay.classList.add('is-open');
  }

  function hideOverlay() { overlay.classList.remove('is-open'); }

  function startScreen() {
    showOverlay(
      '<div class="card">' +
      '<div class="card-kicker">A game about academic dread</div>' +
      '<h1 class="card-title">Reviewer <span>№&nbsp;2</span></h1>' +
      '<p class="card-body">Dread keeps landing on your desk. <strong>Click it</strong> before it piles up.</p>' +
      '<ul class="card-rules">' +
        '<li><i class="key key-dread"></i>Deadlines, revisions, rejections — click to deal with them.</li>' +
        '<li><i class="key key-relief"></i>Good news is rare. Grab it — it lowers your stress.</li>' +
        '<li><i class="key key-boss"></i><strong>Reviewer № 2</strong> takes three hits and does not leave quietly.</li>' +
        '<li><i class="key key-stress"></i>Anything you miss raises stress. At 100% you burn out.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Begin the semester</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('start-btn').addEventListener('click', start);
  }

  function gameOver() {
    S.running = false;
    clearTimeout(S.spawnTimer);
    SFX.over();

    for (const item of S.items.slice()) remove(item, 'faded');
    S.slots.forEach((s) => { s.busy = false; });

    const isBest = S.score > S.best;
    if (isBest) {
      S.best = S.score;
      localStorage.setItem('reviewer2.best', String(S.best));
    }

    const mins = Math.floor(elapsedFinal / 60000);
    const secs = Math.floor((elapsedFinal % 60000) / 1000);

    showOverlay(
      '<div class="card">' +
      '<div class="card-kicker">Burnout</div>' +
      '<h1 class="card-title">You have<br><span>taken a leave</span></h1>' +
      '<div class="result">' +
        '<div><b>' + S.score.toLocaleString() + '</b><span>Score</span></div>' +
        '<div><b>' + mins + ':' + String(secs).padStart(2, '0') + '</b><span>Survived</span></div>' +
        '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>' +
      (isBest ? '<p class="card-body card-best">A new personal best. Congratulations, probably.</p>' : '') +
      '<button class="btn" id="again-btn">Try again next term</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', start);
    render();
  }

  let elapsedFinal = 0;

  function start() {
    SFX.unlock();
    hideOverlay();

    for (const item of S.items.slice()) remove(item, 'faded');
    S.items = [];
    buildSlots();
    S.slots.forEach((s) => { s.busy = false; });

    S.score = 0;
    S.stress = 0;
    S.combo = 1;
    S.banished = 0;
    S.sinceBoss = 0;
    S.started = Date.now();
    S.running = true;

    render();
    if (document.hidden) { S.paused = Date.now(); clearTimeout(S.spawnTimer); }
    else schedule(500);

    clearInterval(S.clock);
    S.clock = setInterval(() => { if (S.running) elapsedFinal = elapsed(); }, 250);
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  const muteBtn = document.getElementById('mute');
  muteBtn.addEventListener('click', () => {
    const next = SFX.enabled();
    SFX.mute(next);
    muteBtn.setAttribute('aria-pressed', next ? 'false' : 'true');
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasBusy = S.items.map((i) => i);
      buildSlots();
      S.slots.forEach((s) => { s.busy = false; });
      // Re-seat anything still on the desk into the new grid.
      for (const item of wasBusy) {
        const slot = freeSlot();
        if (!slot) { remove(item, 'faded'); continue; }
        slot.busy = true;
        item.slot = slot;
        item.x = slot.x; item.y = slot.y;
        item.node.style.setProperty('--x', slot.x + 'px');
        item.node.style.setProperty('--y', slot.y + 'px');
        item.node.style.setProperty('--size',
          (item.kind === 'boss' ? S.size * 1.22 : S.size) + 'px');
      }
    }, 220);
  }, { passive: true });

  // Pause when the tab is hidden, so nothing expires unseen.
  document.addEventListener('visibilitychange', () => {
    if (!S.running) return;
    if (document.hidden) {
      if (S.paused) return;              // already paused; don't re-stamp the clock
      clearTimeout(S.spawnTimer);
      S.paused = Date.now();
    } else if (S.paused) {
      const gap = Date.now() - S.paused;
      S.started += gap;
      for (const item of S.items) item.expireAt += gap;
      S.paused = 0;
      schedule(400);
    }
  });

  buildSlots();
  render();
  startScreen();
  setInterval(tick, 100);

})();
