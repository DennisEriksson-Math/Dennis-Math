/* ═══════════════════════════════════════════════════════════
   COUNTEREXAMPLE — a conjecture, a grid of candidates, and
   exactly one thing that breaks it.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Number theory helpers ──────────────────────────────── */

  function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }

  function isPrime(n) {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
    return true;
  }

  function isSquare(n) { const r = Math.round(Math.sqrt(n)); return r * r === n; }

  function isPow2(n) { return n > 0 && (n & (n - 1)) === 0; }

  function squarefree(n) {
    for (let d = 2; d * d <= n; d++) if (n % (d * d) === 0) return false;
    return true;
  }

  function sumOfTwoSquares(n) {
    for (let a = 0; a * a <= n; a++) if (isSquare(n - a * a)) return true;
    return false;
  }

  function nearSquare(n) {
    const r = Math.round(Math.sqrt(n));
    return Math.abs(n - r * r) <= 2 && !isSquare(n);
  }

  const FIB = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
  const TRI = [3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120, 136, 153, 171, 190];

  function nearMiss(list, span) {
    const out = new Set();
    for (const v of list) for (let d = -span; d <= span; d++) {
      const x = v + d;
      if (d !== 0 && x > 2 && !list.includes(x)) out.add(x);
    }
    return [...out];
  }

  /* Some 2×2 matrices, half of them singular. */
  function matrices() {
    const good = [], bad = [];
    for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++)
      for (let c = -4; c <= 4; c++) for (let d = -4; d <= 4; d++) {
        const det = a * d - b * c;
        const nonzero = a || b || c || d;
        if (!nonzero) continue;
        if (det === 0 && Math.abs(a) + Math.abs(b) + Math.abs(c) + Math.abs(d) > 4) bad.push({ m: [a, b, c, d] });
        else if (Math.abs(det) > 0 && Math.abs(det) < 9) good.push({ m: [a, b, c, d] });
      }
    return { good, bad };
  }

  /* ─── The conjectures ────────────────────────────────────
     Numeric types give a `pool` and a `test`, so the good and
     bad sets are derived rather than typed out — they cannot
     drift out of sync with the claim. `badFilter` narrows the
     counterexamples to ones that don't give themselves away.
     ──────────────────────────────────────────────────────── */

  const TYPES = [
    { tier: 1, claim: 'every one of these is divisible by 3',
      pool: () => range(11, 240), test: (n) => n % 3 === 0 },

    { tier: 1, claim: 'every one of these is a power of 2',
      pool: () => range(4, 300), test: isPow2,
      badFilter: (n) => n % 2 === 0 && n % 4 === 0 },

    { tier: 1, claim: 'every one of these is a perfect square',
      pool: () => range(9, 500), test: isSquare, badFilter: nearSquare },

    { tier: 1, claim: 'every one of these is even',
      pool: () => range(12, 300), test: (n) => n % 2 === 0 },

    { tier: 2, claim: 'every one of these is a Fibonacci number',
      good: FIB.slice(2), bad: nearMiss(FIB.slice(2), 2) },

    { tier: 2, claim: 'every one of these is a triangular number',
      good: TRI, bad: nearMiss(TRI, 2) },

    { tier: 2, claim: 'every one of these is congruent to 1 mod 4',
      pool: () => range(13, 300), test: (n) => n % 4 === 1,
      badFilter: (n) => n % 2 === 1 },

    { tier: 2, claim: 'every one of these is squarefree',
      pool: () => range(14, 200), test: squarefree,
      badFilter: (n) => !squarefree(n) && !isSquare(n) && n % 4 !== 0 },

    { tier: 3, claim: 'every one of these is prime',
      pool: () => range(101, 400), test: isPrime,
      badFilter: (n) => n % 2 && n % 3 && n % 5 },

    { tier: 3, claim: 'every one of these is a sum of two squares',
      pool: () => range(13, 160), test: sumOfTwoSquares },

    { tier: 3, claim: 'every one of these is irrational',
      good: ['√2', '√3', '√5', '√6', '√7', '√10', 'π', 'e', 'π/2', 'ln 2', 'φ', '√2 + 1', 'log₂ 3'],
      bad:  ['√4', '√9', '√16', '√25', '√81', 'log₂ 8', 'log₃ 9', '√(4/9)', '2/3', '1.75', '√1.44'] },

    { tier: 3, claim: 'every one of these groups is abelian',
      good: ['ℤ/6', 'ℤ/2 × ℤ/2', 'ℤ', 'ℤ/12', '(ℝ, +)', 'ℚ*', 'ℤ/5', 'ℤ/2 × ℤ/3', '(ℤ/7)*', 'ℤ/4', '(ℂ, +)'],
      bad:  ['S₃', 'D₄', 'Q₈', 'S₄', 'GL₂(ℝ)', 'A₄', 'D₆', 'S₅', 'SL₂(ℤ)'] },

    { tier: 3, claim: 'every one of these sets is countable',
      good: ['ℕ', 'ℤ', 'ℚ', 'ℚ ∩ [0,1]', 'ℤ × ℤ', 'the primes', 'ℕ³', 'algebraic numbers', 'finite subsets of ℕ'],
      bad:  ['ℝ', '[0,1]', '2^ℕ', 'ℝ \\ ℚ', 'the Cantor set', 'ℂ', 'functions ℕ → ℕ', 'the power set of ℕ'] },

    { tier: 3, claim: 'every one of these is continuous on all of ℝ',
      good: ['x²', '|x|', 'sin x', 'eˣ', 'x³ − x', 'cos x', 'x·|x|', 'arctan x', 'x sin x'],
      bad:  ['1/x', '⌊x⌋', 'tan x', '1/(x − 1)', 'sgn x', '1/x²', 'x/|x|', '⌈x⌉'] },

    { tier: 3, claim: 'every one of these matrices is invertible', matrix: true }
  ];

  const MATRICES = matrices();

  function poolFor(type) {
    if (type._cache) return type._cache;
    let good, bad;
    if (type.matrix) {
      good = MATRICES.good; bad = MATRICES.bad;
    } else if (type.pool) {
      const p = type.pool();
      good = p.filter(type.test);
      bad = p.filter((n) => !type.test(n) && (!type.badFilter || type.badFilter(n)));
    } else {
      good = type.good.slice(); bad = type.bad.slice();
    }
    type._cache = { good: good, bad: bad };
    return type._cache;
  }

  /* ─── State ──────────────────────────────────────────────── */

  const MAX_ERRATA = 3;

  const S = {
    running: false,
    score: 0,
    best: Number(localStorage.getItem('counterexample.best') || 0),
    round: 0,
    errata: 0,
    answer: null,
    recent: [],
    limit: 0,
    endsAt: 0,
    locked: false
  };

  const elGrid    = document.getElementById('grid');
  const elClaim   = document.getElementById('claim');
  const elVerdict = document.getElementById('verdict');
  const elScore   = document.getElementById('score');
  const elRound   = document.getElementById('round');
  const elBest    = document.getElementById('best');
  const elErrata  = document.getElementById('errata');
  const elTimer   = document.getElementById('timer-fill');
  const overlay   = document.getElementById('overlay');

  function pick(a) { return a[(Math.random() * a.length) | 0]; }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function label(v) {
    if (v && v.m) {
      return '<span class="mat"><i>' + v.m[0] + '</i><i>' + v.m[1] + '</i>' +
             '<i>' + v.m[2] + '</i><i>' + v.m[3] + '</i></span>';
    }
    return String(v);
  }

  function same(a, b) {
    if (a && a.m && b && b.m) return a.m.join() === b.m.join();
    return a === b;
  }

  /* ─── Rounds ─────────────────────────────────────────────── */

  function gridSize(r) { return r <= 2 ? 4 : r <= 5 ? 6 : r <= 9 ? 9 : 12; }
  function timeFor(r)  { return Math.max(6, 16 - r * 0.7); }

  function nextRound() {
    S.round++;
    S.locked = false;
    elVerdict.textContent = '';
    elVerdict.className = 'verdict';

    // A moving window rather than a ceiling, so the easy conjectures drop away
    // instead of resurfacing at round 20.
    const tiers = S.round <= 3  ? [1]
                : S.round <= 7  ? [1, 2]
                : S.round <= 12 ? [2, 3]
                : [3];

    // Don't repeat either of the last two conjectures.
    const eligible = TYPES.filter((t) => tiers.indexOf(t.tier) >= 0);
    const fresh = eligible.filter((t) => S.recent.indexOf(t) < 0);
    const type = pick(fresh.length ? fresh : eligible);
    S.recent.push(type);
    if (S.recent.length > 2) S.recent.shift();
    const { good, bad } = poolFor(type);

    const count = Math.min(gridSize(S.round), good.length + 1);
    const answer = pick(bad);

    // Distinct decoys only, so there is never a second valid answer.
    const chosen = [];
    const seen = new Set();
    const bag = shuffle(good.slice());
    for (const g of bag) {
      const key = g && g.m ? g.m.join() : String(g);
      if (seen.has(key)) continue;
      seen.add(key);
      chosen.push(g);
      if (chosen.length === count - 1) break;
    }

    const items = shuffle(chosen.concat([answer]));
    S.answer = answer;

    elClaim.innerHTML = '<b>Conjecture.</b> ' + type.claim + '.';
    elGrid.innerHTML = '';
    elGrid.style.setProperty('--cols', count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4);

    items.forEach((v, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cand' + (type.matrix ? ' is-matrix' : '');
      b.style.setProperty('--i', i);
      b.innerHTML = '<span class="cand-face">' + label(v) + '</span>';
      if (same(v, answer)) b.dataset.answer = '1';
      b.addEventListener('click', () => choose(b, v));
      elGrid.appendChild(b);
    });

    S.limit = timeFor(S.round);
    S.endsAt = Date.now() + S.limit * 1000;
    render();
  }

  function choose(btn, value) {
    if (!S.running || S.locked) return;

    if (same(value, S.answer)) {
      S.locked = true;
      SFX.circle();
      btn.classList.add('is-right');
      [...elGrid.children].forEach((c) => { if (c !== btn) c.classList.add('is-dim'); });

      const left = Math.max(0, (S.endsAt - Date.now()) / 1000);
      const pts = 100 + Math.round(left * 12);
      S.score += pts;
      elVerdict.textContent = 'Counterexample. +' + pts;
      elVerdict.className = 'verdict is-good';
      render();
      setTimeout(nextRound, 1050);
      return;
    }

    SFX.squeak();
    btn.classList.add('is-wrong');
    btn.disabled = true;
    document.body.classList.add('is-shaken');
    setTimeout(() => document.body.classList.remove('is-shaken'), 320);

    S.endsAt -= 2500;                 // a wrong guess costs time as well
    strike('That one satisfies it.');
  }

  function strike(msg) {
    S.errata++;
    elVerdict.textContent = msg;
    elVerdict.className = 'verdict is-bad';
    render();
    if (S.errata >= MAX_ERRATA) gameOver();
  }

  function timeUp() {
    if (S.locked) return;
    S.locked = true;
    SFX.timeout();

    [...elGrid.children].forEach((c) => {
      c.classList.add(c.dataset.answer ? 'is-reveal' : 'is-dim');
    });

    S.errata++;
    elVerdict.textContent = 'Time. It was there.';
    elVerdict.className = 'verdict is-bad';
    render();

    if (S.errata >= MAX_ERRATA) setTimeout(gameOver, 900);
    else setTimeout(nextRound, 1400);
  }

  /* ─── Loop ───────────────────────────────────────────────── */

  function tick() {
    if (!S.running || S.locked) return;
    const left = S.endsAt - Date.now();
    elTimer.style.width = Math.max(0, Math.min(100, (left / (S.limit * 1000)) * 100)) + '%';
    elTimer.classList.toggle('is-low', left < 3500);
    if (left <= 0) timeUp();
  }

  function render() {
    elScore.textContent = S.score.toLocaleString();
    elRound.textContent = S.round;
    elBest.textContent = S.best.toLocaleString();
    [...elErrata.querySelectorAll('i')].forEach((m, i) => {
      m.classList.toggle('is-used', i < S.errata);
    });
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }

  function startScreen() {
    show(
      '<div class="card">' +
      '<div class="card-kicker">Find the one that breaks it</div>' +
      '<h1 class="card-title">Counter<span>example</span></h1>' +
      '<p class="card-body">A conjecture goes up on the board and a handful of candidates ' +
      'below it. <strong>All but one satisfy the claim.</strong> Click the one that does not.</p>' +
      '<ul class="card-rules">' +
        '<li>Faster answers score more.</li>' +
        '<li>A wrong click costs you two and a half seconds.</li>' +
        '<li>Three errata — wrong or too slow — and the round is over.</li>' +
        '<li>Later rounds bring bigger grids, less time, and worse conjectures.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Go to the board</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('start-btn').addEventListener('click', start);
  }

  function gameOver() {
    S.running = false;
    SFX.over();
    const isBest = S.score > S.best;
    if (isBest) {
      S.best = S.score;
      localStorage.setItem('counterexample.best', String(S.best));
    }
    show(
      '<div class="card">' +
      '<div class="card-kicker">Three errata</div>' +
      '<h1 class="card-title">The claim<br><span>stands</span></h1>' +
      '<div class="result">' +
        '<div><b>' + S.score.toLocaleString() + '</b><span>Score</span></div>' +
        '<div><b>' + S.round + '</b><span>Rounds</span></div>' +
        '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>' +
      (isBest ? '<p class="card-body card-best">A new best. For now.</p>' : '') +
      '<button class="btn" id="again-btn">Wipe the board</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', start);
    render();
  }

  function start() {
    SFX.unlock();
    overlay.classList.remove('is-open');
    S.score = 0; S.round = 0; S.errata = 0; S.recent = []; S.running = true;
    render();
    nextRound();
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  // Pause the clock while the tab is hidden, so a round can't expire unseen.
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (!S.running) return;
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt) { S.endsAt += Date.now() - hiddenAt; hiddenAt = 0; }
  });

  render();
  startScreen();
  setInterval(tick, 80);

})();
