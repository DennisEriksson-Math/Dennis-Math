/* ═══════════════════════════════════════════════════════════
   THE GAP — reassemble a scrambled proof. Exactly one of the
   loose lines does not follow; leave it out.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Several of the bogus lines are the classic mistakes rather than
     nonsense — the Euclid "N is prime" slip, and terms→0 implying
     convergence. Those are the ones worth catching. */

  const PROOFS = [
    {
      thm: '√2 is irrational.',
      steps: [
        'Suppose √2 = p/q with p and q integers sharing no common factor.',
        'Squaring and rearranging gives p² = 2q², so p² is even.',
        'A square is even only if its root is even, so p = 2k for some integer k.',
        'Substituting, 4k² = 2q², so q² = 2k² and q is even as well.',
        'But then p and q share the factor 2, contrary to assumption.'
      ],
      gap: 'Every rational number has a terminating decimal expansion.',
      why: 'True of some rationals, false of 1/3, and no part of this argument.'
    },
    {
      thm: 'There are infinitely many primes.',
      steps: [
        'Suppose the primes are exactly p₁, p₂, …, pₙ.',
        'Let N = p₁p₂⋯pₙ + 1.',
        'Dividing N by any pᵢ leaves remainder 1.',
        'So no pᵢ divides N, yet N > 1 has some prime factor.',
        'That factor is a prime missing from the list, which is a contradiction.'
      ],
      gap: 'Therefore N is itself prime.',
      why: 'The classic slip. N need not be prime — 2·3·5·7·11·13 + 1 = 59 × 509.'
    },
    {
      thm: 'The sum of the first n odd numbers is n².',
      steps: [
        'For n = 1 the sum is 1, which is 1².',
        'Suppose the first k odd numbers sum to k².',
        'The next odd number is 2k + 1.',
        'So the first k + 1 of them sum to k² + 2k + 1.',
        'And k² + 2k + 1 = (k + 1)², completing the induction.'
      ],
      gap: 'Hence n² is odd for every n.',
      why: 'Flatly false — 4 is a square — and nothing above suggests it.'
    },
    {
      thm: 'Every finite integral domain is a field.',
      steps: [
        'Let R be a finite integral domain and let a be a nonzero element.',
        'Consider the map from R to R sending x to ax.',
        'It is injective: ax = ay gives a(x − y) = 0, and R has no zero divisors.',
        'An injective map from a finite set to itself is surjective.',
        'So ax = 1 for some x, and every nonzero a is invertible.'
      ],
      gap: 'Every finite ring is commutative.',
      why: 'False — the 2 × 2 matrices over F₂ are a finite ring and do not commute.'
    },
    {
      thm: 'Every subgroup of a cyclic group is cyclic.',
      steps: [
        'Let G = ⟨g⟩ and let H be a subgroup of G.',
        'If H is trivial it is cyclic, so suppose it is not.',
        'Let m be the least positive integer with gᵐ in H.',
        'Take any gⁿ in H and write n = qm + r with 0 ≤ r < m.',
        'Then gʳ = gⁿ(gᵐ)⁻ᑫ lies in H, so r = 0 by minimality of m.',
        'Hence every element of H is a power of gᵐ, and H = ⟨gᵐ⟩.'
      ],
      gap: 'Every cyclic group is finite.',
      why: 'ℤ is cyclic and infinite. The argument never needs finiteness.'
    },
    {
      thm: 'If n² is even then n is even.',
      steps: [
        'Suppose instead that n is odd, so n = 2k + 1.',
        'Then n² = 4k² + 4k + 1.',
        'That is 2(2k² + 2k) + 1, which is odd.',
        'So n odd forces n² odd.',
        'Taking the contrapositive, n² even forces n even.'
      ],
      gap: 'Zero is neither even nor odd.',
      why: 'Zero is even. It is also irrelevant here.'
    },
    {
      thm: 'The harmonic series diverges.',
      steps: [
        'Group the terms after the first into blocks of length 1, 2, 4, 8, and so on.',
        'The block running from 1/(2ᵏ + 1) to 1/2ᵏ⁺¹ contains 2ᵏ terms.',
        'Every term in that block is at least 1/2ᵏ⁺¹.',
        'So the block sums to at least 2ᵏ · 1/2ᵏ⁺¹ = 1/2.',
        'Infinitely many blocks each of size at least 1/2 cannot sum to anything finite.'
      ],
      gap: 'The terms tend to zero, so the series converges.',
      why: 'The other classic slip. Terms tending to zero is necessary, never sufficient.'
    },
    {
      thm: 'Between any two distinct rationals there is another rational.',
      steps: [
        'Let a < b be rational.',
        'Put m = (a + b)/2.',
        'A sum and quotient of rationals is rational, so m is rational.',
        'From a < b we get 2a < a + b, hence a < m.',
        'From a < b we also get a + b < 2b, hence m < b.'
      ],
      gap: 'So between any two rationals there are finitely many rationals.',
      why: 'The opposite follows — repeat the halving and you get infinitely many.'
    },
    {
      thm: 'The rational numbers are countable.',
      steps: [
        'Write each positive rational in lowest terms as p/q.',
        'Arrange them in a grid, p along one axis and q along the other.',
        'Walk the grid along its anti-diagonals, each of which is finite.',
        'Skip any fraction already met, so nothing is listed twice.',
        'Every positive rational is reached at some finite stage of that walk.'
      ],
      gap: 'The same walk lists the real numbers.',
      why: 'It does not. Cantor\u2019s diagonal argument shows the reals are uncountable.'
    },
    {
      thm: 'Every convergent sequence is bounded.',
      steps: [
        'Let x\u2099 \u2192 L, and take \u03b5 = 1 in the definition of the limit.',
        'There is an N with |x\u2099 \u2212 L| < 1 for all n \u2265 N.',
        'So |x\u2099| < |L| + 1 once n \u2265 N.',
        'The finitely many earlier terms have some largest absolute value M.',
        'Then |x\u2099| \u2264 max(M, |L| + 1) for every n at all.'
      ],
      gap: 'Hence every bounded sequence converges.',
      why: 'The converse, and false: (\u22121)\u207f is bounded and converges to nothing.'
    },
    {
      thm: 'The empty set is a subset of every set.',
      steps: [
        'To show \u2205 \u2286 A we must show every element of \u2205 lies in A.',
        'So suppose x \u2208 \u2205.',
        'There is no such x, so the hypothesis is never satisfied.',
        'An implication with a false hypothesis is true.',
        'Hence x \u2208 \u2205 \u21d2 x \u2208 A holds, which is what \u2205 \u2286 A means.'
      ],
      gap: 'Therefore \u2205 is an element of every set.',
      why: 'Subset and element are different relations. \u2205 \u2286 A always; \u2205 \u2208 A only sometimes.'
    },
    {
      thm: 'Every group of prime order is cyclic.',
      steps: [
        'Let |G| = p with p prime, and choose g in G other than the identity.',
        'By Lagrange, the order of the subgroup \u27e8g\u27e9 divides p.',
        'The only divisors of p are 1 and p.',
        'Since g is not the identity, \u27e8g\u27e9 has more than one element.',
        'So \u27e8g\u27e9 has order p, and therefore G = \u27e8g\u27e9.'
      ],
      gap: 'The same argument shows every group of order p\u00b2 is cyclic.',
      why: 'False. \u2124/p \u00d7 \u2124/p has order p\u00b2 and no element of order p\u00b2.'
    },
    {
      thm: 'There are infinitely many primes of the form 4k + 3.',
      steps: [
        'Suppose q\u2081, \u2026, q\u2099 were all of them, and set N = 4q\u2081\u22efq\u2099 \u2212 1.',
        'Then N is itself of the form 4k + 3, and N > 1.',
        'A product of primes all of the form 4k + 1 is again of that form.',
        'N is odd and not of that form, so it has a prime factor of the form 4k + 3.',
        'That factor is not among the q\u1d62, since each of those leaves remainder \u22121.'
      ],
      gap: 'The same argument works for primes of the form 4k + 1.',
      why: 'It does not. The third step has no analogue there, and that case needs different tools.'
    },
    {
      thm: 'A function differentiable at a point is continuous there.',
      steps: [
        'Suppose f is differentiable at a.',
        'Then (f(x) \u2212 f(a))/(x \u2212 a) \u2192 f\u2032(a) as x \u2192 a.',
        'For x \u2260 a write f(x) \u2212 f(a) as that quotient times (x \u2212 a).',
        'The first factor tends to f\u2032(a) and the second tends to 0.',
        'So f(x) \u2192 f(a), which is continuity at a.'
      ],
      gap: 'Hence f\u2032 is itself continuous.',
      why: 'Not implied. x\u00b2sin(1/x) is differentiable everywhere and its derivative is not continuous at 0.'
    },
    {
      thm: 'A number is divisible by 3 exactly when its digits sum to a multiple of 3.',
      steps: [
        'Write n = \u03a3 a\u1d62 10\u2071 with the a\u1d62 its digits.',
        '10 \u2261 1 (mod 3), so 10\u2071 \u2261 1 (mod 3) for every i.',
        'Hence n \u2261 \u03a3 a\u1d62 (mod 3).',
        'So 3 divides n exactly when 3 divides the digit sum.'
      ],
      gap: 'The same test works for 7, since 10 \u2261 1 (mod 7).',
      why: '10 \u2261 3 (mod 7), not 1. There is no digit-sum test for 7.'
    },
    {
      thm: 'Among any thirteen people, two share a birth month.',
      steps: [
        'There are twelve months.',
        'Suppose no two of the thirteen shared a month.',
        'Then sending each person to their birth month would be injective.',
        'An injective map out of a thirteen-element set needs at least thirteen months.',
        'Only twelve are available, so no such map exists.'
      ],
      gap: 'So in any group of twelve people all the birth months differ.',
      why: 'Nothing forces that. Twelve people can perfectly well all be born in January.'
    }
  ];

  const MAX_LIVES = 3;
  const ROUND     = 8;   // proofs per run, drawn at random from PROOFS


  const S = {
    idx: 0,
    order: [],        // which proofs this run uses, in the order they come
    score: 0,
    best: Number(localStorage.getItem('thegap.best') || 0),
    lives: MAX_LIVES,
    proof: [],        // line texts, in the order chosen
    pool: [],         // line texts still loose
    clean: true,      // no failed submit on this proof yet
    running: false
  };

  const elThm     = document.getElementById('theorem');
  const elProg    = document.getElementById('progress');
  const elProof   = document.getElementById('proof');
  const elPool    = document.getElementById('pool');
  const elCount   = document.getElementById('count');
  const elVerdict = document.getElementById('verdict');
  const elScore   = document.getElementById('score');
  const elBest    = document.getElementById('best');
  const elLives   = document.getElementById('lives');
  const overlay   = document.getElementById('overlay');

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function current() { return PROOFS[S.order[S.idx]]; }

  /* ─── Rendering ──────────────────────────────────────────── */

  function render() {
    const p = current();

    elProof.innerHTML = '';
    S.proof.forEach((text) => {
      const li = document.createElement('li');
      li.className = 'line is-placed';
      li.innerHTML = '<span>' + text + '</span>';
      li.addEventListener('click', () => lift(text));
      elProof.appendChild(li);
    });

    // Empty slots for whatever is still missing.
    for (let i = S.proof.length; i < p.steps.length; i++) {
      const li = document.createElement('li');
      li.className = 'line is-empty';
      li.innerHTML = '<span></span>';
      elProof.appendChild(li);
    }

    elPool.innerHTML = '';
    S.pool.forEach((text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'line is-loose';
      b.innerHTML = '<span>' + text + '</span>';
      b.addEventListener('click', () => place(text));
      elPool.appendChild(b);
    });

    elCount.textContent = S.proof.length + ' of ' + p.steps.length;
    elThm.textContent = p.thm;
    elProg.textContent = 'Proof ' + (S.idx + 1) + ' of ' + ROUND;
    elScore.textContent = S.score.toLocaleString();
    elBest.textContent = S.best.toLocaleString();
    [...elLives.querySelectorAll('i')].forEach((m, i) => m.classList.toggle('is-gone', i >= S.lives));
  }

  function place(text) {
    if (!S.running) return;
    if (S.proof.length >= current().steps.length) {
      note('The proof is full. Take a line out first.', 'mid');
      return;
    }
    S.pool.splice(S.pool.indexOf(text), 1);
    S.proof.push(text);
    SFX.place();
    clearNote();
    render();
  }

  function lift(text) {
    if (!S.running) return;
    S.proof.splice(S.proof.indexOf(text), 1);
    S.pool.push(text);
    SFX.lift();
    clearNote();
    render();
  }

  function clearAll() {
    if (!S.running) return;
    S.pool = shuffle(S.pool.concat(S.proof));
    S.proof = [];
    SFX.lift();
    clearNote();
    render();
  }

  function note(text, kind) {
    elVerdict.textContent = text;
    elVerdict.className = 'verdict is-' + kind;
  }
  function clearNote() { elVerdict.textContent = ''; elVerdict.className = 'verdict'; }

  /* ─── Checking ───────────────────────────────────────────── */

  function submit() {
    if (!S.running) return;
    const p = current();

    if (S.proof.length < p.steps.length) {
      note('The proof is not finished — ' + (p.steps.length - S.proof.length) + ' line(s) still missing.', 'mid');
      return;
    }

    const usedGap = S.proof.indexOf(p.gap);
    if (usedGap >= 0) {
      fail('Line ' + (usedGap + 1) + ' does not follow. ' + p.why, usedGap);
      return;
    }

    const wrong = S.proof.findIndex((t, i) => t !== p.steps[i]);
    if (wrong >= 0) {
      fail('The steps are out of order. Line ' + (wrong + 1) + ' does not belong there.', wrong);
      return;
    }

    // Correct.
    const gained = S.clean ? 500 : 250;
    S.score += gained;
    SFX.good();
    [...elProof.children].forEach((li, i) => setTimeout(() => li.classList.add('is-right'), i * 80));
    note('Sound. The gap was: “' + p.gap + '” — ' + p.why + '  +' + gained, 'good');
    render();

    setTimeout(() => {
      if (S.idx >= ROUND - 1) { allDone(); return; }
      S.idx++;
      loadProof();
    }, 2600);
  }

  function fail(msg, at) {
    S.lives--;
    S.clean = false;
    SFX.bad();
    note(msg, 'bad');
    const li = elProof.children[at];
    if (li) { li.classList.add('is-wrong'); setTimeout(() => li.classList.remove('is-wrong'), 900); }
    render();
    if (S.lives <= 0) setTimeout(gameOver, 1400);
  }

  /* ─── Flow ───────────────────────────────────────────────── */

  function loadProof() {
    const p = current();
    S.proof = [];
    S.pool = shuffle(p.steps.concat([p.gap]));
    S.clean = true;
    clearNote();
    render();
  }

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }

  function startScreen() {
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">One line does not follow</div>' +
      '<h1 class="sheet-title">The <span>Gap</span></h1>' +
      '<p class="sheet-body">A proof has come apart. Put the lines back in order — ' +
      'but <strong>one of them does not belong</strong>. Leave that one out.</p>' +
      '<ul class="sheet-rules">' +
        '<li>Click a loose line to add it; click a placed line to take it back.</li>' +
        '<li>Some of the bogus lines are the mistakes people actually make.</li>' +
        '<li>Getting it right first time is worth double.</li>' +
        '<li>Three wrong submissions and the referee gives up.</li>' +
        '<li>Eight proofs a run, drawn from a pile of sixteen &mdash; a different eight each time.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Open the first one</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('start-btn').addEventListener('click', start);
  }

  function gameOver() {
    S.running = false;
    SFX.over();
    if (S.score > S.best) { S.best = S.score; localStorage.setItem('thegap.best', String(S.best)); }
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Three bad submissions</div>' +
      '<h1 class="sheet-title">Returned<br><span>to the authors</span></h1>' +
      '<p class="sheet-body">The referee has stopped reading. You got through ' + S.idx +
      ' of ' + ROUND + '.</p>' + results() +
      '<button class="btn" id="again-btn">Try again</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', start);
  }

  function allDone() {
    S.running = false;
    SFX.done();
    const isBest = S.score > S.best;
    if (isBest) { S.best = S.score; localStorage.setItem('thegap.best', String(S.best)); }
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">All eight, checked</div>' +
      '<h1 class="sheet-title">Accept<br><span>without changes</span></h1>' +
      '<p class="sheet-body">Which almost never happens.</p>' + results() +
      (isBest ? '<p class="sheet-body sheet-best">A new best.</p>' : '') +
      '<button class="btn" id="again-btn">Another pile</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', start);
  }

  function results() {
    return '<div class="result">' +
      '<div><b>' + S.score.toLocaleString() + '</b><span>Score</span></div>' +
      '<div><b>' + (ROUND * 500).toLocaleString() + '</b><span>Perfect</span></div>' +
      '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>';
  }

  function start() {
    SFX.unlock();
    overlay.classList.remove('is-open');
    // A fresh draw every run. Without this the pile was always played in
    // source order, so every game opened on the same proof and the rest of
    // the pile was only ever reached by getting that one right.
    S.order = shuffle(PROOFS.map((_, i) => i)).slice(0, ROUND);
    S.idx = 0; S.score = 0; S.lives = MAX_LIVES; S.running = true;
    loadProof();
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  document.getElementById('submit').addEventListener('click', submit);
  document.getElementById('clear').addEventListener('click', clearAll);

  S.order = shuffle(PROOFS.map((_, i) => i)).slice(0, ROUND);
  loadProof();
  startScreen();

})();
