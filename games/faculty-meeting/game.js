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
    'the chair of the previous working group',
    'a visiting professor, here for one week',
    'the head of department, chairing',
    'a lecturer on a temporary contract',
    'the research-support officer, invited for item 7',
    'a professor who has attended every meeting since 1994',
    'a PhD student who was told to “observe”',
    'the vice-dean, dropping in for ten minutes',
    'a postdoc on the job market this autumn',
    'the new director of studies',
    'someone who joined the wrong meeting by mistake'
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
      no: 'The meeting ends in four minutes. Nobody will believe it.' },
    { h: 8,  m: 30, s: '08:30. The meeting was moved here “to suit everyone”.',
      no: 'Eight-thirty has been survived. It is not an hour for questions.' },
    { h: 9,  m: 50, s: '09:50. The first item started late and is still going.',
      no: 'The first item is allowed to finish. The day depends on it.' },
    { h: 11, m: 15, s: '11:15. The fire drill is scheduled for 11:30.',
      no: 'The fire drill gets the room on time. Good colleagues, all of them.' },
    { h: 12, m: 45, s: '12:45. The sandwiches have arrived, and they are in the room.',
      no: 'The sandwiches are eaten at their best. Nobody forgets that.' },
    { h: 14, m: 0,  s: '14:00. First item after lunch. Eyelids at half-mast.',
      no: 'The room stays at half-mast. You have just spared it a full wake-up.' },
    { h: 14, m: 55, s: '14:55. Fika is in five minutes.',
      no: 'Fika begins on time. Several people shake your hand without knowing why.' },
    { h: 15, m: 55, s: '15:55. The meeting officially ends at 16:00.',
      no: 'The meeting ends five minutes late instead of fifty. A triumph.' },
    { h: 16, m: 10, s: '16:10. The last bus leaves at 17:05.',
      no: 'You make the bus. Several colleagues make the bus. Everyone is happy.' },
    { h: 18, m: 5,  s: '18:05. The cleaners have arrived and are waiting by the door.',
      no: 'The cleaners nod at you. It is the highest honour the building offers.' }
  ];

  /* n  is the number of people in the room. */
  const ROOM = [
    { n: 6,  s: 'Six people round a table.' },
    { n: 3,  s: 'You, the chair, and a very bored minute-taker.' },
    { n: 15, s: 'Fifteen people, eleven of them answering email.' },
    { n: 22, s: 'A Zoom meeting: 22 attendees, 19 cameras off.' },
    { n: 40, s: 'Forty people in a lecture theatre built for 120.' },
    { n: 60, s: 'Sixty people, two of them asleep, one of them the Dean.' },
    { n: 90, s: 'A hybrid meeting with 90 people and an echo.' },
    { n: 2,  s: 'You and the head of department, in a room with a glass door.' },
    { n: 5,  s: 'Five people in a room booked for two.' },
    { n: 8,  s: 'Eight people, one sharing the wrong slide.' },
    { n: 12, s: 'Twelve people and a plate of dry biscuits.' },
    { n: 18, s: 'Eighteen on Zoom: six on mute, one eating, one asleep with the camera on.' },
    { n: 30, s: 'Thirty people, half of them standing at the back.' },
    { n: 50, s: 'Fifty people in a hybrid meeting. The microphone is in the other room.' },
    { n: 120, s: 'The whole faculty, 120 people, in the big lecture hall.' }
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
    'an update on the update',
    'the new travel-claims form (version 4)',
    'a motion to review the motion procedure',
    'the department’s 2030 sustainability goals',
    'the library’s subscription to a journal nobody reads',
    'moving the Christmas lunch to January',
    'a proposed new name for the corridor',
    'quality assurance of the quality assurance',
    'introduction of a new learning platform',
    'the opening hours of the printer room',
    'how to attract more students',
    'the annual report, which is last year’s with new dates',
    'a pilot project for pilot projects',
    'workplace survey results (response rate: 9%)',
    'the cleaning rota for the seminar room'
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
    'Are we allowed to say no to this?',
    'Could someone remind me what we agreed last time?',
    'Whose budget is this coming out of?',
    'Have we considered not doing this?',
    'What happens if we just do nothing?',
    'I may have misunderstood, but is this mandatory?',
    'Does anyone know who owns this?',
    'How is this different from the 2019 proposal?',
    'Is this a decision or a discussion?',
    'May I ask what the deadline is?',
    'What would “success” look like here?',
    'Is there a version without the acronyms?',
    'Will there be a form to fill in?',
    'Sorry, is it “curricula” or “curriculums”?',
    'Would a pilot be possible?',
    'Is this retroactive?',
    'Who will be the contact person?',
    'Do we have to vote on this today?',
    'Is the cake part of the agenda?',
    'Can I just check that I have understood the timeline?',
    'Who gave this its name?'
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
      no: 'The speaker was looking at the clock. They are the only one who is.' },
    { s: 'You have been looking at the clock for ten minutes.',
      no: 'You and the clock have an understanding. It is mutual.' },
    { s: 'You have a train to catch at 16:15.',
      no: 'You catch the 16:15. Nobody ever asks what you meant to say.' },
    { s: 'The chair has already said “we are running a little late”.',
      no: '“A little late” is an optimistic phrase. Do not help it along.' },
    { s: 'You were asked to be “constructive”.',
      no: 'Silence is the most constructive thing in the room.' },
    { s: 'A colleague has just whispered “don’t”.',
      no: 'The whisper was well meant and correct.' },
    { s: 'The slide says “For discussion”.',
      no: '“For discussion” means “for decision, without discussion”.' },
    { s: 'You can see exactly how it will go wrong.',
      no: 'You can also see who will be asked to fix it. Silence has a lighter workload.' },
    { s: 'It concerns a form you filled in last month.',
      no: 'The form is in a system. The system is in a queue.' },
    { s: 'You are the only one who read the pre-reading.',
      no: 'Being the only one who read it is lonely. Being the only one who talks is lonelier.' },
    { s: 'Someone says “I am sure this is clear to everyone.”',
      no: 'It is clear to nobody, and everyone will pretend, in unison.' },
    { s: 'The speaker says “this will only take a moment”.',
      no: 'It will not. Do not make the moment longer.' },
    { s: 'Your question begins “To play devil’s advocate…”',
      no: 'The devil has plenty of advocates already. They are the ones still in the room.' },
    { s: 'The projector is showing the wrong item.',
      no: 'IT support is on its way. So is every comment on IT support.' },
    { s: 'It is about the minutes of the last meeting.',
      no: 'The minutes were approved in fourteen seconds, unread. Let them rest.' },
    { s: 'The Dean says “I would love to hear from the junior colleagues.”',
      no: 'The Dean wants one sentence. They will get four paragraphs. Do not be the reason.' },
    { s: 'You have a deadline tomorrow.',
      no: 'The deadline is a good reason to leave on time, and a poor reason to start a discussion.' }
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
    'You looked at the table with an expression of mild interest. A classic.',
    'The chair calls the next item. Fifty people exhale.',
    'You write the question on a post-it and put it in a drawer. It rests in peace.',
    'You gain a reputation as “not a problem”. Reputations compound.',
    'The question dissolves, as questions do after lunch.',
    'A colleague slides you a biscuit. This is how the system works.',
    'Your hand stays on the table, as designed.',
    'You and the room share a moment of mutual understanding. It lasts four seconds.',
    'The meeting ends at the time on the invitation. Someone checks the invitation.',
    'You note the question in your notebook. It is the last you will see of it.',
    'A quiet “thank you” appears in several people’s eyes.'
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
    'A subcommittee is formed to answer the question. You are a member.',
    'The chair says “let’s park that”. It is parked in a car park you will never find.',
    'The answer begins “Historically…” and goes on for eleven minutes.',
    'You are thanked for your input. This is the polite end of your part in the discussion.',
    'A follow-up arrives from someone who was not listening.',
    'The meeting overruns by {m} minutes. A colleague quietly turns a watch towards you.',
    'The Dean notes your concern and asks you to write it up.',
    'Your name is added to the minutes, next to the question.',
    'The room discovers three new aspects of the problem. All of them yours.',
    'Your question has become item 8b on the agenda.',
    'Someone says “that is outside the scope.” You, apparently, are outside it too.',
    'A new working group is formed: “Questions Arising from the Question”.'
  ];

  const HAND_UP = [
    'Your hand went up on its own. This has happened before. ',
    'The hand rose before the thought had finished. As it often does. ',
    'Your arm made the decision without consulting you. ',
    'Somewhere between thought and table, the hand went up. '
  ];

  /* ─── State ──────────────────────────────────────────────── */

  const TOTAL = 10;
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

  /* Phones: if the content is taller than the window, scale it down until the
     whole card and the buttons are visible. Only ever shrinks during a round,
     so the layout does not jump from card to card. */
  const stageEl = document.querySelector('.stage');
  let zoom = 1;
  function fit(reset) {
    if (reset) zoom = 1;
    stageEl.style.setProperty('--z', zoom);
    const cs = getComputedStyle(stageEl);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    for (let i = 0; i < 5 && zoom > 0.5 && stageEl.scrollHeight > stageEl.clientHeight + 1; i++) {
      zoom = Math.max(0.5, zoom * (stageEl.clientHeight - pad) / (stageEl.scrollHeight - pad));
      stageEl.style.setProperty('--z', zoom.toFixed(3));
    }
  }
  window.addEventListener('resize', () => fit(true));

  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function mult()    { return Math.min(5, 1 + Math.floor(S.streak / 3)); }
  function timeFor() { return Math.max(16, 20 - S.done * 0.4); }

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
    fit();
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
      elWhy.textContent = (timedOut ? pick(HAND_UP) : 'You asked. ') + pick(YES).replace('{m}', m);
    }

    render();
    fit();
    if (S.lives <= 0) { setTimeout(lose, 4200); return; }
    if (S.done >= TOTAL) { setTimeout(win, 3600); return; }
    setTimeout(deal, asked ? 5200 : 3800);
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
        '<li>In every situation there is exactly one correct answer. Take your time. You have about twenty seconds, and a little less as the meeting drags on.</li>' +
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
      'Ten items and not a word from you. You will be asked to chair next year’s meeting. ' +
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
    fit(true);
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
