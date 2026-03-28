/* 📖 阅读进度条 - 仅在文章页显示 */
(function () {
  'use strict';

  // 仅在有 article-content 的页面（即文章详情页）生效
  var article = document.querySelector('.article-content');
  if (!article) return;

  // 创建进度条元素
  var bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var ticking = false;

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      bar.style.width = '100%';
      return;
    }
    var pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    bar.style.width = pct + '%';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  updateProgress();
})();
