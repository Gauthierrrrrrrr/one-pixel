// ── CONFIG ── (à remplacer avec tes vraies clés)
const SUPABASE_URL = 'REMPLACE_PAR_TON_URL_SUPABASE';
const SUPABASE_KEY = 'REMPLACE_PAR_TA_CLE_SUPABASE';
const STRIPE_PUBLIC_KEY = 'REMPLACE_PAR_TA_CLE_STRIPE_PUBLIQUE';

// ── CONSTANTES ──
const COLS = 100, ROWS = 100;
const CANVAS_SIZE = 500;
const PX = CANVAS_SIZE / COLS; // 5px par pixel

const PRESET_COLORS = [
  '#e24b4a','#D85A30','#EF9F27','#639922',
  '#1D9E75','#378ADD','#7F77DD','#D4537E',
  '#ffffff','#888888'
];

// ── STATE ──
let pixels = new Array(COLS * ROWS).fill(null); // null = libre, '#hex' = couleur posée
let selectedOption = 'black'; // 'black' | 'color'
let selectedColor = '#378ADD';
let selectedPixel = null; // {x, y, idx}
let hoveredPixel = null;
let currentLang = 'fr';

// ── CANVAS ──
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');

function drawGrid() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Fond
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Pixels posés
  for (let i = 0; i < pixels.length; i++) {
    if (!pixels[i]) continue;
    const x = i % COLS;
    const y = Math.floor(i / COLS);
    ctx.fillStyle = pixels[i];
    ctx.fillRect(x * PX, y * PX, PX, PX);
  }

  // Hover
  if (hoveredPixel) {
    const { x, y, idx } = hoveredPixel;
    if (!pixels[idx]) {
      ctx.fillStyle = 'rgba(91,79,255,0.4)';
      ctx.fillRect(x * PX, y * PX, PX, PX);
    }
  }

  // Sélection
  if (selectedPixel) {
    const { x, y } = selectedPixel;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x * PX + 0.75, y * PX + 0.75, PX - 1.5, PX - 1.5);
  }

  // Grille légère toutes les 10 cases
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= COLS; i += 10) {
    ctx.beginPath(); ctx.moveTo(i * PX, 0); ctx.lineTo(i * PX, CANVAS_SIZE); ctx.stroke();
  }
  for (let j = 0; j <= ROWS; j += 10) {
    ctx.beginPath(); ctx.moveTo(0, j * PX); ctx.lineTo(CANVAS_SIZE, j * PX); ctx.stroke();
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
    hint.textContent = pixels[p.idx]
      ? (currentLang === 'fr' ? `Pixel (${p.x}, ${p.y}) — déjà pris` : `Pixel (${p.x}, ${p.y}) — already taken`)
      : (currentLang === 'fr' ? `Pixel (${p.x}, ${p.y}) — libre, clique pour le sélectionner` : `Pixel (${p.x}, ${p.y}) — free, click to select`);
  }
  drawGrid();
});

canvas.addEventListener('mouseleave', () => { hoveredPixel = null; drawGrid(); });

canvas.addEventListener('click', e => {
  const p = getPixelAt(e);
  if (!p) return;
  if (pixels[p.idx]) {
    showHint(currentLang === 'fr' ? `Ce pixel est déjà pris !` : `This pixel is already taken!`);
    return;
  }
  selectedPixel = p;
  updateSelectedInfo();
  drawGrid();
});

function showHint(text) {
  const el = document.getElementById('grid-hint');
  el.textContent = text;
}

function updateSelectedInfo() {
  const el = document.getElementById('selected-info');
  const textEl = document.getElementById('selected-text');
  const btn = document.getElementById('btn-place');
  const btnLabel = document.getElementById('btn-label');
  const btnPrice = document.getElementById('btn-price');

  if (selectedPixel) {
    el.classList.add('active');
    textEl.textContent = currentLang === 'fr'
      ? `Pixel (${selectedPixel.x}, ${selectedPixel.y}) sélectionné ✓`
      : `Pixel (${selectedPixel.x}, ${selectedPixel.y}) selected ✓`;
    btn.disabled = false;
    const price = selectedOption === 'black' ? '0,50€' : '1,00€';
    btnLabel.textContent = currentLang === 'fr' ? 'Poser mon pixel' : 'Place my pixel';
    btnPrice.textContent = price;
  } else {
    el.classList.remove('active');
    textEl.textContent = currentLang === 'fr' ? 'Aucun pixel sélectionné' : 'No pixel selected';
    btn.disabled = true;
    btnLabel.textContent = currentLang === 'fr' ? "Sélectionne un pixel d'abord" : 'Select a pixel first';
    btnPrice.textContent = '';
  }
}

// ── OPTIONS ──
function selectOption(opt) {
  selectedOption = opt;
  document.getElementById('opt-black').classList.toggle('selected', opt === 'black');
  document.getElementById('opt-color').classList.toggle('selected', opt === 'color');
  const picker = document.getElementById('color-picker-wrap');
  picker.classList.toggle('visible', opt === 'color');
  updateSelectedInfo();
}

// ── COLOR PICKER ──
function buildPresets() {
  const cont = document.getElementById('presets');
  PRESET_COLORS.forEach(c => {
    const d = document.createElement('div');
    d.className = 'preset-dot';
    d.style.background = c;
    d.style.border = c === '#ffffff' ? '1px solid #444' : '2px solid transparent';
    d.onclick = () => { setColor(c); };
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
    d.classList.toggle('active', PRESET_COLORS[i] === hex);
  });
}

document.getElementById('color-input').addEventListener('input', e => {
  setColor(e.target.value);
});

// ── STATS ──
function updateStats() {
  const sold = pixels.filter(Boolean).length;
  const free = 10000 - sold;
  let revenue = 0;
  pixels.forEach(c => { if (c) revenue += c === '#000000' ? 0.5 : 1; });
  const pct = Math.round(sold / 100);

  document.getElementById('stat-sold').textContent = sold.toLocaleString('fr-FR');
  document.getElementById('stat-free').textContent = free.toLocaleString('fr-FR');
  document.getElementById('stat-rev').textContent = revenue.toFixed(2).replace('.', ',') + '€';
  document.getElementById('stat-pct').innerHTML = pct + '% <span data-fr="rempli" data-en="full">' + (currentLang === 'fr' ? 'rempli' : 'full') + '</span>';
  document.getElementById('progress-bar').style.width = pct + '%';
}

// ── PAYMENT FLOW ──
function startPayment() {
  if (!selectedPixel) return;
  const price = selectedOption === 'black' ? '0,50€' : '1,00€';
  const color = selectedOption === 'black' ? '#000000' : selectedColor;

  const summary = document.getElementById('modal-summary');
  summary.innerHTML = `
    <strong>${currentLang === 'fr' ? 'Position' : 'Position'} :</strong> (${selectedPixel.x}, ${selectedPixel.y})<br>
    <strong>${currentLang === 'fr' ? 'Couleur' : 'Color'} :</strong>
    <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${color};border:1px solid #444;vertical-align:middle;margin:0 4px;"></span>
    ${color.toUpperCase()}<br>
    <strong>Total :</strong> ${price}
  `;
  document.getElementById('modal-price').textContent = price;
  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.remove('open');
  }
}

async function confirmPayment() {
  if (!selectedPixel) return;
  const color = selectedOption === 'black' ? '#000000' : selectedColor;

  // ── Ici tu appeleras ton backend pour créer une session Stripe ──
  // Pour l'instant on simule le placement direct
  try {
    await savePixelToSupabase(selectedPixel.x, selectedPixel.y, color);
    pixels[selectedPixel.idx] = color;
    updateStats();
    drawGrid();
    selectedPixel = null;
    updateSelectedInfo();
    closeModal();
    showSuccessToast();
  } catch (err) {
    console.error('Erreur:', err);
    alert(currentLang === 'fr' ? 'Une erreur est survenue, réessaie.' : 'An error occurred, please try again.');
  }
}

function showSuccessToast() {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#1D9E75;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;z-index:200;font-family:var(--font-display);';
  t.textContent = currentLang === 'fr' ? '✓ Pixel posé pour toujours !' : '✓ Pixel placed forever!';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── SUPABASE ──
async function loadPixelsFromSupabase() {
  if (SUPABASE_URL === 'REMPLACE_PAR_TON_URL_SUPABASE') return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/pixels?select=x,y,color`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const data = await res.json();
    data.forEach(({ x, y, color }) => {
      pixels[y * COLS + x] = color;
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

// ── INIT ──
selectOption('black');
buildPresets();
drawGrid();
loadPixelsFromSupabase();
updateStats();
