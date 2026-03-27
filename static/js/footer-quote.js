/**
 * 🎌 页脚随机动漫台词
 */
(function () {
  'use strict';
  var quotes = [
    { text: "不相信自己的人，连努力的价值都没有。", src: "火影忍者" },
    { text: "人如果不付出牺牲，就得不到任何回报。", src: "钢之炼金术师" },
    { text: "即使被夺走一切，只要活着就能重新来过。", src: "Re:从零开始的异世界生活" },
    { text: "所谓孤独，就是你面前没有人，而你心里却有一个世界。", src: "夏目友人帐" },
    { text: "无论在哪里遇到你，我都会喜欢上你。", src: "你的名字" },
    { text: "明天会发生什么谁也不知道，但是今天的努力一定不会白费。", src: "排球少年" },
    { text: "温柔的人，都是在默默承受着什么吧。", src: "四月是你的谎言" },
    { text: "学累了就看会动漫吧~", src: "DogDu" },
    { text: "一个人可以被毁灭，但不能被打败。", src: "命运石之门" },
    { text: "能哭的地方，只有厕所和爸爸的怀里。", src: "CLANNAD" },
    { text: "比起悲伤来说，无法分享快乐这件事，要更加的寂寞。", src: "未闻花名" },
    { text: "人们之所以怀有一丝希望，是因为他们看不见死亡。", src: "死神" },
    { text: "只有不畏风雨的人，才能欣赏到彩虹的美丽。", src: "进击的巨人" },
    { text: "如果你不冒险，那你就什么都得不到。", src: "No Game No Life" }
  ];

  function inject() {
    var footer = document.querySelector('#site-footer');
    if (!footer) return;
    // 检查是否已注入
    if (footer.querySelector('.anime-quote')) return;

    var q = quotes[Math.floor(Math.random() * quotes.length)];
    var el = document.createElement('p');
    el.className = 'anime-quote';
    el.style.cssText = 'text-align:center;font-size:0.8rem;margin-top:0.75rem;color:rgb(var(--color-neutral-400));font-family:"LXGW WenKai",sans-serif;font-style:italic;';
    el.innerHTML = '「' + q.text + '」<span style="opacity:0.6;margin-left:0.5em;">—— ' + q.src + '</span>';
    footer.appendChild(el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
