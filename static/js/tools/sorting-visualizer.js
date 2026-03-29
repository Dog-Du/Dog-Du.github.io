'use strict';

(function () {
  const container = document.getElementById('tool-container');
  if (!container) return;

  // ─── State ───────────────────────────────────────────────────────
  let arr = [];
  let arrSize = 60;
  let speed = 50;
  let running = false;
  let paused = false;
  let stepMode = false;
  let stepResolve = null;
  let muted = false;
  let gen = null;
  let highlights = {};
  let sorted = new Set();
  let audioCtx = null;

  // ─── Dark mode detection ─────────────────────────────────────────
  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  // ─── Colors ──────────────────────────────────────────────────────
  function colors() {
    const d = isDark();
    return {
      bg: d ? '#1a1a2e' : '#fefefe',
      bar: d ? 'rgba(240,150,180,0.6)' : 'rgba(240,96,144,0.45)',
      compare: d ? '#9b7aed' : '#7c5ecf',
      swap: d ? '#f06090' : '#e0446e',
      sorted: d ? 'rgba(240,150,180,0.85)' : 'rgba(240,96,144,0.75)',
      text: d ? '#ccc' : '#555',
    };
  }

  // ─── Build UI ────────────────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'tool-controls';
  controls.innerHTML = `
    <select id="sv-algo" class="tool-select">
      <option value="bubble">冒泡排序</option>
      <option value="insertion">插入排序</option>
      <option value="merge" selected>归并排序</option>
      <option value="quick">快速排序</option>
      <option value="heap">堆排序</option>
    </select>
    <label class="tool-label">数量
      <input id="sv-size" type="range" min="10" max="200" value="60" class="tool-range">
      <span id="sv-size-val">60</span>
    </label>
    <label class="tool-label">速度
      <input id="sv-speed" type="range" min="1" max="100" value="50" class="tool-range">
    </label>
    <button id="sv-play" class="tool-btn">▶ 开始</button>
    <button id="sv-step" class="tool-btn tool-btn--secondary">⏭ 单步</button>
    <button id="sv-reset" class="tool-btn tool-btn--secondary">↻ 重置</button>
    <button id="sv-mute" class="tool-btn tool-btn--secondary">🔊</button>
  `;
  container.appendChild(controls);

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'tool-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvasWrap.appendChild(canvas);
  container.appendChild(canvasWrap);

  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);

  // ─── Canvas sizing ───────────────────────────────────────────────
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvasWrap.clientWidth;
    const h = Math.min(420, Math.max(280, w * 0.45));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  // ─── Draw ────────────────────────────────────────────────────────
  function draw() {
    const c = colors();
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    if (!arr.length) return;
    const n = arr.length;
    const gap = 1;
    const barW = Math.max(1, (w - gap * (n - 1)) / n);
    const maxVal = Math.max(...arr);

    for (let i = 0; i < n; i++) {
      const barH = (arr[i] / maxVal) * (h - 10);
      const x = i * (barW + gap);
      const y = h - barH;

      if (sorted.has(i)) {
        ctx.fillStyle = c.sorted;
      } else if (highlights.compare && highlights.compare.includes(i)) {
        ctx.fillStyle = c.compare;
      } else if (highlights.swap && highlights.swap.includes(i)) {
        ctx.fillStyle = c.swap;
      } else {
        ctx.fillStyle = c.bar;
      }
      ctx.fillRect(x, y, barW, barH);
    }
  }

  // ─── Audio ───────────────────────────────────────────────────────
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(value, maxVal) {
    if (muted || !audioCtx) return;
    const freq = 200 + (value / maxVal) * 1300;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.06);
  }

  // ─── Delay / step ────────────────────────────────────────────────
  function delay() {
    const ms = Math.max(1, 110 - speed);
    return new Promise((resolve) => {
      if (stepMode) {
        stepResolve = resolve;
      } else {
        setTimeout(resolve, ms);
      }
    });
  }

  // ─── Sorting algorithms (generators) ─────────────────────────────
  async function* bubbleSort() {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        highlights = { compare: [j, j + 1] };
        playTone(arr[j], n);
        draw();
        yield await delay();
        if (arr[j] > arr[j + 1]) {
          highlights = { swap: [j, j + 1] };
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          draw();
          yield await delay();
        }
      }
      sorted.add(n - 1 - i);
    }
    sorted.add(0);
  }

  async function* insertionSort() {
    const n = arr.length;
    sorted.add(0);
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0 && arr[j - 1] > arr[j]) {
        highlights = { compare: [j - 1, j] };
        playTone(arr[j], n);
        draw();
        yield await delay();
        highlights = { swap: [j - 1, j] };
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
        draw();
        yield await delay();
        j--;
      }
      sorted.add(i);
    }
  }

  async function* mergeSort(lo = 0, hi = arr.length - 1) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    yield* mergeSort(lo, mid);
    yield* mergeSort(mid + 1, hi);
    yield* merge(lo, mid, hi);
  }

  async function* merge(lo, mid, hi) {
    const tmp = arr.slice(lo, hi + 1);
    let i = 0, j = mid - lo + 1, k = lo;
    while (i <= mid - lo && j <= hi - lo) {
      highlights = { compare: [lo + i, lo + j] };
      playTone(tmp[i], arr.length);
      draw();
      yield await delay();
      if (tmp[i] <= tmp[j]) {
        arr[k++] = tmp[i++];
      } else {
        arr[k++] = tmp[j++];
      }
      highlights = { swap: [k - 1] };
      draw();
      yield await delay();
    }
    while (i <= mid - lo) { arr[k++] = tmp[i++]; draw(); yield await delay(); }
    while (j <= hi - lo) { arr[k++] = tmp[j++]; draw(); yield await delay(); }
    if (lo === 0 && hi === arr.length - 1) {
      for (let s = lo; s <= hi; s++) sorted.add(s);
    }
  }

  async function* quickSort(lo = 0, hi = arr.length - 1) {
    if (lo >= hi) { if (lo === hi) sorted.add(lo); return; }
    const pivot = arr[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      highlights = { compare: [j, hi] };
      playTone(arr[j], arr.length);
      draw();
      yield await delay();
      if (arr[j] < pivot) {
        highlights = { swap: [i, j] };
        [arr[i], arr[j]] = [arr[j], arr[i]];
        draw();
        yield await delay();
        i++;
      }
    }
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    sorted.add(i);
    draw();
    yield await delay();
    yield* quickSort(lo, i - 1);
    yield* quickSort(i + 1, hi);
  }

  async function* heapSort() {
    const n = arr.length;
    async function* siftDown(size, i) {
      let largest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < size) {
        highlights = { compare: [largest, l] };
        playTone(arr[l], n);
        draw(); yield await delay();
        if (arr[l] > arr[largest]) largest = l;
      }
      if (r < size) {
        highlights = { compare: [largest, r] };
        draw(); yield await delay();
        if (arr[r] > arr[largest]) largest = r;
      }
      if (largest !== i) {
        highlights = { swap: [i, largest] };
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        draw(); yield await delay();
        yield* siftDown(size, largest);
      }
    }
    for (let i = (n >> 1) - 1; i >= 0; i--) yield* siftDown(n, i);
    for (let i = n - 1; i > 0; i--) {
      highlights = { swap: [0, i] };
      [arr[0], arr[i]] = [arr[i], arr[0]];
      sorted.add(i);
      draw(); yield await delay();
      yield* siftDown(i, 0);
    }
    sorted.add(0);
  }

  const algorithms = { bubble: bubbleSort, insertion: insertionSort, merge: mergeSort, quick: quickSort, heap: heapSort };

  // ─── Control logic ───────────────────────────────────────────────
  function resetArr() {
    running = false;
    paused = false;
    stepMode = false;
    gen = null;
    highlights = {};
    sorted = new Set();
    arr = Array.from({ length: arrSize }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    $('sv-play').textContent = '▶ 开始';
    draw();
  }

  async function run() {
    if (running && !paused) return;
    initAudio();
    if (!gen || !running) {
      resetArr();
      const algoFn = algorithms[$('sv-algo').value];
      gen = algoFn();
      running = true;
    }
    paused = false;
    stepMode = false;
    $('sv-play').textContent = '⏸ 暂停';

    while (running && !paused) {
      const { done } = await gen.next();
      if (done) {
        for (let i = 0; i < arr.length; i++) sorted.add(i);
        highlights = {};
        draw();
        running = false;
        $('sv-play').textContent = '▶ 开始';
        return;
      }
    }
  }

  function pause() {
    paused = true;
    $('sv-play').textContent = '▶ 继续';
  }

  function step() {
    if (!running) {
      initAudio();
      resetArr();
      const algoFn = algorithms[$('sv-algo').value];
      gen = algoFn();
      running = true;
      stepMode = true;
      gen.next();
      return;
    }
    stepMode = true;
    paused = false;
    if (stepResolve) {
      const r = stepResolve;
      stepResolve = null;
      r();
    }
  }

  // ─── Event listeners ─────────────────────────────────────────────
  $('sv-play').addEventListener('click', () => {
    if (running && !paused) pause();
    else run();
  });
  $('sv-step').addEventListener('click', step);
  $('sv-reset').addEventListener('click', resetArr);
  $('sv-mute').addEventListener('click', () => {
    muted = !muted;
    $('sv-mute').textContent = muted ? '🔇' : '🔊';
  });
  $('sv-size').addEventListener('input', (e) => {
    arrSize = +e.target.value;
    $('sv-size-val').textContent = arrSize;
    if (!running) resetArr();
  });
  $('sv-speed').addEventListener('input', (e) => {
    speed = +e.target.value;
  });

  window.addEventListener('resize', resizeCanvas);
  new MutationObserver(draw).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
  });

  // ─── Init ────────────────────────────────────────────────────────
  resetArr();
  resizeCanvas();
})();

