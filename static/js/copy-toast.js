/**
 * ==========================================================================
 * 代码复制 Toast 提示 (copy-toast.js)
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
 * ==========================================================================
 */
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
