/* ═══════════════════════════════════════════════════════════
   HOT SINGLES ON THE JOB MARKET — you are the hiring committee.
   Set the search, then swipe right on candidates who meet every
   criterion and left on the rest. Only the criteria on the pills
   count, and three of them are about what the candidate is like: a
   trait the committee insists on, one it cannot stand, and something
   the department offers. The card never states these outright; it
   hints at them in its own, funnier words, so you have to read it.
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
      likes: ['model theory', 'set theory', 'computability', 'proof theory'] },
    { name: 'Differential geometry',
      bios: ['Curved, but well-behaved.', 'Looking for someone with the right connection.',
             'Smooth operator. Literally.'],
      likes: ['Ricci flow', 'minimal surfaces', 'symplectic geometry', 'Riemannian metrics'] },
    { name: 'Algebra',
      bios: ['Looking for someone to quotient out my past.', 'Commutative, mostly.',
             'Seeking my other half. Normal subgroup preferred.'],
      likes: ['representation theory', 'Lie algebras', 'group theory', 'commutative rings'] },
    { name: 'Dynamical systems',
      bios: ['Chaotic, but with a strange attractor.', 'We keep returning to the same point.',
             'Sensitive dependence on initial conversation.'],
      likes: ['ergodic theory', 'bifurcations', 'billiards', 'fractals'] },
    { name: 'Statistics',
      bios: ['Significant, p < 0.05.', 'Will not be normalised.',
             'Regressing to the mean, and happy about it.'],
      likes: ['Bayesian methods', 'high-dimensional data', 'causal inference', 'time series'] },
    { name: 'Mathematical physics',
      bios: ['Strongly coupled.', 'Looking for a partner with a good partition function.',
             'Renormalise me.'],
      likes: ['quantum field theory', 'integrable systems', 'random matrices', 'string theory'] },
    { name: 'Theoretical computer science',
      bios: ['Polynomial time, for the right person.', 'Nondeterministically yours.',
             'Efficient, if you ignore the constants.'],
      likes: ['complexity', 'cryptography', 'algorithms', 'graph theory'] }
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
    'Love is a lemma. I am still looking for the proof.',
    'Swipe left if you say “just a quick question”.',
    'Fluent in sarcasm and Stack Exchange.',
    'Will referee your paper on a first date.',
    'I read the appendix.',
    'Single, but strongly connected.',
    'Ask me about my Erdős number. Please.',
    'Currently procrastinating on a grant application.',
    'Seminar buddy wanted.',
    'Believes in work-life balance. Theoretically.',
    'Looking for someone to be mildly anxious with.',
    'I answered a referee report in under a year.',
    'My idea of fun is a good counterexample.'
  ];

  /* What the committee cares about is written on the pills in plain words;
     what a candidate is like is written on their card in their own, funnier
     ones. A trait has a short label (the pill) and several ways the card can
     hint at it, and the card never says the label. So the only way to judge is
     to read the card. `opp` names a trait that cannot sit beside this one. */
  const MUST = [
    { id: 'email', label: 'answers email', opp: 'ghost', lines: [
      'Inbox zero since 2014.', 'Replies to email within the hour. Allegedly.',
      'Has never once written “sorry for the late reply”.'] },
    { id: 'chalk', label: 'teaches at the board', opp: 'slides', lines: [
      'Owns a personal box of chalk.', 'Has never opened a Beamer file voluntarily.',
      'Sleeves permanently dusted.'] },
    { id: 'detail', label: 'is careful with detail', lines: [
      'Reads the footnotes. And the appendix.', 'Found a typo in a 1987 preprint.',
      'Checks every proof twice, then a third time.'] },
    { id: 'time', label: 'keeps to time', opp: 'over', lines: [
      'Finishes talks on time. Yes, really.', 'Has never said “let me just finish this slide”.',
      'Wears a watch, ostentatiously.'] },
    { id: 'team', label: 'collaborates', lines: [
      'Seven co-authors on the last paper, all still speaking.', 'Shares code, data and sandwiches.',
      'Writes “we” in every abstract. Means it.'] },
    { id: 'cake', label: 'brings cake', lines: [
      'Has a sourdough starter with a name.', 'Brings cake to meetings. Every time.',
      'Known in the corridor for the lemon drizzle.'] },
    { id: 'students', label: 'looks after students', lines: [
      'Three PhD students graduated, all still on speaking terms.', 'Reads drafts within a week.',
      'Their students’ acknowledgements are suspiciously warm.'] },
    { id: 'credit', label: 'gives credit', lines: [
      'Cites other people’s work, unprompted.', 'Thanked the referee by name.',
      'The reference list has more names than the paper.'] }
  ];
  const DEAL = [
    { id: 'obvious', label: 'says “obviously”', lines: [
      '“It is obvious that…” opens every talk.', 'Calls other people’s theorems trivial.',
      'Left the proof “to the reader” on page one.'] },
    { id: 'ghost', label: 'ignores email', opp: 'email', lines: [
      'Out-of-office reply: “back in 2027”.', 'Last answered an email in 2019.',
      'Inbox: 41,238 unread. Proud of it.'] },
    { id: 'slides', label: 'loves slide effects', opp: 'chalk', lines: [
      'Beamer themes with animated transitions.', 'Last talk: 140 slides and a spinning logo.',
      'Calls it “just a few slides”. It is ninety.'] },
    { id: 'over', label: 'overruns', opp: 'time', lines: [
      'Talks run 20 minutes over, politely.', 'Has been cut off mid-sentence by the next speaker.',
      'Was once stopped by a fire alarm.'] },
    { id: 'ask', label: 'asks at faculty meetings', lines: [
      'Raises a hand at every faculty meeting.', 'Never leaves a meeting without “a quick question”.',
      'Famous for “just one small thing”.'] },
    { id: 'replyall', label: 'replies all', lines: [
      'Reply-all pioneer.', 'Once emailed the whole faculty about a lost umbrella.',
      'The CC list is longer than the paper.'] },
    { id: 'early', label: 'schedules early', lines: [
      'Schedules meetings for 8:00 sharp.', 'Considers 7:45 “a civilised start”.',
      'Has booked a Monday 8:00 seminar. Voluntarily.'] },
    { id: 'coffee', label: 'has coffee-machine opinions', lines: [
      'Has strong views on the department coffee machine.', 'Wrote a three-page memo on the espresso settings.',
      'Chairs the unofficial coffee committee.'] },
    { id: 'brag', label: 'brags', lines: [
      'Ask me about my h-index. Please.', 'Mentions a Fields Medal near-miss in the first minute.',
      'Signs email “Prof. (soon) Dr. Dr.”'] }
  ];
  const NEUTRAL = [
    'Plays chess badly', 'Will relocate. Probably.', 'Fluent in three languages, all of them LaTeX',
    'Has a dog called Lemma', 'Drinks tea, not coffee', 'Collects fountain pens',
    'Runs marathons slowly', 'Photographs doors', 'Knits. Mostly scarves.',
    'Hums while writing proofs', 'Keeps a plant on the desk', 'Has read all of Euclid',
    'Owns four identical sweaters', 'Likes trains', 'Bakes on weekends'
  ];

  /* What the department offers (the pill) and the ways a candidate can say
     they are looking for it (the card's "Looking for:" line). */
  const OFFERS = [
    { id: 'heat',   label: 'a warm office', lines: [
      'a department with working heating', 'somewhere the radiator works in January', 'an office that is not an igloo'] },
    { id: 'quiet',  label: 'peace and quiet', lines: [
      'a quiet office and a lively seminar', 'somewhere to hear myself think', 'a door that actually closes'] },
    { id: 'lunch',  label: 'free lunch', lines: [
      'a seminar that serves lunch', 'a department that feeds its seminar', 'sandwiches, preferably before the talk'] },
    { id: 'money',  label: 'long-term funding', lines: [
      'long-term funding. Any funding.', 'a grant that outlasts the contract', 'money, in writing, for more than a year'] },
    { id: 'leave',  label: 'research leave', lines: [
      'a sabbatical, eventually', 'a year away to finish the book', 'time off to write, written into the contract'] },
    { id: 'people', label: 'good colleagues', lines: [
      'colleagues who come to the talks', 'someone to share a whiteboard with', 'a corridor with good conversations'] },
    { id: 'view',   label: 'a room with a view', lines: [
      'an office with a window', 'a view that is not of a wall', 'daylight, ideally'] },
    { id: 'travel', label: 'travel money', lines: [
      'a generous travel budget', 'conferences paid for in advance', 'a travel budget that survives April'] },
    { id: 'kit',    label: 'working equipment', lines: [
      'a department with a working printer', 'a chair that does not squeak', 'a coffee machine that works'] },
    { id: 'light',  label: 'light teaching', lines: [
      'a teaching load with no surprises', 'no lectures on Monday at eight', 'a timetable made before the term starts'] }
  ];

  const STATUS = ['Active now', 'Active today', 'Online 3 min ago', 'Refereeing, probably',
                  'In a seminar', 'Answering one email', 'At the coffee machine'];

  const FIRST = ['Aurelia', 'Mateo', 'Ingrid', 'Tomasz', 'Priya', 'Kofi', 'Linnea', 'Dmitri', 'Yuki', 'Camille',
                 'Omar', 'Saoirse', 'Henrik', 'Lucía', 'Anand', 'Freya', 'Jonas', 'Mei', 'Rafael', 'Noor',
                 'Elias', 'Katarina', 'Ravi', 'Sofia', 'Björn', 'Amara', 'Viktor', 'Chiara', 'Hana', 'Oskar',
                 'Isabel', 'Tariq', 'Greta', 'Joon', 'Malin', 'Pablo', 'Zainab', 'Anders', 'Leila', 'Marek',
                 'Sigrid', 'Diego', 'Aiko', 'Emeka', 'Frida', 'Nikolai', 'Selma', 'Arjun', 'Ottilia', 'Luca',
                 'Ayesha', 'Kasper', 'Ngozi', 'Teodor', 'Maja', 'Hugo', 'Rania', 'Sven', 'Elif', 'Matías'];
  const LAST  = ['Voss', 'Lindqvist', 'Okafor', 'Marchetti', 'Tanaka', 'Novak', 'Haddad', 'Johansson', 'Rossi',
                 'Kowalski', 'Mbeki', 'Duarte', 'Nakamura', 'Fischer', 'Petrov', 'Abara', 'Lund', 'Moreau',
                 'Iyer', 'Kaplan', 'Sandoval', 'Berg', 'Ivanova', 'Cheng', 'Dubois', 'Papadakis', 'Rahman',
                 'Holm', 'Varga', 'Nyström', 'Alvarez', 'Brandt', 'Chowdhury', 'Demir', 'Eklund', 'Farouk',
                 'Gunnarsson', 'Hartmann', 'Ibrahim', 'Jovanović', 'Kim', 'Larsson', 'Mazur', 'Nwosu',
                 'Oliveira', 'Pettersson', 'Quist', 'Rao', 'Svensson', 'Takahashi', 'Ugarte', 'Vasquez',
                 'Weber', 'Xu', 'Yilmaz', 'Zielinski', 'Åkesson', 'Bianchi', 'Castillo', 'Dahl'];

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

  const ROUND = 60;   // seconds
  const RIGHT = 100;  // points for a right swipe, times the streak multiplier
  const WRONG = 200;  // points lost for a wrong one, so guessing does not pay
  const PENALTY = 2;  // seconds lost for a wrong one

  const S = {
    running: false,
    locked: true,
    sel: { field: 1, pos: 'assistant' },
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
    const q = c.quirks;
    const active = ['field', 'years'];
    if (c.papersMin)  active.push('papers');
    if (c.coursesMin) active.push('courses');
    if (q) active.push('must', 'deal', 'offer');

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

    const offer = (q && !bad.offer) ? q.offer
                : pick(OFFERS.filter((o) => !q || o !== q.offer));

    const first = pick(FIRST), last = pick(LAST);
    // What the card hints at. The committee's must-have is hinted at unless this
    // candidate is built to lack it; the dealbreaker only if they fail it.
    // Unrelated traits may appear too, never one that contradicts the rest.
    const ids = [], notes = [];
    function addTrait(t) {
      ids.push(t.id);
      notes.push(pick(t.lines));
    }
    if (q && !bad.must) addTrait(q.must);
    if (q && bad.deal)  addTrait(q.deal);
    const taken = (t) => ids.includes(t.id) || ids.includes(t.opp);
    const blocked = (t) => q && (t.id === q.must.id || t.id === q.deal.id ||
                                 t.opp === q.must.id || t.opp === q.deal.id);
    const spare = shuffle(MUST.concat(DEAL).filter((t) => !blocked(t)));
    const extra = (bad.must || bad.deal || !q) ? 1 : (Math.random() < 0.6 ? 1 : 0);
    for (let i = 0; i < spare.length && notes.length < (q ? 2 : 1) + extra; i++) {
      if (!taken(spare[i])) addTrait(spare[i]);
    }
    const neutral = shuffle(NEUTRAL.slice());
    const chips = [neutral.pop(), 'h-index ' + rnd(3, 38), 'likes ' + pick(field.likes)];
    return {
      name: first + ' ' + last,
      initials: first[0] + last[0],
      hue: rnd(0, 359),
      field: field, years: years,
      stage: stageOf(years),
      papers: papers, courses: courses,
      bio: Math.random() < 0.5 ? pick(field.bios) : pick(BIO),
      traits: ids,
      notes: shuffle(notes),
      extras: shuffle(chips),
      offer: offer,
      looking: pick(offer.lines),
      status: pick(STATUS),
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
    const q = c.quirks;
    if (q) {
      if (!cand.traits.includes(q.must.id)) r.push('nothing on the card says “' + q.must.label + '”');
      if (cand.traits.includes(q.deal.id))  r.push('dealbreaker, ' + q.deal.label);
      if (cand.offer !== q.offer)           r.push('they are after ' + cand.looking);
    }
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
        '<span class="active">' + cand.status + '</span>' +
      '</div>' +
      '<span class="tag">' + cand.field.name + '</span>' +
      '<p class="bio">“' + cand.bio + '”</p>' +
      '<div class="facts">' +
        '<div class="fact"><b>' + cand.papers + '</b><span>Papers</span></div>' +
        '<div class="fact"><b>' + cand.courses + '</b><span>Courses taught</span></div>' +
      '</div>' +
      '<ul class="notes">' + cand.notes.map((x) => '<li>' + x + '</li>').join('') + '</ul>' +
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
      (c.coursesMin ? pill('Teaching', '≥ ' + plural(c.coursesMin, 'course')) : '') +
      (c.quirks ? pill('Must', c.quirks.must.label) + pill('Dealbreaker', c.quirks.deal.label) +
                  pill('We offer', c.quirks.offer.label) : '');
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
      const pts = RIGHT * mult();
      S.score += pts;
      SFX.right();
      elWhy.className = 'why is-good';
      elWhy.textContent = '+' + pts + '  ' + (fits ? 'Meets every criterion.' : 'Pass: ' + r[0] + '.');
    } else {
      S.streak = 0;
      S.score -= WRONG;
      S.endsAt -= PENALTY * 1000;
      SFX.wrong();
      elWhy.className = 'why is-bad';
      elWhy.textContent = '−' + WRONG + ' and ' + PENALTY + ' s  ' + (fits ? 'That one met every criterion.' : 'Should have passed: ' + r.join(', ') + '.');
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
        '<div><h3>Field</h3><select class="select" id="field-select" aria-label="Field">' +
          FIELDS.map((f, i) => '<option value="' + i + '"' + (i === S.sel.field ? ' selected' : '') + '>' + f.name + '</option>').join('') +
        '</select></div>' +
        '<div><h3>Position</h3>' + chips('pos', Object.keys(POSITIONS).map((k) => ({ v: k, t: POSITIONS[k].name }))) + '</div>' +
      '</div>' +
      '<ul class="rules">' +
        '<li>Candidates arrive one by one. <b>Swipe right</b> (→) if they meet <b>every</b> criterion in the pills at the top, <b>left</b> (←) if not.</li>' +
        '<li>The committee’s quirks count too, and no card states them outright. It hints, in its own words, so <b>read the card</b>.</li>' +
        '<li>You have <b>' + ROUND + ' seconds</b>. A right swipe scores ' + RIGHT + ' (more with a streak). A wrong one costs <b>' + WRONG + ' points and ' + PENALTY + ' seconds</b>, so do not guess.</li>' +
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

  function drawQuirks() {
    const must = pick(MUST);
    const deal = pick(DEAL.filter((d) => d.id !== must.opp));
    return { must: must, deal: deal, offer: pick(OFFERS) };
  }

  function begin(keepQuirks) {
    SFX.unlock();
    const f = FIELDS[S.sel.field], p = POSITIONS[S.sel.pos];
    const keep = keepQuirks && S.crit;
    const pr = keep ? S.crit.prio : pick(Object.keys(PRIORITIES));
    S.crit = {
      field: f, pos: p, prio: pr,
      papersMin:  pr === 'teaching' ? 0 : p.papers,
      coursesMin: pr === 'research' ? 0 : p.courses,
      quirks: (keep && S.crit.quirks) || drawQuirks()
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
      S.sel[g] = chip.dataset.val;
      overlay.querySelectorAll('.chip[data-group="' + g + '"]').forEach((c) => {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      return;
    }
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'random-btn') {
      S.sel = { field: rnd(0, FIELDS.length - 1), pos: pick(Object.keys(POSITIONS)) };
      setupScreen();
    }
    if (b.id === 'start-btn') begin(false);
    if (b.id === 'same-btn')  begin(true);
    if (b.id === 'new-btn') setupScreen();
  });

  overlay.addEventListener('change', (e) => {
    if (e.target.id === 'field-select') S.sel.field = Number(e.target.value);
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
