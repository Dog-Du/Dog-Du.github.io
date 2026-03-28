/**
 * ==========================================================================
 * 页脚动漫台词 (footer-quote.js)
 * ==========================================================================
 *
 * 功能概述：
 *   在页面底部页脚区域插入一行动漫相关的引导文字，
 *   链接指向博主的 Bangumi 个人主页。
 *
 * 工作原理：
 *   1. 查找 #site-footer 元素（Blowfish 主题的页脚容器）
 *   2. 检查是否已存在 .anime-quote（防止重复插入）
 *   3. 创建 <p> 元素并插入到页脚末尾
 *
 * 样式说明：
 *   - 使用 LXGW WenKai 字体保持与博客整体风格一致
 *   - 链接使用虚线下划线，hover 无特殊效果（继承全局样式）
 *   - 颜色使用 CSS 变量，自动适配亮色/暗色主题
 *
 * 相关文件：
 *   - layouts/partials/extend-footer.html → <script src="/js/footer-quote.js" defer>
 *
 * 修改历史：
 *   2025-06 - 初始版本
 * ==========================================================================
 */
(function () {
  'use strict';

  /**
   * 注入页脚台词到 #site-footer
   * 仅执行一次，通过 .anime-quote 类名判断是否已注入
   */
  function inject() {
    var footer = document.querySelector('#site-footer');
    if (!footer || footer.querySelector('.anime-quote')) return; // 不存在或已注入

    var el = document.createElement('p');
    el.className = 'anime-quote';
    el.style.cssText = [
      'text-align:center',
      'font-size:0.8rem',
      'margin-top:0.75rem',
      'color:rgb(var(--color-neutral-400))',  // 使用 Blowfish 主题色变量
      'font-family:"LXGW WenKai",sans-serif',
      'font-style:italic'
    ].join(';') + ';';

    /* 链接到博主 Bangumi 个人主页 */
    el.innerHTML = '「<a href="https://bangumi.tv/user/dogdu" target="_blank" ' +
      'rel="noopener noreferrer" ' +
      'style="color:rgb(var(--color-primary-500));text-decoration:none;' +
      'border-bottom:1px dashed rgb(var(--color-primary-300));">' +
      '学累了就看会动漫吧~</a>」';

    footer.appendChild(el);
  }

  /* DOMContentLoaded 或立即执行 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
