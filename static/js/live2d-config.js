/**
 * ==========================================================================
 * Live2D 看板娘配置与懒加载 (live2d-config.js)
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
 *   - live2d-drag.js（拖拽功能，须在本脚本之后加载）
 *
 * 修改历史：
 *   2025-06 - 初始版本（内嵌在 extend-footer.html）
 *   2026-03 - 抽离为独立文件，版本锁定 0.19.3，添加懒加载
 * ==========================================================================
 */
(function () {
  'use strict';

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
          fontFamily: '"LXGW WenKai", sans-serif'
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
