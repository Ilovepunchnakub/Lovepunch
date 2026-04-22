// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/utils.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
// ยูทิลิตี้พื้นฐานที่หลายโมดูลใช้ร่วมกัน
export const qs = (id) => document.getElementById(id);
export const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

// สุ่มเลขจำนวนเต็มในช่วง [min, max]
export function randomInt(min, max) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

// แสดง toast สั้น ๆ ด้านล่าง
export function toast(msg) {
  const t = qs('toast');
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2200);
}

// หน่วงเวลาแบบ Promise
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
