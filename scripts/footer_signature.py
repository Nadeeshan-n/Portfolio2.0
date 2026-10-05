"""Apply the shared signature only to footer branding, preserving every other byte."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def apply_footer_signature(html):
    svg = (ROOT / 'dist/assets/signature/nadeeshan-signature.svg').read_text().strip()

    def replace_footer(match):
        footer = match.group(0)
        existing = re.compile(r'(<a\b[^>]*class="brand footer-signoff"[^>]*>)<svg\b.*?</svg></a>', re.S)
        if existing.search(footer):
            return existing.sub(lambda found: found.group(1) + svg + '</a>', footer, count=1)
        brand = re.compile(r'(<a\b[^>]*class="brand"[^>]*>)<span>Nadeeshan Nadeera</span></a>')
        if not brand.search(footer):
            return footer
        footer = re.sub(r'<footer\b([^>]*)>', r'<footer\1 data-signature-footer>', footer, count=1)
        return brand.sub(lambda found: found.group(1).replace('class="brand"', 'class="brand footer-signoff"') + svg + '</a>', footer, count=1)

    html = re.sub(r'<footer\b[^>]*>.*?</footer>', replace_footer, html, flags=re.S)
    if 'class="brand footer-signoff"' not in html:
        return html
    if 'href="/footer-signature.css"' not in html:
        html = html.replace('</head>', '<link rel="stylesheet" href="/footer-signature.css"></head>', 1)
    if 'src="/footer-signature.js"' not in html:
        html = html.replace('</body>', '<script src="/footer-signature.js" defer></script></body>', 1)
    return html


if __name__ == '__main__':
    for path in (ROOT / 'dist').rglob('index.html'):
        original = path.read_text()
        updated = apply_footer_signature(original)
        if original != updated:
            path.write_text(updated)
            print(path.relative_to(ROOT))
