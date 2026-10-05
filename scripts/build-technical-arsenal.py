"""Build Technical Arsenal from checked-in published logo assets.

No network calls or invented geometry. Run:
    python3 scripts/build-technical-arsenal.py
"""
from copy import deepcopy
from hashlib import sha256
from html import escape
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "design/technology-logos/original"
DEST = ROOT / "dist/assets/technologies"
SVG = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG)
ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
ITEMS = json.loads((ROOT / "scripts/technology-logo-sources.json").read_text())
JADE = "#0E8F78"

def tag(e):
    return e.tag.rsplit("}", 1)[-1] if isinstance(e.tag, str) else ""

def parse(path):
    return ET.parse(path, parser=ET.XMLParser(target=ET.TreeBuilder(insert_comments=True))).getroot()

def geometry(root):
    """Record drawing instructions, ignoring paint and metadata."""
    attrs = ("d", "points", "x", "y", "x1", "y1", "x2", "y2", "width", "height",
             "cx", "cy", "r", "rx", "ry", "transform", "fill-rule", "clip-rule",
             "clip-path", "stroke-width", "stroke-miterlimit")
    return [(tag(e), tuple((k, e.get(k)) for k in attrs if e.get(k) is not None))
            for e in root.iter() if tag(e) in
            ("path", "polygon", "polyline", "circle", "ellipse", "rect", "g", "use")]

def make_logo(item):
    raw = SOURCE / item["original"]
    if sha256(raw.read_bytes()).hexdigest() != item["sha256"]:
        raise ValueError("Original checksum changed: " + item["name"])
    original = parse(raw)
    slug = item["slug"]
    if slug == "docker":
        # Serve the official mark byte-for-byte in its approved ocean blue.
        return raw.read_bytes()
    if slug in ("python", "csharp"):
        # Preserve published logo contours. The Python asset's shadow and
        # C# training badge frame/filters are outside the logo itself.
        logo = ET.Element("{" + SVG + "}svg", {"viewBox": item["viewBox"]})
        chosen = [e for e in original.iter() if tag(e) == "path" and
                  ((slug == "python" and e.get("id") in ("path1948", "path1950")) or
                   (slug == "csharp" and e.get("d", "").startswith(("M27.5913", "M58.7957"))))]
        if len(chosen) != 2:
            raise ValueError("Published contours not found: " + slug)
        for index, element in enumerate(chosen):
            e = deepcopy(element)
            e.attrib.pop("style", None)
            e.set("fill", "#FFFFFF" if slug == "csharp" and index == 1 else JADE)
            logo.append(e)
        assert [e.get("d") for e in logo] == [e.get("d") for e in chosen]
    else:
        logo = deepcopy(original)
        before = geometry(logo)
        if slug == "java":
            # Fit the existing canvas's clip rectangle, without changing contours.
            logo.set("viewBox", item["viewBox"])
            logo.set("fill", JADE)
        if slug == "linux":
            logo.set("fill", JADE)
        for e in logo.iter():
            if not isinstance(e.tag, str):
                continue
            fill = e.get("fill")
            if slug == "javascript":
                if tag(e) == "rect":
                    e.set("fill", JADE)
                elif tag(e) == "path":
                    e.set("fill", "#FFFFFF")
            elif slug == "react":
                if fill and fill.lower() not in ("none", "#fff", "#ffffff", "white"):
                    e.set("fill", JADE)
            elif slug == "java":
                if fill and fill.lower() not in ("none", "#fff", "#ffffff", "white"):
                    e.set("fill", "#0B7563")
                if e.get("stroke", "").lower() == "#000000":
                    e.set("stroke", "#0B7563")
            elif slug in ("git", "c"):
                if fill and fill.lower() != "none":
                    e.set("fill", JADE)
            elif slug == "sql" and "style" in e.attrib:
                e.set("style", re.sub(r"fill:[^;]+", "fill:" + JADE, e.get("style")))
            elif slug == "html" and tag(e) in ("path", "polygon"):
                e.set("fill", "#FFFFFF" if (fill or "").lower() in ("#fff", "#ffffff", "#ebebeb") else JADE)
            elif slug == "css" and e.get("id") == "bg":
                e.set("fill", JADE)
        assert before == geometry(logo), "Logo geometry changed: " + slug
    title = ET.Element("{" + SVG + "}title")
    title.text = item["name"]
    desc = ET.Element("{" + SVG + "}desc")
    desc.text = item["credit"] + " Source: " + item["source"]
    logo.insert(0, desc)
    if not any(tag(e) == "title" for e in logo):
        logo.insert(0, title)
    return ET.tostring(logo, encoding="utf-8", xml_declaration=True)

def group(duplicate=False):
    attrs = ' aria-hidden="true" inert' if duplicate else ''
    rows = []
    for item in ITEMS:
        rows.append(
            '      <li class="arsenal-item">\n'
            '        <img class="arsenal-logo" src="assets/technologies/' +
            item["slug"] + '.svg" alt="" width="52" height="52" decoding="async" aria-hidden="true">\n'
            '        <span class="arsenal-name">' + escape(item["name"]) + '</span>\n'
            '      </li>')
    return '    <ul class="arsenal-group"' + attrs + '>\n' + "\n".join(rows) + '\n    </ul>'

DEST.mkdir(parents=True, exist_ok=True)
for item in ITEMS:
    (DEST / (item["slug"] + ".svg")).write_bytes(make_logo(item))
section = (
    '<section id="technical-arsenal" class="technical-arsenal section" aria-label="Technical Arsenal">\n'
    '  <!-- Sourced mark credits and licenses: assets/technologies/ATTRIBUTION.md -->\n'
    '  <div class="arsenal-window">\n'
    '    <div class="arsenal-track">\n' +
    group() + '\n' + group(True) + '\n'
    '    </div>\n'
    '  </div>\n'
    '</section>')
path = ROOT / "dist/index.html"
html = path.read_text()
pattern = r'<section id="technical-arsenal"[\s\S]*?</section>'
if len(re.findall(pattern, html)) != 1:
    raise ValueError("Expected one existing Technical Arsenal section")
path.write_text(re.sub(pattern, lambda _: section, html))
print("Built 12 sourced SVGs and two matching non-interactive ticker groups.")
