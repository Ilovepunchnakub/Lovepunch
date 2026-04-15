import { CFG } from './config.js';
import { qs, wait } from './utils.js';

export function createHyperController() {
  let warpRAF = null;
  let stars = [];
  let active = false;

  function resizeCanvas() {
    const cv = qs('hCanvas');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }

  function initStars() {
    const cv = qs('hCanvas');
    stars = Array.from({ length: 420 }, () => ({
      x: (Math.random() - 0.5) * cv.width * 2,
      y: (Math.random() - 0.5) * cv.height * 2,
      z: Math.random() * cv.width,
      hue: 300 + Math.random() * 80
    }));
  }

  function draw(speed = 12, dim = 0.25) {
    const cv = qs('hCanvas');
    const ctx = cv.getContext('2d');
    const cx = cv.width / 2;
    const cy = cv.height / 2;

    ctx.fillStyle = `rgba(4, 8, 24, ${dim})`;
    ctx.fillRect(0, 0, cv.width, cv.height);

    stars.forEach((s) => {
      s.z -= speed;
      if (s.z <= 1) s.z = cv.width;
      const sx = (s.x / s.z) * cv.width + cx;
      const sy = (s.y / s.z) * cv.height + cy;
      const px = (s.x / (s.z + speed * 2)) * cv.width + cx;
      const py = (s.y / (s.z + speed * 2)) * cv.height + cy;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = `hsla(${s.hue},100%,78%,0.9)`;
      ctx.lineWidth = Math.max(0.7, (1 - s.z / cv.width) * 3.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe4f1';
      ctx.fill();
    });
  }

  function animate(speed, dim = 0.25) {
    if (!active) return;
    draw(speed, dim);
    warpRAF = requestAnimationFrame(() => animate(speed, dim));
  }

  async function runSequence() {
    if (!active) return;
    const loading = qs('hLoading');
    const start = qs('hStartWrap');
    const box = qs('hMsgs');
    const text = qs('hText');

    start.classList.remove('show');
    loading.classList.add('show');
    await wait(1500);
    loading.classList.remove('show');

    box.classList.add('show');
    text.innerHTML = '';

    animate(18, 0.2);
    for (const msg of CFG.HYPER_MESSAGES) {
      await wait(1400);
      text.textContent = '';
      text.classList.remove('typing');
      void text.offsetWidth;
      text.classList.add('typing');
      text.textContent = msg;
      await wait(1700);
      animate(23, 0.18);
      await wait(500);
      animate(12, 0.28);
    }

    qs('hDone').classList.add('show');
    start.classList.add('show');
  }

  function startExperience() {
    qs('hDone').classList.remove('show');
    active = true;
    cancelAnimationFrame(warpRAF);
    resizeCanvas();
    initStars();
    runSequence();
  }

  function stop() {
    active = false;
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

  return { init, stop, startExperience };
}
