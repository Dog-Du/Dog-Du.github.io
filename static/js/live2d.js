/**
 * Live2D setup and drag support.
 */
(function () {
  'use strict';

  function shouldSkipLive2D() {
    var isNarrowViewport = window.innerWidth < 768;
    var hasCoarsePointer = false;

    try {
      hasCoarsePointer =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches;
    } catch (_) {}

    return isNarrowViewport && hasCoarsePointer;
  }

  if (shouldSkipLive2D()) return;

  var OML2D_CDN = 'https://unpkg.com/oh-my-live2d@0.19.3';
  var MODEL_CDN = 'https://model.hacxy.cn/';
  var REST_STATE_KEY = 'dogdu-live2d-rest-state';
  var LIB_STATUS_KEY = 'OML2D_STATUS';
  var MODEL_INDEX_KEY = 'OML2D_MODEL_INDEX';
  var MODEL_CLOTHES_KEY = 'OML2D_MODEL_CLOTHES_INDEX';
  var REST_MESSAGE = '\u4f11\u606f\u4e2d';
  var TITLE_REST = '\u4f11\u606f';
  var TITLE_SWITCH = '\u5207\u6362\u89d2\u8272';
  var TITLE_ABOUT = '\u5173\u4e8e';

  var models = [
    {
      name: 'HK416-1-normal',
      path: MODEL_CDN + 'HK416-1-normal/model.json',
      position: [0, 60],
      scale: 0.08,
      stageStyle: { height: 450 }
    },
    {
      name: 'HK416-2-destroy',
      path: MODEL_CDN + 'HK416-2-destroy/model.json',
      position: [0, 60],
      scale: 0.08,
      stageStyle: { height: 450 }
    },
    {
      name: 'HK416-2-normal',
      path: MODEL_CDN + 'HK416-2-normal/model.json',
      position: [0, 60],
      scale: 0.08,
      stageStyle: { height: 450 }
    },
    {
      name: 'Pio',
      path: MODEL_CDN + 'Pio/model.json',
      scale: 0.4,
      position: [0, 50],
      stageStyle: { height: 300 }
    },
    {
      name: 'chino',
      path: MODEL_CDN + 'chino/model.json',
      scale: 0.2,
      position: [0, 0],
      stageStyle: { height: 350 }
    },
    {
      name: 'fuko',
      path: MODEL_CDN + 'fuko/fuko.model3.json',
      position: [0, 20],
      stageStyle: { height: 350 }
    },
    {
      name: 'shizuku',
      path: MODEL_CDN + 'shizuku/shizuku.model.json',
      scale: 0.2,
      position: [70, 70],
      stageStyle: { height: 370, width: 400 }
    },
    {
      name: 'shizuku_48',
      path: MODEL_CDN + 'shizuku_48/index.json',
      scale: 0.2,
      position: [30, 30],
      stageStyle: { height: 350, width: 350 }
    },
    {
      name: 'shizuku_pajama',
      path: MODEL_CDN + 'shizuku_pajama/index.json',
      scale: 0.2,
      position: [40, 10],
      stageStyle: { height: 350, width: 330 }
    }
  ];

  function getRestState() {
    try {
      return localStorage.getItem(REST_STATE_KEY) === 'sleep' ? 'sleep' : 'active';
    } catch (_) {
      return 'active';
    }
  }

  function syncLibraryStatus(status) {
    try {
      localStorage.setItem(LIB_STATUS_KEY, status === 'sleep' ? 'sleep' : 'active');
    } catch (_) {}
  }

  function setRestState(status) {
    var normalized = status === 'sleep' ? 'sleep' : 'active';

    try {
      localStorage.setItem(REST_STATE_KEY, normalized);
    } catch (_) {}

    syncLibraryStatus(normalized);
  }

  function seedInitialModel(modelCount) {
    try {
      localStorage.setItem(MODEL_INDEX_KEY, String(getRandomIndex(modelCount)));
      localStorage.setItem(MODEL_CLOTHES_KEY, '0');
    } catch (_) {}
  }

  function getRandomIndex(max) {
    if (!max || max < 1) return 0;

    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      var buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return buffer[0] % max;
    }

    return Math.floor(Math.random() * max);
  }

  function getStageElement() {
    return document.getElementById('oml2d-stage');
  }

  function getStatusBarElement() {
    return document.getElementById('oml2d-statusBar');
  }

  function hideStageElement(stage) {
    if (!stage) return;
    stage.style.visibility = 'hidden';
    stage.style.pointerEvents = 'none';
    stage.style.opacity = '0';
  }

  function showStageElement(stage) {
    if (!stage) return;
    stage.style.removeProperty('display');
    stage.style.removeProperty('visibility');
    stage.style.removeProperty('pointer-events');
    stage.style.removeProperty('opacity');
  }

  function normalizeActiveStage(stage) {
    if (!stage) return;
    showStageElement(stage);
    stage.style.setProperty('transform', 'none');
  }

  function silenceInstance(instance) {
    if (!instance) return;

    if (typeof instance.clearTips === 'function') {
      instance.clearTips();
    }

    if (typeof instance.stopTipsIdle === 'function') {
      instance.stopTipsIdle();
    }
  }

  function wakeFromStatusBar(instance) {
    var stage = getStageElement();

    if (!instance || getRestState() !== 'sleep') return;

    setRestState('active');
    showStageElement(stage);

    if (typeof instance.statusBarClose === 'function') {
      instance.statusBarClose();
    }

    if (typeof instance.statusBarClearEvents === 'function') {
      instance.statusBarClearEvents();
    }

    Promise.resolve(instance.stageSlideIn()).then(function () {
      normalizeActiveStage(stage);
      silenceInstance(instance);
    });
  }

  function bindWakeFromStatusBarElement(instance) {
    var statusBar = getStatusBarElement();

    if (!statusBar || typeof statusBar.addEventListener !== 'function') return;

    if (statusBar.__dogduWakeCaptureHandler) {
      statusBar.removeEventListener('click', statusBar.__dogduWakeCaptureHandler, true);
    }

    statusBar.__dogduWakeCaptureHandler = function (event) {
      if (getRestState() !== 'sleep') return;

      if (event) {
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }

        if (typeof event.stopImmediatePropagation === 'function') {
          event.stopImmediatePropagation();
        } else if (typeof event.stopPropagation === 'function') {
          event.stopPropagation();
        }
      }

      wakeFromStatusBar(instance);
    };

    statusBar.addEventListener('click', statusBar.__dogduWakeCaptureHandler, true);
  }

  function bindWakeFromStatusBar(instance) {
    if (!instance) return;

    if (typeof instance.setStatusBarClickEvent === 'function') {
      instance.setStatusBarClickEvent(function () {
        wakeFromStatusBar(instance);
      });
    }

    bindWakeFromStatusBarElement(instance);
  }

  function rebindWakeAfterLibrarySleepInit(instance) {
    Promise.resolve().then(function () {
      Promise.resolve().then(function () {
        if (getRestState() !== 'sleep') return;
        bindWakeFromStatusBar(instance);
      });
    });
  }

  function handleSuccessfulLoad(instance) {
    var stage = getStageElement();

    silenceInstance(instance);

    if (getRestState() === 'sleep') {
      hideStageElement(stage);
      rebindWakeAfterLibrarySleepInit(instance);
      return;
    }

    normalizeActiveStage(stage);
  }

  function initLive2D() {
    var initialStatus = getRestState();

    setRestState(initialStatus);
    seedInitialModel(models.length);

    var instance = OML2D.loadOml2d({
      sayHello: false,
      initialStatus: initialStatus,
      models: models,
      tips: {
        style: { display: 'none' },
        mobileStyle: { display: 'none' },
        idleTips: {
          message: [],
          duration: 0,
          interval: 600000,
          priority: 0
        },
        welcomeTips: {
          duration: 0,
          priority: 0,
          message: {
            daybreak: '',
            morning: '',
            noon: '',
            afternoon: '',
            dusk: '',
            night: '',
            lateNight: '',
            weeHours: ''
          }
        },
        copyTips: {
          duration: 0,
          priority: 0,
          message: []
        }
      },
      statusBar: {
        restMessage: REST_MESSAGE
      },
      menus: {
        items: [
          {
            id: 'Rest',
            icon: 'icon-rest',
            title: TITLE_REST,
            onClick: function (instanceRef) {
              var stage = getStageElement();

              setRestState('sleep');
              silenceInstance(instanceRef);

              if (typeof instanceRef.statusBarOpen === 'function') {
                instanceRef.statusBarOpen(REST_MESSAGE);
              }

              bindWakeFromStatusBar(instanceRef);

              Promise.resolve(instanceRef.stageSlideOut()).then(function () {
                hideStageElement(stage);
              });
            }
          },
          {
            id: 'SwitchModel',
            icon: 'icon-switch',
            title: TITLE_SWITCH,
            onClick: function (instanceRef) {
              var stage = getStageElement();

              setRestState('active');
              showStageElement(stage);

              if (typeof instanceRef.statusBarClearEvents === 'function') {
                instanceRef.statusBarClearEvents();
              }

              if (typeof instanceRef.statusBarClose === 'function') {
                instanceRef.statusBarClose();
              }

              Promise.resolve(instanceRef.loadNextModel()).then(function () {
                normalizeActiveStage(stage);
                silenceInstance(instanceRef);
              });
            }
          },
          {
            id: 'About',
            icon: 'icon-about',
            title: TITLE_ABOUT,
            onClick: function () {
              window.open('https://oml2d.com');
            }
          }
        ]
      }
    });

    if (instance && typeof instance.onLoad === 'function') {
      instance.onLoad(function (status) {
        if (status === 'success') {
          handleSuccessfulLoad(instance);
        }
      });
    }
  }

  function loadAndInit() {
    var script = document.createElement('script');
    script.src = OML2D_CDN;
    script.onload = initLive2D;
    script.onerror = function () {
      console.warn('[Live2D] CDN load failed: ' + OML2D_CDN);
    };
    document.head.appendChild(script);
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadAndInit, { timeout: 5000 });
  } else {
    setTimeout(loadAndInit, 3000);
  }
})();

(function () {
  'use strict';

  var STORAGE_KEY = 'live2d-drag-pos';
  var REST_STATE_KEY = 'dogdu-live2d-rest-state';
  var DRAG_THRESHOLD = 5;
  var POLL_INTERVAL = 200;
  var POLL_TIMEOUT = 15000;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getRestState() {
    try {
      return localStorage.getItem(REST_STATE_KEY) === 'sleep' ? 'sleep' : 'active';
    } catch (_) {
      return 'active';
    }
  }

  function savePos(x, y) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x, y: y }));
    } catch (_) {}
  }

  function loadPos() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && typeof data.x === 'number' && typeof data.y === 'number') {
        return data;
      }
    } catch (_) {}
    return null;
  }

  function applyPos(el, x, y) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var width = el.offsetWidth || 200;
    var height = el.offsetHeight || 350;

    x = clamp(x, 0, vw - width);
    y = clamp(y, 0, vh - height);

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.bottom = 'auto';
    el.style.right = 'auto';

    return { x: x, y: y };
  }

  function initDrag(stage) {
    var dragging = false;
    var moved = false;
    var startX = 0;
    var startY = 0;
    var offX = 0;
    var offY = 0;
    var saved = loadPos();
    var sleeping = getRestState() === 'sleep';

    if (saved) {
      stage.style.setProperty('transition', 'none', 'important');
      stage.style.setProperty('animation', 'none', 'important');
      applyPos(stage, saved.x, saved.y);

      if (!sleeping) {
        stage.style.setProperty('transform', 'none', 'important');
      }

      setTimeout(function () {
        stage.style.removeProperty('transition');
        stage.style.removeProperty('animation');

        if (!sleeping) {
          stage.style.setProperty('transform', 'none');
        }
      }, 2000);
    }

    window.addEventListener('resize', function () {
      var rect = stage.getBoundingClientRect();
      var pos = applyPos(stage, rect.left, rect.top);
      savePos(pos.x, pos.y);
    });

    function px(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function py(e) {
      return e.touches ? e.touches[0].clientY : e.clientY;
    }

    function down(e) {
      if (e.button && e.button !== 0) return;

      dragging = true;
      moved = false;

      var rect = stage.getBoundingClientRect();
      startX = px(e);
      startY = py(e);
      offX = startX - rect.left;
      offY = startY - rect.top;
    }

    function move(e) {
      if (!dragging) return;

      var cx = px(e);
      var cy = py(e);

      if (!moved) {
        var dx = cx - startX;
        var dy = cy - startY;

        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;

        moved = true;
        stage.style.opacity = '0.82';
        stage.style.cursor = 'grabbing';
        stage.style.setProperty('transform', 'none');
        stage.style.transition = 'none';
      }

      e.preventDefault();
      applyPos(stage, cx - offX, cy - offY);
    }

    function up() {
      if (!dragging) return;

      dragging = false;
      stage.style.opacity = '';
      stage.style.cursor = 'grab';

      if (moved) {
        var rect = stage.getBoundingClientRect();
        savePos(rect.left, rect.top);

        var capture = function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          stage.removeEventListener('click', capture, true);
        };

        stage.addEventListener('click', capture, true);
      }

      moved = false;
    }

    stage.addEventListener('mousedown', down, false);
    document.addEventListener('mousemove', move, false);
    document.addEventListener('mouseup', up, false);
    stage.addEventListener('touchstart', down, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up, false);

    stage.style.cursor = 'grab';
  }

  function waitFor(selector, cb) {
    var elapsed = 0;
    var el = document.querySelector(selector);

    if (el) {
      cb(el);
      return;
    }

    var observer = new MutationObserver(function () {
      el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        clearInterval(poll);
        cb(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    var poll = setInterval(function () {
      elapsed += POLL_INTERVAL;
      el = document.querySelector(selector);

      if (el) {
        observer.disconnect();
        clearInterval(poll);
        cb(el);
      } else if (elapsed >= POLL_TIMEOUT) {
        observer.disconnect();
        clearInterval(poll);
      }
    }, POLL_INTERVAL);
  }

  function main() {
    waitFor('#oml2d-stage', function (stage) {
      initDrag(stage);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
