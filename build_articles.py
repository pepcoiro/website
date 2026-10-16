#!/usr/bin/env python3
"""Generate static article pages with Open Graph metadata from Markdown front matter."""
from html import escape
from pathlib import Path
from urllib.parse import quote
import re

ROOT = Path(__file__).resolve().parent
ARTICLES = ROOT / "articoli"
BASE_URL = "https://pepcoiro.github.io/website/"
TEMPLATE = ARTICLES / "template.html"


def parse_front_matter(text):
    title = None
    description = None
    body = text
    if text.startswith("---\n"):
        end = text.find("\n---", 4)
        if end != -1:
            header = text[4:end]
            body = text[end + 4:].lstrip("\n")
            for line in header.splitlines():
                match = re.match(r'^(title|description):\s*(.*?)\s*$', line)
                if match:
                    value = match.group(2)
                    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
                        value = value[1:-1]
                    if match.group(1) == "title":
                        title = value
                    else:
                        description = value
    return title, description, body


def generate_page(markdown_path):
    raw = markdown_path.read_text(encoding="utf-8")
    title, description, _ = parse_front_matter(raw)
    title = title or markdown_path.stem
    if not description:
        for paragraph in re.split(r"\n\s*\n", raw):
            paragraph = paragraph.strip()
            if paragraph and not paragraph.startswith("---") and not paragraph.startswith("#") and not paragraph.startswith("- "):
                description = re.sub(r"[*_`>#]", "", paragraph)
                break
    description = description or title
    escaped_title = escape(title, quote=True)
    escaped_description = escape(description, quote=True)
    page_name = markdown_path.stem + ".html"
    page_url = BASE_URL + "articoli/" + quote(page_name)
    md_url = quote(markdown_path.name)
    template = TEMPLATE.read_text(encoding="utf-8")
    head = f'''  <meta name="description" content="{escaped_description}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{escaped_title}">
  <meta property="og:description" content="{escaped_description}">
  <meta property="og:url" content="{escape(page_url, quote=True)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{escaped_title}">
  <meta name="twitter:description" content="{escaped_description}">
  <title>{escaped_title} / Giuseppe Coiro</title>'''
    template = re.sub(r'  <title>.*?</title>', head, template, count=1, flags=re.S)
    template = template.replace('<article id="contenuto-articolo"></article>', f'<article id="contenuto-articolo" data-file="{md_url}"></article>')
    output_path = markdown_path.with_suffix(".html")
    output_path.write_text(template, encoding="utf-8")
    print(f"Generata: {output_path.relative_to(ROOT)}")


def main():
    for markdown_path in sorted(ARTICLES.glob("*.md")):
        if markdown_path.name.lower() == "readme.md":
            continue
        generate_page(markdown_path)


if __name__ == "__main__":
    main()
