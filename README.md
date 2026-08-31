# Dennis Eriksson — personal page

Source for my academic homepage: publications, research students, and links.

**Live site:** https://denniseriksson-math.github.io/Dennis-Math/

## Editing the site

Almost everything you'd want to change lives in two places:

| What you want to change | File |
| --- | --- |
| Name, title, intro text, contact line, icon links | `_config.yml` |
| Publications | `_data/projects.yml` |
| Co-author names and their homepages | `_data/coauthors.yml` |
| PhD students | `_data/PhD.yml` |
| Master's students | `_data/MasterStudents.yml` |
| Bachelor projects | `_data/BachelorStudents.yml` |
| Teaching | `_data/teaching.yml` |
| Research interests | `_data/interests.yml` |
| CV shown in the CV tab | `_data/cv.yml` |

Page structure lives in `_layouts/resume.html`; styling in `_sass/`;
the tab and filter behaviour in `scripts/tabs.js`.

## How the page is laid out

Under the header there is one ruled bar: the section tabs on the left
(Publications / Collaborators / Students / CV) and the icon links on the right.
Inside Publications, a row of filter buttons narrows the list by status.

The tabs work the same at every width &mdash; one section at a time, on a phone
as on a laptop. What changes with the window is how much room the content gets:

| Window width | What happens |
| --- | --- |
| under 600px (phone) | one column; the tab row wraps to two lines on very narrow screens |
| 600&ndash;900px | column 683px |
| 900&ndash;1200px | column widens to 810px, collaborators in 2 columns |
| over 1200px | column widens to 920px, collaborators in 3 columns, students in 2 |

Prose blocks stop widening at 40rem so lines never get uncomfortably long, and
the publication list picks up a hanging indent once there is room for one.

Two things fold away independently:

- **Details** (button under your name) &mdash; job title, research keywords,
  department and contact line. Sits above the tab bar.
- **About me** (small control on the right, under the tab bar) &mdash; the
  introduction. Sits below the tab bar.

Clicking any tab closes both; each button brings its own back. Printing always
shows everything.

The bar has two halves, separated by a hairline, because they do different jobs:

- **left** &mdash; four tabs onto sections of this page: Publications,
  Students, Teaching, and the **CV** wordmark
- **right** &mdash; five links that lead away: the CV as a PDF, your Chalmers
  page, arXiv, Google Scholar, ORCID

So the two CV entries sit on opposite sides of the divider, which is the point:
the wordmark opens the CV here, the document icon hands over the file. It is open when someone arrives, closes itself the first time
they go to another section, and after that the button is in charge, so the page
never overrides a deliberate choice. Printing always shows the whole thing.

The About me text itself lives in `resume_header_intro` in `_config.yml`.

## The reading panel

When a background is running, the content sections sit on a translucent white
panel so the type never has to compete with what is drifting behind it. The
photo, name and tab bar stay on the open background &mdash; the panel begins
where the reading does. With no
background &mdash; either because the random roll came up empty, or because the
reader switched it off &mdash; there is nothing to lift the text away from, so
the panel does not appear at all. It is never printed.

## Colours

Two accents, both set in `_sass/_variables.scss`:

| | |
| --- | --- |
| `$accent` &nbsp;`#3f7d5a` | green &mdash; section headings, names, journals, tab and icon markers, favicon |
| `$ink` &nbsp;&nbsp;&nbsp;`#2b322d` | body text: a near-black with a faint green cast, not a flat grey |
| `$cv-accent` `#cc8437` | ochre &mdash; the CV tab only, sampled from `CV-webpage.pdf` |

Change `$accent` in that one file and every marker on the site follows.

The section tabs and the icon row deliberately share the same treatment: the
same padding, the same 2px marker underneath, in the same colour. The tabs show
it for the section you are in; the icons show it while you hover.

Names &mdash; co-authors, students, collaborators &mdash; and journal titles are
set in the green at normal weight with no underline. arXiv and DOI numbers stay
grey: they are reference numbers rather than names, and colouring those too would
leave the line almost entirely green.

The tab names come from `_layouts/resume.html`; the filter buttons count
themselves from the `status:` field in `_data/projects.yml`, so they stay
correct on their own.

Both are cosmetic only. Printing the page reveals every tab and every
publication regardless of what is on screen, and each section has its own
address: `.../Dennis-Math/#students` opens the Students tab directly, and
`#some-paper-id` opens Publications and jumps to that paper.

### Adding a student

Both student files take the same fields:

```yaml
- name: "Full Name"
  status_years: "Current"        # or "2024", "Completed 2021, Co-supervisor"
  thesis: "The title on its own"  # the page prints the word "Thesis" itself
  tentative: true                 # only while the title is provisional
  url: "https://..."              # leave the line out if there is no page
```

Do not write "Thesis title:" into the `thesis:` field &mdash; the page adds that
label, and styles it differently from the title so the two are easy to tell
apart.

A bachelor project is a group rather than one person, so
`_data/BachelorStudents.yml` uses `members:` (a list) instead of `name:`, and
`with:` for a co-supervisor. Everything else is the same.

### Adding a publication

Add a block at the top of `_data/projects.yml`:

```yaml
  - project: "Title of the paper"
    id: short-unique-id
    coauthor-list:
      - FreixasG        # must match a key in _data/coauthors.yml
    status: published   # submitted | accepted | published
    journal: "Journal name"
    volumenumber: 12
    issuenumber: 3
    pagestart: 1
    pageend: 40
    year: 2026
    arxiv: "2509.05077"      # the identifier only, not the full URL
    doi: "10.5802/jep.254"   # the identifier only, not the full URL
```

Leave out any field that doesn't apply. `arxiv:` and `doi:` are independent
&mdash; give one, both, or neither, and the page prints whichever are there
as separate links.

`status:` is what the filter buttons count, so a new preprint should say
`status: submitted` and be changed to `accepted`, then `published`, as it
moves along.

## Looking at it before you publish

Double-click **Preview Webpage**. It builds the site on this Mac and opens it in
your browser at `http://localhost:4001/Dennis-Math/`. Nothing is published and
nothing is sent anywhere. Close the Terminal window when you are finished.

The very first run installs the page builder and takes a few minutes; after that
it opens in a second or two. Re-run it after each edit to see the change.

## Teaching

`_data/teaching.yml` feeds two places at once: the **Teaching** tab, and the
Teaching section of the **CV** tab. Add an entry there and it appears in both, so
the two can never disagree.

Two fields shape the Teaching tab:

- `group:` &mdash; the subheading the entry appears under (Courses, Recognition,
  Examining, Pedagogical work, or anything new you invent)
- `highlight: true` &mdash; puts the entry in the boxed **This year** panel at the
  top. That is where the current year's courses go; change them each autumn and
  the box updates itself.
- `cv: false` &mdash; keeps an entry off the CV tab, for anything that belongs on
  the website but not in the printed CV.

Apart from those, the CV tab simply lists everything in file order.

Collaborators are no longer a tab. They are the last button in the Publications
filter row, since the list is simply everyone appearing in the publications
above it.

## The CV tab

`_data/cv.yml` is a transcription of `CV-webpage.pdf`, laid out the same way
(year in the left column, bold title, small grey note on the right) and using the
same ochre accent, sampled from the PDF itself.

**The two are not linked.** If you update the PDF, update `_data/cv.yml` as well
or the page and the download will disagree. The PDF is the authoritative one and
is linked at the top of the tab.

Publications and supervised students are deliberately *not* repeated in the CV
tab, since they have their own sections and would otherwise drift out of step.

## The background

`resume_background` in `_config.yml` controls what sits behind the page:

| value | |
| --- | --- |
| `random` | one of the below, chosen afresh on every visit &mdash; bubbles 40%, lattice 40%, nothing 20% |
| `bubbles` | soft translucent discs drifting slowly upward |
| `lattice` | a faint period lattice creeping diagonally |
| `none` | nothing, ever |

It is decorative only: hidden from screen readers, never printed, and frozen for
anyone whose system asks for reduced motion. A **Hide background** control in the
footer lets any reader switch it off, and that choice is remembered on their
machine.

## Accessibility

The section tabs are wired to their panels (`aria-controls` on each tab,
`role="tabpanel"` and `aria-labelledby` on each panel), so a screen reader
announces which tab opened what. The CV section is reached from the icon rather
than a tab, so it is a labelled region instead.

The publication filters are toggle buttons (`aria-pressed`), not tabs &mdash;
they narrow one list rather than swapping panels.

## A note on caching

The stylesheet, scripts and favicon are all requested with `?v=<build time>`
appended. GitHub Pages tells browsers to cache assets for ten minutes, which
means someone who visited just before you published could otherwise load the new
HTML with the *old* stylesheet &mdash; the page then appears unstyled, with plain
grey browser buttons. The version stamp changes on every build, so that pairing
can no longer happen.

If a page ever does look unstyled, a hard reload (Cmd+Shift+R) settles it.

## Publishing

Double-click **Update Webpage** to pull the latest version, and **Publish Webpage**
to push your changes live. GitHub rebuilds the site automatically; it usually
appears within a minute or two.

## Running it from a terminal instead (optional)

The **Preview Webpage** app above is the easy way. If you would rather do it by
hand, it keeps its own copy of Jekyll, pinned to the Ruby that ships with macOS:

```
GEM_HOME=~/.dennis-math-preview/gems \
PATH=~/.dennis-math-preview/gems/bin:$PATH \
JEKYLL_NO_BUNDLER_REQUIRE=true \
jekyll serve
```

`bundle exec jekyll serve` does *not* work here: the `github-pages` gem in the
Gemfile needs Ruby 3.x, and macOS ships 2.6.

## Credits

Built on the [resume-template](https://github.com/jglovier/resume-template) by
jglovier, MIT licensed. See `LICENSE`.
