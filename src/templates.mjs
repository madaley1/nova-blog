// Rendering helpers for Nova Blog's static generator.
//
// Templates are plain HTML files with `{{ token }}` placeholders. Small,
// data-driven fragments (like a single post link, an OpenGraph meta block, or
// an Atom entry) live here as functions so they can be composed and tested
// without a template engine.

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);

export const renderTemplate = (template, values) =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : ''
  );

export const postLink = ({ url, title, date }) => `
  <div class="postLink">
    <a href="${esc(url)}">${esc(title)} | ${esc(date)}</a>
  </div>`;

export const postList = (posts) => posts.map(postLink).join('');

export const joinUrl = (base, path) => {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return b + p;
};

export const renderOgMeta = ({ title, description, canonicalUrl, type = 'website', siteTitle }) => `
    <meta property="og:title" content="${esc(title)}"/>
    <meta property="og:description" content="${esc(description)}"/>
    <meta property="og:url" content="${esc(canonicalUrl)}"/>
    <meta property="og:type" content="${esc(type)}"/>
    <meta property="og:site_name" content="${esc(siteTitle)}"/>
    <meta name="twitter:card" content="summary"/>
    <meta name="twitter:title" content="${esc(title)}"/>
    <meta name="twitter:description" content="${esc(description)}"/>`;

// Emit RFC 3339 timestamps for Atom. If only a date (YYYY-MM-DD) is provided,
// pin to midnight UTC to keep the feed deterministic.
const toRfc3339 = (value) => {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00Z`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const renderAtomEntry = (post, site) => {
  const url = joinUrl(site.url, post.url);
  const updated = toRfc3339(post.updated || post.date);
  const published = toRfc3339(post.date);
  return `
  <entry>
    <title>${esc(post.title)}</title>
    <link href="${esc(url)}"/>
    <id>${esc(url)}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>${esc(post.description || post.title)}</summary>
    <author><name>${esc(site.author)}</name></author>
  </entry>`;
};

export const renderAtomFeed = (posts, site) => {
  const feedUrl = joinUrl(site.url, '/feed.xml');
  const updated = posts.length
    ? toRfc3339(posts[0].updated || posts[0].date)
    : new Date().toISOString();
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${esc(site.language)}">
  <title>${esc(site.title)}</title>
  <subtitle>${esc(site.description)}</subtitle>
  <link href="${esc(site.url)}"/>
  <link rel="self" href="${esc(feedUrl)}"/>
  <id>${esc(site.url)}/</id>
  <updated>${updated}</updated>
  <author><name>${esc(site.author)}</name></author>${posts.map((p) => renderAtomEntry(p, site)).join('')}
</feed>
`;
};

// entries: [{ url: '/some/path', lastmod?: 'YYYY-MM-DD' | Date }]
export const renderSitemap = (entries, site) => {
  const urls = entries
    .map(({ url, lastmod }) => {
      const loc = joinUrl(site.url, url);
      const lm = lastmod
        ? `\n    <lastmod>${toRfc3339(lastmod).slice(0, 10)}</lastmod>`
        : '';
      return `  <url>\n    <loc>${esc(loc)}</loc>${lm}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};
