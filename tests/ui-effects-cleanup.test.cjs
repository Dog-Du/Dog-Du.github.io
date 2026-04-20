const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const uiEffectsScript = fs.readFileSync(
  path.join(__dirname, '..', 'static', 'js', 'ui-effects.js'),
  'utf8'
);

test('ui-effects no longer registers a global click-effect listener', () => {
  const registered = {};

  const context = {
    console,
    navigator: {
      platform: 'Win32',
      userAgent: 'Node.js'
    },
    window: {
      matchMedia() {
        return { matches: false };
      }
    },
    document: {
      readyState: 'complete',
      body: {},
      addEventListener(type, handler) {
        registered[type] = handler;
      },
      createElement() {
        return {
          classList: { add() {}, remove() {} },
          setAttribute() {},
          appendChild() {},
          style: {}
        };
      },
      getElementById() {
        return null;
      },
      querySelector() {
        return null;
      }
    },
    MutationObserver: class {
      observe() {}
    },
    setTimeout() {
      return 1;
    },
    clearTimeout() {}
  };

  vm.runInNewContext(uiEffectsScript, context, { filename: 'ui-effects.js' });
  assert.equal(typeof registered.click, 'undefined');
});
