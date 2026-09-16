/* ═══════════════════════════════════════════════════════════
   BLACKBOARD BINGO — sit through a seminar and mark the
   phrases as they land. Stay awake.

   The game used to light up the matching square for you, and
   score your lines by itself. Both are gone: you find the
   phrase on your own card, and a line is worth nothing until
   you call it out loud. What is left to decide is when.
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

  /* Three speakers, same hour. Each says their own habits more often than
     the rest, and each runs the room at their own pace, so the card you were
     dealt is worth more in one room than another. */
  const SPEAKERS = [
    {
      name: 'The Overrunner',
      note: 'Forty minutes of material and twenty-five minutes left. Quick, and there is a great deal of it.',
      calls: 50, callMs: 2800, window: 4200,
      favours: [
        'I will be brief',
        'I am running out of time',
        'Let me skip this slide',
        'I have five more slides',
        'Actually, ten more slides',
        'I have run over, sorry',
        'One final remark',
        'I will come back to this',
        'We will not need this',
        'Now the fun begins',
        'Thank you for your attention'
      ]
    },
    {
      name: 'The Hand-Waver',
      note: 'Everything is standard, obvious, or left to you. An ordinary pace and an extraordinary confidence.',
      calls: 44, callMs: 3200, window: 4600,
      favours: [
        'It is easy to see that…',
        'I leave that as an exercise',
        'This is well known',
        'By abuse of notation',
        'Modulo technical details',
        'Without loss of generality',
        'By a standard argument',
        'This should be obvious',
        'A trivial observation',
        'I will be informal here',
        'Think of it as a black box',
        'The general case is similar',
        'The proof is elementary but long'
      ]
    },
    {
      name: 'The Historian',
      note: 'Credit where it is due, at length. Slower, fewer slides, and rather longer on each one.',
      calls: 38, callMs: 3900, window: 5400,
      favours: [
        'As my student showed',
        'This is joint work with…',
        'A word about the history',
        'My co-author would object',
        'For those who know about…',
        'The details are in the paper',
        'This is the key lemma',
        'There is a subtlety here',
        'The converse is false'
      ]
    }
  ];

  const SIZE     = 5;
  const DRIFT    = 0.9;    // attention lost per second
  const HIT_GAIN = 7;      // attention regained by marking
  const MISS_HIT = 11;     // attention lost by missing one on your card
  const FREE     = '…and so on';

  const Q_USES   = 2;      // questions you may ask in one talk
  const Q_PAUSE  = 6000;   // how long the speaker stops for
  const Q_GAIN   = 28;     // attention a question buys back
  const Q_COST   = 2;      // extra slides they now have to get through

  const C_USES   = 1;      // trips to the coffee urn
  const C_GAIN   = 50;
  const C_AWAY   = 2;      // slides that happen while you are out

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
    live: null,          // { phrase, endsAt, onCard, away }
    scored: {},          // lines already called and paid for
    callTimer: null,
    cfg: null,           // the speaker's pace, copied so the run can bend it
    questions: Q_USES,
    coffee: C_USES,
    away: 0,             // slides still to pass without you
    paused: false
  };

  const elCard  = document.getElementById('card');
  const elSlide = document.getElementById('slide');
  const elTag   = document.getElementById('slide-tag');
  const elBar   = document.getElementById('call-timer');
  const elScore = document.getElementById('score');
  const elLines = document.getElementById('lines');
  const elBest  = document.getElementById('best');
  const elCalls = document.getElementById('calls');
  const elAtt   = document.getElementById('attention');
  const elCall  = document.getElementById('call');
  const elAsk   = document.getElementById('ask');
  const elCoffee= document.getElementById('coffee');
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

  /* The speaker's own phrases go into the running order twice, everything
     else once, so their habits come round about twice as often. */
  function buildOrder(spk) {
    const fav  = PHRASES.filter((p) => spk.favours.indexOf(p) >= 0);
    const rest = PHRASES.filter((p) => spk.favours.indexOf(p) < 0);
    return shuffle(fav.concat(fav, rest));
  }

  /* ─── Calls ──────────────────────────────────────────────── */

  function nextCall() {
    if (!S.running || S.paused) return;

    if (S.calls >= S.cfg.calls) { endTalk(); return; }
    S.calls++;

    const phrase = S.order[(S.calls - 1) % S.order.length];
    const idx = S.card.indexOf(phrase);
    const away = S.away > 0;
    if (away) S.away--;

    S.live = {
      phrase: phrase,
      endsAt: Date.now() + S.cfg.window,
      onCard: idx >= 0 && !S.marked[idx],
      away: away
    };

    elTag.textContent = away ? 'Slide ' + S.calls + ' — you are still in the corridor'
                             : 'Slide ' + S.calls;
    elSlide.textContent = '“' + phrase + '”';
    elSlide.classList.toggle('is-away', away);
    elSlide.classList.remove('is-new');
    void elSlide.offsetWidth;
    elSlide.classList.add('is-new');
    SFX.say();

    // The square is deliberately NOT lit. Finding it is the game.

    render();
    S.callTimer = setTimeout(nextCall, S.cfg.callMs);
  }

  function closeCall() {
    if (!S.live) return;
    const idx = S.card.indexOf(S.live.phrase);
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

  function shake(i, cls) {
    elCard.children[i].classList.add(cls);
    setTimeout(() => elCard.children[i].classList.remove(cls), 420);
  }

  function mark(i) {
    if (!S.running || S.marked[i]) return;

    // Out of the room: you can hear nothing and mark nothing, but it costs
    // no extra focus to try.
    if (S.live && S.live.away) { shake(i, 'is-wrong'); return; }

    if (!S.live || S.live.phrase !== S.card[i]) {
      // Marking something that was not just said costs a little focus.
      S.attention -= 4;
      shake(i, 'is-wrong');
      render();
      return;
    }

    S.marked[i] = true;
    S.live.onCard = false;
    elCard.children[i].classList.add('is-marked');
    S.attention = Math.min(100, S.attention + HIT_GAIN);
    S.score += 40;
    SFX.mark();
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

  function readyLines() {
    return LINES.filter((l) => !S.scored[l.id] && l.cells.every((i) => S.marked[i]));
  }

  /* Nothing scores until you say it out loud, and several lines called
     together are worth far more than the same lines called one at a time.
     Holding on is the whole decision: the talk may end first, or you may
     fall asleep, and an uncalled line is worth nothing at all. */
  function callBingo() {
    if (!S.running) return;
    const ready = readyLines();

    if (!ready.length) {
      S.attention -= 12;
      S.score = Math.max(0, S.score - 200);
      SFX.miss();
      elCall.classList.add('is-bad');
      setTimeout(() => elCall.classList.remove('is-bad'), 500);
      flash('Nothing to call. The room turns round.');
      render();
      return;
    }

    const n = ready.length;
    const gained = 500 * n + 400 * n * (n - 1);
    ready.forEach((line) => {
      S.scored[line.id] = true;
      line.cells.forEach((i, k) => {
        setTimeout(() => {
          elCard.children[i].classList.add('is-line');
          setTimeout(() => elCard.children[i].classList.remove('is-line'), 700);
        }, k * 70);
      });
    });
    S.lines += n;
    S.score += gained;
    S.attention = Math.min(100, S.attention + 8 * n);
    SFX.line();
    flash(n === 1 ? 'Bingo — one line. +' + gained
                  : 'Bingo — ' + n + ' lines at once. +' + gained);
    render();
  }

  /* ─── The two things you can actually do ─────────────────── */

  function askQuestion() {
    if (!S.running || S.paused || S.questions <= 0) return;
    S.questions--;
    S.paused = true;
    clearTimeout(S.callTimer);

    // The speaker stops, so whatever was on screen passes without penalty.
    S.live = null;
    elBar.style.width = '0%';

    S.attention = Math.min(100, S.attention + Q_GAIN);
    S.cfg.calls += Q_COST;      // and now they are further behind than ever

    elTag.textContent = 'You asked a question';
    elSlide.textContent = '“That is a good question.”';
    elSlide.classList.remove('is-away', 'is-new');
    void elSlide.offsetWidth;
    elSlide.classList.add('is-new');
    SFX.mark();
    render();

    setTimeout(() => {
      if (!S.running) return;
      S.paused = false;
      S.callTimer = setTimeout(nextCall, 200);
    }, Q_PAUSE);
  }

  function getCoffee() {
    if (!S.running || S.coffee <= 0) return;
    S.coffee--;
    S.attention = Math.min(100, S.attention + C_GAIN);
    S.away = C_AWAY;
    SFX.mark();
    flash('You slip out to the urn. Two slides go by without you.');
    render();
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
      elBar.style.width = Math.max(0, (leftMs / S.cfg.window) * 100) + '%';
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
    elCalls.textContent = S.calls + ' / ' + (S.cfg ? S.cfg.calls : '—');
    elAtt.style.width = Math.max(0, S.attention) + '%';
    elAtt.classList.toggle('is-low', S.attention < 30);

    // "Ready" is shown, the count is not: whether to call now or hold for a
    // second line is a judgement you make by looking at your own card.
    elCall.classList.toggle('is-ready', S.running && readyLines().length > 0);
    elCall.disabled = !S.running;

    elAsk.disabled = !S.running || S.paused || S.questions <= 0;
    elAsk.querySelector('b').textContent = S.questions;
    elCoffee.disabled = !S.running || S.coffee <= 0;
    elCoffee.querySelector('b').textContent = S.coffee;
  }

  /* ─── Endings ────────────────────────────────────────────── */

  function stop() {
    S.running = false;
    S.paused = false;
    clearTimeout(S.callTimer);
    if (S.score > S.best) { S.best = S.score; localStorage.setItem('bingo.best', String(S.best)); }
  }

  function uncalledNote() {
    const n = readyLines().length;
    if (!n) return '';
    return '<p class="sheet-body sheet-warn">' + (n === 1
      ? 'You had a completed line you never called. It counted for nothing.'
      : 'You had ' + n + ' completed lines you never called. They counted for nothing.') + '</p>';
  }

  function doze() {
    stop();
    SFX.doze();
    show(
      '<div class="sheet">' +
      '<div class="sheet-kicker">You fell asleep</div>' +
      '<h1 class="sheet-title">Head down<br><span>in the back row</span></h1>' +
      '<p class="sheet-body">You went under during slide ' + S.calls + ' of ' + S.cfg.calls +
      '. Someone will tell you it was a good talk.</p>' +
      uncalledNote() + results() +
      '<button class="btn" id="again-btn">Attend another</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', speakerScreen);
  }

  function endTalk() {
    const left = readyLines().length;
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
        : (S.lines ? 'You called it, and nobody else in the room knows.'
                   : 'No line called. You did stay awake, which is its own achievement.')) + '</p>' +
      (left ? uncalledNote() : '') + results() +
      '<button class="btn" id="again-btn">Attend another</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('again-btn').addEventListener('click', speakerScreen);
  }

  function results() {
    return '<div class="result">' +
      '<div><b>' + S.score.toLocaleString() + '</b><span>Score</span></div>' +
      '<div><b>' + S.lines + '</b><span>Called</span></div>' +
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
      '<strong>If it is on your card, find it and mark it</strong> before they move on. ' +
      'Nothing points it out for you.</p>' +
      '<ul class="sheet-rules">' +
        '<li>Missing one that was on your card costs attention. So does marking a square nobody said.</li>' +
        '<li>Five in a row is a line &mdash; but a line pays nothing until you <strong>call bingo</strong>, and several called at once are worth far more than one at a time.</li>' +
        '<li>Call with nothing ready and the room turns round to look at you.</li>' +
        '<li>You may ask two questions and fetch one coffee. Both buy attention, and both cost you something.</li>' +
        '<li>Attention drains anyway. At zero you fall asleep.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Choose a seminar</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    document.getElementById('start-btn').addEventListener('click', speakerScreen);
  }

  /* The card is dealt before the room is chosen, so the choice is a real
     one: you can see which speaker's habits you are already holding. */
  function speakerScreen() {
    buildCard();
    S.cfg = null;
    S.running = false;
    render();

    const rows = SPEAKERS.map((spk, i) => {
      const overlap = S.card.filter((p) => spk.favours.indexOf(p) >= 0).length;
      return '<button type="button" class="pick" data-i="' + i + '">' +
        '<span class="pick-name">' + spk.name + '</span>' +
        '<span class="pick-note">' + spk.note + '</span>' +
        '<span class="pick-count">' + overlap + ' of your squares ' +
          (overlap === 1 ? 'is one of their habits' : 'are among their habits') + '</span>' +
        '</button>';
    }).join('');

    show(
      '<div class="sheet sheet-wide">' +
      '<div class="sheet-kicker">Three talks, the same hour</div>' +
      '<h1 class="sheet-title">Which <span>seminar?</span></h1>' +
      '<p class="sheet-body">Your card is already dealt. Pick the speaker most likely to say what is on it.</p>' +
      '<div class="picks">' + rows + '</div>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    overlay.querySelectorAll('.pick').forEach((b) => {
      b.addEventListener('click', () => start(SPEAKERS[Number(b.getAttribute('data-i'))]));
    });
  }

  function start(spk) {
    SFX.unlock();
    overlay.classList.remove('is-open');
    clearTimeout(S.callTimer);

    // A copy, because asking questions lengthens the talk and the speaker
    // must be their old self again next time.
    S.cfg = { name: spk.name, calls: spk.calls, callMs: spk.callMs, window: spk.window };

    S.score = 0; S.lines = 0; S.attention = 100; S.calls = 0;
    S.scored = {}; S.live = null;
    S.questions = Q_USES; S.coffee = C_USES; S.away = 0; S.paused = false;
    S.order = buildOrder(spk);
    S.running = true;
    last = Date.now();
    elTag.textContent = spk.name + ' begins';
    elSlide.textContent = '—';
    elSlide.classList.remove('is-away');
    render();
    S.callTimer = setTimeout(nextCall, 1200);
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  elCall.addEventListener('click', callBingo);
  elAsk.addEventListener('click', askQuestion);
  elCoffee.addEventListener('click', getCoffee);

  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (!S.running) return;
    if (document.hidden) { hiddenAt = Date.now(); clearTimeout(S.callTimer); }
    else if (hiddenAt) {
      const gap = Date.now() - hiddenAt;
      if (S.live) S.live.endsAt += gap;
      last = Date.now();
      hiddenAt = 0;
      if (!S.paused) S.callTimer = setTimeout(nextCall, 600);
    }
  });

  buildCard();
  render();
  startScreen();
  setInterval(tick, 90);

})();
