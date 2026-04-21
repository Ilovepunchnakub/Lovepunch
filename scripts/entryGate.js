// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/entryGate.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { CFG } from './config.js';
import { qs, randomInt } from './utils.js';

export function initEntryGate({ onUnlocked, completionLoader }) {
  const gate = qs('entryGate');
  const button = qs('entryHeartBtn');
  const hint = qs('entryHint');

  if (!gate || !button || !hint) {
    onUnlocked?.();
    return { isLocked: () => false };
  }

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
    if (subEl) subEl.textContent = getText('subtitle', subEl.textContent || 'แตะหัวใจเพื่อไปหน้าหลัก');

    button.setAttribute('aria-label', getText('buttonAriaLabel', 'Tap heart to continue'));
    hint.textContent = getText('idleHint', 'แตะหัวใจหนึ่งครั้ง แล้วรอ Loading ได้เลยคั้บ...');
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

  const block = (e) => e.preventDefault();
  ['contextmenu', 'selectstart', 'dragstart'].forEach((ev) => gate.addEventListener(ev, block));

  let unlocked = false;

  function finishUnlock() {
    if (unlocked) return;
    unlocked = true;

    button.classList.add('charged');
    navigator.vibrate?.(35);
    hint.textContent = getText('loadingHint', 'กำลังพาเข้าสู่หน้าหลัก...');

    gate.classList.add('done');
    completionLoader?.show();

    const fakeLoadingMs = randomInt(2600, 4200);
    const gateFadeMs = 560;

    setTimeout(() => gate.classList.remove('show'), gateFadeMs);
    setTimeout(() => {
      completionLoader?.hide();
      onUnlocked?.();
    }, gateFadeMs + fakeLoadingMs);
  }

  button.addEventListener('click', finishUnlock);
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      finishUnlock();
    }
  });

  return {
    isLocked: () => gate.classList.contains('show')
  };
}
