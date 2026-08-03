import { vi } from 'vitest';

window.matchMedia =
  window.matchMedia ||
  vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

// jsdom does not expose localStorage by default; provide an in-memory
// implementation so theme-persistence code paths are exercised in tests.
const store = {};
try {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key]);
      },
    },
    configurable: true,
  });
} catch (e) {
  vi.stubGlobal('localStorage', store);
}
