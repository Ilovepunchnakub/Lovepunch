// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/lovePlayground/math.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
export class Vector {
  constructor(props) {
    Object.assign(this, { x: 0, y: 0, ...props });
  }

  setXy(xy) {
    this.x = xy.x;
    this.y = xy.y;
  }

  subtractXy(xy) {
    this.x -= xy.x;
    this.y -= xy.y;
  }
}

export const isNum = (x) => typeof x === 'number';
export const px = (n) => `${n}px`;
export const randomN = (n) => Math.round(-n - 0.5 + Math.random() * (2 * n + 1));
