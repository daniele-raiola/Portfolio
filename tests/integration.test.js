import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as main from '../assets/js/main.js';

/** Build a DOM fixture straight from index.html so the test exercises the
 *  real wiring (data-field attributes, container ids, script bootstrap). */
beforeAll(() => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');
  const body = html.match(/<body>([\s\S]*)<\/body>/i);
  const bodyHtml = body ? body[1].replace(/<script[\s\S]*?<\/script>/gi, '') : '';
  document.body.innerHTML = bodyHtml;

  // main.js registers the DOMContentLoaded listener; trigger the bootstrap.
  document.dispatchEvent(new Event('DOMContentLoaded'));
});

describe('application wiring', () => {
  it('populates data-field placeholders from siteConfig', () => {
    const fields = document.querySelectorAll('[data-field="name"]');
    expect(fields.length).toBeGreaterThan(0);
    expect(fields[0].textContent).toBe('Daniele Raiola');
  });

  it('sets a branded document title', () => {
    expect(document.title).toBe('Daniele Raiola \u2014 Philosophy of Science');
  });

  it('renders the education timeline', () => {
    const items = document.querySelectorAll('#education-list .timeline-item');
    expect(items.length).toBe(2);
  });

  it('renders the other-experience section', () => {
    const items = document.querySelectorAll('#other-experience-list .timeline-item');
    expect(items.length).toBe(2);
  });

  it('renders the about section as safe HTML', () => {
    const about = document.querySelector('#about-content');
    expect(about.querySelector('strong')).not.toBeNull();
    expect(about.querySelector('a[href="https://www.astrogeo.va.it/"]')).not.toBeNull();
  });

  it('wires email links', () => {
    const mailto = document.querySelector('[data-email-link]');
    expect(mailto.getAttribute('href')).toBe('mailto:daniele.raiola98@gmail.com');
    expect(mailto.textContent).toBe('daniele.raiola98@gmail.com');
  });

  it('renders profile links in both the hero and the contact card', () => {
    const heroLinks = document.querySelectorAll('#profile-links .profile-link');
    const contactLinks = document.querySelectorAll('#contact-profiles .profile-link');
    expect(heroLinks.length).toBe(3);
    expect(contactLinks.length).toBe(3);
    expect(heroLinks[0].getAttribute('href')).toBe('https://orcid.org/0000-0000-0000-0000');
  });

  it('injects SEO: canonical, theme-color and JSON-LD', () => {
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://example.com'
    );
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(
      '#ffffff'
    );
    const ld = document.querySelector('script[type="application/ld+json"]');
    expect(ld).not.toBeNull();
    const data = JSON.parse(ld.textContent);
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Daniele Raiola');
  });
});

describe('navigation drawer', () => {
  it('toggles the mobile menu open and closed', () => {
    const toggle = document.querySelector('#nav-toggle');
    const links = document.querySelector('#nav-links');

    // Initially closed
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(links.classList.contains('is-open')).toBe(false);

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(links.classList.contains('is-open')).toBe(true);
    expect(links.style.maxHeight).not.toBe('');

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(links.classList.contains('is-open')).toBe(false);
    expect(links.style.maxHeight).toBe('0px');
  });
});
