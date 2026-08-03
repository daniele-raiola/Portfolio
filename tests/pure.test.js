import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  safeText,
  formatDetails,
  markdownInline,
  groupPublications,
} from '../assets/js/main.js';
import { siteStrings } from '../assets/js/site-strings.js';

describe('escapeHtml', () => {
  it('escapes the dangerous characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('escapes ampersands first', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('leaves safe text untouched', () => {
    expect(escapeHtml('Hello world')).toBe('Hello world');
  });
});

describe('safeText', () => {
  it('returns empty string for null/undefined', () => {
    expect(safeText(null)).toBe('');
    expect(safeText(undefined)).toBe('');
  });

  it('coerces numbers to escaped strings', () => {
    expect(safeText(42)).toBe('42');
  });

  it('escapes angle brackets', () => {
    expect(safeText('<x>')).toBe('&lt;x&gt;');
  });
});

describe('formatDetails', () => {
  const delim = siteStrings.details.itemDelimiter;

  it('returns empty string for falsy input', () => {
    expect(formatDetails('')).toBe('');
    expect(formatDetails(null)).toBe('');
  });

  it('renders a single detail as a paragraph', () => {
    const out = formatDetails('Thesis abstract here');
    expect(out).toBe('<p>Thesis abstract here</p>');
  });

  it('renders multiple details (delimiter) as a list', () => {
    const out = formatDetails(`One${delim}Two${delim}Three`);
    expect(out).toBe('<ul class="details-list"><li>One</li><li>Two</li><li>Three</li></ul>');
  });

  it('splits on both newlines and the delimiter', () => {
    const out = formatDetails(`First\nSecond${delim}Third`);
    expect(out).toBe('<ul class="details-list"><li>First</li><li>Second</li><li>Third</li></ul>');
  });

  it('escapes HTML inside details', () => {
    const out = formatDetails(`<img src=x>`);
    expect(out).toContain('&lt;img src=x&gt;');
  });
});

describe('markdownInline', () => {
  it('converts **bold** to strong tags', () => {
    expect(markdownInline('Hello **world**')).toBe('Hello <strong>world</strong>');
  });

  it('escapes raw HTML rather than passing it through', () => {
    expect(markdownInline('<script>bad</script>')).toBe('&lt;script&gt;bad&lt;/script&gt;');
  });

  it('parses markdown links and escapes the url', () => {
    const out = markdownInline('[Scholar](https://x.com/?a=1&b=2)');
    expect(out).toBe(
      '<a href="https://x.com/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer"><strong>Scholar</strong></a>'
    );
  });

  it('converts newlines to <br>', () => {
    expect(markdownInline('line one\nline two')).toBe('line one<br>line two');
  });

  it('does not double-escape ampersands already in text', () => {
    expect(markdownInline('H&PS')).toBe('H&amp;PS');
  });
});

describe('groupPublications', () => {
  it('groups items by their type field', () => {
    const items = [
      { type: 'Journal', title: 'A' },
      { type: 'Journal', title: 'B' },
      { type: 'Chapter', title: 'C' },
    ];
    const groups = groupPublications(items);
    expect(Object.keys(groups).sort()).toEqual(['Chapter', 'Journal']);
    expect(groups.Journal).toHaveLength(2);
    expect(groups.Chapter).toHaveLength(1);
  });

  it('uses "Other" as fallback when type is missing', () => {
    const groups = groupPublications([{ title: 'A' }, { type: 'Journal', title: 'B' }]);
    expect(groups.Other).toHaveLength(1);
    expect(groups.Journal).toHaveLength(1);
  });

  it('handles null/empty input', () => {
    expect(groupPublications([])).toEqual({});
    expect(groupPublications(null)).toEqual({});
    expect(groupPublications(undefined)).toEqual({});
  });
});
