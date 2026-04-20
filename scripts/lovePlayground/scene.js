// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/lovePlayground/scene.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { Bear } from './bear.js';

export function initLovePlaygroundScene({ wrapper, bearEl }) {
  if (!wrapper || !bearEl) return () => {};

  const bear = new Bear({
    el: bearEl,
    container: wrapper,
    wrapper,
    size: { w: 70, h: 90 },
    maxSize: { w: 90, h: 100 },
    offset: { x: null, y: null }
  });

  bear.setPos();

  return () => {
    bear.destroy();
    wrapper.innerHTML = '';
  };
}
