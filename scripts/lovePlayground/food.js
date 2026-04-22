// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/lovePlayground/food.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { randomN } from './math.js';
import { WorldObject } from './worldObject.js';
import { Crumbs } from './crumbs.js';

export class Food extends WorldObject {
  constructor(props) {
    super({
      el: props.el,
      x: 0,
      y: 0,
      grabPos: { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } },
      eatCount: 0,
      eatInterval: null,
      ...props
    });

    this.onGrab = this.onGrab.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onLetGo = this.onLetGo.bind(this);
    this.activePointerId = null;

    this.addDragEvent();
    this.setPos();
  }

  touchPos(e) {
    return { x: e.clientX, y: e.clientY };
  }

  addDragEvent() {
    this.el.addEventListener('pointerdown', this.onGrab);
    this.el.addEventListener('pointercancel', this.onLetGo);
  }

  drag(e, x, y) {
    e.preventDefault();
    this.grabPos.a.x = this.grabPos.b.x - x;
    this.grabPos.a.y = this.grabPos.b.y - y;
    this.pos.subtractXy(this.grabPos.a);
    this.pos.x = Math.max(-20, Math.min(this.pos.x, this.wrapper.clientWidth - this.size.w + 20));
    this.pos.y = Math.max(8, Math.min(this.pos.y, this.wrapper.clientHeight - this.size.h + 8));
    this.setStyles();
    this.wrapper.style.setProperty('--drag-x', `${x}px`);
    this.wrapper.style.setProperty('--drag-y', `${y}px`);
    this.wrapper.classList.add('lp-pointer-glow');
  }

  onGrab(e) {
    e.preventDefault();
    if (this.activePointerId !== null && e.pointerId !== this.activePointerId) return;
    this.activePointerId = e.pointerId;
    this.grabPos.b = this.touchPos(e);
    this.el.classList.add('lp-dragging');
    document.body.classList.add('lp-no-select');
    document.body.classList.add('lp-no-scroll');
    this.el.setPointerCapture?.(e.pointerId);
    document.addEventListener('pointerup', this.onLetGo);
    document.addEventListener('pointercancel', this.onLetGo);
    window.addEventListener('pointermove', this.onDrag, { passive: false });
  }

  onDrag(e) {
    if (this.activePointerId !== null && e.pointerId !== this.activePointerId) return;
    const { x, y } = this.touchPos(e);
    if (this.canMove) this.drag(e, x, y);
    this.grabPos.b.x = x;
    this.grabPos.b.y = y;
  }

  onLetGo(e) {
    if (this.activePointerId !== null && e?.pointerId !== undefined && e.pointerId !== this.activePointerId) return;
    if (e?.pointerId !== undefined) this.el.releasePointerCapture?.(e.pointerId);
    this.el.classList.remove('lp-dragging');
    document.body.classList.remove('lp-no-select');
    document.body.classList.remove('lp-no-scroll');
    this.wrapper.classList.remove('lp-pointer-glow');
    this.activePointerId = null;
    document.removeEventListener('pointerup', this.onLetGo);
    document.removeEventListener('pointercancel', this.onLetGo);
    window.removeEventListener('pointermove', this.onDrag);
  }

  eat() {
    if (this.eatInterval) return;

    this.eatInterval = setInterval(() => {
      if (this.eatCount < 5) {
        this.crumbs = new Crumbs({
          size: { w: 0, h: 0 },
          maxSize: { w: 40, h: 40 },
          x: this.distPos.x + randomN(10),
          y: this.pos.y + randomN(10),
          food: this,
          wrapper: this.wrapper
        });
        this.eatCount += 1;
        this.el.className = `lp-food lp-donut lp-donut-eaten-${this.eatCount} lp-object`;
      } else {
        this.el.remove();
        this.bear.food = null;
        clearInterval(this.eatInterval);
        this.eatInterval = null;
        this.bear.grow();
      }
    }, 500);
  }

  setPos() {
    const { width, height } = this.wrapper.getBoundingClientRect();
    this.pos.setXy({
      x: width / 2 - 36,
      y: height - (height > 400 ? 200 : 100)
    });
    this.setStyles();
  }

  destroy() {
    this.onLetGo();
    this.el.removeEventListener('pointerdown', this.onGrab);
    this.el.removeEventListener('pointercancel', this.onLetGo);
    clearInterval(this.eatInterval);
  }
}
