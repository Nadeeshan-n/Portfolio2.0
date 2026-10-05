# Project images

Place the actual image assets here, then set the matching record's `image` field in `../projects.json`:

```json
"image": {
  "src": "/projects/images/ai-work-planner.webp",
  "alt": "AI Work Planner project screenshot"
}
```

Run `python3 scripts/build-projects.py` from the repository root and publish the resulting site version. A public HTTPS image URL is also supported. Assets are displayed without cropping or distortion; their original pixels are not modified.

`image: null` shows the empty image area. The Choose image, Change image and Reset controls have been removed. Previously selected browser-local previews remain visible on that device when available; the page only reads them and does not modify stored images. An image supplied through the source record is visible to all permitted site visitors.

## Detail-page previews

All five project detail pages use the same Preview section. Add one or more actual image assets to the matching project's `previewImages` array in `../projects.json`:

```json
"previewImages": [
  { "src": "/projects/images/planner-overview.webp", "alt": "AI Work Planner overview" },
  { "src": "/projects/images/planner-tasks.webp", "alt": "AI Work Planner task view" }
]
```

Regenerate with `python3 scripts/build-projects.py` and publish. An empty list leaves a neutral preview area; one image displays directly; multiple images show a swipeable slider with Previous/Next controls and a position indicator. Images retain their proportions without cropping. Keyboard Left/Right, Home and End work when the image strip is focused. There is no autoplay, and reduced motion makes navigation immediate. Without JavaScript, the image strip can still be scrolled. This is a published-image list, not a browser-local upload control. Every project already has a `previewImages` array ready for its own images.
