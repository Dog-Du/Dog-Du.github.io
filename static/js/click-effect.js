/**
 * ✨ 鼠标点击特效 - 随机绽放爱心/星星/文字
 */
(function () {
  'use strict';
  var symbols = ['❤', '✨', '⭐', '🌸', '💫', '♪', '☆', '🌟'];
  var colors = [
    'rgb(240, 96, 144)',   // sakura pink
    'rgb(146, 122, 237)',  // lavender
    'rgb(255, 176, 199)',  // light pink
    'rgb(172, 155, 246)',  // light purple
    'rgb(255, 209, 222)',  // blush
    'rgb(124, 96, 220)'   // deep lavender
  ];

  document.addEventListener('click', function (e) {
    var span = document.createElement('span');
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      'z-index:99999',
      'font-size:' + (Math.random() * 10 + 14) + 'px',
      'left:' + e.clientX + 'px',
      'top:' + e.clientY + 'px',
      'color:' + colors[Math.floor(Math.random() * colors.length)],
      'user-select:none',
      'opacity:1',
      'transition:all 0.8s ease-out',
      'transform:translate(-50%,-50%) scale(1)'
    ].join(';');
    document.body.appendChild(span);

    requestAnimationFrame(function () {
      span.style.opacity = '0';
      span.style.transform = 'translate(-50%,-50%) translateY(-60px) scale(1.5) rotate(' +
        (Math.random() * 40 - 20) + 'deg)';
    });

    setTimeout(function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    }, 850);
  });
})();
