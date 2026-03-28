'use strict';

/**
 * ==========================================================================
 * Live2D 看板娘拖拽功能 (live2d-drag.js)
 * ==========================================================================
 *
 * 功能概述：
 *   为 oh-my-live2d 创建的 #oml2d-stage 元素添加拖拽移动能力。
 *   支持鼠标和触摸操作，拖拽位置通过 localStorage 持久化，
 *   刷新/切换页面后自动恢复到上次拖拽的位置。
 *
 * 工作原理：
 *   1. 使用 MutationObserver + 轮询双重策略等待 #oml2d-stage 元素出现
 *   2. 元素出现后，若 localStorage 中有保存的位置，立即应用并跳过
 *      oh-my-live2d 自带的 slide-in 入场动画（避免视觉抽搐）
 *   3. 监听 mousedown/mousemove/mouseup 和对应 touch 事件实现拖拽
 *   4. 拖拽超过阈值（5px）后才算「真正移动」，短距离点击不会触发拖拽
 *   5. 拖拽结束后保存位置，窗口 resize 时自动修正防止超出视口
 *
 * 依赖：
 *   - oh-my-live2d 库（创建 #oml2d-stage 元素）
 *   - 需在 oh-my-live2d 之后加载（使用 defer 即可）
 *
 * 相关文件：
 *   - layouts/partials/extend-footer.html  → 加载本脚本 + oh-my-live2d 配置
 *   - assets/css/custom.css                → 自定义光标样式
 *
 * 修改历史：
 *   2025-06 - 初始版本：支持拖拽 + 位置持久化
 *   2026-03 - 修复刷新后位置抽搐：从 setTimeout 延迟恢复改为
 *             !important 压制 slide-in 动画并立即定位
 * ==========================================================================
 */
(function () {
  /* ---- 常量配置 ---- */
  var STORAGE_KEY   = 'live2d-drag-pos';  // localStorage 键名
  var DRAG_THRESHOLD = 5;                 // 拖拽判定距离（px），低于此值视为点击
  var POLL_INTERVAL  = 200;               // 轮询查找元素间隔（ms）
  var POLL_TIMEOUT   = 15000;             // 轮询超时上限（ms），超时放弃初始化

  /* ---- 工具函数 ---- */

  /**
   * 将数值限制在 [min, max] 范围内
   */
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /**
   * 将位置坐标保存到 localStorage
   * @param {number} x - 距离视口左侧的像素值
   * @param {number} y - 距离视口顶部的像素值
   */
  function savePos(x, y) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x, y: y })); } catch (_) {}
  }

  /**
   * 从 localStorage 读取保存的位置
   * @returns {{ x: number, y: number } | null} 位置对象或 null
   */
  function loadPos() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && typeof d.x === 'number' && typeof d.y === 'number') return d;
    } catch (_) {}
    return null;
  }

  /**
   * 将元素定位到指定坐标，自动 clamp 防止超出视口
   * 使用 top/left 绝对定位，清除 bottom/right 避免冲突
   * @param {HTMLElement} el - #oml2d-stage 元素
   * @param {number} x - 目标 x 坐标
   * @param {number} y - 目标 y 坐标
   * @returns {{ x: number, y: number }} clamp 后的实际坐标
   */
  function applyPos(el, x, y) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = el.offsetWidth || 200, h = el.offsetHeight || 350; // 回退尺寸
    x = clamp(x, 0, vw - w);
    y = clamp(y, 0, vh - h);
    el.style.left   = x + 'px';
    el.style.top    = y + 'px';
    el.style.bottom = 'auto';  // 清除 oh-my-live2d 默认的 bottom 定位
    el.style.right  = 'auto';
    return { x: x, y: y };
  }

  /* ---- 核心：初始化拖拽逻辑 ---- */

  /**
   * 为 #oml2d-stage 绑定拖拽事件
   * @param {HTMLElement} stage - Live2D 舞台元素
   */
  function initDrag(stage) {
    var dragging = false;  // 是否处于按下状态
    var moved    = false;  // 是否超过拖拽阈值（区分点击与拖拽）
    var startX = 0, startY = 0;  // mousedown/touchstart 时的鼠标位置
    var offX   = 0, offY   = 0;  // 鼠标相对于元素左上角的偏移

    /*
     * ★ 恢复上次保存的位置
     *
     * 关键设计：用 !important 立即压制 oh-my-live2d 的 slide-in 动画
     * （transition / transform / animation），然后直接 applyPos 定位。
     *
     * 2 秒后移除 !important —— 此时 oh-my-live2d 初始化完毕，
     * 不会再重新触发 slide-in，恢复正常的 CSS 属性即可。
     *
     * 旧方案（setTimeout 1500ms 后定位）会导致：
     *   先播放 slide-in 动画 → 突然跳到保存位置 → 视觉"抽搐"
     */
    var saved = loadPos();
    if (saved) {
      stage.style.setProperty('transition', 'none', 'important');
      stage.style.setProperty('transform',  'none', 'important');
      stage.style.setProperty('animation',  'none', 'important');
      applyPos(stage, saved.x, saved.y);

      setTimeout(function () {
        stage.style.removeProperty('transition');
        stage.style.removeProperty('animation');
        stage.style.setProperty('transform', 'none'); // 保留 transform:none 防止残余动画
      }, 2000);
    }

    /*
     * 窗口 resize 时重新 clamp 位置，防止缩小窗口后元素跑到视口外
     */
    window.addEventListener('resize', function () {
      var r = stage.getBoundingClientRect();
      var p = applyPos(stage, r.left, r.top);
      savePos(p.x, p.y);
    });

    /* 兼容鼠标/触摸：统一提取坐标 */
    function px(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function py(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    /**
     * 按下事件处理（mousedown / touchstart）
     * 记录起始位置和偏移，进入 dragging 状态
     */
    function down(e) {
      if (e.button && e.button !== 0) return; // 仅左键
      dragging = true; moved = false;
      var r = stage.getBoundingClientRect();
      startX = px(e); startY = py(e);
      offX = startX - r.left; offY = startY - r.top;
    }

    /**
     * 移动事件处理（mousemove / touchmove）
     * 超过阈值后才进入拖拽模式，避免误触
     */
    function move(e) {
      if (!dragging) return;
      var cx = px(e), cy = py(e);
      if (!moved) {
        /* 判断是否超过拖拽阈值 */
        var dx = cx - startX, dy = cy - startY;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        moved = true;
        stage.style.opacity = '0.82';     // 拖拽中半透明反馈
        stage.style.cursor  = 'grabbing';
        /* 将 oh-my-live2d 的 bottom 定位切换为 top 定位 */
        var r = stage.getBoundingClientRect();
        stage.style.top    = r.top + 'px';
        stage.style.bottom = 'auto';
        stage.style.right  = 'auto';
        stage.style.transition = 'none';  // 拖拽期间禁用过渡
      }
      e.preventDefault(); // 阻止触摸滚动页面
      applyPos(stage, cx - offX, cy - offY);
    }

    /**
     * 松开事件处理（mouseup / touchend）
     * 保存位置，并拦截紧随其后的 click 事件防止误触按钮
     */
    function up() {
      if (!dragging) return;
      dragging = false;
      stage.style.opacity = '';
      stage.style.cursor  = 'grab';
      if (moved) {
        var r = stage.getBoundingClientRect();
        savePos(r.left, r.top);
        /*
         * 拖拽结束后，浏览器会立即派发一个 click 事件。
         * 捕获并吞掉这个 click，防止意外触发 Live2D 菜单按钮。
         * 只拦截一次，之后自动移除。
         */
        var capture = function (ev) {
          ev.stopPropagation(); ev.preventDefault();
          stage.removeEventListener('click', capture, true);
        };
        stage.addEventListener('click', capture, true);
      }
      moved = false;
    }

    /* ---- 绑定事件 ---- */
    stage.addEventListener('mousedown', down, false);
    document.addEventListener('mousemove', move, false);
    document.addEventListener('mouseup',   up, false);
    stage.addEventListener('touchstart', down, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend',  up, false);

    stage.style.cursor = 'grab'; // 默认光标
  }

  /* ---- DOM 就绪等待 ---- */

  /**
   * 等待指定选择器的元素出现在 DOM 中
   * 使用 MutationObserver（即时响应）+ setInterval 轮询（兜底）双重策略
   * @param {string} sel - CSS 选择器
   * @param {function} cb - 元素出现后的回调
   */
  function waitFor(sel, cb) {
    var elapsed = 0, el = document.querySelector(sel);
    if (el) { cb(el); return; } // 已存在则直接执行

    /* MutationObserver：监听 DOM 变化，element 出现后立即回调 */
    var obs = new MutationObserver(function () {
      el = document.querySelector(sel);
      if (el) { obs.disconnect(); clearInterval(poll); cb(el); }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    /* 轮询兜底：防止 MutationObserver 在某些边界情况下漏掉 */
    var poll = setInterval(function () {
      elapsed += POLL_INTERVAL;
      el = document.querySelector(sel);
      if (el) { obs.disconnect(); clearInterval(poll); cb(el); }
      else if (elapsed >= POLL_TIMEOUT) { obs.disconnect(); clearInterval(poll); }
    }, POLL_INTERVAL);
  }

  /**
   * 入口：等待 #oml2d-stage 出现后启动拖拽
   */
  function main() {
    waitFor('#oml2d-stage', function (stage) { initDrag(stage); });
  }

  /* DOMContentLoaded 或立即执行 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else { main(); }
})();
