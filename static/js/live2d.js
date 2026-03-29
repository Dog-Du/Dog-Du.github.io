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
