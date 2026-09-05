/* ═══════════════════════════════════════════════════════════
   BLACKBOARD BINGO — sit through a seminar and mark the
   phrases as they land. Stay awake.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const PHRASES = [
    'It is easy to see that…',
    'I leave that as an exercise',
    'I will be brief',
    'Can everyone see the back board?',
    'This is well known',
    'By abuse of notation',
    'Modulo technical details',
    'The details are in the paper',
    'I am running out of time',
    'Let me skip this slide',
    'Questions? No? Good',
    'As my student showed',
    'This is joint work with…',
    'Without loss of generality',
    'By a standard argument',
    'The proof is elementary but long',
    'A word about the history',
    'Sorry, this slide is busy',
    'Is this readable at the back?',
    'I will come back to this',
    'This is the key lemma',
    'Now the fun begins',
    'I have five more slides',
    'Actually, ten more slides',
    'Does anyone have chalk?',
    'Is the microphone on?',
    'Let me find that slide',
    'This generalises, of course',
    'The converse is false',
    'We will not need this',
    'In characteristic zero',
    'Up to isomorphism',
    'A trivial observation',
    'For those who know about…',
    'I will be informal here',
    'This should be obvious',
    'There is a subtlety here',
    'I have run over, sorry',
    'One final remark',
    'Thank you for your attention',
    'The general case is similar',
    'I have forgotten the constant',
    'My co-author would object',
    'Think of it as a black box'
  ];

  const SIZE     = 5;
  const CALLS    = 44;
  const CALL_MS  = 3200;   // between calls
  const WINDOW   = 4600;   // how long a call stays markable
  const DRIFT    = 0.9;    // attention lost per second
  const HIT_GAIN = 7;      // attention regained by marking
  const MISS_HIT = 11;     // attention lost by missing one on your card
  const FREE     = '…and so on';

  const S = {
    running: false,
    score: 0,
    best: Number(localStorage.getItem('bingo.best') || 0),
    lines: 0,
    attention: 100,
    calls: 0,
    card: [],
    marked: [],
    order: [],
    live: null,          // { phrase, endsAt, onCard }
    scored: {},          // which lines already counted
    callTimer: null
  };

  const elCard = document.getElementById('card');
  const elSlide = document.getElementById('slide');
  const elTag = document.getElementById('slide-tag');
  const elBar = document.getElementById('call-timer');
  const elScore = document.getElementById('score');
  const elLines = document.getElementById('lines');
  const elBest = document.getElementById('best');
  const elCalls = document.getElementById('calls');
  const elAtt = document.getElementById('attention');
  const overlay = document.getElementById('overlay');

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ─── Card ───────────────────────────────────────────────── */

  function buildCard() {
    const picks = shuffle(PHRASES.slice()).slice(0, SIZE * SIZE - 1);
    S.card = [];
    S.marked = [];
    const mid = (SIZE * SIZE - 1) / 2;
    for (let i = 0, p = 0; i < SIZE * SIZE; i++) {
      if (i === mid) { S.card.push(FREE); S.marked.push(true); }
      else { S.card.push(picks[p++]); S.marked.push(false); }
    }

    elCard.innerHTML = '';
    S.card.forEach((phrase, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sq' + (i === mid ? ' is-free is-marked' : '');
      b.innerHTML = '<span>' + phrase + '</span>';
      b.addEventListener('click', () => mark(i));
      elCard.appendChild(b);
    });
  }

  /* ─── Calls ──────────────────────────────────────────────── */

  function nextCall() {
    if (!S.running) return;

    if (S.calls >= CALLS) { endTalk(); return; }
    S.calls++;

    const phrase = S.order[(S.calls - 1) % S.order.length];
    const idx = S.card.indexOf(phrase);
    S.live = { phrase: phrase, endsAt: Date.now() + WINDOW, onCard: idx >= 0 && !S.marked[idx] };

    elTag.textContent = 'Slide ' + S.calls;
    elSlide.textContent = '“' + phrase + '”';
    elSlide.classList.remove('is-new');
    void elSlide.offsetWidth;
    elSlide.classList.add('is-new');
    SFX.say();

    // Light up the square if it is on the card and still open.
    if (idx >= 0 && !S.marked[idx]) elCard.children[idx].classList.add('is-live');

    render();
    S.callTimer = setTimeout(nextCall, CALL_MS);
  }

  function closeCall() {
    if (!S.live) return;
    const idx = S.card.indexOf(S.live.phrase);
    if (idx >= 0) elCard.children[idx].classList.remove('is-live');
    if (S.live.onCard) {
      S.attention -= MISS_HIT;
      SFX.miss();
      if (idx >= 0) {
        elCard.children[idx].classList.add('is-lost');
        setTimeout(() => elCard.children[idx].classList.remove('is-lost'), 500);
      }
    }
    S.live = null;
    render();
  }

  function mark(i) {
    if (!S.running || S.marked[i]) return;
    if (!S.live || S.live.phrase !== S.card[i]) {
      // Marking something that was not just said costs a little focus.
      S.attention -= 4;
      elCard.children[i].classList.add('is-wrong');
      setTimeout(() => elCard.children[i].classList.remove('is-wrong'), 400);
      render();
      return;
    }

    S.marked[i] = true;
    S.live.onCard = false;
    elCard.children[i].classList.remove('is-live');
    elCard.children[i].classList.add('is-marked');
    S.attention = Math.min(100, S.attention + HIT_GAIN);
    S.score += 40;
    SFX.mark();
    checkLines();
    render();
  }

  /* ─── Lines ──────────────────────────────────────────────── */

  function lineSets() {
    const out = [];
    for (let r = 0; r < SIZE; r++) out.push({ id: 'r' + r, cells: Array.from({ length: SIZE }, (_, c) => r * SIZE + c) });
    for (let c = 0; c < SIZE; c++) out.push({ id: 'c' + c, cells: Array.from({ length: SIZE }, (_, r) => r * SIZE + c) });
    out.push({ id: 'd0', cells: Array.from({ length: SIZE }, (_, i) => i * SIZE + i) });
    out.push({ id: 'd1', cells: Array.from({ length: SIZE }, (_, i) => i * SIZE + (SIZE - 1 - i)) });
    return out;
  }

  const LINES = lineSets();

  function checkLines() {
    for (const line of LINES) {
      if (S.scored[line.id]) continue;
      if (line.cells.every((i) => S.marked[i])) {
        S.scored[line.id] = true;
        S.lines++;
        S.score += 500;
        S.attention = Math.min(100, S.attention + 14);
        SFX.line();
        line.cells.forEach((i, n) => {
          setTimeout(() => {
            elCard.children[i].classList.add('is-line');
            setTimeout(() => elCard.children[i].classList.remove('is-line'), 700);
          }, n * 70);
        });
        flash('Bingo — ' + S.lines + (S.lines === 1 ? ' line' : ' lines'));
      }
    }
  }

  function flash(text) {
    const n = document.createElement('div');
    n.className = 'flash';
    n.textContent = text;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1500);
  }

  /* ─── Loop ───────────────────────────────────────────────── */

  let last = Date.now();

  function tick() {
    if (!S.running) return;
    const now = Date.now();
    const dt = Math.min(500, now - last) / 1000;
    last = now;

    S.attention -= DRIFT * dt;

    if (S.live) {
      const leftMs = S.live.endsAt - now;
      elBar.style.width = Math.max(0, (leftMs / WINDOW) * 100) + '%';
      if (leftMs <= 0) closeCall();
    } else {
      elBar.style.width = '0%';
    }

    if (S.attention <= 0) { S.attention = 0; render(); doze(); return; }
    render();
  }

  function render() {
    elScore.textContent = S.score.toLocaleString();
    elLines.textContent = S.lines;
    elBest.textContent = S.best.toLocaleString();
    elCalls.textContent = S.calls + ' / ' + CALLS;
    elAtt.style.width = Math.max(0, S.attention) + '%';
    elAtt.classList.toggle('is-low', S.attention < 30);
  }

  /* ─── Endings ────────────────────────────────────────────── */

  function stop() {
    S.running = false;
    clearTimeout(S.callTimer);
    if (S.score > S.best) { S.best = S.score; localStorage.setItem('bingo.best', String(S.best)); }
  }

  function doze() {
    stop();
    SFX.doze();
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">You fell asleep</div>' +
      '<h1 class="sheet-title">Head down<br><span>in the back row</span></h1>' +
      '<p class="sheet-body">You went under during slide ' + S.calls + ' of ' + CALLS +
      '. Someone will tell you it was a good talk.</p>' +
      results() +
      '<button class="btn" id="again-btn">Attend another</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', start);
  }

  function endTalk() {
    stop();
    const full = S.marked.every(Boolean);
    if (full) S.score += 1200;
    SFX.applause();
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">' + (full ? 'Full house' : 'The talk has ended') + '</div>' +
      '<h1 class="sheet-title">' + (full
        ? 'You marked<br><span>every square</span>'
        : 'Polite<br><span>applause</span>') + '</h1>' +
      '<p class="sheet-body">' + (full
        ? 'A complete card. You have either been to a great many seminars or this was a very ordinary one.'
        : (S.lines ? 'You got there. Nobody else in the room knows.'
                   : 'No line. You did stay awake, which is its own achievement.')) + '</p>' +
      results() +
      '<button class="btn" id="again-btn">Attend another</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', start);
  }

  function results() {
    return '<div class="result">' +
      '<div><b>' + S.score.toLocaleString() + '</b><span>Score</span></div>' +
      '<div><b>' + S.lines + '</b><span>Lines</span></div>' +
      '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>';
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }

  function startScreen() {
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">Thursday, 4pm, room B12</div>' +
      '<h1 class="sheet-title">Blackboard <span>Bingo</span></h1>' +
      '<p class="sheet-body">The speaker begins. Every phrase they say goes up on the screen. ' +
      '<strong>If it is on your card, mark it</strong> before they move on.</p>' +
      '<ul class="sheet-rules">' +
        '<li>A phrase stays markable for about four and a half seconds.</li>' +
        '<li>Missing one that was on your card costs attention. So does marking a square nobody said.</li>' +
        '<li>Attention drains anyway. At zero you fall asleep and the game ends.</li>' +
        '<li>Five in a row — across, down or corner to corner — is a line.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Take a seat at the back</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('start-btn').addEventListener('click', start);
  }

  function start() {
    SFX.unlock();
    overlay.classList.remove('is-open');
    clearTimeout(S.callTimer);
    S.score = 0; S.lines = 0; S.attention = 100; S.calls = 0;
    S.scored = {}; S.live = null;
    buildCard();
    // The call list is drawn from every phrase, so plenty of them miss your card.
    S.order = shuffle(PHRASES.slice());
    S.running = true;
    last = Date.now();
    elTag.textContent = 'The speaker begins';
    elSlide.textContent = '—';
    render();
    S.callTimer = setTimeout(nextCall, 1100);
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (!S.running) return;
    if (document.hidden) { hiddenAt = Date.now(); clearTimeout(S.callTimer); }
    else if (hiddenAt) {
      const gap = Date.now() - hiddenAt;
      if (S.live) S.live.endsAt += gap;
      last = Date.now();
      hiddenAt = 0;
      S.callTimer = setTimeout(nextCall, 600);
    }
  });

  buildCard();
  render();
  startScreen();
  setInterval(tick, 90);

})();
