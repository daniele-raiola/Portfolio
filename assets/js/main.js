import { siteConfig } from './site-config.js';
import { siteStrings } from './site-strings.js';

const LINK_OUT_ICON =
  '<svg class="profile-link-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><line x1="7" y1="7" x2="17" y2="17"></line></svg>';

const THEME_COLORS = { light: '#ffffff', dark: '#18202e' };

// ---------------------------------------------------------------------------
// Escaping / sanitization helpers
// Exported so Vitest can cover them as pure functions.
// ---------------------------------------------------------------------------

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function safeText(value) {
  return value == null ? '' : escapeHtml(String(value));
}

// Inline Markdown subset for the About section. The whole string is escaped
// first so no raw markup from the data can ever reach the DOM; only the
// `**bold**` and `[text](url)` conventions we control are restored afterwards.
export function markdownInline(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, label, href) =>
        `<a href="${href}" target="_blank" rel="noopener noreferrer"><strong>${label}</strong></a>`
    )
    .replace(/\n/g, '<br>');
}

export function formatDetails(text) {
  if (!text || !text.trim()) return '';
  const delimiter = siteStrings.details?.itemDelimiter || '\u00b7';
  const items = text
    .split('\n')
    .flatMap((line) => line.split(delimiter).map((part) => part.trim()))
    .filter(Boolean);
  if (items.length > 1) {
    return `<ul class="details-list">${items.map((d) => `<li>${safeText(d)}</li>`).join('')}</ul>`;
  }
  return `<p>${safeText(items[0] || text.trim())}</p>`;
}

export function groupPublications(items) {
  const groups = {};
  (items || []).forEach((item) => {
    const key = item.type || 'Other';
    (groups[key] = groups[key] || []).push(item);
  });
  return groups;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function populateFields() {
  document.querySelectorAll('[data-field]').forEach((element) => {
    const key = element.dataset.field;
    if (key && siteConfig[key]) {
      element.textContent = siteConfig[key];
    }
  });

  document.querySelectorAll('[data-email-link]').forEach((emailLink) => {
    if (siteConfig.email) {
      emailLink.href = `mailto:${siteConfig.email}`;
      emailLink.textContent = siteConfig.email;
    }
  });
}

function renderTimeline(items, containerId, renderItem) {
  const container = document.querySelector(containerId);
  if (!container) return;
  container.innerHTML = (items || []).map(renderItem).join('');
}

function renderEducation() {
  renderTimeline(siteConfig.education, '#education-list', (item) => {
    const supervisor = item.supervisor
      ? `<p class="education-supervisor">${safeText(siteStrings.education.supervisor)}<strong>${safeText(
          item.supervisor
        )}</strong></p>`
      : '';
    return `
      <article class="timeline-item">
        <h3>${safeText(item.degree)}</h3>
        <p><strong>${safeText(item.school)}</strong> <span aria-hidden="true">\u00b7</span> ${safeText(item.period)}</p>
        ${supervisor}
        <details class="education-collapsible">
          <summary class="collapsible-summary">${safeText(siteStrings.education.abstractSummary)}</summary>
          <div class="collapsible-content">
            ${formatDetails(item.details)}
          </div>
        </details>
      </article>
    `;
  });
}

function renderExperience() {
  const other = (siteConfig.experience || []).filter((e) => e.category === 'other');

  renderTimeline(other, '#other-experience-list', (item) => {
    return `
      <article class="timeline-item">
        <h3>${safeText(item.role)}</h3>
        <p><strong>${safeText(item.organization)}</strong> <span aria-hidden="true">\u00b7</span> ${safeText(item.period)}</p>
        <p>${safeText(item.description)}</p>
      </article>
    `;
  });

  if (other.length === 0) {
    const section = document.querySelector('#other-experience');
    if (section) section.remove();
  }
}

function renderPublications() {
  const container = document.querySelector('#publications-list');
  if (!container) return;

  const items = siteConfig.publications || [];
  if (items.length === 0) {
    const section = container.closest('section');
    if (section) section.remove();
    return;
  }

  const groups = groupPublications(items);

  const groupHtml = Object.entries(groups)
    .map(([type, list]) => {
      const entries = list
        .map((item) => {
          const meta = [item.venue, item.year].filter(Boolean).join(', ');
          const link = item.link
            ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">link</a>`
            : '';
          return `
            <li class="publication-item">
              <span class="publication-title">${safeText(item.title)}</span>${item.authors ? ` <span class="publication-authors">${safeText(item.authors)}</span>` : ''}${meta ? ` <span class="publication-meta">${safeText(meta)}</span>` : ''}${link ? ` <span class="publication-link">${link}</span>` : ''}
            </li>
          `;
        })
        .join('');
      return `
        <div class="publications-group">
          <h3 class="section-accent">${safeText(type)}</h3>
          <ul class="publications-list">${entries}</ul>
        </div>
      `;
    })
    .join('');

  container.innerHTML = groupHtml;
}

function renderConferences() {
  const groups = {
    public: document.querySelector('#conferences-public'),
    scientific: document.querySelector('#conferences-scientific'),
    attendance: document.querySelector('#conferences-attendance'),
  };

  Object.values(groups).forEach((container) => {
    if (container) container.innerHTML = '';
  });

  (siteConfig.conferences || []).forEach((item) => {
    const container = groups[item.type];
    if (!container) return;

    const element = document.createElement('article');
    element.className = 'timeline-item';
    element.innerHTML = `
      <h3>${safeText(item.title)}</h3>
      <p><strong>${safeText(item.event)}</strong> <span aria-hidden="true">\u00b7</span> ${safeText(item.date)}</p>
      ${formatDetails(item.description)}
    `;
    container.appendChild(element);
  });
}

function renderAbout() {
  const container = document.querySelector('#about-content');
  if (!container) return;
  const text = siteConfig.about || siteConfig.summary;
  if (!text) return;
  container.innerHTML = markdownInline(text);
}

function renderProfileLinks() {
  const profiles = siteConfig.profiles || [];
  if (!profiles.length) return;

  const html = profiles
    .map(
      (profile) =>
        `<a class="profile-link" href="${escapeHtml(profile.url)}" target="_blank" rel="noopener noreferrer" aria-label="${safeText(profile.label)}">${LINK_OUT_ICON}<span>${safeText(profile.label)}</span></a>`
    )
    .join('');

  document.querySelectorAll('#profile-links, #contact-profiles').forEach((container) => {
    container.innerHTML = html;
  });
}

// ---------------------------------------------------------------------------
// Title + SEO
// ---------------------------------------------------------------------------

function renderTitle() {
  if (siteConfig.name && siteConfig.title) {
    document.title = `${siteConfig.name} \u2014 ${siteConfig.title}`;
  }
}

function renderSEO() {
  if (siteConfig.url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = siteConfig.url;
  }

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (siteConfig.image && !ogImage) {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:image');
    meta.content = siteConfig.image;
    document.head.appendChild(meta);
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    url: siteConfig.url || undefined,
    email: siteConfig.email || undefined,
    jobTitle: siteConfig.title || undefined,
  };

  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

// ---------------------------------------------------------------------------
// Interactive behavior: navigation drawer + theme toggle
// ---------------------------------------------------------------------------

function initNavToggle() {
  const toggle = document.querySelector('#nav-toggle');
  const links = document.querySelector('#nav-links');
  if (!toggle || !links) return;

  function setNavOpen(open) {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.style.maxHeight = open ? `${links.scrollHeight}px` : '0px';
  }

  toggle.addEventListener('click', () => {
    setNavOpen(!links.classList.contains('is-open'));
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setNavOpen(false);
  });

  window.addEventListener('resize', () => {
    if (links.classList.contains('is-open')) {
      links.style.maxHeight = `${links.scrollHeight}px`;
    }
  });
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.content = THEME_COLORS[theme] || THEME_COLORS.light;
  const toggle = document.querySelector('#theme-toggle');
  if (toggle) {
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }
}

function initThemeToggle() {
  applyTheme(getStoredTheme());

  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initThemeToggle();
  populateFields();
  renderTitle();
  renderAbout();
  renderEducation();
  renderExperience();
  renderPublications();
  renderConferences();
  renderProfileLinks();
  renderSEO();
});
