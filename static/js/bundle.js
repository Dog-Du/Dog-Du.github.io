/**
 * ==========================================================================
 * Live2D Bundle (live2d.js)
 * ==========================================================================
 * Modules:
 *   1. Live2D 看板娘配置与懒加载 (live2d-config)
 *   2. Live2D 看板娘拖拽功能 (live2d-drag)
 * ==========================================================================
 */

/* ==========================================================================
 * [Module 1/2] Live2D 看板娘配置与懒加载 (live2d-config)
 * ==========================================================================
 *
 * 功能概述：
 *   延迟加载 oh-my-live2d 库，页面空闲时才初始化看板娘，
 *   避免阻塞首屏渲染。配置角色模型、气泡提示、菜单。
 *
 * 加载策略：
 *   1. 使用 requestIdleCallback（浏览器空闲时）触发加载
 *   2. 降级方案：setTimeout 3 秒后加载（Safari 等不支持 rIC 的浏览器）
 *   3. CDN 版本锁定，避免 @latest 导致意外 breaking change
 *
 * 依赖：
 *   - oh-my-live2d@0.19.3（动态加载，无需预加载）
 *   - live2d-drag（拖拽功能，本文件内 Module 2）
 *
 * 修改历史：
 *   2025-06 - 初始版本（内嵌在 extend-footer.html）
 *   2026-03 - 抽离为独立文件，版本锁定 0.19.3，添加懒加载
 * ========================================================================== */
(function () {
  'use strict';

  /* mobile skip */
  if (window.innerWidth < 768) return;

  /** oh-my-live2d CDN 地址（版本锁定） */
  var OML2D_CDN = 'https://unpkg.com/oh-my-live2d@0.19.3';

  /** 模型资源 CDN 基础路径 */
  var MODEL_CDN = 'https://model.hacxy.cn/';

  /* ------------------------------------------------------------------
   * 角色切换台词（通用随机）
   * ------------------------------------------------------------------ */
  var switchTips = [
    '✨ 新角色登场！请多多关照～',
    '🎉 哒哒！换我上场啦～',
    '🌟 初次见面，请多指教！',
    '🎀 新的小伙伴来咯～',
    '💫 角色切换完成！你喜欢我吗？',
    '🌸 换了个心情，也换个看板娘吧～',
    '🎭 当当当～全新亮相！',
    '✋ 嗨！让我来陪你吧～'
  ];

  /**
   * 显示切换提示气泡
   */
  function showSwitchTip() {
    var tips = document.getElementById('oml2d-tips');
    if (!tips) return;
    var text = switchTips[Math.floor(Math.random() * switchTips.length)];
    var content = tips.querySelector('*') || tips;
    content.textContent = text;
    tips.style.opacity = '1';
    tips.style.visibility = 'visible';
    tips.style.animationName = 'oml2d-display-tips, oml2d-shake-tips';
    setTimeout(function () {
      tips.style.opacity = '0';
      tips.style.visibility = 'hidden';
      tips.style.animationName = 'oml2d-hidden-tips';
    }, 4000);
  }

  /**
   * 初始化 oh-my-live2d
   */
  function initLive2D() {
    OML2D.loadOml2d({
      /* 角色模型列表（共 9 个） */
      models: [
        {
          name: 'HK416-1-normal',
          path: MODEL_CDN + 'HK416-1-normal/model.json',
          position: [0, 60],
          scale: 0.08,
          stageStyle: { height: 450 }
        },
        {
          name: 'HK416-2-destroy',
          path: MODEL_CDN + 'HK416-2-destroy/model.json',
          position: [0, 60],
          scale: 0.08,
          stageStyle: { height: 450 }
        },
        {
          name: 'HK416-2-normal',
          path: MODEL_CDN + 'HK416-2-normal/model.json',
          position: [0, 60],
          scale: 0.08,
          stageStyle: { height: 450 }
        },
        {
          name: 'Pio',
          path: MODEL_CDN + 'Pio/model.json',
          scale: 0.4,
          position: [0, 50],
          stageStyle: { height: 300 }
        },
        {
          name: 'chino',
          path: MODEL_CDN + 'chino/model.json',
          scale: 0.2,
          position: [0, 0],
          stageStyle: { height: 350 }
        },
        {
          name: 'fuko',
          path: MODEL_CDN + 'fuko/fuko.model3.json',
          position: [0, 20],
          stageStyle: { height: 350 }
        },
        {
          name: 'shizuku',
          path: MODEL_CDN + 'shizuku/shizuku.model.json',
          scale: 0.2,
          position: [70, 70],
          stageStyle: { height: 370, width: 400 }
        },
        {
          name: 'shizuku_48',
          path: MODEL_CDN + 'shizuku_48/index.json',
          scale: 0.2,
          position: [30, 30],
          stageStyle: { height: 350, width: 350 }
        },
        {
          name: 'shizuku_pajama',
          path: MODEL_CDN + 'shizuku_pajama/index.json',
          scale: 0.2,
          position: [40, 10],
          stageStyle: { height: 350, width: 330 }
        }
      ],

      /* 气泡提示配置 */
      tips: {
        style: {
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          minHeight: '80px',
          fontSize: '14px',
          borderRadius: '10px',
          filter: 'drop-shadow(0 0 5px rgba(240,96,144,0.3))',
          border: '2px solid rgb(255,209,222)',
          color: 'rgb(82,73,78)',
          backgroundColor: 'rgba(255,245,248,0.95)',
          padding: '8px 10px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '10000',
          fontFamily: '"LXGW WenKai Lite", "LXGW WenKai", sans-serif'
        },
        idleTips: {
          wordTheDay: function (d) {
            return d.hitokoto + (d.from ? ' —— ' + d.from : '');
          },
          message: [
            '你好呀～ 欢迎来到这里！(◕ᴗ◕✿)',
            '今天也要元气满满地写代码哦！ᕦ(ò_óˇ)ᕤ',
            '学累了就休息一下吧，摸摸头～',
            '代码就像魔法一样，每一行都在创造奇迹 ✨',
            '要记得按时吃饭喝水哦～ 身体最重要！',
            '偶尔抬头看看窗外，眼睛会感谢你的 👀',
            '「人生就像代码，有 bug 才有乐趣。」',
            '有什么想对我说的吗？点点我试试看～',
            '今天的你，又比昨天更厉害了一点呢！',
            '据说摸鱼的时候效率最高（bushi',
            '听说这个博客的主人很喜欢动漫呢～ (≧▽≦)',
            '「即使是很小的星星，也会努力发出自己的光。」',
            '在写博客的时候，也是在和未来的自己对话呢。',
            '保持好奇心，这是最棒的超能力！🌟',
            '「所谓活着，就是不断地出发。」—— 银魂',
            '「不管前方的路有多苦，只要方向正确。」—— 千与千寻',
            '这里风景不错吧？都是博主精心布置的哦～',
            '鼠标放在我身上试试？我会跟着你动的！'
          ],
          duration: 6000,
          interval: 10000,
          priority: 2
        },
        welcomeTips: {
          message: {
            daybreak:  '早上好！一日之计在于晨 🌅',
            morning:   '上午好！今天也要加油写代码哦～',
            noon:      '中午了，该去吃午饭啦！🍱',
            afternoon: '下午好～ 来杯咖啡提提神吧 ☕',
            dusk:      '傍晚了，辛苦一天啦～ 🌇',
            night:     '晚上好！今天过得开心吗？',
            lateNight: '已经很晚了哦，早点休息吧，晚安～ 🌙',
            weeHours:  '这么晚还不睡？小心变秃头哦！(╯°□°)╯'
          },
          duration: 6000,
          priority: 3
        },
        copyTips: {
          duration: 3000,
          priority: 3,
          message: ['你复制了什么呢？记得注明出处哦～ (｡•̀ᴗ-)✧']
        }
      },

      /* 菜单配置 */
      menus: {
        items: [
          {
            id: 'Rest',
            icon: 'icon-rest',
            title: '休息',
            onClick: function (i) {
              i.statusBarOpen(i.options.statusBar && i.options.statusBar.restMessage);
              i.clearTips();
              i.setStatusBarClickEvent(function () {
                i.statusBarClose();
                i.stageSlideIn();
                i.statusBarClearEvents();
              });
              i.stageSlideOut();
            }
          },
          {
            id: 'SwitchModel',
            icon: 'icon-switch',
            title: '切换角色',
            onClick: function (i) {
              i.loadNextModel();
              setTimeout(function () {
                showSwitchTip();
              }, 800);
            }
          },
          {
            id: 'About',
            icon: 'icon-about',
            title: '关于',
            onClick: function () {
              window.open('https://oml2d.com');
            }
          }
        ]
      }
    });
  }

  /**
   * 动态加载 oh-my-live2d 库并初始化
   */
  function loadAndInit() {
    var script = document.createElement('script');
    script.src = OML2D_CDN;
    script.onload = initLive2D;
    script.onerror = function () {
      console.warn('[Live2D] CDN 加载失败：' + OML2D_CDN);
    };
    document.head.appendChild(script);
  }

  /**
   * 入口：延迟到浏览器空闲时加载
   * - 支持 requestIdleCallback 的浏览器：空闲时触发（最多等 5 秒）
   * - 不支持的浏览器（Safari 等）：3 秒后触发
   */
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadAndInit, { timeout: 5000 });
  } else {
    setTimeout(loadAndInit, 3000);
  }
})();

/* ==========================================================================
 * [Module 2/2] Live2D 看板娘拖拽功能 (live2d-drag)
 * ==========================================================================
 *
 * 功能概述：
 *   为 oh-my-live2d 创建的 #oml2d-stage 元素添加拖拽移动能力。
 *   支持鼠标和触摸操作，拖拽位置通过 localStorage 持久化，
 *   刷新/切换页面后自动恢复到上次拖拽的位置。
 *
 * 工作原理：
 *   1. 使用 MutationObserver + 轮询双重策略等待 #oml2d-stage 元素出现
 *   2. 元素出现后，若 localStorage 中有保存的位置，立即应用并跳过
 *      oh-my-live2d 自带的 slide-in 入场动画（避免视觉抽搐）
 *   3. 监听 mousedown/mousemove/mouseup 和对应 touch 事件实现拖拽
 *   4. 拖拽超过阈值（5px）后才算「真正移动」，短距离点击不会触发拖拽
 *   5. 拖拽结束后保存位置，窗口 resize 时自动修正防止超出视口
 *
 * 依赖：
 *   - oh-my-live2d 库（创建 #oml2d-stage 元素）
 *   - 需在 oh-my-live2d 之后加载（本文件内 Module 1 已处理顺序）
 *
 * 修改历史：
 *   2025-06 - 初始版本：支持拖拽 + 位置持久化
 *   2026-03 - 修复刷新后位置抽搐：从 setTimeout 延迟恢复改为
 *             !important 压制 slide-in 动画并立即定位
 * ========================================================================== */
(function () {
  'use strict';

  /* ---- 常量配置 ---- */
  var STORAGE_KEY   = 'live2d-drag-pos';  // localStorage 键名
  var DRAG_THRESHOLD = 5;                 // 拖拽判定距离（px），低于此值视为点击
  var POLL_INTERVAL  = 200;               // 轮询查找元素间隔（ms）
  var POLL_TIMEOUT   = 15000;             // 轮询超时上限（ms），超时放弃初始化

  /* ---- 工具函数 ---- */

  /**
   * 将数值限制在 [min, max] 范围内
   */
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /**
   * 将位置坐标保存到 localStorage
   * @param {number} x - 距离视口左侧的像素值
   * @param {number} y - 距离视口顶部的像素值
   */
  function savePos(x, y) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: x, y: y })); } catch (_) {}
  }

  /**
   * 从 localStorage 读取保存的位置
   * @returns {{ x: number, y: number } | null} 位置对象或 null
   */
  function loadPos() {
    try {
      var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && typeof d.x === 'number' && typeof d.y === 'number') return d;
    } catch (_) {}
    return null;
  }

  /**
   * 将元素定位到指定坐标，自动 clamp 防止超出视口
   * 使用 top/left 绝对定位，清除 bottom/right 避免冲突
   * @param {HTMLElement} el - #oml2d-stage 元素
   * @param {number} x - 目标 x 坐标
   * @param {number} y - 目标 y 坐标
   * @returns {{ x: number, y: number }} clamp 后的实际坐标
   */
  function applyPos(el, x, y) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = el.offsetWidth || 200, h = el.offsetHeight || 350; // 回退尺寸
    x = clamp(x, 0, vw - w);
    y = clamp(y, 0, vh - h);
    el.style.left   = x + 'px';
    el.style.top    = y + 'px';
    el.style.bottom = 'auto';  // 清除 oh-my-live2d 默认的 bottom 定位
    el.style.right  = 'auto';
    return { x: x, y: y };
  }

  /* ---- 核心：初始化拖拽逻辑 ---- */

  /**
   * 为 #oml2d-stage 绑定拖拽事件
   * @param {HTMLElement} stage - Live2D 舞台元素
   */
  function initDrag(stage) {
    var dragging = false;  // 是否处于按下状态
    var moved    = false;  // 是否超过拖拽阈值（区分点击与拖拽）
    var startX = 0, startY = 0;  // mousedown/touchstart 时的鼠标位置
    var offX   = 0, offY   = 0;  // 鼠标相对于元素左上角的偏移

    /*
     * ★ 恢复上次保存的位置
     *
     * 关键设计：用 !important 立即压制 oh-my-live2d 的 slide-in 动画
     * （transition / transform / animation），然后直接 applyPos 定位。
     *
     * 2 秒后移除 !important —— 此时 oh-my-live2d 初始化完毕，
     * 不会再重新触发 slide-in，恢复正常的 CSS 属性即可。
     *
     * 旧方案（setTimeout 1500ms 后定位）会导致：
     *   先播放 slide-in 动画 → 突然跳到保存位置 → 视觉"抽搐"
     */
    var saved = loadPos();
    if (saved) {
      stage.style.setProperty('transition', 'none', 'important');
      stage.style.setProperty('transform',  'none', 'important');
      stage.style.setProperty('animation',  'none', 'important');
      applyPos(stage, saved.x, saved.y);

      setTimeout(function () {
        stage.style.removeProperty('transition');
        stage.style.removeProperty('animation');
        stage.style.setProperty('transform', 'none'); // 保留 transform:none 防止残余动画
      }, 2000);
    }

    /*
     * 窗口 resize 时重新 clamp 位置，防止缩小窗口后元素跑到视口外
     */
    window.addEventListener('resize', function () {
      var r = stage.getBoundingClientRect();
      var p = applyPos(stage, r.left, r.top);
      savePos(p.x, p.y);
    });

    /* 兼容鼠标/触摸：统一提取坐标 */
    function px(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function py(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    /**
     * 按下事件处理（mousedown / touchstart）
     * 记录起始位置和偏移，进入 dragging 状态
     */
    function down(e) {
      if (e.button && e.button !== 0) return; // 仅左键
      dragging = true; moved = false;
      var r = stage.getBoundingClientRect();
      startX = px(e); startY = py(e);
      offX = startX - r.left; offY = startY - r.top;
    }

    /**
     * 移动事件处理（mousemove / touchmove）
     * 超过阈值后才进入拖拽模式，避免误触
     */
    function move(e) {
      if (!dragging) return;
      var cx = px(e), cy = py(e);
      if (!moved) {
        /* 判断是否超过拖拽阈值 */
        var dx = cx - startX, dy = cy - startY;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        moved = true;
        stage.style.opacity = '0.82';     // 拖拽中半透明反馈
        stage.style.cursor  = 'grabbing';
        /* 将 oh-my-live2d 的 bottom 定位切换为 top 定位 */
        var r = stage.getBoundingClientRect();
        stage.style.top    = r.top + 'px';
        stage.style.bottom = 'auto';
        stage.style.right  = 'auto';
        stage.style.transition = 'none';  // 拖拽期间禁用过渡
      }
      e.preventDefault(); // 阻止触摸滚动页面
      applyPos(stage, cx - offX, cy - offY);
    }

    /**
     * 松开事件处理（mouseup / touchend）
     * 保存位置，并拦截紧随其后的 click 事件防止误触按钮
     */
    function up() {
      if (!dragging) return;
      dragging = false;
      stage.style.opacity = '';
      stage.style.cursor  = 'grab';
      if (moved) {
        var r = stage.getBoundingClientRect();
        savePos(r.left, r.top);
        /*
         * 拖拽结束后，浏览器会立即派发一个 click 事件。
         * 捕获并吞掉这个 click，防止意外触发 Live2D 菜单按钮。
         * 只拦截一次，之后自动移除。
         */
        var capture = function (ev) {
          ev.stopPropagation(); ev.preventDefault();
          stage.removeEventListener('click', capture, true);
        };
        stage.addEventListener('click', capture, true);
      }
      moved = false;
    }

    /* ---- 绑定事件 ---- */
    stage.addEventListener('mousedown', down, false);
    document.addEventListener('mousemove', move, false);
    document.addEventListener('mouseup',   up, false);
    stage.addEventListener('touchstart', down, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend',  up, false);

    stage.style.cursor = 'grab'; // 默认光标
  }

  /* ---- DOM 就绪等待 ---- */

  /**
   * 等待指定选择器的元素出现在 DOM 中
   * 使用 MutationObserver（即时响应）+ setInterval 轮询（兜底）双重策略
   * @param {string} sel - CSS 选择器
   * @param {function} cb - 元素出现后的回调
   */
  function waitFor(sel, cb) {
    var elapsed = 0, el = document.querySelector(sel);
    if (el) { cb(el); return; } // 已存在则直接执行

    /* MutationObserver：监听 DOM 变化，element 出现后立即回调 */
    var obs = new MutationObserver(function () {
      el = document.querySelector(sel);
      if (el) { obs.disconnect(); clearInterval(poll); cb(el); }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    /* 轮询兜底：防止 MutationObserver 在某些边界情况下漏掉 */
    var poll = setInterval(function () {
      elapsed += POLL_INTERVAL;
      el = document.querySelector(sel);
      if (el) { obs.disconnect(); clearInterval(poll); cb(el); }
      else if (elapsed >= POLL_TIMEOUT) { obs.disconnect(); clearInterval(poll); }
    }, POLL_INTERVAL);
  }

  /**
   * 入口：等待 #oml2d-stage 出现后启动拖拽
   */
  function main() {
    waitFor('#oml2d-stage', function (stage) { initDrag(stage); });
  }

  /* DOMContentLoaded 或立即执行 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else { main(); }
})();
/**
 * ==========================================================================
 * Page Enhancements Bundle (page-enhancements.js)
 * ==========================================================================
 * Modules:
 *   1. 樱花飘落特效 (sakura)
 *   2. 页脚动漫台词 (footer-quote)
 *   3. 阅读进度条 (reading-progress)
 * ==========================================================================
 */

/* ==========================================================================
 * [Module 1/3] 樱花飘落特效 (sakura)
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
 * 修改历史：
 *   2025-06 - 初始版本
 * ========================================================================== */
(function () {
  'use strict';

  /* reduced-motion check */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

/* ==========================================================================
 * [Module 2/3] 页脚动漫台词 (footer-quote)
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
 * 修改历史：
 *   2025-06 - 初始版本
 * ========================================================================== */
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
      'font-family:"LXGW WenKai Lite","LXGW WenKai",sans-serif',
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

/* ==========================================================================
 * [Module 3/3] 阅读进度条 (reading-progress)
 * ==========================================================================
 *
 * 功能：仅在文章详情页显示顶部阅读进度条。
 *
 * 修改历史：
 *   2026-03 - 初始版本
 * ========================================================================== */
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
/**
 * ==========================================================================
 * UI Effects Bundle (ui-effects.js)
 * ==========================================================================
 * Modules:
 *   1. 鼠标点击特效 (click-effect)
 *   2. 代码复制 Toast 提示 (copy-toast)
 *   3. 搜索快捷键增强 (search-hint)
 * ==========================================================================
 */

/* ==========================================================================
 * [Module 1/3] 鼠标点击特效 (click-effect)
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
 * 修改历史：
 *   2025-06 - 初始版本：8 种 emoji
 *   2026-03 - 扩充至 30 种 emoji，新增小黄脸表情类，增加 2 种颜色
 * ========================================================================== */
(function () {
  'use strict';

  /* reduced-motion: skip click effect */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

/* ==========================================================================
 * [Module 2/3] 代码复制 Toast 提示 (copy-toast)
 * ==========================================================================
 *
 * 功能：监听 Blowfish 主题的代码复制按钮点击事件，
 *       在页面顶部显示一个短暂的 toast 提示。
 *
 * 原理：
 *   Blowfish 的 copy-button 点击后会将 innerText 改为 "Copied"，
 *   我们用 MutationObserver 监听这一文字变化来触发 toast。
 *
 * 修改历史：
 *   2026-03 - 初始版本
 * ========================================================================== */
(function () {
  'use strict';

  var TOAST_DURATION = 2000;
  var toast = null;

  function createToast() {
    var el = document.createElement('div');
    el.className = 'copy-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = '✅ 代码已复制到剪贴板';
    document.body.appendChild(el);
    return el;
  }

  function showToast() {
    if (!toast) toast = createToast();
    /* 重置动画 */
    toast.classList.remove('copy-toast--visible');
    void toast.offsetHeight;
    toast.classList.add('copy-toast--visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('copy-toast--visible');
    }, TOAST_DURATION);
  }

  /* 监听所有 copy-button 的文字变化 */
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'childList' || m.type === 'characterData') {
        var target = m.target.nodeType === 3 ? m.target.parentElement : m.target;
        if (target && target.classList && target.classList.contains('copy-button')) {
          var text = target.textContent || target.innerText;
          if (text.toLowerCase().indexOf('copied') !== -1 ||
              text.indexOf('已复制') !== -1) {
            showToast();
          }
        }
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

/* ==========================================================================
 * [Module 3/3] 搜索快捷键增强 (search-hint)
 * ==========================================================================
 *
 * 功能：
 *   1. 在搜索按钮旁显示快捷键提示徽章 (Ctrl+K / ⌘K)
 *   2. 添加 Ctrl+K / ⌘+K 键盘快捷键打开搜索（Blowfish 默认仅支持 /）
 *
 * 修改历史：
 *   2026-03 - 初始版本
 * ========================================================================== */
(function () {
  'use strict';

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var hintText = isMac ? '⌘K' : 'Ctrl+K';

  function addSearchHint() {
    /* 查找 Blowfish 的搜索按钮 */
    var searchBtn = document.getElementById('search-button')
      || document.querySelector('[id*="search"] button')
      || document.querySelector('button[title*="earch"]');
    if (!searchBtn) return;

    /* 避免重复添加 */
    if (searchBtn.querySelector('.search-hint-badge')) return;

    var badge = document.createElement('span');
    badge.className = 'search-hint-badge';
    badge.textContent = hintText;
    searchBtn.style.position = 'relative';
    searchBtn.appendChild(badge);
  }

  function handleKeydown(e) {
    /* Ctrl+K / ⌘+K 打开搜索 */
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      /* 尝试触发 Blowfish 的搜索按钮 */
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
