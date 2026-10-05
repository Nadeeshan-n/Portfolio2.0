"""Render the buildless Education route from owner-supplied records. No network."""
from pathlib import Path
from footer_signature import apply_footer_signature
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'dist/education/education.json').read_text())
CERTIFICATES = {item['id']: item for item in DATA['certificates']}

def certificate(key):
    item = CERTIFICATES[key]
    skills = ' · '.join(item['skills'])
    return f'''<li class="learning-node">
      <button class="certificate-trigger" type="button" data-certificate="{escape(key)}" aria-haspopup="dialog" aria-controls="certificate-dialog" disabled>
        <span class="certificate-year"><span class="mini-node" aria-hidden="true"></span>{item['year']}</span>
        <span class="certificate-title">{escape(item['title'])}</span>
        <span class="certificate-institution">{escape(item['institution'])}</span>
        <span class="certificate-skills">{escape(skills)}</span>
        <span class="certificate-action">View certificate <span aria-hidden="true">→</span></span>
      </button>
    </li>'''

degree = DATA['degree']
focus = ''.join(f'<li>{escape(value)}</li>' for value in degree['focus'])
payload = json.dumps(DATA, ensure_ascii=False).replace('<', '\\u003c')
page = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Education — Nadeeshan</title>
  <meta name="description" content="Nadeeshan’s academic journey: a foundation in Information and Communication Technology, web development, Python, machine learning and modern engineering.">
  <meta name="theme-color" content="#F7F9F7">
  <link rel="preload" href="/assets/fonts/sora-latin-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/portfolio.css">
  <link rel="stylesheet" href="/education/education.css">
  <script src="/scroll-progress.js" defer></script>
  <script src="/education/education.js" defer></script>
</head>
<body class="education-page">
  <a class="skip-link" href="#education-main">Skip to content</a>
  <header class="site-header">
    <a href="/" aria-label="Nadeeshan Nadeera, home" class="brand"><span>Nadeeshan Nadeera</span></a>
    <nav id="education-navigation" aria-label="Main navigation" class="nav-links">
      <a class="nav-link" href="/">Home</a>
      <a class="nav-link" href="/education/" aria-current="page">Education</a>
      <a class="nav-link" href="/projects/">Projects</a>
      <a class="nav-link" href="/contact/">Contact</a>
    </nav>
    <button type="button" aria-expanded="false" aria-controls="education-navigation" aria-label="Open navigation menu" class="menu-toggle">Menu</button>
  </header>
  <main id="education-main" class="education-main">
    <section class="education-hero" aria-labelledby="education-title">
      <div class="education-hero-copy">
        <p class="section-label">Education</p>
        <h1 id="education-title">My academic journey<span class="jade-period">.</span></h1>
        <p class="education-hero-lead">Building the foundations behind my journey into AI Software Engineering.</p>
        <p class="education-hero-note">From software engineering foundations to AI, data, automation and modern development.</p>
      </div>
      <svg class="education-hero-sketch" viewBox="0 0 300 220" aria-hidden="true" focusable="false">
        <path class="sketch-pale" d="M73 72c34-17 69-16 109-6l14 103c-41-14-79-17-117-3Z"/>
        <path d="m72 71 63-19 53 19-58 23Zm6 5 5 87c15-5 34-4 51 4l-5-72m58-23-3 93c-15-6-34-4-50 2"/>
        <path class="sketch-jade" d="m92 114 15 1m-14 11 18 2m43-20 14-3m-15 16 13-2"/>
        <path d="M185 83h38v-39h21m-84 93h64v28h20"/>
        <circle class="sketch-fill" cx="246" cy="43" r="8"/><circle class="sketch-fill" cx="249" cy="166" r="7"/>
        <path class="sketch-muted" d="m50 102-8 5 8 6m166-9 8 5-8 6m-15 73 5-6m2 8 5-6m-87-149 1-8m7 9 4-6"/>
        <path class="sketch-jade" d="m253 87-5-4-5 4m5-4v20m-223 44 13-1m-6-5 6 5-5 6"/>
      </svg>
    </section>

    <section class="academic-journey" aria-labelledby="academic-journey-heading">
      <header class="journey-heading">
        <h2 id="academic-journey-heading" class="section-label">Academic journey</h2>
        <p>Foundations. Connections. Possibilities.</p>
      </header>
      <div class="journey-map">
        <svg class="journey-route" aria-hidden="true" focusable="false"><path class="route-ink"/><path class="route-branches"/></svg>
        <div class="journey-doodles" aria-hidden="true">
          <svg class="journey-doodle doodle-braces" viewBox="0 0 50 35"><path d="M16 3c-8-1-7 5-7 10 0 3-3 4-5 5 6 1 5 3 5 7s0 7 7 7m18-29c8-1 7 5 7 10 0 3 3 4 5 5-6 1-5 3-5 7s0 7-7 7"/></svg>
          <img class="journey-doodle doodle-network" src="/assets/sketches/accent-connections.svg" alt="" width="88" height="56">
          <svg class="journey-doodle doodle-chip" viewBox="0 0 40 40"><path d="m10 10 20 .3-.3 19.7L10 30Zm5-7v7m9-7v7m-9 20v7m9-7v7M3 15h7m-7 9h7m20-9h7m-7 9h7m-21-9 8 .3-.3 7.7-7.7-.3Z"/></svg>
          <svg class="journey-doodle doodle-cloud" viewBox="0 0 60 42"><path d="M12 32c-12-1-12-17 0-18C12-2 40-1 41 16c17-3 21 17 6 17Zm11 5h11m-12 4h5"/></svg>
          <svg class="journey-doodle doodle-terminal" viewBox="0 0 58 42"><path d="m4 5 49-.3.4 33-49 .4ZM5 13l48-.3m-41 8 5 4-5 4m10 0h10"/><circle cx="10" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>
        </div>

        <article class="degree-milestone journey-stop" aria-labelledby="degree-title">
          <span class="route-node route-node-degree" aria-hidden="true"></span>
          <div class="degree-topline"><p class="journey-annotation">// Foundation</p><span class="degree-period">@@PERIOD@@</span></div>
          <svg class="degree-cap" viewBox="0 0 80 65" aria-hidden="true" focusable="false"><path d="m7 22 34-15 32 15-32 16ZM21 29l1 17c11 8 28 9 39-1l-.3-16m11-6v23"/><path d="m69 46-2 9h9l-3-9"/><path class="sketch-jade" d="m28 52 12 4 12-3"/></svg>
          <h2 id="degree-title">@@DEGREE@@</h2>
          <div class="degree-university">
            <img class="university-mark" src="/education/assets/university-mark.png" width="60" height="60" alt="University of Sri Jayewardenepura emblem" decoding="async">
            <div><p class="degree-institution">@@INSTITUTION@@</p><p class="degree-location">@@LOCATION@@</p></div>
          </div>
          <div class="degree-focus"><p class="journey-annotation">Learning foundations</p><ul>@@FOCUS@@</ul></div>
        </article>

        <section class="learning-stage stage-web journey-stop" aria-labelledby="web-learning-heading">
          <span class="route-node" aria-hidden="true"></span>
          <div class="learning-stage-header"><p class="journey-annotation">// Web</p><h3 id="web-learning-heading">A place to start.</h3></div>
          <ul class="learning-branches branches-single">@@WEB@@</ul>
        </section>

        <section class="learning-stage stage-python journey-stop" aria-labelledby="python-learning-heading">
          <span class="route-node" aria-hidden="true"></span>
          <div class="learning-stage-header"><p class="journey-annotation">// Programming → Data</p><h3 id="python-learning-heading">Thinking in Python.</h3></div>
          <ul class="learning-branches branches-python">@@PYTHON@@</ul>
        </section>

        <section class="learning-stage stage-systems journey-stop" aria-labelledby="systems-learning-heading">
          <span class="route-node" aria-hidden="true"></span>
          <div class="learning-stage-header"><p class="journey-annotation">// Machine learning + Systems</p><h3 id="systems-learning-heading">Connecting the bigger picture.</h3></div>
          <ul class="learning-branches branches-systems">@@SYSTEMS@@</ul>
        </section>

      </div>
    </section>
    <noscript><p class="education-noscript">Your learning journey is shown in full. Enable JavaScript to open certificate details.</p></noscript>
  </main>
  <footer class="site-footer">
    <a href="/" aria-label="Nadeeshan Nadeera, home" class="brand"><span>Nadeeshan Nadeera</span></a>
    <p>© <span class="education-year">2026</span> Nadeeshan</p>
    <nav aria-label="Footer navigation" class="footer-links"><a href="https://github.com/Nadeeshan-n" target="_blank" rel="noopener noreferrer">GitHub</a></nav>
  </footer>

  <dialog id="certificate-dialog" class="certificate-dialog" aria-labelledby="certificate-modal-title" aria-describedby="certificate-modal-meta">
    <button type="button" class="certificate-close" aria-label="Close certificate" autofocus><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m5 5 10 10M15 5 5 15"/></svg></button>
    <p class="journey-annotation">Learning milestone</p>
    <div class="certificate-gallery" hidden>
      <img class="certificate-image" alt="" decoding="async">
      <p class="certificate-image-error" role="status" hidden>This certificate image is unavailable.</p>
      <div class="certificate-gallery-controls" hidden>
        <button type="button" class="certificate-previous" aria-label="Previous certificate image">Previous</button>
        <span class="certificate-image-position" aria-live="polite" aria-atomic="true"></span>
        <button type="button" class="certificate-next" aria-label="Next certificate image">Next</button>
      </div>
    </div>
    <div class="certificate-no-image" hidden>
      <svg viewBox="0 0 58 64" aria-hidden="true" focusable="false"><path d="m9 5 31-.3 10 11-.3 43-41 .3Zm30 0v12h11M18 29h23M18 36h18M18 43h11"/><circle cx="38" cy="48" r="5"/><path d="m34 52-1 7 5-2 5 2-1-7"/></svg>
      <p>Certificate image hasn’t been added yet.</p>
    </div>
    <h2 id="certificate-modal-title"></h2>
    <p class="certificate-modal-institution"></p>
    <p id="certificate-modal-meta" class="certificate-modal-meta"></p>
    <p class="certificate-modal-skills"></p>
  </dialog>
  <script id="education-data" type="application/json">@@DATA@@</script>
</body>
</html>
'''
replacements = {
    '@@PERIOD@@': escape(degree['period']), '@@DEGREE@@': escape(degree['title']),
    '@@INSTITUTION@@': escape(degree['institution']), '@@LOCATION@@': escape(degree['location']),
    '@@FOCUS@@': focus, '@@WEB@@': certificate('web-foundations'),
    '@@PYTHON@@': '\n'.join(certificate(key) for key in ('python-foundations', 'python-data-structures', 'python-web-data')),
    '@@SYSTEMS@@': '\n'.join(certificate(key) for key in ('linear-algebra', 'linux-shell')),
    '@@DATA@@': payload,
}
for token, value in replacements.items():
    page = page.replace(token, value)
(ROOT / 'dist/education/index.html').write_text(apply_footer_signature(page))
print(f'Education page rendered: one degree, {len(CERTIFICATES)} learning nodes.')
