/* ═══════════════════════════════════════════════════════════
   SHOULD I ASK A QUESTION? — at the faculty meeting.
   Every scenario is assembled from the lists below, and in every
   one of them the correct answer is the same.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── The writing. Edit freely: each list is independent. ── */

  const WHO = [
    'a tenured full professor',
    'an associate professor, tenured last spring',
    'an assistant professor, tenure review in 14 months',
    'a postdoc, invited “just to listen”',
    'the newest hire, three weeks in',
    'an emeritus who still attends',
    'the deputy head of department',
    'the PhD-student representative',
    'the chair of the previous working group'
  ];

  /* h, m  set the wall clock.  no  is what you read if you stay seated. */
  const WHEN = [
    { h: 9,  m: 5,  s: '09:05. Nobody has had coffee yet.',
      no: 'Coffee first, questions second. Questions never.' },
    { h: 10, m: 40, s: '10:40. The fika break has been announced.',
      no: 'The cinnamon buns are still warm. You are a hero to forty people.' },
    { h: 11, m: 52, s: '11:52. Lunch is in eight minutes.',
      no: 'Lunch starts on time. A stomach somewhere sends its thanks.' },
    { h: 13, m: 10, s: '13:10. Everyone is digesting.',
      no: 'The room stays calmly drowsy. Nobody will be woken up today.' },
    { h: 15, m: 30, s: '15:30. The projector fan is the loudest thing here.',
      no: 'The fan gets the last word. As is only right.' },
    { h: 16, m: 40, s: '16:40. It is a Friday.',
      no: 'You are home with the weekend still intact.' },
    { h: 17, m: 20, s: '17:20. The meeting was meant to end at 17:00.',
      no: 'The meeting ends in four minutes. Nobody will believe it.' }
  ];

  /* n  is the number of people in the room. */
  const ROOM = [
    { n: 6,  s: 'Six people round a table.' },
    { n: 3,  s: 'You, the chair, and a very bored minute-taker.' },
    { n: 15, s: 'Fifteen people, eleven of them answering email.' },
    { n: 22, s: 'A Zoom meeting: 22 attendees, 19 cameras off.' },
    { n: 40, s: 'Forty people in a lecture theatre built for 120.' },
    { n: 60, s: 'Sixty people, two of them asleep, one of them the Dean.' },
    { n: 90, s: 'A hybrid meeting with 90 people and an echo.' }
  ];

  const TOPIC = [
    'the new parking allocation',
    'curriculum reform (again)',
    'the five-year strategic plan',
    'migration of the room-booking system',
    'next year’s budget',
    'the new coffee machine',
    'a revised template for course syllabi',
    'the working group on working groups',
    'the external evaluation report',
    'GDPR and the lecture recordings',
    'the faculty’s new slogan',
    'electronic signatures on travel claims',
    'the redesign of the intranet',
    'an update on the update'
  ];

  /* What you were about to say. Works with any topic. */
  const QUESTION = [
    'Sorry, what does that abbreviation stand for?',
    'Could we take a step back and clarify the goal?',
    'Is this the final version of the proposal?',
    'Has anyone checked how this affects the PhD students?',
    'I just want to understand the rationale.',
    'Out of curiosity, what is the budget for this?',
    'Is that per year, or in total?',
    'Who decided this, and when?',
    'This may be a stupid question, but…',
    'Does this also apply to us?',
    'Would it be possible to see the slide again?',
    'Isn’t this what we decided last spring?',
    'What would the alternative have been?',
    'Could somebody please define “strategic”?',
    'Is there a document on this?',
    'Sorry, I missed the last ten minutes. Where are we?',
    'Wasn’t there a deadline for this already?',
    'Just a quick one, for my own understanding…',
    'Who will actually do the work?',
    'Are we allowed to say no to this?'
  ];

  /* Extra pressure on the hand. Each one has its own reply for staying seated. */
  const CIRC = [
    { s: 'The chair has just said: “Any questions?”',
      no: '“Any questions?” is a figure of speech. Silence is the traditional reply.' },
    { s: 'The answer is on the next slide.',
      no: 'It was on the next slide. It is always on the next slide.' },
    { s: 'The answer is on slide 41 of 41.',
      no: 'You have stayed to the end of the deck, and so have all of the others.' },
    { s: 'You genuinely do not understand the item.',
      no: 'Nobody does. That is how it passed last time.' },
    { s: 'The speaker made a small mistake on the slide.',
      no: 'You send a friendly email. Nobody has ever lost a minute to an email.' },
    { s: 'The Dean is in the room.',
      no: 'The Dean has already remembered your name once. Do not make it a habit.' },
    { s: 'It is about your own course.',
      no: 'The corridor exists for exactly this, in exactly four minutes.' },
    { s: 'It would take ten seconds to answer.',
      no: 'Ten seconds to answer, plus thirty-five minutes of consequences.' },
    { s: 'Nobody else seems to know the answer either.',
      no: 'It will be settled by an email beginning “As discussed…”' },
    { s: 'Someone else has just asked what you were about to ask.',
      no: 'It is being answered. Savour the rare feeling of being redundant.' },
    { s: 'You are on the committee that decides this.',
      no: 'Then you will hear the answer in committee. At greater length.' },
    { s: 'It is a really good question.',
      no: 'Good questions are the most dangerous kind. They get follow-ups.' },
    { s: 'It has already been asked twice.',
      no: 'Third time lucky is not a thing at faculty meetings.' },
    { s: 'It is a yes/no question.',
      no: 'There are no yes/no questions here. Only invitations to make a statement.' },
    { s: 'You only want to “clarify one small thing”.',
      no: 'Small things clarified at faculty meetings have been known to take 25 minutes.' },
    { s: 'It is the last item on the agenda.',
      no: 'Last item, everyone’s coat is on. Bring cake next time instead.' },
    { s: 'Your question could save the department money.',
      no: 'A subcommittee will look into it. The savings arrive in 2031.' },
    { s: 'The speaker looks at you hopefully.',
      no: 'The speaker was looking at the clock. They are the only one who is.' }
  ];

  /* When you stay seated and nothing more specific fits. */
  const NO_GENERIC = [
    'Home in time for dinner.',
    'The meeting ends on time. Historic.',
    'A colleague nods at you across the table. Quiet respect.',
    'Nobody will ever know what you were going to ask. That is the point.',
    'The question can be rephrased in the corridor, and will be better there.',
    'Your question is now a draft email. It will never be sent. Perfect.',
    'You saved the room a discussion with no result.',
    'Somebody else asks it ten minutes later, in worse words. You feel a calm.',
    'The minutes will say: “There were no questions.” Frame it.',
    'You looked at the table with an expression of mild interest. A classic.'
  ];

  /* When you ask. {m} is the overrun in minutes. */
  const YES = [
    'The answer is four words long. The discussion of the answer lasts fifteen minutes.',
    'Someone says “Good question.” That is not a compliment. It is a warning.',
    'You have been asked to form a working group on it.',
    'The meeting now ends {m} minutes late. People will remember.',
    '“Let’s take that offline.” Offline means you.',
    'A colleague sighs. A very quiet sigh, with an audible audience.',
    'Three follow-up questions follow. Two of them are about something else.',
    'You are now taking the minutes.',
    'The answer was on slide 14. The chair goes back to slide 14.',
    'The meeting overruns by {m} minutes. Lunch goes cold.',
    'Somebody replies “as I said in my email on the 3rd.” You have not read it.',
    'The Dean answers at length. You will not be asking again.',
    'A subcommittee is formed to answer the question. You are a member.'
  ];

  const HAND_UP = 'Your hand went up on its own. This has happened before. ';

  /* ─── State ──────────────────────────────────────────────── */

  const TOTAL = 20;
  const MAX_LIVES = 3;

  const S = {
    running: false,
    score: 0,
    best: Number(localStorage.getItem('facultymeeting.best') || 0),
    streak: 0,
    lives: MAX_LIVES,
    done: 0,
    scenario: null,
    circBag: [],
    limit: 0,
    endsAt: 0,
    locked: true
  };

  const $ = (id) => document.getElementById(id);
  const elPaper  = $('paper'),   elMark   = $('mark'),    elWhy   = $('why');
  const elScore  = $('score'),   elStreak = $('streak'),  elBest  = $('best');
  const elLives  = $('lives'),   elFill   = $('hand-fill'), elHand = $('hand-icon');
  const elCount  = $('item-count');
  const elHour   = $('clock-hour'), elMin = $('clock-min');
  const btnNo    = $('pick-no'), btnAsk   = $('pick-ask');
  const overlay  = $('overlay');

  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function mult()    { return Math.min(5, 1 + Math.floor(S.streak / 3)); }
  function timeFor() { return Math.max(3.1, 5 - S.done * 0.1); }

  /* ─── Rounds ─────────────────────────────────────────────── */

  function build() {
    const useCirc = Math.random() < Math.min(0.75, 0.3 + S.done * 0.03);
    let circ = null;
    if (useCirc) {
      if (!S.circBag.length) S.circBag = shuffle(CIRC.slice());
      circ = S.circBag.pop();
    }
    return {
      who: pick(WHO), when: pick(WHEN), room: pick(ROOM),
      topic: pick(TOPIC), q: pick(QUESTION), circ: circ
    };
  }

  function setClock(h, m) {
    elHour.setAttribute('transform', 'rotate(' + ((h % 12) * 30 + m * 0.5) + ' 50 50)');
    elMin.setAttribute('transform', 'rotate(' + (m * 6) + ' 50 50)');
  }

  function deal() {
    const sc = S.scenario = build();
    S.locked = false;

    // Restart the entrance animation on the same element.
    elPaper.className = 'paper';
    void elPaper.offsetWidth;

    $('f-who').textContent   = sc.who;
    $('f-when').textContent  = sc.when.s;
    $('f-room').textContent  = sc.room.s;
    $('f-topic').textContent = sc.topic;
    $('row-circ').hidden = !sc.circ;
    $('f-circ').textContent = sc.circ ? sc.circ.s : '';
    $('thought').textContent = '“' + sc.q + '”';
    setClock(sc.when.h, sc.when.m);

    elMark.textContent = '';
    elWhy.textContent = '';
    elWhy.className = 'why';
    elFill.style.width = '0%';
    elFill.classList.remove('is-high');
    elHand.style.left = '0%';
    elHand.classList.remove('is-up');
    elCount.textContent = 'Item ' + (S.done + 1) + ' of ' + TOTAL;
    btnNo.disabled = false;
    btnAsk.disabled = false;

    S.limit = timeFor();
    S.endsAt = Date.now() + S.limit * 1000;
    SFX.deal();
    render();
  }

  function lock() {
    S.locked = true;
    btnNo.disabled = true;
    btnAsk.disabled = true;
  }

  function resolve(asked, timedOut) {
    if (!S.running || S.locked) return;
    lock();
    const sc = S.scenario;
    S.done++;

    if (!asked) {
      SFX.right();
      const pts = sc.room.n * 10 * mult();
      S.score += pts;
      S.streak++;
      const r = Math.random();
      const line = (sc.circ && r < 0.7) ? sc.circ.no
                 : (r < 0.5)            ? sc.when.no
                 :                        pick(NO_GENERIC);
      elPaper.classList.add('is-right');
      elMark.textContent = '✓';
      elWhy.className = 'why is-good';
      elWhy.textContent = 'Stayed seated. ' + line + '   +' + pts.toLocaleString();
    } else {
      SFX.wrong();
      S.streak = 0;
      S.lives--;
      const m = 8 + ((Math.random() * 28) | 0);
      elPaper.classList.add('is-wrong');
      elMark.textContent = timedOut ? '✋' : '✗';
      elFill.style.width = '100%';
      elFill.classList.add('is-high');
      elHand.style.left = '100%';
      elHand.classList.add('is-up');
      elWhy.className = 'why is-bad';
      elWhy.textContent = (timedOut ? HAND_UP : 'You asked. ') + pick(YES).replace('{m}', m);
    }

    render();
    if (S.lives <= 0) { setTimeout(lose, 2200); return; }
    if (S.done >= TOTAL) { setTimeout(win, 1800); return; }
    setTimeout(deal, asked ? 3000 : 2100);
  }

  /* ─── Loop ───────────────────────────────────────────────── */

  let lastTick = 0;
  function tick() {
    if (!S.running || S.locked) return;
    const left = S.endsAt - Date.now();
    const used = Math.max(0, Math.min(1, 1 - left / (S.limit * 1000)));
    elFill.style.width = (used * 100) + '%';
    elHand.style.left = (used * 100) + '%';
    elFill.classList.toggle('is-high', used > 0.62);
    const whole = Math.ceil(left / 1000);
    if (left < 2000 && whole !== lastTick) { lastTick = whole; SFX.tick(); }
    if (left <= 0) resolve(true, true);
  }

  function render() {
    elScore.textContent = S.score.toLocaleString();
    elStreak.textContent = '×' + mult();
    elStreak.classList.toggle('is-hot', mult() >= 3);
    elBest.textContent = S.best.toLocaleString();
    [...elLives.querySelectorAll('i')].forEach((m, i) => {
      m.classList.toggle('is-gone', i >= S.lives);
    });
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }

  /* The flowchart this game is based on. */
  function flowchart() {
    return (
      '<details class="flow"><summary>See the flowchart</summary><div class="flow-chart">' +
        '<div class="fc-box">Do you have a question?</div>' +
        '<div class="fc-arrow">yes</div>' +
        '<div class="fc-box">Could it be an email?</div>' +
        '<div class="fc-side">yes: send it. Then stop.</div>' +
        '<div class="fc-arrow">no</div>' +
        '<div class="fc-box">Would you be happy to stay 45 minutes longer for it?</div>' +
        '<div class="fc-side">“yes” means you are not being honest.</div>' +
        '<div class="fc-arrow">no</div>' +
        '<div class="fc-box is-end">DO NOT ASK</div>' +
      '</div></details>'
    );
  }

  function startScreen() {
    show(
      '<div class="card">' +
      '<div class="card-kicker">A faculty meeting</div>' +
      '<h1 class="card-title">Should I Ask <span>a Question?</span></h1>' +
      '<p class="card-body">Item by item you are given a situation, and a thought you would very ' +
      'much like to share. Decide whether to raise your hand.</p>' +
      '<ul class="card-rules">' +
        '<li>In every situation there is exactly one correct answer. Take your time. You have four seconds.</li>' +
        '<li>Your hand rises on its own. When the bar is full, you have asked.</li>' +
        '<li>Each time you stay seated you spare everyone in the room ten minutes. The score is person-minutes.</li>' +
        '<li>Three questions, and the room has had enough of you.</li>' +
        '<li>Keys: <b>←</b> or <b>N</b> to stay seated, <b>→</b> or <b>Y</b> to ask.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Call the meeting to order</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('start-btn').addEventListener('click', start);
  }

  function endScreen(kicker, title, body, sfx) {
    S.running = false;
    sfx();
    const isBest = S.score > S.best;
    if (isBest) { S.best = S.score; localStorage.setItem('facultymeeting.best', String(S.best)); }
    show(
      '<div class="card">' +
      '<div class="card-kicker">' + kicker + '</div>' +
      '<h1 class="card-title">' + title + '</h1>' +
      '<p class="card-body">' + body + '</p>' +
      '<div class="result">' +
        '<div><b>' + S.score.toLocaleString() + '</b><span>Person-min saved</span></div>' +
        '<div><b>' + S.best.toLocaleString() + '</b><span>Best</span></div>' +
      '</div>' +
      (isBest ? '<p class="card-body card-best">A new best.</p>' : '') +
      flowchart() +
      '<button class="btn" id="again-btn">Another meeting</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('again-btn').addEventListener('click', start);
    render();
  }

  function lose() {
    endScreen(
      'Out of patience',
      'You have been appointed<br><span>to the working group</span>',
      'You raised one hand too many. The first meeting is on Monday, at eight.',
      SFX.over
    );
  }

  function win() {
    endScreen(
      'Meeting adjourned',
      'Closed <span>four minutes early</span>',
      'Twenty items and not a word from you. You will be asked to chair next year’s meeting. ' +
      'Nobody will say why.',
      SFX.win
    );
  }

  function start() {
    SFX.unlock();
    overlay.classList.remove('is-open');
    S.score = 0; S.streak = 0; S.lives = MAX_LIVES; S.done = 0;
    S.circBag = [];
    S.running = true;
    render();
    deal();
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  btnNo.addEventListener('click',  () => resolve(false, false));
  btnAsk.addEventListener('click', () => resolve(true, false));

  document.addEventListener('keydown', (e) => {
    if (!S.running) return;
    const k = e.key.toLowerCase();
    if (k === 'n' || k === 'arrowleft')  { e.preventDefault(); resolve(false, false); }
    if (k === 'y' || k === 'arrowright') { e.preventDefault(); resolve(true, false); }
  });

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
