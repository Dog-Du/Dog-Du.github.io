'use strict';

/**
 * Live2D 看板娘拖拽功能
 * 直接操作 #oml2d-stage（position:fixed 元素）
 * 支持鼠标 + 触摸，位置持久化 localStorage
 */
(function () {
  var STORAGE_KEY = 'live2d-drag-pos';
  var DRAG_THRESHOLD = 5;
  var POLL_INTERVAL = 200;
  var POLL_TIMEOUT = 15000;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function savePos(x, y) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x, y: y })); } catch (_) {}
  }

  function loadPos() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && typeof d.x === 'number' && typeof d.y === 'number') return d;
    } catch (_) {}
    return null;
  }

  function applyPos(el, x, y) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = el.offsetWidth || 200, h = el.offsetHeight || 350;
    x = clamp(x, 0, vw - w);
    y = clamp(y, 0, vh - h);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.bottom = 'auto';
    el.style.right = 'auto';
    return { x: x, y: y };
  }

  function initDrag(stage) {
    var dragging = false, moved = false;
    var startX = 0, startY = 0, offX = 0, offY = 0;

    /* 恢复保存的位置 */
    var saved = loadPos();
    if (saved) {
      /* 等 slide-in 动画完成后再应用位置，避免冲突 */
      setTimeout(function () { applyPos(stage, saved.x, saved.y); }, 1500);
    }

    window.addEventListener('resize', function () {
      var r = stage.getBoundingClientRect();
      var p = applyPos(stage, r.left, r.top);
      savePos(p.x, p.y);
    });

    function px(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function py(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    function down(e) {
      if (e.button && e.button !== 0) return;
      dragging = true; moved = false;
      var r = stage.getBoundingClientRect();
      startX = px(e); startY = py(e);
      offX = startX - r.left; offY = startY - r.top;
    }

    function move(e) {
      if (!dragging) return;
      var cx = px(e), cy = py(e);
      if (!moved) {
        var dx = cx - startX, dy = cy - startY;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        moved = true;
        stage.style.opacity = '0.82';
        stage.style.cursor = 'grabbing';
        /* 进入拖拽时立即把 bottom 定位切换为 top 定位 */
        var r = stage.getBoundingClientRect();
        stage.style.top = r.top + 'px';
        stage.style.bottom = 'auto';
        stage.style.right = 'auto';
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
        var r = stage.getBoundingClientRect();
        savePos(r.left, r.top);
        var capture = function (ev) {
          ev.stopPropagation(); ev.preventDefault();
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

  function waitFor(sel, cb) {
    var elapsed = 0, el = document.querySelector(sel);
    if (el) { cb(el); return; }
    var obs = new MutationObserver(function () {
      el = document.querySelector(sel);
      if (el) { obs.disconnect(); clearInterval(poll); cb(el); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    var poll = setInterval(function () {
      elapsed += POLL_INTERVAL;
      el = document.querySelector(sel);
      if (el) { obs.disconnect(); clearInterval(poll); cb(el); }
      else if (elapsed >= POLL_TIMEOUT) { obs.disconnect(); clearInterval(poll); }
    }, POLL_INTERVAL);
  }

  function main() {
    waitFor('#oml2d-stage', function (stage) { initDrag(stage); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else { main(); }
})();
