// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/entryGate.js =====
// หน้าที่หลัก:
// - ควบคุมหน้าเติมหัวใจเริ่มต้นก่อนเข้าแอปหลัก
// - โฟลว์ใหม่: หน้าเติมหัวใจ -> Loading หลอก -> เข้าหน้าหลัก
// =============================================
import { CFG } from './config.js';
import { qs, randomInt } from './utils.js';

export function initEntryGate({ onUnlocked, completionLoader }) {
  const gate = qs('entryGate');
  const button = qs('entryHeartBtn');
  const hint = qs('entryHint');

  const entryGateText = CFG.UI_TEXT?.ENTRY_GATE ?? {};

  const getText = (key, fallback) => {
    const value = entryGateText[key];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };

  function applyGateStaticText() {
    const tagEl = gate.querySelector('.entry-gate-tag');
    const titleEl = gate.querySelector('.entry-gate-card h1');
    const subEl = gate.querySelector('.entry-gate-sub');

    if (tagEl) tagEl.textContent = getText('tag', tagEl.textContent || 'Heart Unlock');
    if (titleEl) titleEl.textContent = getText('title', titleEl.textContent || 'My heart is yours');
    if (subEl) subEl.textContent = getText('subtitle', subEl.textContent || 'แตะหัวใจเพื่อเริ่มเลยคั้บ');

    button.setAttribute('aria-label', getText('buttonAriaLabel', 'Tap heart to start'));
    hint.textContent = getText('idleHint', 'แตะหัวใจหนึ่งครั้ง แล้วไปหน้าหลักกันคั้บ 💖');
  }

  applyGateStaticText();

  const params = new URLSearchParams(window.location.search);
  const shouldBypassGate = params.get('skipEntry') === '1';

  if (params.get('forceEntry') === '1') {
    const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
    window.history.replaceState({}, '', cleanUrl);
  }

  if (shouldBypassGate) {
    const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
    window.history.replaceState({}, '', cleanUrl);
    gate.classList.remove('show');
    onUnlocked?.();
    return { isLocked: () => false };
  }

  let unlocked = false;

  const block = (e) => e.preventDefault();
  ['contextmenu', 'selectstart', 'dragstart'].forEach((ev) => gate.addEventListener(ev, block));

  function spawnTapHearts() {
    const symbols = ['💖', '💕', '✨'];
    for (let i = 0; i < 6; i += 1) {
      const sparkle = document.createElement('span');
      sparkle.className = 'entry-sparkle';
      sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      sparkle.style.left = `${10 + Math.random() * 80}%`;
      sparkle.style.top = `${15 + Math.random() * 70}%`;
      button.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 900);
    }
  }

  function unlockFlow() {
    if (unlocked) return;
    unlocked = true;

    hint.textContent = getText('loadingHint', 'กำลังพาเข้าสู่หน้าหลักนะคั้บ...');
    button.classList.add('charged');
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');

    spawnTapHearts();
    navigator.vibrate?.(35);

    completionLoader?.show();

    const fakeLoadingMs = randomInt(2800, 5200);
    const gateFadeMs = 560;

    setTimeout(() => gate.classList.remove('show'), gateFadeMs);
    setTimeout(() => {
      completionLoader?.hide();
      onUnlocked?.();
    }, gateFadeMs + fakeLoadingMs);
  }

  button.addEventListener('click', (e) => {
    e.preventDefault();
    unlockFlow();
  });

  button.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    unlockFlow();
  });

  return {
    isLocked: () => gate.classList.contains('show')
  };
}
