import { qs } from './utils.js';

export function initEntryGate({ onUnlocked }) {
  const gate = qs('entryGate');
  const button = qs('entryHeartBtn');
  const hint = qs('entryHint');
  const fakeLoading = qs('entryFakeLoading');

  let raf = null;
  let holding = false;
  let startAt = 0;
  const holdMs = 4500;
  let latestSparkleStep = -1;

  const block = (e) => e.preventDefault();
  ['contextmenu', 'selectstart', 'dragstart'].forEach((ev) => {
    gate.addEventListener(ev, block);
  });

  function spawnSparkle() {
    const sparkle = document.createElement('span');
    sparkle.className = 'entry-sparkle';
    sparkle.textContent = ['✨', '💖', '💫'][Math.floor(Math.random() * 3)];
    sparkle.style.left = `${12 + Math.random() * 76}%`;
    sparkle.style.top = `${14 + Math.random() * 72}%`;
    button.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 900);
  }

  function stopTick() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function finishUnlock() {
    stopTick();
    holding = false;
    gate.classList.add('loading');
    button.classList.add('charged');
    navigator.vibrate?.(35);
    fakeLoading?.setAttribute('aria-hidden', 'false');
    hint.textContent = 'เติมครบ 100% แล้ว กำลังโหลดระบบ...';
    const fakeLoadingMs = 4000 + Math.floor(Math.random() * 2001);
    setTimeout(() => {
      gate.classList.remove('loading');
      gate.classList.add('done');
      gate.classList.remove('show');
      onUnlocked();
    }, fakeLoadingMs);
  }

  function tick(ts) {
    if (!holding) return;
    const elapsed = ts - startAt;
    const progress = Math.max(0, Math.min(1, elapsed / holdMs));
    button.style.setProperty('--fill', `${(progress * 100).toFixed(2)}%`);
    button.style.setProperty('--charge', `${progress}`);

    const sparkleStep = Math.floor(progress * 12);
    if (sparkleStep !== latestSparkleStep) {
      latestSparkleStep = sparkleStep;
      spawnSparkle();
    }

    if (progress >= 1) {
      finishUnlock();
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  function startHold(e) {
    e.preventDefault();
    if (holding || gate.classList.contains('done')) return;
    holding = true;
    startAt = performance.now();
    latestSparkleStep = -1;
    hint.textContent = 'กำลังยืนยันตัวตน...';
    button.classList.add('holding');
    raf = requestAnimationFrame(tick);
  }

  function stopHold() {
    if (!holding) return;
    holding = false;
    button.classList.remove('holding');
    stopTick();
    button.style.setProperty('--fill', '0%');
    button.style.setProperty('--charge', '0');
    latestSparkleStep = -1;
    hint.textContent = 'แตะค้างให้เต็มต่อเนื่องเพื่อปลดล็อก';
  }

  button.addEventListener('pointerdown', startHold);
  button.addEventListener('touchstart', block, { passive: false });
  button.addEventListener('contextmenu', block);
  button.addEventListener('dragstart', block);
  window.addEventListener('pointerup', stopHold);
  window.addEventListener('pointercancel', stopHold);
  button.addEventListener('pointerleave', stopHold);

  return {
    isLocked: () => gate.classList.contains('show')
  };
}
