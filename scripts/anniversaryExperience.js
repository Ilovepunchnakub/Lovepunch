// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/anniversaryExperience.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { wait } from './utils.js';

export function createAnniversaryExperience({ blessings }) {
  const overlay = document.getElementById('annivOverlay');
  const countBox = document.getElementById('annivCountBox');
  const counter = document.getElementById('annivCountdown');
  const popup = document.getElementById('annivPopup');
  const text = document.getElementById('annivTypedText');
  const exit = document.getElementById('annivExitHint');

  let active = false;
  let completed = false;
  let unlockedClose = false;
  let popupKeydownHandler = null;
  let popupInvoker = null;

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('hidden') && el.offsetParent !== null);
  }

  function trapDialogFocus(event, dialog) {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(dialog);
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function bindPopupKeyboard() {
    if (popupKeydownHandler) {
      document.removeEventListener('keydown', popupKeydownHandler);
      popupKeydownHandler = null;
    }
    popupKeydownHandler = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close({ force: true });
        return;
      }
      trapDialogFocus(event, popup);
    };
    document.addEventListener('keydown', popupKeydownHandler);
  }

  function unbindPopupKeyboard() {
    if (!popupKeydownHandler) return;
    document.removeEventListener('keydown', popupKeydownHandler);
    popupKeydownHandler = null;
  }

  function pickBlessing() {
    return blessings[Math.floor(Math.random() * blessings.length)] || 'สุขสันต์วันครบรอบนะคนเก่งของฉัน 💕';
  }

  function setStage(stage) {
    if (!overlay) return;
    overlay.classList.toggle('countdown-mode', stage === 'countdown');
    overlay.classList.toggle('popup-mode', stage === 'popup');
  }

  async function typeText(message) {
    text.textContent = '';
    for (let i = 0; i < message.length; i += 1) {
      text.textContent += message[i];
      await wait(40 + Math.random() * 22);
    }
  }

  function spawnFloatingHearts() {
    if (!popup) return;
    const icons = ['💗', '💖', '✨', '🌸'];
    for (let i = 0; i < 16; i += 1) {
      const token = document.createElement('span');
      token.className = 'anniv-float';
      token.textContent = icons[Math.floor(Math.random() * icons.length)];
      token.style.setProperty('--x', `${Math.round((Math.random() - 0.5) * 280)}px`);
      token.style.setProperty('--delay', `${Math.round(Math.random() * 420)}ms`);
      token.style.setProperty('--dur', `${1900 + Math.round(Math.random() * 1100)}ms`);
      popup.appendChild(token);
      setTimeout(() => token.remove(), 3600);
    }
  }

  async function revealPopup() {
    setStage('popup');
    popup.classList.add('show');
    spawnFloatingHearts();
    popup.focus();
    await typeText(pickBlessing());

    for (let i = 3; i >= 1; i -= 1) {
      exit.textContent = `แตะที่ไหนก็ได้เพื่อปิด (พร้อมใน ${i} วินาที)`;
      await wait(1000);
    }

    unlockedClose = true;
    exit.textContent = 'แตะที่ไหนก็ได้เพื่อกลับสู่หน้าแรก 💫';
  }

  function close({ force = false, restoreFocus = true } = {}) {
    if (!active || (!unlockedClose && !force)) return;
    overlay.classList.remove('show');
    popup.classList.remove('show');
    popup.querySelectorAll('.anniv-float').forEach((item) => item.remove());
    setStage('countdown');
    document.body.classList.remove('anniv-focus');
    unbindPopupKeyboard();
    active = false;
    unlockedClose = false;
    if (restoreFocus && popupInvoker && document.contains(popupInvoker)) popupInvoker.focus();
    popupInvoker = null;
  }

  async function runCountdownAndPopup() {
    popup.classList.remove('show');
    text.textContent = '';
    exit.textContent = 'เตรียมแสดงข้อความ...';

    const activeEl = document.activeElement;
    if (activeEl instanceof HTMLElement) popupInvoker = activeEl;
    document.body.classList.add('anniv-focus');
    overlay.classList.add('show');
    setStage('countdown');
    bindPopupKeyboard();

    for (let sec = 10; sec >= 0; sec -= 1) {
      counter.textContent = sec.toString().padStart(2, '0');
      counter.classList.remove('pulse');
      void counter.offsetWidth;
      counter.classList.add('pulse');
      await wait(1000);
    }

    await revealPopup();
  }

  async function startSequence({ markCompleted }) {
    if (active) return;

    active = true;
    unlockedClose = false;
    if (markCompleted) completed = true;

    await runCountdownAndPopup();
  }

  function tick(leftMs) {
    if (leftMs <= 10_000 && !completed) {
      startSequence({ markCompleted: true });
    } else if (leftMs > 25_000) {
      completed = false;
    }
  }

  function playTestCountdown() {
    startSequence({ markCompleted: false });
  }

  function init() {
    overlay?.addEventListener('click', () => close());
    countBox?.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    popup?.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  return { init, tick, playTestCountdown, close };
}
