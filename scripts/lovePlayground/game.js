const isNum = (x) => typeof x === 'number';
const px = (n) => `${n}px`;
const randomN = (n) => Math.round(-n - 0.5 + Math.random() * (2 * n + 1));

class Vector {
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

class WorldObject {
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

class Crumbs extends WorldObject {
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

class Food extends WorldObject {
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

    this.addDragEvent();
    this.setPos();
  }

  touchPos(e) {
    return { x: e.clientX, y: e.clientY };
  }

  addDragEvent() {
    this.el.addEventListener('pointerdown', this.onGrab);
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
    this.grabPos.b = this.touchPos(e);
    this.el.classList.add('lp-dragging');
    document.body.classList.add('lp-no-select');
    this.el.setPointerCapture?.(e.pointerId);
    document.addEventListener('pointerup', this.onLetGo);
    document.addEventListener('pointermove', this.onDrag, { passive: false });
  }

  onDrag(e) {
    const { x, y } = this.touchPos(e);
    if (this.canMove) this.drag(e, x, y);
    this.grabPos.b.x = x;
    this.grabPos.b.y = y;
  }

  onLetGo(e) {
    if (e?.pointerId !== undefined) this.el.releasePointerCapture?.(e.pointerId);
    this.el.classList.remove('lp-dragging');
    document.body.classList.remove('lp-no-select');
    this.wrapper.classList.remove('lp-pointer-glow');
    document.removeEventListener('pointerup', this.onLetGo);
    document.removeEventListener('pointermove', this.onDrag);
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
    clearInterval(this.eatInterval);
  }
}

class Bear extends WorldObject {
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
