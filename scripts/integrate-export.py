"""Integrate the 12ui export while retaining its artwork and semantic content."""
from pathlib import Path
from lxml import html, etree
from PIL import Image
import base64, hashlib, io, re, sys

source = Path(sys.argv[1])
root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
assets = dist / 'assets' / 'design'
assets.mkdir(parents=True, exist_ok=True)
document = html.fromstring(source.read_text(), parser=html.HTMLParser(huge_tree=True))
elements = {el.get('id'): el for el in document.xpath('//*[@id]')}
cache = {}

def asset(uri, name):
    if not uri.startswith('data:image/'):
        return uri
    raw = base64.b64decode(uri.split(',', 1)[1])
    digest = hashlib.sha256(raw).hexdigest()
    if digest in cache:
        return cache[digest]
    image = Image.open(io.BytesIO(raw))
    path = assets / (name + '.webp')
    image.save(path, 'WEBP', quality=92, method=6)
    cache[digest] = 'assets/design/' + path.name
    return cache[digest]

for i, element in enumerate(document.xpath('//img')):
    element.set('src', asset(element.get('src', ''), element.get('id', f'image-{i}')))
    element.set('decoding', 'async')
    element.set('loading', 'eager' if 'hero-art' in element.get('id', '') else 'lazy')

styles = '\n'.join(x.text or '' for x in document.xpath('//style'))
plate_counter = 0
def replace_plate(match):
    global plate_counter
    plate_counter += 1
    return asset(match.group(0), f'plate-{plate_counter:02}')
styles = re.sub(r'data:image/[^\s)\"\']+', replace_plate, styles)
(dist / 'converted.css').write_text(styles)

def by_id(id):
    return elements[id]
def detach(el):
    if el.getparent() is not None:
        el.getparent().remove(el)
    return el
def node(tag, cls='', **attrs):
    el = etree.Element(tag, **attrs)
    if cls:
        el.set('class', cls)
    return el
def words(el):
    return ' '.join(''.join(el.itertext()).split())
def label(el, text):
    for child in list(el):
        el.remove(child)
    el.text = text
    return el
def reclass(el, cls, tag=None):
    el.set('class', cls)
    if tag:
        el.tag = tag
    return detach(el)

head = document.find('head')
for el in list(head):
    head.remove(el)
head.append(etree.Element('meta', charset='utf-8'))
head.append(etree.Element('meta', name='viewport', content='width=device-width, initial-scale=1'))
title = etree.SubElement(head, 'title'); title.text = 'Nadeeshan — Software & AI Portfolio'
head.append(etree.Element('meta', name='description', content='Nadeeshan is a software engineering student exploring AI, automation, and thoughtful web applications. Discover the portfolio and learning journey.'))
head.append(etree.Element('meta', name='theme-color', content='#F7F9F7'))
head.append(etree.Element('link', rel='preload', href='assets/fonts/sora-latin-variable.woff2', **{'as': 'font', 'type': 'font/woff2', 'crossorigin': ''}))
head.append(etree.Element('link', rel='icon', href='assets/favicon.svg', type='image/svg+xml'))
head.append(etree.Element('link', rel='stylesheet', href='converted.css'))
head.append(etree.Element('link', rel='stylesheet', href='portfolio.css'))

body = document.find('body')
# All components below come from the converted design; only layout wrappers,
# navigation semantics and interaction hooks are added.
nav = by_id('viewport-1-winner-nav')
hero = by_id('viewport-1-winner-hero')
about = by_id('viewport-2-a-about')
skills = by_id('viewport-2-a-skills')
projects = by_id('viewport-3-b-projects')
journey = by_id('viewport-3-b-journey')
contact = by_id('viewport-3-b-collaboration')
footer = by_id('viewport-3-b-footer')
hero_footer = by_id('viewport-1-winner-hero-footer')

# Use the live Sora wordmark without a logo image.
brand_link = node('a', 'brand', href='#home', **{'aria-label':'Nadeeshan Nadeera, home'})
brand_name = etree.SubElement(brand_link, 'span'); brand_name.text = 'Nadeeshan Nadeera'
nav_links = node('nav', 'nav-links', id='navigation-links', **{'aria-label':'Main navigation'})
for suffix, target in [('', 'home'), ('-2', 'about'), ('-3', 'skills'), ('-4', 'projects'), ('-5', 'experience'), ('-6', 'contact')]:
    el = by_id('viewport-1-winner-nav-text' + suffix)
    el.tag = 'a'; el.set('href', '#' + target); el.set('class', 'nav-link')
    el.attrib.pop('style', None)
    if target == 'home': el.set('aria-current', 'location')
    nav_links.append(detach(el))
nav_action = by_id('viewport-1-winner-nav-action-button')
nav_action.tag = 'a'; nav_action.set('href', '#projects'); nav_action.set('class', 'primary-button nav-cta')
nav_action.attrib.pop('style', None)
label(nav_action, 'View Projects ↗')
menu = node('button', 'menu-toggle', type='button', **{'aria-expanded':'false','aria-controls':'navigation-links','aria-label':'Open navigation menu'})
menu.text = 'Menu'
nav = reclass(nav, 'site-header', 'header')
for child in list(nav): nav.remove(child)
nav.extend([brand_link, nav_links, detach(nav_action), menu])

hero = reclass(hero, 'hero section', 'section')
hero.set('aria-labelledby', 'viewport-1-winner-hero-source-row-2-heading')
eyebrow = reclass(by_id('viewport-1-winner-hero-source-row-1'), 'eyebrow')
heading = by_id('viewport-1-winner-hero-source-row-2-heading')
intro = by_id('viewport-1-winner-hero-source-row-2-heading-2'); intro.tag = 'p'; intro.set('class','hero-intro')
description = by_id('viewport-1-winner-hero-source-row-2-paragraph')
work = by_id('viewport-1-winner-hero-work-button')
work.tag='a'; work.set('href','#projects'); work.set('class','primary-button'); label(work,'View My Work ↗')
github = by_id('viewport-1-winner-hero-github-button')
github.tag='a'; github.set('href','https://github.com/Nadeeshan-n'); github.set('target','_blank'); github.set('rel','noopener noreferrer'); github.set('class','secondary-button github-link'); label(github,'GitHub ↗')
art = reclass(by_id('viewport-1-winner-hero-art'), 'hero-art')
copy = node('div','hero-copy')
actions = node('div','hero-actions'); actions.extend([detach(work),detach(github)])
copy.extend([eyebrow,detach(heading),detach(intro),detach(description),actions])
for child in list(hero): hero.remove(child)
hero.extend([copy,art])
hero_footer = reclass(hero_footer,'hero-meta')
for child in list(hero_footer): hero_footer.remove(child)
meta = etree.SubElement(hero_footer,'p'); meta.text='STUDENT  /  LEARNER  /  BUILDER'
scroll = etree.SubElement(hero_footer,'a',href='#about'); scroll.text='Scroll to explore ↓'

about = reclass(about, 'about section', 'section')
about.set('aria-labelledby','viewport-2-a-about-heading')
about_art = reclass(by_id('viewport-2-a-about-artwork'), 'about-art')
about_label = by_id('viewport-2-a-about-text'); about_label.set('class','section-label')
about_heading = by_id('viewport-2-a-about-heading')
about_p1 = by_id('viewport-2-a-about-paragraph')
about_p2 = by_id('viewport-2-a-about-paragraph-2')
focus = by_id('viewport-2-a-about-focus-text-2')
stack = by_id('viewport-2-a-about-stack-text-2')
about_copy=node('div','about-copy')
for el in [about_label,about_heading,about_p1,about_p2]: about_copy.append(detach(el))
learning=node('div','about-summary')
for caption, value in [('Learning focus',words(focus)),('Exploring',words(stack))]:
    row=node('div','summary-row'); key=etree.SubElement(row,'span'); key.text=caption
    text=etree.SubElement(row,'p'); text.text=value; learning.append(row)
about_copy.append(learning)
for child in list(about): about.remove(child)
about.extend([about_copy,about_art])

skills = reclass(skills,'skills section','section')
skill_label=by_id('viewport-2-a-skills-source-row-1-text'); skill_label.set('class','section-label')
skill_label.tag='h2'; label(skill_label,'Skills & technologies')
skill_grid=node('div','skills-grid')
for key in ['programming','web','ai','automation','tools','databases']:
    card=by_id('viewport-2-a-skills-'+key); card=reclass(card,'skill-card','article')
    icon=by_id('viewport-2-a-skills-'+key+'-icon')
    icon_box=node('div','skill-icon'); icon_box.append(detach(icon))
    card_heading=by_id('viewport-2-a-skills-'+key+'-heading'); card_heading.tag='h3'
    card_paragraph=by_id('viewport-2-a-skills-'+key+'-paragraph')
    badges=card.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," badge ")]')
    badge_row=node('div','badge-row')
    for badge in badges: badge_row.append(detach(badge))
    for child in list(card): card.remove(child)
    card.extend([icon_box,detach(card_heading),detach(card_paragraph),badge_row])
    skill_grid.append(card)
for child in list(skills): skills.remove(child)
skills.append(detach(skill_label))
skills_note=etree.SubElement(skills,'p',{'class':'section-description'}); skills_note.text='A learning roadmap across programming, practical AI, and modern engineering.'
skills.append(skill_grid)

projects=reclass(projects,'projects section','section')
project_label=by_id('viewport-3-b-projects-source-row-1-text'); project_label.set('class','section-label'); label(project_label,'Featured projects · concepts')
project_heading=by_id('viewport-3-b-projects-heading')
project_text=by_id('viewport-3-b-projects-text'); label(project_text,'Illustrative project ideas exploring AI, web development and useful automation.')
project_grid=node('div','projects-grid')
for index,key in enumerate(['task','assistant','service','toolkit']):
    prefix='viewport-3-b-projects-'+key
    card=reclass(by_id(prefix),'project-card','article'); card.set('data-project',str(index))
    illustration=by_id(prefix+'-illustration'); illustration.set('class','project-illustration')
    category=by_id(prefix+'-badge'); category.set('class','badge category')
    card_heading=by_id(prefix+'-heading'); card_heading.tag='h3'
    card_text=by_id(prefix+'-text'); card_text.set('class','project-description')
    badges=card.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," badge ")]')
    badge_row=node('div','badge-row project-stack')
    for badge in badges:
        if badge is not category: badge_row.append(detach(badge))
    actions=node('div','project-actions')
    for kind in ['github','demo']:
        action=by_id(prefix+'-'+kind+'-button'); action.set('class','secondary-button project-action')
        action.set('data-action',kind); action.set('data-project',str(index)); label(action,'GitHub ↗' if kind=='github' else 'Demo ↗')
        action.attrib.pop('style',None)
        actions.append(detach(action))
    for child in list(card): card.remove(child)
    card.extend([detach(illustration),detach(category),detach(card_heading),detach(card_text),badge_row,actions])
    project_grid.append(card)
for child in list(projects): projects.remove(child)
projects.extend([detach(project_label),detach(project_heading),detach(project_text),project_grid])

journey=reclass(journey,'journey','section')
journey_heading=by_id('viewport-3-b-journey-heading')
journey_label=by_id('viewport-3-b-journey-text'); journey_label.set('class','section-label')
journey_intro=by_id('viewport-3-b-journey-text-2')
timeline=node('ol','timeline')
for key in ['foundations','projects','ai','growing']:
    candidates=journey.xpath('.//*[contains(@id,"-'+key+'-")]')
    headings=[x for x in candidates if x.tag in ['h2','h3']]
    paragraphs=[x for x in candidates if x.tag=='p' and 'text' in x.get('id','')]
    icons=[x for x in candidates if x.get('class','')=='icon']
    if not headings:
        continue
    entry=node('li','timeline-entry')
    if icons: entry.append(detach(icons[0]))
    h=headings[0]; h.tag='h3'; entry.append(detach(h))
    if paragraphs:
        p=paragraphs[-1]
        if key=='growing': label(p,'Aiming to contribute, collaborate and build useful software.')
        entry.append(detach(p))
    timeline.append(entry)
for child in list(journey): journey.remove(child)
journey.extend([detach(journey_label),detach(journey_heading),detach(journey_intro),timeline])

contact=reclass(contact,'contact','section')
contact_label=by_id('viewport-3-b-collaboration-source-row-1-text'); contact_label.set('class','section-label')
contact_heading=by_id('viewport-3-b-collaboration-heading')
contact_text=by_id('viewport-3-b-collaboration-source-row-3-text')
contact_actions=node('div','contact-actions')
email=node('button','secondary-button',type='button',id='contact-email',**{'data-action':'contact'}); email.text='Email · coming soon'
gh=node('a','secondary-button',href='https://github.com/Nadeeshan-n',target='_blank',rel='noopener noreferrer'); gh.text='GitHub ↗'
li=node('button','secondary-button',type='button',**{'data-action':'linkedin'}); li.text='LinkedIn'
contact_actions.extend([email,gh,li])
for child in list(contact): contact.remove(child)
contact.extend([detach(contact_label),detach(contact_heading),detach(contact_text),contact_actions])
note=etree.SubElement(contact,'p',{'class':'contact-note'}); note.text='Email and LinkedIn are placeholders in this portfolio preview.'

footer=reclass(footer,'site-footer','footer')
for child in list(footer): footer.remove(child)
footer_brand=etree.fromstring(etree.tostring(brand_link)); footer.append(footer_brand)
copyright=etree.SubElement(footer,'p'); copyright.text='© 2026 Nadeeshan'
footer_contact=node('p','footer-contact')
footer_email=etree.SubElement(footer_contact,'span',{'class':'footer-contact-value'}); footer_email.text='nadeeshannadeera14@gmail.com'; footer_email.tail=' '
footer_separator=etree.SubElement(footer_contact,'span',{'class':'footer-contact-separator','aria-hidden':'true'}); footer_separator.text='|'; footer_separator.tail=' '
footer_phone=etree.SubElement(footer_contact,'span',{'class':'footer-contact-value'}); footer_phone.text='+94 70 348 1683'
footer.append(footer_contact)

for child in list(body): body.remove(child)
skip=etree.SubElement(body,'a',{'class':'skip-link','href':'#home'}); skip.text='Skip to content'
body.append(nav)
main=node('main','page',id='page-flow')
for id,component in [('home',hero),('about',about),('skills',skills),('projects',projects)]:
    component.set('data-section',id)
    anchor=node('div','section-anchor',id=id); component.insert(0,anchor)
    main.append(component)
    if id=='home': main.append(hero_footer)
closing=node('div','closing-grid section')
for id,component in [('experience',journey),('contact',contact)]:
    component.set('data-section',id); component.insert(0,node('div','section-anchor',id=id)); closing.append(component)
main.append(closing)
body.extend([main,footer])
dialog=node('dialog','portfolio-dialog',id='portfolio-dialog',**{'aria-labelledby':'dialog-title'})
close=node('button','dialog-close',type='button',**{'aria-label':'Close dialog'}); close.text='×'
dialog.append(close)
dialog.append(node('div','dialog-content',id='dialog-content'))
body.append(dialog)
etree.SubElement(body,'script',src='scroll-progress.js',defer='')
script=etree.SubElement(body,'script',src='portfolio.js',defer='')

# Native semantics and whitespace are retained, with visual properties owned by
# the shared token stylesheet rather than the converter's Inter declarations.
for element in document.xpath('//*[@style]'):
    style=element.get('style','')
    style=re.sub(r"font-family:[^;]+;?",'',style)
    style=re.sub(r"(?:font-size|line-height|color|font-weight|white-space|overflow-wrap|overflow|padding|z-index):[^;]+;?",'',style)
    element.set('style',style)
for image in document.xpath('//img'):
    if image.get('class') not in ['hero-art','about-art']:
        image.set('alt','')
for icon in document.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," icon ")]'):
    icon.set('aria-hidden','true'); icon.attrib.pop('role',None); icon.attrib.pop('aria-label',None)

(dist/'index.html').write_text('<!doctype html>\n'+html.tostring(document,encoding='unicode',method='html'))
print(f'Integrated {len(cache)} retained artwork assets; wrote {dist / "index.html"}.')
