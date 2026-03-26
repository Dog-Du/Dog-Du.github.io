# Dog-Du.github.io

Personal Hugo blog repository for `https://dog-du.github.io/`.

This repository contains:
- Hugo content and configuration
- GitHub Actions deployment workflow for GitHub Pages
- Giscus discussion mapping for comments
- A local Rust CLI tool for converting post images to WebP

---

## Repository Structure

```text
.
├── .github/workflows/hugo.yaml      # GitHub Pages deployment workflow
├── config/                          # Hugo configuration
├── content/posts/                   # Blog posts (Markdown)
├── layouts/partials/comments.html   # Giscus comment integration
├── static/img/                      # Local post images
├── themes/blowfish/                 # Hugo theme
└── tools/postimg/                   # Rust CLI for post image WebP conversion
```

---

## Source of Truth

- **Site generator**: Hugo
- **Deployment path**: GitHub Actions (`Deploy Hugo site`)
- **Comments system**: Giscus
- **Preferred stable comment binding**: `commentDiscussionNumber`

Do not rely on GitHub Pages legacy Jekyll behavior.
The intended deployment path is the Hugo workflow in `.github/workflows/hugo.yaml`.

---

## Local Development

### Requirements

- Hugo `0.145.0` extended
- Rust + Cargo (only needed if using `tools/postimg`)

### Local build

```bash
hugo --gc --minify
```

### Local preview

```bash
hugo server
```

---

## Writing a New Post

### Minimal workflow

1. Create a Markdown file under `content/posts/`
2. Add front matter
3. Put local images under `static/img/<post-related-folder>/`
4. Reference local images from the post
5. Run the WebP conversion tool
6. Build locally with Hugo
7. Commit and push

### Recommended front matter fields

Example:

```yaml
---
title: "My New Post"
date: 2026-03-26T12:00:00+08:00
lastmod: 2026-03-26T12:00:00+08:00
draft: false
slug: my-new-post
summary: Short summary here
---
```

### Comment binding recommendation

If you care about comment stability, add:

```yaml
commentDiscussionNumber: <discussion-number>
```

Why:
- `commentDiscussionNumber` is stable
- title-based / term-based discussion lookup is fragile
- renaming a post can otherwise split comments across multiple discussions

### Practical recommendation

- If the post is temporary and you do not care about long-term comment history, fallback mapping is acceptable
- If the post matters, create the GitHub discussion and set `commentDiscussionNumber`

---

## Image Workflow

### Goal

Convert local post images to `.webp` and rewrite Markdown references, while keeping source images until manually confirmed safe to delete.

### Tool

Rust CLI:

```text
tools/postimg/
```

### Build / run

From repo root:

```bash
cargo run --manifest-path tools/postimg/Cargo.toml -- --dry-run content/posts/your-post.md
```

### Convert one post and rewrite references

```bash
cargo run --manifest-path tools/postimg/Cargo.toml -- --rewrite content/posts/your-post.md
```

### Convert, rewrite, and delete originals

Use only after verifying generated WebP output:

```bash
cargo run --manifest-path tools/postimg/Cargo.toml -- --rewrite --delete-original content/posts/your-post.md
```

### Safety behavior

The tool:
- scans one Markdown file at a time
- supports Markdown image syntax and `<img src="...">`
- handles local `/img/...` paths and relative paths
- skips remote URLs
- skips already-valid existing `.webp` files
- uses content-based image format guessing instead of trusting only file extensions
- writes WebP files atomically to avoid leaving poisoned empty outputs on failed encode
- skips unsupported images safely without rewriting those references
- requires `--rewrite` when `--delete-original` is used

### Current known limitation

Some very large or unusual images may be unsupported by the current Rust WebP encoder.
In that case the tool will:
- keep the original image file
- keep the original Markdown reference
- continue processing the rest of the post

This is intentional.
Do not force-rewrite unsupported images by hand unless you also confirm the generated file is valid.

---

## Existing Blog Bulk Migration Status

The repository has already been bulk-migrated for most locally referenced images.
Remaining non-WebP references are expected only when:
- the image is remote
- or the image is unsupported by the current encoder

---

## Deployment

### Normal deployment flow

1. Make changes
2. Build locally:

```bash
hugo --gc --minify
```

3. Push to `main`
4. GitHub Actions runs `.github/workflows/hugo.yaml`
5. Site is deployed to GitHub Pages

### Deployment workflow file

```text
.github/workflows/hugo.yaml
```

### Important Pages setting

GitHub repository Pages settings should use:
- **Source: GitHub Actions**

Do not switch back to legacy source modes.
That can reintroduce Jekyll-based failures and deployment conflicts.

---

## Comments / Giscus

Comment integration lives in:

```text
layouts/partials/comments.html
```

Behavior:
- if `commentDiscussionNumber` exists, comments bind by discussion number
- otherwise fallback mapping is used

### Preferred approach

For stable historical comments, use:

```yaml
commentDiscussionNumber: <number>
```

---

## AI Agent Notes

This section is intentionally written for agents.

### What the repo is

- Hugo static blog
- deployed through GitHub Actions
- uses Giscus for comments
- local images usually live under `static/img/`
- post files live under `content/posts/`

### What an agent should prefer

1. **Do not introduce Jekyll-based deployment logic**
2. **Do not remove source images automatically unless explicitly asked**
3. **Prefer `commentDiscussionNumber` over title-based mapping**
4. **Use `tools/postimg` for post image conversion instead of ad-hoc scripts**
5. **Validate with `cargo test` and `hugo --gc --minify` before shipping image-tool or content-flow changes**

### If adding a new post

Agent checklist:

1. Create or edit Markdown under `content/posts/`
2. Place local images under `static/img/<folder>/`
3. Run:

```bash
cargo run --manifest-path tools/postimg/Cargo.toml -- --rewrite content/posts/<post>.md
```

4. Build with:

```bash
hugo --gc --minify
```

5. If comments matter, add `commentDiscussionNumber`
6. Push and verify the GitHub Actions deployment

### If converting existing images

Use the tool per post, not blind filesystem rewrites.
That keeps scope auditable and avoids damaging unrelated files.

---

## Verification Checklist

Before pushing substantial changes:

### Content / image changes

```bash
cargo test --manifest-path tools/postimg/Cargo.toml
hugo --gc --minify
```

### Deployment changes

After push, verify:
- latest `Deploy Hugo site` workflow succeeded
- target pages load online
- comments still load when relevant

---

## Do Not Do These

- Do not delete original images before validating generated `.webp`
- Do not assume file extensions reflect real image format
- Do not assume every image can be encoded to WebP by the current Rust encoder
- Do not bind important Giscus comments only by title/term if the post may be renamed
- Do not rely on GitHub Pages legacy Jekyll builds
