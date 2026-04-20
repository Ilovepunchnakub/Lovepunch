// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/lovePlayground/bear.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

import { Food } from './food.js';
import { WorldObject } from './worldObject.js';

export class Bear extends WorldObject {
  constructor(props) {
    super({ ...props, canMove: true, type: 'bear', el: props.el });

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onResize = this.onResize.bind(this);

    const cheekWrappers = this.el.querySelectorAll('.lp-cheek-wrapper');
    const mouthWrapper = this.el.querySelector('.lp-mouth-wrapper');

    this.cheeks = [0, 1].map((i) => new WorldObject({
      el: Object.assign(document.createElement('div'), { className: 'lp-cheek lp-round lp-object' }),
      container: cheekWrappers[i],
      size: { w: 0, h: 0 },
      maxSize: { w: 40, h: 40 },
      noPos: true
    }));

    this.mouth = new WorldObject({
      el: Object.assign(document.createElement('div'), { className: 'lp-mouth lp-object lp-flex-center' }),
      container: mouthWrapper,
      size: { w: 20, h: 0 },
      maxSize: { w: 40, h: 30 },
      noPos: true
    });

    document.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('resize', this.onResize);

    this.createFood();
  }

  onPointerMove() {
    if (!this.food) return;
    if (this.mouth.distanceBetween(this.food) < 50) {
      this.el.classList.add('lp-eating');
      this.wrapper.classList.remove('lp-show-message');
      this.food.eat();
    } else {
      this.el.classList.remove('lp-eating');
      clearInterval(this.food.eatInterval);
      this.food.eatInterval = null;
    }
  }

  onResize() {
    this.setPos();
    if (this.food) this.food.setPos();
  }

  setPos() {
    const { width, height } = this.wrapper.getBoundingClientRect();
    this.pos.setXy({
      x: width / 2 - this.size.w / 2,
      y: Math.max(40, height / 2 - 140)
    });
    this.setStyles();
  }

  grow() {
    this.el.className = 'lp-bear lp-object lp-grow';

    setTimeout(() => {
      this.el.classList.add('lp-cheek-shrink');
      setTimeout(() => {
        this.el.classList.remove('lp-cheek-shrink');
        this.createFood();
      }, 1000);
    }, 1000);

    setTimeout(() => {
      this.size = { ...this.maxSize };
      this.maxSize = {
        w: this.size.w + 20,
        h: this.size.h + 10
      };
      this.el.classList.remove('lp-grow');
      this.setSize();
    }, 1500);
  }

  createFood() {
    this.food?.destroy?.();
    const donut = this.wrapper.querySelector('[data-donut]') ?? Object.assign(document.createElement('div'), {
      className: 'lp-food lp-donut lp-object'
    });

    if (!donut.parentElement) this.wrapper.appendChild(donut);

    this.food = new Food({
      el: donut,
      container: this.wrapper,
      wrapper: this.wrapper,
      size: { w: 72, h: 54 },
      canMove: true,
      bear: this
    });
  }

  destroy() {
    document.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('resize', this.onResize);
    this.food?.destroy?.();
  }
}
