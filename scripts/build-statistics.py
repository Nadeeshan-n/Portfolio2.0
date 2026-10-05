"""Derive project/certificate totals from their page data and sync static counters."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
portfolio_path = root / 'dist/portfolio.json'
portfolio = json.loads(portfolio_path.read_text())
values = portfolio['statistics']
for key, path in [('projects', 'dist/projects/projects.json'), ('certificates', 'dist/education/education.json')]:
    entries = json.loads((root / path).read_text())[key]
    if not isinstance(entries, list):
        raise ValueError(f'{key} must be a list in {path}')
    values[key] = len(entries)
portfolio['statisticsSource'] = 'Project and certificate totals are derived from projects/projects.json and education/education.json. Experience remains the value supplied in the portfolio brief.'
metrics = [('projects', 'Projects'), ('certificates', 'Certificates'), ('experience', 'Experience')]
parts = []
for key, label in metrics:
    total = values[key]
    if isinstance(total, bool) or not isinstance(total, int) or total < 0:
        raise ValueError(f'{key} must be a non-negative integer')
    exact = key in ('projects', 'certificates')
    exact_attribute = ' data-count-exact="true"' if exact else ''
    suffix = '' if exact else '<span class="stats-plus">+</span>'
    accessible = str(total) if exact else f'{total} or more'
    parts.append(f'''    <div class="stats-metric">
      <dt>{label}</dt>
      <dd data-stat="{key}" data-count-to="{total}" data-digits="2"{exact_attribute}>
        <span class="stats-value" aria-hidden="true"><span class="stats-digits">{total:02d}</span>{suffix}</span>
        <span class="stats-sr-value">{accessible}</span>
      </dd>
    </div>''')

section = '''<section id="portfolio-statistics" class="portfolio-statistics" aria-labelledby="portfolio-statistics-heading">
  <div class="stats-intro">
    <h2 id="portfolio-statistics-heading" class="stats-eyebrow">BUILDING &amp; LEARNING</h2>
  </div>
  <dl class="stats-metrics">
''' + '\n'.join(parts) + '''
  </dl>
  <svg class="stats-doodle stats-doodle-braces" viewBox="0 0 30 24" aria-hidden="true" focusable="false"><path d="M9 3c-4 0-5 2-5 5v1c0 2-1 3-3 3 2 0 3 1 3 3v1c0 3 1 5 5 5M21 3c4 0 5 2 5 5v1c0 2 1 3 3 3-2 0-3 1-3 3v1c0 3-1 5-5 5"/></svg>
  <svg class="stats-doodle stats-doodle-nodes" viewBox="0 0 40 20" aria-hidden="true" focusable="false"><path d="m7 11 24-.4"/><circle cx="5" cy="11" r="3"/><circle cx="34" cy="10.5" r="3"/><path d="m19 10.8 .1-7 5 .1"/></svg>
  <svg class="stats-doodle stats-doodle-code" viewBox="0 0 20 18" aria-hidden="true" focusable="false"><path d="m8 3-5 12M16 3l-5 12"/></svg>
  <svg class="stats-doodle stats-doodle-terminal" viewBox="0 0 36 26" aria-hidden="true" focusable="false"><path d="M4 3.5 31 3c1.5 0 2.2 1 2.1 2.6l-.3 16.2c0 1.4-.8 2-2.3 2L4 23.5c-1.4 0-2-.8-2-2.2l.2-15.8c0-1.4.6-2 1.8-2ZM3 9l29-.2m-24 5 4 3-4 3m9 .2 7-.3"/><circle cx="6" cy="6.5" r=".5"/><circle cx="9" cy="6.4" r=".5"/></svg>
  <svg class="stats-doodle stats-doodle-chip" viewBox="0 0 28 28" aria-hidden="true" focusable="false"><path d="m8 7 13 .3-.2 13.5L7.5 21Zm3-4v4m6-4v4m-6 14v4m6-4v4M3 11h4.5M3 17l4.5-.1M21 11h4m-4 6h4m-14-6 6 .2-.2 5.8-5.8-.2Z"/><path d="m9 23 2-1m2 2 2-1" stroke-width=".8"/></svg>
</section>'''
page = root / 'dist/index.html'
html = page.read_text()
pattern = r'<section id="portfolio-statistics".*?</section>'
if re.search(pattern, html, re.S):
    html = re.sub(pattern, lambda _: section, html, count=1, flags=re.S)
else:
    anchor = '<section id="technical-arsenal"'
    if html.count(anchor) != 1:
        raise ValueError('Expected one Technical Arsenal section after About')
    html = html.replace(anchor, section + '\n' + anchor, 1)
page.write_text(html)
portfolio_path.write_text(json.dumps(portfolio, indent=2) + '\n')
print(f'Statistics synced: {values["projects"]} projects, {values["certificates"]} certificates; experience unchanged.')
