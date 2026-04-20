const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const live2dScript = fs.readFileSync(
  path.join(__dirname, '..', 'static', 'js', 'live2d.js'),
  'utf8'
);

const REST_STATE_KEY = 'dogdu-live2d-rest-state';

function createStyleStore() {
  const values = Object.create(null);

  function normalizeProp(prop) {
    return String(prop).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  return new Proxy({
    values,
    setProperty(name, value) {
      values[normalizeProp(name)] = value;
    },
    removeProperty(name) {
      delete values[normalizeProp(name)];
    }
  }, {
    set(target, prop, value) {
      target[prop] = value;
      if (prop !== 'values') {
        values[normalizeProp(prop)] = value;
      }
      return true;
    },
    get(target, prop) {
      return target[prop];
    }
  });
}

function createStage() {
  const style = createStyleStore();
  return {
    style,
    offsetWidth: 220,
    offsetHeight: 360,
    addEventListener() {},
    removeEventListener() {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name);
    },
    getBoundingClientRect() {
      return { left: 120, top: 80, width: 220, height: 360 };
    },
    attributes: {}
  };
}

function createStatusBar() {
  const listeners = [];

  function normalizeCapture(options) {
    return typeof options === 'boolean'
      ? options
      : Boolean(options && options.capture);
  }

  function createEvent() {
    return {
      defaultPrevented: false,
      propagationStopped: false,
      immediatePropagationStopped: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      stopPropagation() {
        this.propagationStopped = true;
      },
      stopImmediatePropagation() {
        this.immediatePropagationStopped = true;
        this.propagationStopped = true;
      }
    };
  }

  return {
    style: createStyleStore(),
    defaultClickHandler: null,
    addEventListener(type, handler, options) {
      listeners.push({ type, handler, capture: normalizeCapture(options) });
    },
    removeEventListener(type, handler, options) {
      const capture = normalizeCapture(options);
      const index = listeners.findIndex((listener) => (
        listener.type === type &&
        listener.handler === handler &&
        listener.capture === capture
      ));

      if (index >= 0) {
        listeners.splice(index, 1);
      }
    },
    click() {
      const event = createEvent();

      for (const listener of [...listeners]) {
        if (listener.type !== 'click' || !listener.capture) continue;
        listener.handler(event);
        if (event.immediatePropagationStopped) {
          return event;
        }
      }

      if (!event.propagationStopped && typeof this.defaultClickHandler === 'function') {
        this.defaultClickHandler(event);
      }

      if (event.immediatePropagationStopped) {
        return event;
      }

      for (const listener of [...listeners]) {
        if (listener.type !== 'click' || listener.capture) continue;
        listener.handler(event);
        if (event.immediatePropagationStopped) {
          return event;
        }
      }

      return event;
    }
  };
}

function createLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    dump() {
      return Object.fromEntries(store.entries());
    }
  };
}

function runLive2d(options = {}) {
  const localStorage = createLocalStorage(options.localStorage);
  const stage = createStage();
  const statusBar = createStatusBar();
  const appendedScripts = [];
  const documentListeners = {};
  const windowListeners = {};
  let idleCallback = null;
  let capturedLoadOptions = null;
  let onLoadHandler = null;
  let statusBarClickHandler = null;
  let stageSlideInCalls = 0;
  let stageSlideOutCalls = 0;
  let clearTipsCalls = 0;
  let stopTipsIdleCalls = 0;
  let statusBarOpenCalls = 0;
  let statusBarCloseCalls = 0;
  let statusBarClearCalls = 0;

  const instance = {
    options: { statusBar: { restMessage: '休息中' } },
    clearTips() {
      clearTipsCalls += 1;
    },
    stopTipsIdle() {
      stopTipsIdleCalls += 1;
    },
    setStatusBarClickEvent(fn) {
      statusBarClickHandler = fn;
      statusBar.defaultClickHandler = fn;
    },
    statusBarOpen() {
      statusBarOpenCalls += 1;
    },
    statusBarClose() {
      statusBarCloseCalls += 1;
    },
    statusBarClearEvents() {
      statusBarClearCalls += 1;
      statusBarClickHandler = null;
      statusBar.defaultClickHandler = null;
    },
    stageSlideIn() {
      stageSlideInCalls += 1;
      return Promise.resolve();
    },
    stageSlideOut() {
      stageSlideOutCalls += 1;
      return Promise.resolve();
    },
    onLoad(fn) {
      onLoadHandler = fn;
    }
  };

  const context = {
    console: { warn() {} },
    Math,
    JSON,
    Promise,
    Uint32Array,
    localStorage,
    setTimeout(fn) {
      fn();
      return 1;
    },
    clearTimeout() {},
    requestIdleCallback(fn) {
      idleCallback = fn;
    },
    window: {
      innerWidth: options.innerWidth ?? 1280,
      requestIdleCallback(fn) {
        idleCallback = fn;
      },
      matchMedia(query) {
        const isNarrow = (options.innerWidth ?? 1280) < 768;
        const isCoarse = Boolean(options.pointerCoarse);
        let matches = false;

        if (query === '(pointer: coarse)') {
          matches = isCoarse;
        } else if (query === '(max-width: 767px)') {
          matches = isNarrow;
        } else if (query === '(max-width: 767px) and (pointer: coarse)') {
          matches = isNarrow && isCoarse;
        }

        return {
          matches,
          media: query,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {}
        };
      },
      addEventListener(type, handler) {
        windowListeners[type] = handler;
      },
      removeEventListener(type) {
        delete windowListeners[type];
      },
      crypto: {
        getRandomValues(arr) {
          arr[0] = options.randomValue ?? 7;
          return arr;
        }
      }
    },
    document: {
      readyState: 'complete',
      body: {},
      head: {
        appendChild(el) {
          appendedScripts.push(el);
        }
      },
      createElement(tag) {
        return {
          tagName: tag.toUpperCase(),
          style: createStyleStore(),
          setAttribute() {},
          addEventListener() {},
          removeEventListener() {}
        };
      },
      addEventListener(type, handler) {
        documentListeners[type] = handler;
      },
      getElementById(id) {
        if (id === 'oml2d-stage') return stage;
        if (id === 'oml2d-statusBar') return statusBar;
        return null;
      },
      querySelector(selector) {
        if (selector === '#oml2d-stage') return stage;
        if (selector === '#oml2d-statusBar') return statusBar;
        return null;
      }
    },
    MutationObserver: class {
      constructor(handler) {
        this.handler = handler;
      }
      observe() {}
      disconnect() {}
    },
    OML2D: {
      loadOml2d(loadOptions) {
        capturedLoadOptions = loadOptions;
        return instance;
      }
    },
    navigator: {
      maxTouchPoints: options.maxTouchPoints ?? 0
    }
  };

  context.window.window = context.window;
  context.window.document = context.document;
  context.window.navigator = context.navigator;
  context.document.defaultView = context.window;

  vm.runInNewContext(live2dScript, context, { filename: 'live2d.js' });

  if (options.expectInit === false) {
    assert.equal(idleCallback, null, 'expected live2d initialization to be skipped');
  } else {
    assert.ok(idleCallback, 'expected requestIdleCallback to be registered');
    idleCallback();
    assert.equal(appendedScripts.length, 1, 'expected Live2D CDN script to be appended');
    appendedScripts[0].onload();
  }

  return {
    localStorage,
    stage,
    capturedLoadOptions,
    appendedScripts,
    instance,
    triggerLoadSuccess() {
      assert.ok(onLoadHandler, 'expected onLoad handler to be registered');
      onLoadHandler('success');
    },
    triggerRest() {
      const restItem = capturedLoadOptions.menus.items.find((item) => item.id === 'Rest');
      return restItem.onClick(instance);
    },
    triggerWake() {
      assert.ok(statusBarClickHandler, 'expected wake handler to be registered');
      return statusBarClickHandler();
    },
    clickStatusBar() {
      return statusBar.click();
    },
    simulateLibrarySleepInitialization() {
      return Promise.resolve().then(function () {
        return Promise.resolve().then(function () {
          return Promise.resolve().then(function () {
            instance.statusBarOpen();
            instance.setStatusBarClickEvent(function () {
              instance.stageSlideIn();
              instance.statusBarClose();
              instance.statusBarClearEvents();
            });
          });
        });
      });
    },
    stats() {
      return {
        clearTipsCalls,
        stopTipsIdleCalls,
        statusBarOpenCalls,
        statusBarCloseCalls,
        statusBarClearCalls,
        stageSlideInCalls,
        stageSlideOutCalls
      };
    }
  };
}

test('live2d initialization randomizes model index, hides tips, and preserves sleep state without removing the stage from layout', () => {
  const runtime = runLive2d({
    randomValue: 17,
    localStorage: {
      [REST_STATE_KEY]: 'sleep',
      'live2d-drag-pos': JSON.stringify({ x: 40, y: 60 })
    }
  });

  assert.ok(runtime.capturedLoadOptions, 'expected live2d options to be captured');
  assert.equal(runtime.capturedLoadOptions.initialStatus, 'sleep');
  assert.equal(runtime.capturedLoadOptions.tips.style.display, 'none');
  assert.equal(runtime.localStorage.getItem(REST_STATE_KEY), 'sleep');
  assert.equal(runtime.localStorage.getItem('OML2D_STATUS'), 'sleep');
  assert.equal(runtime.localStorage.getItem('OML2D_MODEL_INDEX'), String(17 % runtime.capturedLoadOptions.models.length));
  assert.equal(runtime.localStorage.getItem('OML2D_MODEL_CLOTHES_INDEX'), '0');

  runtime.triggerLoadSuccess();
  assert.equal(runtime.stage.style.values.display, undefined);
  assert.equal(runtime.stage.style.values.visibility, 'hidden');
  assert.equal(runtime.stage.style.values.pointerEvents, 'none');
  assert.equal(runtime.stage.style.values.opacity, '0');
});

test('rest menu hides the stage without collapsing the canvas and wake restores it through the status bar', async () => {
  const runtime = runLive2d({
    randomValue: 5,
    localStorage: {
      OML2D_STATUS: 'active'
    }
  });

  await runtime.triggerRest();
  const afterRest = runtime.stats();
  assert.equal(afterRest.clearTipsCalls, 1);
  assert.equal(afterRest.stopTipsIdleCalls, 1);
  assert.equal(afterRest.statusBarOpenCalls, 1);
  assert.equal(afterRest.stageSlideOutCalls, 1);
  assert.equal(runtime.stage.style.values.display, undefined);
  assert.equal(runtime.stage.style.values.visibility, 'hidden');
  assert.equal(runtime.stage.style.values.pointerEvents, 'none');
  assert.equal(runtime.stage.style.values.opacity, '0');
  assert.equal(runtime.localStorage.getItem(REST_STATE_KEY), 'sleep');
  assert.equal(runtime.localStorage.getItem('OML2D_STATUS'), 'sleep');

  await runtime.triggerWake();
  const afterWake = runtime.stats();
  assert.equal(afterWake.stageSlideInCalls, 1);
  assert.equal(afterWake.statusBarCloseCalls, 1);
  assert.equal(afterWake.statusBarClearCalls, 1);
  assert.equal(runtime.stage.style.values.display, undefined);
  assert.equal(runtime.stage.style.values.visibility, undefined);
  assert.equal(runtime.stage.style.values.pointerEvents, undefined);
  assert.equal(runtime.stage.style.values.opacity, undefined);
  assert.equal(runtime.localStorage.getItem(REST_STATE_KEY), 'active');
  assert.equal(runtime.localStorage.getItem('OML2D_STATUS'), 'active');
});

test('legacy library sleep state is ignored unless the repo rest key is set', () => {
  const runtime = runLive2d({
    randomValue: 3,
    localStorage: {
      OML2D_STATUS: 'sleep'
    }
  });

  assert.equal(runtime.capturedLoadOptions.initialStatus, 'active');
  assert.equal(runtime.localStorage.getItem('OML2D_STATUS'), 'active');

  runtime.triggerLoadSuccess();
  assert.equal(runtime.stage.style.values.display, undefined);
});

test('sleep state survives page navigation and wake still restores the stage after the library rebinds the status bar', async () => {
  const runtime = runLive2d({
    randomValue: 9,
    localStorage: {
      [REST_STATE_KEY]: 'sleep'
    }
  });

  runtime.triggerLoadSuccess();
  await runtime.simulateLibrarySleepInitialization();

  await Promise.resolve();
  await Promise.resolve();
  runtime.clickStatusBar();

  const afterWake = runtime.stats();
  assert.equal(afterWake.statusBarOpenCalls, 1);
  assert.equal(afterWake.stageSlideInCalls, 1);
  assert.equal(afterWake.statusBarCloseCalls, 1);
  assert.equal(afterWake.statusBarClearCalls, 1);
  assert.equal(runtime.stage.style.values.visibility, undefined);
  assert.equal(runtime.stage.style.values.pointerEvents, undefined);
  assert.equal(runtime.stage.style.values.opacity, undefined);
  assert.equal(runtime.localStorage.getItem(REST_STATE_KEY), 'active');
  assert.equal(runtime.localStorage.getItem('OML2D_STATUS'), 'active');
});

test('narrow desktop viewports still initialize live2d', () => {
  const runtime = runLive2d({
    innerWidth: 754,
    pointerCoarse: false,
    maxTouchPoints: 10
  });

  assert.ok(runtime.capturedLoadOptions, 'expected live2d to initialize on a narrow desktop viewport');
  assert.equal(runtime.appendedScripts.length, 1);
});

test('narrow coarse-pointer viewports still skip live2d initialization', () => {
  const runtime = runLive2d({
    innerWidth: 430,
    pointerCoarse: true,
    maxTouchPoints: 5,
    expectInit: false
  });

  assert.equal(runtime.capturedLoadOptions, null);
  assert.equal(runtime.appendedScripts.length, 0);
});
