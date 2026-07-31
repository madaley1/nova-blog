// Rendering helpers for Nova Blog's static generator.
//
// Templates are plain HTML files with `{{ token }}` placeholders. Small,
// data-driven fragments (like a single post link) live here as functions so
// they can be composed and tested without a template engine.

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
