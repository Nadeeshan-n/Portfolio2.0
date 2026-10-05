# Technical Arsenal

Only the Technical Arsenal section has been redesigned. The selected visible
heading and supporting line were removed; the section retains an accessible
"Technical Arsenal" region label.

Exactly 12 technology pairs appear in this order: JavaScript, React, Python,
Docker, Git, Linux, C, Java, C#, SQL, HTML, CSS. Names sit beside the logos in
Sora 700 and jade. Logos use published vector assets, with immutable original
files, provenance, checksums and licenses retained in the source. Jade paint
changes preserve drawing geometry. Docker stays in its official ocean blue.
Java uses the official Duke mascot recommended by Oracle. C and SQL use
established published language icons; neither has a universal official logo.

The row has no individual cards, borders, caption labels or logo backgrounds
beyond the authentic marks' own shapes. Its item pitch is
clamp(208px,22vw,338px), giving about 4–5 items across desktop/tablet viewports
and fewer readable pairs on small phones. Logo sizes are 40–52px. The same
ivory background, existing section divider and section spacing are retained.

Two equal groups move from 0 to -50% over 56 seconds, linear and infinite.
No JavaScript, pointer, drag, click, wheel, hover, scale, rotation, vertical motion,
or hover-pause behavior is added. The duplicate group is hidden from assistive
technology and inert. Reduced motion shows one complete static, wrapping list
without the duplicate, so all technologies remain available without motion.

Regenerate from the checked-in originals:
python3 scripts/build-technical-arsenal.py

Assets: dist/assets/technologies/
Provenance: scripts/technology-logo-sources.json
Attribution: dist/assets/technologies/ATTRIBUTION.md

The second composition image was not available among the supplied files in this
request; the user's explicit scale and spacing brief guided composition.
Earlier automatic approval review blocked disclosure of the private portfolio
screenshot and concept to 12ui's external service, so this update uses local
source implementation. Browser QA and 12ui target comparison are unavailable
in this managed environment and must not be claimed as passed.

Validation passed: HTML outside this section is byte-identical to the previous
version; all 12 names are in the requested order; duplicate markup matches and
is inaccessible/inert; IDs are unique; all local asset and fragment links resolve;
published SVG paths and points are unchanged; Docker SVG bytes are unchanged;
no gradients, filters or animation are inside the logos; animation is CSS-only
with reduced-motion support and no pointer/hover controls. Logo and horizontal
layout snapshots were visually inspected. Start/end loop snapshots are
pixel-identical at 375, 842, 1195 and 1536px widths. The 12 SVGs total 29,789 bytes.
Git whitespace checks passed. These are source and SVG-layout checks, not a
browser-rendering claim.
