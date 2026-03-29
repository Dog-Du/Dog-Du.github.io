'use strict';

(async function () {
  const container = document.getElementById('tool-container');
  if (!container) return;

  const GRID_W = 150, GRID_H = 100, CELL_SIZE = 4;
  let playing = false, speed = 10, generation = 0, animId = null;
  let universe = null, wasmMem = null;

  function isDark() { return document.documentElement.classList.contains('dark'); }

  // ─── Patterns ────────────────────────────────────────────────────
  const PATTERNS = {
    glider: { w: 3, d: [0,1,0, 0,0,1, 1,1,1] },
    lwss: { w: 5, d: [0,1,0,0,1, 1,0,0,0,0, 1,0,0,0,1, 1,1,1,1,0] },
    pulsar: { w: 13, d: [
      0,0,1,1,1,0,0,0,1,1,1,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,
      1,0,0,0,0,1,0,1,0,0,0,0,1, 1,0,0,0,0,1,0,1,0,0,0,0,1,
      1,0,0,0,0,1,0,1,0,0,0,0,1, 0,0,1,1,1,0,0,0,1,1,1,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,1,1,1,0,0,0,1,1,1,0,0,
      1,0,0,0,0,1,0,1,0,0,0,0,1, 1,0,0,0,0,1,0,1,0,0,0,0,1,
      1,0,0,0,0,1,0,1,0,0,0,0,1, 0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,1,1,1,0,0,0,1,1,1,0,0,
    ]},
    gliderGun: { w: 36, d: [
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
      0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
      1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    ]},
  };

  // ─── UI ──────────────────────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'tool-controls';
  controls.innerHTML = `
    <button id="gol-play" class="tool-btn">▶ 开始</button>
    <button id="gol-step" class="tool-btn tool-btn--secondary">⏭ 单步</button>
    <button id="gol-clear" class="tool-btn tool-btn--secondary">清空</button>
    <button id="gol-random" class="tool-btn tool-btn--secondary">随机</button>
    <select id="gol-pattern" class="tool-select">
      <option value="">放置图案...</option>
      <option value="glider">滑翔机</option>
      <option value="lwss">轻量飞船</option>
      <option value="pulsar">脉冲星</option>
      <option value="gliderGun">滑翔机枪</option>
    </select>
    <label class="tool-label">速度
      <input id="gol-speed" type="range" min="1" max="30" value="10" class="tool-range">
    </label>
    <span id="gol-gen" class="tool-label">世代: 0</span>
  `;
  container.appendChild(controls);

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'tool-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.width = GRID_W * CELL_SIZE;
  canvas.height = GRID_H * CELL_SIZE;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.cursor = 'crosshair';
  canvasWrap.appendChild(canvas);
  container.appendChild(canvasWrap);
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);

  // ─── Load WASM ───────────────────────────────────────────────────
  let wasmInstance;
  try {
    const wasmUrl = '/wasm/game-of-life/game_of_life_bg.wasm';
    const importObject = { './game_of_life_bg.js': {
      __wbg___wbindgen_throw_5549492daedad139: (ptr, len) => {
        throw new Error('wasm error');
      },
      __wbindgen_init_externref_table: () => {
        const table = wasmInstance.exports.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
      },
    }};
    const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmUrl), importObject);
    wasmInstance = instance;
    wasmInstance.exports.__wbindgen_start();
    wasmMem = wasmInstance.exports.memory;

    // Create universe
    const ptr = wasmInstance.exports.universe_new(GRID_W, GRID_H);
    universe = {
      ptr,
      tick: () => wasmInstance.exports.universe_tick(ptr),
      toggle: (r, c) => wasmInstance.exports.universe_toggle(ptr, r, c),
      clear: () => wasmInstance.exports.universe_clear(ptr),
      randomize: () => wasmInstance.exports.universe_randomize(ptr),
      cells_ptr: () => wasmInstance.exports.universe_cells_ptr(ptr),
      set_pattern: (r, c, data, w) => {
        const malloc = wasmInstance.exports.__wbindgen_malloc;
        const buf = new Uint8Array(data);
        const p = malloc(buf.length, 1);
        new Uint8Array(wasmMem.buffer).set(buf, p);
        wasmInstance.exports.universe_set_pattern(ptr, r, c, p, buf.length, w);
      },
    };
  } catch (e) {
    container.innerHTML = '<p style="color:#e0446e;padding:2rem">WASM 加载失败: ' + e.message + '</p>';
    return;
  }

  // ─── Rendering ───────────────────────────────────────────────────
  function draw() {
    const d = isDark();
    const deadColor = d ? '#1a1a2e' : '#fefefe';
    const aliveColor = d ? '#f096b4' : '#f06090';

    ctx.fillStyle = deadColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ptr = universe.cells_ptr();
    const cells = new Uint8Array(wasmMem.buffer, ptr, GRID_W * GRID_H);

    ctx.fillStyle = aliveColor;
    for (let row = 0; row < GRID_H; row++) {
      for (let col = 0; col < GRID_W; col++) {
        if (cells[row * GRID_W + col]) {
          ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 0.5, CELL_SIZE - 0.5);
        }
      }
    }

    $('gol-gen').textContent = '世代: ' + generation;
  }

  // ─── Game loop ───────────────────────────────────────────────────
  function loop() {
    if (!playing) return;
    for (let i = 0; i < speed; i++) {
      universe.tick();
      generation++;
    }
    draw();
    animId = requestAnimationFrame(loop);
  }

  function play() {
    playing = true;
    $('gol-play').textContent = '⏸ 暂停';
    loop();
  }

  function pause() {
    playing = false;
    if (animId) cancelAnimationFrame(animId);
    $('gol-play').textContent = '▶ 开始';
  }

  // ─── Mouse drawing ───────────────────────────────────────────────
  let drawing = false;
  canvas.addEventListener('mousedown', (e) => { drawing = true; toggleCell(e); });
  canvas.addEventListener('mousemove', (e) => { if (drawing) toggleCell(e); });
  canvas.addEventListener('mouseup', () => { drawing = false; });
  canvas.addEventListener('mouseleave', () => { drawing = false; });

  function toggleCell(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const col = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE);
    const row = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE);
    if (row >= 0 && row < GRID_H && col >= 0 && col < GRID_W) {
      universe.toggle(row, col);
      draw();
    }
  }

  // ─── Events ──────────────────────────────────────────────────────
  $('gol-play').addEventListener('click', () => { playing ? pause() : play(); });
  $('gol-step').addEventListener('click', () => {
    if (playing) pause();
    universe.tick();
    generation++;
    draw();
  });
  $('gol-clear').addEventListener('click', () => {
    pause();
    universe.clear();
    generation = 0;
    draw();
  });
  $('gol-random').addEventListener('click', () => {
    universe.randomize();
    generation = 0;
    draw();
  });
  $('gol-speed').addEventListener('input', (e) => { speed = +e.target.value; });
  $('gol-pattern').addEventListener('change', (e) => {
    const name = e.target.value;
    if (!name) return;
    const pat = PATTERNS[name];
    const r = Math.floor(GRID_H / 2 - (pat.d.length / pat.w) / 2);
    const c = Math.floor(GRID_W / 2 - pat.w / 2);
    universe.set_pattern(r, c, pat.d, pat.w);
    draw();
    e.target.value = '';
  });

  new MutationObserver(draw).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
  });

  // ─── Init ────────────────────────────────────────────────────────
  draw();
})();
