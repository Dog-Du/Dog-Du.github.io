'use strict';

/**
 * Live2D 看板娘拖拽功能
 * 支持鼠标和触摸拖拽，位置持久化到 localStorage
 */
(function () {
  var STORAGE_KEY = 'live2d-drag-position';
  var DRAG_THRESHOLD = 5;
  var POLL_INTERVAL = 200;
  var POLL_TIMEOUT = 15000;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function savePosition(x, y) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x, y: y }));
    } catch (_) {}
  }

  function loadPosition() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var pos = JSON.parse(raw);
        if (typeof pos.x === 'number' && typeof pos.y === 'number') return pos;
      }
    } catch (_) {}
    return null;
  }

  function constrainToViewport(wrapper, x, y) {
    var rect = wrapper.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    return {
      x: clamp(x, 0, vw - rect.width),
      y: clamp(y, 0, vh - rect.height)
    };
  }

  function applyPosition(wrapper, x, y) {
    var pos = constrainToViewport(wrapper, x, y);
    wrapper.style.position = 'fixed';
    wrapper.style.left = pos.x + 'px';
    wrapper.style.top = pos.y + 'px';
    wrapper.style.bottom = 'auto';
    wrapper.style.right = 'auto';
    wrapper.style.transition = 'none';
    return pos;
  }

  function initDrag(stage, wrapper) {
    var isDragging = false;
    var hasMoved = false;
    var startX = 0, startY = 0, offsetX = 0, offsetY = 0;

    // 恢复上次保存的位置
    var saved = loadPosition();
    if (saved) applyPosition(wrapper, saved.x, saved.y);

    // 窗口缩放时将 widget 限制在视口内
    window.addEventListener('resize', function () {
      var rect = wrapper.getBoundingClientRect();
      var pos = applyPosition(wrapper, rect.left, rect.top);
      savePosition(pos.x, pos.y);
    });

    function pointerX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function pointerY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    function onPointerDown(e) {
      if (e.button && e.button !== 0) return;
      isDragging = true;
      hasMoved = false;
      var rect = wrapper.getBoundingClientRect();
      startX = pointerX(e);
      startY = pointerY(e);
      offsetX = startX - rect.left;
      offsetY = startY - rect.top;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      var cx = pointerX(e), cy = pointerY(e);
      var dx = cx - startX, dy = cy - startY;

      if (!hasMoved) {
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        hasMoved = true;
        wrapper.style.opacity = '0.82';
        wrapper.style.cursor = 'grabbing';
        stage.style.cursor = 'grabbing';
      }

      e.preventDefault();
      applyPosition(wrapper, cx - offsetX, cy - offsetY);
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      wrapper.style.opacity = '';
      wrapper.style.cursor = '';
      stage.style.cursor = 'grab';

      if (hasMoved) {
        var rect = wrapper.getBoundingClientRect();
        savePosition(rect.left, rect.top);
        // 阻止此次 click 冒泡到 Live2D 切换模型逻辑
        var capture = function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          stage.removeEventListener('click', capture, true);
        };
        stage.addEventListener('click', capture, true);
      }
      hasMoved = false;
    }

    stage.addEventListener('mousedown', onPointerDown, false);
    document.addEventListener('mousemove', onPointerMove, false);
    document.addEventListener('mouseup', onPointerUp, false);
    stage.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp, false);

    stage.style.cursor = 'grab';
  }

  function waitForElement(selector, callback) {
    var elapsed = 0;
    var el = document.querySelector(selector);
    if (el) { callback(el); return; }

    var observer = new MutationObserver(function () {
      var el = document.querySelector(selector);
      if (el) { observer.disconnect(); clearInterval(fallback); callback(el); }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    var fallback = setInterval(function () {
      elapsed += POLL_INTERVAL;
      var el = document.querySelector(selector);
      if (el) {
        observer.disconnect(); clearInterval(fallback); callback(el);
      } else if (elapsed >= POLL_TIMEOUT) {
        observer.disconnect(); clearInterval(fallback);
      }
    }, POLL_INTERVAL);
  }

  function main() {
    waitForElement('#oml2d-stage', function (stage) {
      var wrapper = stage.parentElement;
      if (!wrapper) return;
      initDrag(stage, wrapper);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
