import { CFG } from './config.js';
import { qs, wait } from './utils.js';

export function createHyperController() {
  let warpRAF = null;
  let stars = [];
  let active = false;
  let runningSequence = false;
  let speed = 0.12;
  let targetSpeed = 0.12;
  let lastTs = 0;

  function resizeCanvas() {
    const cv = qs('hCanvas');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }

  function initStars() {
    const cv = qs('hCanvas');
    const count = Math.floor(Math.min(900, Math.max(420, cv.width * 0.55)));
    stars = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * cv.width * 2.8,
      y: (Math.random() - 0.5) * cv.height * 2.8,
      z: Math.random(),
      glow: 0.5 + Math.random() * 0.7
    }));
  }

  function drawFrame(ts) {
    if (!active) return;

    const cv = qs('hCanvas');
    const ctx = cv.getContext('2d');
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    speed += (targetSpeed - speed) * 0.06;

    const cx = cv.width / 2;
    const cy = cv.height / 2;
    ctx.fillStyle = 'rgba(5, 8, 23, 0.38)';
    ctx.fillRect(0, 0, cv.width, cv.height);

    for (const s of stars) {
      s.z -= speed * dt;
      if (s.z <= 0.001) {
        s.x = (Math.random() - 0.5) * cv.width * 2.8;
        s.y = (Math.random() - 0.5) * cv.height * 2.8;
        s.z = 1;
      }

      const depth = 1 / s.z;
      const px = cx + s.x * depth;
      const py = cy + s.y * depth;
      const trail = Math.min(24, 3 + depth * 0.03);
      const tx = px - (s.x * speed * 0.45 * dt * trail);
      const ty = py - (s.y * speed * 0.45 * dt * trail);

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.strokeStyle = `rgba(255, ${220 + Math.floor(depth * 0.03)}, 244, ${Math.min(0.95, 0.25 + depth * 0.0007)})`;
      ctx.lineWidth = Math.max(0.5, Math.min(2.8, depth * 0.0028));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, Math.min(2.8, 0.55 + depth * 0.0016 * s.glow), 0, Math.PI * 2);
      ctx.fillStyle = '#ffe6f3';
      ctx.fill();
    }

    warpRAF = requestAnimationFrame(drawFrame);
  }

  function showMessage(msg) {
    const text = qs('hText');
    text.textContent = msg;
    text.classList.remove('show');
    void text.offsetWidth;
    text.classList.add('show');
  }

  async function runSequence() {
    if (runningSequence) return;
    runningSequence = true;
    const start = qs('hStartWrap');
    const loading = qs('hLoading');
    const box = qs('hMsgs');

    start.classList.remove('show');
    qs('hDone').classList.remove('show');

    loading.classList.add('show');
    targetSpeed = 0.2;
    await wait(1200);
    loading.classList.remove('show');

    box.classList.add('show');

    for (const msg of CFG.HYPER_MESSAGES) {
      targetSpeed = 0.55;
      await wait(480);
      showMessage(msg);
      await wait(2600);
      targetSpeed = 0.22;
      await wait(700);
    }

    qs('hDone').classList.add('show');
    start.classList.add('show');
    targetSpeed = 0.14;
    runningSequence = false;
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
