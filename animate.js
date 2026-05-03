/* ============================================================
   animate.js — Uday & Unnati Wedding Invitation
   Motion & Life Layer — v5 Performance
   ============================================================ */
'use strict';

/* ── DEVICE CAPABILITY DETECTION ─────────────────────────── */
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const isLowEnd  = isMobile && (navigator.hardwareConcurrency || 4) <= 4;

/* Reduce work on low-end devices */
const CFG = {
  petalCount:   isLowEnd ? 8  : isMobile ? 14 : 25,
  splashPetals: isLowEnd ? 10 : isMobile ? 16 : 26,
  enableHero:   !isLowEnd,
  enableWedding:!isLowEnd,
  enableLilies: !isLowEnd,
};

/* On very low-end, slow down ganpati glow instead of killing it */
if (isLowEnd) {
  document.addEventListener('DOMContentLoaded', () => {
    const g = document.querySelector('.ganpati-img');
    if (g) g.style.animationDuration = '5s'; // slower = less GPU pressure
  });
}

/* ── CONSTANTS ─────────────────────────────────────────── */
const SECTION_COLOURS = {
  'hero':       [74,  8,   8  ],
  'blessings':  [58,  26,  10 ],
  'ev-ring':    [10,  22,  64 ],
  'ev-sangeet': [106, 36,  16 ],  /* warm dark auburn — matches new section bottom */
  'ev-haldi':   [122, 50,  0  ],  /* warm amber — matches new section top */
  'ev-wedding': [48,  8,   8  ],
  'venue':      [4,   30,  16 ],
  'countdown':  [228, 244, 228],
  'note':       [248, 228, 232],
};

const PETAL_COLOURS = [
  [232, 130, 40 ],
  [220, 80,  100],
  [255, 200, 60 ],
  [200, 100, 180],
  [255, 150, 80 ],
  [255, 180, 180],
  [255, 210, 100],
];

/* ══════════════════════════════════════════════════════════
   UNIFIED RAF MANAGER — single requestAnimationFrame loop
   All canvas animations register here; one loop drives all.
   ══════════════════════════════════════════════════════════ */
const RAF = {
  _tasks: new Map(),
  _running: false,
  _id: null,
  _tick() {
    for (const fn of RAF._tasks.values()) fn();
    if (RAF._tasks.size) RAF._id = requestAnimationFrame(RAF._tick);
    else RAF._running = false;
  },
  add(key, fn) {
    RAF._tasks.set(key, fn);
    if (!RAF._running) { RAF._running = true; RAF._id = requestAnimationFrame(RAF._tick); }
  },
  remove(key) { RAF._tasks.delete(key); }
};

/* ══════════════════════════════════════════════════════════
   1. GLOWING CONFETTI — fixed canvas (lightweight)
   ══════════════════════════════════════════════════════════ */
function initGlowConfetti() {
  const canvas = document.getElementById('petal-canvas-2d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }, { passive: true });

  function spawnPetal(randomY = false) {
    const c = PETAL_COLOURS[Math.floor(Math.random() * PETAL_COLOURS.length)];
    return {
      x:       Math.random() * (W || 400),
      y:       randomY ? Math.random() * (H || 800) : -20,
      w:       4 + Math.random() * 8,
      h:       7 + Math.random() * 12,
      rot:     Math.random() * Math.PI * 2,
      rotV:    (Math.random() - 0.5) * 0.03,
      vx:      (Math.random() - 0.5) * 0.45,
      vy:      0.3 + Math.random() * 0.89,
      wobble:  Math.random() * Math.PI * 2,
      wobbleS: 0.012 + Math.random() * 0.016,
      alpha:   0.22 + Math.random() * 0.28,
      glowT:   Math.random() * Math.PI * 2,
      glowS:   0.018 + Math.random() * 0.012,
      r: c[0], g: c[1], b: c[2],
    };
  }

  const petals = Array.from({ length: CFG.petalCount }, () => spawnPetal(true));

  // Shared reusable gradient cache for mobile
  RAF.add('confetti', () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
      p.wobble += p.wobbleS;
      p.glowT  += p.glowS;
      p.x += p.vx + Math.sin(p.wobble) * 0.3;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.y > H + 30) Object.assign(p, spawnPetal(false));

      const pulse = p.alpha * (0.65 + 0.35 * Math.sin(p.glowT));

      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // Skip expensive glow on mobile to save fill calls
      if (!isLowEnd) {
        const gr    = p.w * 1.8;
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, gr);
        grd.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},0.5)`);
        grd.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(0, 0, gr, gr * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = pulse * 1.3;
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
}

/* ══════════════════════════════════════════════════════════
   2. HERO SPARKLE — rotating lotus mandalas
   ══════════════════════════════════════════════════════════ */
function initHeroSparkles() {
  if (!CFG.enableHero) return;
  const hero = document.getElementById('hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;';
  hero.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H;

  function resize() {
    W = canvas.width  = hero.offsetWidth  || window.innerWidth;
    H = canvas.height = hero.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 200); }, { passive: true });

  const flowers = [
    { x: 0.15, y: 0.35, r: 0.38, speed: 0.004, phase: 0,              petals: 8,  alpha: 0.18 },
    { x: 0.85, y: 0.60, r: 0.30, speed: 0.003, phase: Math.PI / 4,    petals: 12, alpha: 0.15 },
    { x: 0.50, y: 0.88, r: 0.22, speed: 0.005, phase: Math.PI / 3,    petals: 6,  alpha: 0.13 },
  ];

  function drawFlower(cx, cy, radius, petals, rotation, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    const step = (Math.PI * 2) / petals;

    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);
      const grd = ctx.createRadialGradient(0, radius * 0.4, 0, 0, radius * 0.4, radius * 0.7);
      grd.addColorStop(0,   'rgba(255,220,120,0.9)');
      grd.addColorStop(0.5, 'rgba(240,180,60,0.55)');
      grd.addColorStop(1,   'rgba(200,120,20,0)');
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.5, radius * 0.19, radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }

    ctx.rotate(step / 2);
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);
      const grd2 = ctx.createRadialGradient(0, radius * 0.25, 0, 0, radius * 0.25, radius * 0.45);
      grd2.addColorStop(0, 'rgba(255,240,160,0.75)');
      grd2.addColorStop(1, 'rgba(220,150,40,0)');
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.28, radius * 0.133, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd2;
      ctx.fill();
      ctx.restore();
    }

    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.18);
    cg.addColorStop(0,   'rgba(255,240,180,0.8)');
    cg.addColorStop(0.5, 'rgba(255,200,60,0.35)');
    cg.addColorStop(1,   'rgba(200,130,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.restore();
  }

  RAF.add('hero', () => {
    ctx.clearRect(0, 0, W, H);
    for (const f of flowers) {
      f.phase += f.speed;
      drawFlower(f.x * W, f.y * H, f.r * Math.min(W, H), f.petals, f.phase, f.alpha);
    }
  });
}

/* ══════════════════════════════════════════════════════════
   3. WEDDING FLOWERS — spinning gold mandalas
   ══════════════════════════════════════════════════════════ */
function initWeddingFlowers() {
  if (!CFG.enableWedding) return;
  const section = document.getElementById('ev-wedding');
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  section.style.position = 'relative';
  section.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H;

  function resize() {
    W = canvas.width  = section.offsetWidth  || window.innerWidth;
    H = canvas.height = section.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { clearTimeout(resize._t2); resize._t2 = setTimeout(resize, 200); }, { passive: true });

  const flowers = [
    { x: 0.04, y: 0.42, r: 0.28, speed: 0.004, phase: 0,          petals: 8, alpha: 0.14 },
    { x: 0.96, y: 0.42, r: 0.28, speed: 0.004, phase: Math.PI,    petals: 8, alpha: 0.14 },
    { x: 0.06, y: 0.78, r: 0.18, speed: 0.005, phase: Math.PI/3,  petals: 6, alpha: 0.10 },
    { x: 0.94, y: 0.78, r: 0.18, speed: 0.005, phase: Math.PI/5,  petals: 6, alpha: 0.10 },
  ];

  function drawFlower(cx, cy, radius, petals, rotation, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    const step = (Math.PI * 2) / petals;
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);
      const grd = ctx.createRadialGradient(0, radius * 0.4, 0, 0, radius * 0.4, radius * 0.7);
      grd.addColorStop(0,   'rgba(255,220,80,0.9)');
      grd.addColorStop(0.5, 'rgba(220,160,30,0.55)');
      grd.addColorStop(1,   'rgba(180,100,0,0)');
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.5, radius * 0.19, radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }
    ctx.rotate(step / 2);
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);
      const grd2 = ctx.createRadialGradient(0, radius * 0.25, 0, 0, radius * 0.25, radius * 0.45);
      grd2.addColorStop(0, 'rgba(255,240,160,0.75)');
      grd2.addColorStop(1, 'rgba(220,150,40,0)');
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.28, radius * 0.133, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd2;
      ctx.fill();
      ctx.restore();
    }
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.18);
    cg.addColorStop(0,   'rgba(255,240,160,0.85)');
    cg.addColorStop(0.5, 'rgba(255,200,60,0.4)');
    cg.addColorStop(1,   'rgba(200,130,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.restore();
  }

  RAF.add('wedding', () => {
    ctx.clearRect(0, 0, W, H);
    for (const f of flowers) {
      f.phase += f.speed;
      drawFlower(f.x * W, f.y * H, f.r * Math.min(W, H), f.petals, f.phase, f.alpha);
    }
  });
}

/* ══════════════════════════════════════════════════════════
   4. NOTE LILIES — swaying stems
   ══════════════════════════════════════════════════════════ */
function initNoteLilies() {
  if (!CFG.enableLilies) return;
  const section = document.getElementById('note');
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  section.style.position = 'relative';
  section.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  let W = 0, H = 0;

  function resize() {
    W = canvas.width  = section.offsetWidth  || window.innerWidth;
    H = canvas.height = section.offsetHeight || 600;
  }
  resize();

  // Use ResizeObserver so canvas updates when section height changes
  // (e.g. fonts load, content reflows) — prevents coordinate glitch
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(section);
  } else {
    window.addEventListener('resize', () => { clearTimeout(resize._t3); resize._t3 = setTimeout(resize, 200); }, { passive: true });
  }

  const lilies = [
    { x: 0.04, speed: 0.008, phase: 0,           height: 0.85, alpha: 0.55, petals: 5 },
    { x: 0.13, speed: 0.006, phase: Math.PI*0.3,  height: 0.95, alpha: 0.45, petals: 6 },
    { x: 0.22, speed: 0.007, phase: Math.PI*0.8,  height: 0.75, alpha: 0.40, petals: 5 },
    { x: 0.78, speed: 0.007, phase: Math.PI*0.7,  height: 0.80, alpha: 0.45, petals: 5 },
    { x: 0.88, speed: 0.009, phase: Math.PI*1.1,  height: 0.90, alpha: 0.50, petals: 6 },
    { x: 0.97, speed: 0.006, phase: Math.PI*0.5,  height: 0.70, alpha: 0.42, petals: 4 },
  ];

  function drawLily(cx, baseY, stemH, swayAngle, alpha, nPetals) {
    // Guard: skip drawing if canvas not sized yet
    if (!W || !H) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, baseY);
    ctx.rotate(swayAngle * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      swayAngle * stemH * 0.15, -stemH * 0.3,
      swayAngle * stemH * 0.25, -stemH * 0.65,
      swayAngle * stemH * 0.18, -stemH
    );
    ctx.strokeStyle = 'rgba(160,200,120,0.7)';
    ctx.lineWidth   = 2.8;
    ctx.lineCap     = 'round';
    ctx.stroke();
    ctx.translate(swayAngle * stemH * 0.18, -stemH);
    const step = (Math.PI * 2) / nPetals;
    for (let i = 0; i < nPetals; i++) {
      ctx.save();
      ctx.rotate(i * step + swayAngle * 0.3);
      const grd = ctx.createRadialGradient(0, -14, 0, 0, -14, 30);
      grd.addColorStop(0,   'rgba(255,160,200,0.98)');
      grd.addColorStop(0.5, 'rgba(240,100,160,0.75)');
      grd.addColorStop(1,   'rgba(200,60,120,0)');
      ctx.beginPath();
      ctx.ellipse(0, -18, 7, 24, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
    cg.addColorStop(0, 'rgba(255,240,180,0.9)');
    cg.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.restore();
  }

  RAF.add('lilies', () => {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    for (const l of lilies) {
      l.phase += l.speed;
      drawLily(l.x * W, H, l.height * H, Math.sin(l.phase), l.alpha, l.petals);
    }
  });
}

/* ══════════════════════════════════════════════════════════
   5. BODY COLOUR SCROLL TRANSITIONS
   ══════════════════════════════════════════════════════════ */
function initColourTransitions() {
  const entries = Object.entries(SECTION_COLOURS)
    .map(([id, rgb]) => ({ el: document.getElementById(id), rgb }))
    .filter(e => e.el);
  if (!entries.length) return;

  const bar = document.getElementById('progress-bar');
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

  // Pre-cache bounding tops once, refresh on resize
  let tops = [];
  function cacheTops() {
    const sy = window.scrollY;
    tops = entries.map(e => e.el.getBoundingClientRect().top + sy - 60);
  }
  cacheTops();
  window.addEventListener('resize', () => { clearTimeout(cacheTops._t); cacheTops._t = setTimeout(cacheTops, 200); }, { passive: true });

  // Throttle to ~30fps
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (Math.min(sy / dh, 1) * 100) + '%';

      for (let i = 0; i < entries.length - 1; i++) {
        if (sy >= tops[i] && sy < tops[i + 1]) {
          const t  = Math.max(0, Math.min(1, (sy - tops[i]) / (tops[i + 1] - tops[i])));
          const [r1,g1,b1] = entries[i].rgb;
          const [r2,g2,b2] = entries[i+1].rgb;
          document.body.style.backgroundColor =
            `rgb(${lerp(r1,r2,t)},${lerp(g1,g2,t)},${lerp(b1,b2,t)})`;
          ticking = false;
          return;
        }
      }
      const last = entries[sy < 200 ? 0 : entries.length - 1].rgb;
      document.body.style.backgroundColor = `rgb(${last[0]},${last[1]},${last[2]})`;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════════════════════════
   6. PARALLAX BACKGROUNDS (disabled on mobile — not worth it)
   ══════════════════════════════════════════════════════════ */
function initParallax() {
  if (isMobile) return; // skip on mobile entirely
  const sections = [...document.querySelectorAll('[data-parallax]')];
  if (!sections.length) return;

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      for (const sec of sections) {
        const rate  = parseFloat(sec.dataset.parallax) || 0.2;
        const rect  = sec.getBoundingClientRect();
        const shift = ((rect.top + rect.height / 2) - window.innerHeight / 2) * rate;
        sec.style.backgroundPositionY = `calc(50% + ${shift.toFixed(1)}px)`;
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════════════════════════
   7. SCROLL REVEAL
   ══════════════════════════════════════════════════════════ */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════════════════
   8. PHOTO FRAME CORNERS
   ══════════════════════════════════════════════════════════ */
function initFrameCorners() {
  document.querySelectorAll('.photo-frame').forEach(frame => {
    for (const pos of ['tl','tr','bl','br']) {
      if (frame.querySelector(`.fc-${pos}`)) continue;
      const d = document.createElement('div');
      d.className = `frame-corner fc-${pos}`;
      frame.appendChild(d);
    }
  });
}

/* ══════════════════════════════════════════════════════════
   9. CEREMONY MILESTONE BURSTS (skip on low-end)
   ══════════════════════════════════════════════════════════ */
function initMilestoneBursts() {
  if (isLowEnd) return;
  const PALETTES = {
    'ev-ring':    ['#B8D8FF','#DEEEFF','#FFFFFF','#7AAADE'],
    'ev-haldi':   ['#FFE840','#FFB800','#FFF4A0','#FFA020'],
    'ev-sangeet': ['#FF80CC','#FF40A0','#FFD0F0','#CC2080'],
    'ev-wedding': ['#FFD700','#FF6040','#FFE8A0','#CC4020'],
  };
  const triggered = new Set();

  function burst(el, palette) {
    const rect = el.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height * 0.22;
    const N    = 14; // reduced from 18

    // Use a DocumentFragment for fewer reflows
    const frag = document.createDocumentFragment();
    const particles = [];

    for (let i = 0; i < N; i++) {
      const angle  = (i / N) * Math.PI * 2;
      const speed  = 45 + Math.random() * 75;
      const size   = 3.5 + Math.random() * 5;
      const colour = palette[i % palette.length];
      const dur    = 0.55 + Math.random() * 0.5;

      const p = document.createElement('div');
      p.style.cssText = `
        position:fixed;left:${cx}px;top:${cy}px;
        width:${size}px;height:${size}px;border-radius:50%;
        background:${colour};pointer-events:none;z-index:9999;
        translate:-50% -50%;
        will-change:transform,opacity;
        transition:all ${dur}s cubic-bezier(.22,1,.36,1);
      `;
      frag.appendChild(p);
      particles.push({ el: p, cx, cy, angle, speed, dur });
    }
    document.body.appendChild(frag);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        for (const { el: p, cx, cy, angle, speed, dur } of particles) {
          p.style.left    = `${cx + Math.cos(angle) * speed}px`;
          p.style.top     = `${cy + Math.sin(angle) * speed * 0.55}px`;
          p.style.opacity = '0';
          setTimeout(() => p.remove(), (dur + 0.1) * 1000);
        }
      });
    });
  }

  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting || triggered.has(e.target.id)) continue;
      triggered.add(e.target.id);
      const palette = PALETTES[e.target.id];
      if (palette) burst(e.target, palette);
    }
  }, { threshold: 0.28 });

  for (const id of Object.keys(PALETTES)) {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  }
}

/* ══════════════════════════════════════════════════════════
   10. CARD 3D TILT (desktop only)
   ══════════════════════════════════════════════════════════ */
function initCardTilt() {
  if (isMobile) return;
  document.querySelectorAll('.ev-full-card').forEach(card => {
    let rafId;
    card.addEventListener('pointermove', e => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left)  / r.width  - 0.5) * 9;
        const y = ((e.clientY - r.top)   / r.height - 0.5) * -6;
        card.style.transition = 'transform .08s ease-out';
        card.style.transform  = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-5px)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(rafId);
      card.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1)';
      card.style.transform  = '';
    });
  });
}

/* ══════════════════════════════════════════════════════════
   11. ORNAMENTAL BAND ENTRANCE
   ══════════════════════════════════════════════════════════ */
function initBandReveals() {
  const bands = document.querySelectorAll('.orn-band, [class*="band-"]');
  bands.forEach(band => {
    band.style.opacity    = '0';
    band.style.transform  = 'scaleX(0.96)';
    band.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(.22,1,.36,1)';
  });
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'scaleX(1)';
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.1 });
  bands.forEach(band => io.observe(band));
}

/* ══════════════════════════════════════════════════════════
   12. HERO NAME ENTRANCE
   ══════════════════════════════════════════════════════════ */
function initHeroEntrance() {
  const items = [
    document.querySelector('.groom-name'),
    document.querySelector('.bride-name'),
    document.querySelector('.hero-shubh'),
    document.querySelector('.hero-names-en'),
  ].filter(Boolean);

  items.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(30px)';
    el.style.transition = `opacity .9s ${0.4 + i * 0.15}s cubic-bezier(.22,1,.36,1),
                            transform .9s ${0.4 + i * 0.15}s cubic-bezier(.22,1,.36,1)`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      items.forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   13. COUNTDOWN
   ══════════════════════════════════════════════════════════ */
function initCountdown() {
  const tgt = new Date('2026-06-23T12:30:00+05:30').getTime();
  const pad = n => String(n).padStart(2, '0');
  const els = {
    d: document.getElementById('cd-d'),
    h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'),
    s: document.getElementById('cd-s'),
  };

  function tick() {
    const diff = tgt - Date.now();
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    const s = Math.floor(diff % 60000 / 1000);
    if (els.d) els.d.textContent = pad(d);
    if (els.h) els.h.textContent = pad(h);
    if (els.m) els.m.textContent = pad(m);
    if (els.s) els.s.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initGlowConfetti();
  initHeroSparkles();
  initWeddingFlowers();
  initNoteLilies();
  initColourTransitions();
  initParallax();
  initReveal();
  initFrameCorners();
  initMilestoneBursts();
  initCardTilt();
  initBandReveals();
  initHeroEntrance();
  initCountdown();
});
