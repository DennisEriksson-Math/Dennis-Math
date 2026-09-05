# The Common Room

A noticeboard of small browser games about mathematics and academic life.
Plain HTML, CSS and JavaScript — **no framework, no build step, no
dependencies, no image files.** Every sound is synthesised at runtime.

## Run it

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 4321
```

Every internal link points at an explicit `index.html`, so the site works from
the filesystem as well as from a server. (Linking to a bare directory shows a
file listing under `file://`, which is why.)

## Layout

```
index.html         arcade.css  arcade.js     ← the noticeboard
reviewer2/         index.html  game.css  game.js  sfx.js
counterexample/    index.html  game.css  game.js  sfx.js
tenure-track/      index.html  game.css  game.js  sfx.js
proof-or-bluff/    index.html  game.css  game.js  sfx.js
blackboard-bingo/  index.html  game.css  game.js  sfx.js
erdos-number/      index.html  game.css  game.js  sfx.js
the-gap/           index.html  game.css  game.js  sfx.js
orbit/             index.html  styles.css  physics.js  main.js  audio.js
```

Each game folder is self-contained — copy any one of them anywhere and it runs.

## The board

| Game | Mechanic | Setting |
|---|---|---|
| **Reviewer № 2** | Whack-a-mole | A desk at 2am |
| **Counterexample** | Hidden object | A blackboard |
| **Tenure Track** | Resource management | A personnel file |
| **Proof or Bluff** | Quickfire quiz | A card under a lamp |
| **Blackboard Bingo** | Bingo | The back row of a lecture hall |
| **Erdős Number** | Weighted shortest path | Ink on a legal pad |
| **The Gap** | Ordering puzzle | A referee's desk |

`orbit/` is the interactive space scene the project started from — a scene
rather than a game, linked from the footer.

## Adding a game to the board

One entry in the `GAMES` array in `arcade.js`:

```js
{
  title: 'Proof or Bluff',
  kicker: 'Quickfire quiz',
  href: 'proof-or-bluff/index.html',   // omit while it is still an idea
  blurb: 'A statement goes up. Real theorem, or plausible nonsense?'
}
```

With `href` the card gets a red pin and links out. Without one it renders
greyed, dashed and marked *In development*. The "n of m built" tally counts
itself.

---

## Reviewer № 2

Dread lands on your desk; click it before it piles up. **Dread** (yellow
notes, typed memos, manila envelopes) costs 8% stress if missed; **relief**
(green, rare) drops stress 12%; **Reviewer № 2** takes three hits and costs
20% if he escapes. Burnout at 100% ends the run.

The writing is three arrays at the top of `reviewer2/game.js`: `DREAD` (53
entries, roughly half generic academic misery and half specific to
mathematics), `RELIEF` (14) and `TAUNTS` (13). Keep individual words to about
12 characters — longer ones break mid-word inside the small notes.

## Counterexample

A conjecture on a blackboard with a grid of candidates below it. All but one
satisfy the claim; click the one that does not. Three errata end the run.

Sixteen conjectures in `TYPES`, in three tiers. Rounds 1–3 draw from tier 1,
4–7 from tiers 1–2, 8–12 from tiers 2–3, 13 onward from tier 3 only — a moving
window, so the easy ones drop away. The last two conjectures never repeat.

Numeric conjectures give a `pool` and a `test`, and the valid and invalid sets
are *derived* rather than typed out, so they cannot drift out of sync with the
claim. `badFilter` narrows the counterexamples to ones that do not give
themselves away. The abstract conjectures use hand-written lists.

## Tenure Track

Twelve semesters, seven hours each, across research, teaching, service and
rest. Meters decay 2.5 a semester; below 25 energy everything is 40% less
productive. One of 29 events fires each semester, most offering a choice. The
vote needs Research 60, Teaching 50 and Service 40 — all three.

All the numbers live in `CFG`. They were picked by simulation, not by feel —
2,000 runs per strategy:

| Strategy | Tenure | Two of three | Burnout |
|---|---|---|---|
| Plays adaptively, watches the meters | 66% | 20% | 0% |
| Fixed 2/2/2/1 every semester | 17% | 62% | 0% |
| Never rests | 0% | 0% | 100% |
| Rests three hours a semester | 0% | 8% | 0% |

**If you retune `CFG`, re-run that simulation** — small changes swing it hard.
One draft made tenure mathematically unreachable; another let a thoughtful
player win every time.

## Proof or Bluff

A statement appears; decide whether it is a theorem or a bluff before the
clock runs out. Three mistakes ends it, and being too slow counts as one.

Sixty statements in `CLAIMS` — 30 true, 30 false, each with a one-line
explanation shown after you answer. Several pairs differ by a single word
("every integral domain is a field" against "every *finite* integral domain is
a field"); those are the ones worth having.

## Blackboard Bingo

A 5×5 card of seminar phrases. The speaker says one every 3.2 seconds and it
stays markable for 4.6. Marking one restores attention, missing one on your
card costs 11, and attention drains anyway. At zero you fall asleep. Forty-four
phrases are called from a pool of 44, so plenty of them miss your card.

## Erdős Number

A co-authorship network drawn left to right. Walk from YOU to ERDŐS; each link
has a cost and your total is what counts. Par is the true shortest path
(Dijkstra) and matching it scores full marks. Eight networks, growing from 4 to
about 14 nodes.

Edges are strictly one-directional. Treating them as undirected let a player
walk backwards into a corner with no legal move — every node has an outgoing
edge by construction, so forward-only can never dead-end.

The surnames are invented. Nothing here is a claim about anybody real.

## The Gap

A proof has come apart. Put the lines back in order, and leave out the one that
does not belong. Getting it right first time is worth double; three bad
submissions ends it.

Eight proofs in `PROOFS`, each with its `steps`, its `gap`, and a `why`
explaining the bogus line. Several of the gaps are the mistakes people actually
make — "therefore N is itself prime" in Euclid's argument, and "the terms tend
to zero, so the series converges".

---

## Notes

- Asset links carry a `?v=` query. **Bump it when you edit a file**, or
  browsers will serve the old one.
- Game logic runs on timers, not `requestAnimationFrame` — rAF stops completely
  in a background tab, which would freeze one half of a game while the other
  half kept running.
- Games that can time out pause when the tab is hidden and compensate their
  clocks on return.
- Motion is reduced under `prefers-reduced-motion: reduce`.
- Audio only starts on a real click, as browsers require.
