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

  function resizeCanvas() {
    const cv = qs('hCanvas');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }

  function initStars() {
    const cv = qs('hCanvas');
    const count = Math.floor(Math.min(980, Math.max(460, cv.width * 0.62)));
    stars = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * cv.width * 3.1,
      y: (Math.random() - 0.5) * cv.height * 3.1,
      z: Math.random(),
      glow: 0.55 + Math.random() * 0.7
    }));
  }

  function drawFrame(ts) {
    if (!active) return;

    const cv = qs('hCanvas');
    const ctx = cv.getContext('2d');
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    speed += (targetSpeed - speed) * 0.05;

    const cx = cv.width / 2;
    const cy = cv.height / 2;
    const blur = Math.max(0.25, 0.56 - Math.min(0.25, speed * 0.07));
    ctx.fillStyle = `rgba(5, 8, 23, ${blur})`;
    ctx.fillRect(0, 0, cv.width, cv.height);

    for (const s of stars) {
      s.z -= speed * 0.14 * dt;
      if (s.z <= 0.001) {
        s.x = (Math.random() - 0.5) * cv.width * 3.1;
        s.y = (Math.random() - 0.5) * cv.height * 3.1;
        s.z = 1;
      }

      const depth = 1 / s.z;
      const px = cx + s.x * depth;
      const py = cy + s.y * depth;
      const trail = Math.min(60, 2 + depth * (0.014 + speed * 0.008));
      const tx = px - s.x * speed * 0.05 * dt * trail;
      const ty = py - s.y * speed * 0.05 * dt * trail;

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.strokeStyle = `rgba(255, ${218 + Math.floor(depth * 0.03)}, 244, ${Math.min(0.92, 0.2 + depth * 0.0006)})`;
      ctx.lineWidth = Math.max(0.5, Math.min(3.2, depth * (0.002 + speed * 0.0007)));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, Math.min(3.1, 0.55 + depth * 0.0015 * s.glow), 0, Math.PI * 2);
      ctx.fillStyle = '#ffe6f3';
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
    loading.classList.add('show');
    setSpeed(0.2);
    await wait(8500);
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
