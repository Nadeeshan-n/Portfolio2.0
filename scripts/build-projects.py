#!/usr/bin/env python3
"""Generate the separate, buildless Projects routes from the editable project records."""
from html import escape
from pathlib import Path
from footer_signature import apply_footer_signature
import json
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "projects"
DATA = json.loads((OUT / "projects.json").read_text())
PROJECTS = DATA["projects"]
GITHUB_PROFILE = json.loads((ROOT / 'dist' / 'portfolio.json').read_text()).get('github')


def e(value):
    return escape(str(value), quote=True)


def stack(items):
    if not items:
        return '<p class="stack-placeholder">Technologies to be added.</p>'
    return '<ul class="technology-list" aria-label="Technology stack">' + ''.join(
        f'<li>{e(item)}</li>' for item in items
    ) + '</ul>'


def head(title, description, image_picker=False, preview_gallery=False):
    picker_script = '\n  <script src="/projects/projects-images.js" defer></script>' if image_picker else ''
    preview_script = '\n  <script src="/projects/project-preview.js" defer></script>' if preview_gallery else ''
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)} — Nadeeshan</title>
  <meta name="description" content="{e(description)}">
  <meta name="theme-color" content="#F7F9F7">
  <link rel="preload" href="/assets/fonts/sora-latin-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/portfolio.css">
  <link rel="stylesheet" href="/projects/projects.css">
  <script src="/scroll-progress.js" defer></script>
  <script src="/projects/projects.js" defer></script>{picker_script}{preview_script}
</head>
<body class="projects-page">
  <a class="skip-link" href="#projects-main">Skip to content</a>
  <header class="site-header">
    <a href="/" aria-label="Nadeeshan Nadeera, home" class="brand"><span>Nadeeshan Nadeera</span></a>
    <nav id="projects-navigation" aria-label="Main navigation" class="nav-links">
      <a class="nav-link" href="/">Home</a>
      <a class="nav-link" href="/education/">Education</a>
      <a class="nav-link" href="/projects/" aria-current="page">Projects</a>
      <a class="nav-link" href="/contact/">Contact</a>
    </nav>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="projects-navigation" aria-label="Open navigation menu" hidden>Menu</button>
  </header>'''


FOOT = f'''
  <footer class="site-footer">
    <a href="/" aria-label="Nadeeshan Nadeera, home" class="brand"><span>Nadeeshan Nadeera</span></a>
    <p>© <span class="projects-year">{e(DATA["updated"][:4])}</span> Nadeeshan</p>
    <nav aria-label="Footer navigation" class="footer-links"><a href="/">Home</a><a href="https://github.com/Nadeeshan-n" target="_blank" rel="noopener noreferrer">GitHub</a></nav>
  </footer>
</body>
</html>
'''

SKETCHES = {
    "planner": '''
      <path class="fill-paper" d="m157 58 178-.7 1.2 138-181 1Z"/>
      <path d="m156 91 179-.4M174 75h7m7 0h7m7 0h7"/>
      <path class="ink-jade" d="m180 119 4 4 8-9m-12 35 4 4 8-9"/>
      <path d="m207 119 101 .5m-101 9h69m-70 21 101-.3m-100 10 53 .4"/>
      <path d="M155 134h-37l-.5-36H97m238 34h44v32h20"/>
      <circle cx="84" cy="98" r="12" class="fill-pale"/><circle cx="411" cy="164" r="10" class="fill-paper"/>
      <path class="ink-jade" d="m79 98 4 4 6-8m316 70 11-.2"/>
      <g class="sketch-float sketch-detail"><path class="ink-jade" d="m362 62-7 8 7 8m20-16 7 8-7 8m-13 4 5-23"/></g>
      <path class="sketch-detail" d="m138 197-4 5m13-6-4 6m13-6-4 6M313 214h17m7-.5h6"/>
    ''',
    "assistant": '''
      <path class="fill-paper" d="m52 84 138-1 1 97-138 1Z"/>
      <path d="M52 106h137m-124-12h4m6 0h4m6 0h4"/>
      <path class="ink-jade" d="m76 126 9 8-9 8m21-1 22 .4"/>
      <path d="m74 157 81-.4m-81 9h48"/>
      <path class="ink-jade" d="M191 134h37m-6-5 6 5-6 5M300 134h39m-7-5 7 5-7 5"/>
      <path class="fill-paper" d="m237 100 62-.3 1 64-63 .5Z"/>
      <path d="m249 100 .2-9m17 9v-9m17 9v-9m-35 74v9m17-9v9m17-9v9m-47-63h-9m9 18h-9m9 18h-9m73-36h9m-9 18h9m-9 18h9"/>
      <path class="ink-jade" d="M253 124h29m-29 10h23m-23 10h16"/>
      <path class="fill-paper" d="m344 92 77-.5.7 72-47 .5-12 12 .3-12-19-.5Z"/>
      <path d="m358 111 46 .2m-46 11h36m-36 11h28m-28 11h41"/>
      <circle class="signal-dot" cx="192" cy="134" r="2.2"/>
      <g class="sketch-float sketch-detail"><path class="ink-jade" d="M193 58h20v15h-20Zm6 5 3 3-3 3m8 0h3"/></g>
      <path class="sketch-detail" d="m313 191 5-5m3 7 5-5M67 201h17m7 0h5"/>
    ''',
    "mcp": '''
      <path class="fill-paper" d="m177 73 132-.5 1 87-132 .8Z"/>
      <path d="m177 97 132-.4m-115-12h5m6 0h5m6 0h5"/>
      <text x="242" y="130" text-anchor="middle">MCP</text>
      <path class="ink-jade" d="M93 120h84m-7-5 7 5-7 5M310 120h69m-7-5 7 5-7 5M243 162v25m-5-6 5 6 5-6"/>
      <circle cx="74" cy="120" r="19" class="fill-paper"/>
      <path class="ink-jade" d="M65 120h18m-9-9v18"/>
      <path class="fill-paper" d="m384 101 42-.5.5 38-43 .6Z"/>
      <path d="M395 112h21m-21 8h15m-15 8h18"/>
      <path class="fill-paper" d="M218 194c0-12 51-12 51 0v24c0 12-51 12-51 0Z"/>
      <path class="ink-jade" d="M218 194c0 12 51 12 51 0m-51 12c0 12 51 12 51 0"/>
      <circle class="signal-dot" cx="119" cy="120" r="2.2"/>
      <g class="sketch-float sketch-detail"><circle cx="361" cy="65" r="4"/><circle cx="391" cy="55" r="4"/><circle cx="401" cy="77" r="4"/><path class="ink-jade" d="m365 64 22-8m-20 10 30 10m-5-17 7 14"/></g>
      <path class="sketch-detail" d="m100 179-4 5m13-5-4 5m13-5-4 5"/>
    ''',
    "drive": '''
      <path class="fill-paper" d="m50 130 10-23h66l11 24v36H48Z"/>
      <path class="ink-jade" d="m59 130 8-16h52l9 16Zm-10 21 88-.5"/>
      <path d="M55 166v13h14v-13m45 0v13h14v-13m-68-26h10m43 0h10"/>
      <path class="fill-paper" d="m208 80 125-.8 1 101-126 .7Z"/>
      <path d="M208 104h126m-114-13h4m6 0h4m6 0h4m15 90v15m-24 0h47"/>
      <path class="ink-jade" d="m223 121 7 7 10-13m-17 34 7 7 10-13"/>
      <path d="M254 123h61m-61 8h37m-37 21h61m-61 8h45"/>
      <path class="ink-jade" d="M139 144h68m-7-5 7 5-7 5M335 137h39m-7-5 7 5-7 5"/>
      <path class="fill-paper" d="M379 110c0-16 57-16 57 0v61c0 16-57 16-57 0Z"/>
      <path class="ink-jade" d="M379 110c0 16 57 16 57 0m-57 20c0 16 57 16 57 0m-57 20c0 16 57 16 57 0"/>
      <g class="sketch-float sketch-detail"><path class="ink-jade" d="M163 64h24v19h-24Zm6 13 3-5 4 3 5-7"/></g>
      <path class="sketch-detail" d="M83 202h22m6 0h5m246-11-4 5m13-5-4 5"/>
    ''',
    "identifier": '''
      <path d="M58 90V75h16m65 0h16v16m0 61v15h-17m-64 0H58v-15"/>
      <path class="fill-paper" d="M82 112c-2-36 49-37 49-.5 0 26-11 39-24 39s-25-14-25-38.5Z"/>
      <path d="M86 97c11 6 28 3 40-4m-34 20h5m20 0h5m-16 3-2 11h7m-12 12c5 3 11 3 16 0"/>
      <path class="ink-jade" d="m96 113 11 12 13-12m-24 0 11 24 13-24"/>
      <circle cx="96" cy="113" r="2" class="fill-jade"/><circle cx="120" cy="113" r="2" class="fill-jade"/><circle cx="107" cy="137" r="2" class="fill-jade"/>
      <path class="ink-jade" d="M157 122h37m-7-5 7 5-7 5M286 122h63m-7-5 7 5-7 5"/>
      <path class="fill-paper" d="m202 81 81-.5.5 84-82 .6Z"/>
      <circle cx="222" cy="103" r="4"/><circle cx="263" cy="109" r="4"/><circle cx="244" cy="126" r="4"/><circle cx="222" cy="147" r="4"/><circle cx="264" cy="149" r="4"/>
      <path class="ink-jade" d="m226 105 15 18m-15 21 15-15m6-5 13-13m-13 18 14 17"/>
      <path class="fill-paper" d="m356 94 70-.3.6 57-72 .7Z"/>
      <path class="ink-jade" d="m371 118 9 9 20-23"/>
      <path d="M369 140h43"/>
      <circle class="signal-dot" cx="292" cy="122" r="2.2"/>
      <g class="sketch-float sketch-detail"><path class="ink-jade" d="m295 63-5 7 5 7m24-14 5 7-5 7m-18 4 9-22"/></g>
      <path class="sketch-detail" d="m164 181-4 5m13-5-4 5M365 192h19m7 0h5"/>
    ''',
}


def illustration(project):
    return f'<svg class="work-sketch" viewBox="0 0 480 252" aria-hidden="true" focusable="false">{SKETCHES[project["visual"]]}</svg>'


BACKGROUND = '''<svg class="projects-background" viewBox="0 0 244 210" aria-hidden="true" focusable="false">
  <g class="sketch-float"><path d="m184 32-6 7 6 7m22-14 6 7-6 7m-15 4 7-22"/></g>
  <g class="sketch-float background-chip" style="animation-delay:-11s"><path d="m200 157 24-.2.2 25-24 .2Zm-4 6h4m-4 13h4m24-13h4m-4 13h4m-18-19v-4m12 4v-4m-12 29v4m12-4v4m-16-19h8v9h-8Z"/></g>
  <g class="sketch-float" style="animation-duration:14s;animation-delay:-3s"><circle cx="144" cy="131" r="3"/><circle cx="172" cy="121" r="3"/><circle cx="180" cy="141" r="3"/><path d="m147 130 22-8m-21 11 29 7m-4-16 6 14"/></g>
</svg>'''


def card(project, index):
    title = e(project["title"])
    return f'''<article class="work-card" aria-labelledby="work-{e(project["slug"])}">
        {project_media(project)}
        <div class="work-copy">
          <p class="work-number"><span aria-hidden="true">// </span>{index + 1:02d}</p>
          <h2 id="work-{e(project["slug"])}" class="work-title">{title}</h2>
          <p class="work-description">{e(project["description"])}</p>
          {stack(project["cardStack"])}
          <a class="primary-button work-link" href="/projects/{e(project["slug"])}/" aria-label="View project: {title}">View Project</a>
        </div>
      </article>'''


def project_media(project):
    image = project.get('image')
    src = image['src'] if image else ''
    alt = image.get('alt') or f'{project["title"]} project image' if image else ''
    image_attrs = f' src="{e(src)}" alt="{e(alt)}" loading="lazy" decoding="async"' if src else ' alt="" hidden'
    empty_hidden = ' hidden' if src else ''
    slug, title = e(project['slug']), e(project['title'])
    return f'''<div class="work-media" data-project-media="{slug}" data-project-title="{title}" data-published-src="{e(src)}" data-published-alt="{e(alt)}">
          <div class="work-image-surface">
            <img class="work-image"{image_attrs}>
            <p class="work-image-empty"{empty_hidden}>Project image</p>
          </div>
        </div>'''


def architecture_node(label, index, x, y, width):
    words = label.split()
    if len(label) > 11 and len(words) > 1:
        cut = (len(words) + 1) // 2
        lines = [' '.join(words[:cut]), ' '.join(words[cut:])]
    else:
        lines = [label]
    text = ''.join(f'<tspan x="{x + width / 2}" dy="{0 if n == 0 else 22}">{e(line)}</tspan>' for n, line in enumerate(lines))
    return f'''<g>
      <path class="architecture-paper" d="M{x} {y + 1} l{width} -0.6 0.6 102 -{width + 1} 0.6 Z"/>
      <text class="architecture-step" x="{x + 15}" y="{y + 24}">{index + 1:02d}</text>
      <circle class="architecture-jade" cx="{x + width - 24}" cy="{y + 20}" r="4"/>
      <text x="{x + width / 2}" y="{y + (65 if len(lines) == 1 else 56)}" text-anchor="middle">{text}</text>
      <path class="architecture-jade" d="m{x + 15} {y + 88} 18-.2"/>
    </g>'''


def architecture(project):
    labels = project["flow"]
    if not labels:
        return f'''<figure class="architecture placeholder-visual">
          <div class="architecture-visual">{illustration(project)}</div>
          <figcaption class="flow-caption">Illustrative planning sketch. Architecture notes to be added.</figcaption>
        </figure>'''
    wide_nodes = ''.join(architecture_node(label, i, 18 + 170 * i, 32, 140) for i, label in enumerate(labels))
    wide_connections = ''.join(f'<path class="architecture-jade" d="M{158 + 170 * i} 84q14-.5 30 0m-7-5 7 5-7 5"/>' for i in range(3))
    mobile_positions = [(10, 12), (220, 12), (10, 177), (220, 177)]
    mobile_nodes = ''.join(architecture_node(label, i, *mobile_positions[i], 160) for i, label in enumerate(labels))
    mobile_connections = '<path class="architecture-jade" d="M170 64q24-.5 50 0m-7-5 7 5-7 5M300 115v27q0 6-7 6H97q-7 0-7 7v22m-5-7 5 7 5-7M170 229q24-.5 50 0m-7-5 7 5-7 5"/>'
    flow_text = ' <span aria-hidden="true">→</span> '.join(e(label) for label in labels)
    return f'''<figure class="architecture">
          <div class="architecture-visual">
            <svg class="architecture-svg architecture-wide" viewBox="0 0 688 162" aria-hidden="true" focusable="false">{wide_connections}{wide_nodes}</svg>
            <svg class="architecture-svg architecture-mobile" viewBox="0 0 390 298" aria-hidden="true" focusable="false">{mobile_connections}{mobile_nodes}</svg>
          </div>
          <figcaption class="flow-caption">{flow_text}</figcaption>
        </figure>'''


def external_button(url, label, accessible_label=None):
    return f'<a class="primary-button detail-action" href="{e(url)}" aria-label="{e(accessible_label or label)} (opens in a new tab)" target="_blank" rel="noopener noreferrer">{e(label)}</a>'


def project_preview(project):
    images = project['previewImages']
    if not images:
        return '<div class="project-preview"><div class="preview-empty"><p>Project preview</p></div></div>'
    total = len(images)
    slides = []
    for index, image in enumerate(images):
        alt = image.get('alt') or f'{project["title"]} preview {index + 1}'
        loading = 'eager' if index == 0 else 'lazy'
        slides.append(f'''<figure class="preview-slide" role="group" aria-label="Image {index + 1} of {total}">
            <img class="preview-image" src="{e(image['src'])}" alt="{e(alt)}" loading="{loading}" decoding="async">
            <p class="preview-image-error" hidden>Preview image unavailable.</p>
          </figure>''')
    controls = f'''
        <div class="preview-controls" hidden>
          <button type="button" class="secondary-button preview-previous" aria-label="Previous preview image" aria-controls="project-preview-images">Previous</button>
          <p class="preview-position" role="status" aria-live="polite" aria-atomic="true">1 of {total}</p>
          <button type="button" class="secondary-button preview-next" aria-label="Next preview image" aria-controls="project-preview-images">Next</button>
        </div>''' if total > 1 else ''
    return f'''<div class="project-preview" data-preview-gallery role="region" aria-label="{e(project['title'])} preview">
        <div id="project-preview-images" class="preview-track" aria-label="Project preview images">
          {''.join(slides)}
        </div>{controls}
      </div>'''


def detail(project):
    has_preview = 'previewImages' in project
    visual_heading = 'Preview' if has_preview else 'How it works'
    visual = project_preview(project) if has_preview else architecture(project)
    github_url = project['github'] or GITHUB_PROFILE
    github_label = 'GitHub' if project['github'] else 'GitHub profile'
    actions = external_button(github_url, 'GitHub', github_label) if github_url else ''
    if project['demo']:
        actions += external_button(project['demo'], 'Live Demo')
    if actions:
        actions = f'<div class="detail-actions">{actions}</div>'
    features = '<ul class="feature-list">' + ''.join(f'<li>{e(feature)}</li>' for feature in project["features"]) + '</ul>' if project["features"] else '<p class="detail-text">Feature notes to be added.</p>'
    learned = project["learned"] or 'Learning notes to be added.'
    return head(project["title"], project["description"], preview_gallery=has_preview) + f'''
  <main id="projects-main" class="projects-shell">
    <div class="detail-intro">
      <a class="project-back" href="/projects/"><span aria-hidden="true">←</span> Back to Projects</a>
      <h1>{e(project["title"])}</h1>
      <p class="projects-lead">{e(project["description"])}</p>
      {stack(project["technologies"])}
    </div>
    <div class="detail-sections">
      <section class="detail-section" aria-labelledby="overview-heading">
        <h2 id="overview-heading">Project overview</h2>
        <p class="detail-text">{e(project["overview"])}</p>
      </section>
      <section class="detail-section" aria-labelledby="architecture-heading">
        <h2 id="architecture-heading">{visual_heading}</h2>
        {visual}
      </section>
      <section class="detail-section" aria-labelledby="features-heading">
        <h2 id="features-heading">Key features</h2>
        {features}
      </section>
      <section class="detail-section" aria-labelledby="technologies-heading">
        <h2 id="technologies-heading">Technologies</h2>
        <div>{stack(project["technologies"])}</div>
      </section>
      <section class="detail-section" aria-labelledby="learning-heading">
        <h2 id="learning-heading">What I learned</h2>
        <p class="detail-text">{e(learned)}</p>
      </section>
    </div>
    {actions}
  </main>''' + FOOT


def main():
    if GITHUB_PROFILE:
        parsed = urlparse(GITHUB_PROFILE)
        if parsed.scheme != 'https' or parsed.hostname != 'github.com' or parsed.username or parsed.password:
            raise ValueError('The GitHub profile must be a public HTTPS github.com URL.')
    if len(PROJECTS) != 5:
        raise ValueError('This version must contain exactly the five requested projects.')
    slugs = [p["slug"] for p in PROJECTS]
    if len(set(slugs)) != len(slugs) or any(not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) for slug in slugs):
        raise ValueError('Project slugs must be unique, safe route names.')
    for project in PROJECTS:
        if 'previewImages' in project:
            previews = project['previewImages']
            if not isinstance(previews, list):
                raise ValueError('Preview images must be an array.')
            for preview in previews:
                if not isinstance(preview, dict) or not isinstance(preview.get('src'), str) or not preview['src'].strip():
                    raise ValueError('Each preview image needs a src URL and optional alt text.')
                if 'alt' in preview and not isinstance(preview['alt'], str):
                    raise ValueError('Preview alt text must be a string.')
                parsed = urlparse(preview['src'])
                if parsed.username or parsed.password or not ((parsed.scheme == 'https' and parsed.netloc) or (preview['src'].startswith('/') and not preview['src'].startswith('//') and not parsed.scheme and not parsed.netloc)):
                    raise ValueError(f'Invalid preview image URL: {project["slug"]}')
        image = project.get('image')
        if image:
            if not isinstance(image, dict) or not isinstance(image.get('src'), str):
                raise ValueError('Project images must contain a src URL and optional alt text.')
            parsed = urlparse(image['src'])
            if parsed.username or parsed.password or not ((parsed.scheme == 'https' and parsed.netloc) or (image['src'].startswith('/') and not image['src'].startswith('//') and not parsed.scheme and not parsed.netloc)):
                raise ValueError(f'Invalid project image URL: {project["slug"]}')
        for field in ('github', 'demo'):
            if project[field]:
                parsed = urlparse(project[field])
                if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password:
                    raise ValueError(f'Invalid public URL in {project["slug"]}: {field}')
        if project['flow'] and len(project['flow']) != 4:
            raise ValueError('The compact architecture supports four flow steps.')
    hero = '''
  <main id="projects-main" class="projects-shell">
    <section class="projects-intro" aria-labelledby="projects-title">
      <div class="projects-intro-copy">
        <p class="section-label">Projects</p>
        <h1 id="projects-title">Things I've built while learning, experimenting and solving problems.</h1>
        <p class="projects-lead">Exploring AI, software engineering, automation and intelligent applications through practical projects.</p>
      </div>'''
    html = head('Projects', 'Projects exploring AI, software engineering and automation by Nadeeshan.', image_picker=True) + hero + BACKGROUND + '''
    </section>
    <section class="work-grid" aria-label="Project collection">
      ''' + '\n      '.join(card(p, i) for i, p in enumerate(PROJECTS)) + '''
    </section>
  </main>''' + FOOT
    (OUT / 'index.html').write_text(apply_footer_signature(html))
    for project in PROJECTS:
        folder = OUT / project['slug']
        folder.mkdir(exist_ok=True)
        (folder / 'index.html').write_text(apply_footer_signature(detail(project)))
    print(f'Generated Projects index and {len(PROJECTS)} detail routes from projects.json.')


if __name__ == '__main__':
    main()
