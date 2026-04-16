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
  const holdMs = 3500;

  function closePopup() {
    qs('fpPopup').classList.remove('show');
    radarFx?.stop();
  }

  function renderLoadingPopup() {
    closeEnabled = false;
    qs('fpPopup').classList.remove('can-close');
    qs('fpPopupTitle').textContent = 'กำลังโหลดข้อมูลความลับ';
    qs('fpPopupBody').innerHTML = loadingMarkup();
    radarFx = createRadarFx(qs('scanRadarCanvas'));
    radarFx.start();
  }

  function renderDonePopup() {
    closeEnabled = false;
    qs('fpPopup').classList.remove('can-close');
    qs('fpPopupTitle').textContent = 'ตรวจสอบเสร็จสิ้น 💖';
    qs('fpPopupBody').innerHTML = completeMarkup();
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
    const pct = Math.round(progress * 100);
    zone.style.setProperty('--hold-progress', `${pct}%`);
    qs('fpHoldProgress').textContent = `${pct}%`;
  }

  function clearHoldVisual() {
    const zone = qs('fpZone');
    zone.style.setProperty('--hold-progress', '0%');
    qs('fpHoldProgress').textContent = '0%';
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
      doScan();
    }, holdMs);
  }

  function reset() {
    state = 'idle';
    closeEnabled = false;
    qs('fpHint').textContent = 'แตะค้างเพื่อสแกนลายนิ้วมือ 👆';
    qs('fpMsg').textContent = '';
    qs('fpZone').classList.remove('scanning', 'holding');
    clearHoldVisual();
    qs('fpPopup').classList.remove('show', 'can-close');
    radarFx?.stop();
  }

  async function doScan() {
    if (state !== 'idle') return;

    state = 'scanning';
    qs('fpHint').textContent = 'กำลังอ่านลายนิ้วมือ...';
    qs('fpZone').classList.remove('holding');
    qs('fpZone').classList.add('scanning');

    const popup = qs('fpPopup');
    popup.classList.add('show');
    renderLoadingPopup();

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

    qs('fpPopup').addEventListener('click', () => {
      if (!closeEnabled || state !== 'done') return;
      closePopup();
      state = 'idle';
      qs('fpHint').textContent = 'แตะค้างเพื่อสแกนลายนิ้วมือ 👆';
      clearHoldVisual();
    });
  }

  return { init, reset };
}
