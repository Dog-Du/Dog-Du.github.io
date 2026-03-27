/**
 * 🌸 Sakura Falling Effect
 * 轻量级樱花飘落动画 - Canvas 实现
 * 仅在首页显示，不影响文章阅读
 */
(function () {
  'use strict';

  // 仅在首页生效
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;

  var isMobile = /Mobi|Android/i.test(navigator.userAgent);
  var PETAL_COUNT = isMobile ? 15 : 30;

  var canvas = document.createElement('canvas');
  canvas.id = 'sakura-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var petals = [];
  var animId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Petal() {
    this.reset();
    this.y = Math.random() * canvas.height * -1;
  }

  Petal.prototype.reset = function () {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 8 + 4;
    this.speedY = Math.random() * 1 + 0.5;
    this.speedX = Math.random() * 1.5 - 0.75;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.opacity = Math.random() * 0.4 + 0.3;
    this.swing = Math.random() * 2;
    this.swingSpeed = Math.random() * 0.02 + 0.01;
    this.swingOffset = Math.random() * Math.PI * 2;
    var hue = Math.random() * 15 + 340;
    var sat = Math.random() * 20 + 70;
    var light = Math.random() * 15 + 78;
    this.color = 'hsla(' + (hue % 360) + ',' + sat + '%,' + light + '%,' + this.opacity + ')';
  };

  Petal.prototype.update = function () {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.swingOffset) * this.swing * 0.3;
    this.swingOffset += this.swingSpeed;
    this.rotation += this.rotationSpeed;
    if (this.y > canvas.height + 10 || this.x < -20 || this.x > canvas.width + 20) {
      this.reset();
    }
  };

  Petal.prototype.draw = function () {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(this.size * 0.5, -this.size * 0.3, this.size, -this.size * 0.2, this.size, 0);
    ctx.bezierCurveTo(this.size, this.size * 0.2, this.size * 0.5, this.size * 0.3, 0, 0);
    ctx.fill();
    ctx.restore();
  };

  for (var i = 0; i < PETAL_COUNT; i++) {
    petals.push(new Petal());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }
    animId = requestAnimationFrame(animate);
  }

  animate();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (animId) cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });
})();
