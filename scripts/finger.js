import { qs } from './utils.js';
import { runFingerScan } from './fingerFlow.js';

export function createFingerController() {
  let state = 'idle';

  function renderLoadingPopup() {
    qs('fpPopupTitle').textContent = 'กำลังโหลดข้อมูลความลับ';
    qs('fpPopupBody').innerHTML = `
      <div class="scan-shell wow">
        <div class="scan-radar"></div>
        <div class="scan-meter"><span id="scanMeterBar"></span></div>
        <p class="scan-percent" id="scanPercent">0%</p>
        <ul class="scan-log" id="scanLog"></ul>
        <p class="scan-tip">กำลังตรวจสอบโหมดลับแบบเรียลไทม์... โปรดรอสักครู่</p>
      </div>`;
  }

  function renderDonePopup() {
    qs('fpPopupTitle').textContent = 'ตรวจสอบเสร็จสิ้น 💖';
    qs('fpPopupBody').innerHTML = `
      <div class="scan-complete">
        <div class="complete-badge">✔ ผ่านการยืนยัน</div>
        <p class="long-love">ขอบคุณที่อยู่กับฉันในทุกช่วงเวลา ทั้งวันที่เก่งและวันที่อ่อนล้า เธอทำให้คำว่าบ้านมีความหมายมากขึ้นทุกวัน ฉันอยากใช้ทุกเช้าทุกคืนไปกับเธอ อยากเติบโตไปด้วยกัน และอยากจับมือเธอไปเรื่อยๆ ไม่ว่าโลกจะเปลี่ยนไปแค่ไหน รักเธอที่สุดนะคนเก่งของฉัน 🤍</p>
      </div>`;
  }

  function reset() {
    state = 'idle';
    qs('fpHint').textContent = 'แตะเพื่อสแกนลายนิ้วมือ 👆';
    qs('fpMsg').textContent = '';
    qs('fpZone').classList.remove('scanning');
    qs('fpPopup').classList.remove('show');
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
        item.textContent = `> ${text} [OK]`;
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
  }

  function init() {
    qs('fpZone').addEventListener('click', doScan);
  }

  return { init, reset };
}
