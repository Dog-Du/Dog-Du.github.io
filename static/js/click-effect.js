/**
 * ==========================================================================
 * 鼠标点击特效 (click-effect.js)
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
 * 相关文件：
 *   - layouts/partials/extend-footer.html → <script src="/js/click-effect.js" defer>
 *
 * 修改历史：
 *   2025-06 - 初始版本：8 种 emoji
 *   2026-03 - 扩充至 30 种 emoji，新增小黄脸表情类，增加 2 种颜色
 * ==========================================================================
 */
(function () {
  'use strict';

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
