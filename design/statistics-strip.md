# Statistics strip

This compact region is inserted directly after About and before Technical
Arsenal. Existing About, hero, Arsenal and footer markup, styles, artwork and
interactions are preserved. The only requested header change removes the
About navigation link; the About section remains intact.

One #0E8F78 jade surface uses a 1px #17211E border and square corners at every
breakpoint. A narrow
left intro reads BUILDING & LEARNING, without a supporting paragraph. Its
white Sora 700 heading scales from 24px to 32px with a 1.2 line-height and
balanced wrapping; the entire intro remains vertically centered in the panel.
Three equally spaced counters occupy the wider right area with thin vertical
separators in translucent white. Sora 700 white figures sit above Sora 500
white labels. Small
screens put the intro above a compact three-column counter row. There are no
individual cards, buttons, shadows or gradients. The existing grid, spacing,
counter type sizes, proportions and lifecycle remain unchanged.
The enlarged intro heading uses #FFFFFF.

The original SVG tile is 240×180px with only a few circuit traces, dots, an
intersection, small braces, a terminal mark and sparse white cross-hatching at
4.5–9% opacity. Five tiny separate white SVG motifs — braces, connected
nodes, code slashes, a terminal and a chip — stay in the empty top/bottom
margins behind content at 35–40% opacity. Their independent 10–16 second CSS
cycles move at most 2px horizontally and 4px vertically. Mobile sizes and
edge positions keep them clear of the heading and three counter groups. Two tiny
angular border-echo marks and two small white hatch strokes near opposite corners add
a restrained sketch accent; the outer border remains regular.

Fine-pointer hover moves the figure up 1.5px. A tiny white hand-drawn underline
appears in the existing space below it, and the local paper texture gains at
most 3.6 percentage points of opacity. Movement and accent transitions take
240ms. All text remains white in normal, hover and pressed states. No role,
tab stop, click handler, pointer cursor or button semantics are added to these
non-actionable statistics. Reduced motion removes the new movement and
transitions while retaining the immediate accent states.

## Data and animation

Projects is the length of the records in dist/projects/projects.json;
Certificates is the length of the records in dist/education/education.json.
These are the same lists used to build the corresponding pages, currently
5 projects and 6 certificates. Certificate scans are not counted separately.
The older illustrative concepts in portfolio.json are excluded. Experience
keeps its supplied value and lower-bound presentation; no duration is asserted.

python3 scripts/build-statistics.py derives both exact counts, updates the
portfolio.json totals and regenerates static/no-JS markup. Projects and
Certificates retain the two-digit format but omit the plus suffix and “or more”
assistive text because these are exact totals. At runtime statistics.js reads
the two same-origin page JSON files independently; Experience still comes from
portfolio.json. Invalid or failed data requests keep only that metric's generated
fallback, allowing other valid sources to update. No external request or library
is needed. The visible figures start at zero after setup,
then count up over 1450ms when at least a quarter of the strip is visible.
The observer disconnects at first activation; scrolling never restarts it.

Assistive technology receives the final values with their labels, without
per-frame announcements. No JavaScript, unavailable IntersectionObserver,
reduced motion on load or a mid-animation switch to reduced motion all show
final values. Returning from reduced motion never restarts the animation.
Decorative SVGs are inaccessible and never capture pointer interaction.

## Verification and design availability

The requested wide-container reference screenshot was not present in the active
attachments; the written layout and established portfolio visual system guide
this bounded addition. An isolated generic 12ui design study was attempted
without private Site screenshots or personal totals. It stopped before candidate
generation because the CLI requires session reconnection. No paid candidates
were generated and no private page was sent. 12ui target comparison and browser
rendering remain unverified; the managed environment has no supported browser
QA skill. No preview server or alternative browser is started.

Validation covers counter lifecycle, one-time activation, dynamic data, failure
fallback, reduced-motion transitions, static/no-JS final values, narrow layout
bounds, unchanged existing sections, asset links, IDs and source whitespace.
These checks passed. Actual Sora glyph measurements fit the counter labels at
320–1536px widths. The explicitly requested white-on-jade pairing is 4.02:1:
it exceeds the 3:1 target for large figures but remains below the 4.5:1 AA
target for small regular text. Earlier source-derived static layout previews
at 1195px and 375px were visually inspected; these were not browser screenshots
or animation verification. Browser rendering of the current palette is unverified.

The earlier text refinement removes only the annotated supporting paragraph from the page
and its generator, enlarges the statistics heading, and removes the paragraph's
unused CSS. All other page markup, totals, artwork and JavaScript remain
byte-identical. Source checks compare the unchanged grid, spacing and counter
type declarations at every breakpoint and verify heading bounds with the real
Sora font, generator stability, square corners, palette and reduced-motion rules.
Interactive hover/pressed appearance remains unverified in a browser.

The page-derived counter update passed checks for current totals (5 projects,
6 certificates), exact visible/assistive values, updated collection sizes,
independent request failures, invalid data and zero values. Source checks
confirmed that Experience, all other homepage sections, statistics CSS and
the Projects/Education page records remain unchanged.
