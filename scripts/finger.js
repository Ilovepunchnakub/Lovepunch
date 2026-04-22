// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/finger.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { qs, wait } from './utils.js';
import { runFingerScan } from './fingerFlow.js';
import { loadingMarkup, completeMarkup } from './fingerPopupTemplates.js';
import { createRadarFx } from './fingerRadarFx.js';

export function createFingerController() {
  let state = 'idle';
  let closeEnabled = false;
  let radarFx = null;
  let holdTimer = null;
  let holdRaf = null;
  let holdStart = 0;
  const holdMs = 2200;
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
    const dialog = qs('fpPopupCard');
    if (popupKeydownHandler) {
      document.removeEventListener('keydown', popupKeydownHandler);
      popupKeydownHandler = null;
    }
    popupKeydownHandler = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismissPopup();
        return;
      }
      trapDialogFocus(event, dialog);
    };
    document.addEventListener('keydown', popupKeydownHandler);
  }

  function unbindPopupKeyboard() {
    if (!popupKeydownHandler) return;
    document.removeEventListener('keydown', popupKeydownHandler);
    popupKeydownHandler = null;
  }

  function dismissPopup({ restoreFocus = true, force = false } = {}) {
    qs('fpPopup').classList.remove('show');
    qs('fpPopup').setAttribute('aria-hidden', 'true');
    unbindPopupKeyboard();
    radarFx?.stop();
    if (restoreFocus && popupInvoker && document.contains(popupInvoker)) popupInvoker.focus();
    popupInvoker = null;
    if (state === 'done' || force) {
      state = 'idle';
      closeEnabled = false;
      qs('fpPopup').classList.remove('can-close');
      qs('fpZone').classList.remove('scanning');
      qs('fpMsg').textContent = '';
      qs('fpHint').textContent = 'แตะค้างเพื่อสแกนลายนิ้วมือ 👆';
      clearHoldVisual();
    }
  }

  function renderLoadingPopup() {
    closeEnabled = false;
    qs('fpPopup').classList.remove('can-close');
    qs('fpPopupTitle').textContent = 'กำลังโหลดข้อมูลความลับ';
    qs('fpPopupBody').innerHTML = loadingMarkup();
    qs('fpPopupCard').classList.remove('scan-stage-transition');
    radarFx = createRadarFx(qs('scanRadarCanvas'));
    radarFx.start();
  }

  function renderDonePopup() {
    closeEnabled = false;
    qs('fpPopup').classList.remove('can-close');
    qs('fpPopupTitle').textContent = 'ตรวจสอบเสร็จสิ้น 💖';
    qs('fpPopupBody').innerHTML = completeMarkup();
    const card = qs('fpPopupCard');
    card.classList.remove('scan-stage-transition');
    void card.offsetWidth;
    card.classList.add('scan-stage-transition');
    radarFx?.stop();
  }

  async function startDismissCountdown() {
    const countdown = qs('fpCountdown');
    for (let remain = 3; remain >= 1; remain -= 1) {
      if (!countdown) return;
      countdown.textContent = `แตะจอเพื่อปิดได้ใน ${remain} วิ...`;
      await wait(1000);
    }

    closeEnabled = true;
    qs('fpPopup').classList.add('can-close');
    if (countdown) countdown.textContent = 'แตะตรงไหนก็ได้เพื่อปิดหน้าต่างนี้';
  }

  function updateHoldVisual(progress) {
    const zone = qs('fpZone');
    zone.style.setProperty('--hold-progress', `${Math.round(progress * 100)}%`);
  }

  function clearHoldVisual() {
    const zone = qs('fpZone');
    zone.style.setProperty('--hold-progress', '0%');
  }

  function spawnHoldBurst() {
    const zone = qs('fpZone');
    const burst = document.createElement('span');
    burst.className = 'click-burst';
    const rect = zone.getBoundingClientRect();
    burst.style.left = `${rect.left + rect.width / 2}px`;
    burst.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 520);
  }

  function cancelHold() {
    if (holdTimer) clearTimeout(holdTimer);
    if (holdRaf) cancelAnimationFrame(holdRaf);
    holdTimer = null;
    holdRaf = null;
    holdStart = 0;
    qs('fpZone').classList.remove('holding');
    clearHoldVisual();
    if (state === 'idle') qs('fpHint').textContent = 'แตะค้างเพื่อสแกนลายนิ้วมือ 👆';
  }

  function tickHold(ts) {
    if (!holdStart) holdStart = ts;
    const progress = Math.min(1, (ts - holdStart) / holdMs);
    updateHoldVisual(progress);
    if (progress >= 1) return;
    holdRaf = requestAnimationFrame(tickHold);
  }

  function startHold(event) {
    event.preventDefault();
    if (state !== 'idle' || holdTimer) return;
    holdStart = 0;
    qs('fpZone').classList.add('holding');
    qs('fpHint').textContent = 'กดค้างไว้... ระบบกำลังตรวจจับลายนิ้วมือ';
    holdRaf = requestAnimationFrame(tickHold);
    holdTimer = setTimeout(() => {
      holdTimer = null;
      if (holdRaf) cancelAnimationFrame(holdRaf);
      holdRaf = null;
      updateHoldVisual(1);
      navigator.vibrate?.(30);
      spawnHoldBurst();
      doScan();
    }, holdMs);
  }

  function reset() {
    cancelHold();
    state = 'idle';
    closeEnabled = false;
    qs('fpHint').textContent = 'แตะค้างเพื่อสแกนลายนิ้วมือ 👆';
    qs('fpMsg').textContent = '';
    qs('fpZone').classList.remove('scanning', 'holding');
    clearHoldVisual();
    qs('fpPopup').classList.remove('show', 'can-close');
    qs('fpPopup').setAttribute('aria-hidden', 'true');
    unbindPopupKeyboard();
    popupInvoker = null;
    radarFx?.stop();
  }

  async function doScan() {
    if (state !== 'idle') return;

    state = 'scanning';
    qs('fpHint').textContent = 'กำลังอ่านลายนิ้วมือ...';
    qs('fpZone').classList.remove('holding');
    qs('fpZone').classList.add('scanning');

    const popup = qs('fpPopup');
    const activeEl = document.activeElement;
    if (activeEl instanceof HTMLElement) popupInvoker = activeEl;
    popup.classList.add('show');
    popup.setAttribute('aria-hidden', 'false');
    bindPopupKeyboard();
    renderLoadingPopup();
    qs('fpPopupTitle').focus();

    const meter = qs('scanMeterBar');
    const percent = qs('scanPercent');
    const log = qs('scanLog');

    await runFingerScan({
      onStep: ({ text, pct }) => {
        const item = document.createElement('li');
        item.textContent = `${pct}% • ${text}`;
        log.appendChild(item);
        meter.style.width = `${pct}%`;
        percent.textContent = `${pct}%`;
        radarFx?.pulseProgress(pct);
      }
    });

    renderDonePopup();
    qs('fpZone').classList.remove('scanning');
    qs('fpHint').textContent = 'ตรวจสอบเสร็จสิ้นแล้ว';
    qs('fpMsg').textContent = 'สำเร็จ! ระบบยืนยันตัวตนด้วยหัวใจเรียบร้อย';
    state = 'done';
    startDismissCountdown();
  }

  function init() {
    const zone = qs('fpZone');
    zone.addEventListener('pointerdown', startHold);
    zone.addEventListener('pointerup', cancelHold);
    zone.addEventListener('pointerleave', cancelHold);
    zone.addEventListener('pointercancel', cancelHold);
    zone.addEventListener('lostpointercapture', cancelHold);
    zone.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    zone.addEventListener('contextmenu', (e) => e.preventDefault());
    zone.addEventListener('dragstart', (e) => e.preventDefault());
    window.addEventListener('pointerup', cancelHold);
    window.addEventListener('pointercancel', cancelHold);

    qs('fpPopup').addEventListener('click', () => {
      if (!closeEnabled || state !== 'done') return;
      dismissPopup();
    });
  }

  return { init, reset, dismissPopup };
}
