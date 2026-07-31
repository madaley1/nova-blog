# Nova Blog

A static site blog platform which was inspired by [Bear Blog](https://bearblog.dev).

## About

I wanted a simple self-hosted blog platform to be hosted on GitHub Pages and that I could just push markdown files to for posting. No GUI needed, just add a file and push, then go to the site and see your post publicly.

## Deploying to GitHub Pages

Deployment is handled automatically by GitHub Actions on every push to `main`:

1. Fork/clone this repo into your own GitHub Pages repo.
2. In your repo settings, go to `Settings > Pages` and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow will build the site into `dist/` and deploy it.

No files are ever committed back to `main` — the built site is uploaded as a Pages artifact and served from there.

There is a `docker-compose.yml` file in this repo if you want to preview the built site locally — run `npm run generate` first, then `docker compose up`, and open <http://localhost:6606>. You can also just open `dist/index.html` directly in your browser.

## Configuring your site

Open `src/site.config.mjs` and set your site's title, description, canonical URL, and author. These values are used for the RSS feed, sitemap, OpenGraph tags, and canonical links.

```js
export const site = {
  title: 'Nova Blog',
  description: 'A minimal static blog.',
  url: 'https://yourname.github.io',
  author: 'Your Name',
  language: 'en',
};
```

> ⚠️ Set `url` to your real production URL before your first deploy. Otherwise the feed, sitemap, and OpenGraph tags will point at the placeholder `https://example.github.io`.

## Posting to your blog

The general workflow is as follows:
1. Write an MD file (optionally with YAML front-matter, see below).
2. Add to `posts/{date}` directory & push ( i.e. `posts/2024-01-01/blogPost.md` )
3. Push to `main` — the deploy workflow runs automatically and publishes your new post.
4. Visit the site and enjoy the blog!

If you want to preview locally first, run `npm run generate` and open `dist/index.html`.

### Front-matter (optional)

Each post can start with a YAML front-matter block. All fields are optional — posts without front-matter still build, using the folder name for the date and the filename for the title.

```markdown
---
title: Hello World
date: 2024-01-01
description: My first post on Nova Blog.
tags: [meta, intro]
draft: false
updated: 2024-01-05
---

Post body in markdown...
```

- **title** — human-readable post title. Falls back to the capitalized filename.
- **date** — publish date (`YYYY-MM-DD`). Falls back to the parent folder name.
- **description** — used for `<meta description>`, OpenGraph, and the RSS summary.
- **tags** — array of tag strings. Reserved for future tag pages; currently only stored on the post.
- **draft** — when `true`, the post is excluded from the build entirely (no HTML, not in listings, not in feed/sitemap).
- **updated** — last-updated date (`YYYY-MM-DD`). Used in the feed and sitemap `<lastmod>`.

### Generated files

Each build produces:

- `index.html`, `about/index.html`, `posts/index.html` — main pages.
- `posts/{date}/{slug}.html` — one file per non-draft post.
- `feed.xml` — Atom 1.0 feed autodiscovered by browsers and RSS readers.
- `sitemap.xml` — sitemap for search engines.
- `404.html` — served by GitHub Pages when a URL is missing.

## Common Issues

### The Pages deployment fails
Make sure your Pages source is set to **GitHub Actions** under `Settings > Pages`. The classic "deploy from branch" option is not compatible with this workflow.


## FAQ

### How do I add images to my posts?
Standard markdown works: `![alt text](path/to/img.png)`. For [Obsidian](https://obsidian.md/) compatibility, the wikilink syntax `![[path/to/img.png]]` is also supported — it gets rewritten to standard markdown before rendering, so it's stable across markdown parser versions.

### Are there plans to integrate more common blog features like search or tagging?
Tags can be declared on a post via front-matter, but there are no tag index pages, no search UI, and no plans to add them. This is built to be very opinionated in its simplicity, essentially stripping blogging down to its bare roots, which is your thoughts displayed on a site, with minor stylings. It's not built to be a super professional platform, but something someone who's never touched HTML/CSS/JS before can quickly spin up, host, and blast their thoughts into the universe.

## Contributing
While there aren't plans to continue development much further on this platform, feel free to add issues or PRs if you think there's something that would add value! Keep in mind though, at this time this is not meant to be the most valuable, feature-rich blogging platform, quite the opposite, it is meant to be something closer to [neofetch](https://github.com/dylanaraps/neofetch), it does its job simply without too much flair or too many options. If your idea is rejected, it does not mean it was bad, it likely was very good, but not right for the philosophy of this project. Feel free to Fork it and make updates how you see fit though, I'd love to see how other people think this should be!
