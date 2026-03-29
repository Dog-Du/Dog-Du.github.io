'use strict';

(function () {
  const container = document.getElementById('tool-container');
  if (!container) return;

  // ─── State ───────────────────────────────────────────────────────
  let files = [];
  let outputFormat = 'webp';
  let quality = 0.85;

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  // ─── Build UI ────────────────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'tool-controls';
  controls.innerHTML = `
    <select id="ic-format" class="tool-select">
      <option value="webp" selected>WebP</option>
      <option value="png">PNG</option>
      <option value="jpeg">JPEG</option>
    </select>
    <label class="tool-label">质量
      <input id="ic-quality" type="range" min="10" max="100" value="85" class="tool-range">
      <span id="ic-quality-val">85%</span>
    </label>
    <button id="ic-convert" class="tool-btn">转换全部</button>
    <button id="ic-clear" class="tool-btn tool-btn--secondary">清空</button>
  `;
  container.appendChild(controls);

  // Drop zone
  const dropZone = document.createElement('div');
  dropZone.id = 'ic-dropzone';
  dropZone.className = 'ic-dropzone';
  dropZone.innerHTML = `
    <div class="ic-dropzone__inner">
      <span class="ic-dropzone__icon">📁</span>
      <p>拖拽图片到此处，或 <label for="ic-file" class="ic-dropzone__link">点击选择</label></p>
      <p class="ic-dropzone__hint">支持 PNG / JPG / GIF / BMP / WebP</p>
      <input type="file" id="ic-file" multiple accept="image/*" hidden>
    </div>
  `;
  container.appendChild(dropZone);

  // Results area
  const results = document.createElement('div');
  results.id = 'ic-results';
  results.className = 'ic-results';
  container.appendChild(results);

  // ─── Inline styles (scoped to this tool) ─────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .ic-dropzone {
      border: 2px dashed rgba(var(--color-primary-300), 0.6);
      border-radius: 0.75rem;
      padding: 2.5rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      margin-bottom: 1rem;
    }
    .ic-dropzone.dragover {
      border-color: rgb(var(--color-primary-500));
      background: rgba(var(--color-primary-100), 0.2);
    }
    .ic-dropzone__icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .ic-dropzone__inner p { margin: 0.25rem 0; font-size: 0.9rem; color: rgb(var(--color-neutral-500)); }
    .ic-dropzone__hint { font-size: 0.75rem !important; color: rgb(var(--color-neutral-400)) !important; }
    .ic-dropzone__link { color: rgb(var(--color-primary-500)); cursor: pointer; text-decoration: underline; }
    .ic-results { display: flex; flex-direction: column; gap: 0.75rem; }
    .ic-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.75rem; border-radius: 0.75rem;
      border: 1px solid rgba(var(--color-neutral-200), 0.6);
      background: rgba(var(--color-neutral-50), 0.5);
    }
    .dark .ic-item {
      border-color: rgba(var(--color-neutral-700), 0.6);
      background: rgba(var(--color-neutral-800), 0.5);
    }
    .ic-item__thumb {
      width: 60px; height: 60px; object-fit: cover;
      border-radius: 0.5rem; flex-shrink: 0;
    }
    .ic-item__info { flex: 1; min-width: 0; font-size: 0.8rem; color: rgb(var(--color-neutral-600)); }
    .dark .ic-item__info { color: rgb(var(--color-neutral-400)); }
    .ic-item__name { font-weight: 600; color: rgb(var(--color-neutral-800)); margin-bottom: 0.2rem;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dark .ic-item__name { color: rgb(var(--color-neutral-100)); }
    .ic-item__ratio { color: rgb(var(--color-primary-500)); font-weight: 600; }
    .ic-item__dl { flex-shrink: 0; }
    .ic-item__dl a { display: inline-block; padding: 0.3rem 0.7rem; border-radius: 0.5rem;
      background: rgb(var(--color-primary-500)); color: #fff; font-size: 0.75rem;
      text-decoration: none; font-weight: 500; }
    .ic-item__dl a:hover { background: rgb(var(--color-primary-600)); }
  `;
  document.head.appendChild(style);

  // ─── File handling ───────────────────────────────────────────────
  function addFiles(fileList) {
    for (const f of fileList) {
      if (f.type.startsWith('image/')) {
        files.push({ file: f, converted: null });
      }
    }
    renderList();
  }

  function renderList() {
    results.innerHTML = '';
    files.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'ic-item';
      const thumb = document.createElement('img');
      thumb.className = 'ic-item__thumb';
      thumb.src = URL.createObjectURL(item.file);
      div.appendChild(thumb);

      const info = document.createElement('div');
      info.className = 'ic-item__info';
      const name = document.createElement('div');
      name.className = 'ic-item__name';
      name.textContent = item.file.name;
      info.appendChild(name);

      const size = document.createElement('div');
      size.textContent = `原始: ${formatSize(item.file.size)}`;
      if (item.converted) {
        const ratio = ((1 - item.converted.size / item.file.size) * 100).toFixed(1);
        const sign = ratio >= 0 ? '-' : '+';
        size.innerHTML += ` → 转换后: ${formatSize(item.converted.size)} `;
        size.innerHTML += `<span class="ic-item__ratio">${sign}${Math.abs(ratio)}%</span>`;
      }
      info.appendChild(size);
      div.appendChild(info);

      if (item.converted) {
        const dl = document.createElement('div');
        dl.className = 'ic-item__dl';
        const a = document.createElement('a');
        const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
        const baseName = item.file.name.replace(/\.[^.]+$/, '');
        a.href = URL.createObjectURL(item.converted);
        a.download = `${baseName}.${ext}`;
        a.textContent = '下载';
        dl.appendChild(a);
        div.appendChild(dl);
      }

      results.appendChild(div);
    });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  // ─── Conversion ──────────────────────────────────────────────────
  async function convertAll() {
    const mime = outputFormat === 'png' ? 'image/png'
      : outputFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';

    for (const item of files) {
      const img = new Image();
      const url = URL.createObjectURL(item.file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      cvs.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const blob = await new Promise((r) => cvs.toBlob(r, mime, quality));
      item.converted = blob;
    }
    renderList();
  }

  // ─── Events ──────────────────────────────────────────────────────
  const fileInput = document.getElementById('ic-file');
  fileInput.addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });

  dropZone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'LABEL') fileInput.click();
  });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    addFiles(e.dataTransfer.files);
  });

  document.getElementById('ic-format').addEventListener('change', (e) => { outputFormat = e.target.value; });
  document.getElementById('ic-quality').addEventListener('input', (e) => {
    quality = e.target.value / 100;
    document.getElementById('ic-quality-val').textContent = e.target.value + '%';
  });
  document.getElementById('ic-convert').addEventListener('click', convertAll);
  document.getElementById('ic-clear').addEventListener('click', () => {
    files = [];
    results.innerHTML = '';
  });
})();

