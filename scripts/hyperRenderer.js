const STAR_DENSITY = 0.82;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - (2 ** (-10 * t));
}

export function createHyperRenderer({ canvas }) {
  if (!canvas) throw new Error('hyperRenderer requires a canvas');

  let raf = null;
  let stars = [];
  let active = false;
  let phase = 0;
  let lastTs = 0;
  let speed = 1;
  let targetSpeed = 1;
  let glowDrift = Math.random() * 100;

  const setSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const resetStars = () => {
    const count = Math.floor(Math.min(1700, Math.max(860, canvas.width * STAR_DENSITY)));
    stars = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * canvas.width * 3.8,
      y: (Math.random() - 0.5) * canvas.height * 3.8,
      z: Math.random(),
      hue: 198 + Math.random() * 70,
      glow: 0.55 + Math.random() * 0.9,
      twinkleSeed: Math.random() * Math.PI * 2
    }));
  };

  const recycleStar = (star) => {
    star.x = (Math.random() - 0.5) * canvas.width * 3.8;
    star.y = (Math.random() - 0.5) * canvas.height * 3.8;
    star.z = 1;
    star.hue = 198 + Math.random() * 70;
    star.twinkleSeed = Math.random() * Math.PI * 2;
  };

  const drawNebula = (ctx, cx, cy) => {
    const glow = 0.26 + Math.sin(phase * 0.7) * 0.05;
    const radius = Math.max(canvas.width, canvas.height) * 0.74;
    const nebula = ctx.createRadialGradient(cx, cy, canvas.width * 0.04, cx, cy, radius);
    nebula.addColorStop(0, `rgba(102, 194, 255, ${0.03 + glow * 0.28})`);
    nebula.addColorStop(0.36, `rgba(101, 132, 255, ${0.06 + glow * 0.2})`);
    nebula.addColorStop(0.72, 'rgba(98, 66, 168, 0.12)');
    nebula.addColorStop(1, 'rgba(8, 10, 26, 0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fog = ctx.createLinearGradient(0, 0, 0, canvas.height);
    fog.addColorStop(0, 'rgba(13, 16, 38, 0.22)');
    fog.addColorStop(0.55, 'rgba(5, 8, 24, 0.08)');
    fog.addColorStop(1, 'rgba(1, 2, 10, 0.4)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawVortexHalo = (ctx, cx, cy) => {
    const pulse = 0.45 + Math.sin(phase * 1.7) * 0.3;
    const haloRadius = Math.min(canvas.width, canvas.height) * (0.12 + pulse * 0.012);

    for (let ring = 0; ring < 6; ring += 1) {
      const ringT = ring / 5;
      const rad = haloRadius * (0.7 + ringT * 2.8);
      const alpha = (0.11 - ringT * 0.015) * (0.6 + speed * 0.03);
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(152, 224, 255, ${Math.max(0.018, alpha)})`;
      ctx.lineWidth = Math.max(0.8, 2.6 - ringT * 2.1);
      ctx.stroke();
    }

    const centerFade = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloRadius * 1.9);
    centerFade.addColorStop(0, 'rgba(200, 233, 255, 0.45)');
    centerFade.addColorStop(0.2, 'rgba(160, 204, 255, 0.18)');
    centerFade.addColorStop(0.54, 'rgba(110, 140, 255, 0.07)');
    centerFade.addColorStop(1, 'rgba(16, 20, 55, 0)');
    ctx.fillStyle = centerFade;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius * 1.9, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawStar = (ctx, star, cx, cy, dt) => {
    star.z -= speed * 0.13 * dt;
    if (star.z <= 0.001) recycleStar(star);

    const depth = 1 / star.z;
    const px = cx + star.x * depth;
    const py = cy + star.y * depth;

    const normX = Math.abs((px - cx) / (canvas.width / 2));
    const normY = Math.abs((py - cy) / (canvas.height / 2));
    const edgeBoost = Math.min(1.45, 0.55 + (normX + normY) * 0.55);
    const streakLen = Math.min(170, 4 + depth * (0.02 + speed * 0.022) * edgeBoost);

    const drift = 0.04 * speed * dt * streakLen;
    const tx = px - star.x * drift;
    const ty = py - star.y * drift;

    const twinkle = 0.65 + Math.sin(phase * 1.5 + star.twinkleSeed + glowDrift) * 0.35;
    const alpha = Math.min(0.99, 0.23 + depth * 0.0011 * twinkle);
    const lineWidth = Math.max(0.45, Math.min(4.9, depth * (0.002 + speed * 0.00105)));

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(px, py);
    ctx.strokeStyle = `hsla(${star.hue}, 95%, ${82 + twinkle * 10}%, ${alpha})`;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    const core = 0.45 + depth * 0.0016 * star.glow;
    ctx.beginPath();
    ctx.arc(px, py, Math.min(3.8, core), 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${star.hue + 4}, 92%, 96%, ${Math.min(0.95, 0.58 + twinkle * 0.3)})`;
    ctx.fill();
  };

  const drawFrame = (ts) => {
    if (!active) return;

    const ctx = canvas.getContext('2d');
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    phase += dt;
    glowDrift += dt * 0.8;

    const response = easeOutExpo(Math.min(1, dt * 7));
    speed = lerp(speed, targetSpeed, response * 0.42);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const bgAlpha = Math.max(0.12, 0.38 - Math.min(0.2, speed * 0.036));
    ctx.fillStyle = `rgba(2, 6, 18, ${bgAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawNebula(ctx, cx, cy);
    drawVortexHalo(ctx, cx, cy);

    for (const star of stars) {
      drawStar(ctx, star, cx, cy, dt);
    }

    raf = requestAnimationFrame(drawFrame);
  };

  const setSpeed = (multiplier, immediate = false) => {
    targetSpeed = Math.max(0.05, multiplier);
    if (immediate) speed = targetSpeed;
  };

  const start = () => {
    active = true;
    cancelAnimationFrame(raf);
    lastTs = 0;
    phase = 0;
    speed = 1;
    targetSpeed = 1;
    setSize();
    resetStars();
    drawFrame(performance.now());
  };

  const stop = () => {
    active = false;
    cancelAnimationFrame(raf);
  };

  return {
    start,
    stop,
    setSpeed,
    resize: () => {
      if (!active) return;
      setSize();
      resetStars();
    },
    prepare: () => {
      setSize();
      resetStars();
    }
  };
}
