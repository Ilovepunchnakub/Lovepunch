// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/lovePlayground/math.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

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
