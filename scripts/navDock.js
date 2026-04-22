// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/navDock.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { qs } from './utils.js';

export function initNavDock() {
  const nav = qs('mainNav');
  const toggle = qs('navDockToggle');

  function setCollapsed(collapsed) {
    nav.classList.toggle('collapsed', collapsed);
    toggle.classList.toggle('open', !collapsed);
    toggle.querySelector('span').textContent = collapsed ? '＋' : '×';
  }

  setCollapsed(true);

  toggle.addEventListener('click', () => {
    const collapsed = nav.classList.contains('collapsed');
    setCollapsed(!collapsed);
  });
}
