/**
 * ==========================================================================
 * 搜索快捷键增强 (search-hint.js)
 * ==========================================================================
 *
 * 功能：
 *   1. 在搜索按钮旁显示快捷键提示徽章 (Ctrl+K / ⌘K)
 *   2. 添加 Ctrl+K / ⌘+K 键盘快捷键打开搜索（Blowfish 默认仅支持 /）
 *
 * 修改历史：
 *   2026-03 - 初始版本
 * ==========================================================================
 */
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
