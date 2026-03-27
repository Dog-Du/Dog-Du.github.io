/**
 * 🎌 页脚台词 - 学累了就看会动漫吧~
 */
(function () {
  'use strict';
  function inject() {
    var footer = document.querySelector('#site-footer');
    if (!footer || footer.querySelector('.anime-quote')) return;

    var el = document.createElement('p');
    el.className = 'anime-quote';
    el.style.cssText = 'text-align:center;font-size:0.8rem;margin-top:0.75rem;color:rgb(var(--color-neutral-400));font-family:"LXGW WenKai",sans-serif;font-style:italic;';
    el.innerHTML = '「<a href="https://bangumi.tv/user/dogdu" target="_blank" rel="noopener noreferrer" style="color:rgb(var(--color-primary-500));text-decoration:none;border-bottom:1px dashed rgb(var(--color-primary-300));">学累了就看会动漫吧~</a>」';
    footer.appendChild(el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
