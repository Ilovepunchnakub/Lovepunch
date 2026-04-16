import { qs } from './utils.js';

export function initEntryGate({ onUnlocked }) {
  const gate = qs('entryGate');
  const button = qs('entryHeartBtn');
  const percent = qs('entryPercent');
  const hint = qs('entryHint');

  let raf = null;
  let holding = false;
  let startAt = 0;
  const holdMs = 10000;

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
    gate.classList.add('done');
    button.classList.add('charged');
    percent.textContent = '100%';
    hint.textContent = 'ยืนยันเรียบร้อย กำลังเข้าสู่หน้าแรก...';
    setTimeout(() => {
      gate.classList.remove('show');
      onUnlocked();
    }, 620);
  }

  function tick(ts) {
    if (!holding) return;
    const elapsed = ts - startAt;
    const progress = Math.max(0, Math.min(1, elapsed / holdMs));
    const pct = Math.round(progress * 100);
    percent.textContent = `${pct}%`;
    button.style.setProperty('--fill', `${(progress * 100).toFixed(2)}%`);
    button.style.setProperty('--charge', `${progress}`);

    if (pct % 8 === 0) spawnSparkle();

    if (pct >= 100) {
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
    percent.textContent = '0%';
    hint.textContent = 'แตะค้างให้เต็มต่อเนื่องเพื่อปลดล็อก';
  }

  button.addEventListener('pointerdown', startHold);
  button.addEventListener('contextmenu', block);
  button.addEventListener('dragstart', block);
  window.addEventListener('pointerup', stopHold);
  window.addEventListener('pointercancel', stopHold);
  button.addEventListener('pointerleave', stopHold);

  return {
    isLocked: () => gate.classList.contains('show')
  };
}
