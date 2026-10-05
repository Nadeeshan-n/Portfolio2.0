# Separate Projects pages

Current card refinement: all five cards now match the page background, have square corners, use image areas instead of card illustrations, and inherit the existing 13px View Project button without an arrow. Choose image, Change image and Reset controls are removed; existing browser previews are read-only. Browser previews and published image fields are documented in `project-card-refinement.md`. The initial card/CTA treatment and its validation below describe the first version. Current detail-page Preview and button behavior is described below.

Preview follow-up: all five project detail pages now replace their How it works diagrams and captions with the same Preview component. Every project has a `previewImages` array supporting a direct single image or a manual multi-image slider. Configuring an empty list leaves a neutral image area; no actual preview files were supplied. All other detail-page sections, project facts, GitHub buttons, Projects index, Home and Education remain unchanged. Image setup is documented in `../dist/projects/images/README.md`.

All-project propagation checks confirm Preview on every detail route, single/multiple-image rendering for each project, and exact preservation outside the selected section and gallery script include. AI Work Planner, Projects index, Home, Education and shared gallery assets are byte-for-byte unchanged. Only the other four detail-page Preview sections, their image-list configuration and setup documentation are updated.

Preview validation passed for empty, single and multiple image lists; image escaping and invalid URL rejection; previous/next wrapping, keyboard navigation, native-scroll position synchronization, resizing, reduced-motion navigation, failed-image fallback and an older-browser scroll fallback. Checks also confirmed exact preservation of the selected page outside the Preview section and script include, all other page HTML and every existing project data field. These were code-level checks. Managed browser preview is unavailable because the required control-browser skill is not present, so rendered behavior remains unverified. 12ui requires sign-in in this session; the update reuses the existing layout, Sora typography and square sketch-button components without a new design generation.

Navigation follow-up: the owner subsequently requested adding this page to the navigation bar. The Home and Education headers now include a Projects link to `/projects/`, with the Education generator updated to preserve it. The same existing navigation styling and mobile Menu behavior apply; section content, page styles, illustrations and all project routes remain unchanged.

GitHub follow-up: all five project detail pages include a GitHub button at the bottom, after What I learned. The larger detail-button override is removed so they inherit the standard 13px/500, 46px-minimum-height flat square primary-button treatment. The four supplied repository links are unchanged. AI Work Planner still has `github: null`; its button links to the configured owner profile instead of asserting an unknown repository. The accessible label says GitHub profile and announces the new tab. No project data, card, navigation, Preview behavior or other page content is changed.

The user's `Pasted text(4).txt` supplies the page structure, palette, motion constraints and five project names. New deployed files live entirely under `dist/projects/`; the homepage, Education route, shared styles, existing illustrations, contact configuration and hosting identity are preserved byte-for-byte.

The index uses the existing Sora font, navigation styling, brand mark, flat square sketch buttons and footer. Its compact introduction leads directly into a two-column grid, becoming one column at 760px. Five original inline SVG illustrations are drawn with flat paper/pale-jade fills, charcoal outlines and jade technical details. They represent planning, structured assistant output, connected MCP tools, vehicle management and face recognition. These are explanatory sketches, not application screenshots or representations of measured results. Cards have no hover/pointer effects, listeners, linked surfaces, previews, popups, filters or categories. Only the explicit View Project links navigate to details.

New routes:

- `/projects/`
- `/projects/ai-work-planner/`
- `/projects/ai-web-assistant/`
- `/projects/personal-task-mcp-server/`
- `/projects/drive-smart/`
- `/projects/person-identifier/`

The new route headers add an active Projects item using the same navigation component. Existing pages' headers are unchanged, as required by the brief. Project data is authored once in `dist/projects/projects.json`; `python3 scripts/build-projects.py` regenerates the six static HTML pages. All titles, copy, stacks and links are escaped. Public repository/demo URLs must use HTTPS and contain no embedded credentials. The static pages remain readable and all routes/links work without JavaScript. On mobile without JavaScript, navigation stays visible; with JavaScript, the existing Menu control supports Escape, focus return, link selection and breakpoint changes.

## Content provenance

Read-only public GitHub API requests retrieved the portfolio owner's project data and READMEs on 2026-10-04. No credentials were supplied and no repository code was executed. Sources are also recorded per project in the JSON.

| Project | Published source | Treatment |
| --- | --- | --- |
| AI Work Planner | Name in the user's brief; no record found in the current portfolio data or public repository list | Explicit overview, technology, feature and learning placeholders. Its planning sketch is labeled illustrative; no architecture or repository link is asserted. |
| AI-powered Web Assistant | [Repository README](https://github.com/Nadeeshan-n/AI-powered-Web-Assistant-/blob/main/README.md) | Flask, LangChain, Gemini and Pydantic structured output. Clearly work in progress. Planned RAG, memory, agents and multiple-model support are not presented as completed features. |
| Personal Task MCP Server | [Repository README](https://github.com/Nadeeshan-n/Personal-Task-MCP-Server/blob/main/README.md), [owner's portfolio data](https://github.com/Nadeeshan-n/My_Portfolio/blob/main/src/data/data.js) | Python MCP task tools, resources, prompts, Gemini/Google ADK clients, stdio and local JSON data. Learning reflection is a concise paraphrase of the owner's published learning notes. |
| Drive Smart 2.0 | [Repository README](https://github.com/Nadeeshan-n/Drive-Smart-2.0-/blob/main/README.md), [owner's portfolio data](https://github.com/Nadeeshan-n/My_Portfolio/blob/main/src/data/data.js) | Windows C#/.NET 8/WPF application with SQLite/EF Core, employee roles, rental modules and reports. No browser demo is implied. |
| Person Identifier | [Owner's repository description](https://github.com/Nadeeshan-n/Person-Identifier) | Python, OpenCV, embeddings and KNN. The short README contains only the title, so no extra model, datasets, IoT hardware or recognition accuracy is claimed. |

Only the four established GitHub repository buttons are shown. No live demo URL was available for these entries. Personal learning notes for three of these four projects are left as clear, editable placeholders rather than invented first-person reflections. No fabricated project counts, results or statistics are added. The older illustrative concepts in `dist/portfolio.json` are unchanged and are not republished as actual projects.

## Motion and accessibility

The Projects index and all five detail routes render their content without entrance fades, vertical movement or staggered delays. The head activation script, data-enter/delay attributes, arrival keyframes and cleanup timer are removed from both the generator and deployed pages. Three faint hero marks and small illustration details use independent 11–16 second CSS loops with only 2–4px drift. Sparse 2.2px dots move 38 SVG units along established connection segments on 12-second cycles. Motion has no cursor dependency. Hidden pages pause the ongoing sketch loops. Reduced motion immediately shows static content, disables decorative drift/flow animations and hides the decorative data dots. No animation libraries, GIFs, video or runtime project-data fetches are used.

CTA labels use bold 19px Sora so white text on the required primary jade meets the large-text contrast threshold while keeping the existing flat border/sketch treatment. Buttons have native link semantics and clear inherited focus rings. Project illustrations are decorative and excluded from accessibility APIs. Architecture diagrams have visible text equivalents, and mobile diagrams reflow into two rows without requiring horizontal scrolling. There is one main heading per page, ordered section headings, explicit current navigation, a skip link and a real back link. Unavailable links are omitted rather than presented as disabled/fake destinations.

## Validation and limitations

Validate with `python3 scripts/build-projects.py`, `node --check dist/projects/projects.js`, the route/content/asset checks, and `git diff --check`. Compare the SHA-256 checkpoint of all 76 pre-existing deployed files to verify the scope. Keep the site identity and its current private audience unchanged when publishing.

Checks passed for all six routes, five exact supplied project titles, four repository URLs, omitted demos, local assets, fragment targets, unique IDs, single main headings and 15 well-formed inline SVGs. All 76 pre-existing deployed files match their checkpoint hashes. JavaScript behavior checks passed for menu state, Escape focus return, link selection, breakpoint focus safety, hidden-page pause, entrance cleanup and unsupported-media fallback. Syntax and whitespace checks passed. These checks do not substitute for visual browser QA.

12ui's authentication status was checked without sending the brief, project data or screenshots; the service requires sign-in. A previous automatic approval review rejected sending personal portfolio material to 12ui, and that upload was not retried or bypassed. No 12ui candidates or approved target were produced for this task. Implementation follows the supplied brief and established portfolio components. Browser rendering and target comparison remain unverified because the supported managed browser skill is unavailable. No preview server or alternative browser automation was started.
