#!/usr/bin/env python3
"""Generate the per-post blog routes from the editable post records.

How the Blog page works:
  * The collection page (dist/blog/index.html) is rendered live in the
    visitor's browser: blog.js fetches dist/blog/blog.json and builds one
    card per entry, so adding an object to blog.json is enough for the card
    (and its Read article button, which points to posts/<slug>/).
  * This script generates the matching article pages, one folder per slug:
    dist/blog/posts/<slug>/index.html, using the established template
    shared by the other posts.

Workflow when adding a post: add the object to dist/blog/blog.json
(including the article body as the "content" field, written as HTML),
then run `python3 scripts/build-blog.py` from the repository root and
push the new dist/blog/posts/<slug>/ folder.

The "content" field is the author's own HTML and is inserted as-is;
every other field is escaped.
"""
from datetime import datetime
from html import escape
from pathlib import Path
import json
import re
import sys
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "blog"
POSTS = json.loads((OUT / "blog.json").read_text())


def e(value):
    return escape(str(value), quote=True)


def page(post):
    title = e(post["title"])
    date_str = datetime.strptime(post["date"], "%Y-%m-%d").strftime("%b %d, %Y")
    hero = post.get("hero") or post["image"]
    hero_src = "../../.." + hero if hero.startswith("/") else hero
    hero_alt = e(post.get("heroAlt") or "")
    return (
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        f"<title>{title} - Nadeeshan</title>"
        '<link rel="stylesheet" href="../../../portfolio.css">'
        '<link rel="stylesheet" href="../../blog.css">'
        '<link rel="stylesheet" href="../../../footer-signature.css">'
        '<script src="../../../scroll-progress.js" defer></script>'
        '<script src="../../blog.js" defer></script></head>'
        '<body class="blog-page"><a class="skip-link" href="#article-main">Skip to content</a>'
        '<header class="site-header"><a href="../../../" class="brand" aria-label="Nadeeshan Nadeera, home">'
        "<span>Nadeeshan Nadeera</span></a>"
        '<nav id="article-navigation" aria-label="Main navigation" class="nav-links">'
        '<a class="nav-link" href="../../../">Home</a>'
        '<a class="nav-link" href="../../../education/">Education</a>'
        '<a class="nav-link" href="../../../projects/">Projects</a>'
        '<a class="nav-link" href="../../">Blog</a></nav>'
        '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="article-navigation" '
        'aria-label="Open navigation menu" hidden>Menu</button></header>'
        '<main id="article-main" class="article-shell"><header class="article-header">'
        f'<p class="article-category">{e(post["category"])}</p>'
        f"<h1>{title}</h1>"
        f'<p class="article-excerpt">{e(post["excerpt"])}</p>'
        f'<p class="article-meta"><time datetime="{e(post["date"])}">{date_str}</time> · {e(post["readTime"])}</p>'
        "</header>"
        f'<figure class="article-hero"><img src="{e(hero_src)}" alt="{hero_alt}"></figure>'
        f'<article class="article-content">{post["content"]}'
        '<a class="article-back" href="../../">← Back to Blog</a></article></main>'
        '<footer class="site-footer"><a href="../../../" class="brand" aria-label="Nadeeshan Nadeera, home">'
        "<span>Nadeeshan Nadeera</span></a>"
        "<p>© 2026 Nadeeshan</p>"
        '<p class="footer-contact"><span>nadeeshannadeera14@gmail.com</span>'
        '<span aria-hidden="true">|</span><span>+94 70 348 1683</span></p>'
        "</footer></body></html>\n"
    )


def _public_url(value, field, slug):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{slug}: '{field}' must be a non-empty URL string.")
    parsed = urlparse(value)
    if parsed.username or parsed.password:
        raise ValueError(f"{slug}: '{field}' URL must not contain credentials.")
    is_https = parsed.scheme == "https" and parsed.netloc
    is_root_relative = (
        value.startswith("/") and not value.startswith("//") and not parsed.scheme and not parsed.netloc
    )
    if not (is_https or is_root_relative):
        raise ValueError(f"{slug}: '{field}' must be a public HTTPS URL or a root-relative path.")


def validate(post):
    slug = post.get("slug", "?")
    for field in ("title", "excerpt", "category", "readTime", "content"):
        if not isinstance(post.get(field), str) or not post[field].strip():
            raise ValueError(f"{slug}: '{field}' must be a non-empty string.")
    try:
        datetime.strptime(post.get("date", ""), "%Y-%m-%d")
    except (ValueError, TypeError):
        raise ValueError(f"{slug}: 'date' must be YYYY-MM-DD.")
    _public_url(post.get("image"), "image", slug)
    if post.get("hero") is not None:
        _public_url(post["hero"], "hero", slug)
    if post.get("heroAlt") is not None and not isinstance(post["heroAlt"], str):
        raise ValueError(f"{slug}: 'heroAlt' must be a string.")
    if "featured" in post and not isinstance(post["featured"], bool):
        raise ValueError(f"{slug}: 'featured' must be true or false.")


def main():
    if not isinstance(POSTS, list) or not POSTS:
        raise ValueError("blog.json must be a non-empty array of post records.")
    slugs = [p["slug"] for p in POSTS]
    if len(set(slugs)) != len(slugs) or any(
        not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) for slug in slugs
    ):
        raise ValueError("Post slugs must be unique, safe route names.")
    for post in POSTS:
        validate(post)
    for post in POSTS:
        folder = OUT / "posts" / post["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "index.html").write_text(page(post))
    print(f"Generated {len(POSTS)} blog article routes from blog.json.")


if __name__ == "__main__":
    sys.exit(main())
