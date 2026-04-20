/**
 * UI effects bundle.
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
    el.textContent = '代码已复制到剪贴板';
    document.body.appendChild(el);
    return el;
  }

  function showToast() {
    if (!toast) toast = createToast();

    toast.classList.remove('copy-toast--visible');
    void toast.offsetHeight;
    toast.classList.add('copy-toast--visible');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('copy-toast--visible');
    }, TOAST_DURATION);
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type !== 'childList' && mutation.type !== 'characterData') return;

      var target = mutation.target.nodeType === 3 ? mutation.target.parentElement : mutation.target;
      if (!target || !target.classList || !target.classList.contains('copy-button')) return;

      var text = target.textContent || target.innerText || '';
      if (text.toLowerCase().indexOf('copied') !== -1 || text.indexOf('已复制') !== -1) {
        showToast();
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

(function () {
  'use strict';

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var hintText = isMac ? '⌘K' : 'Ctrl+K';

  function addSearchHint() {
    var searchBtn = document.getElementById('search-button')
      || document.querySelector('[id*="search"] button')
      || document.querySelector('button[title*="earch"]');

    if (!searchBtn) return;
    if (searchBtn.querySelector('.search-hint-badge')) return;

    var badge = document.createElement('span');
    badge.className = 'search-hint-badge';
    badge.textContent = hintText;
    searchBtn.style.position = 'relative';
    searchBtn.appendChild(badge);
  }

  function handleKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();

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
