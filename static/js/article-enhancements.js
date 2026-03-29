/**
 * Article Enhancements
 * - GLightbox 图片灯箱初始化
 * - 移动端 TOC 浮动按钮 + 底部抽屉
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initLightbox();
    initMobileTOC();
  });

  /* ── 图片灯箱 ─────────────────────────────────────────────── */
  function initLightbox() {
    var images = document.querySelectorAll('.article-content img');
    if (!images.length) return;

    images.forEach(function (img) {
      // 跳过已在链接中的图片、emoji、头像等装饰图
      if (img.closest('a')) return;
      if (img.closest('.not-prose')) return;
      if (img.width < 64 || img.height < 64) return;

      var wrapper = document.createElement('a');
      wrapper.href = img.src;
      wrapper.classList.add('glightbox');
      wrapper.setAttribute('data-gallery', 'article');
      wrapper.setAttribute('data-desc-position', 'bottom');

      // 使用 alt 文本作为描述
      if (img.alt) {
        wrapper.setAttribute('data-description', img.alt);
      }

      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    });

    // 初始化 GLightbox
    if (typeof GLightbox !== 'undefined') {
      GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        closeOnOutsideClick: true,
        openEffect: 'fade',
        closeEffect: 'fade',
      });
    }
  }

  /* ── 移动端 TOC ────────────────────────────────────────────── */
  function initMobileTOC() {
    var toc = document.getElementById('TableOfContents');
    if (!toc || !toc.innerHTML.trim()) return;

    // 创建浮动按钮
    var btn = document.createElement('button');
    btn.id = 'mobile-toc-btn';
    btn.className = 'mobile-toc-btn';
    btn.setAttribute('aria-label', '目录');
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>' +
      '<line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>' +
      '<line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';

    // 创建抽屉
    var drawer = document.createElement('div');
    drawer.id = 'mobile-toc-drawer';
    drawer.className = 'mobile-toc-drawer';
    drawer.innerHTML =
      '<div class="mobile-toc-drawer__backdrop"></div>' +
      '<div class="mobile-toc-drawer__panel">' +
      '  <div class="mobile-toc-drawer__header">' +
      '    <span>\u{1F4D1} 文章目录</span>' +
      '    <button class="mobile-toc-drawer__close" aria-label="关闭">\u2715</button>' +
      '  </div>' +
      '  <nav class="mobile-toc-drawer__body"></nav>' +
      '</div>';

    document.body.appendChild(btn);
    document.body.appendChild(drawer);

    // 克隆 TOC 内容
    var body = drawer.querySelector('.mobile-toc-drawer__body');
    body.innerHTML = toc.innerHTML;

    function openDrawer() {
      drawer.classList.add('mobile-toc-drawer--open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('mobile-toc-drawer--open');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', openDrawer);
    drawer.querySelector('.mobile-toc-drawer__backdrop').addEventListener('click', closeDrawer);
    drawer.querySelector('.mobile-toc-drawer__close').addEventListener('click', closeDrawer);

    // 点击目录链接后关闭抽屉
    body.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('mobile-toc-drawer--open')) {
        closeDrawer();
      }
    });
  }
})();
