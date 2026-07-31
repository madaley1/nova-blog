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

import { esc, postLink, postList, renderTemplate } from './src/templates.mjs';

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

const renderBase = ({ title, description = '', extraHead = '', content }) =>
  renderTemplate(baseLayout, {
    title: esc(title),
    description: esc(description),
    extraHead,
    content,
  });

// Obsidian-style image wikilinks: ![[path/img.png]] -> <img src="path/img.png"/>
// Applied to the markdown *before* conversion so we don't regex over HTML.
const rewriteWikilinkImages = (md) =>
  md.replace(/!\[\[([^\]]+)\]\]/g, (_m, uri) => `![](${uri.trim()})`);

const markdownToHtml = (mdPath) => {
  const raw = readFileSync(mdPath, 'utf8');
  return converter.makeHtml(rewriteWikilinkImages(raw));
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
      posts.push({
        slug,
        date: dateEntry.name,
        title: capitalizeFirstLetter(slug),
        mdPath: join(dateDir, fileEntry.name),
        url: `/posts/${dateEntry.name}/${slug}.html`,
      });
    }
  }
  // Newest first, breaking ties by slug for determinism.
  posts.sort((a, b) => (b.date === a.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
  return posts;
};

const generatePostPages = (posts) => {
  for (const post of posts) {
    const content = renderTemplate(postLayout, {
      title: esc(post.title),
      content: markdownToHtml(post.mdPath),
    });
    const html = renderBase({
      title: `${post.title} | Nova Blog`,
      description: `${post.title} — posted ${post.date}`,
      extraHead: '<link rel="stylesheet" href="/styles/posts.css"/>',
      content,
    });
    writeFile(`posts/${post.date}/${post.slug}.html`, html);
  }
};

const generatePostsIndex = (posts) => {
  const content = renderTemplate(readPage('posts.html'), {
    postList: postList(posts),
  });
  writeFile(
    'posts/index.html',
    renderBase({ title: 'Posts | Nova Blog', content })
  );
};

const generateHomePage = (posts) => {
  const content = renderTemplate(readPage('home.html'), {
    postList: postList(posts.slice(0, 5)),
  });
  writeFile(
    'index.html',
    renderBase({ title: 'Nova Blog', content })
  );
};

const generateAboutPage = () => {
  const content = readPage('about.html');
  writeFile(
    'about/index.html',
    renderBase({ title: 'About | Nova Blog', content })
  );
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
  copyStatic();

  console.log(`Built ${posts.length} post(s) to ${DIST}`);
};

main();
