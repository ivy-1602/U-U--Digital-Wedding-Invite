/* ============================================================
   animate.js — Uday & Unnati Wedding Invitation
   Motion & Life Layer — v3 Professional
   ============================================================ */
'use strict';
/* ── CONSTANTS ─────────────────────────────────────────── */
const SECTION_COLOURS = {
  'hero':       [74,  8,   8  ],
  'blessings':  [58,  26,  10 ],
  'ev-ring':    [10,  22,  64 ],
  'ev-haldi':   [64,  40,  0  ],
  'ev-sangeet': [68,  8,   24 ],
  'ev-wedding': [48,  8,   8  ],
  'venue':      [4,   30,  16 ],
  'countdown':  [228, 244, 228],
  'note':       [248, 228, 232],
};

const PETAL_COLOURS = [
  [232, 130, 40 ],   // marigold
  [220, 80,  100],   // rose
  [255, 200, 60 ],   // gold
  [200, 100, 180],   // magenta
  [255, 150, 80 ],   // saffron
  [255, 180, 180],   // blush
  [255, 210, 100],   // amber
];

/* ══════════════════════════════════════════════════════════
   1. GLOWING CONFETTI
   Soft petal-like ellipses falling with radial glow halos
   ══════════════════════════════════════════════════════════ */
function initGlowConfetti() {
  const canvas = document.getElementById('petal-canvas-2d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

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
      glowR:   1.6 + Math.random() * 1.2,
      glowT:   Math.random() * Math.PI * 2,
      glowS:   0.018 + Math.random() * 0.012,
      r: c[0], g: c[1], b: c[2],
    };
  }
  /* ══════════════════════════════════════════════════════════
   SPLASH CONFETTI — same flower confetti on splash screen
   ══════════════════════════════════════════════════════════ */
function initSplashConfetti() {
  const splash = document.getElementById('splash');
  if (!splash) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  splash.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = splash.offsetWidth  || window.innerWidth;
    H = canvas.height = splash.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const SPLASH_COLOURS = [
    [255, 200, 60 ],   // gold
    [232, 130, 40 ],   // marigold
    [220, 80,  100],   // rose
    [255, 150, 80 ],   // saffron
    [200, 100, 180],   // magenta
    [255, 180, 180],   // blush
    [255, 210, 100],   // amber
  ];

  function spawnPetal(randomY = false) {
    const c      = SPLASH_COLOURS[Math.floor(Math.random() * SPLASH_COLOURS.length)];
    const nPetal = [4, 5, 6, 8][Math.floor(Math.random() * 4)];
    const size   = 5 + Math.random() * 9;
    return {
      x:       Math.random() * (W || 400),
      y:       randomY ? Math.random() * (H || 800) : -30,
      size,
      petals:  nPetal,
      rot:     Math.random() * Math.PI * 2,
      spinV:   0.008 + Math.random() * 0.018,
      vx:      (Math.random() - 0.5) * 0.45,
      vy:      0.55 + Math.random() * 0.85,
      wobble:  Math.random() * Math.PI * 2,
      wobbleS: 0.012 + Math.random() * 0.016,
      alpha:   0.55 + Math.random() * 0.35,
      glowT:   Math.random() * Math.PI * 2,
      glowS:   0.018 + Math.random() * 0.012,
      r: c[0], g: c[1], b: c[2],
    };
  }

  const pieces = Array.from({ length: 26 }, () => spawnPetal(true));

  function drawFlowerPetal(r, g, b, size, petals, alpha) {
    const step     = (Math.PI * 2) / petals;
    const petalLen = size;
    const petalW   = size * 0.38;

    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);
      const grd = ctx.createRadialGradient(0, petalLen * 0.35, 0, 0, petalLen * 0.35, petalLen * 0.7);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
      grd.addColorStop(0.6, `rgba(${r},${g},${b},${alpha * 0.5})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.ellipse(0, petalLen * 0.42, petalW * 0.45, petalLen * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }

    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.22);
    cg.addColorStop(0,   `rgba(255,240,180,${alpha * 0.9})`);
    cg.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
  }

  let animId;
  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    for (const p of pieces) {
      p.wobble += p.wobbleS;
      p.glowT  += p.glowS;
      p.rot    += p.spinV;
      p.x += p.vx + Math.sin(p.wobble) * 0.3;
      p.y += p.vy;

      if (p.y > H + 40) Object.assign(p, spawnPetal(false));

      const pulse = p.alpha * (0.7 + 0.3 * Math.sin(p.glowT));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      drawFlowerPetal(p.r, p.g, p.b, p.size, p.petals, pulse);
      ctx.restore();
    }

    animId = requestAnimationFrame(drawFrame);
  }

  drawFrame();

  // Stop animation when splash is removed
  const observer = new MutationObserver(() => {
    if (!document.getElementById('splash')) {
      cancelAnimationFrame(animId);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });
}

  // Only 14 petals — calm and sincere
  const petals = Array.from({ length: 25 }, () => spawnPetal(true));

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    for (const p of petals) {
      p.wobble += p.wobbleS;
      p.glowT  += p.glowS;
      p.x += p.vx + Math.sin(p.wobble) * 0.3;
      p.y += p.vy;
      p.rot += p.rotV;

      if (p.y > H + 30) Object.assign(p, spawnPetal(false));

      const pulse = p.alpha * (0.65 + 0.35 * Math.sin(p.glowT));
      const gr    = p.w * p.glowR;

      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // Soft glow halo
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, gr);
      grd.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},0.5)`);
      grd.addColorStop(0.5, `rgba(${p.r},${p.g},${p.b},0.18)`);
      grd.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(0, 0, gr, gr * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Solid petal core
      ctx.globalAlpha = pulse * 1.3;
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    animId = requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

/* ══════════════════════════════════════════════════════════
   2. HERO SPARKLE STARS
   Twinkling star glints across the hero section only
   ══════════════════════════════════════════════════════════ */
function initHeroSparkles() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;';
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = hero.offsetWidth  || window.innerWidth;
    H = canvas.height = hero.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Three large divine lotus/flower mandalas at different positions
  const flowers = [
    { x: 0.15, y: 0.35, r: 0.38, speed: 0.004, phase: 0,           petals: 8,  alpha: 0.18 },
    { x: 0.85, y: 0.60, r: 0.30, speed: 0.003, phase: Math.PI / 4, petals: 12, alpha: 0.15 },
    { x: 0.50, y: 0.88, r: 0.22, speed: 0.005, phase: Math.PI / 3, petals: 6,  alpha: 0.13 },
  ];

  function drawFlower(cx, cy, radius, petals, rotation, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    const petalLen  = radius;
    const petalW    = radius * 0.38;
    const step      = (Math.PI * 2) / petals;

    // Outer petals
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);

      const grd = ctx.createRadialGradient(0, petalLen * 0.4, 0, 0, petalLen * 0.4, petalLen * 0.7);
      grd.addColorStop(0,   'rgba(255,220,120,0.9)');
      grd.addColorStop(0.5, 'rgba(240,180,60,0.55)');
      grd.addColorStop(1,   'rgba(200,120,20,0)');

      ctx.beginPath();
      ctx.ellipse(0, petalLen * 0.5, petalW * 0.5, petalLen * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }

    // Inner petals (rotated half step)
    ctx.rotate(step / 2);
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);

      const grd2 = ctx.createRadialGradient(0, petalLen * 0.25, 0, 0, petalLen * 0.25, petalLen * 0.45);
      grd2.addColorStop(0,   'rgba(255,240,160,0.75)');
      grd2.addColorStop(1,   'rgba(220,150,40,0)');

      ctx.beginPath();
      ctx.ellipse(0, petalLen * 0.28, petalW * 0.35, petalLen * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd2;
      ctx.fill();
      ctx.restore();
    }

    // Centre glow dot
    const centreGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.18);
    centreGrd.addColorStop(0,   'rgba(255,240,180,0.8)');
    centreGrd.addColorStop(0.5, 'rgba(255,200,60,0.35)');
    centreGrd.addColorStop(1,   'rgba(200,130,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = centreGrd;
    ctx.fill();

    ctx.restore();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    for (const f of flowers) {
      f.phase += f.speed;
      drawFlower(
        f.x * W,
        f.y * H,
        f.r * Math.min(W, H),
        f.petals,
        f.phase,
        f.alpha
      );
    }

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}
/* ══════════════════════════════════════════════════════════
   WEDDING CEREMONY — Divine spinning flowers
   ══════════════════════════════════════════════════════════ */
function initWeddingFlowers() {
  const section = document.getElementById('ev-wedding');
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  section.style.position = 'relative';
  section.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = section.offsetWidth  || window.innerWidth;
    H = canvas.height = section.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const flowers = [
    { x: 0.04, y: 0.42, r: 0.28, speed: 0.004, phase: 0,           petals: 8,  alpha: 0.14 },
    { x: 0.96, y: 0.42, r: 0.28, speed: 0.004, phase: Math.PI,     petals: 8,  alpha: 0.14 },
    { x: 0.06, y: 0.78, r: 0.18, speed: 0.005, phase: Math.PI / 3, petals: 6,  alpha: 0.10 },
    { x: 0.94, y: 0.78, r: 0.18, speed: 0.005, phase: Math.PI / 5, petals: 6,  alpha: 0.10 },
  ];

  function drawFlower(cx, cy, radius, petals, rotation, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    const petalLen = radius;
    const petalW   = radius * 0.38;
    const step     = (Math.PI * 2) / petals;

    // Outer petals — warm gold
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);
      const grd = ctx.createRadialGradient(0, petalLen * 0.4, 0, 0, petalLen * 0.4, petalLen * 0.7);
      grd.addColorStop(0,   'rgba(255,220,80,0.9)');
      grd.addColorStop(0.5, 'rgba(220,160,30,0.55)');
      grd.addColorStop(1,   'rgba(180,100,0,0)');
      ctx.beginPath();
      ctx.ellipse(0, petalLen * 0.5, petalW * 0.5, petalLen * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }

    // Inner petals
    ctx.rotate(step / 2);
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate(i * step);
      const grd2 = ctx.createRadialGradient(0, petalLen * 0.25, 0, 0, petalLen * 0.25, petalLen * 0.45);
      grd2.addColorStop(0,   'rgba(255,240,160,0.75)');
      grd2.addColorStop(1,   'rgba(220,150,40,0)');
      ctx.beginPath();
      ctx.ellipse(0, petalLen * 0.28, petalW * 0.35, petalLen * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd2;
      ctx.fill();
      ctx.restore();
    }

    // Centre glow
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

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    for (const f of flowers) {
      f.phase += f.speed;
      drawFlower(
        f.x * W,
        f.y * H,
        f.r * Math.min(W, H),
        f.petals,
        f.phase,
        f.alpha
      );
    }
    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}
/* ══════════════════════════════════════════════════════════
   NOTE SECTION — Pink lilies swaying in the wind
   ══════════════════════════════════════════════════════════ */
function initNoteLilies() {
  const section = document.getElementById('note');
  if (!section) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  section.style.position = 'relative';
  section.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = section.offsetWidth  || window.innerWidth;
    H = canvas.height = section.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Lily stems along bottom edge
 const lilies = [
    { x: 0.04, speed: 0.008, phase: 0,            height: 0.85, alpha: 0.55, petals: 5 },
    { x: 0.13, speed: 0.006, phase: Math.PI*0.3,  height: 0.95, alpha: 0.45, petals: 6 },
    { x: 0.22, speed: 0.007, phase: Math.PI*0.8,  height: 0.75, alpha: 0.40, petals: 5 },
    { x: 0.78, speed: 0.007, phase: Math.PI*0.7,  height: 0.80, alpha: 0.45, petals: 5 },
    { x: 0.88, speed: 0.009, phase: Math.PI*1.1,  height: 0.90, alpha: 0.50, petals: 6 },
    { x: 0.97, speed: 0.006, phase: Math.PI*0.5,  height: 0.70, alpha: 0.42, petals: 4 },
  ];

  function drawLily(cx, baseY, stemH, swayAngle, alpha, nPetals) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Sway pivot at base
    ctx.translate(cx, baseY);
    ctx.rotate(swayAngle * 0.08);

    const stemLen = stemH;

    // Draw stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      swayAngle * stemLen * 0.15, -stemLen * 0.3,
      swayAngle * stemLen * 0.25, -stemLen * 0.65,
      swayAngle * stemLen * 0.18, -stemLen
    );
    ctx.strokeStyle = 'rgba(160, 200, 120, 0.7)';
    ctx.lineWidth   = 2.8;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Move to tip of stem for flower
    ctx.translate(swayAngle * stemLen * 0.18, -stemLen);

    // Draw petals
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

    // Centre dot
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
    cg.addColorStop(0,   'rgba(255,240,180,0.9)');
    cg.addColorStop(1,   'rgba(255,180,60,0)');
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    ctx.restore();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    for (const l of lilies) {
      l.phase += l.speed;
      const sway = Math.sin(l.phase);
      drawLily(
        l.x * W,
        H,
        l.height * H,
        sway,
        l.alpha,
        l.petals
      );
    }

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

/* ══════════════════════════════════════════════════════════
   3. SMOOTH BODY COLOUR SCROLL TRANSITIONS
   Lerps body background-color between section colours
   ══════════════════════════════════════════════════════════ */
function initColourTransitions() {
  const entries = Object.entries(SECTION_COLOURS)
    .map(([id, rgb]) => ({ el: document.getElementById(id), rgb }))
    .filter(e => e.el);

  if (!entries.length) return;

  const bar = document.getElementById('progress-bar');

  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

  function onScroll() {
    const sy = window.scrollY;
    const dh = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar
    if (bar) bar.style.width = (Math.min(sy / dh, 1) * 100) + '%';

    // Find which two sections we're between
    for (let i = 0; i < entries.length - 1; i++) {
      const aTop = entries[i].el.getBoundingClientRect().top   + sy - 60;
      const bTop = entries[i+1].el.getBoundingClientRect().top + sy - 60;
      if (sy >= aTop && sy < bTop) {
        const t  = Math.max(0, Math.min(1, (sy - aTop) / (bTop - aTop)));
        const [r1,g1,b1] = entries[i].rgb;
        const [r2,g2,b2] = entries[i+1].rgb;
        document.body.style.backgroundColor =
          `rgb(${lerp(r1,r2,t)},${lerp(g1,g2,t)},${lerp(b1,b2,t)})`;
        return;
      }
    }
    const last = entries[sy < 200 ? 0 : entries.length - 1].rgb;
    document.body.style.backgroundColor = `rgb(${last[0]},${last[1]},${last[2]})`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════════════════════════
   4. PARALLAX BACKGROUNDS
   Shifts background-position on sections with data-parallax
   ══════════════════════════════════════════════════════════ */
function initParallax() {
  const sections = [...document.querySelectorAll('[data-parallax]')];
  if (!sections.length) return;

  function onScroll() {
    for (const sec of sections) {
      const rate  = parseFloat(sec.dataset.parallax) || 0.2;
      const rect  = sec.getBoundingClientRect();
      const shift = ((rect.top + rect.height / 2) - window.innerHeight / 2) * rate;
      sec.style.backgroundPositionY = `calc(50% + ${shift.toFixed(1)}px)`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════════════════════════
   5. SCROLL REVEAL
   Elegant staggered reveal for .reveal elements
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
   6. PHOTO FRAME CORNERS
   Injects animated gold corner brackets on .photo-frame els
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
   7. CEREMONY MILESTONE BURSTS
   Colour-matched particle burst when each event scrolls in
   ══════════════════════════════════════════════════════════ */
function initMilestoneBursts() {
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
    const N    = 18;

    for (let i = 0; i < N; i++) {
      const angle  = (i / N) * Math.PI * 2;
      const speed  = 45 + Math.random() * 75;
      const size   = 3.5 + Math.random() * 5;
      const colour = palette[i % palette.length];
      const dur    = 0.55 + Math.random() * 0.5;

      const p = document.createElement('div');
      p.style.cssText = `
        position:fixed; left:${cx}px; top:${cy}px;
        width:${size}px; height:${size}px; border-radius:50%;
        background:${colour}; pointer-events:none; z-index:9999;
        transform:translate(-50%,-50%);
        box-shadow:0 0 ${size * 2}px ${colour};
        transition:all ${dur}s cubic-bezier(.22,1,.36,1);
      `;
      document.body.appendChild(p);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          p.style.left      = `${cx + Math.cos(angle) * speed}px`;
          p.style.top       = `${cy + Math.sin(angle) * speed * 0.55}px`;
          p.style.opacity   = '0';
          p.style.transform = 'translate(-50%,-50%) scale(0)';
          setTimeout(() => p.remove(), (dur + 0.1) * 1000);
        });
      });
    }
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
   8. CARD 3D TILT
   Perspective tilt on ceremony cards — pointer-aware
   ══════════════════════════════════════════════════════════ */
function initCardTilt() {
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
   9. ORNAMENTAL BAND ENTRANCE
   Fades in transition bands as they scroll into view
   ══════════════════════════════════════════════════════════ */
function initBandReveals() {
  const bands = document.querySelectorAll('.orn-band, [class*="band-"]');

  bands.forEach(band => {
    band.style.opacity   = '0';
    band.style.transform = 'scaleX(0.96)';
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
   10. HERO NAME ENTRANCE
   Subtle slide-up on groom and bride names with stagger
   ══════════════════════════════════════════════════════════ */
function initHeroEntrance() {
  const groom = document.querySelector('.groom-name');
  const bride = document.querySelector('.bride-name');
  const shubh = document.querySelector('.hero-shubh');
  const eng   = document.querySelector('.hero-names-en');

  const items = [groom, bride, shubh, eng].filter(Boolean);

  items.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity .9s ${0.4 + i * 0.15}s cubic-bezier(.22,1,.36,1),
                            transform .9s ${0.4 + i * 0.15}s cubic-bezier(.22,1,.36,1)`;
  });

  // Trigger after short delay
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
   11. COUNTDOWN PULSE
   Makes the countdown numbers pulse on each tick
   ══════════════════════════════════════════════════════════ */
function initCountdownPulse() {
  function pulse(id) {
    // disabled — no pop effect
  }

  // Override the existing countdown tick
  const tgt = new Date('2026-06-23T12:30:00+05:30').getTime();
  const pad  = n => String(n).padStart(2, '0');
  let prevS  = -1;

  function tick() {
    const diff = tgt - Date.now();
    if (diff <= 0) return;

    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    const s = Math.floor(diff % 60000 / 1000);

    const dEl = document.getElementById('cd-d');
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');

    if (dEl) dEl.textContent = pad(d);
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);

    if (s !== prevS) {
      pulse('cd-s');
      if (s === 59) pulse('cd-m');
      if (s === 59 && m === 59) pulse('cd-h');
      if (s === 59 && m === 59 && h === 23) pulse('cd-d');
      prevS = s;
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════════════
   BOOT — initialise everything on DOM ready
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSplashConfetti();
  initGlowConfetti();
  initHeroSparkles();
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
  initCountdownPulse();
});
