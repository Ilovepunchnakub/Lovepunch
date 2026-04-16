import { qs, wait } from './utils.js';
import { runFingerScan } from './fingerFlow.js';

export function createFingerController() {
  let state = 'idle';
  let closeEnabled = false;

  function closePopup() {
    qs('fpPopup').classList.remove('show');
  }

  function renderLoadingPopup() {
    closeEnabled = false;
    qs('fpPopup').classList.remove('can-close');
    qs('fpPopupTitle').textContent = 'กำลังโหลดข้อมูลความลับ';
    qs('fpPopupBody').innerHTML = `
      <div class="scan-shell wow">
        <div class="scan-radar-wrap">
          <div class="scan-radar"></div>
          <p class="scan-percent" id="scanPercent">0%</p>
        </div>
        <div class="scan-meter"><span id="scanMeterBar"></span></div>
        <p class="scan-tip">กำลังตรวจสอบโหมดลับแบบเรียลไทม์... โปรดรอสักครู่</p>
        <section class="scan-log-panel" aria-live="polite">
          <p class="scan-log-title">SYSTEM LOG</p>
          <ul class="scan-log" id="scanLog"></ul>
        </section>
      </div>`;
  }

  function renderDonePopup() {
    closeEnabled = false;
    qs('fpPopup').classList.remove('can-close');
    qs('fpPopupTitle').textContent = 'ตรวจสอบเสร็จสิ้น 💖';
    qs('fpPopupBody').innerHTML = `
      <div class="scan-complete">
        <div class="complete-badge">✔ ผ่านการยืนยัน</div>
        <p id="fpCountdown" class="scan-tip">แตะจอเพื่อปิดได้ใน 3 วิ...</p>
        <p class="long-love">ขอบคุณที่อยู่กับฉันในทุกช่วงเวลา ทั้งวันที่เก่งและวันที่อ่อนล้า เธอทำให้คำว่าบ้านมีความหมายมากขึ้นทุกวัน ฉันอยากใช้ทุกเช้าทุกคืนไปกับเธอ อยากเติบโตไปด้วยกัน และอยากจับมือเธอไปเรื่อยๆ ไม่ว่าโลกจะเปลี่ยนไปแค่ไหน รักเธอที่สุดนะคนเก่งของฉัน 🤍</p>
      </div>`;
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

  function reset() {
    state = 'idle';
    closeEnabled = false;
    qs('fpHint').textContent = 'แตะเพื่อสแกนลายนิ้วมือ 👆';
    qs('fpMsg').textContent = '';
    qs('fpZone').classList.remove('scanning');
    qs('fpPopup').classList.remove('show', 'can-close');
  }

  async function doScan() {
    if (state !== 'idle') return;

    state = 'scanning';
    qs('fpHint').textContent = 'กำลังอ่านลายนิ้วมือ...';
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
    qs('fpZone').addEventListener('click', doScan);
    qs('fpPopup').addEventListener('click', () => {
      if (!closeEnabled || state !== 'done') return;
      closePopup();
      state = 'idle';
      qs('fpHint').textContent = 'แตะเพื่อสแกนลายนิ้วมือ 👆';
    });
  }

  return { init, reset };
}
