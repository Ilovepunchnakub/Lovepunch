// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/lovePlayground/crumbs.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

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
