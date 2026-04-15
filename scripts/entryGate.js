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

  function stopTick() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function finishUnlock() {
    stopTick();
    holding = false;
    gate.classList.add('done');
    percent.textContent = '100%';
    hint.textContent = 'ยืนยันเรียบร้อย กำลังเข้าสู่หน้าแรก...';
    setTimeout(() => {
      gate.classList.remove('show');
      onUnlocked();
    }, 520);
  }

  function tick(ts) {
    if (!holding) return;
    const elapsed = ts - startAt;
    const pct = Math.max(0, Math.min(100, Math.round((elapsed / holdMs) * 100)));
    percent.textContent = `${pct}%`;
    button.style.setProperty('--fill', `${pct}%`);

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
    percent.textContent = '0%';
    hint.textContent = 'แตะค้างให้เต็มต่อเนื่องเพื่อปลดล็อก';
  }

  button.addEventListener('pointerdown', startHold);
  window.addEventListener('pointerup', stopHold);
  window.addEventListener('pointercancel', stopHold);
  button.addEventListener('pointerleave', stopHold);

  return {
    isLocked: () => gate.classList.contains('show')
  };
}
