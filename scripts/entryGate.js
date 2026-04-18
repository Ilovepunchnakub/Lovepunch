import { qs } from './utils.js';

export function initEntryGate({ onUnlocked, completionLoader }) {
  const gate = qs('entryGate');
  const button = qs('entryHeartBtn');
  const hint = qs('entryHint');

  let raf = null;
  let holding = false;
  let unlocked = false;
  let startAt = 0;
  const holdMs = 4500;
  let latestSparkleStep = -1;
  let activePointerId = null;

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
    if (unlocked) return;
    unlocked = true;
    stopTick();
    holding = false;
    activePointerId = null;
    button.classList.add('charged');
    navigator.vibrate?.(35);
    hint.textContent = 'เติมครบ 100% แล้ว';

    gate.classList.add('done');

    completionLoader?.show();

    const fakeLoadingMs = 4000 + Math.floor(Math.random() * 2001);
    const gateFadeMs = 560;

    setTimeout(() => {
      gate.classList.remove('show');
    }, gateFadeMs);

    setTimeout(() => {
      completionLoader?.hide();
      onUnlocked();
    }, gateFadeMs + fakeLoadingMs);
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
    if (holding || unlocked || gate.classList.contains('done')) return;
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
    activePointerId = null;
    button.classList.remove('holding');
    stopTick();
    button.style.setProperty('--fill', '0%');
    button.style.setProperty('--charge', '0');
    latestSparkleStep = -1;
    hint.textContent = 'แตะค้างให้เต็มต่อเนื่องเพื่อปลดล็อก';
  }

  function handlePointerDown(e) {
    if (!e.isPrimary) return;
    activePointerId = e.pointerId;
    button.setPointerCapture?.(e.pointerId);
    startHold(e);
  }

  function handlePointerStop(e) {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    stopHold();
  }

  button.addEventListener('pointerdown', handlePointerDown);
  button.addEventListener('pointerup', handlePointerStop);
  button.addEventListener('pointercancel', handlePointerStop);
  button.addEventListener('lostpointercapture', handlePointerStop);

  button.addEventListener('touchstart', block, { passive: false });
  button.addEventListener('contextmenu', block);
  button.addEventListener('dragstart', block);

  window.addEventListener('pointerup', handlePointerStop);
  window.addEventListener('pointercancel', handlePointerStop);
  window.addEventListener('blur', stopHold);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHold();
  });

  if (!window.PointerEvent) {
    button.addEventListener('mousedown', startHold);
    window.addEventListener('mouseup', stopHold);
    button.addEventListener('mouseleave', stopHold);
  }

  return {
    isLocked: () => gate.classList.contains('show')
  };
}
