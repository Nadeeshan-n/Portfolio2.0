# Nadeeshan portfolio

The current page contains the hero, About section, a compact Statistics strip, Technical Arsenal section, Contact section, and footer. The earlier hero eyebrow, hero metadata strip, secondary GitHub button, Skills, Featured Projects, and Learning/Contact block were removed. Contact has now been restored independently after Technical Arsenal; the other sections stay intact. About retains its exact heading and two body paragraphs; the Learning focus / Exploring summary remains removed. Its balanced two-column layout places the existing transparent developer/workstation sketch on the left and left-aligned text on the right, with the ABOUT label above both. Four faint floating SVG doodles remain behind the artwork. On mobile the order is label, illustration, then text; reduced motion remains supported. The Statistics strip sits directly below About, with a larger responsive BUILDING & LEARNING heading and no supporting sentence. It derives exact Projects and Certificates counts from their page data (currently 5 / 6), while preserving the supplied Experience value of 1, a faint white SVG texture, a square #0E8F78 surface with a #17211E border and white text, and counters that run once on viewport entry. The remaining hero CTA reads Connect and scrolls to the Contact section on the same page using a native #contact link, with the existing smooth-scroll and reduced-motion behavior. Navigation contains Home, Education and Projects, linking to the separate /education/ and /projects/ pages; the requested About link was removed while the About section remains intact; footer links point to Home and GitHub.

The transparent illustrations are in `dist/assets/sketches/` as optimized WebP files. Original PNGs are in `design/sketches/`. The small complementary icons and accents are editable SVGs. `dist/sketches.css` only controls the earlier decorative elements; the new About rules are scoped at the end of `dist/portfolio.css`. `design/illustration-prompts.md` records the artwork direction and complete prompts used with built-in image generation. `design/about-refinement.md` documents the latest About-only integration and verification limits.

The original hero image is unchanged. An inline SVG mask exposes its exact pixels from a completely empty area, using progressive stroke-dash drawing and small flat-fill wipes. The primary network node draws first (0.15–1.95s), then its console connection (2–3s), then the console contour and details (3.05–5s). The established system builds outward with parallel component outlines, details and accents (5.1–8.1s), followed by the remaining original connections (8.1–9.82s). Construction ends at 9.9s; after a 0.8s pause, two sparse jade particles follow the existing diagram arrows on 10.4s and 11.2s cycles.

Construction runs once per page load and never restarts on hover. Fine-pointer attraction is enabled only after completion, with a 52px radius and maximum 1–2.2px shifts; it returns smoothly and never triggers redraws. Occasional eye blinks, the 3.8s code cursor, tiny database activity and data-arrival responses remain secondary to the text. Offscreen/hidden-page motion pauses without clearing partially built artwork. Reduced motion, unsupported APIs and disabled JavaScript show the complete static original. Returning from reduced motion does not restart the build. There are no animation libraries or new image assets.

Technical Arsenal sits directly after About. It contains exactly 12 sourced technology logo/name pairs in a horizontal strip, with Sora 700 names beside crisp vector marks. The selected visible heading and caption are removed. Jade adaptations retain original contours and proportions; Docker keeps its approved blue and Java uses the official Duke mascot. C and SQL use established published language icons. Two equal groups move left over a 56-second linear infinite loop; no cursor, hover, dragging, click or wheel behavior is added. Reduced motion shows a complete static wrapping list with no duplicate. Published originals and checksums are retained in design/technology-logos/original/ and scripts/technology-logo-sources.json; scripts/build-technical-arsenal.py regenerates the SVGs and section without network access. Credits and licenses are in dist/assets/technologies/ATTRIBUTION.md. Static source, asset and loop-seam checks are documented in design/technical-arsenal.md. Browser rendering remains unverified. Automatic approval review previously blocked sending the private portfolio screenshot to 12ui, so this update was implemented locally.

The original artwork and SVG construction snapshots were visually inspected. Animation checks passed for an empty first frame, node/console dependency order, progressive drawing, delayed data particles, one-time construction, bounded cursor attraction at three illustration widths, reduced motion, and lifecycle pause/resume. Non-animation HTML, artwork bytes and layout/type/color styles were confirmed unchanged. Responsive browser rendering and 12ui target comparison remain unverified. 12ui's session requires reconnection, and no supported managed browser skill is available. The requested doodle reference was not attached in the active turn, so the written illustration brief guided this update.

A light, responsive personal portfolio designed through 12ui. The approved design images are retained in `design/`.

## Content

The name and role are supplied by the user. The GitHub profile comes from the repository URL shared in the conversation. `dist/portfolio.json` retains the earlier illustrative project and contact configuration for reference. Project and certificate counters count the records used by `dist/projects/projects.json` and `dist/education/education.json`; the earlier illustrative concepts are excluded. `python3 scripts/build-statistics.py` derives the static/no-JS counters and updates the cached totals in portfolio.json. The browser reads each page data source independently and keeps the generated count if that request fails. Both counters show exact totals without a plus suffix. The Experience figure remains the value supplied in the statistics brief. No experience duration or invented certificates are asserted. The removed project/contact dialogs and their handlers are no longer active.

## Design

Sora is self-hosted with its font license in `dist/assets/fonts/`. The signature jade is `#0E8F78`. The site retains its ivory background, charcoal typography, flat square sketch-style controls, thin borders, and reduced-motion support.

## Contact

Contact uses a two-column introduction and lightly textured form that blends into the ivory page background with no visible outer border, stacking on mobile. Its stylesheet is scoped to `#contact`; shared styles and all existing sections are unchanged. A small inline SVG paper plane follows the actual drawn flight path once on viewport entry: 400ms pause, 3.8s flight, 550ms settling hold, and 650ms backwards path erasure. Motion pauses offscreen or while the page is hidden. Reduced motion omits the flight and freezes the background marks. `design/contact.md` records the implementation and QA limits.

Message delivery is intentionally unconfigured: `dist/contact.json` contains `email: null` and `endpoint: null`. The send control matches the other jade sketch-style buttons, with no icon, and remains natively disabled until a destination is configured. The delivery note and Contact introduction's GitHub link are removed; the existing hero/footer links remain. Set `email` to the portfolio owner's real address to enable an encoded email draft that the visitor reviews and sends in their email app. Alternatively, set `endpoint` to a public HTTPS service accepting JSON fields `firstName`, `lastName`, `email`, and `message`. It must support the site's origin for CORS and return an accepted 2xx response; a JSON `ok: false`, `success: false`, or `error` value is treated as failure. Endpoint mode takes precedence if both settings exist. No private service credentials belong in this public JSON file. No sample address is used or guessed, and creating an email draft does not claim delivery.

First name, email, and message are required; last name is optional. Field errors are associated with their labels and inputs, focus goes to the first invalid field, and submission results are announced. Failed submissions keep the visitor's message. Pending submissions disable duplicate delivery. Lifecycle checks use mocked requests and never send real messages:

```sh
node --check dist/contact.js
node scripts/check-contact.cjs
```

## Hosting

The separate `/projects/` page adds a restrained two-column collection and five individual detail routes, without changing the existing homepage or Education page. All five cards use the page background, square corners, configurable image areas and standard-size View Project buttons without arrows. Image editing controls have been removed; existing browser-local previews remain visible, and real published assets can be supplied through the image field in projects.json. The Projects index and all five detail pages display without entrance fades, movement or delays; faint decorative hero marks retain reduced-motion support. Cards have no hover effects, and only explicit links navigate. The new page uses the existing brand, Sora font, navigation and button styles. Projects is included in the Home and Education navigation as well as its own active page header; existing page content and styling remain intact.

`dist/projects/projects.json` is the editable source for all five entries. Four GitHub repository links and their core descriptions/technologies come from the owner's published GitHub project data. AI Work Planner and unavailable personal learning notes use concise placeholders; unavailable demo links are omitted. No planned RAG or agent features are attributed to the current Web Assistant. Content sources, motion behavior and QA limitations are documented in `design/projects.md`; current card styling, image configuration and preview behavior are in `design/project-card-refinement.md`.

All five project detail pages use Preview in place of their How it works diagrams. Each project's `previewImages` array accepts one or more root-relative or HTTPS image URLs with alt text. One image displays directly; multiple images enable a responsive slider with Previous/Next controls, keyboard navigation, native swipe scrolling and a position indicator. Navigation is manual and respects reduced motion. No preview images were supplied, so the initial arrays are empty. Configuration is documented in `dist/projects/images/README.md`; all other detail-page sections, the Projects index, Home and Education are unchanged.

Every project detail page includes a GitHub button at the bottom, after What I learned. Buttons inherit the standard Sora 13px/500, 46px-minimum-height square sketch-button style. Each uses the project's configured repository URL when available. AI Work Planner has no repository URL configured, so its button links to the existing GitHub profile from `dist/portfolio.json`; its accessible label identifies the profile destination. Setting the project's `github` field and rebuilding switches that button to the repository. All destinations and project facts are preserved.

```sh
python3 scripts/build-projects.py
node --check dist/projects/projects.js
node --check dist/projects/projects-images.js
node --check dist/projects/project-preview.js
```

The separate `/education/` route presents the supplied BICT degree and six certificates as an Academic Journey Map. It adds a responsive circuit path, restrained floating SVG annotations and accessible certificate dialogs. The “Where this journey is heading” conclusion has been removed. The homepage and shared files are unchanged. Certificate scans are not supplied; dialogs currently show the supplied metadata and state that the original image has not been added. `dist/education/education.json` holds these records and supports multiple images per certificate. Regenerate its static HTML with `python3 scripts/build-education.py`; details and asset credits are in `design/education.md` and `dist/education/assets/ATTRIBUTION.md`.

```sh
node --check dist/education/education.js
node scripts/check-education.cjs
```

This is a buildless static site. `.openai/hosting.json` points to `dist`. Use the Sites source workflow to package and deploy the same pushed source commit. Preserve the Site identity and audience.

For local use, no package installation or build step is needed:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000` in your browser.

## Validation

JavaScript syntax, local asset and font references, fragment links, duplicate IDs, required section counts, and placeholder configuration passed static checks. Browser rendering and 12ui target alignment were not verified: 12ui's browser inventory failed because Chromium is unavailable, and the managed environment has no supported browser QA skill. Desktop and mobile behavior should be visually reviewed before changing the audience to public.
