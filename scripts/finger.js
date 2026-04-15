import { qs, wait } from './utils.js';

export function createFingerController() {
  let state = 'idle';

  function reset() {
    state = 'idle';
    qs('fpHint').textContent = 'แตะเพื่อสแกนลายนิ้วมือ 👆';
    qs('fpMsg').textContent = '';
    qs('fpPopup').classList.remove('show');
  }

  async function doScan() {
    if (state !== 'idle') return;
    state = 'scanning';
    qs('fpHint').textContent = 'กำลังอ่านลายนิ้วมือ...';
    qs('fpZone').classList.add('scanning');

    await wait(2100);
    qs('fpZone').classList.remove('scanning');
    qs('fpHint').textContent = 'กำลังตรวจสอบข้อมูลส่วนตัว...';

    const popup = qs('fpPopup');
    popup.classList.add('show', 'profile');
    qs('fpPopupTitle').textContent = 'กำลังโหลดข้อมูลความลับ';
    qs('fpPopupBody').innerHTML = `
      <ul class="fake-list">
        <li>ชื่อเล่น: คนที่ฉันรักที่สุด</li>
        <li>ID หัวใจ: LP-FOREVER-0614</li>
        <li>สถานะความสัมพันธ์: Forever Mode</li>
        <li>ระดับความน่ารัก: 999/100</li>
        <li>ความปลอดภัย: ยืนยันด้วยหัวใจสำเร็จ</li>
        <li>กำลัง Sync ความทรงจำ: 98%</li>
        <li>กำลังโหลดรูปยิ้มโปรด: Complete</li>
      </ul>`;

    await wait(2400);
    popup.classList.remove('profile');
    qs('fpPopupTitle').textContent = 'ตรวจสอบเสร็จสิ้น 💖';
    qs('fpPopupBody').innerHTML = '<p class="long-love">ขอบคุณที่อยู่กับฉันในทุกช่วงเวลา ทั้งวันที่เก่งและวันที่อ่อนล้า เธอทำให้คำว่าบ้านมีความหมายมากขึ้นทุกวัน ฉันอยากใช้ทุกเช้าทุกคืนไปกับเธอ อยากเติบโตไปด้วยกัน และอยากจับมือเธอไปเรื่อยๆ ไม่ว่าโลกจะเปลี่ยนไปแค่ไหน รักเธอที่สุดนะคนเก่งของฉัน 🤍</p>';

    qs('fpMsg').textContent = 'สแกนสำเร็จแล้ว วันนี้ก็รักเธอมากขึ้นอีกแล้ว';
    state = 'done';
  }

  function init() {
    qs('fpZone').addEventListener('click', doScan);
    qs('fpPopupClose').addEventListener('click', () => qs('fpPopup').classList.remove('show'));
  }

  return { init, reset };
}
