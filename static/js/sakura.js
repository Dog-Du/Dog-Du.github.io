/**
 * ==========================================================================
 * 樱花飘落特效 (sakura.js)
 * ==========================================================================
 *
 * 功能概述：
 *   在首页绘制持续飘落的樱花花瓣动画，营造浪漫的视觉氛围。
 *   使用 Canvas 2D 绘制，不影响页面交互（pointer-events: none）。
 *
 * 工作原理：
 *   1. 仅在首页（/ 或 /index.html）生效，其他页面直接 return
 *   2. 创建全屏 Canvas 覆盖层（fixed 定位，z-index: 999）
 *   3. 生成若干花瓣对象（移动端 15 个，桌面端 30 个）
 *   4. 每帧更新花瓣位置（下落 + 水平摇摆 + 旋转），用贝塞尔曲线绘制花瓣形状
 *   5. 花瓣飘出画布底部后重置到顶部，实现无限循环
 *   6. 页面不可见时（切换标签页）暂停动画，节省资源
 *
 * 性能考量：
 *   - 花瓣数量根据设备类型自适应（移动端减半）
 *   - 使用 requestAnimationFrame 而非 setInterval
 *   - visibilitychange 事件暂停/恢复动画
 *   - pointer-events: none 确保不阻塞用户交互
 *
 * 自定义参数：
 *   - PETAL_COUNT：花瓣数量
 *   - speedY：下落速度（0.5~1.5）
 *   - speedX：水平漂移速度（-0.75~0.75）
 *   - size：花瓣大小（4~12px）
 *   - hue 340~355°：樱花粉色系的色相范围
 *
 * 相关文件：
 *   - layouts/partials/extend-footer.html → <script src="/js/sakura.js" defer>
 *
 * 修改历史：
 *   2025-06 - 初始版本
 * ==========================================================================
 */
(function () {
  'use strict';

  /* ---- 页面限定：仅首页生效 ---- */
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;

  /* ---- 设备检测 & 花瓣数量 ---- */
  var isMobile = /Mobi|Android/i.test(navigator.userAgent);
  var PETAL_COUNT = isMobile ? 15 : 30; // 移动端减少花瓣以保证性能

  /* ---- 创建全屏 Canvas 覆盖层 ---- */
  var canvas = document.createElement('canvas');
  canvas.id = 'sakura-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var petals = [];   // 花瓣对象池
  var animId = null;  // requestAnimationFrame ID，用于暂停/恢复

  /** 同步 Canvas 尺寸与视口 */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /**
   * 花瓣构造函数
   * 初始 y 坐标随机分布在画布上方（负值区域），避免启动时全部从顶部同时出现
   */
  function Petal() {
    this.reset();
    this.y = Math.random() * canvas.height * -1; // 初始散布在屏幕上方不同高度
  }

  /**
   * 重置花瓣参数（飘出画布后调用，实现循环复用）
   * 每次重置都重新随机化所有属性，保证视觉多样性
   */
  Petal.prototype.reset = function () {
    this.x     = Math.random() * canvas.width;    // 水平随机位置
    this.y     = -10;                              // 从顶部略上方开始
    this.size  = Math.random() * 8 + 4;           // 花瓣大小 4~12px
    this.speedY = Math.random() * 1 + 0.5;        // 下落速度 0.5~1.5
    this.speedX = Math.random() * 1.5 - 0.75;     // 水平漂移 -0.75~0.75

    /* 旋转参数 */
    this.rotation      = Math.random() * Math.PI * 2;  // 初始旋转角
    this.rotationSpeed = (Math.random() - 0.5) * 0.02; // 旋转速度

    /* 透明度 */
    this.opacity = Math.random() * 0.4 + 0.3;     // 0.3~0.7，半透明质感

    /* 左右摇摆参数（模拟风吹效果） */
    this.swing       = Math.random() * 2;          // 摇摆幅度
    this.swingSpeed  = Math.random() * 0.02 + 0.01; // 摇摆频率
    this.swingOffset = Math.random() * Math.PI * 2;  // 摇摆相位偏移

    /* 颜色：樱花粉色系 HSL
     * hue 340~355°（粉红区间），sat 70~90%，light 78~93%
     */
    var hue   = Math.random() * 15 + 340;
    var sat   = Math.random() * 20 + 70;
    var light = Math.random() * 15 + 78;
    this.color = 'hsla(' + (hue % 360) + ',' + sat + '%,' + light + '%,' + this.opacity + ')';
  };

  /** 每帧更新花瓣位置 */
  Petal.prototype.update = function () {
    this.y += this.speedY;                                              // 下落
    this.x += this.speedX + Math.sin(this.swingOffset) * this.swing * 0.3; // 水平漂移 + 正弦摇摆
    this.swingOffset += this.swingSpeed;                                // 推进摇摆相位
    this.rotation    += this.rotationSpeed;                             // 旋转
    /* 飘出画布则重置 */
    if (this.y > canvas.height + 10 || this.x < -20 || this.x > canvas.width + 20) {
      this.reset();
    }
  };

  /**
   * 绘制单个花瓣
   * 使用两条贝塞尔曲线围成的叶片形状，比圆形/椭圆更像真实花瓣
   */
  Petal.prototype.draw = function () {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.moveTo(0, 0);
    /* 上半弧 */
    ctx.bezierCurveTo(this.size * 0.5, -this.size * 0.3, this.size, -this.size * 0.2, this.size, 0);
    /* 下半弧（对称回到原点） */
    ctx.bezierCurveTo(this.size, this.size * 0.2, this.size * 0.5, this.size * 0.3, 0, 0);
    ctx.fill();
    ctx.restore();
  };

  /* ---- 初始化花瓣对象池 ---- */
  for (var i = 0; i < PETAL_COUNT; i++) {
    petals.push(new Petal());
  }

  /** 动画主循环 */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
    animId = requestAnimationFrame(animate);
  }

  animate();

  /* ---- 页面不可见时暂停动画，节省 CPU/GPU ---- */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (animId) cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });
})();
