# shirley-shanshanliu.github.io

Academic website of **Shanshan (Shirley) Liu, Ph.D.**, Schmidt AI in Science Postdoctoral Fellow at the
Michigan Institute for Data and AI in Society (MIDAS), University of Michigan.

It is a small, dependency-free [Jekyll](https://jekyllrb.com/) site. **GitHub Pages builds it automatically**
from this branch, so there is nothing to compile or install to publish a change. It uses no theme, no
plugins, and no JavaScript frameworks.

## Everyday edits (no coding needed)

Most content lives in plain YAML files in `_data/`. You can edit them directly on github.com (pencil icon →
"Commit changes"), and the site rebuilds in about a minute.

| To change… | Edit | Notes |
|---|---|---|
| Add or edit a paper | `_data/publications.yml` | Copy an existing entry. Put a `*` after the corresponding author's name. Set `selected: true` to feature it on the home page (keep it to four). |
| Home-page "Latest activity" | `_data/news.yml` | Newest first. `kind` is one of `paper`, `talk`, `teaching`, `role`, `award`. |
| Appointments, education, awards, talks, service | `_data/cv.yml` | Feeds the CV page and the honors on the home page. |
| Research themes and future directions | `_data/research.yml` | Feeds the Research page and the "research line" map on the home page. |
| Email, Scholar, ORCID, LinkedIn… | `_config.yml` → `links:` | Leave a value as `""` to hide that link everywhere. |

Page layouts and longer prose are in `index.html`, `research.html`, `publications.html`, `teaching.html`
and `cv.html`. Shared pieces (header, footer, the interactive diagram) are in `_includes/`. All styling is in
`assets/css/site.css`, and all behavior is in `assets/js/site.js`.

## Preview locally (optional)

```bash
gem install github-pages webrick
jekyll serve
```

Then open <http://localhost:4000>. Any static server pointed at a `jekyll build` output works too.

## About the CV

This site **does not publish a PDF CV**. The web CV (`cv.html`) contains the same academic content, and
visitors can print it or save it as a PDF from the browser.

To offer a downloadable CV again, add a **redacted** PDF (work email only) and set `cv_pdf: "/your-file.pdf"` in
`_config.yml`. The `.gitignore` blocks PDFs by default to prevent accidental uploads, so add the file
deliberately with `git add -f`.

## Privacy guardrails

This repository is public. Do not commit application materials (research or teaching statements, full
CVs with personal contact details), unpublished manuscripts, or reviewer correspondence. The
`.gitignore` blocks common file types for these, but it cannot block uploads made through the
GitHub web interface. Please check before uploading.

## Credits

- Typefaces: [Newsreader](https://github.com/productiontype/Newsreader) and
  [Overpass / Overpass Mono](https://github.com/RedHatOfficial/Overpass) (SIL Open Font License, self-hosted).
  Overpass is inspired by Highway Gothic, the typeface of U.S. highway signs.
- Diagrams and icons are hand-drawn SVG made for this site.
