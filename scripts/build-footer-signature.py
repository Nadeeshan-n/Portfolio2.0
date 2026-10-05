#!/usr/bin/env python3
"""Trace the supplied signature silhouette; the pen guides never replace its ink."""
from pathlib import Path
import hashlib
import json
import re

import contourpy
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / 'design/nadeeshan-signature-reference.png'
OUT = ROOT / 'dist/assets/signature/nadeeshan-signature.svg'
VIEWBOX = '26 24 526 194'

# Guides expose the traced silhouette in handwriting order. Values are milliseconds.
GUIDES = [
    ('n', 'n-entry', 0, 220, 14, 'M34 159 L32 154 C26 143 65 115 103 96 C136 81 164 73 172 77 C186 79 154 129 103 193'),
    ('n', 'n-rise', 220, 400, 14, 'M103 193 C154 132 232 52 266 31 Q275 25 268 38'),
    ('n', 'n-downstroke', 400, 600, 14, 'M270 30 C257 56 236 92 219 124 C202 157 179 205 183 217'),
    ('name', 'a-first', 600, 650, 10, 'M229 147 L230 142 Q226 144 230 137 Q242 122 246 128 Q233 142 229 141'),
    ('name', 'a-first-exit', 650, 695, 10, 'M245 127 Q240 141 246 137 Q258 136 272 124'),
    ('name', 'd-loop', 695, 800, 12, 'M262 142 C266 130 276 119 282 125 C292 111 302 89 305 81 C309 72 295 97 285 114 C274 129 268 140 260 144'),
    ('name', 'd-downstroke', 800, 875, 10, 'M286 112 C278 130 279 142 284 147 Q287 151 292 148'),
    ('name', 'e-first', 875, 980, 10, 'M294 137 C299 129 307 116 307 121 C307 126 296 134 295 134 C291 135 294 142 300 140 C310 138 322 129 324 126'),
    ('name', 'e-second', 980, 1085, 12, 'M318 135 C322 128 334 114 331 119 C330 125 321 130 320 130 C315 135 318 141 325 137 Q336 132 348 120'),
    ('name', 's', 1085, 1200, 10, 'M347 117 C354 109 352 117 348 118 C340 122 349 128 349 134 C348 141 337 148 339 140 C341 136 355 126 364 118'),
    ('name', 'h-rise', 1200, 1290, 10, 'M355 140 C368 112 390 73 400 65 C408 60 398 82 386 94 C376 108 369 113 366 118'),
    ('name', 'h-body', 1290, 1370, 10, 'M355 140 C370 128 376 117 380 117 C383 115 379 130 385 130 C394 130 402 122 407 119'),
    ('name', 'a-last', 1370, 1405, 16, 'M399 135 C396 138 402 133 413 117 C416 110 415 115 415 119 C410 127 402 133 399 133'),
    ('name', 'a-last-exit', 1405, 1430, 12, 'M415 116 C410 124 410 131 416 129 Q424 125 431 115'),
    ('name', 'n-last', 1430, 1500, 10, 'M422 135 L434 112 L428 129 C433 123 443 112 443 119 C442 128 447 132 451 131'),
    ('flourish', 'flourish', 1500, 2100, 10, 'M444 130 C466 133 483 124 501 121 C525 115 543 115 550 126'),
    ('underline', 'underline', 2100, 2600, 16, 'M222 181 C266 164 331 145 371 146 Q406 143 438 145'),
]


def simplify(points, tolerance=0.10):
    """RDP with <=0.10 source-pixel error (<=0.04px at the footer size)."""
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    delta = b - a
    length = np.linalg.norm(delta)
    if length < 1e-10:
        distances = np.linalg.norm(points - a, axis=1)
    else:
        distances = np.abs(delta[0] * (a[1] - points[:, 1]) - (a[0] - points[:, 0]) * delta[1]) / length
    index = int(np.argmax(distances))
    if distances[index] <= tolerance:
        return np.array([a, b])
    return np.vstack((simplify(points[:index + 1], tolerance)[:-1], simplify(points[index:], tolerance)))


def outline(field):
    paths = contourpy.contour_generator(z=field).lines(0.5)
    result = []
    for points in paths:
        if len(points) < 4:
            continue
        points = simplify(points) + 0.5  # Raster samples are at pixel centres.
        result.append('M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in points) + ' Z')
    return ' '.join(result)


def guide_length(path):
    """Measure the original pen guides in SVG units, with a small hiding margin."""
    tokens = re.findall(r'[A-Za-z]|-?(?:\d+(?:\.\d*)?|\.\d+)', path)
    cursor = np.zeros(2)
    length = 0.0
    index = 0
    while index < len(tokens):
        command = tokens[index]
        count = {'M': 2, 'L': 2, 'Q': 4, 'C': 6}[command]
        values = np.asarray([float(v) for v in tokens[index + 1:index + 1 + count]]).reshape(-1, 2)
        index += count + 1
        if command == 'M':
            cursor = values[0]
            continue
        t = np.linspace(0, 1, 129)[:, None]
        if command == 'L':
            samples = (1 - t) * cursor + t * values[0]
        elif command == 'Q':
            samples = (1 - t) ** 2 * cursor + 2 * (1 - t) * t * values[0] + t ** 2 * values[1]
        else:
            samples = ((1 - t) ** 3 * cursor + 3 * (1 - t) ** 2 * t * values[0] +
                       3 * (1 - t) * t ** 2 * values[1] + t ** 3 * values[2])
        length += np.linalg.norm(np.diff(samples, axis=0), axis=1).sum()
        cursor = values[-1]
    return np.ceil((length + 0.5) * 100) / 100


def main():
    rgb = np.asarray(Image.open(REFERENCE).convert('RGB'), dtype=float)
    average = rgb.mean(axis=2)
    labels, count = ndimage.label(average < 170)
    components = []
    for index, region in enumerate(ndimage.find_objects(labels), 1):
        if region is None:
            continue
        pixels = rgb[labels == index]
        if len(pixels) < 100:
            continue
        components.append((index, region, pixels.mean(axis=0)))
    n_id = next(i for i, region, _ in components if region[0].stop - region[0].start > 150)
    underline_id = next(i for i, _, color in components if color[1] - color[0] > 30)
    n_region = ndimage.binary_dilation(labels == n_id, iterations=2)
    underline_region = ndimage.binary_dilation(labels == underline_id, iterations=2)
    name_region = ndimage.binary_dilation((labels != 0) & (labels != n_id) & (labels != underline_id), iterations=2)
    # Remove the white canvas with an antialias-aware trace, not a new handwriting asset.
    alpha_ink = np.clip((255 - average) / (255 - 18), 0, 1)
    underline_color = np.array([11., 77., 70.])
    direction = 255 - underline_color
    alpha_underline = np.clip(((255 - rgb) * direction).sum(axis=2) / np.dot(direction, direction), 0, 1)
    x = np.arange(rgb.shape[1])[None, :]
    fields = {
        'n': np.where(n_region, alpha_ink, 0),
        'name': np.where(name_region & (x < 449), alpha_ink, 0),
        'flourish': np.where(name_region & (x >= 448), alpha_ink, 0),
        'underline': np.where(underline_region, alpha_underline, 0),
    }
    lines = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEWBOX}" width="180" height="66.39" class="footer-signature" aria-hidden="true" focusable="false">',
             '  <!-- Exact raster silhouette traced to SVG; pen guides only reveal it. -->', '  <defs>']
    for part in fields:
        lines.append(f'    <mask id="nadeeshan-signature-{part}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="20" y="18" width="542" height="210" style="mask-type:luminance">')
        for group, name, start, end, width, path in GUIDES:
            if group == part:
                length = guide_length(path)
                lines.append(f'      <path class="signature-reveal" data-signature-stroke="{name}" data-start="{start}" data-end="{end}" data-length="{length:.2f}" style="--signature-length:{length:.2f}" d="{path}" fill="none" stroke="#fff" stroke-width="{width}" stroke-linecap="butt" stroke-linejoin="round" stroke-dasharray="{length:.2f} {length:.2f}" stroke-dashoffset="0"/>')
        lines.append('    </mask>')
    lines.append('  </defs>')
    for part, field in fields.items():
        color = '#0E8F78' if part == 'underline' else '#17211E'
        cls = 'signature-outline signature-underline' if part == 'underline' else 'signature-outline'
        lines.append(f'  <path class="{cls}" data-signature-part="{part}" d="{outline(field)}" fill="{color}" fill-rule="evenodd" stroke="none" mask="url(#nadeeshan-signature-{part})"/>')
    lines.append('</svg>')
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text('\n'.join(lines) + '\n')
    provenance = {'reference': str(REFERENCE.relative_to(ROOT)), 'sha256': hashlib.sha256(REFERENCE.read_bytes()).hexdigest(),
                  'source_size': list(rgb.shape[1::-1]), 'viewBox': VIEWBOX, 'trace_max_error_source_pixels': 0.10,
                  'writing_ms': 2600, 'hold_ms': 5000, 'erase_ms': 450, 'reset_ms': 100,
                  'strokes': [{'part': group, 'name': name, 'start_ms': start, 'end_ms': end} for group, name, start, end, _, _ in GUIDES]}
    (ROOT / 'design/signature-trace.json').write_text(json.dumps(provenance, indent=2) + '\n')
    print(f'{OUT.relative_to(ROOT)}: {len(GUIDES)} reveal strokes, four original-ink outlines')


if __name__ == '__main__':
    main()
