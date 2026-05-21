/* ============================================================
   animate.js — Uday & Unnati Wedding Invitation (English Ed.)
   Rotatory Flowers Everywhere — v7 Fixed: All Flowers + Glow + No Lag
   ============================================================ */
'use strict';

const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const isLowEnd  = isMobile && (navigator.hardwareConcurrency || 4) <= 4;

const CFG = {
  petalCount: isLowEnd ? 8 : isMobile ? 14 : 22,
};

/* Section colour map — all in red-maroon range now */
const SECTION_COLOURS = {
  'hero':               [74,  8,   8  ],
  'blessings':          [122, 26,  26 ],
  'date-reveal':        [110, 16,  16 ],
  'ev-sangeet-haldi':   [110, 16,  16 ],
  'ev-wedding':         [88,  10,  10 ],
  'venue':              [82,  12,  12 ],
  'countdown':          [98,  14,  14 ],
  'note':               [104, 18,  18 ],
};

/* Red-maroon-gold palette for rotatory flower petals */
const PETAL_COLOURS = [
  [255, 200, 60 ],   /* gold        */
  [220, 80,  60 ],   /* warm red    */
  [200, 50,  50 ],   /* maroon-red  */
  [255, 150, 70 ],   /* amber       */
  [180, 40,  40 ],   /* deep maroon */
  [240, 120, 50 ],   /* burnt orange*/
  [255, 190, 90 ],   /* pale gold   */
];

/* ══════════════════════════════════════════════════════════
   UNIFIED RAF MANAGER
   ══════════════════════════════════════════════════════════ */
const RAF = {
  _tasks: new Map(),
  _running: false,
  _tick() {
    for (const fn of RAF._tasks.values()) fn();
    if (RAF._tasks.size) requestAnimationFrame(RAF._tick);
    else RAF._running = false;
  },
  add(key, fn) {
    RAF._tasks.set(key, fn);
    if (!RAF._running) { RAF._running = true; requestAnimationFrame(RAF._tick); }
  },
  remove(key) { RAF._tasks.delete(key); }
};

/* ══════════════════════════════════════════════════════════
   SHARED FLOWER DRAW HELPER
   Used by all section-level rotatory flower canvases
   ══════════════════════════════════════════════════════════ */
function drawRotatoryFlower(ctx, cx, cy, radius, petals, rotation, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const step = (Math.PI * 2) / petals;

  /* Outer petals */
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate(i * step);
    const grd = ctx.createRadialGradient(0, radius * 0.4, 0, 0, radius * 0.4, radius * 0.72);
    grd.addColorStop(0,   'rgba(255,220,100,0.9)');
    grd.addColorStop(0.5, 'rgba(220,120,40,0.55)');
    grd.addColorStop(1,   'rgba(160,40,10,0)');
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.5, radius * 0.18, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
  }
  /* Inner petals (offset by half step) */
  ctx.rotate(step / 2);
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate(i * step);
    const grd2 = ctx.createRadialGradient(0, radius * 0.25, 0, 0, radius * 0.25, radius * 0.44);
    grd2.addColorStop(0, 'rgba(255,240,160,0.75)');
    grd2.addColorStop(1, 'rgba(200,80,20,0)');
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.28, radius * 0.12, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = grd2;
    ctx.fill();
    ctx.restore();
  }
  /* Centre glow */
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.19);
  cg.addColorStop(0,   'rgba(255,245,180,0.9)');
  cg.addColorStop(0.5, 'rgba(255,200,60,0.4)');
  cg.addColorStop(1,   'rgba(180,60,0,0)');
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.19, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════
   1. GLOBAL FALLING FLOWER CONFETTI — removed for performance
   ══════════════════════════════════════════════════════════ */
/* initGlowConfetti removed: caused crash (W/H=0 on first RAF tick)
   and was the primary source of lag on mobile devices. */

/* ══════════════════════════════════════════════════════════
   FACTORY: attach a rotating-flower canvas to any section
   ══════════════════════════════════════════════════════════ */
function attachFlowerCanvas(sectionId, rafKey, flowerDefs) {
  /* All devices get the full flower set — mobile throttles via RAF skip instead */
  const section = document.getElementById(sectionId);
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;will-change:transform;transform:translateZ(0);';
  section.style.position = 'relative';
  section.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W, H;

  function resize() {
    const sw = section.offsetWidth  || window.innerWidth;
    const sh = section.offsetHeight || window.innerHeight;
    W = sw; H = sh;
    canvas.width  = Math.round(sw * DPR);
    canvas.height = Math.round(sh * DPR);
    canvas.style.width  = sw + 'px';
    canvas.style.height = sh + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  /* Run resize after fonts load for correct content height measurement */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { resize(); });
  } else {
    resize();
  }
  /* Also re-measure 300ms after DOMContentLoaded in case fonts were cached */
  setTimeout(resize, 300);

  window.addEventListener('resize', () => {
    clearTimeout(resize._t);
    resize._t = setTimeout(resize, 200);
  }, { passive: true });

  let _mobileSkip = 0;
  RAF.add(rafKey, () => {
    /* On truly low-end devices throttle to ~20fps (skip 2 of 3 frames) */
    if (isLowEnd) { _mobileSkip = (_mobileSkip + 1) % 3; if (_mobileSkip !== 0) return; }
    if (!W || !H) return;   /* guard: don't draw before first resize */
    ctx.clearRect(0, 0, W, H);
    for (const f of flowerDefs) {
      f.phase += f.speed;
      drawRotatoryFlower(ctx, f.x * W, f.y * H, f.r * Math.min(W, H), f.petals, f.phase, f.alpha);
    }
  });
}

/* ── Hero flowers ── */
function initHeroFlowers() {
  attachFlowerCanvas('hero', 'hero', [
    { x: 0.08, y: 0.25, r: 0.38, speed: 0.004, phase: 0,              petals: 8,  alpha: 0.20 },
    { x: 0.92, y: 0.25, r: 0.38, speed: 0.003, phase: Math.PI/4,     petals: 8,  alpha: 0.20 },
    { x: 0.08, y: 0.70, r: 0.28, speed: 0.005, phase: Math.PI/3,     petals: 6,  alpha: 0.16 },
    { x: 0.92, y: 0.70, r: 0.28, speed: 0.004, phase: Math.PI/2,     petals: 6,  alpha: 0.16 },
    { x: 0.50, y: 0.92, r: 0.22, speed: 0.006, phase: Math.PI/6,     petals: 6,  alpha: 0.14 },
    { x: 0.25, y: 0.50, r: 0.18, speed: 0.005, phase: Math.PI/5,     petals: 5,  alpha: 0.10 },
    { x: 0.75, y: 0.50, r: 0.18, speed: 0.005, phase: Math.PI,       petals: 5,  alpha: 0.10 },
  ]);
}

/* ── Blessings flowers ── */
function initBlessingsFlowers() {
  attachFlowerCanvas('blessings', 'blessings', [
    { x: 0.05, y: 0.28, r: 0.34, speed: 0.004, phase: 0,          petals: 8, alpha: 0.36 },
    { x: 0.95, y: 0.28, r: 0.34, speed: 0.004, phase: Math.PI,    petals: 8, alpha: 0.36 },
    { x: 0.05, y: 0.72, r: 0.24, speed: 0.005, phase: Math.PI/3,  petals: 6, alpha: 0.28 },
    { x: 0.95, y: 0.72, r: 0.24, speed: 0.005, phase: Math.PI/5,  petals: 6, alpha: 0.28 },
    { x: 0.50, y: 0.10, r: 0.20, speed: 0.004, phase: Math.PI/4,  petals: 6, alpha: 0.20 },
    { x: 0.50, y: 0.90, r: 0.20, speed: 0.004, phase: Math.PI/2,  petals: 6, alpha: 0.20 },
  ]);
}

/* ── Sangeet+Haldi flowers ── */
function initEventsFlowers() {
  attachFlowerCanvas('ev-sangeet-haldi', 'events', [
    { x: 0.03, y: 0.28, r: 0.28, speed: 0.0045, phase: 0,          petals: 8, alpha: 0.18 },
    { x: 0.97, y: 0.28, r: 0.28, speed: 0.0045, phase: Math.PI,    petals: 8, alpha: 0.18 },
    { x: 0.03, y: 0.68, r: 0.20, speed: 0.005,  phase: Math.PI/4,  petals: 6, alpha: 0.14 },
    { x: 0.97, y: 0.68, r: 0.20, speed: 0.005,  phase: Math.PI/6,  petals: 6, alpha: 0.14 },
    { x: 0.50, y: 0.08, r: 0.18, speed: 0.004,  phase: Math.PI/3,  petals: 6, alpha: 0.14 },
    { x: 0.50, y: 0.92, r: 0.18, speed: 0.004,  phase: Math.PI/5,  petals: 6, alpha: 0.12 },
  ]);
}

/* ── Wedding flowers ── */
function initWeddingFlowers() {
  attachFlowerCanvas('ev-wedding', 'wedding', [
    { x: 0.03, y: 0.35, r: 0.30, speed: 0.004, phase: 0,          petals: 8, alpha: 0.20 },
    { x: 0.97, y: 0.35, r: 0.30, speed: 0.004, phase: Math.PI,    petals: 8, alpha: 0.20 },
    { x: 0.03, y: 0.75, r: 0.20, speed: 0.005, phase: Math.PI/3,  petals: 6, alpha: 0.15 },
    { x: 0.97, y: 0.75, r: 0.20, speed: 0.005, phase: Math.PI/5,  petals: 6, alpha: 0.15 },
    { x: 0.50, y: 0.08, r: 0.18, speed: 0.004, phase: Math.PI/4,  petals: 6, alpha: 0.14 },
    { x: 0.50, y: 0.92, r: 0.18, speed: 0.004, phase: Math.PI/2,  petals: 6, alpha: 0.12 },
  ]);
}

/* ── Venue flowers ── */
function initVenueFlowers() {
  attachFlowerCanvas('venue', 'venue', [
    { x: 0.04, y: 0.40, r: 0.26, speed: 0.004, phase: 0,          petals: 8, alpha: 0.18 },
    { x: 0.96, y: 0.40, r: 0.26, speed: 0.004, phase: Math.PI,    petals: 8, alpha: 0.18 },
    { x: 0.04, y: 0.80, r: 0.18, speed: 0.005, phase: Math.PI/4,  petals: 6, alpha: 0.14 },
    { x: 0.96, y: 0.80, r: 0.18, speed: 0.005, phase: Math.PI/3,  petals: 6, alpha: 0.14 },
    { x: 0.50, y: 0.10, r: 0.16, speed: 0.004, phase: Math.PI/6,  petals: 5, alpha: 0.12 },
  ]);
}

/* ── Countdown flowers ── */
function initCountdownFlowers() {
  attachFlowerCanvas('countdown', 'countdown', [
    { x: 0.04, y: 0.38, r: 0.28, speed: 0.0035, phase: 0,         petals: 8, alpha: 0.18 },
    { x: 0.96, y: 0.38, r: 0.28, speed: 0.0035, phase: Math.PI,   petals: 8, alpha: 0.18 },
    { x: 0.04, y: 0.78, r: 0.18, speed: 0.004,  phase: Math.PI/4, petals: 6, alpha: 0.14 },
    { x: 0.96, y: 0.78, r: 0.18, speed: 0.004,  phase: Math.PI/3, petals: 6, alpha: 0.14 },
  ]);
}

/* ── Note flowers ── */
function initNoteFlowers() {
  attachFlowerCanvas('note', 'note', [
    { x: 0.04, y: 0.40, r: 0.24, speed: 0.005, phase: 0,          petals: 6, alpha: 0.14 },
    { x: 0.96, y: 0.40, r: 0.24, speed: 0.005, phase: Math.PI,    petals: 6, alpha: 0.14 },
    { x: 0.05, y: 0.82, r: 0.16, speed: 0.006, phase: Math.PI/4,  petals: 5, alpha: 0.10 },
    { x: 0.95, y: 0.82, r: 0.16, speed: 0.006, phase: Math.PI/6,  petals: 5, alpha: 0.10 },
  ]);
}


/* ══════════════════════════════════════════════════════════
   5. BODY COLOUR SCROLL — stays in red-maroon range
   ══════════════════════════════════════════════════════════ */
function initColourTransitions() {
  const entries = Object.entries(SECTION_COLOURS)
    .map(([id, rgb]) => ({ el: document.getElementById(id), rgb }))
    .filter(e => e.el);
  if (!entries.length) return;

  const bar = document.getElementById('progress-bar');
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

  let tops = [];
  function cacheTops() {
    const sy = window.scrollY;
    tops = entries.map(e => e.el.getBoundingClientRect().top + sy - 60);
  }
  cacheTops();
  window.addEventListener('resize', () => {
    clearTimeout(cacheTops._t); cacheTops._t = setTimeout(cacheTops, 200);
  }, { passive: true });

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
          const t = Math.max(0, Math.min(1, (sy - tops[i]) / (tops[i + 1] - tops[i])));
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
   6. PARALLAX
   ══════════════════════════════════════════════════════════ */
function initParallax() {
  if (isMobile) return;
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
   7. SCROLL REVEAL — entrance animations (up / left / right / scale)
   ══════════════════════════════════════════════════════════ */
function initReveal() {
  const SELECTORS = '.reveal, .reveal-left, .reveal-right, .reveal-scale';

  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const el = e.target;

        /* If inside a container, stagger siblings by index */
        const siblings = el.parentElement
          ? [...el.parentElement.querySelectorAll(SELECTORS)]
          : [];
        const idx = siblings.indexOf(el);
        if (idx > 0) {
          const baseDelay = parseFloat(getComputedStyle(el).transitionDelay) || 0;
          if (baseDelay === 0) {
            el.style.transitionDelay = (idx * 0.09) + 's';
          }
        }

        el.classList.add('visible');
        io.unobserve(el);
      }
    }
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(SELECTORS).forEach(el => io.observe(el));
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
   9. HERO NAME ENTRANCE + GANPATI GLOW
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

  /* ── Ganpati pulsing glow — driven by JS RAF for smooth animation ── */
  const ganImg = document.querySelector('.ganpati-img');
  if (ganImg) {
    ganImg.style.willChange = 'filter';
    ganImg.style.animation  = 'none'; /* override CSS anim; we drive it from RAF */
    let _gt = 0;
    RAF.add('ganpati-glow', () => {
      _gt += 0.025;
      const pulse = (Math.sin(_gt) + 1) / 2;   /* 0→1 smooth */
      const blur1  = (8  + pulse * 18).toFixed(1);
      const blur2  = (20 + pulse * 40).toFixed(1);
      const bright = (1.06 + pulse * 0.18).toFixed(3);
      ganImg.style.filter =
        `drop-shadow(0 0 ${blur1}px rgba(255,220,60,${(0.7 + pulse*0.3).toFixed(2)}))` +
        ` drop-shadow(0 0 ${blur2}px rgba(255,160,20,${(0.4 + pulse*0.35).toFixed(2)}))` +
        ` brightness(${bright})`;
    });
  }
}


/* ══════════════════════════════════════════════════════════
   10. COUNTDOWN
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
   SCRATCH CARD
   ══════════════════════════════════════════════════════════ */
function initScratchCard() {
  const wrap    = document.querySelector('.scratch-wrap');
  const canvas  = document.getElementById('scratch-canvas');
  const overlay = document.getElementById('scratch-revealed-overlay');
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  canvas.style.willChange = 'contents';
  let W, H, isDrawing = false, revealed = false;
  let lastX = 0, lastY = 0;

  /* Size canvas at device pixel ratio for crisp rendering.
     W/H are always in CSS pixels — ctx.setTransform handles DPR scaling. */
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const content = wrap.querySelector('.scratch-content');
    W = content.offsetWidth;   /* CSS px — used everywhere for drawing */
    H = content.offsetHeight;
    canvas.width  = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (!revealed) drawScratchSurface();
  }

  function drawScratchSurface() {
    /* ── Base: rich warm maroon matching .bless-card tones ── */
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,    '#5C0E0E');
    grad.addColorStop(0.35, '#6E1414');
    grad.addColorStop(0.65, '#7A1818');
    grad.addColorStop(1,    '#5C0E0E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* ── Radial centre glow — warm amber bloom ── */
    const bloom = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.52);
    bloom.addColorStop(0,   'rgba(180,60,20,0.38)');
    bloom.addColorStop(0.45,'rgba(120,25,15,0.18)');
    bloom.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);

    /* ── Fine diagonal gold shimmer — luxury foil ── */
    ctx.save();
    for (let i = -H; i < W + H; i += 18) {
      ctx.globalAlpha = 0.055;
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i + H, H);
      ctx.strokeStyle = '#FFD878';
      ctx.lineWidth = 7;
      ctx.stroke();
    }
    /* Counter-diagonal — tighter, subtler */
    for (let i = -H; i < W + H; i += 36) {
      ctx.globalAlpha = 0.025;
      ctx.beginPath();
      ctx.moveTo(i + H, 0); ctx.lineTo(i, H);
      ctx.strokeStyle = '#C9922A';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    ctx.restore();

    /* ── Top gold ornament line ── */
    ctx.save();
    const ornY = H * 0.22;
    const lg1 = ctx.createLinearGradient(W*0.1, 0, W*0.9, 0);
    lg1.addColorStop(0, 'transparent');
    lg1.addColorStop(0.5, 'rgba(201,146,42,0.65)');
    lg1.addColorStop(1, 'transparent');
    ctx.strokeStyle = lg1; ctx.lineWidth = 0.9; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(W*0.1, ornY); ctx.lineTo(W*0.9, ornY); ctx.stroke();
    /* Bottom ornament line */
    const ornY2 = H * 0.78;
    ctx.beginPath(); ctx.moveTo(W*0.1, ornY2); ctx.lineTo(W*0.9, ornY2); ctx.stroke();
    ctx.restore();

    /* ── "SCRATCH HERE" — large Cinzel, gold glow ── */
    ctx.save();
    const fs1 = Math.max(14, Math.round(W * 0.056));
    ctx.font = `700 ${fs1}px Cinzel, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    /* Glow layer */
    ctx.globalAlpha = 0.45;
    ctx.shadowColor = 'rgba(255,210,60,1)';
    ctx.shadowBlur = 22;
    ctx.fillStyle = '#FFD060';
    ctx.fillText('✦  SCRATCH HERE  ✦', W/2, H/2 - 10);
    /* Solid layer */
    ctx.globalAlpha = 0.85;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#F5C870';
    ctx.fillText('✦  SCRATCH HERE  ✦', W/2, H/2 - 10);
    ctx.restore();

    /* ── "to reveal the auspicious dates" — italic Cormorant ── */
    ctx.save();
    const fs2 = Math.max(11, Math.round(W * 0.036));
    ctx.font = `italic ${fs2}px 'Cormorant Garamond', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#FFE8B0';
    ctx.fillText('to reveal the auspicious dates', W/2, H/2 + 18);
    ctx.restore();

    /* ── Double gold border matching .bless-card ── */
    ctx.save();
    /* Outer dark ring */
    ctx.strokeStyle = 'rgba(40,6,6,0.9)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1.5, 1.5, W-3, H-3);
    /* Gold border */
    ctx.strokeStyle = 'rgba(255,205,80,0.75)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(3.5, 3.5, W-7, H-7);
    /* Inner fine gold inset */
    ctx.strokeStyle = 'rgba(201,146,42,0.35)';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(7, 7, W-14, H-14);
    ctx.restore();
  }

  /* Run resize after fonts load for correct content height measurement */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { resize(); });
  } else {
    resize();
  }
  /* Also re-measure 300ms after DOMContentLoaded in case fonts were cached */
  setTimeout(resize, 300);

  window.addEventListener('resize', () => {
    clearTimeout(resize._t);
    resize._t = setTimeout(resize, 200);
  }, { passive: true });

  /* ── Scratch drawing — crisp hard-edge eraser ── */
  const RADIUS = isMobile ? 30 : 22;

  function scratchAt(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';   /* must be set; alpha=1 for clean punch-through */
    ctx.beginPath();
    ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  function scratchStroke(x, y) {
    /* Draw filled circles along the line from last point to current —
       no gaps between fast finger movements */
    const dx = x - lastX, dy = y - lastY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const steps = Math.max(1, Math.ceil(dist / (RADIUS * 0.4)));
    for (let i = 0; i <= steps; i++) {
      scratchAt(lastX + dx * (i/steps), lastY + dy * (i/steps));
    }
    lastX = x; lastY = y;
    checkReveal();
  }

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    /* ctx transform is already in CSS-px space (DPR handled by setTransform) */
    if (e.touches) {
      return {
        x: e.touches[0].clientX - r.left,
        y: e.touches[0].clientY - r.top
      };
    }
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener('mousedown', e => {
    isDrawing = true;
    const p = getPos(e); lastX = p.x; lastY = p.y;
    scratchAt(p.x, p.y); checkReveal();
  });
  canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const p = getPos(e); scratchStroke(p.x, p.y);
  });
  canvas.addEventListener('mouseup',    () => isDrawing = false);
  canvas.addEventListener('mouseleave', () => isDrawing = false);
  canvas.addEventListener('touchstart', e => {
    e.preventDefault(); isDrawing = true;
    const p = getPos(e); lastX = p.x; lastY = p.y;
    scratchAt(p.x, p.y); checkReveal();
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault(); if (!isDrawing) return;
    const p = getPos(e); scratchStroke(p.x, p.y);
  }, { passive: false });
  canvas.addEventListener('touchend', () => isDrawing = false);

  /* ── Reveal threshold check — throttled to avoid getImageData lag ── */
  let _lastCheck = 0;
  function checkReveal() {
    if (revealed) return;
    const now = Date.now();
    if (now - _lastCheck < 400) return;   /* max 2.5 checks/sec */
    _lastCheck = now;
    /* Sample a 120×120 region in the centre — faster than reading the full canvas */
    const sampleW = Math.min(120, W);
    const sampleH = Math.min(120, H);
    const sx = Math.floor((W - sampleW) / 2);
    const sy = Math.floor((H - sampleH) / 2);
    const data = ctx.getImageData(sx, sy, sampleW, sampleH).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 128) transparent++;
    const pct = transparent / (sampleW * sampleH);
    if (pct > 0.45) fullyReveal();
  }

  function fullyReveal() {
    if (revealed) return;
    revealed = true;

    /* Smooth fade out the canvas */
    canvas.style.transition = 'opacity .7s cubic-bezier(.22,1,.36,1)';
    canvas.style.opacity = '0';
    setTimeout(() => { canvas.style.display = 'none'; }, 700);

    /* Fire gold confetti */
    setTimeout(() => spawnScratchConfetti(wrap), 200);
  }

  /* ── Gold confetti burst ── */
  function spawnScratchConfetti(anchor) {
    const burst = document.createElement('canvas');
    burst.style.cssText = `
      position:fixed; pointer-events:none; z-index:9998;
      inset:0; width:100vw; height:100vh;
    `;
    document.body.appendChild(burst);
    const bc  = burst.getContext('2d');
    const BW  = burst.width  = window.innerWidth;
    const BH  = burst.height = window.innerHeight;

    const rect   = anchor.getBoundingClientRect();
    const originX = rect.left + rect.width  / 2;
    const originY = rect.top  + rect.height / 2;

    const COLORS = [
      [255,210,50], [255,180,40], [240,150,30],
      [255,240,130],[200,120,20], [255,220,90],
    ];
    const pieces = Array.from({ length: 55 }, () => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5;
      return {
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - .5) * .18,
        w: 5 + Math.random() * 6,
        h: 3 + Math.random() * 4,
        alpha: 1,
        r: c[0], g: c[1], b: c[2],
      };
    });

    let frame = 0;
    function tick() {
      bc.clearRect(0, 0, BW, BH);
      let alive = false;
      for (const p of pieces) {
        p.vy += 0.18;          /* gravity */
        p.vx *= 0.985;         /* air resistance */
        p.x  += p.vx;
        p.y  += p.vy;
        p.rot += p.rotV;
        p.alpha = Math.max(0, p.alpha - 0.012);
        if (p.alpha <= 0) continue;
        alive = true;
        bc.save();
        bc.globalAlpha = p.alpha;
        bc.translate(p.x, p.y);
        bc.rotate(p.rot);
        /* Alternate between rect and diamond */
        if (frame % 2 === 0) {
          bc.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
          bc.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        } else {
          bc.beginPath();
          bc.moveTo(0, -p.h); bc.lineTo(p.w/2, 0);
          bc.lineTo(0, p.h);  bc.lineTo(-p.w/2, 0);
          bc.closePath();
          bc.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
          bc.fill();
        }
        bc.restore();
      }
      if (alive) requestAnimationFrame(tick);
      else burst.remove();
      frame++;
    }
    requestAnimationFrame(tick);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  /* initGlowConfetti removed — see note above */
  initHeroFlowers();
  initBlessingsFlowers();
  initEventsFlowers();
  initWeddingFlowers();
  initVenueFlowers();
  initCountdownFlowers();
  initNoteFlowers();
  initColourTransitions();
  initParallax();
  initReveal();
  initScratchCard();
  initFrameCorners();
  initHeroEntrance();
  initCountdown();
});
