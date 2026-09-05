/* ═══════════════════════════════════════════════════════════
   ARCADE — the noticeboard. Add a game by adding an entry.
   `href` present  → playable, card links out.
   `href` omitted  → shown as an idea still in development.
   ═══════════════════════════════════════════════════════════ */

const GAMES = [
  {
    title: 'Reviewer № 2',
    kicker: 'Whack-a-mole',
    href: 'reviewer2/index.html',
    blurb: 'Dread lands on your desk faster than you can clear it — gaps on page 17, ' +
           'circular lemmas, "quick chats". Three hits to see off Reviewer № 2 himself.'
  },
  {
    title: 'Proof or Bluff',
    kicker: 'Quickfire quiz',
    href: 'proof-or-bluff/index.html',
    blurb: 'A statement goes up. Real theorem, or plausible nonsense? Several of them ' +
           'differ from a real result by a single word.'
  },
  {
    title: 'Counterexample',
    kicker: 'Hidden object',
    href: 'counterexample/index.html',
    blurb: 'A conjecture goes up on the board and a grid of candidates below it. All but ' +
           'one satisfy the claim. Find the one that does not, before the timer does.'
  },
  {
    title: 'Blackboard Bingo',
    kicker: 'Bingo',
    href: 'blackboard-bingo/index.html',
    blurb: 'Sit through a seminar and mark the phrases as they land — "it is easy to see", ' +
           '"left as an exercise". Stay awake long enough to get a line.'
  },
  {
    title: 'Tenure Track',
    kicker: 'Resource management',
    href: 'tenure-track/index.html',
    blurb: 'Six years, three columns — research, teaching, service — and seven hours a ' +
           'semester to feed all of them. Something has to give. Survive to the vote.'
  },
  {
    title: 'Erdős Number',
    kicker: 'Graph puzzle',
    href: 'erdos-number/index.html',
    blurb: 'A co-authorship network sketched on a napkin. Wire yourself to Erdős, and ' +
           'mind the cost of every link you use.'
  },
  {
    title: 'The Gap',
    kicker: 'Ordering puzzle',
    href: 'the-gap/index.html',
    blurb: 'Reassemble a scrambled proof, line by line. One of the lines does not follow ' +
           'from the one above it. Spot it and leave it out.'
  }
];

/* ─── Render ─────────────────────────────────────────────── */

const board = document.getElementById('cards');

GAMES.forEach((g, i) => {
  const playable = Boolean(g.href);
  const card = document.createElement(playable ? 'a' : 'div');

  card.className = 'card' + (playable ? ' is-playable' : ' is-soon');
  if (playable) card.href = g.href;

  // Alternate the tilt so the board looks pinned rather than laid out.
  card.style.setProperty('--tilt', (i % 2 ? 1 : -1) * (0.7 + (i % 3) * 0.45) + 'deg');

  card.innerHTML =
    '<span class="pin" aria-hidden="true"></span>' +
    '<span class="card-kicker">' + g.kicker + '</span>' +
    '<h2 class="card-title">' + g.title + '</h2>' +
    '<p class="card-blurb">' + g.blurb + '</p>' +
    '<span class="card-foot">' +
      (playable ? 'Play <i aria-hidden="true">→</i>' : 'In development') +
    '</span>';

  board.appendChild(card);
});

/* A mug in whatever slot the last card leaves over. It is a grid item rather
   than an absolutely positioned decoration, so it always lands next to the
   final card however many columns the board happens to have. */

const MUG = `
<svg class="mug" viewBox="0 0 120 148" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="steam">
    <path class="wisp w1" d="M50 56 C 43 46, 57 38, 48 28 C 42 21, 52 14, 47 8"/>
    <path class="wisp w2" d="M62 58 C 55 47, 69 39, 60 28 C 54 21, 64 13, 59 6"/>
    <path class="wisp w3" d="M74 56 C 67 46, 81 38, 72 28 C 66 21, 76 14, 71 8"/>
  </g>

  <ellipse class="saucer"   cx="60" cy="130" rx="45" ry="9"/>
  <ellipse class="saucer-2" cx="60" cy="127" rx="38" ry="7"/>

  <path class="handle" d="M89 78 C 106 79, 108 100, 90 103"/>

  <path class="body" d="M31 66 L89 66 L83 116 C 82 122, 77 125, 71 125 L49 125 C 43 125, 38 122, 37 116 Z"/>
  <path class="shine" d="M42 72 C 39 86, 40 102, 45 117"/>

  <ellipse class="rim"    cx="60" cy="66" rx="29" ry="7"/>
  <ellipse class="coffee" cx="60" cy="67" rx="24" ry="5.4"/>
</svg>`;

const brew = document.createElement('div');
brew.className = 'brew';
brew.setAttribute('aria-hidden', 'true');
brew.innerHTML = MUG + '<span class="brew-note">help yourself</span>';
board.appendChild(brew);

const built = GAMES.filter((g) => g.href).length;
document.getElementById('tally').textContent =
  built + ' of ' + GAMES.length + ' built';
