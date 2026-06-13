// ── CONFIG ── (à remplacer avec tes vraies clés)
const SUPABASE_URL = 'https://fgbhzwpflpsbpmevgsap.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HU12EJIg6KJEq9qgnTkkNw_3yv9MTot';
const STRIPE_PUBLIC_KEY = 'pk_live_51ThiEaHyDDxXqLayYwtgWCT80kQYdvjBO7ei5kgPDt6eiWBBPu8qvqWNfeJoXS0vmxRXwxyNNxuI6Dw4305WcVq800fBSJhxjA';

// ── CONSTANTES ──
const COLS = 1000, ROWS = 1000;
const CANVAS_SIZE = 800;
const PX = CANVAS_SIZE / COLS; // 0.8px par pixel

const PRESET_COLORS = [
  '#e24b4a','#D85A30','#EF9F27','#639922',
  '#1D9E75','#378ADD','#7F77DD','#D4537E',
  '#ffffff','#888888'
];

const TOTAL_PIXELS = COLS * ROWS; // 1 000 000

// ── OPTIONS & PRIX ──
const OPTIONS = {
  black:   { label: 'Pixel noir',            qty: 1,  price: 0.50, color: '#000000' },
  color:   { label: 'Pixel coloré',          qty: 1,  price: 1.00, color: null },
  pack5:   { label: 'Pack 5 pixels colorés', qty: 5,  price: 4.00, color: null },
  pack10:  { label: 'Pack 10 pixels colorés',qty: 10, price: 7.00, color: null },
};

// ── STATE ──
let pixelData = {}; // {idx: color}
let selectedOption = 'black';
let selectedColor = '#378ADD';
let selectedPixels = []; // liste de {x,y,idx} pour les packs
let hoveredPixel = null;
let currentLang = 'fr';
let totalSold = 0;
let totalRevenue = 0;

// ── CANVAS ──
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

function drawGrid() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Pixels posés
  Object.entries(pixelData).forEach(([idx, color]) => {
    const i = parseInt(idx);
    const x = i % COLS;
    const y = Math.floor(i / COLS);
    ctx.fillStyle = color;
    ctx.fillRect(x * PX, y * PX, PX, PX);
  });

  // Hover
  if (hoveredPixel && !pixelData[hoveredPixel.idx]) {
    ctx.fillStyle = 'rgba(91,79,255,0.5)';
    ctx.fillRect(hoveredPixel.x * PX, hoveredPixel.y * PX, PX, PX);
  }

  // Sélections actuelles
  selectedPixels.forEach(p => {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(p.x * PX, p.y * PX, PX, PX);
  });

  // Grille légère toutes les 100 cases
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i += 100) {
    ctx.beginPath(); ctx.moveTo(i * PX, 0); ctx.lineTo(i * PX, CANVAS_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * PX); ctx.lineTo(CANVAS_SIZE, i * PX); ctx.stroke();
  }
}

function getPixelAt(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_SIZE / rect.width;
  const scaleY = CANVAS_SIZE / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX / PX);
  const y = Math.floor((e.clientY - rect.top) * scaleY / PX);
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return null;
  return { x, y, idx: y * COLS + x };
}

canvas.addEventListener('mousemove', e => {
  const p = getPixelAt(e);
  hoveredPixel = p;
  if (p) {
    const hint = document.getElementById('grid-hint');
    const needed = OPTIONS[selectedOption].qty;
    if (pixelData[p.idx]) {
      hint.textContent = currentLang === 'fr' ? `Pixel (${p.x}, ${p.y}) — déjà pris` : `Pixel (${p.x}, ${p.y}) — already taken`;
    } else if (needed > 1) {
      hint.textContent = currentLang === 'fr'
        ? `Pixel (${p.x}, ${p.y}) — clique pour sélectionner (${selectedPixels.length}/${needed})`
        : `Pixel (${p.x}, ${p.y}) — click to select (${selectedPixels.length}/${needed})`;
    } else {
      hint.textContent = currentLang === 'fr'
        ? `Pixel (${p.x}, ${p.y}) — libre`
        : `Pixel (${p.x}, ${p.y}) — free`;
    }
  }
  drawGrid();
});

canvas.addEventListener('mouseleave', () => { hoveredPixel = null; drawGrid(); });

canvas.addEventListener('click', e => {
  const p = getPixelAt(e);
  if (!p) return;
  if (pixelData[p.idx]) { showHint(currentLang === 'fr' ? 'Ce pixel est déjà pris !' : 'This pixel is already taken!'); return; }
  if (selectedPixels.find(s => s.idx === p.idx)) return;

  const needed = OPTIONS[selectedOption].qty;
  if (selectedPixels.length < needed) {
    selectedPixels.push(p);
  }
  updateSelectedInfo();
  drawGrid();
});

function showHint(text) {
  document.getElementById('grid-hint').textContent = text;
}

function updateSelectedInfo() {
  const el = document.getElementById('selected-info');
  const textEl = document.getElementById('selected-text');
  const btn = document.getElementById('btn-place');
  const btnLabel = document.getElementById('btn-label');
  const btnPrice = document.getElementById('btn-price');
  const opt = OPTIONS[selectedOption];
  const needed = opt.qty;
  const count = selectedPixels.length;

  if (count === 0) {
    el.classList.remove('active');
    textEl.textContent = currentLang === 'fr' ? 'Aucun pixel sélectionné' : 'No pixel selected';
    btn.disabled = true;
    btnLabel.textContent = currentLang === 'fr' ? `Sélectionne ${needed} pixel(s)` : `Select ${needed} pixel(s)`;
    btnPrice.textContent = '';
  } else if (count < needed) {
    el.classList.add('active');
    textEl.textContent = currentLang === 'fr'
      ? `${count}/${needed} pixels sélectionnés`
      : `${count}/${needed} pixels selected`;
    btn.disabled = true;
    btnLabel.textContent = currentLang === 'fr' ? `Encore ${needed - count} pixel(s)` : `${needed - count} more pixel(s)`;
    btnPrice.textContent = '';
  } else {
    el.classList.add('active');
    textEl.textContent = currentLang === 'fr'
      ? `${needed} pixel(s) sélectionné(s) ✓`
      : `${needed} pixel(s) selected ✓`;
    btn.disabled = false;
    btnLabel.textContent = currentLang === 'fr' ? `Poser mon ${opt.label}` : `Place my ${opt.label}`;
    btnPrice.textContent = opt.price.toFixed(2).replace('.', ',') + '€';
  }
}

// ── OPTIONS ──
function selectOption(opt) {
  selectedOption = opt;
  selectedPixels = [];
  document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
  document.getElementById('opt-' + opt).classList.add('selected');
  const showColor = ['color','pack5','pack10'].includes(opt);
  document.getElementById('color-picker-wrap').classList.toggle('visible', showColor);
  updateSelectedInfo();
  drawGrid();
}

// ── COLOR PICKER ──
const PRESET_LIST = ['#e24b4a','#D85A30','#EF9F27','#639922','#1D9E75','#378ADD','#7F77DD','#D4537E','#ffffff','#888888'];

function buildPresets() {
  const cont = document.getElementById('presets');
  PRESET_LIST.forEach(c => {
    const d = document.createElement('div');
    d.className = 'preset-dot';
    d.style.background = c;
    d.style.border = c === '#ffffff' ? '1px solid #444' : '2px solid transparent';
    d.onclick = () => setColor(c);
    cont.appendChild(d);
  });
  setColor(selectedColor);
}

function setColor(hex) {
  selectedColor = hex;
  document.getElementById('color-input').value = hex;
  document.getElementById('color-preview').style.background = hex;
  document.getElementById('color-hex').textContent = hex.toUpperCase();
  document.querySelectorAll('.preset-dot').forEach((d, i) => {
    d.classList.toggle('active', PRESET_LIST[i] === hex);
  });
}

document.getElementById('color-input').addEventListener('input', e => setColor(e.target.value));

// ── STATS ──
function updateStats() {
  document.getElementById('stat-sold').textContent = totalSold.toLocaleString('fr-FR');
  document.getElementById('stat-free').textContent = (TOTAL_PIXELS - totalSold).toLocaleString('fr-FR');
  document.getElementById('stat-rev').textContent = totalRevenue.toFixed(2).replace('.', ',') + '€';
  const pct = (totalSold / TOTAL_PIXELS * 100).toFixed(2);
  document.getElementById('stat-pct').innerHTML = pct + '% <span>' + (currentLang === 'fr' ? 'rempli' : 'full') + '</span>';
  document.getElementById('progress-bar').style.width = pct + '%';
}

// ── PAYMENT FLOW ──
function startPayment() {
  if (selectedPixels.length < OPTIONS[selectedOption].qty) return;
  const opt = OPTIONS[selectedOption];
  const color = selectedOption === 'black' ? '#000000' : selectedColor;
  const priceStr = opt.price.toFixed(2).replace('.', ',') + '€';

  const summary = document.getElementById('modal-summary');
  const colorDots = selectedPixels.map(p =>
    `(${p.x},${p.y})`
  ).join(', ');

  summary.innerHTML = `
    <strong>${currentLang === 'fr' ? 'Option' : 'Option'} :</strong> ${opt.label}<br>
    <strong>${currentLang === 'fr' ? 'Pixels' : 'Pixels'} :</strong> ${colorDots}<br>
    <strong>${currentLang === 'fr' ? 'Couleur' : 'Color'} :</strong>
    <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${color};border:1px solid #444;vertical-align:middle;margin:0 4px;"></span>
    ${color.toUpperCase()}<br>
    <strong>Total :</strong> ${priceStr}
  `;
  document.getElementById('modal-price').textContent = priceStr;
  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.remove('open');
  }
}

async function confirmPayment() {
  const opt = OPTIONS[selectedOption];
  const color = selectedOption === 'black' ? '#000000' : selectedColor;

  try {
    for (const p of selectedPixels) {
      await savePixelToSupabase(p.x, p.y, color);
      pixelData[p.idx] = color;
      totalSold++;
      totalRevenue += opt.price / opt.qty;
    }
    updateStats();
    drawGrid();
    selectedPixels = [];
    updateSelectedInfo();
    closeModal();
    showSuccessToast(opt);
  } catch (err) {
    console.error('Erreur:', err);
    alert(currentLang === 'fr' ? 'Une erreur est survenue, réessaie.' : 'An error occurred, please try again.');
  }
}

function showSuccessToast(opt) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#1D9E75;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;z-index:200;font-family:var(--font-display);white-space:nowrap;';
  t.textContent = currentLang === 'fr'
    ? `✓ ${opt.qty} pixel(s) posé(s) pour toujours !`
    : `✓ ${opt.qty} pixel(s) placed forever!`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── SUPABASE ──
async function loadPixelsFromSupabase() {
  if (SUPABASE_URL === 'REMPLACE_PAR_TON_URL_SUPABASE') return;
  try {
    let allPixels = [];
    let from = 0;
    const batchSize = 1000;
    while (true) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/pixels?select=x,y,color&limit=${batchSize}&offset=${from}`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const data = await res.json();
      if (!data.length) break;
      allPixels = allPixels.concat(data);
      from += batchSize;
      if (data.length < batchSize) break;
    }
    totalSold = 0;
    totalRevenue = 0;
    allPixels.forEach(({ x, y, color }) => {
      const idx = y * COLS + x;
      pixelData[idx] = color;
      totalSold++;
      totalRevenue += color === '#000000' ? 0.5 : 1;
    });
    updateStats();
    drawGrid();
  } catch (err) {
    console.error('Supabase load error:', err);
  }
}

async function savePixelToSupabase(x, y, color) {
  if (SUPABASE_URL === 'REMPLACE_PAR_TON_URL_SUPABASE') return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pixels`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ x, y, color })
  });
  if (!res.ok) throw new Error('Supabase save failed');
}

// ── LANGUE ──
function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  document.querySelectorAll('[data-fr]').forEach(el => {
    el.innerHTML = lang === 'fr' ? el.dataset.fr : el.dataset.en;
  });
  updateSelectedInfo();
  updateStats();
}

// ── HTML DES OPTIONS (packs) ──
function buildOptions() {
  const group = document.getElementById('option-group');
  group.innerHTML = `
    <div class="option selected" id="opt-black" onclick="selectOption('black')">
      <div class="option-left">
        <div class="option-swatch" style="background:#111;"></div>
        <div>
          <div class="option-name">Pixel noir</div>
          <div class="option-desc">Simple, discret, permanent</div>
        </div>
      </div>
      <div class="option-price">0,50€</div>
    </div>

    <div class="option" id="opt-color" onclick="selectOption('color')">
      <div class="option-left">
        <div class="option-swatch rainbow"></div>
        <div>
          <div class="option-name">Pixel coloré</div>
          <div class="option-desc">1 pixel, ta couleur</div>
        </div>
      </div>
      <div class="option-price">1,00€</div>
    </div>

    <div class="option pack" id="opt-pack5" onclick="selectOption('pack5')">
      <div class="option-left">
        <div class="option-swatch rainbow"></div>
        <div>
          <div class="option-name">Pack 5 pixels <span class="badge-promo">-20%</span></div>
          <div class="option-desc">5 pixels colorés au lieu de 5,00€</div>
        </div>
      </div>
      <div class="option-price">4,00€</div>
    </div>

    <div class="option pack" id="opt-pack10" onclick="selectOption('pack10')">
      <div class="option-left">
        <div class="option-swatch rainbow"></div>
        <div>
          <div class="option-name">Pack 10 pixels <span class="badge-promo">-30%</span></div>
          <div class="option-desc">10 pixels colorés au lieu de 10,00€</div>
        </div>
      </div>
      <div class="option-price">7,00€</div>
    </div>
  `;
}

// ── INIT ──
buildOptions();
buildPresets();
drawGrid();
loadPixelsFromSupabase();
updateStats();
updateSelectedInfo();
