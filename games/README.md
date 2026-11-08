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
faculty-meeting/   index.html  game.css  game.js  sfx.js
job-market/        index.html  game.css  game.js  sfx.js
grant-roulette/    index.html  game.css  game.js  sfx.js
hallway-escape/    index.html  game.css  game.js  sfx.js
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
| **Conference Bingo** | Bingo, with a call | The back row of a conference room |
| **Erdős Number** | Weighted shortest path | Ink on a legal pad |
| **The Gap** | Ordering puzzle | A referee's desk |
| **Should I Ask a Question?** | Resisting temptation | A faculty meeting |
| **Love at First Cite** | Swipe | A hiring committee's phone |
| **Grant Roulette** | Word tiles, reading the signs | A funding panel's lobby |
| **Hallway Escape** | Three-lane runner into the screen | The corridor to the coffee machine |

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

## Conference Bingo

(The folder is still `blackboard-bingo/`, so existing links keep working.)

A 5×5 card of conference phrases. Marking one restores attention, missing one on
your card costs 8, and attention drains anyway. At zero you fall asleep.

The first version of this was purely reactive: the matching square lit up, and
lines scored themselves. There was nothing to decide. Three things carry the
decisions now.

**The square is not lit.** The phrase goes up on the screen and you find it on
your own card, or you do not. A phrase stays up until the next one arrives, and
if it was on your card and you have not marked it by then, that is a miss. (An
older version let phrases be replaced before the miss was counted, so missing
never cost anything. It does now.) Slides that go by while you are fetching
coffee cost nothing.

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

**Four sessions, and the card is dealt first.** Each speaker favours a slice of
the 58-phrase pool and sets their own pace (the time between phrases is also how
long you have to find the square). A card holds fewer than half the pool, so
`buildOrder()` makes sure most of what is on your card does get said (a speaker's
own habits almost always, anything else about four times in five), the speaker's
habits come round twice, and the rest is filler:

| Speaker | Slides | Every | Favours |
|---|---|---|---|
| The Overrunner | 50 | 3.9s | 11 phrases about time and length |
| The Hand-Waver | 44 | 4.5s | 13 about things being obvious |
| The Historian | 38 | 5.4s | 11 about credit, provenance and keynotes |
| The Session Chair | 42 | 4.8s | 11 about housekeeping and interruptions |

Because you see the card before you choose the room, the choice screen can tell
you how many of your squares are each speaker's habit, and worth choosing on.
Adding a phrase to a `favours` list is the one thing to be careful with:
**the strings must match `PHRASES` exactly**, or the speaker quietly loses a
habit and nothing complains. The four-way choice screen drops its prose on short
phones and goes two by two sideways.

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

## Should I Ask a Question?

A briefing note describes a faculty-meeting situation and the thought you were
about to share. Your hand rises on its own (a bar fills); **Stay seated** is the
correct answer in every scenario, and the game never says otherwise. Asking, or
letting the bar fill, costs a patience dot and shows a consequence. Ten items
survived ends the meeting; three questions ends it earlier. Score is
person-minutes saved: the people in the room × 10, times the streak multiplier.

All the writing is in lists at the top of `faculty-meeting/game.js`, and each
list is independent, so a new line is one more string in an array:

- `WHO`, `TOPIC`, `QUESTION`: plain strings.
- `WHEN`: `{ h, m, s, no }`. `h` and `m` set the wall clock, `s` is the line
  shown, `no` is the reply when you stay seated at that time.
- `ROOM`: `{ n, s }`. `n` is the head-count that drives the score.
- `CIRC`: `{ s, no }`. An extra circumstance and its own reply. These get more
  frequent as the meeting goes on.
- `NO_GENERIC` and `YES`: replies. `{m}` in a `YES` line becomes the overrun in
  minutes.
- `HAND_UP`: the openings when the hand rises by itself.

Variety comes from three things. Every list is drawn from a shuffled bag with
`draw()`, so nothing repeats until the whole list has been used, even across
meetings. About half of the people, rooms, agenda items and questions are
**assembled from parts** instead of taken whole: `WHO` + `WHO_TAIL`, a weekday
in front of a `WHEN`, `SIZES` + `WHERE` + `ROOM_TROUBLE`, `TOPIC_FORM` +
`TOPIC_THING` (a form with a `#` for the thing), and `Q_OPEN` + `Q_CORE`. And the
curated lists are big (roughly 80 to 125 entries each). Composed text is capped
in length (see `makeWho()`, `makeRoom()`, `makeQuestion()`), so the card still
fits a phone. When adding parts, keep each one grammatical beside every other.

The flowchart on the end screens is `flowchart()` in the same file.

## Love at First Cite

The player picks a field and a position, and the search draws the rest: whether
research, teaching or both matters, and the committee's quirks. There is **no
clock**. The committee has six hours of interviews to fill, six slots of an hour, and the
player swipes right to shortlist a candidate who meets every criterion and left
to pass. Drag the card, use the buttons, or press ← / →.

- A right call scores 100.
- A wrong call is a **strike**: shortlisting someone who does not fit (who still
  takes a slot), or passing on someone who does. Three strikes cancel the search.
- The day is full when six slots are used. Every strike left is worth 500.
- The committee adds its quirks one at a time, after 3, 5 and 7 cards, with a
  note under the card saying what the new pill means ("New: MUST HAVE. Shortlist
  only someone who answers email.") and the pill highlighted. A card is always
  judged against the pills showing when it was dealt.

`SLOTS`, `STRIKES`, `RIGHT`, `BONUS` and `REVEAL` at the top of the state section
in `job-market/game.js` set the numbers.

Candidates are generated, not written out. About 40% are built to meet every
criterion; the rest fail one or (a quarter of the time) two. A failing card is
`QUIRK_WEIGHT` (3) times as likely to fail on a quirk as on a basic criterion,
because the quirks are the hard part to see. Without that weight, ignoring them
and judging only field, years, papers and courses won about two days in three;
now it wins about one in three. Counts are kept believable (a candidate's papers,
courses and h-index follow from the years since the PhD, and the h-index never
exceeds the paper count): check that with a few thousand generated cards after
changing `makeCandidate()`. **Only the pills at the top count.** Three of them (the quirks) are about what the candidate is like,
and the card never states them: it hints, in its own funnier words, so the player
has to read.

- **Must have**: a trait the card has to hint at. For "answers email" the card might
  say "Inbox zero since 2014."
- **Reject if**: a trait it must not hint at. For "replies all": "Once emailed
  the whole faculty about a lost umbrella."
- **We offer**: something the candidate's "Looking for:" line has to be after, in
  whichever of its wordings.

The bios, the status line and the little grey chips are decoration. A fresh
priority, must, dealbreaker and offer are drawn for each new search; "Same search
again" keeps them.

Everything written is a list at the top of `job-market/game.js`. `MUST` and `DEAL`
hold traits as `{ id, label, opp, lines }`: `label` is the pill, `lines` are
the different ways a card can hint at it, and `opp` names a trait that cannot sit
beside it (so a card never contradicts itself). `OFFERS` works the same way, with
`lines` as the "Looking for:" wordings. Add a line to a trait and it is in play
at once. Keep the lines of different traits clearly apart, so a card is never
ambiguous. The other lists are `FIELDS` (14, each with its own bios and
interests), `BIO`, `NEUTRAL`, `STATUS`, `FIRST` and `LAST`. The rules live in
`POSITIONS` (years since the PhD, and the minimum papers and courses),
`makeCandidate()` and `misses()`. Candidates are fictional and are described only
by their application, never by anything personal.

## Grant Roulette

Six funding calls from one panel. In each you build a sentence out of five
buzzwords (`We will [verb] [adjective] [noun] through [method] to deliver
[outcome].`), five tiles on offer per slot, and the panel scores it. Fund
at least 55 points and the score is the money.

The puzzle is in what the panel wants. At the start of a run it draws three
tags from eight (climate, digital, health, inclusion, industry, security,
openness, the international side): two it likes (14 and 9 points a word) and one
it is tired of (−14). Nothing says which. You have three clues:

1. **The call.** Two hints per round, written in the panel's own oblique
   language (`TAGS[...].want` and `.tired`: five lines each), rotating through
   what they like and what they are tired of (`HINTS`).
2. **Last time's winners.** Two made-up titles, built from words the panel likes.
3. **The reviewers.** Three lines after every submission, each one true and none
   the whole picture (`reviews()`).

Words are tagged by the cell they sit in (`WORDS[slot][tag]`, six or more per cell). A good
share of them are mathematics. Pure-mathematics words (`non-commutative`, `derived`, `motivic`,
`perfectoid`, `categorify`, `spectral sequences`, `a derived equivalence`...) are plain hot air,
the best kind: nobody on a panel can say what they mean, and they earn credit as neutral words.
Applied ones sit under the theme they would be sold as: `Bayesian inference` and `epidemic models`
under health, `convex optimisation` and `graph algorithms` under digital, `lattice-based` and
`zero-knowledge proofs` under security, `Lean formalisation` under openness, `global analysis` and
`global sections` under the international side (a pun), `fair division` under inclusion, `linear
programming` under industry, `numerical analysis` under the climate. And `a lemma, possibly two`,
`a counterexample` and `an eigenvalue bound` are, naturally, too specific to be funded.
`neutral` words are plain hot air and earn a little (+3). `specific` words
(`prove`, `a randomised trial`, `lemmas`) are mistakes (−14): anything that could be
checked cannot be funded. Every hand is built to contain a word the panel likes in each
slot, so there is always a way to please them, usually a way to annoy them, and a
trap or two.

Variation is part of the scoring: more than two words of one tag costs −12 each,
leaning on the same emphasis as the previous call costs −8, a word already used in
this run counts for nothing (and costs −5), and two neighbouring words that start
with the same letter earn +6. A simulation (calls funded out of 6: random picks 0.7, merely avoiding the traps 1.9,
leaning on one theme every time 1, informed play 6) is how the constants were
chosen; change them and run it again.

Ends: two texts for each of 0, 1–2, 3–4 and 5–6 funded; the verdict screen reveals
what the panel actually wanted. Phones: the call card, sentence and tiles shrink with the
usual `fit()`; sideways the call sits on the left and the writing on the right, and
the result sheets go two columns.

## Hallway Escape

A runner, drawn entirely with rectangles and polygons on a 320×240 canvas (scaled to the
screen and the device's pixel ratio). You run *into* the screen down a corridor that gets
faster. The view is a plain perspective projection: `pj(x, y, z)` puts a point on the screen,
the corridor is a strip of quads (`drawCorridor`), and everything else is a billboard scaled by
its distance, sorted far to near with the runner among them.

How it is made to look and feel good: the physics runs at a fixed 60 Hz, but the picture is carried
on a fraction of a step past the last one (`render(acc)`), so scrolling is smooth at 60, 90 or
120 Hz. Lane changes are a stiff spring rather than a constant slide, and the camera follows a
little late on its own spring, rolls into the turn, rises with a jump and widens with speed.
The corridor is lit: additive glows for the ceiling lights and their reflections, light from
the windows falling across the floor, doors that swing out on a hinge with a warm room behind
them. People are drawn with rounded, shaded limbs and a walk cycle (a talker gestures and
moves their mouth), and are reflected faintly in the polished floor. The runner stretches in
a jump, squashes on landing and crouches in a slide. A vignette, speed lines, a colour wash per
floor and particles (dust, sparkles on coins, a burst on a hit) finish it. All of it is plain
canvas 2D; a busy frame takes under a millisecond on a desktop.

Three lanes. The whole screen is the control, as in the runners people already know (Subway
Surfers, Temple Run): **swipe sideways** to change lane, **swipe up** to jump, **swipe down** to slide
(pressed in the air, it drops you fast and slides on landing), or simply **tap the left or right half**
of the screen to move that way. A swipe is one discrete move (it needs only 18 pixels, and a long drag
chains several), every finger is tracked separately so two thumbs work, and moves are queued so two in a
frame both count. A few seconds of hints are drawn over the first floor until you have tried all four
(and never again, once you have). On a keyboard: arrows or WASD, and a click or tap works like a tap.
Earlier there were four on-screen buttons; they were hard to find with a thumb and are gone. The
picture also takes the shape of the screen now, so a tall phone gets a tall corridor.

Doors along both walls; as you get close one cracks open (`OPEN_T`) with a dark silhouette in the
gap, and somebody steps out, **with a speech bubble**, towards your lane:

| Who | What they do | Get past by |
|---|---|---|
| Colleague (quick question) | steps out into the lane you are in, and stands | another lane |
| Student | follows you sideways until the last moment | another lane, late |
| The Dean | takes two lanes | the third lane |
| Lost visitor | walks slowly across the whole corridor | timing, or the lane they have left |
| Administrator | steps out carrying a stack of forms and heads for your lane | change lane |
| Nobody | the door opens on an empty room | nothing |
| Oncoming | not from a door at all: a colleague, student, administrator or visitor walking towards you down the corridor, bubble up from far away (students steer into your lane) | another lane |

Between doors: people chatting in two lanes, boxes, trolleys and cables (jump, or another lane),
tall stacks (another lane), hanging lamps (slide under them), holes in the floor (jump),
emails flying at you (high ones slide, low ones jump) and wet floors, which speed you up. A hit
costs patience, makes you stumble and resets your dodge streak; three hits sends you back to the
middle of the floor. Every dodge scores `25 × (1 + streak ÷ 4)`, up to ×4. Coffee restores
patience; headphones make people unable to reach you for six seconds.

Three floors, each a strip of patterns (`PATTERNS`: one door, a door then a lamp, a fake door
then a real one, a gauntlet...) laid along the corridor by `buildLevel`. `LEVELS` sets the
distance, the speed (`v0` → `v1`) and `warn0` → `warn1`, the seconds between a door cracking and
you reaching it. Each door's warning is jittered by ±14% so the rhythm cannot be learned, and the
Dean and the administrator get a quarter-second more, since they take lanes or a slide.

The pace is deliberately gentle, so there is time to read what people say: the floors run at
70–140 units a second, a speech bubble is up from far away until they are past, and two people
talking at once get separate bubbles. Each kind of person has some forty things to say
(`PEOPLE[...].lines`: the old list plus `MORE`), from "Do you have a stapler?" to "I have a tiny
favour. It has an appendix." Everybody is drawn fresh each time (`variant()`: skin, hair, hair
style, sometimes a skirt), with a tapering body, two-part arms, a shaded face, outlines and a
walk cycle; the runner has wild white hair, elbow patches and a steaming mug. Windows throw
shafts of light, there are benches, hanging signs, fire alarms, pipes in the basement, dust in
the light and a touch of film grain (there used to be floating dust specks, but they looked like stray balls, so they are gone). The things you slide under are lamps on cords, so the
space below the shade stays clear and you can see what is ahead.

The difficulty was set with a bot rather than by feel. It takes a reaction time, sees what is
coming from the moment a person steps out, and changes lane, jumps or slides with a bit of timing
noise. With a 0.25 s reaction it takes about 1, 0.4 and 1.9 hits on the three floors; at
0.32 s, 1.7, 1.4 and 4.9; at 0.40 s, 2.3, 6.4 and 16.5, with a few restarts from the checkpoint
on the last floor. (The runs are noisy, and the middle floor can come out easier than the first.)
These numbers were measured before the game was slowed down (speeds about 20% lower, warnings about 0.3 s longer, a bit more space between obstacles) and before oncoming people were added, so it is now easier than that; re-run the bot before trusting them. Phone touch lag is
roughly 0.05–0.1 s on top of a human reaction. Run it again if you change `LEVELS`, `PATTERNS`
or the jump constants. The one thing a new pattern is most likely to break is time to react
and move: every pattern has to leave a way through.

Earlier versions of this game were a free-roaming platformer, and then a side-on auto-runner.
The platformer was too easy because you could stop and think; the side-on view had no room
to dodge sideways, so people could only be jumped over. Running into the screen fixes both.

## Phones

The newer games (`faculty-meeting/`, `job-market/`, `grant-roulette/`, `hallway-escape/`,
and the Conference Bingo chooser) have to show the whole card and the buttons on a
phone, whatever the screen:

- Short screens drop decoration (Love at First Cite hides the grey chips under 720px of
  height).
- Turned sideways (landscape, under 520px high) the page becomes two columns:
  controls on the left, the card on the right.
- As a last resort `fit()` in each `game.js` scales the content down (CSS
  `zoom`, set as `--z` on `.stage`, never below 0.5) until it fits. It only ever
  shrinks during a round, so the layout does not jump between cards.

When you add text, check the worst case: the longest strings from every list at
once, on a 320×568 and a 375×667 phone, upright and sideways.

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
