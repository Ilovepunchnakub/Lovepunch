import { qs, wait } from './utils.js';

export function createFingerController() {
  let state = 'idle';

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
    popup.classList.add('show', 'profile');
    qs('fpPopupTitle').textContent = 'กำลังโหลดข้อมูลความลับ';
    qs('fpPopupBody').innerHTML = `
      <div class="scan-shell">
        <div class="scan-meter"><span id="scanMeterBar"></span></div>
        <p class="scan-percent" id="scanPercent">0%</p>
        <ul class="scan-log" id="scanLog"></ul>
        <p class="scan-tip">กำลังค้นหาข้อมูลระดับลับ... โปรดรอสักครู่</p>
      </div>`;

    const meter = qs('scanMeterBar');
    const percent = qs('scanPercent');
    const log = qs('scanLog');

    const phases = [
      'เชื่อมต่อคลังข้อมูลหัวใจ...',
      'ถอดรหัสลายนิ้วมือชั้นที่ 1',
      'ตรวจสอบ Token ความทรงจำ...',
      'ยืนยันข้อมูลคู่รักจากเซิร์ฟเวอร์ลับ',
      'ดาวน์โหลดโมดูลความน่ารัก',
      'ตรวจสอบความปลอดภัยระดับ Soul-Link',
      'ค้นหาไฟล์รอยยิ้มที่บันทึกไว้',
      'รวบรวมข้อมูลความลับทั้งหมด'
    ];

    const totalMs = 8400;
    const stepMs = Math.floor(totalMs / phases.length);

    for (let i = 0; i < phases.length; i += 1) {
      const pct = Math.min(100, Math.round(((i + 1) / phases.length) * 100));
      const item = document.createElement('li');
      item.textContent = `> ${phases[i]} [OK]`;
      log.appendChild(item);
      meter.style.width = `${pct}%`;
      percent.textContent = `${pct}%`;
      await wait(stepMs);
    }

    qs('fpZone').classList.remove('scanning');
    qs('fpHint').textContent = 'พบข้อมูลลับแล้ว แตะเพื่อยืนยันขั้นสุดท้าย';

    qs('fpPopupTitle').textContent = 'พบข้อมูลลับแล้ว 🔐';
    qs('fpPopupBody').innerHTML = `
      <ul class="fake-list">
        <li>ชื่อเล่น: คนที่ฉันรักที่สุด</li>
        <li>ID หัวใจ: LP-FOREVER-0614</li>
        <li>สถานะความสัมพันธ์: Forever Mode</li>
        <li>ระดับความน่ารัก: 999/100</li>
        <li>ความปลอดภัย: ผ่านการปกป้องหลายชั้น</li>
        <li>บันทึกล่าสุด: พบรอยยิ้มที่ทำให้โลกหยุดหมุน</li>
      </ul>
      <p class="scan-tip">แตะที่หน้าต่างนี้เพื่อดูผลการยืนยันขั้นสุดท้าย</p>`;

    state = 'secret-ready';

    const onRevealFinal = () => {
      if (state !== 'secret-ready') return;
      popup.removeEventListener('click', onRevealFinal);
      popup.classList.remove('profile');
      qs('fpPopupTitle').textContent = 'ตรวจสอบเสร็จสิ้น 💖';
      qs('fpPopupBody').innerHTML = '<p class="long-love">ขอบคุณที่อยู่กับฉันในทุกช่วงเวลา ทั้งวันที่เก่งและวันที่อ่อนล้า เธอทำให้คำว่าบ้านมีความหมายมากขึ้นทุกวัน ฉันอยากใช้ทุกเช้าทุกคืนไปกับเธอ อยากเติบโตไปด้วยกัน และอยากจับมือเธอไปเรื่อยๆ ไม่ว่าโลกจะเปลี่ยนไปแค่ไหน รักเธอที่สุดนะคนเก่งของฉัน 🤍</p>';
      qs('fpMsg').textContent = 'สแกนสำเร็จแล้ว วันนี้ก็รักเธอมากขึ้นอีกแล้ว';
      state = 'done';
    };

    popup.addEventListener('click', onRevealFinal);
  }

  function init() {
    qs('fpZone').addEventListener('click', doScan);
    qs('fpPopupClose').addEventListener('click', (e) => {
      e.stopPropagation();
      qs('fpPopup').classList.remove('show');
    });
  }

  return { init, reset };
}
