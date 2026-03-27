/**
 * ✨ 鼠标点击特效 - 随机绽放爱心/星星/花瓣
 */
(function () {
  'use strict';
  var symbols = ['❤', '✨', '⭐', '🌸', '💫', '♪', '☆', '🌟'];
  var colors = [
    'rgb(240, 96, 144)',
    'rgb(146, 122, 237)',
    'rgb(255, 176, 199)',
    'rgb(172, 155, 246)',
    'rgb(255, 209, 222)',
    'rgb(124, 96, 220)'
  ];

  document.addEventListener('click', function (e) {
    var span = document.createElement('span');
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.position = 'fixed';
    span.style.pointerEvents = 'none';
    span.style.zIndex = '99999';
    span.style.fontSize = (Math.random() * 10 + 14) + 'px';
    span.style.left = e.clientX + 'px';
    span.style.top = e.clientY + 'px';
    span.style.color = colors[Math.floor(Math.random() * colors.length)];
    span.style.userSelect = 'none';
    span.style.opacity = '1';
    span.style.transform = 'translate(-50%,-50%) scale(1)';
    document.body.appendChild(span);

    // 强制浏览器渲染初始帧，再触发过渡
    void span.offsetHeight;
    span.style.transition = 'all 0.8s ease-out';
    span.style.opacity = '0';
    span.style.transform = 'translate(-50%,-50%) translateY(-60px) scale(1.5) rotate(' +
      (Math.random() * 40 - 20) + 'deg)';

    setTimeout(function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    }, 900);
  });
})();
