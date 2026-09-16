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
| **Blackboard Bingo** | Bingo, with a call | The back row of a lecture hall |
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

A 5×5 card of seminar phrases. Marking one restores attention, missing one on
your card costs 11, and attention drains anyway. At zero you fall asleep.

The first version of this was purely reactive: the matching square lit up, and
lines scored themselves. There was nothing to decide. Three things carry the
decisions now.

**The square is not lit.** The phrase goes up on the screen and you find it on
your own card, or you do not.

**A line pays nothing until you call it.** `Call bingo` scores every completed
line you have not yet cashed, and *n* of them called together are worth
`500n + 400n(n−1)` — 500 for one, 1,800 for two, 3,900 for three. So holding on
is the whole game, against a talk that will end and an attention meter that
will not wait. Calling with nothing ready costs 200 points and 12 attention.
The button shows that *something* is ready, never how much: judging whether a
second line is close is what the card is for.

**Two ways out, once each way.** A question stops the speaker for six seconds
and returns 28 attention, but they now have two more slides to get through. A
coffee returns 50, and two slides happen while you are in the corridor — you
can hear them, and you cannot mark them.

**Three speakers, and the card is dealt first.** Each favours a slice of the
phrase pool, which goes into their running order twice over, and each sets
their own pace:

| Speaker | Slides | Every | Window | Favours |
|---|---|---|---|---|
| The Overrunner | 50 | 2.8s | 4.2s | 11 phrases about time and length |
| The Hand-Waver | 44 | 3.2s | 4.6s | 13 about things being obvious |
| The Historian | 38 | 3.9s | 5.4s | 9 about credit and provenance |

Because you see the card before you choose the room, the choice screen can tell
you how many of your squares are each speaker's habit — typically 5 to 7 out of
24, and worth choosing on. Adding a phrase to a `favours` list is the one thing
to be careful with: **the strings must match `PHRASES` exactly**, or the
speaker quietly loses a habit and nothing complains.

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

**Sixteen** proofs in `PROOFS`, each with its `steps`, its `gap`, and a `why`
explaining the bogus line. A run plays a random **eight** of them, so the pile
outlasts the run and no two games open the same way.

That draw matters more than it sounds. The first version played `PROOFS` in
source order from index 0, which meant every single game opened on √2 being
irrational and the other fifteen were reachable only by getting that one right.
The content was all there and almost none of it was ever seen. If you add
proofs, leave `S.order` alone.

They spread across number theory, analysis, algebra, set theory, logic and
combinatorics. Several of the gaps are the mistakes people actually make —
"therefore N is itself prime" in Euclid's argument, "the terms tend to zero, so
the series converges", and the digit-sum divisibility test applied to 7. Others
are true-sounding converses: differentiability giving a continuous derivative,
or the 4k+3 argument being claimed to work just as well for 4k+1.

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
