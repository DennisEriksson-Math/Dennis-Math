/* ═══════════════════════════════════════════════════════════
   HOT SINGLES ON THE JOB MARKET — you are the hiring committee.
   Set the search, then swipe right on candidates who meet every
   criterion and left on the rest. Only the criteria on the pills
   count; the bios and the extras are there for atmosphere.
   All candidates are fictional.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── The writing. Edit freely. ── */

  const FIELDS = [
    { name: 'Number theory',
      bios: ['Primes are my type.', 'Seeking my other residue class.',
             'Please do not ask whether I like to “crunch numbers”.'],
      likes: ['modular forms', 'Diophantine equations', 'L-functions', 'elliptic curves'] },
    { name: 'Algebraic geometry',
      bios: ['Looking for someone to blow up with.', 'My love life: singular, but resolvable.',
             'Will happily explain what a scheme is. Twice.'],
      likes: ['moduli spaces', 'sheaves', 'birational geometry', 'cohomology'] },
    { name: 'Analysis & PDE',
      bios: ['Pretty sure we converge.', 'Let us get weakly acquainted, then strongly.',
             'Estimates: sharp. Feelings: not.'],
      likes: ['Sobolev spaces', 'dispersive equations', 'harmonic analysis', 'a priori estimates'] },
    { name: 'Combinatorics',
      bios: ['Let me count the ways.', 'Always up for a good bijection.',
             'Dates are random graphs. I would like a giant component.'],
      likes: ['extremal problems', 'generating functions', 'probabilistic method', 'Ramsey theory'] },
    { name: 'Topology',
      bios: ['Open to new neighbourhoods.', 'Cannot tell my coffee mug from my doughnut.',
             'Looking for something that deformation retracts onto me.'],
      likes: ['knots', 'manifolds', 'homotopy groups', 'spectral sequences'] },
    { name: 'Probability',
      bios: ['Almost surely single.', 'Our meeting has probability one. I checked.',
             'A drunkard’s walk is my idea of a night out.'],
      likes: ['random walks', 'martingales', 'percolation', 'stochastic PDE'] },
    { name: 'Applied mathematics',
      bios: ['Will fit your data. Will also fit your parameters.', 'Stable, well-conditioned, looking for the same.',
             'My code runs. Sometimes on the first try.'],
      likes: ['numerical analysis', 'optimisation', 'inverse problems', 'machine learning'] },
    { name: 'Logic',
      bios: ['Decidable? Let us find out.', 'I will either prove it or refuse to answer.',
             'Consistent, if you do not look too hard.'],
      likes: ['model theory', 'set theory', 'computability', 'proof theory'] }
  ];

  const BIO = [
    'Fluent in LaTeX, Python and quiet disappointment.',
    'Seeking a department that reads the footnotes.',
    'Will explain my thesis on a first date. And a second.',
    'Proofs over pickup lines.',
    'My code compiles. My jokes do not.',
    'Swipe right if you have a whiteboard.',
    'Not here for a long-term position. Okay, I am.',
    'Looking for a collaborator who answers email.',
    'Coffee, chalk and a mild fear of referees.',
    'Yes, I am on the market. No, not for long.',
    'Hobbies include a seminar and a different seminar.',
    'Love is a lemma. I am still looking for the proof.'
  ];

  const EXTRAS = [
    'Brings their own chalk', 'Strong opinions on Beamer', 'Has a sourdough starter',
    'Cycles to work', 'Reads the footnotes', 'Replies to email within a week (claims)',
    'Owns a standing desk', 'Fluent in three languages, all of them LaTeX',
    'Plays chess badly', 'Will relocate. Probably.', 'Allergic to chalk dust',
    'Colour-codes the references', 'Never says “obviously”', 'Says “obviously” a lot'
  ];

  const LOOKING = [
    'a department with working heating', 'a quiet office and a lively seminar',
    'someone to share a whiteboard with', 'a collaborator who answers email',
    'a sabbatical, eventually', 'long-term funding. Any funding.',
    'a seminar that serves lunch', 'a mentor who has read the paper',
    'a view that is not of a wall', 'a corridor with good conversations'
  ];

  const FIRST = ['Aurelia', 'Mateo', 'Ingrid', 'Tomasz', 'Priya', 'Kofi', 'Linnea', 'Dmitri', 'Yuki', 'Camille',
                 'Omar', 'Saoirse', 'Henrik', 'Lucía', 'Anand', 'Freya', 'Jonas', 'Mei', 'Rafael', 'Noor',
                 'Elias', 'Katarina', 'Ravi', 'Sofia', 'Björn', 'Amara', 'Viktor', 'Chiara', 'Hana', 'Oskar'];
  const LAST  = ['Voss', 'Lindqvist', 'Okafor', 'Marchetti', 'Tanaka', 'Novak', 'Haddad', 'Johansson', 'Rossi',
                 'Kowalski', 'Mbeki', 'Duarte', 'Nakamura', 'Fischer', 'Petrov', 'Abara', 'Lund', 'Moreau',
                 'Iyer', 'Kaplan', 'Sandoval', 'Berg', 'Ivanova', 'Cheng', 'Dubois', 'Papadakis', 'Rahman',
                 'Holm', 'Varga', 'Nyström'];

  /* ── The search ──
     lo..hi   years since the PhD that fit the position
     papers / courses   the minimum counts when that priority is on
     fail     years that clearly do not fit                        */
  const POSITIONS = {
    postdoc:   { name: 'Postdoc',             lo: 0,  hi: 3,  papers: 3,  courses: 1,
                 fail: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    assistant: { name: 'Assistant professor', lo: 4,  hi: 9,  papers: 8,  courses: 4,
                 fail: [0, 1, 2, 3, 10, 11, 12, 13, 14, 15, 16, 18, 20] },
    professor: { name: 'Full professor',      lo: 15, hi: 35, papers: 30, courses: 12,
                 fail: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
  };
  const PRIORITIES = { research: 'Research', teaching: 'Teaching', both: 'Both' };

  /* ─── State ──────────────────────────────────────────────── */

  const ROUND = 45;   // seconds

  const S = {
    running: false,
    locked: true,
    sel: { field: 1, pos: 'assistant', prio: 'research' },
    crit: null,
    cand: null,
    score: 0,
    best: Number(localStorage.getItem('hotsingles.best') || 0),
    streak: 0,
    right: 0, total: 0, shortlisted: 0,
    endsAt: 0
  };

  const $ = (id) => document.getElementById(id);
  const elCard = $('card'),   elWhy = $('why'),    elSearch = $('search');
  const elScore = $('score'), elStreak = $('streak'), elBest = $('best');
  const elClock = $('clock'), elFill = $('timer-fill');
  const btnPass = $('pick-pass'), btnLike = $('pick-like');
  const overlay = $('overlay');

  function rnd(a, b) { return a + ((Math.random() * (b - a + 1)) | 0); }
  function pick(a)   { return a[(Math.random() * a.length) | 0]; }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function mult() { return Math.min(5, 1 + Math.floor(S.streak / 4)); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  function yearsText(y) { return y === 0 ? 'PhD this year' : 'PhD ' + plural(y, 'year') + ' ago'; }
  function rangeText(p) { return p.hi >= 30 ? 'PhD ' + p.lo + '+ years ago' : 'PhD ' + p.lo + '–' + p.hi + ' years ago'; }

  function stageOf(y) {
    if (y === 0) return 'Final-year PhD';
    if (y <= 3)  return 'Postdoc';
    if (y <= 6)  return pick(['Assistant professor', 'Assistant professor', 'Senior postdoc']);
    if (y <= 9)  return 'Assistant professor';
    if (y <= 14) return 'Associate professor';
    return 'Professor';
  }

  /* ─── Candidates ─────────────────────────────────────────── */

  function above(min) { return min + rnd(0, Math.ceil(min * 0.7) + 2); }
  function below(min) { return Math.max(0, min - 1 - rnd(0, Math.min(min - 1, Math.ceil(min * 0.5)))); }
  function free(min)  { return rnd(0, min * 2 + 3); }

  function makeCandidate() {
    const c = S.crit, p = c.pos;
    const active = ['field', 'years'];
    if (c.papersMin)  active.push('papers');
    if (c.coursesMin) active.push('courses');

    const bad = {};
    if (Math.random() >= 0.42) {
      const k = Math.random() < 0.25 ? 2 : 1;
      shuffle(active.slice()).slice(0, k).forEach((x) => { bad[x] = true; });
    }

    let field = c.field;
    if (bad.field) field = pick(FIELDS.filter((f) => f !== c.field));

    const years = bad.years ? pick(p.fail) : rnd(p.lo, p.hi);
    const papers  = c.papersMin  ? (bad.papers  ? below(c.papersMin)  : above(c.papersMin))
                                 : free(p.papers);
    const courses = c.coursesMin ? (bad.courses ? below(c.coursesMin) : above(c.coursesMin))
                                 : free(p.courses);

    const first = pick(FIRST), last = pick(LAST);
    const extras = shuffle(EXTRAS.slice()).slice(0, 2);
    extras.push('h-index ' + rnd(3, 38));
    extras.push('likes ' + pick(field.likes));

    return {
      name: first + ' ' + last,
      initials: first[0] + last[0],
      hue: rnd(0, 359),
      field: field, years: years,
      stage: stageOf(years),
      papers: papers, courses: courses,
      bio: Math.random() < 0.5 ? pick(field.bios) : pick(BIO),
      extras: shuffle(extras),
      looking: pick(LOOKING),
      km: Math.random() < 0.12 ? 0 : rnd(2, 9400)
    };
  }

  /* Why a candidate does not fit. Empty means they do. */
  function misses(cand) {
    const c = S.crit, p = c.pos, r = [];
    if (cand.field !== c.field) r.push('their field is ' + cand.field.name.toLowerCase());
    if (cand.years < p.lo || cand.years > p.hi) r.push(yearsText(cand.years).replace('PhD ', 'PhD was '));
    if (c.papersMin && cand.papers < c.papersMin) r.push('only ' + plural(cand.papers, 'paper'));
    if (c.coursesMin && cand.courses < c.coursesMin) r.push('only ' + plural(cand.courses, 'course') + ' taught');
    return r;
  }

  function renderCandidate(cand) {
    const dist = cand.km === 0 ? 'Already in the building' : cand.km.toLocaleString() + ' km away';
    elCard.innerHTML =
      '<div class="stamp stamp-yes">Shortlist</div><div class="stamp stamp-no">Pass</div>' +
      '<div class="who">' +
        '<div class="avatar" style="background:linear-gradient(135deg,hsl(' + cand.hue + ',72%,58%),hsl(' +
          ((cand.hue + 50) % 360) + ',68%,44%))">' + cand.initials + '</div>' +
        '<div class="who-text"><div class="name">' + cand.name + '</div>' +
          '<div class="sub">' + cand.stage + ' · ' + yearsText(cand.years) + '<br>' + dist + '</div></div>' +
        '<span class="active">Active now</span>' +
      '</div>' +
      '<span class="tag">' + cand.field.name + '</span>' +
      '<p class="bio">“' + cand.bio + '”</p>' +
      '<div class="facts">' +
        '<div class="fact"><b>' + cand.papers + '</b><span>Papers</span></div>' +
        '<div class="fact"><b>' + cand.courses + '</b><span>Courses taught</span></div>' +
      '</div>' +
      '<div class="extras">' + cand.extras.map((x) => '<span>' + x + '</span>').join('') + '</div>' +
      '<p class="looking"><b>Looking for:</b> ' + cand.looking + '</p>';
  }

  /* ─── Rounds ─────────────────────────────────────────────── */

  function renderSearch() {
    const c = S.crit;
    const pill = (k, v) => '<span class="pill"><i>' + k + '</i>' + v + '</span>';
    elSearch.innerHTML =
      pill('Field', c.field.name) +
      pill('Position', c.pos.name + ' · ' + rangeText(c.pos)) +
      (c.papersMin  ? pill('Research', '≥ ' + plural(c.papersMin, 'paper')) : '') +
      (c.coursesMin ? pill('Teaching', '≥ ' + plural(c.coursesMin, 'course')) : '');
  }

  function deal(first) {
    S.cand = makeCandidate();
    renderCandidate(S.cand);
    elCard.style.transition = 'none';
    elCard.style.transform = '';
    elCard.style.opacity = '';
    elCard.classList.remove('is-in');
    void elCard.offsetWidth;
    elCard.classList.add('is-in');
    S.locked = false;
    btnPass.disabled = false;
    btnLike.disabled = false;
  }

  function swipe(right) {
    if (!S.running || S.locked) return;
    S.locked = true;
    btnPass.disabled = true;
    btnLike.disabled = true;
    SFX.swipe();

    const r = misses(S.cand);
    const fits = r.length === 0;
    const correct = right === fits;

    S.total++;
    if (right) S.shortlisted++;
    if (correct) {
      S.right++;
      S.streak++;
      const pts = 100 * mult();
      S.score += pts;
      SFX.right();
      elWhy.className = 'why is-good';
      elWhy.textContent = '+' + pts + '  ' + (fits ? 'Meets every criterion.' : 'Pass: ' + r[0] + '.');
    } else {
      S.streak = 0;
      S.score = Math.max(0, S.score - 50);
      SFX.wrong();
      elWhy.className = 'why is-bad';
      elWhy.textContent = '−50  ' + (fits ? 'That one met every criterion.' : 'Should have passed: ' + r.join(', ') + '.');
    }
    render();

    // Fly the card off, then bring the next one.
    const dir = right ? 1 : -1;
    elCard.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
    elCard.style.transform = 'translateX(' + dir * 620 + 'px) rotate(' + dir * 26 + 'deg)';
    elCard.style.opacity = '0';
    setTimeout(() => { if (S.running) deal(); }, 200);
  }

  /* ─── Dragging ───────────────────────────────────────────── */

  let drag = null;

  function setDrag(dx) {
    elCard.style.transform = dx ? 'translateX(' + dx + 'px) rotate(' + dx * 0.05 + 'deg)' : '';
    const yes = elCard.querySelector('.stamp-yes'), no = elCard.querySelector('.stamp-no');
    if (yes) yes.style.opacity = dx > 0 ? Math.min(1, dx / 90) : 0;
    if (no)  no.style.opacity  = dx < 0 ? Math.min(1, -dx / 90) : 0;
  }

  elCard.addEventListener('pointerdown', (e) => {
    if (!S.running || S.locked) return;
    drag = { x: e.clientX };
    elCard.setPointerCapture(e.pointerId);
    elCard.classList.remove('is-in');
    elCard.classList.add('is-drag');
  });
  elCard.addEventListener('pointermove', (e) => {
    if (drag) setDrag(e.clientX - drag.x);
  });
  function endDrag(e, cancelled) {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    drag = null;
    elCard.classList.remove('is-drag');
    if (!cancelled && Math.abs(dx) > 90) swipe(dx > 0);
    else { elCard.style.transition = 'transform 0.2s var(--ease-out)'; setDrag(0); }
  }
  elCard.addEventListener('pointerup',     (e) => endDrag(e, false));
  elCard.addEventListener('pointercancel', (e) => endDrag(e, true));

  /* ─── Loop ───────────────────────────────────────────────── */

  let lastTick = 0;
  function tick() {
    if (!S.running) return;
    const left = Math.max(0, S.endsAt - Date.now());
    const sec = Math.ceil(left / 1000);
    elClock.textContent = sec;
    elFill.style.width = (left / (ROUND * 1000) * 100) + '%';
    const low = left < 10000;
    elFill.classList.toggle('is-low', low);
    elClock.parentNode.classList.toggle('is-low', low);
    if (left < 6000 && sec !== lastTick) { lastTick = sec; SFX.tick(); }
    if (left <= 0) finish();
  }

  function render() {
    elScore.textContent = S.score.toLocaleString();
    elStreak.textContent = '×' + mult();
    elStreak.classList.toggle('is-hot', mult() >= 3);
    elBest.textContent = S.best.toLocaleString();
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }

  function chips(group, items) {
    return '<div class="chips">' + items.map((it) =>
      '<button type="button" class="chip" data-group="' + group + '" data-val="' + it.v + '" aria-pressed="' +
      (String(S.sel[group]) === String(it.v)) + '">' + it.t + '</button>').join('') + '</div>';
  }

  function setupScreen() {
    show(
      '<div class="panel">' +
      '<div class="p-kicker">You are the hiring committee</div>' +
      '<h1 class="p-title">Hot Singles <span>on the Job Market</span></h1>' +
      '<div class="setup">' +
        '<div><h3>Field</h3>' + chips('field', FIELDS.map((f, i) => ({ v: i, t: f.name }))) + '</div>' +
        '<div><h3>Position</h3>' + chips('pos', Object.keys(POSITIONS).map((k) => ({ v: k, t: POSITIONS[k].name }))) + '</div>' +
        '<div><h3>What matters most</h3>' + chips('prio', Object.keys(PRIORITIES).map((k) => ({ v: k, t: PRIORITIES[k] }))) + '</div>' +
      '</div>' +
      '<ul class="rules">' +
        '<li>Candidates arrive one by one. <b>Swipe right</b> (→) if they meet every criterion in the pills at the top, <b>left</b> (←) if not.</li>' +
        '<li>You have <b>' + ROUND + ' seconds</b>. A right swipe scores 100, a wrong one costs 50, and four in a row raise the multiplier.</li>' +
        '<li>Only the pills count. The bios and the extras are decoration, however charming.</li>' +
      '</ul>' +
      '<div class="actions">' +
        '<button class="btn btn-alt" id="random-btn" type="button">Surprise me</button>' +
        '<button class="btn" id="start-btn" type="button">Open the search</button>' +
      '</div>' +
      '<a class="back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
  }

  function finishLine(n) {
    if (n === 0)  return 'An empty shortlist. The position will be re-advertised, with a lower salary.';
    if (n <= 4)   return 'A shortlist of ' + n + '. The committee will now argue about the order until 2028.';
    const hours = Math.round(n * 40 / 60);
    if (n <= 14)  return n + ' shortlisted at 40 minutes each is about ' + hours + ' hours of interviews. The committee has six.';
    return n + ' on the shortlist. The position has been cancelled due to “budget realignment”.';
  }

  function resultScreen() {
    const isBest = S.score > S.best;
    if (isBest) { S.best = S.score; localStorage.setItem('hotsingles.best', String(S.best)); }
    const acc = S.total ? Math.round(100 * S.right / S.total) : 0;
    show(
      '<div class="panel">' +
      '<div class="p-kicker">The search is closed</div>' +
      '<h1 class="p-title">The committee <span>will now deliberate</span></h1>' +
      '<div class="result">' +
        '<div><b>' + S.score.toLocaleString() + '</b><span>Score</span></div>' +
        '<div><b>' + S.right + '/' + S.total + '</b><span>Right swipes</span></div>' +
        '<div><b>' + acc + '%</b><span>Accuracy</span></div>' +
        '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>' +
      (isBest ? '<p class="p-body p-best">A new best.</p>' : '') +
      '<p class="p-body">' + finishLine(S.shortlisted) + '</p>' +
      '<div class="actions">' +
        '<button class="btn btn-alt" id="new-btn" type="button">New search</button>' +
        '<button class="btn" id="same-btn" type="button">Same search again</button>' +
      '</div>' +
      '<a class="back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    render();
  }

  function finish() {
    if (!S.running) return;
    S.running = false;
    S.locked = true;
    btnPass.disabled = true;
    btnLike.disabled = true;
    SFX.over();
    setTimeout(resultScreen, 350);
  }

  function begin() {
    SFX.unlock();
    const f = FIELDS[S.sel.field], p = POSITIONS[S.sel.pos], pr = S.sel.prio;
    S.crit = {
      field: f, pos: p,
      papersMin:  pr === 'teaching' ? 0 : p.papers,
      coursesMin: pr === 'research' ? 0 : p.courses
    };
    overlay.classList.remove('is-open');
    S.score = 0; S.streak = 0; S.right = 0; S.total = 0; S.shortlisted = 0;
    S.running = true;
    S.endsAt = Date.now() + ROUND * 1000;
    elWhy.textContent = '';
    elWhy.className = 'why';
    renderSearch();
    render();
    deal(true);
    tick();
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  overlay.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) {
      const g = chip.dataset.group;
      S.sel[g] = g === 'field' ? Number(chip.dataset.val) : chip.dataset.val;
      overlay.querySelectorAll('.chip[data-group="' + g + '"]').forEach((c) => {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      return;
    }
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'random-btn') {
      S.sel = { field: rnd(0, FIELDS.length - 1),
                pos: pick(Object.keys(POSITIONS)), prio: pick(Object.keys(PRIORITIES)) };
      setupScreen();
    }
    if (b.id === 'start-btn' || b.id === 'same-btn') begin();
    if (b.id === 'new-btn') setupScreen();
  });

  btnPass.addEventListener('click', () => swipe(false));
  btnLike.addEventListener('click', () => swipe(true));

  document.addEventListener('keydown', (e) => {
    if (!S.running) return;
    const k = e.key.toLowerCase();
    if (k === 'arrowleft'  || k === 'a') { e.preventDefault(); swipe(false); }
    if (k === 'arrowright' || k === 'd') { e.preventDefault(); swipe(true); }
  });

  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (!S.running) return;
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt) { S.endsAt += Date.now() - hiddenAt; hiddenAt = 0; }
  });

  render();
  setupScreen();
  setInterval(tick, 100);

})();
