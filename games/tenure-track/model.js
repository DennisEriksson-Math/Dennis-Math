/* ═══════════════════════════════════════════════════════════
   TENURE TRACK: the rules, with no screen attached.

   Six years, four columns, seven hours a semester, a yearly
   arrangement to choose, and a vote at the end. The page
   (game.js) and the balance simulation (sim.js, in this folder:
   `node sim.js`) both use this file, so what is simulated is
   what is played.
   ═══════════════════════════════════════════════════════════ */

(function (root) {
  'use strict';

  /* ─── Tuning ─────────────────────────────────────────────
     Everything that decides whether the game is fair lives
     here. Re-run the simulation after changing any of it.
     ──────────────────────────────────────────────────────── */

  const CFG = {
    SEMESTERS:  12,
    HOURS:       7,      // to spend each semester
    GAIN:      { research: 2.6, teaching: 2.6, service: 2.6, standing: 2.4 },   // meter points per hour of work
    SPILL:     0.25,     // research hours also raise Standing: papers get read
    REST:        8,      // energy per hour of rest
    DECAY:     { research: 3, teaching: 3, service: 3, standing: 2.5 },   // meters slip this much each semester
    WORK_COST: 1.5,      // energy per hour worked
    TIRED:      25,      // below this, work is less productive
    TIRED_MULT:0.6,
    NEED:      { research: 70, teaching: 58, service: 48, standing: 42 }
  };

  const METERS = ['research', 'teaching', 'service', 'standing', 'energy'];
  const COLUMNS = ['research', 'teaching', 'service', 'standing'];

  /* Where the hours can go. 'standing' is the fourth column (the external letters): you build it by
     getting your name around. */
  const TRACKS = [
    { key: 'research', name: 'Research', note: 'Papers, proofs, preprints.' },
    { key: 'teaching', name: 'Teaching', note: 'Lectures, marking, office hours.' },
    { key: 'service',  name: 'Service',  note: 'Committees, referee reports, admissions.' },
    { key: 'standing', name: 'Network',  note: 'Talks, visits, emails: getting your name around.' },
    { key: 'rest',     name: 'Rest',     note: 'Sleep, weekends, a life.' }
  ];
  const LABEL = { research: 'Research', teaching: 'Teaching', service: 'Service', standing: 'Standing', energy: 'Energy' };

  /* ─── How you were hired ─────────────────────────────────
     Three starting positions, so the first years play differently.
     ──────────────────────────────────────────────────────── */

  const PROFILES = [
    { id: 'researcher', name: 'Hired for your research', text: 'A strong paper record and a thin teaching file. The students will have to be won over.',
      start: { research: 30, teaching: 8, service: 12, standing: 14, energy: 80 } },
    { id: 'teacher', name: 'Hired to teach', text: 'The students already like you. The papers are another matter.',
      start: { research: 10, teaching: 30, service: 14, standing: 8, energy: 80 } },
    { id: 'all', name: 'Hired to do a bit of everything', text: 'Nothing is strong and nothing is missing. Slightly less energy, because of the paperwork.',
      start: { research: 18, teaching: 18, service: 18, standing: 10, energy: 75 } }
  ];

  /* ─── Arrangements ───────────────────────────────────────
     At the start of each year the department offers three; you
     take one. They stack, and each one costs something somewhere.
     passive: added every semester. gain/decay: multipliers on a
     column. rest: multiplier on what resting gives. work: on what
     working costs.
     ──────────────────────────────────────────────────────── */

  const PERKS = [
    { id: 'student',   name: 'A research student', text: 'Supervising takes time, but the results arrive.',
      show: ['+2 Research a semester', '−1 Service a semester'], passive: { research: 2.2, service: -0.8 } },
    { id: 'ta',        name: 'A teaching assistant', text: 'The marking is shared. You are now also somebody’s supervisor.',
      show: ['+2 Teaching a semester', '−1 Research a semester'], passive: { teaching: 2.2, research: -0.6 } },
    { id: 'secretary', name: 'A committee secretary', text: 'Somebody else takes the minutes. They have views on the agenda.',
      show: ['+2 Service a semester', '−1 Research a semester'], passive: { service: 2.2, research: -0.6 } },
    { id: 'office',    name: 'A quiet office', text: 'A door that closes and a window that opens. Rest goes further.',
      show: ['Rest restores 50% more'], rest: 1.5 },
    { id: 'chair',     name: 'A good chair', text: 'It cost the department nothing, which is why it took three years to get.',
      show: ['Working tires you 20% less'], work: 0.8 },
    { id: 'grant',     name: 'A small grant', text: 'A little money for a lot of paperwork.',
      show: ['Research hours 15% better', '−1 Service a semester'], gain: { research: 1.15 }, passive: { service: -0.8 } },
    { id: 'mentor',    name: 'A senior mentor', text: 'Someone who has seen the whole thing before, and tells people about you.',
      show: ['+2 Standing a semester', '+1 Energy a semester'], passive: { standing: 1.8, energy: 1 } },
    { id: 'travel',    name: 'A travel budget', text: 'Trips are cheap now. The jet lag is not covered.',
      show: ['Network hours 50% better', '−1 Teaching a semester'], gain: { standing: 1.5 }, passive: { teaching: -0.8 } },
    { id: 'lighter',   name: 'A lighter teaching load', text: 'Fewer lectures, but you see the students less, and it shows.',
      show: ['Teaching no longer fades', 'Teaching hours 25% worse'], decay: { teaching: 0 }, gain: { teaching: 0.75 } },
    { id: 'ally',      name: 'An ally on the committee', text: 'Your name comes up less, and your absences are explained.',
      show: ['Service fades half as fast'], decay: { service: 0.5 } }
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
      c: [{ l: 'Go',      f: { research: 9, standing: 9, energy: -9, teaching: -3 }, s: 'The talk goes well. You cancel two lectures and sleep on a plane.' },
          { l: 'Decline', f: { energy: 4 },                            s: 'You stay. The week is calm and nothing comes of it.' }] },

    { t: 'Four referee requests in one week',
      x: 'All four are in your area. All four editors know that.',
      c: [{ l: 'Do them all', f: { service: 12, standing: 3, energy: -11 },  s: 'You do all four. One of them is genuinely good.' },
          { l: 'Do one',      f: { service: 3, energy: -2 },    s: 'You do one and let the others expire politely.' }] },

    { t: 'Admissions chair is vacant',
      x: 'It is the single most thankless job in the building, and everyone knows exactly how much work it is.',
      c: [{ l: 'Volunteer', f: { service: 15, research: -6, energy: -6 }, s: 'You volunteer. The gratitude is real and lasts about a week.' },
          { l: 'Stay quiet', f: { service: -6 },                         s: 'You study the table. Someone else breaks first.' }] },

    { t: 'Your paper is accepted',
      x: 'Fourteen months, two rounds of revisions, and a referee who never did understand §4.',
      c: [{ l: 'Excellent', f: { research: 13, standing: 4, energy: 5 }, s: 'Accepted. You read the email twice.' }] },

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
          { l: 'Shelve it',         f: { research: -7, standing: -3, energy: 3 },  s: 'It goes in the drawer with the others.' }] },

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
      c: [{ l: 'Assemble it', f: { research: 8, standing: 7, energy: -6 },  s: 'You assemble it. Writing about yourself in the third person is its own punishment.' },
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
      c: [{ l: 'Salvage what you can', f: { research: -8, standing: -3, energy: -6 }, s: 'You rewrite it as a special case and send it somewhere smaller.' }] },

    { t: 'A visitor needs a host',
      x: 'A senior figure is coming for a month and needs someone to organise the visit.',
      c: [{ l: 'Host them',  f: { service: 8, research: 6, standing: 5, energy: -7 }, s: 'You host them. The conversations are worth the logistics.' },
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
      c: [{ l: 'Quietly pleased', f: { research: 6, standing: 5, energy: 6 }, s: 'You are quietly pleased for about three days.' }] },

    { t: 'A colleague is struggling',
      x: 'They have asked, indirectly, whether you have twenty minutes.',
      c: [{ l: 'Make the time', f: { service: 6, energy: -4 },  s: 'It turns into two hours. It was the right two hours.' },
          { l: 'Not this week', f: { service: -3, energy: 1 },  s: 'You say next week. Next week is also difficult.' }] },

    { t: 'Conference organising',
      x: 'A satellite meeting in your area. It needs a programme committee and a budget.',
      c: [{ l: 'Chair it',    f: { service: 13, research: 4, standing: 7, energy: -11 }, s: 'It goes well. You do not attend a single talk.' },
          { l: 'Just attend', f: { research: 4, standing: 3, energy: -3 },               s: 'You just attend. You see three good talks and sleep properly.' }] },

    { t: 'The mid-probation review',
      x: 'A panel of three has read your file and has thoughts about your trajectory.',
      when: (s) => s.sem >= 5 && s.sem <= 8,
      c: [{ l: 'Sit through it', f: { energy: -5 }, s: 'They say "on track, but". Nobody remembers anything after the but.' }] },

    { t: 'A better offer',
      x: 'Another department has been in touch. Nothing formal. Yet.',
      when: (s) => s.sem >= 7,
      c: [{ l: 'Explore it',       f: { research: 5, standing: 6, energy: -6, service: -4 }, s: 'You explore it. Word gets back, which is not entirely bad.' },
          { l: 'Not interested',   f: { energy: 3 },                           s: 'You say you are happy here. You are, mostly.' }] },

    { t: 'The book proposal',
      x: 'A publisher wants the lecture notes as a textbook. It would eat a year.',
      when: (s) => s.sem >= 6,
      c: [{ l: 'Sign the contract', f: { teaching: 10, research: -8, energy: -7 }, s: 'You sign. The manuscript is due the same month as your tenure file.' },
          { l: 'Decline politely',  f: { energy: 2 },                            s: 'You decline. The notes stay notes.' }] },
    { t: 'A journalist calls',
      x: 'They want a quote on a result that is not yours, in your general area, by four o\u2019clock.',
      c: [{ l: 'Give the quote',  f: { standing: 7, research: -3, energy: -3 }, s: 'You give the quote. It is printed, slightly wrong, with your name spelled right.' },
          { l: 'Decline',         f: { energy: 1 },                           s: 'You decline. Somebody less careful is quoted instead.' }] },

    { t: 'An invitation to keynote',
      x: 'A meeting in your area. The organiser\u2019s first choice has dropped out, and they say this almost apologetically.',
      c: [{ l: 'Accept',   f: { standing: 10, energy: -9, teaching: -4 }, s: 'You accept. The talk is the best-attended session of the week, partly because of the coffee.' },
          { l: 'Decline',  f: { standing: -2, energy: 2 },               s: 'You decline. They find someone else, and mention it to people.' }] },

    { t: 'The letters are being requested',
      x: 'The department has begun asking your senior contacts for letters. Some of them will need reminding who you are.',
      when: (s) => s.sem >= 9,
      c: [{ l: 'Remind them',   f: { standing: 8, energy: -5 },  s: 'You send six careful emails with a short CV attached. Four reply.' },
          { l: 'Leave it be',   f: { standing: -6, energy: 2 },  s: 'You leave it to the work. The work, it turns out, is not a very good correspondent.' }] },

    { t: 'A stranger wants to collaborate',
      x: 'A cold email, a sensible question, and a postdoc position elsewhere that makes it all slightly easier for them than for you.',
      c: [{ l: 'Work together', f: { research: 5, standing: 4, energy: -6 }, s: 'You work together. They are quick, and slightly better at the hard part.' },
          { l: 'Politely decline', f: { energy: 2 },                         s: 'You decline. The email you did not answer is a very short one.' }] },

    { t: 'Your expository talk goes round',
      x: 'You gave a lecture to a general audience once, and somebody posted the recording. It is, unexpectedly, quite good.',
      c: [{ l: 'Lean into it',  f: { standing: 6, energy: -4, research: -2 }, s: 'You answer comments for a week and write a short follow-up. A few people you respect notice.' },
          { l: 'Leave it',      f: { energy: 1 },                           s: 'You leave it. It continues without you.' }] },

    { t: 'A summer school invitation',
      x: 'Three weeks, forty bright students, and a chance to teach something you actually care about.',
      c: [{ l: 'Teach it',  f: { teaching: 5, standing: 5, energy: -7 }, s: 'You teach it. You make four friends for life and lose three weeks.' },
          { l: 'Decline',   f: { energy: 3 },                          s: 'You decline. You spend the weeks doing something quiet, as planned.' }] },
  ];


  /* ─── State and rules ────────────────────────────────────── */

  function clamp(v) { return Math.max(0, Math.min(100, v)); }

  function newState(profileId) {
    const p = PROFILES.find((q) => q.id === profileId) || PROFILES[2];
    const S = { sem: 1, profile: p.id, perks: [], used: [], mods: null };
    METERS.forEach((k) => { S[k] = p.start[k]; });
    S.mods = mods(S);
    return S;
  }

  /* What the arrangements taken so far add up to. */
  function mods(S) {
    const m = { passive: {}, gain: {}, decay: {}, rest: 1, work: 1 };
    METERS.forEach((k) => { m.passive[k] = 0; m.gain[k] = 1; m.decay[k] = 1; });
    S.perks.forEach((id) => {
      const p = PERKS.find((q) => q.id === id);
      if (!p) return;
      Object.keys(p.passive || {}).forEach((k) => { m.passive[k] += p.passive[k]; });
      Object.keys(p.gain || {}).forEach((k) => { m.gain[k] *= p.gain[k]; });
      Object.keys(p.decay || {}).forEach((k) => { m.decay[k] *= p.decay[k]; });
      if (p.rest) m.rest *= p.rest;
      if (p.work) m.work *= p.work;
    });
    return m;
  }

  function takePerk(S, id) { S.perks.push(id); S.mods = mods(S); }

  /* Three arrangements you do not have yet, at random. */
  function offers(S, rnd) {
    rnd = rnd || Math.random;
    const pool = PERKS.filter((p) => S.perks.indexOf(p.id) < 0);
    for (let i = pool.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    return pool.slice(0, 3);
  }

  /* A year starts on the odd semesters. */
  function yearStarts(S) { return S.sem % 2 === 1; }

  /* File a semester's hours. alloc: hours per track (research, teaching, service, standing, rest). */
  function fileSemester(S, alloc) {
    const m = S.mods, tired = S.energy <= CFG.TIRED, mult = tired ? CFG.TIRED_MULT : 1;
    COLUMNS.forEach((k) => { S[k] += (alloc[k] || 0) * CFG.GAIN[k] * m.gain[k] * mult; });
    S.standing += (alloc.research || 0) * CFG.SPILL * mult;
    S.energy += (alloc.rest || 0) * CFG.REST * m.rest;
    const worked = COLUMNS.reduce((n, k) => n + (alloc[k] || 0), 0);
    S.energy -= worked * CFG.WORK_COST * m.work;
    COLUMNS.forEach((k) => { S[k] -= CFG.DECAY[k] * m.decay[k]; });
    METERS.forEach((k) => { S[k] += m.passive[k]; S[k] = clamp(S[k]); });
    return { tired: tired };
  }

  function pickEvent(S, rnd) {
    rnd = rnd || Math.random;
    const pool = EVENTS.filter((e) => S.used.indexOf(e.t) < 0 && (!e.when || e.when(S)));
    const fallback = EVENTS.filter((e) => !e.when || e.when(S));
    const list = pool.length ? pool : fallback;
    const ev = list[(rnd() * list.length) | 0];
    S.used.push(ev.t);
    return ev;
  }

  function applyEffects(S, f) { Object.keys(f).forEach((k) => { S[k] = clamp(S[k] + f[k]); }); }

  /* The vote: all four columns have to clear their bar. */
  function verdict(S) {
    const N = CFG.NEED, ok = {};
    COLUMNS.forEach((k) => { ok[k] = Math.round(S[k]) >= N[k]; });
    const met = COLUMNS.filter((k) => ok[k]).length;
    const strong = met === 4 && Math.round(S.research) >= 82 && Math.round(S.teaching) >= 70 && Math.round(S.service) >= 60 && Math.round(S.standing) >= 54;
    return { ok: ok, met: met, tenure: met === 4, strong: strong };
  }

  const api = { CFG: CFG, METERS: METERS, COLUMNS: COLUMNS, TRACKS: TRACKS, LABEL: LABEL, PROFILES: PROFILES, PERKS: PERKS, EVENTS: EVENTS,
                clamp: clamp, newState: newState, mods: mods, takePerk: takePerk, offers: offers, yearStarts: yearStarts,
                fileSemester: fileSemester, pickEvent: pickEvent, applyEffects: applyEffects, verdict: verdict };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TenureModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
