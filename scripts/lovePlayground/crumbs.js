// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/lovePlayground/crumbs.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { WorldObject } from './worldObject.js';

export class Crumbs extends WorldObject {
  constructor(props) {
    super({
      el: Object.assign(document.createElement('div'), { className: 'lp-donut-crumbs lp-object' }),
      x: 0,
      y: 0,
      container: props.wrapper,
      ...props
    });

    setTimeout(() => {
      this.el.remove();
      this.food.crumbs = null;
    }, 1000);
  }
}
