'use strict';

(function () {
  const container = document.getElementById('tool-container');
  if (!container) return;

  // ─── Constants ───────────────────────────────────────────────────
  const NODE_R = 18;
  const LEVEL_H = 60;
  const ANIM_MS = 420;
  const VISIT_MS = 350;
  let busy = false;

  function isDark() { return document.documentElement.classList.contains('dark'); }
  function colors() {
    const d = isDark();
    return {
      bg: d ? '#1a1a2e' : '#fefefe',
      node: d ? 'rgba(240,150,180,0.7)' : 'rgba(240,96,144,0.55)',
      nodeText: d ? '#1a1a2e' : '#fff',
      edge: d ? 'rgba(200,180,220,0.5)' : 'rgba(100,80,140,0.35)',
      highlight: d ? '#9b7aed' : '#7c5ecf',
      visiting: d ? '#e8a840' : '#e89020',
      red: d ? '#f06090' : '#e0446e',
      black: d ? '#888' : '#333',
    };
  }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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

  // Status bar
  const statusBar = document.createElement('div');
  statusBar.className = 'tool-label';
  statusBar.style.cssText = 'text-align:center;padding:0.5rem;min-height:1.5em;font-size:0.85rem';
  container.appendChild(statusBar);

  const $ = (id) => document.getElementById(id);

  // ─── Tree node (shared by AVL & RB) ──────────────────────────────
  // Each node has a unique id to track identity across rotations
  let nodeIdCounter = 0;
  class TNode {
    constructor(val) {
      this.id = ++nodeIdCounter;
      this.val = val;
      this.left = null;
      this.right = null;
      this.h = 1;        // AVL height
      this.color = true;  // RB: true=RED, false=BLACK
    }
  }
  const RED = true, BLACK = false;

  // ─── Tree cloning (for snapshots) ────────────────────────────────
  function cloneTree(node) {
    if (!node) return null;
    const c = new TNode(node.val);
    c.id = node.id; c.h = node.h; c.color = node.color;
    c.left = cloneTree(node.left);
    c.right = cloneTree(node.right);
    return c;
  }

  // ─── AVL helpers (pure, no side effects on steps) ─────────────────
  function avlHeight(n) { return n ? n.h : 0; }
  function avlBf(n) { return n ? avlHeight(n.left) - avlHeight(n.right) : 0; }
  function avlUpdate(n) { if (n) n.h = 1 + Math.max(avlHeight(n.left), avlHeight(n.right)); }

  function rotateR(y) {
    const x = y.left; y.left = x.right; x.right = y;
    avlUpdate(y); avlUpdate(x); return x;
  }
  function rotateL(x) {
    const y = x.right; x.right = y.left; y.left = x;
    avlUpdate(x); avlUpdate(y); return y;
  }

  // ─── BST search path ────────────────────────────────────────────
  function findPath(node, val) {
    const path = [];
    while (node) {
      path.push(node.val);
      if (val < node.val) node = node.left;
      else if (val > node.val) node = node.right;
      else break; // found
    }
    return path;
  }

  // ─── BST insert (no balancing) ───────────────────────────────────

  // ─── AVL insert with steps ──────────────────────────────────────
  function avlInsertSteps(rootNode, val) {
    const steps = [];

    // Check duplicate
    if (rootNode) {
      let n = rootNode;
      while (n) {
        if (val === n.val) return { root: rootNode, steps: [] };
        n = val < n.val ? n.left : n.right;
      }
    }

    // Phase 1: search path animation
    const path = findPath(rootNode, val);
    for (let i = 0; i < path.length; i++) {
      steps.push({ type: 'visit', path: path.slice(0, i + 1), desc: `搜索: ${path.slice(0, i + 1).join(' → ')}` });
    }

    // Pre-assign an ID for the new node so both BST and AVL steps track the same node
    const newId = ++nodeIdCounter;

    // Phase 2: BST insert (no rotations) — show new node at leaf
    const afterBst = bstInsertWithId(cloneTree(rootNode), val, newId);
    steps.push({ type: 'tree', tree: cloneTree(afterBst), newNode: val, desc: `插入节点 ${val}` });

    // Phase 3: full AVL insert (with rotations) — show rebalancing
    const afterAvl = avlInsertFullWithId(cloneTree(rootNode), val, newId);
    // Only add rebalance step if tree structure actually changed (rotation happened)
    if (!treesEqual(afterBst, afterAvl)) {
      steps.push({ type: 'tree', tree: cloneTree(afterAvl), desc: `AVL 重平衡` });
    }

    return { root: afterAvl, steps };
  }

  function bstInsertWithId(node, val, id) {
    if (!node) { const n = new TNode(val); n.id = id; return n; }
    if (val < node.val) node.left = bstInsertWithId(node.left, val, id);
    else if (val > node.val) node.right = bstInsertWithId(node.right, val, id);
    return node;
  }

  function avlInsertFullWithId(node, val, id) {
    if (!node) { const n = new TNode(val); n.id = id; return n; }
    if (val < node.val) node.left = avlInsertFullWithId(node.left, val, id);
    else if (val > node.val) node.right = avlInsertFullWithId(node.right, val, id);
    else return node;
    avlUpdate(node);
    const b = avlBf(node);
    if (b > 1 && avlBf(node.left) >= 0) return rotateR(node);
    if (b < -1 && avlBf(node.right) <= 0) return rotateL(node);
    if (b > 1 && avlBf(node.left) < 0) { node.left = rotateL(node.left); return rotateR(node); }
    if (b < -1 && avlBf(node.right) > 0) { node.right = rotateR(node.right); return rotateL(node); }
    return node;
  }

  // Check if two trees have the same structure (by node id positions)
  function treesEqual(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.id !== b.id) return false;
    return treesEqual(a.left, b.left) && treesEqual(a.right, b.right);
  }

  // ─── AVL delete with steps ───────────────────────────────────────
  function avlDeleteSteps(rootNode, val) {
    const steps = [];
    const path = findPath(rootNode, val);
    if (!path.length || path[path.length - 1] !== val) return { root: rootNode, steps: [] };

    for (let i = 0; i < path.length; i++) {
      steps.push({ type: 'visit', path: path.slice(0, i + 1), desc: `搜索: ${path.slice(0, i + 1).join(' → ')}` });
    }
    steps.push({ type: 'visit', path: path, markDelete: val, desc: `找到节点 ${val}，准备删除` });

    rootNode = avlDelete(rootNode, val);
    steps.push({ type: 'tree', tree: cloneTree(rootNode), desc: `删除节点 ${val} 并重平衡` });

    return { root: rootNode, steps };
  }

  function avlDelete(node, val) {
    if (!node) return null;
    if (val < node.val) node.left = avlDelete(node.left, val);
    else if (val > node.val) node.right = avlDelete(node.right, val);
    else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let succ = node.right;
      while (succ.left) succ = succ.left;
      node.val = succ.val; node.id = succ.id;
      node.right = avlDelete(node.right, succ.val);
    }
    avlUpdate(node);
    const b = avlBf(node);
    if (b > 1 && avlBf(node.left) >= 0) return rotateR(node);
    if (b > 1 && avlBf(node.left) < 0) { node.left = rotateL(node.left); return rotateR(node); }
    if (b < -1 && avlBf(node.right) <= 0) return rotateL(node);
    if (b < -1 && avlBf(node.right) > 0) { node.right = rotateR(node.right); return rotateL(node); }
    return node;
  }


  // ─── RB Tree with steps ──────────────────────────────────────────
  function rbInsertSteps(rootNode, val) {
    const steps = [];
    // Check duplicate
    if (rootNode) {
      let n = rootNode;
      while (n) {
        if (val === n.val) return { root: rootNode, steps: [] };
        n = val < n.val ? n.left : n.right;
      }
    }
    const path = findPath(rootNode, val);
    for (let i = 0; i < path.length; i++) {
      steps.push({ type: 'visit', path: path.slice(0, i + 1), desc: `搜索: ${path.slice(0, i + 1).join(' → ')}` });
    }

    // Do the full RB insert, then show the result
    const newId = ++nodeIdCounter;
    rootNode = rbInsertFullWithId(rootNode, val, newId);
    if (rootNode) rootNode.color = BLACK;
    steps.push({ type: 'tree', tree: cloneTree(rootNode), newNode: val, desc: `插入 ${val} 并修复红黑性质` });
    return { root: rootNode, steps };
  }

  function rbInsertFullWithId(h, val, id) {
    if (!h) { const n = new TNode(val); n.id = id; n.color = RED; return n; }
    if (val < h.val) h.left = rbInsertFullWithId(h.left, val, id);
    else if (val > h.val) h.right = rbInsertFullWithId(h.right, val, id);
    else return h;
    if (isRed(h.right) && !isRed(h.left)) h = rbRotateL(h);
    if (isRed(h.left) && h.left && isRed(h.left.left)) h = rbRotateR(h);
    if (isRed(h.left) && isRed(h.right)) rbFlip(h);
    return h;
  }

  function isRed(n) { return n ? n.color === RED : false; }
  function rbRotateL(h) { const x = h.right; h.right = x.left; x.left = h; x.color = h.color; h.color = RED; return x; }
  function rbRotateR(h) { const x = h.left; h.left = x.right; x.right = h; x.color = h.color; h.color = RED; return x; }
  function rbFlip(h) { h.color = RED; if (h.left) h.left.color = BLACK; if (h.right) h.right.color = BLACK; }

  function rbDeleteSteps(rootNode, val) {
    const steps = [];
    const path = findPath(rootNode, val);
    if (!path.length || path[path.length - 1] !== val) return { root: rootNode, steps: [] };
    for (let i = 0; i < path.length; i++) {
      steps.push({ type: 'visit', path: path.slice(0, i + 1), desc: `搜索: ${path.slice(0, i + 1).join(' → ')}` });
    }
    steps.push({ type: 'visit', path, markDelete: val, desc: `找到节点 ${val}，准备删除` });
    rootNode = rbDeleteNode(rootNode, val);
    if (rootNode) rootNode.color = BLACK;
    steps.push({ type: 'tree', tree: cloneTree(rootNode), desc: `删除节点 ${val} 并修复红黑性质` });
    return { root: rootNode, steps };
  }

  // Simplified RB delete (reuse existing logic)
  function rbDeleteNode(h, val) {
    if (!h) return null;
    if (val < h.val) {
      if (h.left && !isRed(h.left) && !(h.left && isRed(h.left.left))) h = rbMoveRedLeft(h);
      h.left = rbDeleteNode(h.left, val);
    } else {
      if (isRed(h.left)) h = rbRotateR(h);
      if (val === h.val && !h.right) return null;
      if (h.right && !isRed(h.right) && !(h.right && isRed(h.right.left))) h = rbMoveRedRight(h);
      if (val === h.val) {
        let m = h.right; while (m.left) m = m.left;
        h.val = m.val; h.id = m.id;
        h.right = rbDeleteMin(h.right);
      } else {
        h.right = rbDeleteNode(h.right, val);
      }
    }
    return rbFixUp(h);
  }
  function rbMoveRedLeft(h) { rbFlipDel(h); if (h.right && isRed(h.right.left)) { h.right = rbRotateR(h.right); h = rbRotateL(h); rbFlipDel(h); } return h; }
  function rbMoveRedRight(h) { rbFlipDel(h); if (h.left && isRed(h.left.left)) { h = rbRotateR(h); rbFlipDel(h); } return h; }
  function rbFlipDel(h) { h.color = !h.color; if (h.left) h.left.color = !h.left.color; if (h.right) h.right.color = !h.right.color; }
  function rbFixUp(h) { if (isRed(h.right) && !isRed(h.left)) h = rbRotateL(h); if (isRed(h.left) && h.left && isRed(h.left.left)) h = rbRotateR(h); if (isRed(h.left) && isRed(h.right)) rbFlip(h); return h; }
  function rbDeleteMin(h) { if (!h.left) return null; if (!isRed(h.left) && !(h.left && isRed(h.left.left))) h = rbMoveRedLeft(h); h.left = rbDeleteMin(h.left); return rbFixUp(h); }

  // ─── Layout & Rendering ──────────────────────────────────────────
  let root = null;
  let treeType = 'avl';
  let positions = new Map();   // id -> {x, y, val, color}
  let highlightSet = null;     // Set of vals to highlight (search path)
  let markDeleteVal = null;
  let newNodeVal = null;

  function computeLayout(node, depth, left, right, out) {
    if (!node) return;
    const mid = (left + right) / 2;
    out.set(node.id, { x: mid, y: 40 + depth * LEVEL_H, val: node.val, color: node.color });
    computeLayout(node.left, depth + 1, left, mid, out);
    computeLayout(node.right, depth + 1, mid, right, out);
  }

  function canvasW() { return canvas.width / (window.devicePixelRatio || 1); }
  function canvasH() { return canvas.height / (window.devicePixelRatio || 1); }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvasWrap.clientWidth;
    const h = Math.min(500, Math.max(320, w * 0.5));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawStatic();
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Draw the current state (no animation interpolation)
  function drawStatic() {
    const c = colors();
    const w = canvasW(), h = canvasH();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    if (!root) {
      ctx.fillStyle = c.edge;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('插入节点开始可视化', w / 2, h / 2);
      return;
    }

    // Recompute positions for current tree
    const posMap = new Map();
    computeLayout(root, 0, 20, w - 20, posMap);

    drawEdgesFromTree(root, posMap, c);
    for (const [id, pos] of posMap) {
      drawNode(pos.val, pos, c, 1.0);
    }
  }

  function drawNode(val, pos, c, alpha) {
    ctx.globalAlpha = alpha;
    let fillColor = c.node;
    if (treeType === 'rb') {
      fillColor = pos.color === RED ? c.red : c.black;
    }
    if (highlightSet && highlightSet.has(val)) fillColor = c.visiting;
    if (val === markDeleteVal) fillColor = c.red;
    if (val === newNodeVal) fillColor = c.highlight;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, NODE_R, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Outline for highlighted nodes
    if (highlightSet && highlightSet.has(val)) {
      ctx.strokeStyle = c.visiting;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.fillStyle = c.nodeText;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(val, pos.x, pos.y);
    ctx.globalAlpha = 1.0;
  }

  function drawEdgesFromTree(node, posMap, c) {
    if (!node) return;
    const p = posMap.get(node.id);
    if (!p) return;
    const children = [node.left, node.right];
    for (const child of children) {
      if (child && posMap.has(child.id)) {
        const cp = posMap.get(child.id);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + NODE_R);
        ctx.lineTo(cp.x, cp.y - NODE_R);
        ctx.strokeStyle = c.edge;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    drawEdgesFromTree(node.left, posMap, c);
    drawEdgesFromTree(node.right, posMap, c);
  }

  // ─── Animated transition between two tree states ─────────────────
  function animateTransition(oldPositions, newRoot) {
    return new Promise((resolve) => {
      const w = canvasW();
      const newPos = new Map();
      computeLayout(newRoot, 0, 20, w - 20, newPos);

      // Map by node id for interpolation
      const start = performance.now();
      const c = colors();

      // For new nodes, start from top center
      for (const [id, target] of newPos) {
        if (!oldPositions.has(id)) {
          oldPositions.set(id, { x: w / 2, y: -NODE_R, val: target.val, color: target.color });
        }
      }

      // Removed nodes
      const removed = new Map();
      for (const [id, pos] of oldPositions) {
        if (!newPos.has(id)) removed.set(id, pos);
      }

      function frame(now) {
        const t = Math.min(1, (now - start) / ANIM_MS);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        ctx.fillStyle = c.bg;
        ctx.fillRect(0, 0, w, canvasH());

        // Interpolate and draw edges + nodes
        const current = new Map();
        for (const [id, target] of newPos) {
          const prev = oldPositions.get(id) || target;
          current.set(id, {
            x: lerp(prev.x, target.x, ease),
            y: lerp(prev.y, target.y, ease),
            val: target.val,
            color: target.color,
          });
        }

        // Draw edges
        if (newRoot) drawEdgesFromTree(newRoot, current, c);

        // Draw living nodes
        for (const [id, pos] of current) {
          drawNode(pos.val, pos, c, 1.0);
        }

        // Draw fading removed nodes
        for (const [id, pos] of removed) {
          drawNode(pos.val, pos, c, 1 - ease);
        }

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          positions = newPos;
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  // ─── Step replay engine ───────────────────────────────────────────
  async function replaySteps(steps) {
    for (const step of steps) {
      statusBar.textContent = step.desc || '';

      if (step.type === 'visit') {
        highlightSet = new Set(step.path);
        markDeleteVal = step.markDelete || null;
        newNodeVal = null;
        drawStatic();
        await sleep(VISIT_MS);
      } else if (step.type === 'tree') {
        highlightSet = null;
        markDeleteVal = null;
        newNodeVal = step.newNode || null;
        const oldPos = new Map();
        computeLayout(root, 0, 20, canvasW() - 20, oldPos);
        root = step.tree;
        await animateTransition(oldPos, root);
        newNodeVal = null;
        await sleep(180);
      } else if (step.type === 'treeNoAnim') {
        highlightSet = null;
        newNodeVal = step.newNode || null;
        root = step.tree;
        drawStatic();
        await sleep(VISIT_MS);
      }
    }
    highlightSet = null;
    markDeleteVal = null;
    newNodeVal = null;
    statusBar.textContent = '';
    drawStatic();
  }

  // ─── Actions ─────────────────────────────────────────────────────
  async function insertVal(val) {
    if (isNaN(val) || busy) return;
    busy = true;
    const result = treeType === 'avl'
      ? avlInsertSteps(cloneTree(root), val)
      : rbInsertSteps(cloneTree(root), val);

    if (result.steps.length > 0) {
      await replaySteps(result.steps);
      root = result.root;
      drawStatic();
    }
    busy = false;
  }

  async function deleteVal(val) {
    if (isNaN(val) || busy) return;
    busy = true;
    const result = treeType === 'avl'
      ? avlDeleteSteps(cloneTree(root), val)
      : rbDeleteSteps(cloneTree(root), val);

    if (result.steps.length > 0) {
      await replaySteps(result.steps);
      root = result.root;
      drawStatic();
    }
    busy = false;
  }

  function clearTree() {
    root = null;
    positions = new Map();
    highlightSet = null;
    markDeleteVal = null;
    newNodeVal = null;
    busy = false;
    statusBar.textContent = '';
    drawStatic();
  }

  async function randomInsert() {
    if (busy) return;
    const existing = new Set();
    function collect(n) { if (!n) return; existing.add(n.val); collect(n.left); collect(n.right); }
    collect(root);
    const toInsert = [];
    for (let i = 0; i < 5; i++) {
      let v;
      do { v = Math.floor(Math.random() * 100) + 1; } while (existing.has(v));
      existing.add(v);
      toInsert.push(v);
    }
    for (const v of toInsert) {
      await insertVal(v);
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
  new MutationObserver(() => drawStatic()).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
  });

  // ─── Init ────────────────────────────────────────────────────────
  resizeCanvas();
})();

