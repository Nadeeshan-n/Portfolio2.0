# Project card refinement

## Image controls removed

The latest owner request removes every Choose image, Change image and Reset button from all five cards, together with their hidden file inputs and editing status messages. Image areas, configured images, View Project links, card content and page styling remain unchanged. Existing browser-local previews are restored read-only so previously selected images remain visible on that device. No stored previews are deleted or overwritten. Unused control styles and editing handlers are removed. The generator preserves this change on future builds.

## Earlier image-area refinement

The following records the previous implementation; its image editing controls have since been removed as described above.

Applied the owner's three annotation requests to all five project cards: the surface now matches the page's #F7F9F7, corners are square, the card illustrations are removed, and View Project uses the existing Sora 13px/500, 46px-high square sketch button with no arrow. The two-column grid, project data, titles, descriptions, stacks, navigation, destinations and detail-page architecture illustrations are preserved. The five detail pages' HTML, Home and Education remain byte-for-byte unchanged.

Each card now contains an image area and a functional native image chooser. Browser-supported image files are decoded before display, preserving the previous valid image when a new file is invalid. Images use object-fit: contain without cropping, stretching, filters or new motion. Choose/change and reset controls use the existing secondary button system. The viewport remains responsive and there are no pointer-following, drag, tilt, zoom or card-hover effects.

## Image storage

The page remains buildless/static. The on-page chooser is explicitly a local preview tool: it stores the original file as a Blob in IndexedDB on that device and says “Saved in this browser.” It performs no network upload and does not claim to update the hosted portfolio for other visitors. Storage-unavailable/quota failures still permit a current-visit preview and use truthful status text. Reset restores the configured published image and removes the preview. Per-card request sequencing prevents slow, superseded image decodes or storage restores from replacing a newer selection; writes/resets are ordered, and replaced object URLs are released. Back/forward-cache pages retain live URLs.

Every project record now supports `image: null` or `{ "src": "/projects/images/example.webp", "alt": "Actual screenshot description" }`. Local root-relative paths and public HTTPS image URLs are accepted, with no embedded credentials or script schemes. Put real project assets in `dist/projects/images/`, set their image fields and regenerate with `python3 scripts/build-projects.py` to publish them for all permitted visitors. No screenshots were provided as project content in this turn; annotation screenshots were used only to inspect the requested treatment.

The image-picker script is loaded only on the Projects index. Existing detail routes keep their markup and scripts. With JavaScript disabled or unavailable object-URL/image APIs, configured project images still display and unconfigured areas show a simple placeholder. Interactive image controls stay hidden until functional JavaScript is available. Native file dialogs, labeled buttons and live status messages provide keyboard/accessibility behavior.

## Verification limits

Run the build, JavaScript syntax, route/content/scope and upload behavior checks before publication. Compare the 85-file checkpoint to confirm that only the Projects index, its CSS and image fields change among previously deployed files. Native browser preview is unavailable in this managed environment; no preview server or alternative browser automation is started. Annotation crops were inspected directly. No private images or project data were sent to 12ui; its previously blocked/private-data upload was not retried. Existing components supply the requested button and surface styling.

Checks passed for all five cards: image picker markup, no card SVGs, exact project copy/routes, square page-colored surfaces, arrow-free buttons and unchanged detail/Home/Education files. Only the three expected pre-existing deployment files differ from the checkpoint. Mocked DOM/image/storage behavior checks passed for chooser activation, validated previews, invalid-file preservation, replacement URL cleanup, reload restoration, reset, unavailable/quota-limited storage, overlapping selections, startup-restore races, resets during pending saves, new published assets, separate project keys and back/forward-cache handling. Syntax and whitespace checks passed. These are code-level checks; native image decoding, IndexedDB and rendered layout were not exercised in a browser.
