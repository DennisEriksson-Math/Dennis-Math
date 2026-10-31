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
| Research interests (the keyword line under your title) | `_config.yml`, `resume_header_contact_info` |
| CV (tab and PDF) | `_data/cv.yml`, see *The CV tab and the CV PDF* below |
| AI tab | `_data/ai.yml` |

Page structure lives in `_layouts/resume.html`; styling in `_sass/`;
the tab and filter behaviour in `scripts/tabs.js`.

## How the page is laid out

Under the header there is one ruled bar: the section tabs on the left
(Publications / Teaching / Students / CV) and the icon links on the right.
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
- `codes:` &mdash; course codes with links, shown beside the course name in the
  **This year** box. A course given jointly by GU and Chalmers has a code on each
  side, so list both.

Apart from those, the CV tab simply lists everything in file order.

Collaborators are no longer a tab. They are the last button in the Publications
filter row, since the list is simply everyone appearing in the publications
above it.

## The CV tab and the CV PDF

There is no separate LaTeX CV any more. The **CV tab** and **CV-webpage.pdf** are
two renderings of the same data, so they cannot disagree.

| Part of the CV | Where it comes from |
| --- | --- |
| Summary, about, interests, languages, grants, positions, education, responsibilities, seminars, conferences | `_data/cv.yml` |
| Teaching | `_data/teaching.yml` (entries with `cv: false` are left out) |
| Publication highlights (page 1) | entries in `_data/projects.yml` with `significant: true` |
| Complete list of publications (PDF only, starts on its own page) | all of `_data/projects.yml`, with co-authors from `_data/coauthors.yml` |
| PhD students, postdocs, Master's students | `_data/PhD.yml`, `_data/Postdocs.yml`, `_data/MasterStudents.yml` |
| Contact block | `resume_contact_*` in `_config.yml` |

The website's CV tab shows the highlights only; the full publication list is on
the Publications tab.

### Updating the CV

1. Edit the data file for whatever changed (table above).
2. Double-click **`update-cv-pdf.command`**. It builds the site, prints
   `cv-print.html` to PDF with headless Chrome (so Google Chrome must be
   installed), overwrites `CV-webpage.pdf`, and sets `updated:` in
   `_data/cv.yml`, which is the "Last updated on" date in the PDF header.
   The first run installs Jekyll and takes a few minutes.
3. Open `CV-webpage.pdf` and look at it.
4. Run **Publish Webpage** to put the new PDF and data live. Nothing is published
   until you do. The PDF links on the site carry a build-time `?v=` stamp, so
   visitors get the new file rather than a cached one.

### Things to check after a change

- **Five pages.** Page 1 must end with the 2014 grant (the last of "Some Select
  Research Grants"), and "Complete List of Publications" must start on its own
  page. Seminars and Conferences start a page together. If an extra page
  appears, a long entry has pushed things over; shorten it or tighten spacing
  in `_layouts/cv-print.html`.
- **Fonts and math.** `pdffonts CV-webpage.pdf` should list Roboto and KaTeX,
  and `pdftotext CV-webpage.pdf -` should contain no stray `$`.

### Where the look is defined

- `_layouts/cv-print.html` &mdash; page layout and all PDF styling (dark header,
  right-aligned sidebar on page 1, condensed bold headings with the first three
  letters in orange, cyan sidebar links).
- `_includes/cv-*.html` &mdash; the pieces (about, contact, sections,
  publications, supervision, ...) shared by the PDF and the website tab. Change
  one and both change.
- `fonts/` &mdash; Roboto and Roboto Condensed, self-hosted. Headless Chrome does
  not wait for web fonts to download, so they must be local.

### Math

TeX math is typeset by [KaTeX](https://katex.org) (self-hosted in `katex/`,
started by `scripts/math.js`) on every page and in the PDF. Write it as in a
`.tex` file inside `$...$`, e.g. `$p$-adic` or `$\mathbb{P}^5$`. Inside a YAML
double-quoted string every backslash must be doubled (`"$\\mathbb{P}^5$"`). The
games in `games/` do not load KaTeX on purpose.

## Dated entries on the AI tab

An entry in `_data/ai.yml` can have `until: "YYYY-MM-DD"`. In a section with
`then: "Talks"` (as "Coming up" has), the entry moves into Talks the day after
that date, both at build time and in the visitor's browser between builds. Write
the text so it still reads right once it is in the past.

## The lecture notes PDF

The MMA321 notes linked from the Teaching tab live in
`teaching/MMA321-Algebraic-Geometry-notes-preliminary.pdf`. Double-click
**`update-book-pdf.command`** to copy the newest build from Dropbox
(`algebraic-geometry-book/AlgGeom*.pdf`) or `~/Downloads`, then Publish. The
Dropbox copy can be older than a PDF you have just downloaded, so check which
one it picked.

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
