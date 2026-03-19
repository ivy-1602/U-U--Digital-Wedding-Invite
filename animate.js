/* ============================================================
   animate.js — Wedding Invite Motion Layer  v2
   • Glowing confetti (soft, sincere, not disturbing)
   • Glitter sparkles (replace fairy lights)
   • Parallax section backgrounds
   • Section colour transitions
   • Photo frame sparkle corners
   • Milestone particle burst on ceremony scroll
   • Card 3D tilt
   • Reveal observer
   ============================================================ */
'use strict';

/* ── 1. GLOWING CONFETTI (canvas) ──────────────────────────
   Soft glowing ellipses — gentle, never distracting          */
function initGlowConfetti() {
  const canvas = document.getElementById('petal-canvas-2d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Muted, warm palette — petals not garish dots */
  const COLORS = [
    { r:232, g:130, b:40  },   // marigold
    { r:220, g:80,  b:100 },   // rose
    { r:255, g:200, b:60  },   // gold
    { r:200, g:100, b:180 },   // soft magenta
    { r:255, g:150, b:80  },   // saffron
    { r:160, g:210, b:255 },   // pale sky
  ];

  const pieces = Array.from({ length: 18 }, () => spawn(true)); // fewer = calmer

  function spawn(anywhere) {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:    Math.random() * (W || 400),
      y:    anywhere ? Math.random() * (H || 800) : -20,
      w:    5  + Math.random() * 9,
      h:    8  + Math.random() * 13,
      rot:  Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.035,
      vx:   (Math.random() - 0.5) * 0.5,
      vy:   0.35 + Math.random() * 0.65,
      wobble: Math.random() * Math.PI * 2,
      wobbleS: 0.015 + Math.random() * 0.018,
      alpha: 0.28 + Math.random() * 0.32,   // ← low alpha = soft glow
      r: c.r, g: c.g, b: c.b,
      glowR: 1.8 + Math.random() * 1.4,    // glow pulse radius multiplier
      glowT: Math.random() * Math.PI * 2,
      glowS: 0.02 + Math.random() * 0.015,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    pieces.forEach(p => {
      /* Physics */
      p.wobble += p.wobbleS;
      p.glowT  += p.glowS;
      p.x += p.vx + Math.sin(p.wobble) * 0.35;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.y > H + 30) Object.assign(p, spawn(false));

      /* Pulsing glow alpha */
      const glowA = p.alpha * (0.7 + 0.3 * Math.sin(p.glowT));

      ctx.save();
      ctx.globalAlpha = glowA;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      /* Outer soft glow (radial gradient) */
      const gr = p.w * p.glowR;
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, gr);
      grd.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},0.55)`);
      grd.addColorStop(0.4, `rgba(${p.r},${p.g},${p.b},0.25)`);
      grd.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(0, 0, gr, gr * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      /* Solid core petal */
      ctx.globalAlpha = glowA * 1.4;
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── 2. GLITTER SPARKLES ───────────────────────────────────
   Replace fairy lights — tiny star glints across the page    */
function initGlitter() { return; // disabled — user preference
  // original code below:
  const container = document.getElementById('hero');
  if (!container) return;

  const glitterCanvas = document.createElement('canvas');
  glitterCanvas.id = 'glitter-canvas';
  glitterCanvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;';
  container.appendChild(glitterCanvas);

  const ctx = glitterCanvas.getContext('2d');
  let W, H;

  function resize() {
    W = glitterCanvas.width  = container.offsetWidth  || window.innerWidth;
    H = glitterCanvas.height = container.offsetHeight || window.innerHeight;
  }
  resize();

  const GLITTER_COLORS = [
    [255,220,60], [255,180,60], [255,255,200],
    [255,200,100],[200,240,255],[255,160,200],
  ];

  /* Sparse grid of glitter points */
  const glitters = Array.from({ length: 55 }, () => ({
    x:     Math.random() * (W || 400),
    y:     Math.random() * (H || 800),
    size:  1 + Math.random() * 2.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.018 + Math.random() * 0.025,
    color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
    arms:  Math.random() > 0.6 ? 4 : 6,   // 4-arm or 6-arm star
  }));

  function drawStar(ctx, x, y, r, arms, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
    ctx.lineWidth   = r * 0.5;
    ctx.lineCap     = 'round';
    const step = Math.PI / arms;
    for (let i = 0; i < arms * 2; i++) {
      const len = (i % 2 === 0) ? r : r * 0.2;
      const angle = i * step;
      if (i === 0) ctx.beginPath(), ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    }
    ctx.stroke();

    /* Centre dot */
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    glitters.forEach(g => {
      g.phase += g.speed;
      const alpha = Math.max(0, Math.sin(g.phase)) * 0.85;
      if (alpha > 0.02) {
        /* Glow halo */
        const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.size * 4);
        grd.addColorStop(0,   `rgba(${g.color[0]},${g.color[1]},${g.color[2]},${alpha * 0.4})`);
        grd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.size * 4, 0, Math.PI * 2);
        ctx.fill();

        drawStar(ctx, g.x, g.y, g.size * 2, g.arms, alpha, g.color);
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── 3. PARALLAX ───────────────────────────────────────────*/
function initParallax() {
  const sections = document.querySelectorAll('[data-parallax]');
  function onScroll() {
    const sy = window.scrollY;
    sections.forEach(sec => {
      const rate = parseFloat(sec.dataset.parallax) || 0.2;
      const rect = sec.getBoundingClientRect();
      const shift = (rect.top + rect.height / 2 - window.innerHeight / 2) * rate;
      sec.style.backgroundPositionY = `calc(50% + ${shift.toFixed(1)}px)`;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── 4. SMOOTH COLOUR GRADIENT BETWEEN SECTIONS ────────── */
function initGradientTransitions() {
  const stops = [
    { id:'hero',       color:'#7A1212' },
    { id:'blessings',  color:'#3A1A0A' },
    { id:'ev-ring',    color:'#0A1640' },
    { id:'ev-haldi',   color:'#402800' },
    { id:'ev-sangeet', color:'#440818' },
    { id:'ev-wedding', color:'#300808' },
    { id:'venue',      color:'#1A1400' },
    { id:'countdown',  color:'#1E3020' },
    { id:'note',       color:'#2A1020' },
    { id:'closing',    color:'#3C0808' },
  ];
  const els = stops.map(s => ({ el:document.getElementById(s.id), color:s.color })).filter(s=>s.el);

  function hex2rgb(h) {
    return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  }
  function lerp(a,b,t){ return Math.round(a+(b-a)*t); }
  function lerpColor(c1,c2,t){
    const [r1,g1,b1]=hex2rgb(c1), [r2,g2,b2]=hex2rgb(c2);
    return `rgb(${lerp(r1,r2,t)},${lerp(g1,g2,t)},${lerp(b1,b2,t)})`;
  }

  const bar = document.getElementById('progress-bar');
  function onScroll(){
    const sy = window.scrollY;
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (sy/dh*100)+'%';
    for(let i=0;i<els.length-1;i++){
      const aTop = els[i].el.getBoundingClientRect().top + sy - 80;
      const bTop = els[i+1].el.getBoundingClientRect().top + sy - 80;
      if(sy>=aTop && sy<bTop){
        const t = Math.max(0,Math.min(1,(sy-aTop)/(bTop-aTop)));
        document.body.style.backgroundColor = lerpColor(els[i].color, els[i+1].color, t);
        return;
      }
    }
    document.body.style.backgroundColor = els[sy < 100 ? 0 : els.length-1].color;
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

/* ── 5. PHOTO FRAME CORNER DECORATIONS ─────────────────── */
function initFrameCorners() {
  document.querySelectorAll('.photo-frame').forEach(frame => {
    ['tl','tr','bl','br'].forEach(pos => {
      if (!frame.querySelector(`.fc-${pos}`)) {
        const d = document.createElement('div');
        d.className = `frame-corner fc-${pos}`;
        frame.appendChild(d);
      }
    });
  });
}

/* ── 6. MILESTONE PARTICLE BURST ───────────────────────── */
function initMilestoneBursts() {
  const MAP = {
    'ev-ring':    ['#A0C8FF','#D0E8FF','#FFFFFF','#6090CC'],
    'ev-haldi':   ['#FFE840','#FFB800','#FFF0A0','#FFA020'],
    'ev-sangeet': ['#FF80CC','#FF40A0','#FFD0F0','#CC2080'],
    'ev-wedding': ['#FFD700','#FF6040','#FFE8A0','#CC4020'],
  };
  const triggered = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || triggered.has(e.target.id)) return;
      triggered.add(e.target.id);
      const palette = MAP[e.target.id]; if(!palette) return;
      const rect = e.target.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top  + rect.height*0.25;
      for(let i=0;i<16;i++){
        const p = document.createElement('div');
        const angle = (i/16)*Math.PI*2;
        const speed = 50+Math.random()*70;
        const sz    = 4+Math.random()*5;
        p.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;
          width:${sz}px;height:${sz}px;border-radius:50%;
          background:${palette[i%palette.length]};pointer-events:none;z-index:9999;
          transform:translate(-50%,-50%);box-shadow:0 0 6px ${palette[i%palette.length]};`;
        document.body.appendChild(p);
        requestAnimationFrame(()=>{
          p.style.transition=`all ${0.6+Math.random()*.5}s cubic-bezier(.22,1,.36,1)`;
          p.style.left  = `${cx+Math.cos(angle)*speed}px`;
          p.style.top   = `${cy+Math.sin(angle)*speed*.55}px`;
          p.style.opacity='0'; p.style.transform='translate(-50%,-50%) scale(0)';
          setTimeout(()=>p.remove(),1200);
        });
      }
    });
  }, { threshold:0.3 });
  Object.keys(MAP).forEach(id=>{ const el=document.getElementById(id); if(el) io.observe(el); });
}

/* ── 7. REVEAL OBSERVER ─────────────────────────────────── */
function initReveal() {
  /* Remove any existing observer first */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold:0.08, rootMargin:'0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── 8. CARD 3D TILT ────────────────────────────────────── */
function initCardTilt() {
  document.querySelectorAll('.ev-full-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX-r.left)/r.width -.5)*9;
      const y = ((e.clientY-r.top) /r.height-.5)*-6;
      card.style.transition='transform .1s';
      card.style.transform=`perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', ()=>{
      card.style.transition='transform .6s cubic-bezier(.22,1,.36,1)';
      card.style.transform='';
    });
  });
}

/* ── BOOT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initGlowConfetti();
  initGlitter();
  initParallax();
  initGradientTransitions();
  initFrameCorners();
  initMilestoneBursts();
  initReveal();
  initCardTilt();
});