import { CFG } from './config.js';
import { qs, wait } from './utils.js';
import { playHyperTimeline } from './hyperTimeline.js';

export function createHyperController() {
  let warpRAF = null;
  let stars = [];
  let active = false;
  let runningSequence = false;
  let speed = 1;
  let targetSpeed = 1;
  let lastTs = 0;
  let loadingTimer = null;
  let phase = 0;

  function resizeCanvas() {
    const cv = qs('hCanvas');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }

  function initStars() {
    const cv = qs('hCanvas');
    const count = Math.floor(Math.min(1500, Math.max(660, cv.width * 0.92)));
    stars = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * cv.width * 4,
      y: (Math.random() - 0.5) * cv.height * 4,
      z: Math.random(),
      glow: 0.55 + Math.random() * 0.75,
      hue: 210 + Math.random() * 150
    }));
  }

  function drawCore(ctx, cx, cy, radius) {
    const pulse = 0.5 + Math.sin(phase * 2.8) * 0.5;

    for (let ring = 0; ring < 3; ring += 1) {
      const ringRadius = radius * (1 + ring * 0.32 + pulse * 0.1);
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(159, 214, 255, ${0.14 - ring * 0.035})`;
      ctx.lineWidth = Math.max(1.5, 3.5 - ring);
      ctx.stroke();
    }

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.8);
    core.addColorStop(0, 'rgba(210, 240, 255, 0.85)');
    core.addColorStop(0.3, 'rgba(122, 203, 255, 0.35)');
    core.addColorStop(0.75, 'rgba(110, 112, 255, 0.12)');
    core.addColorStop(1, 'rgba(20, 30, 80, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFrame(ts) {
    if (!active) return;

    const cv = qs('hCanvas');
    const ctx = cv.getContext('2d');
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    phase += dt;

    speed += (targetSpeed - speed) * 0.06;

    const cx = cv.width / 2;
    const cy = cv.height / 2;
    const blur = Math.max(0.15, 0.46 - Math.min(0.22, speed * 0.05));
    ctx.fillStyle = `rgba(2, 6, 20, ${blur})`;
    ctx.fillRect(0, 0, cv.width, cv.height);

    const burst = Math.min(0.85, speed * 0.05);
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cv.width * 0.55);
    gradient.addColorStop(0, `rgba(124, 208, 255, ${0.16 + burst * 0.65})`);
    gradient.addColorStop(0.38, `rgba(90, 124, 255, ${0.12 + burst * 0.2})`);
    gradient.addColorStop(0.76, 'rgba(88, 46, 152, 0.08)');
    gradient.addColorStop(1, 'rgba(6, 8, 24, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cv.width, cv.height);

    drawCore(ctx, cx, cy, Math.max(36, cv.width * 0.045));

    for (const s of stars) {
      s.z -= speed * 0.14 * dt;
      if (s.z <= 0.001) {
        s.x = (Math.random() - 0.5) * cv.width * 4;
        s.y = (Math.random() - 0.5) * cv.height * 4;
        s.z = 1;
        s.hue = 210 + Math.random() * 150;
      }

      const depth = 1 / s.z;
      const px = cx + s.x * depth;
      const py = cy + s.y * depth;
      const trail = Math.min(102, 4 + depth * (0.02 + speed * 0.014));
      const tx = px - s.x * speed * 0.048 * dt * trail;
      const ty = py - s.y * speed * 0.048 * dt * trail;

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.strokeStyle = `hsla(${s.hue}, 95%, 84%, ${Math.min(0.98, 0.25 + depth * 0.0008)})`;
      ctx.lineWidth = Math.max(0.45, Math.min(4.6, depth * (0.0024 + speed * 0.0009)));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, Math.min(3.7, 0.5 + depth * 0.0016 * s.glow), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 92%, 95%, 0.94)`;
      ctx.fill();
    }

    warpRAF = requestAnimationFrame(drawFrame);
  }

  function setSpeed(multiplier, immediate = false) {
    targetSpeed = Math.max(0.05, multiplier);
    if (immediate) speed = targetSpeed;
  }

  function showMessage(msg) {
    const text = qs('hText');
    text.textContent = msg;
    text.classList.remove('show');
    void text.offsetWidth;
    text.classList.add('show');
  }

  async function showLoading() {
    const loading = qs('hLoading');
    const loadingText = qs('hLoadingText');
    const loadingLog = qs('hLoadingLog');

    loadingText.textContent = 'กำลังเตรียม hyperspace...';
    loading.classList.add('show');
    setSpeed(0.18);

    const started = performance.now();
    loadingTimer = window.setInterval(() => {
      const elapsed = Math.min(8500, performance.now() - started);
      const pct = Math.round((elapsed / 8500) * 100);
      loadingLog.textContent = `โหลดระบบนำทาง ${pct}%`;
    }, 180);

    await wait(8500);
    clearInterval(loadingTimer);
    loadingTimer = null;
    loadingLog.textContent = 'โหลดระบบนำทาง 100%';
    loadingText.textContent = 'พร้อมเข้าสู่เส้นทางของเราแล้ว';
    await wait(1100);
    loading.classList.remove('show');
  }

  async function runSequence() {
    if (runningSequence) return;
    runningSequence = true;

    const start = qs('hStartWrap');
    const box = qs('hMsgs');
    start.classList.remove('show');
    qs('hDone').classList.remove('show');

    await showLoading();
    if (!active) return;

    box.classList.add('show');

    await playHyperTimeline({
      messages: CFG.HYPER_MESSAGES,
      showMessage,
      setSpeed,
      isCancelled: () => !active || !runningSequence,
      onBeforeStart: () => {
        showMessage('เตรียมตัวเข้าสู่ hyperspace ของเรา ✨');
      },
      onDone: () => {
        qs('hDone').classList.add('show');
        start.classList.add('show');
      }
    });

    runningSequence = false;
    setSpeed(1);
  }

  function enterPage() {
    active = true;
    runningSequence = false;
    const box = qs('hMsgs');
    const text = qs('hText');
    const start = qs('hStartWrap');

    box.classList.remove('show');
    text.textContent = 'กดเริ่มเดินทาง แล้วออกท่องไปในจักรวาลของเรา ✨';
    qs('hDone').classList.remove('show');
    start.classList.add('show');

    cancelAnimationFrame(warpRAF);
    lastTs = 0;
    phase = 0;
    speed = 1;
    targetSpeed = 1;
    resizeCanvas();
    initStars();
    drawFrame(performance.now());
  }

  function startExperience() {
    if (!active) return;
    runSequence();
  }

  function stop() {
    active = false;
    runningSequence = false;
    clearInterval(loadingTimer);
    loadingTimer = null;
    cancelAnimationFrame(warpRAF);
  }

  function init() {
    qs('hStart').addEventListener('click', startExperience);
    window.addEventListener('resize', () => {
      if (!active) return;
      resizeCanvas();
      initStars();
    });
    resizeCanvas();
    initStars();
  }

  return { init, stop, startExperience, enterPage };
}
