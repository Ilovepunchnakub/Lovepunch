// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/lovePlayground/worldObject.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { Vector, isNum, px } from './math.js';

export class WorldObject {
  constructor(props) {
    Object.assign(this, {
      x: 0,
      y: 0,
      offset: { x: null, y: null },
      pos: new Vector({ x: props.x, y: props.y }),
      size: { w: 0, h: 0 },
      maxSize: { w: 0, h: 0 },
      ...props
    });
    this.addToWorld();
  }

  get rect() {
    const { left, top } = this.el.getBoundingClientRect();
    return { left, top };
  }

  get distPos() {
    const { size: { w, h } } = this;
    return {
      x: this.rect.left + w / 2,
      y: this.rect.top + h / 2
    };
  }

  setSize(target = this) {
    const { size: { w, h }, maxSize: { w: mW, h: mH } } = target;
    this.el.style.setProperty('--w', px(w));
    this.el.style.setProperty('--h', px(h));
    this.el.style.setProperty('--max-w', px(mW));
    this.el.style.setProperty('--max-h', px(mH));
  }

  setStyles() {
    const { pos: { x, y }, z } = this;
    Object.assign(this.el.style, {
      left: px(x || 0),
      top: px(y || 0),
      zIndex: z || 0,
      transformOrigin: isNum(this.offset.x) && isNum(this.offset.y)
        ? `${this.offset.x}px ${this.offset.y}px`
        : 'center'
    });
  }

  distanceBetween(target) {
    return Math.round(
      Math.sqrt(
        (target.distPos.x - this.distPos.x) ** 2 + (target.distPos.y - this.distPos.y) ** 2
      )
    );
  }

  addToWorld() {
    this.setSize();
    if (!this.noPos) this.setStyles();
    this.container.appendChild(this.el);
  }
}
