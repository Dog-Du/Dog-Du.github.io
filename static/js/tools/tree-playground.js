'use strict';

(function () {
  const container = document.getElementById('tool-container');
  if (!container) return;

  // ─── Constants ───────────────────────────────────────────────────
  const NODE_R = 18;
  const LEVEL_H = 60;
  const ANIM_MS = 300;

  function isDark() { return document.documentElement.classList.contains('dark'); }

  function colors() {
    const d = isDark();
    return {
      bg: d ? '#1a1a2e' : '#fefefe',
      node: d ? 'rgba(240,150,180,0.7)' : 'rgba(240,96,144,0.55)',
      nodeText: d ? '#1a1a2e' : '#fff',
      edge: d ? 'rgba(200,180,220,0.5)' : 'rgba(100,80,140,0.35)',
      highlight: d ? '#9b7aed' : '#7c5ecf',
      red: d ? '#f06090' : '#e0446e',
      black: d ? '#888' : '#333',
    };
  }

  // ─── UI ──────────────────────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'tool-controls';
  controls.innerHTML = `
    <select id="tp-type" class="tool-select">
      <option value="avl" selected>AVL 树</option>
      <option value="rb">红黑树</option>
    </select>
    <input id="tp-val" type="number" class="tool-input" placeholder="输入值" style="width:80px">
    <button id="tp-insert" class="tool-btn">插入</button>
    <button id="tp-delete" class="tool-btn tool-btn--secondary">删除</button>
    <button id="tp-random" class="tool-btn tool-btn--secondary">随机 +5</button>
    <button id="tp-clear" class="tool-btn tool-btn--secondary">清空</button>
  `;
  container.appendChild(controls);

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'tool-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvasWrap.appendChild(canvas);
  container.appendChild(canvasWrap);
  const ctx = canvas.getContext('2d');

  const $ = (id) => document.getElementById(id);

  // ─── AVL Tree ────────────────────────────────────────────────────
  class AVLNode {
    constructor(val) { this.val = val; this.left = null; this.right = null; this.h = 1; }
  }

  const AVL = {
    height(n) { return n ? n.h : 0; },
    bf(n) { return n ? this.height(n.left) - this.height(n.right) : 0; },
    update(n) { if (n) n.h = 1 + Math.max(this.height(n.left), this.height(n.right)); },
    rotateR(y) { const x = y.left; y.left = x.right; x.right = y; this.update(y); this.update(x); return x; },
    rotateL(x) { const y = x.right; x.right = y.left; y.left = x; this.update(x); this.update(y); return y; },
    insert(node, val) {
      if (!node) return new AVLNode(val);
      if (val < node.val) node.left = this.insert(node.left, val);
      else if (val > node.val) node.right = this.insert(node.right, val);
      else return node;
      this.update(node);
      const b = this.bf(node);
      if (b > 1 && val < node.left.val) return this.rotateR(node);
      if (b < -1 && val > node.right.val) return this.rotateL(node);
      if (b > 1 && val > node.left.val) { node.left = this.rotateL(node.left); return this.rotateR(node); }
      if (b < -1 && val < node.right.val) { node.right = this.rotateR(node.right); return this.rotateL(node); }
      return node;
    },
    minNode(n) { while (n.left) n = n.left; return n; },
    remove(node, val) {
      if (!node) return null;
      if (val < node.val) node.left = this.remove(node.left, val);
      else if (val > node.val) node.right = this.remove(node.right, val);
      else {
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        const succ = this.minNode(node.right);
        node.val = succ.val;
        node.right = this.remove(node.right, succ.val);
      }
      this.update(node);
      const b = this.bf(node);
      if (b > 1 && this.bf(node.left) >= 0) return this.rotateR(node);
      if (b > 1 && this.bf(node.left) < 0) { node.left = this.rotateL(node.left); return this.rotateR(node); }
      if (b < -1 && this.bf(node.right) <= 0) return this.rotateL(node);
      if (b < -1 && this.bf(node.right) > 0) { node.right = this.rotateR(node.right); return this.rotateL(node); }
      return node;
    }
  };

  // ─── Red-Black Tree ──────────────────────────────────────────────
  const RED = true, BLACK = false;

  class RBNode {
    constructor(val) { this.val = val; this.left = null; this.right = null; this.color = RED; }
  }

  const RB = {
    isRed(n) { return n ? n.color === RED : false; },
    rotateL(h) { const x = h.right; h.right = x.left; x.left = h; x.color = h.color; h.color = RED; return x; },
    rotateR(h) { const x = h.left; h.left = x.right; x.right = h; x.color = h.color; h.color = RED; return x; },
    flip(h) { h.color = RED; if (h.left) h.left.color = BLACK; if (h.right) h.right.color = BLACK; },
    insert(h, val) {
      if (!h) return new RBNode(val);
      if (val < h.val) h.left = this.insert(h.left, val);
      else if (val > h.val) h.right = this.insert(h.right, val);
      else return h;
      if (this.isRed(h.right) && !this.isRed(h.left)) h = this.rotateL(h);
      if (this.isRed(h.left) && h.left && this.isRed(h.left.left)) h = this.rotateR(h);
      if (this.isRed(h.left) && this.isRed(h.right)) this.flip(h);
      return h;
    },
    moveRedLeft(h) {
      this.flipDel(h);
      if (h.right && this.isRed(h.right.left)) {
        h.right = this.rotateR(h.right);
        h = this.rotateL(h);
        this.flipDel(h);
      }
      return h;
    },
    moveRedRight(h) {
      this.flipDel(h);
      if (h.left && this.isRed(h.left.left)) {
        h = this.rotateR(h);
        this.flipDel(h);
      }
      return h;
    },
    flipDel(h) { h.color = !h.color; if (h.left) h.left.color = !h.left.color; if (h.right) h.right.color = !h.right.color; },
    fixUp(h) {
      if (this.isRed(h.right) && !this.isRed(h.left)) h = this.rotateL(h);
      if (this.isRed(h.left) && h.left && this.isRed(h.left.left)) h = this.rotateR(h);
      if (this.isRed(h.left) && this.isRed(h.right)) this.flip(h);
      return h;
    },
    min(h) { while (h.left) h = h.left; return h; },
    removeMin(h) {
      if (!h.left) return null;
      if (!this.isRed(h.left) && !(h.left && this.isRed(h.left.left))) h = this.moveRedLeft(h);
      h.left = this.removeMin(h.left);
      return this.fixUp(h);
    },
    remove(h, val) {
      if (!h) return null;
      if (val < h.val) {
        if (h.left && !this.isRed(h.left) && !(h.left && this.isRed(h.left.left))) h = this.moveRedLeft(h);
        h.left = this.remove(h.left, val);
      } else {
        if (this.isRed(h.left)) h = this.rotateR(h);
        if (val === h.val && !h.right) return null;
        if (h.right && !this.isRed(h.right) && !(h.right && this.isRed(h.right.left))) h = this.moveRedRight(h);
        if (val === h.val) {
          const m = this.min(h.right);
          h.val = m.val;
          h.right = this.removeMin(h.right);
        } else {
          h.right = this.remove(h.right, val);
        }
      }
      return this.fixUp(h);
    }
  };

  // ─── Layout & Rendering ──────────────────────────────────────────
  let root = null;
  let treeType = 'avl';
  let positions = new Map(); // val -> {x, y}
  let targetPositions = new Map();
  let animStart = 0;
  let animating = false;
  let highlightVal = null;

  function computeLayout(node, depth, left, right, out) {
    if (!node) return;
    const mid = (left + right) / 2;
    out.set(node.val, { x: mid, y: 40 + depth * LEVEL_H, color: node.color });
    computeLayout(node.left, depth + 1, left, mid, out);
    computeLayout(node.right, depth + 1, mid, right, out);
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvasWrap.clientWidth;
    const h = Math.min(500, Math.max(320, w * 0.5));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(1);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function draw(t) {
    const c = colors();
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    if (!root) {
      ctx.fillStyle = c.edge;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('插入节点开始可视化', w / 2, h / 2);
      return;
    }

    // Interpolate positions
    const current = new Map();
    for (const [val, target] of targetPositions) {
      const prev = positions.get(val) || target;
      current.set(val, {
        x: lerp(prev.x, target.x, t),
        y: lerp(prev.y, target.y, t),
        color: target.color,
      });
    }

    // Draw edges
    drawEdges(root, current, c);

    // Draw nodes
    for (const [val, pos] of current) {
      const isRB = treeType === 'rb';
      let fillColor = c.node;
      if (isRB) {
        fillColor = pos.color === RED ? c.red : c.black;
      }
      if (val === highlightVal) fillColor = c.highlight;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.fillStyle = c.nodeText;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val, pos.x, pos.y);
    }
  }

  function drawEdges(node, posMap, c) {
    if (!node) return;
    const p = posMap.get(node.val);
    if (!p) return;
    if (node.left && posMap.has(node.left.val)) {
      const lp = posMap.get(node.left.val);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + NODE_R);
      ctx.lineTo(lp.x, lp.y - NODE_R);
      ctx.strokeStyle = c.edge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    if (node.right && posMap.has(node.right.val)) {
      const rp = posMap.get(node.right.val);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + NODE_R);
      ctx.lineTo(rp.x, rp.y - NODE_R);
      ctx.strokeStyle = c.edge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    drawEdges(node.left, posMap, c);
    drawEdges(node.right, posMap, c);
  }

  function animateTo() {
    animStart = performance.now();
    animating = true;
    function frame(now) {
      const t = Math.min(1, (now - animStart) / ANIM_MS);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      draw(ease);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        positions = new Map(targetPositions);
        animating = false;
      }
    }
    requestAnimationFrame(frame);
  }

  function updateTree() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    targetPositions = new Map();
    computeLayout(root, 0, 20, w - 20, targetPositions);
    animateTo();
  }

  // ─── Actions ─────────────────────────────────────────────────────
  function insertVal(val) {
    if (isNaN(val)) return;
    highlightVal = val;
    if (treeType === 'avl') {
      root = AVL.insert(root, val);
    } else {
      root = RB.insert(root, val);
      if (root) root.color = BLACK;
    }
    updateTree();
    setTimeout(() => { highlightVal = null; draw(1); }, 800);
  }

  function deleteVal(val) {
    if (isNaN(val)) return;
    if (treeType === 'avl') {
      root = AVL.remove(root, val);
    } else {
      root = RB.remove(root, val);
      if (root) root.color = BLACK;
    }
    updateTree();
  }

  function clearTree() {
    root = null;
    positions = new Map();
    targetPositions = new Map();
    draw(1);
  }

  function randomInsert() {
    const existing = new Set();
    function collect(n) { if (!n) return; existing.add(n.val); collect(n.left); collect(n.right); }
    collect(root);
    for (let i = 0; i < 5; i++) {
      let v;
      do { v = Math.floor(Math.random() * 100) + 1; } while (existing.has(v));
      existing.add(v);
      insertVal(v);
    }
  }

  // ─── Events ──────────────────────────────────────────────────────
  $('tp-insert').addEventListener('click', () => {
    insertVal(parseInt($('tp-val').value));
    $('tp-val').value = '';
  });
  $('tp-delete').addEventListener('click', () => {
    deleteVal(parseInt($('tp-val').value));
    $('tp-val').value = '';
  });
  $('tp-val').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      insertVal(parseInt($('tp-val').value));
      $('tp-val').value = '';
    }
  });
  $('tp-random').addEventListener('click', randomInsert);
  $('tp-clear').addEventListener('click', clearTree);
  $('tp-type').addEventListener('change', (e) => {
    treeType = e.target.value;
    clearTree();
  });

  window.addEventListener('resize', resizeCanvas);
  new MutationObserver(() => draw(1)).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
  });

  // ─── Init ────────────────────────────────────────────────────────
  resizeCanvas();
})();

