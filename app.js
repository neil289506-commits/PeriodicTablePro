/* ═══════════════════════════════════════════════════════════
   PeriodicTable Pro Ultimate — app.js
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Chinese element names ─── */
const ZH_NAMES = {
  1:'氫',2:'氦',3:'鋰',4:'鈹',5:'硼',6:'碳',7:'氮',8:'氧',9:'氟',10:'氖',
  11:'鈉',12:'鎂',13:'鋁',14:'矽',15:'磷',16:'硫',17:'氯',18:'氬',
  19:'鉀',20:'鈣',21:'鈧',22:'鈦',23:'釩',24:'鉻',25:'錳',26:'鐵',27:'鈷',28:'鎳',29:'銅',30:'鋅',
  31:'鎵',32:'鍺',33:'砷',34:'硒',35:'溴',36:'氪',
  37:'銣',38:'鍶',39:'釔',40:'鋯',41:'鈮',42:'鉬',43:'鍀',44:'釕',45:'銠',46:'鈀',47:'銀',48:'鎘',
  49:'銦',50:'錫',51:'銻',52:'碲',53:'碘',54:'氙',
  55:'銫',56:'鋇',57:'鑭',58:'鈰',59:'鐠',60:'釹',61:'鉕',62:'釤',63:'銪',64:'釓',65:'鋱',
  66:'鏑',67:'鈥',68:'鉺',69:'銩',70:'鐿',71:'鑥',
  72:'鉿',73:'鉭',74:'鎢',75:'錸',76:'鋨',77:'銥',78:'鉑',79:'金',80:'汞',
  81:'鉈',82:'鉛',83:'鉍',84:'釙',85:'砈',86:'氡',
  87:'鍅',88:'鐳',89:'錒',90:'釷',91:'鏷',92:'鈾',93:'錼',94:'鈽',95:'鋂',96:'鋦',97:'鉳',
  98:'鉲',99:'鑀',100:'鐨',101:'鍆',102:'鍩',103:'鐒',
  104:'鑪',105:'𨧀',106:'𨭎',107:'𨨏',108:'𨭆',109:'䥑',110:'鐽',111:'錀',112:'鎶',
  113:'鉨',114:'鈇',115:'鏌',116:'鉝',117:'石田',118:'鿫'
};

/* ─── Category metadata ─── */
const CATEGORIES = {
  alkali_metal:       { en:'Alkali Metal',         zh:'鹼金屬',       color:'#ff6b6b' },
  alkaline_earth_metal:{ en:'Alkaline Earth Metal', zh:'鹼土金屬',     color:'#feca57' },
  transition_metal:   { en:'Transition Metal',      zh:'過渡金屬',     color:'#48dbfb' },
  post_transition_metal:{ en:'Post-Transition Metal',zh:'後過渡金屬',  color:'#0abde3' },
  metalloid:          { en:'Metalloid',             zh:'類金屬',       color:'#a29bfe' },
  nonmetal:           { en:'Nonmetal',              zh:'非金屬',       color:'#ff9ff3' },
  noble_gas:          { en:'Noble Gas',             zh:'惰性氣體',     color:'#ffeaa7' },
  lanthanide:         { en:'Lanthanide',            zh:'鑭系元素',     color:'#55efc4' },
  actinide:           { en:'Actinide',              zh:'錒系元素',     color:'#fd79a8' },
  unknown:            { en:'Unknown',               zh:'未知',         color:'#636e72' }
};

/* ─── State ─── */
let elements = [];
let lang = localStorage.getItem('pt-lang') || 'zh';
let theme = localStorage.getItem('pt-theme') || 'dark';
let activeFilter = null;
let currentElementIdx = null; // index in elements array

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  await loadData();
  buildLegend();
  buildTable();
  buildFBlock();
  bindSearch();
  bindModal();
  bindPWA();
  registerSW();
  updateLangBtn();
  updateThemeBtn();
});

/* ─── Load JSON ─── */
async function loadData() {
  try {
    const res = await fetch('./elements.json');
    elements = await res.json();
  } catch(e) {
    console.error('Failed to load elements.json', e);
    elements = [];
  }
}

/* ─── Apply theme ─── */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme);
}

/* ─── Language helpers ─── */
function t(key, fallback) {
  const strings = {
    search_placeholder: { zh:'搜尋元素（中文、英文、符號、原子序）', en:'Search elements (name, symbol, atomic number)' },
    title:        { zh:'PeriodicTable Pro', en:'PeriodicTable Pro' },
    dark:         { zh:'🌙 深色', en:'🌙 Dark' },
    light:        { zh:'☀️ 淺色', en:'☀️ Light' },
    lang_btn:     { zh:'EN', en:'中文' },
    filter_msg:   { zh:'篩選中：', en:'Filtering: ' },
    clear:        { zh:'清除', en:'Clear' },
    atomic_mass:  { zh:'原子量', en:'Atomic Mass' },
    electron_conf:{ zh:'電子組態', en:'Electron Config' },
    melting_pt:   { zh:'熔點', en:'Melting Point' },
    boiling_pt:   { zh:'沸點', en:'Boiling Point' },
    density:      { zh:'密度', en:'Density' },
    electronegativity:{ zh:'電負度', en:'Electronegativity' },
    ionization:   { zh:'游離能', en:'Ionization Energy' },
    discovery:    { zh:'發現年份', en:'Discovery Year' },
    shells:       { zh:'電子層分佈', en:'Electron Shells' },
    state_solid:  { zh:'固態', en:'Solid' },
    state_gas:    { zh:'氣態', en:'Gas' },
    state_liquid: { zh:'液態', en:'Liquid' },
    state_unknown:{ zh:'未知', en:'Unknown' },
    na:           { zh:'—', en:'—' },
    prev:         { zh:'◀ 上一個', en:'◀ Prev' },
    next:         { zh:'下一個 ▶', en:'Next ▶' },
    close:        { zh:'關閉', en:'Close' },
    group:        { zh:'族', en:'Group' },
    period:       { zh:'週期', en:'Period' },
    block:        { zh:'區塊', en:'Block' },
    pwa_msg:      { zh:'安裝此應用程式，離線也能使用！', en:'Install this app for offline use!' },
    pwa_install:  { zh:'安裝', en:'Install' },
    pwa_dismiss:  { zh:'×', en:'×' },
    lanthanides:  { zh:'鑭系', en:'Lanthanides' },
    actinides:    { zh:'錒系', en:'Actinides' },
    atomic_radius:{ zh:'原子半徑', en:'Atomic Radius' },
  };
  const s = strings[key];
  if (!s) return fallback || key;
  return s[lang] || s['en'] || fallback || key;
}

function elName(el) {
  if (lang === 'zh') return ZH_NAMES[el.atomic_number] || el.name;
  return el.name;
}

/* ─── Build Legend ─── */
function buildLegend() {
  const legend = document.getElementById('legend');
  legend.innerHTML = '';
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.dataset.cat = key;
    item.innerHTML = `<span class="legend-dot" style="background:${cat.color}"></span>
      <span>${lang === 'zh' ? cat.zh : cat.en}</span>`;
    item.addEventListener('click', () => toggleFilter(key));
    legend.appendChild(item);
  }
}

/* ─── Build Main Table (rows 1–7) ─── */
function buildTable() {
  const grid = document.getElementById('periodic-grid');
  grid.innerHTML = '';

  // Group number labels
  const groupLabels = document.getElementById('group-labels');
  groupLabels.innerHTML = '';
  for (let g = 1; g <= 18; g++) {
    const lbl = document.createElement('div');
    lbl.className = 'group-lbl';
    lbl.textContent = g;
    groupLabels.appendChild(lbl);
  }

  // Main grid: rows 1–7 only
  const mainElements = elements.filter(e => e.grid_row >= 1 && e.grid_row <= 7);
  const cellMap = {};
  mainElements.forEach(el => {
    cellMap[`${el.grid_row}-${el.grid_column}`] = el;
  });

  for (let r = 1; r <= 7; r++) {
    for (let c = 1; c <= 18; c++) {
      const el = cellMap[`${r}-${c}`];
      if (el) {
        const cell = makeCell(el);
        cell.style.gridRow = r;
        cell.style.gridColumn = c;
        cell.style.setProperty('--i', (r-1)*18 + c);
        grid.appendChild(cell);
      } else {
        // Insert placeholder for la/ac rows at col 3-4 area
        if ((r === 6 && c >= 3 && c <= 4) || (r === 7 && c >= 3 && c <= 4)) {
          // skip, these are handled by series labels
        }
        // Empty cell (invisible)
        const empty = document.createElement('div');
        empty.style.gridRow = r;
        empty.style.gridColumn = c;
        grid.appendChild(empty);
      }
    }
  }

  // Series placeholders at row 6 col 3 and row 7 col 3
  addSeriesLabel(grid, 6, 3, lang === 'zh' ? '57-71\n鑭系' : '57-71\nLan…');
  addSeriesLabel(grid, 7, 3, lang === 'zh' ? '89-103\n錒系' : '89-103\nAct…');
}

function addSeriesLabel(grid, row, col, text) {
  // Remove existing placeholder if any
  const existing = grid.querySelector(`[data-series="${row}-${col}"]`);
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'series-label';
  el.dataset.series = `${row}-${col}`;
  el.style.gridRow = row;
  el.style.gridColumn = `${col} / span 2`;
  el.textContent = text;
  grid.appendChild(el);
}

/* ─── Build F-block ─── */
function buildFBlock() {
  const container = document.getElementById('f-block-grid');
  container.innerHTML = '';

  const lans = elements.filter(e => e.category === 'lanthanide').sort((a,b) => a.atomic_number - b.atomic_number);
  const acts = elements.filter(e => e.category === 'actinide').sort((a,b) => a.atomic_number - b.atomic_number);

  // Lanthanide row
  const lanRow = document.createElement('div');
  lanRow.className = 'f-block-row';
  const lanTag = document.createElement('div');
  lanTag.className = 'f-row-tag';
  lanTag.textContent = lang === 'zh' ? '鑭系' : 'Lan.';
  lanRow.appendChild(lanTag);
  lans.forEach(el => lanRow.appendChild(makeCell(el)));
  container.appendChild(lanRow);

  // Actinide row
  const actRow = document.createElement('div');
  actRow.className = 'f-block-row';
  const actTag = document.createElement('div');
  actTag.className = 'f-row-tag';
  actTag.textContent = lang === 'zh' ? '錒系' : 'Act.';
  actRow.appendChild(actTag);
  acts.forEach(el => actRow.appendChild(makeCell(el)));
  container.appendChild(actRow);
}

/* ─── Make element cell ─── */
function makeCell(el) {
  const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
  const color = cat.color;
  const stateClass = `state-${(el.state_at_room_temp || 'unknown').replace(/\s+/g,'').toLowerCase()}`;

  const cell = document.createElement('div');
  cell.className = 'el-cell';
  cell.dataset.z = el.atomic_number;
  cell.dataset.cat = el.category;
  cell.style.setProperty('--cat-color', color);
  cell.style.width = 'var(--cell)';
  cell.style.height = 'var(--cell)';

  cell.innerHTML = `
    <div class="el-state ${stateClass}"></div>
    <div class="el-num">${el.atomic_number}</div>
    <div class="el-symbol">${el.symbol}</div>
    <div class="el-name">${elName(el)}</div>
    <div class="el-mass">${(+el.atomic_mass).toFixed(0)}</div>
  `;

  cell.addEventListener('click', () => openModal(el.atomic_number));
  return cell;
}

/* ─── Search ─── */
function bindSearch() {
  const input = document.getElementById('search-input');
  input.placeholder = t('search_placeholder');
  input.addEventListener('input', e => doSearch(e.target.value.trim()));
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { input.value = ''; doSearch(''); }
  });
}

function doSearch(q) {
  if (!q) {
    // restore
    document.querySelectorAll('.el-cell').forEach(c => {
      c.classList.remove('highlight', 'dimmed');
    });
    return;
  }
  const ql = q.toLowerCase();
  const matched = new Set();
  elements.forEach(el => {
    const zhName = ZH_NAMES[el.atomic_number] || '';
    if (
      el.symbol.toLowerCase() === ql ||
      el.name.toLowerCase().includes(ql) ||
      zhName.includes(q) ||
      String(el.atomic_number) === q
    ) {
      matched.add(el.atomic_number);
    }
  });

  document.querySelectorAll('.el-cell').forEach(c => {
    const z = +c.dataset.z;
    if (matched.has(z)) {
      c.classList.add('highlight');
      c.classList.remove('dimmed');
    } else {
      c.classList.remove('highlight');
      c.classList.add('dimmed');
    }
  });

  // Auto-open if exactly one match
  if (matched.size === 1) {
    const z = [...matched][0];
    setTimeout(() => openModal(z), 120);
  }
}

/* ─── Category filter ─── */
function toggleFilter(cat) {
  if (activeFilter === cat) {
    activeFilter = null;
  } else {
    activeFilter = cat;
  }
  applyFilter();

  document.querySelectorAll('.legend-item').forEach(li => {
    li.classList.toggle('active', li.dataset.cat === activeFilter);
  });

  const notice = document.getElementById('filter-notice');
  if (activeFilter) {
    const catData = CATEGORIES[activeFilter];
    notice.textContent = t('filter_msg') + (lang === 'zh' ? catData.zh : catData.en);
    notice.classList.add('show');
  } else {
    notice.classList.remove('show');
  }
}

function applyFilter() {
  document.querySelectorAll('.el-cell').forEach(c => {
    if (!activeFilter) {
      c.classList.remove('highlight', 'dimmed');
    } else if (c.dataset.cat === activeFilter) {
      c.classList.add('highlight');
      c.classList.remove('dimmed');
    } else {
      c.classList.add('dimmed');
      c.classList.remove('highlight');
    }
  });
}

/* ─── Modal ─── */
function bindModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-prev').addEventListener('click', () => {
    if (currentElementIdx > 0) openModal(elements[currentElementIdx - 1].atomic_number);
  });
  document.getElementById('modal-next').addEventListener('click', () => {
    if (currentElementIdx < elements.length - 1) openModal(elements[currentElementIdx + 1].atomic_number);
  });

  document.addEventListener('keydown', e => {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft' && currentElementIdx > 0)
      openModal(elements[currentElementIdx - 1].atomic_number);
    if (e.key === 'ArrowRight' && currentElementIdx < elements.length - 1)
      openModal(elements[currentElementIdx + 1].atomic_number);
  });
}

function fmt(val, unit, decimals) {
  if (val === null || val === undefined) return t('na');
  const v = typeof decimals === 'number' ? (+val).toFixed(decimals) : val;
  return `${v}<span class="modal-stat-unit">${unit || ''}</span>`;
}

function fmtTemp(val) {
  if (val === null || val === undefined) return t('na');
  const k = (+val).toFixed(0);
  const c = (+val - 273.15).toFixed(1);
  return `${k}<span class="modal-stat-unit">K</span> <span style="color:var(--text-faint);font-size:0.7rem">(${c}°C)</span>`;
}

function fmtDensity(el) {
  if (el.density === null || el.density === undefined) return t('na');
  const d = el.density;
  if (d < 0.01) {
    return `${(d*1000).toFixed(4)}<span class="modal-stat-unit">×10⁻³ g/cm³</span>`;
  }
  return `${d}<span class="modal-stat-unit">g/cm³</span>`;
}

function openModal(atomicNumber) {
  const el = elements.find(e => e.atomic_number === atomicNumber);
  if (!el) return;
  currentElementIdx = elements.indexOf(el);
  const cat = CATEGORIES[el.category] || CATEGORIES.unknown;
  const color = cat.color;
  const zhName = ZH_NAMES[el.atomic_number] || '';

  // set CSS var for modal color
  const modal = document.getElementById('modal');
  modal.style.setProperty('--modal-cat-color', color);

  // hero
  document.getElementById('m-num').textContent = `#${el.atomic_number}`;
  document.getElementById('m-symbol').textContent = el.symbol;
  document.getElementById('m-name').textContent = el.name;
  document.getElementById('m-cn').textContent = lang === 'zh' ? `${zhName} · ${el.symbol}` : '';
  
  const badge = document.getElementById('m-badge');
  badge.textContent = lang === 'zh' ? cat.zh : cat.en;
  badge.style.color = color;
  badge.style.borderColor = color;
  badge.style.background = `${color}22`;

  // stats
  setStatHTML('m-mass', fmt(el.atomic_mass, 'u', 4));
  setStatHTML('m-mp', fmtTemp(el.melting_point));
  setStatHTML('m-bp', fmtTemp(el.boiling_point));
  setStatHTML('m-density', fmtDensity(el));
  setStatHTML('m-en', fmt(el.electronegativity, '', 2));
  setStatHTML('m-ie', fmt(el.ionization_energy, 'kJ/mol', 1));
  setStatHTML('m-ar', fmt(el.atomic_radius, 'pm', 0));
  setStatHTML('m-disc', el.discovery_year ? el.discovery_year : t('na'));

  // Electron config
  document.getElementById('m-ec').innerHTML = el.electron_configuration_semantic || t('na');

  // Shell diagram
  const shellWrap = document.getElementById('m-shells');
  shellWrap.innerHTML = '';
  if (el.electrons_per_shell && el.electrons_per_shell.length > 0) {
    const shellNames = ['K','L','M','N','O','P','Q'];
    el.electrons_per_shell.forEach((n, i) => {
      const ring = document.createElement('div');
      ring.className = 'shell-ring';
      ring.innerHTML = `<span class="shell-label">${shellNames[i] || 'n'+(i+1)}</span>
        <span class="shell-count" style="background:${color};color:var(--bg)">${n}</span>`;
      shellWrap.appendChild(ring);
    });
  }

  // meta
  const metaBlock = document.getElementById('m-meta');
  metaBlock.innerHTML = `
    <span style="color:var(--text-faint);font-size:0.72rem;font-family:var(--font-mono)">
      ${t('group')}: <b style="color:var(--text)">${el.group_number || '—'}</b> &nbsp;
      ${t('period')}: <b style="color:var(--text)">${el.period || '—'}</b> &nbsp;
      ${t('block')}: <b style="color:var(--text)">${(el.block || '—').toUpperCase()}</b>
    </span>
  `;

  // nav buttons
  document.getElementById('modal-prev').textContent = t('prev');
  document.getElementById('modal-next').textContent = t('next');
  document.getElementById('modal-prev').disabled = currentElementIdx === 0;
  document.getElementById('modal-next').disabled = currentElementIdx === elements.length - 1;

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function setStatHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  currentElementIdx = null;
}

/* ─── Lang toggle ─── */
function toggleLang() {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('pt-lang', lang);
  updateLangBtn();
  rebuildAll();
}

function updateLangBtn() {
  document.getElementById('lang-btn').textContent = t('lang_btn');
}

/* ─── Theme toggle ─── */
function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('pt-theme', theme);
  applyTheme();
  updateThemeBtn();
}

function updateThemeBtn() {
  const btn = document.getElementById('theme-btn');
  btn.textContent = theme === 'dark' ? t('light') : t('dark');
}

/* ─── Rebuild ─── */
function rebuildAll() {
  document.getElementById('search-input').placeholder = t('search_placeholder');
  buildLegend();
  buildTable();
  buildFBlock();
  if (activeFilter) applyFilter();
  updateThemeBtn();
  updateLangBtn();
}

/* ─── PWA ─── */
let deferredPrompt = null;
function bindPWA() {
  const banner = document.getElementById('pwa-banner');
  const installBtn = document.getElementById('pwa-install');
  const dismissBtn = document.getElementById('pwa-dismiss');

  document.getElementById('pwa-msg').textContent = t('pwa_msg');
  installBtn.textContent = t('pwa_install');
  dismissBtn.textContent = t('pwa_dismiss');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!sessionStorage.getItem('pwa-dismissed')) {
      setTimeout(() => banner.classList.add('show'), 3000);
    }
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.classList.remove('show');
    if (outcome === 'accepted') showToast(lang === 'zh' ? '已安裝！' : 'Installed!');
  });

  dismissBtn.addEventListener('click', () => {
    banner.classList.remove('show');
    sessionStorage.setItem('pwa-dismissed', '1');
  });
}

/* ─── Service Worker ─── */
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('SW registered'))
      .catch(e => console.warn('SW error', e));
  }
}

/* ─── Toast ─── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ─── Expose globals for inline handlers ─── */
window.toggleLang = toggleLang;
window.toggleTheme = toggleTheme;
