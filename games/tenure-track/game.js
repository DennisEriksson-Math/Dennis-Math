/* ═══════════════════════════════════════════════════════════
   TENURE TRACK — six years, three columns, eight hours a
   semester, and a vote at the end.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Tuning ─────────────────────────────────────────────
     Everything that decides whether the game is fair lives
     here. See the simulation note in the README.
     ──────────────────────────────────────────────────────── */

  const CFG = {
    SEMESTERS:  12,
    HOURS:       7,      // to spend each semester
    GAIN:      2.6,      // meter points per hour of work
    REST:        8,      // energy per hour of rest
    DECAY:     2.5,      // meters slip this much each semester
    WORK_COST: 1.5,      // energy per hour worked
    TIRED:      25,      // below this, work is less productive
    TIRED_MULT:0.6,
    START:     { research: 15, teaching: 15, service: 15, energy: 80 },
    NEED:      { research: 60, teaching: 50, service: 40 }
  };

  const TRACKS = [
    { key: 'research', name: 'Research', note: 'Papers, proofs, preprints.' },
    { key: 'teaching', name: 'Teaching', note: 'Lectures, marking, office hours.' },
    { key: 'service',  name: 'Service',  note: 'Committees, referee reports, admissions.' },
    { key: 'rest',     name: 'Rest',     note: 'Sleep, weekends, a life.' }
  ];

  /* ─── Events ─────────────────────────────────────────────
     One fires each semester after the hours are filed. Some
     are simply weather; the good ones make you choose.
     ──────────────────────────────────────────────────────── */

  const EVENTS = [
    { t: 'The seminar needs a new organiser',
      x: 'Nobody has volunteered. The head of department looks down the table and lands on you.',
      c: [{ l: 'Take it on',            f: { service: 10, energy: -8 }, s: 'You take it on. It is more emails than you expected.' },
          { l: 'Suggest a colleague',   f: { service: -5 },             s: 'You suggest someone else. It is noted, quietly, that you did.' }] },

    { t: 'A student wants a reading course',
      x: 'One of the good ones. It is unpaid, uncounted, and would take an afternoon a week.',
      c: [{ l: 'Say yes',   f: { teaching: 9, energy: -6 },  s: 'You say yes. They turn out to be better than you were at that age.' },
          { l: 'Say no',    f: { teaching: -4 },             s: 'You say no. They find someone else, and you notice.' }] },

    { t: 'The grant deadline lands on the midterm',
      x: 'Both are due Friday. Only one of them can be good.',
      c: [{ l: 'Write the grant',  f: { research: 10, teaching: -7 }, s: 'The grant goes in strong. The midterm is recycled from last year.' },
          { l: 'Write the exam',   f: { teaching: 9, research: -7 },  s: 'The students get a fair paper. The grant goes in thin.' }] },

    { t: 'Invited to speak abroad',
      x: 'A good department, a good audience, and eleven hours each way.',
      c: [{ l: 'Go',      f: { research: 9, energy: -9, teaching: -3 }, s: 'The talk goes well. You cancel two lectures and sleep on a plane.' },
          { l: 'Decline', f: { energy: 4 },                            s: 'You stay. The week is calm and nothing comes of it.' }] },

    { t: 'Four referee requests in one week',
      x: 'All four are in your area. All four editors know that.',
      c: [{ l: 'Do them all', f: { service: 12, energy: -11 },  s: 'You do all four. One of them is genuinely good.' },
          { l: 'Do one',      f: { service: 3, energy: -2 },    s: 'You do one and let the others expire politely.' }] },

    { t: 'Admissions chair is vacant',
      x: 'It is the single most thankless job in the building, and everyone knows exactly how much work it is.',
      c: [{ l: 'Volunteer', f: { service: 15, research: -6, energy: -6 }, s: 'You volunteer. The gratitude is real and lasts about a week.' },
          { l: 'Stay quiet', f: { service: -6 },                         s: 'You study the table. Someone else breaks first.' }] },

    { t: 'Your paper is accepted',
      x: 'Fourteen months, two rounds of revisions, and a referee who never did understand §4.',
      c: [{ l: 'Excellent', f: { research: 13, energy: 5 }, s: 'Accepted. You read the email twice.' }] },

    { t: 'Reviewer № 2 strikes',
      x: '"The authors appear unaware of the literature." You are, in fact, cited in the literature.',
      c: [{ l: 'Write the rebuttal', f: { research: 4, energy: -7 },  s: 'You write nine pages of rebuttal and delete the first draft.' },
          { l: 'Withdraw and resubmit', f: { research: -6, energy: 2 }, s: 'You send it elsewhere. Fourteen more months.' }] },

    { t: 'Students petition about your marking',
      x: 'The complaint is that the exam was harder than the practice paper. It was.',
      c: [{ l: 'Hold the line', f: { teaching: -8, energy: -3 }, s: 'You hold the line. The marks stand, and so does the resentment.' },
          { l: 'Rescale',       f: { teaching: 5, research: -3 }, s: 'You rescale. Everyone is happier and you feel slightly cheap.' }] },

    { t: 'A sabbatical term is offered',
      x: 'One clear term. No teaching, no committees, no reason to come in.',
      c: [{ l: 'Take it', f: { research: 12, energy: 16, teaching: -5 }, s: 'You take it. You had forgotten what a whole day of work feels like.' }] },

    { t: 'The hiring committee needs a body',
      x: 'Ninety applications, four longlist meetings, and one job.',
      c: [{ l: 'Serve',  f: { service: 11, research: -5, energy: -5 }, s: 'You serve. You read ninety cover letters and recognise yourself in most of them.' },
          { l: 'Beg off', f: { service: -4 },                         s: 'You beg off, citing the book. There is no book yet.' }] },

    { t: 'Overleaf goes down',
      x: 'Two hours before the submission deadline. Of course it does.',
      c: [{ l: 'Nothing to be done', f: { research: -5, energy: -5 }, s: 'It comes back at 3am. You submit at 3:20.' }] },

    { t: 'A collaboration falls through',
      x: 'Your co-author has taken a job in industry and stopped answering.',
      c: [{ l: 'Finish it alone',   f: { research: 6, energy: -9 },  s: 'You finish it alone. It takes twice as long and reads better.' },
          { l: 'Shelve it',         f: { research: -7, energy: 3 },  s: 'It goes in the drawer with the others.' }] },

    { t: 'Outreach day',
      x: 'Two hundred sixteen-year-olds and a room with no windows.',
      c: [{ l: 'Run a session', f: { service: 8, teaching: 4, energy: -6 }, s: 'One of them asks a question you cannot answer. It makes your month.' },
          { l: 'Send apologies', f: { service: -3 },                        s: 'You send apologies and use the day on the paper.' }] },

    { t: 'Teaching evaluations arrive',
      x: 'Ninety-one responses. You read the four negative ones eleven times each.',
      c: [{ l: 'Read them', f: { teaching: 3, energy: -5 }, s: 'Mostly kind. You remember none of the kind ones.' },
          { l: 'Do not open the file', f: { energy: 2 },    s: 'The file stays unopened. It sits there all term.' }] },

    { t: 'A prize nomination',
      x: 'A colleague has put your name forward for an early-career prize. It needs a dossier by Monday.',
      c: [{ l: 'Assemble it', f: { research: 8, energy: -6 },  s: 'You assemble it. Writing about yourself in the third person is its own punishment.' },
          { l: 'Let it pass',  f: { energy: 3 },               s: 'The deadline passes. Someone else wins it.' }] },

    { t: 'The department restructures',
      x: 'Everyone must write a statement on how their work aligns with the new strategic priorities.',
      c: [{ l: 'Write the statement', f: { service: 6, energy: -5 }, s: 'You write six hundred words that mean nothing. They are well received.' },
          { l: 'Ignore it',           f: { service: -7 },            s: 'You ignore it. You are reminded. You ignore it again.' }] },

    { t: 'A new course to design',
      x: 'From scratch. Your area, which is the problem — you will want it to be good.',
      c: [{ l: 'Build it properly', f: { teaching: 13, research: -6, energy: -8 }, s: 'It is the best course in the department and it cost you a paper.' },
          { l: 'Adapt the old notes', f: { teaching: 3, energy: -2 },              s: 'You adapt the old notes. Nobody notices. You notice.' }] },

    { t: 'You are scooped',
      x: 'The arXiv listing arrives at 8am. Same theorem, better constant, three weeks earlier.',
      c: [{ l: 'Salvage what you can', f: { research: -8, energy: -6 }, s: 'You rewrite it as a special case and send it somewhere smaller.' }] },

    { t: 'A visitor needs a host',
      x: 'A senior figure is coming for a month and needs someone to organise the visit.',
      c: [{ l: 'Host them',  f: { service: 8, research: 6, energy: -7 }, s: 'You host them. The conversations are worth the logistics.' },
          { l: 'Pass',       f: { service: -4 },                        s: 'Someone else hosts. You see them twice, in corridors.' }] },

    { t: 'Marking week',
      x: 'Three hundred scripts and a hard return deadline.',
      c: [{ l: 'Grind through it', f: { teaching: 7, energy: -10 }, s: 'You grind through it. Your handwriting deteriorates by script 200.' },
          { l: 'Delegate to the TA', f: { teaching: 1, service: -2, energy: -2 }, s: 'The TA does most of it. The marks are fine. Mostly.' }] },

    { t: 'Funding renewal',
      x: 'The grant that pays your postdoc runs out in eight months.',
      c: [{ l: 'Write the renewal', f: { research: 7, energy: -9 }, s: 'You write it. It is the fourth time you have written this document.' },
          { l: 'Let it lapse',      f: { research: -9, energy: 4 }, s: 'It lapses. The postdoc starts looking, and finds something.' }] },

    { t: 'An old result gets cited',
      x: 'Your thesis chapter, the one nobody read, turns up in a paper by someone you admire.',
      c: [{ l: 'Quietly pleased', f: { research: 6, energy: 6 }, s: 'You are quietly pleased for about three days.' }] },

    { t: 'A colleague is struggling',
      x: 'They have asked, indirectly, whether you have twenty minutes.',
      c: [{ l: 'Make the time', f: { service: 6, energy: -4 },  s: 'It turns into two hours. It was the right two hours.' },
          { l: 'Not this week', f: { service: -3, energy: 1 },  s: 'You say next week. Next week is also difficult.' }] },

    { t: 'Conference organising',
      x: 'A satellite meeting in your area. It needs a programme committee and a budget.',
      c: [{ l: 'Chair it',    f: { service: 13, research: 4, energy: -11 }, s: 'It goes well. You do not attend a single talk.' },
          { l: 'Just attend', f: { research: 4, energy: -3 },               s: 'You just attend. You see three good talks and sleep properly.' }] },

    { t: 'The mid-probation review',
      x: 'A panel of three has read your file and has thoughts about your trajectory.',
      when: (s) => s.sem >= 5 && s.sem <= 8,
      c: [{ l: 'Sit through it', f: { energy: -5 }, s: 'They say "on track, but". Nobody remembers anything after the but.' }] },

    { t: 'A better offer',
      x: 'Another department has been in touch. Nothing formal. Yet.',
      when: (s) => s.sem >= 7,
      c: [{ l: 'Explore it',       f: { research: 5, energy: -6, service: -4 }, s: 'You explore it. Word gets back, which is not entirely bad.' },
          { l: 'Not interested',   f: { energy: 3 },                           s: 'You say you are happy here. You are, mostly.' }] },

    { t: 'The book proposal',
      x: 'A publisher wants the lecture notes as a textbook. It would eat a year.',
      when: (s) => s.sem >= 6,
      c: [{ l: 'Sign the contract', f: { teaching: 10, research: -8, energy: -7 }, s: 'You sign. The manuscript is due the same month as your tenure file.' },
          { l: 'Decline politely',  f: { energy: 2 },                            s: 'You decline. The notes stay notes.' }] }
  ];

  /* ─── State ──────────────────────────────────────────────── */

  const S = {
    sem: 1,
    research: CFG.START.research,
    teaching: CFG.START.teaching,
    service:  CFG.START.service,
    energy:   CFG.START.energy,
    alloc: { research: 0, teaching: 0, service: 0, rest: 0 },
    used: [],
    running: true
  };

  const elMeters = document.getElementById('meters');
  const elAlloc  = document.getElementById('alloc');
  const elLeft   = document.getElementById('left');
  const elTerm   = document.getElementById('term');
  const elRemain = document.getElementById('remaining-terms');
  const elLedger = document.getElementById('ledger');
  const elSubmit = document.getElementById('submit');
  const overlay  = document.getElementById('overlay');

  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function spent() { return TRACKS.reduce((n, t) => n + S.alloc[t.key], 0); }
  function left()  { return CFG.HOURS - spent(); }

  function termName(sem) {
    return 'Year ' + Math.ceil(sem / 2) + ' · ' + (sem % 2 ? 'Autumn' : 'Spring');
  }

  /* ─── Build the panels once, then update in place ────────── */

  function buildMeters() {
    elMeters.innerHTML = '';
    [{ key: 'research' }, { key: 'teaching' }, { key: 'service' }, { key: 'energy' }].forEach((m) => {
      const need = CFG.NEED[m.key];
      const track = TRACKS.find((t) => t.key === m.key);
      const row = document.createElement('div');
      row.className = 'meter' + (m.key === 'energy' ? ' is-energy' : '');
      row.innerHTML =
        '<div class="meter-label">' + (track ? track.name : 'Energy') + '</div>' +
        '<div class="meter-track">' +
          '<div class="meter-fill" data-fill="' + m.key + '"></div>' +
          (need ? '<i class="meter-need" style="left:' + need + '%" title="Needed for tenure"></i>' : '') +
        '</div>' +
        '<div class="meter-num" data-num="' + m.key + '">0</div>';
      elMeters.appendChild(row);
    });
  }

  function buildAlloc() {
    elAlloc.innerHTML = '';
    TRACKS.forEach((t) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML =
        '<div class="row-text"><b>' + t.name + '</b><span>' + t.note + '</span></div>' +
        '<div class="stepper">' +
          '<button type="button" class="step" data-dec="' + t.key + '" aria-label="Fewer hours on ' + t.name + '">−</button>' +
          '<b data-hours="' + t.key + '">0</b>' +
          '<button type="button" class="step" data-inc="' + t.key + '" aria-label="More hours on ' + t.name + '">+</button>' +
        '</div>';
      elAlloc.appendChild(row);
    });

    elAlloc.addEventListener('click', (e) => {
      const inc = e.target.getAttribute('data-inc');
      const dec = e.target.getAttribute('data-dec');
      if (inc && left() > 0)        { S.alloc[inc]++; SFX.key(); render(); }
      else if (dec && S.alloc[dec]) { S.alloc[dec]--; SFX.key(); render(); }
    });
  }

  function render() {
    ['research', 'teaching', 'service', 'energy'].forEach((k) => {
      const v = Math.round(S[k]);
      elMeters.querySelector('[data-fill="' + k + '"]').style.width = v + '%';
      elMeters.querySelector('[data-num="' + k + '"]').textContent = v;
      const need = CFG.NEED[k];
      elMeters.querySelector('[data-fill="' + k + '"]')
        .classList.toggle('is-met', need ? v >= need : v > CFG.TIRED);
    });
    elMeters.querySelector('[data-fill="energy"]').classList.toggle('is-low', S.energy <= CFG.TIRED);

    TRACKS.forEach((t) => {
      elAlloc.querySelector('[data-hours="' + t.key + '"]').textContent = S.alloc[t.key];
    });

    elLeft.textContent = left();
    elTerm.textContent = termName(S.sem);
    const rem = CFG.SEMESTERS - S.sem + 1;
    elRemain.textContent = rem + (rem === 1 ? ' semester remains' : ' semesters remain');
    elSubmit.disabled = left() !== 0;
    elSubmit.textContent = left() === 0 ? 'File the semester' : 'Assign all ' + CFG.HOURS + ' hours';
  }

  /* ─── A semester ─────────────────────────────────────────── */

  function submit() {
    if (!S.running || left() !== 0) return;
    SFX.stamp();

    const tired = S.energy <= CFG.TIRED;
    const mult = tired ? CFG.TIRED_MULT : 1;

    S.research += S.alloc.research * CFG.GAIN * mult;
    S.teaching += S.alloc.teaching * CFG.GAIN * mult;
    S.service  += S.alloc.service  * CFG.GAIN * mult;
    S.energy   += S.alloc.rest * CFG.REST;

    const worked = S.alloc.research + S.alloc.teaching + S.alloc.service;
    S.energy -= worked * CFG.WORK_COST;

    S.research -= CFG.DECAY;
    S.teaching -= CFG.DECAY;
    S.service  -= CFG.DECAY;

    ['research', 'teaching', 'service', 'energy'].forEach((k) => { S[k] = clamp(S[k]); });

    elLedger.textContent = tired
      ? 'You worked the semester on empty. It shows in the output.'
      : 'Semester filed.';

    render();
    if (S.energy <= 0) { burnout(); return; }
    setTimeout(fireEvent, 420);
  }

  function fireEvent() {
    const pool = EVENTS.filter((e) => S.used.indexOf(e.t) < 0 && (!e.when || e.when(S)));
    const fallback = EVENTS.filter((e) => !e.when || e.when(S));
    const ev = (pool.length ? pool : fallback)[(Math.random() * (pool.length ? pool.length : fallback.length)) | 0];
    S.used.push(ev.t);
    SFX.slide();

    show(
      '<div class="memo">' +
      '<div class="memo-tag">' + termName(S.sem) + '</div>' +
      '<h2 class="memo-title">' + ev.t + '</h2>' +
      '<p class="memo-text">' + ev.x + '</p>' +
      '<div class="memo-choices">' +
        ev.c.map((ch, i) =>
          '<button type="button" class="choice" data-i="' + i + '">' +
            '<span class="choice-label">' + ch.l + '</span>' +
            '<span class="choice-fx">' + describe(ch.f) + '</span>' +
          '</button>').join('') +
      '</div></div>'
    );

    overlay.querySelectorAll('.choice').forEach((b) => {
      b.addEventListener('click', () => resolve(ev, ev.c[Number(b.dataset.i)]));
    });
  }

  function describe(f) {
    const names = { research: 'Research', teaching: 'Teaching', service: 'Service', energy: 'Energy' };
    const parts = Object.keys(f).map((k) =>
      '<i class="' + (f[k] > 0 ? 'up' : 'down') + '">' +
      (f[k] > 0 ? '+' : '−') + Math.abs(f[k]) + ' ' + names[k] + '</i>');
    return parts.length ? parts.join('') : '<i class="flat">no change</i>';
  }

  function resolve(ev, choice) {
    Object.keys(choice.f).forEach((k) => { S[k] = clamp(S[k] + choice.f[k]); });
    const net = Object.keys(choice.f).reduce((n, k) => n + choice.f[k], 0);
    if (net >= 0) SFX.good(); else SFX.bad();

    show(
      '<div class="memo is-outcome">' +
      '<div class="memo-tag">' + termName(S.sem) + '</div>' +
      '<p class="memo-say">' + choice.s + '</p>' +
      '<div class="memo-delta">' + describe(choice.f) + '</div>' +
      '<button type="button" class="btn" id="next-btn">' +
        (S.sem >= CFG.SEMESTERS ? 'Submit the tenure file' : 'Next semester') +
      '</button></div>'
    );
    document.getElementById('next-btn').addEventListener('click', advance);
    render();
  }

  function advance() {
    hide();
    if (S.energy <= 0) { burnout(); return; }
    if (S.sem >= CFG.SEMESTERS) { vote(); return; }
    S.sem++;
    S.alloc = { research: 0, teaching: 0, service: 0, rest: 0 };
    elLedger.textContent = 'A new semester. The hours reset; nothing else does.';
    render();
  }

  /* ─── Endings ────────────────────────────────────────────── */

  function burnout() {
    S.running = false;
    SFX.denied();
    show(card('Medical leave', 'You are<br><span>signed off</span>',
      'You ran out of energy in ' + termName(S.sem).toLowerCase() + '. The department is ' +
      'sympathetic in writing and the clock, they explain, does not stop.',
      false, 'On leave'));
  }

  function vote() {
    S.running = false;
    const r = Math.round(S.research), t = Math.round(S.teaching), sv = Math.round(S.service);
    const N = CFG.NEED;
    const met = (r >= N.research) + (t >= N.teaching) + (sv >= N.service);

    let kicker, title, body, good = false;

    if (met === 3 && r >= 75 && t >= 60 && sv >= 55) {
      good = true;
      kicker = 'The vote was unanimous';
      title  = 'Tenure<br><span>granted</span>';
      body   = 'The committee could not find anything to quibble with, which in this building ' +
               'is close to a standing ovation.';
    } else if (met === 3) {
      good = true;
      kicker = 'Carried';
      title  = 'Tenure<br><span>granted</span>';
      body   = 'Not without discussion. But the file holds up in all three columns, and that ' +
               'is the whole of the test.';
    } else if (r >= N.research && sv >= N.service) {
      kicker = 'Denied';
      title  = 'The file was<br><span>not carried</span>';
      body   = '"A serious scholar and a good colleague. The students, however, see rather ' +
               'less of you than we would like."';
    } else if (r >= N.research && t >= N.teaching) {
      kicker = 'Denied';
      title  = 'The file was<br><span>not carried</span>';
      body   = '"Strong on both counts that appear in the handbook. We note an almost complete ' +
               'absence of departmental citizenship."';
    } else if (t >= N.teaching && sv >= N.service) {
      kicker = 'Denied';
      title  = 'The file was<br><span>not carried</span>';
      body   = '"Beloved in the classroom, indispensable on committees, and the publication ' +
               'record is thin. We are sorry."';
    } else if (met === 1) {
      kicker = 'Denied';
      title  = 'The file was<br><span>not carried</span>';
      body   = '"There is one column here we can defend. There are two we cannot."';
    } else {
      kicker = 'Denied';
      title  = 'The file was<br><span>not carried</span>';
      body   = '"We thank you for six years of service to the department and wish you every ' +
               'success in your future career."';
    }

    if (good) SFX.granted(); else SFX.denied();
    show(card(kicker, title, body, true, good ? 'Granted' : 'Denied'));
  }

  function card(kicker, title, body, showScores, stamp) {
    return '<div class="verdict-card">' +
      '<div class="stamp">' + stamp + '</div>' +
      '<div class="memo-tag">' + kicker + '</div>' +
      '<h2 class="verdict-title">' + title + '</h2>' +
      '<p class="memo-text">' + body + '</p>' +
      (showScores ?
        '<div class="result">' +
          scoreCell('Research', S.research, CFG.NEED.research) +
          scoreCell('Teaching', S.teaching, CFG.NEED.teaching) +
          scoreCell('Service',  S.service,  CFG.NEED.service) +
        '</div>' : '') +
      '<button type="button" class="btn" id="again-btn">Start again</button>' +
      '<a class="card-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>';
  }

  function scoreCell(name, v, need) {
    const n = Math.round(v);
    return '<div class="' + (n >= need ? 'is-met' : 'is-short') + '">' +
      '<b>' + n + '</b><span>' + name + ' · needed ' + need + '</span></div>';
  }

  /* ─── Overlay ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); wire(); }
  function hide() { overlay.classList.remove('is-open'); }

  function wire() {
    const again = document.getElementById('again-btn');
    if (again) again.addEventListener('click', restart);
  }

  function restart() {
    hide();
    S.sem = 1;
    S.research = CFG.START.research;
    S.teaching = CFG.START.teaching;
    S.service  = CFG.START.service;
    S.energy   = CFG.START.energy;
    S.alloc = { research: 0, teaching: 0, service: 0, rest: 0 };
    S.used = [];
    S.running = true;
    elLedger.textContent = 'Appointed, again. The clock starts now.';
    render();
  }

  /* ─── Boot ───────────────────────────────────────────────── */

  elSubmit.addEventListener('click', () => { SFX.unlock(); submit(); });

  buildMeters();
  buildAlloc();
  render();

})();
