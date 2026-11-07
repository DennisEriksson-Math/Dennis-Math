/* ═══════════════════════════════════════════════════════════
   GRANT ROULETTE — six funding calls, one panel with secret
   tastes. Build a proposal out of five buzzwords. Mean as little
   as possible, and work out what this year's panel wants.

   How the panel is signalled (the three clues you have):
     1. the call itself, which hints at what they like and what
        they are sick of, in the panel's own oblique language;
     2. the titles that were funded last time;
     3. the reviewers' comments after every submission.

   Everything about the writing is in the lists up here.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const ROUNDS   = 6;
  const BAR      = 55;       // the score a proposal needs to be funded
  const BASE     = 20;
  const PER_POINT = 10000;   // pounds per point, when funded

  const P1 = 14, P2 = 9, TABOO = -14, OTHER = 1, FLUFF = 3, SPECIFIC = -14;
  const OVERUSE = -12;       // for each mention of one tag beyond the second
  const AGAIN   = -8;        // same angle as the previous call
  const STALE   = -5;        // a word the panel has already read in this run
  const RHYME   = 6;         // two neighbouring words that start alike

  /* ─── What the panel can care about ──────────────────────── */

  const TAGS = {
    green: {
      label: 'the climate',
      topic: 'the climate angle',
      want: [
        'The Foundation would like a planet to still be here when the grant ends.',
        'Applicants are reminded that the strategy mentions carbon, in bold.',
        'The panel has been told, firmly, to think about the climate.',
        'Anything that grows, regenerates or can be recycled will be warmly received.',
        'The chair has recently planted a tree and wishes to see more of them.'
      ],
      tired: [
        'The panel has had quite enough of the word “sustainable” for one lifetime.',
        'No more forests, please. The panel has seen the forests.',
        'The Foundation has stepped back from the climate conversation, for now.',
        'Last year’s carbon proposals were, regrettably, all the same proposal.',
        'The panel would like to talk about something other than the weather.'
      ]
    },
    digital: {
      label: 'digital',
      topic: 'the digital side',
      want: [
        'The panel enjoys a good algorithm.',
        'Data is the new oil, according to a slide in the Foundation’s strategy.',
        'Anything with AI in it will be read first.',
        'Applicants are encouraged to think about the cloud.',
        'The Minister has said “digital” four times this month and the panel has noticed.'
      ],
      tired: [
        'The panel has seen enough dashboards to last it a decade.',
        'Saying “AI” is no longer a strategy.',
        'The word “data” will be treated with suspicion.',
        'Please, no platforms. The panel has a platform on every floor.',
        'The panel would like to hear from someone who has not just discovered the cloud.'
      ]
    },
    health: {
      label: 'health',
      topic: 'the focus on wellbeing',
      want: [
        'The panel is keen on anything that makes people feel better.',
        'Patients appear in this year’s strategy, in a good light.',
        'The Foundation’s chair has had a very good experience with a hospital.',
        'Wellbeing is on the front page of the call.',
        'Anything that might keep the nation out of a waiting room will be read twice.'
      ],
      tired: [
        'The panel is tired of patients being “at the centre” of everything.',
        'No more clinics, thank you. The panel has been to one.',
        'The word “wellbeing” has been retired for the season.',
        'Nothing about care pathways. The pathways are full.',
        'The panel would prefer not to think about its own health this year.'
      ]
    },
    inclusion: {
      label: 'inclusion',
      topic: 'the attention to inclusion',
      want: [
        'Everyone should have a seat at the table, according to the call.',
        'Voices that have not been heard before are very welcome.',
        'The panel would like to see communities, in the plural.',
        'Applicants should think about who is not in the room.',
        'The panel has been on a course, and has come back much more attentive.'
      ],
      tired: [
        'The panel has heard from every community it can think of.',
        'Please do not “co-design” anything this year.',
        'The word “inclusive” has been used up.',
        'The panel has already listened. At length.',
        'Nobody will be invited to the table this year; the table is full.'
      ]
    },
    industry: {
      label: 'industry',
      topic: 'the industrial angle',
      want: [
        'The Foundation is eager for the private sector to get involved, preferably with money.',
        'Applicants should show how it might be sold.',
        'Anything scalable will be scaled up in the panel’s estimation.',
        'The Minister has said “impact” and “growth” in the same breath, twice.',
        'A member of the panel sits on three boards and would like to talk about all of them.'
      ],
      tired: [
        'The panel suspects that industry has plenty of money of its own.',
        'No more start-ups. The corridor is full of them.',
        'The word “scalable” has been scaled back.',
        'Applicants are asked not to monetise anything this year.',
        'The panel has had a long month of pitch decks.'
      ]
    },
    security: {
      label: 'security',
      topic: 'the security thinking',
      want: [
        'The panel would feel safer with something resilient in the proposal.',
        'Threats of every kind are very much on the Foundation’s mind.',
        'Anything that can be defended, hardened or locked is of interest.',
        'Strategic autonomy has been mentioned at three board meetings.',
        'The call asks, in its opening line, whether anybody has locked the door.'
      ],
      tired: [
        'The panel feels quite secure enough, thank you.',
        'Please do not frighten the board this year.',
        'Resilience has been very resilient, and has had enough.',
        'No more threats. The board is exhausted.',
        'The word “critical” has been used critically often.'
      ]
    },
    open: {
      label: 'openness',
      topic: 'the openness',
      want: [
        'The Foundation believes knowledge should be shared, at no cost to the Foundation.',
        'Anything open, transparent or free will be warmly received.',
        'The panel is fond of commons, in every sense.',
        'Applicants are asked to share. Sharing is on the scoring sheet.',
        'The Foundation has just opened its own front door and is very pleased with it.'
      ],
      tired: [
        'The panel notes that everything is already open.',
        'Please do not open anything else this year.',
        'The word “transparent” has been withdrawn, for reasons the panel will not disclose.',
        'No more commons. The panel has enough to be going on with.',
        'The panel would like some things to stay closed.'
      ]
    },
    global: {
      label: 'the international side',
      topic: 'the international reach',
      want: [
        'The call is aimed at the whole world, or as much of it as the budget allows.',
        'Applicants are encouraged to think beyond their own borders.',
        'The panel likes a map with arrows on it.',
        'International consortia receive additional goodwill.',
        'The chair has just flown back from somewhere and wishes to say so.'
      ],
      tired: [
        'The panel has seen quite enough maps with arrows on them.',
        'Please do not travel anywhere on the Foundation’s behalf this year.',
        'The word “global” has been spread rather thin.',
        'No more consortia. They were all the same consortium.',
        'The panel would like everything to happen closer to home.'
      ]
    }
  };
  const TAG_IDS = Object.keys(TAGS);

  /* ─── The words ──────────────────────────────────────────── */

  /* The sentence: We will [verb] [adjective] [noun] through [method] to deliver [outcome].
     Every cell is a list. A word is tagged by the cell it sits in; `neutral`
     is plain hot air (a little credit) and `specific` is a mistake (it could
     be checked). */
  const WORDS = {
    verb: {
      neutral: ['unlock', 'harness', 'reimagine', 'catalyse', 'operationalise', 'co-create', 'empower',
        'leverage', 'foster', 'orchestrate', 'transform', 'reframe', 'cultivate', 'accelerate',
        'democratise', 'reinvent', 'galvanise', 'scaffold', 'steward', 'amplify', 'embed', 'convene',
        'mobilise', 'spearhead', 'synergise', 'future-proof', 'disrupt', 'elevate'],
      specific: ['prove', 'measure', 'test', 'count', 'check']
    },
    adj: {
      green: ['carbon-neutral', 'regenerative', 'circular', 'net-zero', 'nature-positive', 'climate-friendly'],
      digital: ['AI-enabled', 'data-driven', 'cloud-native', 'algorithmic', 'digital-first', 'smart'],
      health: ['patient-centred', 'wellbeing-focused', 'preventive', 'person-centred', 'life-enhancing', 'clinically relevant'],
      inclusion: ['inclusive', 'intersectional', 'equitable', 'participatory', 'co-designed', 'accessible'],
      industry: ['market-ready', 'scalable', 'industry-led', 'investable', 'enterprise-grade', 'commercially viable'],
      security: ['secure', 'trusted', 'defence-grade', 'tamper-proof', 'hardened', 'threat-aware'],
      open: ['open-source', 'open-access', 'transparent', 'FAIR', 'freely available', 'community-owned'],
      global: ['global', 'transnational', 'pan-European', 'worldwide', 'cross-border', 'multi-continental'],
      neutral: ['transformative', 'synergistic', 'next-generation', 'paradigm-shifting', 'bold', 'cutting-edge',
        'world-class', 'interdisciplinary', 'ground-breaking', 'game-changing', 'agile', 'novel', 'visionary',
        'multi-scale'],
      specific: ['falsifiable', 'narrow', 'incremental', 'modest', 'rigorous', 'finite']
    },
    noun: {
      green: ['ecosystems', 'carbon sinks', 'food systems', 'green corridors', 'circular economies', 'living landscapes'],
      digital: ['platforms', 'data lakes', 'digital twins', 'algorithms', 'dashboards', 'neural networks'],
      health: ['care pathways', 'clinics', 'patient journeys', 'health systems', 'wellbeing hubs', 'treatment options'],
      inclusion: ['communities', 'voices', 'safe spaces', 'learning communities', 'belonging networks', 'community networks'],
      industry: ['value chains', 'start-ups', 'innovation hubs', 'supply chains', 'business models', 'spin-outs'],
      security: ['infrastructures', 'defences', 'safeguards', 'critical systems', 'borders', 'firewalls'],
      open: ['commons', 'repositories', 'knowledge networks', 'open archives', 'public goods', 'shared libraries'],
      global: ['partnerships', 'alliances', 'consortia', 'world networks', 'continental bridges', 'knowledge embassies'],
      neutral: ['frameworks', 'paradigms', 'landscapes', 'synergies', 'pathways', 'toolkits', 'narratives',
        'interfaces', 'ecologies'],
      specific: ['theorems', 'lemmas', 'footnotes', 'proofs', 'counterexamples']
    },
    method: {
      green: ['regenerative design', 'life-cycle thinking', 'nature-based solutions', 'rewilding workshops', 'circular redesign', 'carbon accounting'],
      digital: ['machine learning', 'big-data analytics', 'generative AI', 'digital twinning', 'federated learning', 'automated insight'],
      health: ['patient engagement', 'preventive screening', 'bedside co-design', 'wellbeing audits', 'clinical partnerships', 'health-literacy campaigns'],
      inclusion: ['participatory co-design', 'listening circles', 'lived-experience panels', 'inclusive practice', 'community assemblies', 'accessible design'],
      industry: ['public–private partnership', 'rapid prototyping', 'market validation', 'venture building', 'technology transfer', 'commercial pilots'],
      security: ['stress-testing', 'red-teaming', 'zero-trust architecture', 'threat modelling', 'hardening exercises', 'resilience drills'],
      open: ['open peer review', 'citizen science', 'open data sharing', 'open workshops', 'FAIR principles', 'public consultation'],
      global: ['international mobility', 'global workshops', 'cross-continental exchange', 'multi-country cooperation', 'twinning schemes', 'diplomatic outreach'],
      neutral: ['stakeholder engagement', 'knowledge exchange', 'iterative co-creation', 'agile sprints',
        'holistic synthesis', 'creative dialogue', 'capacity building', 'horizon scanning', 'deep reflection'],
      specific: ['rigorous proof', 'careful calculation', 'a clear timetable', 'a randomised trial', 'a worked example']
    },
    outcome: {
      green: ['a net-zero future', 'planetary stewardship', 'a thriving biosphere', 'carbon-negative growth', 'a greener tomorrow', 'ecological renewal'],
      digital: ['digital transformation', 'intelligent automation', 'smarter decisions', 'data sovereignty', 'a connected future', 'an AI-ready society'],
      health: ['healthier lives', 'better wellbeing outcomes', 'care closer to home', 'longer, happier lives', 'a healthier nation', 'dignity at every stage'],
      inclusion: ['social cohesion', 'a fairer society', 'belonging for all', 'equity at scale', 'a voice for everyone', 'shared prosperity'],
      industry: ['economic growth', 'market leadership', 'jobs and growth', 'commercial impact', 'a competitive edge', 'investor confidence'],
      security: ['strategic autonomy', 'a safer world', 'societal resilience', 'trusted infrastructure', 'peace of mind', 'national preparedness'],
      open: ['open knowledge for all', 'a shared commons', 'radical transparency', 'democratised access', 'knowledge without walls', 'public value'],
      global: ['global impact', 'international leadership', 'worldwide uptake', 'a connected world', 'North–South cooperation', 'worldwide influence'],
      neutral: ['a step change', 'a lasting legacy', 'transformative impact', 'societal benefit', 'a new paradigm',
        'systemic change', 'impact beyond academia', 'a better tomorrow', 'a quiet revolution'],
      specific: ['one small theorem', 'a modest improvement', 'a footnote in a journal', 'a result', 'an honest negative result']
    }
  };

  const SLOT_IDS    = ['verb', 'adj', 'noun', 'method', 'outcome'];
  const SLOT_NAMES  = ['verb', 'adjective', 'noun', 'method', 'outcome'];
  const SLOT_PROMPT = ['a verb', 'an adjective', 'a noun', 'a method', 'an outcome'];

  /* The call's two hints, by round: P1 and P2 are what the panel likes, T what it is tired of. */
  const HINTS = [['p1', 't'], ['p2', 'p1'], ['t', 'p2'], ['p1', 'p2'], ['t', 'p1'], ['p2', 't']];

  const FUND_A = ['Horizon', 'Frontier', 'Catalyst', 'Pioneer', 'Beacon', 'Summit', 'Nexus', 'Vanguard', 'Meridian', 'Compass'];
  const FUND_B = ['Fund', 'Scheme', 'Programme', 'Call', 'Initiative', 'Award', 'Challenge', 'Partnership'];

  /* ─── The reviewers ──────────────────────────────────────── */

  const SAY = {
    p1yes:  ['“Loved {t}. More of this, please.”', '“Very strong on {t}. I was nodding.”', '“At last, someone who understands {t}.”'],
    p1no:   ['“Where is {t}? The call practically begged for it.”', '“Nothing here on {t}. Did you read the call?”', '“I kept waiting for {t}. It never came.”'],
    p2yes:  ['“{t} is a nice touch.”', '“Good to see {t} in there as well.”', '“A little {t}, and appreciated.”'],
    p2no:   ['“Could there have been a little more of {t}?”', '“The panel would also like {t}, in moderation.”'],
    taboo:  ['“Not {t} again. We are all rather tired of it.”', '“I had hoped to be spared {t} this year.”', '“Some of us are very done with {t}.”'],
    spec:   ['“Is any of this checkable? We cannot fund what can be checked.”', '“Too specific. Somebody might hold us to this.”', '“There is something concrete in here. Please remove it.”'],
    many:   ['“Quite a lot of {t}. One can have too much of a good thing.”', '“The panel counted the mentions of {t}. It did not take long.”'],
    again:  ['“The same angle as last time. We did read last time.”', '“Haven’t we just been here?”'],
    stale:  ['“We have read some of these words before.”', '“Wasn’t that phrase in the last one?”'],
    rhyme:  ['“Lovely rhythm. Someone here has an ear.”', '“It scans beautifully. It also means nothing. Perfect.”'],
    fluff:  ['“Reads beautifully. Says nothing. Very fundable.”', '“I could not tell you what it is, and I loved it.”'],
    filler: ['“I read the abstract and the font.”', '“Fine. I have a train to catch.”', '“Seemed fine. I was on mute.”', '“I did not have my glasses.”']
  };

  const ENDS = [
    [ // 0 funded
      ['Rejected, <span>warmly</span>', 'Six letters, each beginning “We were very impressed”. You have been warmly invited to resubmit, and a reviewer has used your name as an example.'],
      ['The panel <span>regrets</span>', 'All six calls declined. The panel adds that it is “a very difficult funding climate”, as it does to everyone, and wishes you the best.']
    ],
    [ // 1-2
      ['A small <span>pilot grant</span>', 'One or two of them landed. The money is enough for a laptop and a very modest conference. A reviewer says you have “real potential”.'],
      ['Funded, <span>technically</span>', 'You are funded for part of the project, for part of the time, at part of the cost. The reporting requirements are in full.']
    ],
    [ // 3-4
      ['A decent <span>portfolio</span>', 'Half or more of your calls came through. You have, as the panel puts it, a track record. It will now be used against you.'],
      ['Funding <span>secured</span>', 'Most of the calls said yes. You will spend the money on a project that does not resemble anything you wrote. Nobody will check.']
    ],
    [ // 5-6
      ['Centre <span>of Excellence</span>', 'Nearly every panel loved you. You have been asked to join the next panel, and to write a recommendation letter for someone you have not met.'],
      ['Principal Investigator <span>of Everything</span>', 'Funded again and again. You have forgotten what the original idea was, which is, the panel feels, exactly the point.']
    ]
  ];

  /* ─── State ──────────────────────────────────────────────── */

  const S = {
    running: false,
    round: 0,                // 0-based
    total: 0,
    funded: 0,
    best: Number(localStorage.getItem('grantroulette.best') || 0),
    panel: null,             // { p1, p2, t }
    hands: [],               // per slot, the five words on offer
    pick: [],                // per slot, the chosen word or null
    active: 0,
    used: new Set(),         // words already submitted in this run
    lastDominant: null,
    last: null
  };

  const $ = (id) => document.getElementById(id);
  const elTotal = $('total'), elFunded = $('funded'), elBest = $('best'), elRound = $('round');
  const elTag = $('call-tag'), elTitle = $('call-title'), elBlurb = $('call-blurb'), elFundedLine = $('call-funded');
  const elSentence = $('sentence'), elHandLabel = $('hand-label'), elTiles = $('tiles');
  const btnSubmit = $('submit'), overlay = $('overlay');

  /* ─── Helpers ────────────────────────────────────────────── */

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function rnd(a) { return a[(Math.random() * a.length) | 0]; }

  /* A shuffled bag per list: nothing comes round twice until the rest have. */
  const bags = new Map();
  function draw(list) {
    let b = bags.get(list);
    if (!b || !b.length) { b = shuffle(list.slice()); bags.set(list, b); }
    return b.pop();
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function titleCase(t) { return t.split(' ').map(cap).join(' '); }

  function money(n) {
    if (n >= 1e6) return '£' + (n / 1e6).toFixed(2) + 'M';
    return '£' + Math.round(n / 1000) + 'k';
  }

  /* The first letter that counts: a leading article does not. */
  function initial(w) {
    return w.replace(/^(a|an|the|one)\s+/i, '').charAt(0).toLowerCase();
  }

  /* ─── Phones: shrink the content until it fits ───────────── */

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

  /* ─── Building a call ────────────────────────────────────── */

  function word(slot, cell, avoid) {
    const list = WORDS[slot][cell];
    const fresh = list.filter((w) => !S.used.has(w) && avoid.indexOf(w) < 0);
    const any   = list.filter((w) => avoid.indexOf(w) < 0);
    const pool  = fresh.length ? fresh : any;
    const text  = rnd(pool);
    return { text: text, slot: slot, tag: cell };
  }

  /* Five words for one slot. There is always a way to please the panel, and
     usually a way to annoy it: the rest is for you to tell apart. */
  function makeHand(slot) {
    const out = [], texts = [];
    const add = (cell) => {
      if (!WORDS[slot][cell]) return;
      const w = word(slot, cell, texts);
      out.push(w); texts.push(w.text);
    };

    if (slot === 'verb') {
      const n = Math.random() < 0.5 ? 4 : 5;
      for (let i = 0; i < n; i++) add('neutral');
      if (n === 4) add('specific');
      return shuffle(out);
    }

    add(S.panel.p1);
    add(S.panel.p2);
    if (Math.random() < 0.7)  add(S.panel.t);
    if (Math.random() < 0.45) add('specific');
    const others = TAG_IDS.filter((t) => t !== S.panel.p1 && t !== S.panel.p2 && t !== S.panel.t);
    while (out.length < 5) add(Math.random() < 0.45 ? 'neutral' : rnd(others));
    return shuffle(out);
  }

  function makeCall(r) {
    const name = rnd(FUND_A) + ' ' + rnd(FUND_B);
    const hint = (k) => k === 't'  ? draw(TAGS[S.panel.t].tired)
                      : k === 'p1' ? draw(TAGS[S.panel.p1].want)
                                   : draw(TAGS[S.panel.p2].want);
    const kinds = HINTS[r % HINTS.length];

    // Two titles the panel funded last time: a word it likes in each, never one it does not.
    const title = (a, b) => titleCase(word('adj', a, []).text + ' ' + word('noun', b, []).text);
    const t1 = title(S.panel.p1, S.panel.p2), t2 = title(S.panel.p2, S.panel.p1);

    return {
      name: name,
      blurb: hint(kinds[0]) + ' ' + hint(kinds[1]),
      funded: 'Funded last time: “' + t1 + '” and “' + t2 + '”.'
    };
  }

  /* ─── Marking ────────────────────────────────────────────── */

  function score(picks) {
    let pts = 0;
    const n = {};          // mentions of each tag
    const notes = {};      // what happened, for the reviewers
    let spec = 0, fluff = 0, stale = 0;

    picks.forEach((w) => {
      const seen = S.used.has(w.text);
      let v;
      if (w.tag === 'specific')           { v = SPECIFIC; spec++; }
      else if (w.tag === 'neutral')       { v = FLUFF; fluff++; }
      else if (w.tag === S.panel.p1)      { v = P1;     n[w.tag] = (n[w.tag] || 0) + 1; }
      else if (w.tag === S.panel.p2)      { v = P2;     n[w.tag] = (n[w.tag] || 0) + 1; }
      else if (w.tag === S.panel.t)       { v = TABOO;  n[w.tag] = (n[w.tag] || 0) + 1; }
      else                                { v = OTHER;  n[w.tag] = (n[w.tag] || 0) + 1; }
      if (seen) { v = v > 0 ? 0 : v; pts += STALE; stale++; }
      pts += v;
    });

    // Too much of one thing.
    let overTag = null;
    Object.keys(n).forEach((t) => { if (n[t] > 2) { pts += OVERUSE * (n[t] - 2); overTag = t; } });

    // The same emphasis as the last call.
    let dominant = null, top = 1;
    Object.keys(n).forEach((t) => { if (n[t] > top) { top = n[t]; dominant = t; } });
    const again = dominant && dominant === S.lastDominant;
    if (again) pts += AGAIN;

    // Two neighbours that start alike.
    let rhyme = false;
    for (let i = 0; i < picks.length - 1; i++) {
      if (initial(picks[i].text) === initial(picks[i + 1].text)) rhyme = true;
    }
    if (rhyme) pts += RHYME;

    const total = Math.max(0, Math.min(100, Math.round(BASE + pts)));
    return { total: total, n: n, spec: spec, fluff: fluff, stale: stale, overTag: overTag,
             again: again, dominant: dominant, rhyme: rhyme };
  }

  /* Three reviewers, each telling you one true thing. Never the whole picture. */
  function reviews(res) {
    const t = (id) => TAGS[id].topic;
    const lines = [];
    const say = (k, tag) => lines.push(draw(SAY[k]).replace('{t}', tag ? t(tag) : ''));
    const has = (id) => (res.n[id] || 0) > 0;

    // The facts worth telling, most useful first.
    const facts = [];
    facts.push(has(S.panel.p1) ? () => say('p1yes', S.panel.p1) : () => say('p1no', S.panel.p1));
    if (has(S.panel.t))   facts.push(() => say('taboo', S.panel.t));
    if (res.spec)         facts.push(() => say('spec'));
    if (has(S.panel.p2))  { if (Math.random() < 0.65) facts.push(() => say('p2yes', S.panel.p2)); }
    else if (Math.random() < 0.4) facts.push(() => say('p2no', S.panel.p2));
    if (res.overTag)      facts.push(() => say('many', res.overTag));
    if (res.again)        facts.push(() => say('again'));
    if (res.stale)        facts.push(() => say('stale'));
    if (res.rhyme)        facts.push(() => say('rhyme'));
    if (res.fluff >= 3)   facts.push(() => say('fluff'));

    // The first fact is always told; the other two are drawn from the rest.
    const first = facts.shift();
    const chosen = [first].concat(shuffle(facts)).slice(0, 3);
    chosen.forEach((f) => f());
    while (lines.length < 3) say('filler');

    return shuffle(lines).slice(0, 3);
  }

  /* ─── Rendering ──────────────────────────────────────────── */

  function render() {
    elTotal.textContent = money(S.total);
    elFunded.textContent = S.funded;
    elBest.textContent = money(S.best);
    elRound.textContent = 'Call ' + Math.min(S.round + 1, ROUNDS) + ' of ' + ROUNDS;
  }

  function renderSentence() {
    const slot = (i) => {
      const w = S.pick[i];
      return '<button type="button" class="slot' + (w ? ' is-filled' : '') +
        (i === S.active ? ' is-active' : '') + '" data-i="' + i + '">' +
        (w ? w.text : SLOT_NAMES[i]) + '</button>';
    };
    elSentence.innerHTML = 'We will ' + slot(0) + ' ' + slot(1) + ' ' + slot(2) +
      ' through ' + slot(3) + ' to deliver ' + slot(4) + '.';
    elSentence.querySelectorAll('.slot').forEach((b) => {
      b.addEventListener('click', () => { S.active = Number(b.getAttribute('data-i')); renderSentence(); renderTiles(); });
    });
    btnSubmit.disabled = !S.running || S.pick.some((w) => !w);
  }

  function renderTiles() {
    elHandLabel.textContent = 'Choose ' + SLOT_PROMPT[S.active];
    elTiles.innerHTML = '';
    S.hands[S.active].forEach((w) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile' + (S.pick[S.active] && S.pick[S.active].text === w.text ? ' is-chosen' : '');
      b.textContent = w.text;
      b.addEventListener('click', () => choose(w));
      elTiles.appendChild(b);
    });
    fit(false);
  }

  function choose(w) {
    if (!S.running) return;
    S.pick[S.active] = w;
    SFX.pick();
    // On to the next empty slot, if there is one.
    for (let k = 1; k <= SLOT_IDS.length; k++) {
      const j = (S.active + k) % SLOT_IDS.length;
      if (!S.pick[j]) { S.active = j; break; }
    }
    renderSentence();
    renderTiles();
  }

  function startRound() {
    const call = makeCall(S.round);
    elTag.textContent = 'Call ' + (S.round + 1) + ' of ' + ROUNDS;
    elTitle.textContent = 'The ' + call.name;
    elBlurb.textContent = call.blurb;
    elFundedLine.textContent = call.funded;
    S.hands = SLOT_IDS.map(makeHand);
    S.pick = [null, null, null, null, null];
    S.active = 0;
    S.running = true;
    render();
    renderSentence();
    renderTiles();
    fit(true);
  }

  /* ─── Submitting ─────────────────────────────────────────── */

  function submit() {
    if (!S.running || S.pick.some((w) => !w)) return;
    S.running = false;
    SFX.stamp();

    const res = score(S.pick);
    const funded = res.total >= BAR;
    const award = funded ? res.total * PER_POINT : 0;
    const notes = reviews(res);

    S.pick.forEach((w) => S.used.add(w.text));
    S.lastDominant = res.dominant;
    S.total += award;
    if (funded) S.funded++;
    if (S.total > S.best) { S.best = S.total; localStorage.setItem('grantroulette.best', String(S.best)); }

    setTimeout(() => { funded ? SFX.right() : SFX.wrong(); }, 220);
    render();
    renderSentence();

    const p = S.pick.map((w) => w.text);
    const sentence = 'We will ' + p[0] + ' ' + p[1] + ' ' + p[2] + ' through ' + p[3] + ' to deliver ' + p[4] + '.';

    const last = S.round + 1 >= ROUNDS;
    show(
      '<div class="sheet sheet-result">' +
      '<div class="sheet-kicker">Call ' + (S.round + 1) + ' of ' + ROUNDS + '</div>' +
      '<h1 class="sheet-title' + (funded ? ' is-good' : '') + '">' +
        (funded ? 'Funded: <span>' + money(award) + '</span>' : 'Not <span>funded</span>') + '</h1>' +
      '<p class="filed">' + sentence + '</p>' +
      '<div class="meter"><div class="meter-fill' + (funded ? ' is-good' : '') + '" id="meter-fill"></div>' +
        '<div class="meter-bar" style="left:' + BAR + '%"></div></div>' +
      '<div class="meter-cap"><span>Score ' + res.total + '</span><span>Needed ' + BAR + '</span></div>' +
      '<ul class="reviews">' + notes.map((l, i) => '<li><b>Reviewer ' + (i + 1) + '</b> ' + l + '</li>').join('') + '</ul>' +
      '<button class="btn" id="next-btn">' + (last ? 'See the verdict' : 'Next call') + '</button>' +
      '</div>'
    );
    requestAnimationFrame(() => requestAnimationFrame(() => { $('meter-fill').style.width = res.total + '%'; }));
    $('next-btn').addEventListener('click', () => {
      S.round++;
      if (S.round >= ROUNDS) { endScreen(); return; }
      overlay.classList.remove('is-open');
      startRound();
    });
  }

  /* ─── Screens ────────────────────────────────────────────── */

  function show(html) { overlay.innerHTML = html; overlay.classList.add('is-open'); }

  function startScreen() {
    show(
      '<div class="sheet sheet-start">' +
      '<div class="sheet-kicker">A funding round</div>' +
      '<h1 class="sheet-title">Grant <span>Roulette</span></h1>' +
      '<p class="sheet-body">Six calls, one panel. Fill in a sentence with five words and ' +
      'say as much as you can without meaning anything.</p>' +
      '<ul class="sheet-rules">' +
        '<li>The panel has <b>tastes</b>: two things it likes, one it is tired of. It will not say which. Read the call, the titles it funded last time and the reviewers’ comments.</li>' +
        '<li>Anything <b>concrete</b> is a risk. If it could be checked, nobody will fund it.</li>' +
        '<li>Do not lean on one theme, and do not say what you said last time.</li>' +
        '<li>A score of ' + BAR + ' gets funded, and the score is the money.</li>' +
      '</ul>' +
      '<button class="btn" id="start-btn">Open the first call</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('start-btn').addEventListener('click', start);
  }

  function endScreen() {
    S.running = false;
    const k = S.funded;
    const tier = k === 0 ? 0 : k <= 2 ? 1 : k <= 4 ? 2 : 3;
    const e = rnd(ENDS[tier]);
    const pn = S.panel;
    const verdict = 'This panel liked ' + TAGS[pn.p1].label + ' most, then ' + TAGS[pn.p2].label +
      ', and was tired of ' + TAGS[pn.t].label + '.';
    (k >= 3 ? SFX.win : SFX.over)();
    show(
      '<div class="sheet sheet-end">' +
      '<div class="sheet-kicker">The verdict</div>' +
      '<h1 class="sheet-title' + (k >= 3 ? ' is-good' : '') + '">' + e[0] + '</h1>' +
      '<p class="sheet-body">' + e[1] + '</p>' +
      '<p class="sheet-body"><b>' + verdict + '</b></p>' +
      '<div class="result">' +
        '<div><b>' + k + '/' + ROUNDS + '</b><span>Funded</span></div>' +
        '<div><b>' + money(S.total) + '</b><span>Awarded</span></div>' +
        '<div><b>' + money(S.best) + '</b><span>Best</span></div>' +
      '</div>' +
      '<button class="btn" id="again-btn">Another panel</button>' +
      '<a class="sheet-back" href="../index.html">← Back to the Common Room</a>' +
      '</div>'
    );
    $('again-btn').addEventListener('click', start);
  }

  function pickPanel() {
    const t = shuffle(TAG_IDS.slice());
    return { p1: t[0], p2: t[1], t: t[2] };
  }

  function start() {
    SFX.unlock();
    overlay.classList.remove('is-open');
    S.panel = pickPanel();
    S.round = 0; S.total = 0; S.funded = 0;
    S.used = new Set(); S.lastDominant = null;
    startRound();
  }

  /* ─── Wiring ─────────────────────────────────────────────── */

  btnSubmit.addEventListener('click', submit);

  S.panel = pickPanel();
  S.hands = SLOT_IDS.map(() => []);
  S.pick = [null, null, null, null, null];
  render();
  renderSentence();
  elHandLabel.textContent = 'Choose a verb';
  startScreen();

})();
