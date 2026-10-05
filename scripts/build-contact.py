#!/usr/bin/env python3
"""Build the separate Contact page without modifying any existing page."""
from html import escape
import json
from pathlib import Path
from footer_signature import apply_footer_signature
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist' / 'contact'
PLATFORMS = [('facebook', 'Facebook'), ('linkedin', 'LinkedIn'),
             ('whatsapp', 'WhatsApp'), ('x', 'X'), ('github', 'GitHub')]
HOSTS = {
    'facebook': {'facebook.com', 'fb.com'}, 'linkedin': {'linkedin.com'},
    'whatsapp': {'whatsapp.com', 'wa.me'}, 'x': {'x.com', 'twitter.com'},
    'github': {'github.com'}
}

def safe_profile(platform, value):
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError('Social profile URLs must be strings or null.')
    parsed = urlparse(value)
    host = (parsed.hostname or '').removeprefix('www.')
    if parsed.scheme != 'https' or parsed.username or parsed.password or host not in HOSTS[platform]:
        raise ValueError(f'Use a public HTTPS {platform} profile URL without credentials.')
    return value

def icon(platform):
    asset = (OUT / 'icons' / f'{platform}.svg').read_text()
    if re.search(r'<(?:script|foreignObject)\b|\bon\w+\s*=|(?:href|xlink:href)\s*=', asset, re.I):
        raise ValueError(f'Unsafe SVG: {platform}')
    root = re.search(r'<svg\b[^>]*>', asset)
    if not root:
        raise ValueError(f'Missing SVG root: {platform}')
    extra = ' class="social-glyph"'
    for name, value in [('aria-hidden', 'true'), ('focusable', 'false')]:
        if not re.search(r'\b' + name + r'\s*=', root.group()):
            extra += f' {name}="{value}"'
    return asset[:root.start()] + root.group()[:-1] + extra + '>' + asset[root.end():]

def social_controls():
    data = json.loads((OUT / 'socials.json').read_text())
    controls = []
    for key, label in PLATFORMS:
        url = safe_profile(key, data.get(key))
        attrs = f'class="social-icon" data-social-platform="{key}" data-social-label="{label}"'
        if url:
            controls.append(f'<a {attrs} href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="{label} (opens in a new tab)" title="{label}">{icon(key)}</a>')
        else:
            controls.append(f'<button {attrs} type="button" disabled aria-label="{label}, coming soon" title="{label} — coming soon">{icon(key)}</button>')
    return '\n          '.join(controls)

def field(key, label, field_type='text', required=False, autocomplete='', placeholder='', maximum=80):
    name = {'first-name': 'firstName', 'last-name': 'lastName', 'email': 'email', 'message': 'message'}[key]
    star = '<span class="contact-required" aria-hidden="true">*</span>' if required else ''
    attrs = f'id="contact-{key}" class="contact-input" name="{name}" maxlength="{maximum}" placeholder="{escape(placeholder, quote=True)}" aria-describedby="contact-{key}-error"'
    if required:
        attrs += ' required'
    if field_type == 'textarea':
        control = f'<textarea {attrs} rows="4"></textarea>'
    else:
        attrs += f' type="{field_type}" autocomplete="{autocomplete}"'
        if field_type == 'email':
            attrs += ' inputmode="email" autocapitalize="none" spellcheck="false"'
        control = f'<input {attrs}>'
    return f'''<div class="contact-field">
              <label for="contact-{key}">{label}{star}</label>
              {control}
              <p id="contact-{key}-error" class="contact-field-error" hidden></p>
            </div>'''

def main():
    html = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Contact — Nadeeshan</title>
  <meta name="description" content="Have an idea, project, collaboration, or opportunity? Start a conversation with Nadeeshan.">
  <meta name="theme-color" content="#F7F9F7">
  <link rel="preload" href="/assets/fonts/sora-latin-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/portfolio.css">
  <link rel="stylesheet" href="/contact/contact-page.css">
  <script src="/scroll-progress.js" defer></script>
  <script src="/contact/contact-page.js" defer></script>
</head>
<body class="contact-page">
  <a class="skip-link" href="#contact-main">Skip to content</a>
  <header class="site-header">
    <a href="/" aria-label="Nadeeshan Nadeera, home" class="brand"><span>Nadeeshan Nadeera</span></a>
    <nav id="contact-navigation" aria-label="Main navigation" class="nav-links">
      <a class="nav-link" href="/">Home</a>
      <a class="nav-link" href="/education/">Education</a>
      <a class="nav-link" href="/projects/">Projects</a>
      <a class="nav-link" href="/contact/" aria-current="page">Contact</a>
    </nav>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="contact-navigation" aria-label="Open navigation menu" hidden>Menu</button>
  </header>
  <main id="contact-main" class="contact-shell">
    <header class="contact-intro">
      <p class="section-label contact-eyebrow">Contact</p>
      <h1 class="contact-title">Let’s work together.</h1>
      <p class="contact-lead">Have an idea, project, collaboration, or opportunity?<br class="desktop-break"> Send me a message and let’s start a conversation.</p>
    </header>
    <section class="contact-form-panel" aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" class="visually-hidden">Send a message</h2>
      <svg class="panel-sketch panel-sketch-top" viewBox="0 0 44 25" aria-hidden="true" focusable="false"><path d="m3 18 14-.2.2-13 14 .2m-2-3 3 3-3 3"/><circle cx="3" cy="18" r="2"/><circle cx="39" cy="18" r="1"/></svg>
      <svg class="panel-sketch panel-sketch-bottom" viewBox="0 0 32 15" aria-hidden="true" focusable="false"><path d="m3 10 5-5m2 5 5-5m5 5 10-.2"/></svg>
      <form class="contact-form" aria-labelledby="contact-form-heading" method="post">
        <fieldset class="contact-fields">
          <legend class="visually-hidden">Your contact details and message</legend>
          <div class="contact-name-fields">
            FIRST_FIELD
            LAST_FIELD
          </div>
          EMAIL_FIELD
          MESSAGE_FIELD
        </fieldset>
        <div class="contact-form-footer">
          <button class="primary-button contact-send" type="submit" disabled><span class="contact-send-text">Send Message</span></button>
        </div>
        <p class="contact-form-status" role="status" aria-live="polite" aria-atomic="true" hidden></p>
        <noscript><p class="contact-availability">Enable JavaScript to use the form, or connect on GitHub below.</p></noscript>
      </form>
    </section>
    <section class="contact-socials" aria-labelledby="contact-socials-heading">
      <h2 id="contact-socials-heading">Connect with me</h2>
      <div class="social-row" aria-label="Social profiles">
          SOCIAL_CONTROLS
      </div>
    </section>
    <svg class="page-doodle doodle-braces" viewBox="0 0 30 28" aria-hidden="true" focusable="false"><path d="M10 3c-4 0-5 2-5 6v1c0 2-1 3-3 4 2 0 3 2 3 4v1c0 4 1 6 5 6M20 3c4 0 5 2 5 6v1c0 2 1 3 3 4-2 0-3 2-3 4v1c0 4-1 6-5 6"/></svg>
    <svg class="page-doodle doodle-circuit" viewBox="0 0 55 32" aria-hidden="true" focusable="false"><path d="m7 24 20-.3.2-17 17 .2m-7 14 10 .1m-2-3 3 3-3 3"/><circle cx="6" cy="24" r="3"/><circle cx="47" cy="7" r="2.5"/></svg>
    <svg class="page-doodle doodle-terminal" viewBox="0 0 36 28" aria-hidden="true" focusable="false"><path d="m3 3 30 .3-.2 21.7L3 25Zm.2 6h29M9 13l4 3-4 3m8 1 9-.2"/><circle cx="7" cy="6" r=".5"/></svg>
    <svg class="page-doodle doodle-chip" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><path d="m8 8 14 .2-.2 13.8L8 22Zm4-5v5m6-5v5M12 22v5m6-5v5M3 12h5m-5 6h5m14-6h5m-5 6h5m-14-6 6 .2-.2 5.8-5.8-.2Z"/></svg>
    <svg class="contact-flight" aria-hidden="true" focusable="false">
      <path class="contact-flight-path" d="M0 0"/>
      <circle class="contact-flight-dot" r="2.3"/>
      <g class="contact-plane">
        <path class="plane-paper" d="m-16-9 34 8.5-27 13 1-12Z"/>
        <path class="plane-fold" d="M18-.5-8 1.5l-1 11L-1 5Z"/>
        <path class="plane-crease" d="m-15.5-8.5 14.4 13.3 18.4-5.1"/>
      </g>
    </svg>
  </main>
  <footer class="site-footer">
    <a href="/" aria-label="Nadeeshan Nadeera, home" class="brand"><span>Nadeeshan Nadeera</span></a>
    <p>© <span class="contact-year">2026</span> Nadeeshan</p>
    <nav aria-label="Footer navigation" class="footer-links"><a href="/">Home</a><a href="/projects/">Projects</a><a href="https://github.com/Nadeeshan-n" target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)">GitHub</a></nav>
  </footer>
</body>
</html>
'''
    replacements = {
        'FIRST_FIELD': field('first-name', 'First Name', required=True, autocomplete='given-name', placeholder='Your first name'),
        'LAST_FIELD': field('last-name', 'Last Name', autocomplete='family-name', placeholder='Your last name'),
        'EMAIL_FIELD': field('email', 'Email', 'email', True, 'email', 'you@domain.com', 254),
        'MESSAGE_FIELD': field('message', 'Message', 'textarea', True, placeholder='Tell me a little about your idea…', maximum=4000),
        'SOCIAL_CONTROLS': social_controls()
    }
    for key, value in replacements.items():
        html = html.replace(key, value)
    (OUT / 'index.html').write_text(apply_footer_signature(html))
    print('Generated the separate Contact page; existing pages are unchanged.')

if __name__ == '__main__':
    main()
