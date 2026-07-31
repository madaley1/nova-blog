import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { dirname, extname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import showdown from 'showdown';
import matter from 'gray-matter';

import {
  esc,
  joinUrl,
  postList,
  renderAtomFeed,
  renderOgMeta,
  renderSitemap,
  renderTemplate,
} from './src/templates.mjs';
import { site } from './src/site.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC = join(__dirname, 'src');
const POSTS_DIR = join(__dirname, 'posts');
const STYLES_DIR = join(__dirname, 'styles');
const DIST = join(__dirname, 'dist');

const converter = new showdown.Converter();

const readLayout = (name) => readFileSync(join(SRC, 'layouts', name), 'utf8');
const readPage = (name) => readFileSync(join(SRC, 'pages', name), 'utf8');

const baseLayout = readLayout('base.html');
const postLayout = readLayout('post.html');

const capitalizeFirstLetter = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const writeFile = (relPath, contents) => {
  const target = join(DIST, relPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
};

// Obsidian-style image wikilinks: ![[path/img.png]] -> ![](path/img.png).
// Applied to the markdown *before* conversion so we don't regex over HTML.
const rewriteWikilinkImages = (md) =>
  md.replace(/!\[\[([^\]]+)\]\]/g, (_m, uri) => `![](${uri.trim()})`);

const normalizeDate = (value, fallback) => {
  if (!value) return fallback;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const copyAssets = () => {
  cpSync(join(__dirname, 'assets'), join(DIST, 'assets'), { recursive: true });
};

const collectPosts = () => {
  if (!existsSync(POSTS_DIR)) return [];
  const posts = [];
  for (const dateEntry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (!dateEntry.isDirectory()) continue;
    const dateDir = join(POSTS_DIR, dateEntry.name);
    for (const fileEntry of readdirSync(dateDir, { withFileTypes: true })) {
      if (!fileEntry.isFile() || extname(fileEntry.name) !== '.md') continue;
      const slug = basename(fileEntry.name, '.md');
      const mdPath = join(dateDir, fileEntry.name);
      const parsed = matter(readFileSync(mdPath, 'utf8'));
      const fm = parsed.data || {};

      if (fm.draft === true) continue;

      const date = normalizeDate(fm.date, dateEntry.name);
      const url = `/posts/${dateEntry.name}/${slug}.html`;

      posts.push({
        slug,
        date,
        folderDate: dateEntry.name,
        title: fm.title || capitalizeFirstLetter(slug),
        description: fm.description || '',
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        updated: fm.updated ? normalizeDate(fm.updated) : undefined,
        body: parsed.content,
        url,
        absoluteUrl: joinUrl(site.url, url),
      });
    }
  }
  posts.sort((a, b) => (b.date === a.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
  return posts;
};

const markdownToHtml = (md) => converter.makeHtml(rewriteWikilinkImages(md));

const renderBase = ({
  title,
  description = site.description,
  canonicalPath,
  ogType = 'website',
  extraHead = '',
  content,
}) => {
  const canonicalUrl = joinUrl(site.url, canonicalPath || '/');
  const ogMeta = renderOgMeta({
    title,
    description,
    canonicalUrl,
    type: ogType,
    siteTitle: site.title,
  });
  return renderTemplate(baseLayout, {
    title: esc(title),
    description: esc(description),
    canonicalUrl: esc(canonicalUrl),
    siteTitle: esc(site.title),
    ogMeta,
    extraHead,
    content,
  });
};

const generatePostPages = (posts) => {
  for (const post of posts) {
    const content = renderTemplate(postLayout, {
      title: esc(post.title),
      content: markdownToHtml(post.body),
    });
    const html = renderBase({
      title: `${post.title} | ${site.title}`,
      description: post.description || `${post.title} — posted ${post.date}`,
      canonicalPath: post.url,
      ogType: 'article',
      extraHead: '<link rel="stylesheet" href="/styles/posts.css"/>',
      content,
    });
    writeFile(`posts/${post.folderDate}/${post.slug}.html`, html);
  }
};

const generatePostsIndex = (posts) => {
  const content = renderTemplate(readPage('posts.html'), {
    postList: postList(posts),
  });
  writeFile(
    'posts/index.html',
    renderBase({
      title: `Posts | ${site.title}`,
      description: `All posts on ${site.title}.`,
      canonicalPath: '/posts/',
      content,
    })
  );
};

const generateHomePage = (posts) => {
  const content = renderTemplate(readPage('home.html'), {
    postList: postList(posts.slice(0, 5)),
  });
  writeFile(
    'index.html',
    renderBase({
      title: site.title,
      description: site.description,
      canonicalPath: '/',
      content,
    })
  );
};

const generateAboutPage = () => {
  const content = readPage('about.html');
  writeFile(
    'about/index.html',
    renderBase({
      title: `About | ${site.title}`,
      description: `About ${site.title}.`,
      canonicalPath: '/about/',
      content,
    })
  );
};

const generate404 = () => {
  const content = readPage('404.html');
  writeFile(
    '404.html',
    renderBase({
      title: `Not Found | ${site.title}`,
      description: 'Page not found.',
      canonicalPath: '/404.html',
      content,
    })
  );
};

const generateFeed = (posts) => {
  writeFile('feed.xml', renderAtomFeed(posts, site));
};

const generateSitemapFile = (posts) => {
  const entries = [
    { url: '/' },
    { url: '/about/' },
    { url: '/posts/' },
    ...posts.map((p) => ({ url: p.url, lastmod: p.updated || p.date })),
  ];
  writeFile('sitemap.xml', renderSitemap(entries, site));
};

const copyStatic = () => {
  if (existsSync(STYLES_DIR)) {
    cpSync(STYLES_DIR, join(DIST, 'styles'), { recursive: true });
  }
  const favicon = join(__dirname, 'favicon.png');
  if (existsSync(favicon)) {
    cpSync(favicon, join(DIST, 'favicon.png'));
  }
};

const main = () => {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  const posts = collectPosts();

  generatePostPages(posts);
  generatePostsIndex(posts);
  generateHomePage(posts);
  generateAboutPage();
  generate404();
  generateFeed(posts);
  generateSitemapFile(posts);
  copyStatic();
  copyAssets();

  console.log(`Built ${posts.length} post(s) to ${DIST}`);
};

main();
