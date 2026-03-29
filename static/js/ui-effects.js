/**
 * ==========================================================================
 * UI Effects Bundle (ui-effects.js)
 * ==========================================================================
 * Modules:
 *   1. 鼠标点击特效 (click-effect)
 *   2. 代码复制 Toast 提示 (copy-toast)
 *   3. 搜索快捷键增强 (search-hint)
 * ==========================================================================
 */

/* ==========================================================================
 * [Module 1/3] 鼠标点击特效 (click-effect)
 * ==========================================================================
 *
 * 功能概述：
 *   在鼠标点击位置生成一个随机 emoji，伴随上浮、放大、旋转、淡出的动画。
 *   为博客增添趣味性和互动感。
 *
 * 工作原理：
 *   1. 全局监听 click 事件
 *   2. 在点击坐标创建一个 position:fixed 的 <span> 元素
 *   3. 随机选取 emoji 和颜色
 *   4. 通过 CSS transition 实现上浮 + 缩放 + 旋转 + 淡出动画
 *   5. 动画结束后（900ms）自动移除 DOM 元素，避免内存泄漏
 *
 * 自定义：
 *   - symbols 数组：修改可出现的 emoji 种类（当前 30 种）
 *   - colors 数组：修改 emoji 的渲染颜色（对单色字符生效）
 *   - fontSize：14~24px 随机大小
 *   - translateY(-60px)：上浮距离
 *   - rotate(±20deg)：随机旋转角度
 *   - 0.8s ease-out：动画时长和缓动曲线
 *
 * 修改历史：
 *   2025-06 - 初始版本：8 种 emoji
 *   2026-03 - 扩充至 30 种 emoji，新增小黄脸表情类，增加 2 种颜色
 * ========================================================================== */
(function () {
  'use strict';

  /* reduced-motion: skip click effect */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /**
   * 可出现的 emoji 列表（共 30 种）
   * 分为 4 大类，保证视觉多样性
   */
  var symbols = [
    /* ❤ 爱心 & 星星 —— 经典浪漫系 */
    '❤', '💖', '💗', '💕', '✨', '⭐', '🌟', '💫', '☆',
    /* 🌸 花卉 & 自然 —— 清新自然系 */
    '🌸', '🌺', '🍀', '🌷', '🌻',
    /* 😊 小黄脸 & 表情 —— 可爱互动系 */
    '😊', '😄', '🥰', '😘', '🤗', '😆', '😋', '🥳', '😸',
    /* 🎉 手势 & 符号 —— 趣味点缀系 */
    '🎉', '🎶', '♪', '👻', '🦋', '🍬', '🧸'
  ];

  /**
   * emoji 渲染颜色池
   * 主要影响单色字符（如 ❤、☆、♪），彩色 emoji 不受 CSS color 影响
   */
  var colors = [
    'rgb(240, 96, 144)',   // 樱花粉
    'rgb(146, 122, 237)',  // 薰衣草紫
    'rgb(255, 176, 199)',  // 浅粉
    'rgb(172, 155, 246)',  // 淡紫
    'rgb(255, 209, 222)',  // 蜜桃粉
    'rgb(124, 96, 220)',   // 深紫
    'rgb(255, 154, 86)',   // 暖橙
    'rgb(100, 200, 160)'   // 薄荷绿
  ];

  document.addEventListener('click', function (e) {
    /* 创建 emoji 元素 */
    var span = document.createElement('span');
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    /* 基础样式：固定定位、不响应鼠标、最高层级 */
    span.style.position     = 'fixed';
    span.style.pointerEvents = 'none';
    span.style.zIndex        = '99999';
    span.style.fontSize      = (Math.random() * 10 + 14) + 'px'; // 14~24px
    span.style.left          = e.clientX + 'px';
    span.style.top           = e.clientY + 'px';
    span.style.color         = colors[Math.floor(Math.random() * colors.length)];
    span.style.userSelect    = 'none';
    span.style.opacity       = '1';
    span.style.transform     = 'translate(-50%,-50%) scale(1)';  // 居中于点击点
    document.body.appendChild(span);

    /*
     * 强制浏览器完成一次布局（reflow），确保初始状态被渲染。
     * 之后设置 transition 才能看到从"初始 → 结束"的完整动画。
     * 如果不 reflow，浏览器会合并样式变更，跳过动画。
     */
    void span.offsetHeight;

    /* 启动动画：上浮 60px + 放大 1.5 倍 + 随机旋转 + 淡出 */
    span.style.transition = 'all 0.8s ease-out';
    span.style.opacity    = '0';
    span.style.transform  = 'translate(-50%,-50%) translateY(-60px) scale(1.5) rotate(' +
      (Math.random() * 40 - 20) + 'deg)';

    /* 动画结束后移除 DOM 元素，防止累积 */
    setTimeout(function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    }, 900); // 略大于 transition 时长 800ms，确保动画完成
  });
})();

/* ==========================================================================
 * [Module 2/3] 代码复制 Toast 提示 (copy-toast)
 * ==========================================================================
 *
 * 功能：监听 Blowfish 主题的代码复制按钮点击事件，
 *       在页面顶部显示一个短暂的 toast 提示。
 *
 * 原理：
 *   Blowfish 的 copy-button 点击后会将 innerText 改为 "Copied"，
 *   我们用 MutationObserver 监听这一文字变化来触发 toast。
 *
 * 修改历史：
 *   2026-03 - 初始版本
 * ========================================================================== */
(function () {
  'use strict';

  var TOAST_DURATION = 2000;
  var toast = null;

  function createToast() {
    var el = document.createElement('div');
    el.className = 'copy-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = '✅ 代码已复制到剪贴板';
    document.body.appendChild(el);
    return el;
  }

  function showToast() {
    if (!toast) toast = createToast();
    /* 重置动画 */
    toast.classList.remove('copy-toast--visible');
    void toast.offsetHeight;
    toast.classList.add('copy-toast--visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('copy-toast--visible');
    }, TOAST_DURATION);
  }

  /* 监听所有 copy-button 的文字变化 */
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'childList' || m.type === 'characterData') {
        var target = m.target.nodeType === 3 ? m.target.parentElement : m.target;
        if (target && target.classList && target.classList.contains('copy-button')) {
          var text = target.textContent || target.innerText;
          if (text.toLowerCase().indexOf('copied') !== -1 ||
              text.indexOf('已复制') !== -1) {
            showToast();
          }
        }
      }
    });
  });

  function init() {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ==========================================================================
 * [Module 3/3] 搜索快捷键增强 (search-hint)
 * ==========================================================================
 *
 * 功能：
 *   1. 在搜索按钮旁显示快捷键提示徽章 (Ctrl+K / ⌘K)
 *   2. 添加 Ctrl+K / ⌘+K 键盘快捷键打开搜索（Blowfish 默认仅支持 /）
 *
 * 修改历史：
 *   2026-03 - 初始版本
 * ========================================================================== */
(function () {
  'use strict';

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var hintText = isMac ? '⌘K' : 'Ctrl+K';

  function addSearchHint() {
    /* 查找 Blowfish 的搜索按钮 */
    var searchBtn = document.getElementById('search-button')
      || document.querySelector('[id*="search"] button')
      || document.querySelector('button[title*="earch"]');
    if (!searchBtn) return;

    /* 避免重复添加 */
    if (searchBtn.querySelector('.search-hint-badge')) return;

    var badge = document.createElement('span');
    badge.className = 'search-hint-badge';
    badge.textContent = hintText;
    searchBtn.style.position = 'relative';
    searchBtn.appendChild(badge);
  }

  function handleKeydown(e) {
    /* Ctrl+K / ⌘+K 打开搜索 */
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      /* 尝试触发 Blowfish 的搜索按钮 */
      var searchBtn = document.getElementById('search-button')
        || document.querySelector('[id*="search"] button')
        || document.querySelector('button[title*="earch"]');
      if (searchBtn) searchBtn.click();
    }
  }

  function init() {
    addSearchHint();
    document.addEventListener('keydown', handleKeydown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
