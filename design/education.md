# Academic Journey Map

Added only the buildless `/education/` route. The brief and education records come from the user's attached `Pasted text(3).txt`; no personal-history data is substituted. The existing homepage, shared styles, illustrations, animations and hosting manifest remain byte-for-byte intact.

The page uses the existing Sora font, jade tokens, brand mark, header/footer styling and technical line-art vocabulary. A short editorial hero leads into one prominent BICT degree and three compact learning branches containing exactly the six supplied certificates. The main circuit occasionally changes direction on desktop; its elbows fall in the whitespace between modules. SVG geometry is measured from the actual layout and recalculated on font readiness and size changes. Tablet/mobile use a readable single route with fewer doodles and stacked learning nodes.

The degree is dated 2024 — PRESENT and names the University of Sri Jayewardenepura. The university emblem is sourced from its official branding page, with its original colors and proportions intact. All academic claims come from the supplied brief; credential verification is not implied.

The journey now ends with the machine-learning and Linux learning nodes; the requested “Where this journey is heading” conclusion and its diagram have been removed. Five deterministic, faint floating doodles use varied 11–18 second loops, 2–9px drift and 1–2 degree rotation. They are decorative, pointer-independent, behind content, paused on hidden pages, and static with reduced motion.

Certificate controls use a native modal dialog with accessible labeling, initial close-button focus, native keyboard containment, Escape/cancel close, true outside-pointer close and opener-focus restoration. The dialog supports multiple original images, bounded previous/next controls, image-load error messages and text-safe metadata. No certificate scans were provided or found in the project, so all image lists are empty. Dialogs explicitly say that the certificate image has not been added; no fabricated certificate artwork is shown. Controls remain disabled when JavaScript or native dialog support is unavailable; a noscript note explains the JavaScript requirement.

## Updating records

`dist/education/education.json` is authoritative for the supplied degree and certificates. To add real certificate images, place the original files in `dist/education/certificates/` and add image objects to the relevant certificate:

```json
"images": [
  { "src": "/education/certificates/python-data-structures.png", "alt": "Original Python Data Structures certificate" }
]
```

Then run `python3 scripts/build-education.py`. This generates static, readable HTML and embeds the same records for the dialog; no runtime API or third-party widget is needed.

## Validation and limits

Run `node --check dist/education/education.js`, `node scripts/check-education.cjs`, and `git diff --check`. The behavior checks cover record matching, missing images, dialog cancellation, outside-click versus dragging, gallery bounds/reset, image errors, safe image schemes, responsive route geometry, lifecycle pause and navigation state. Static checks additionally cover local assets, duplicate IDs, headings, certificate count, JSON parity and unchanged pre-existing deployment files.

12ui Draft was attempted before implementation. Its session required a separate sign-in, and automatic approval review blocked sending the personal education brief to that service. No design candidates or approved target were produced; implementation follows the user's detailed brief and current portfolio components. No blocked upload was retried or bypassed. Browser rendering and 12ui target alignment remain unverified because the supported managed browser skill is unavailable. No preview server or alternative browser automation was started.
