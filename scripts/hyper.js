import { CFG } from './config.js';
import { qs, wait } from './utils.js';
import { playHyperTimeline } from './hyperTimeline.js';
import { createHyperRenderer } from './hyperRenderer.js';

export function createHyperController() {
  let active = false;
  let runningSequence = false;
  let loadingTimer = null;

  const renderer = createHyperRenderer({ canvas: qs('hCanvas') });

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
    renderer.setSpeed(0.16, true);

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
      setSpeed: renderer.setSpeed,
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
    renderer.setSpeed(1);
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

    renderer.start();
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
    renderer.stop();
  }

  function init() {
    qs('hStart').addEventListener('click', startExperience);
    window.addEventListener('resize', renderer.resize);
    renderer.prepare();
  }

  return { init, stop, startExperience, enterPage };
}
