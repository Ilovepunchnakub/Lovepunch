// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/utils.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

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
