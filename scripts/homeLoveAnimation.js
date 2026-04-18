const HEART_EASING_PATH = 'M0,100C2.9,86.7,33.6-7.3,46-7.3s15.2,22.7,26,22.7S89,0,100,0';
const REPLAY_INTERVAL = 4300;

export function mountHomeLoveAnimation(targetEl, label = 'I Love You') {
  if (!targetEl) return;

  const mojsLib = window.mojs;
  if (!mojsLib) {
    targetEl.textContent = label;
    return;
  }

  const easingHeart = mojsLib.easing.path(HEART_EASING_PATH);

  targetEl.classList.add('home-love-title');
  targetEl.innerHTML = `
    <div class="container" aria-label="${label}" role="img">
      <svg class="svg-container" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
        <line class="line line--left" x1="10" y1="17" x2="10" y2="183"></line>
        <line class="line line--rght" x1="490" y1="17" x2="490" y2="183"></line>
        <g>
          <path class="lttr lttr--I" d="M42.2,73.9h11.4v52.1H42.2V73.9z"></path>
          <path class="lttr lttr--L" d="M85.1,73.9h11.4v42.1h22.8v10H85.1V73.9z"></path>
          <path class="lttr lttr--O" d="M123.9,100c0-15.2,11.7-26.9,27.2-26.9s27.2,11.7,27.2,26.9s-11.7,26.9-27.2,26.9S123.9,115.2,123.9,100zM166.9,100c0-9.2-6.8-16.5-15.8-16.5c-9,0-15.8,7.3-15.8,16.5s6.8,16.5,15.8,16.5C160.1,116.5,166.9,109.2,166.9,100z"></path>
          <path class="lttr lttr--V" d="M180.7,73.9H193l8.4,22.9c1.7,4.7,3.5,9.5,5,14.2h0.1c1.7-4.8,3.4-9.4,5.2-14.3l8.6-22.8h11.7l-19.9,52.1h-11.5L180.7,73.9z"></path>
          <path class="lttr lttr--E" d="M239.1,73.9h32.2v10h-20.7v10.2h17.9v9.5h-17.9v12.4H272v10h-33V73.9z"></path>
          <path class="lttr lttr--Y" d="M315.8,102.5l-20.1-28.6H309l6.3,9.4c2,3,4.2,6.4,6.3,9.6h0.1c2-3.2,4.1-6.4,6.3-9.6l6.3-9.4h12.9l-19.9,28.5v23.6h-11.4V102.5z"></path>
          <path class="lttr lttr--O2" d="M348.8,100c0-15.2,11.7-26.9,27.2-26.9c15.5,0,27.2,11.7,27.2,26.9s-11.7,26.9-27.2,26.9C360.5,126.9,348.8,115.2,348.8,100z M391.8,100c0-9.2-6.8-16.5-15.8-16.5c-9,0-15.8,7.3-15.8,16.5s6.8,16.5,15.8,16.5C385,116.5,391.8,109.2,391.8,100z"></path>
          <path class="lttr lttr--U" d="M412.4,101.1V73.9h11.4v26.7c0,10.9,2.4,15.9,11.5,15.9c8.4,0,11.4-4.6,11.4-15.8V73.9h11v26.9c0,7.8-1.1,13.5-4,17.7c-3.7,5.3-10.4,8.4-18.7,8.4c-8.4,0-15.1-3.1-18.8-8.5C413.4,114.2,412.4,108.5,412.4,101.1z"></path>
        </g>
      </svg>
      <div class="mo-container"></div>
      <audio class="blup" style="display:none">
        <source src="https://www.freesound.org/data/previews/265/265115_4373976-lq.mp3" type="audio/ogg">
      </audio>
      <audio class="blop" style="display:none">
        <source src="https://www.freesound.org/data/previews/265/265115_4373976-lq.mp3" type="audio/ogg">
      </audio>
    </div>
  `;

  const qs = (selector) => targetEl.querySelector(selector);
  const el = {
    container: qs('.mo-container'),
    i: qs('.lttr--I'),
    l: qs('.lttr--L'),
    o: qs('.lttr--O'),
    v: qs('.lttr--V'),
    e: qs('.lttr--E'),
    y: qs('.lttr--Y'),
    o2: qs('.lttr--O2'),
    u: qs('.lttr--U'),
    lineLeft: qs('.line--left'),
    lineRight: qs('.line--rght'),
    colTxt: '#763c8c',
    colHeart: '#fa4843',
    blup: qs('.blup'),
    blop: qs('.blop')
  };

  class Heart extends mojsLib.CustomShape {
    getShape() {
      return '<path d="M50,88.9C25.5,78.2,0.5,54.4,3.8,31.1S41.3,1.8,50,29.9c8.7-28.2,42.8-22.2,46.2,1.2S74.5,78.2,50,88.9z"/>';
    }
    getLength() {
      return 200;
    }
  }

  mojsLib.addShape('heart', Heart);

  const crtBoom = (delay = 0, x = 0, rd = 46) => {
    const parent = el.container;
    const crcl = new mojsLib.Shape({
      shape: 'circle',
      fill: 'none',
      stroke: el.colTxt,
      strokeWidth: { 5: 0 },
      radius: { [rd]: [rd + 20] },
      easing: 'quint.out',
      duration: 500 / 3,
      parent,
      delay,
      x
    });

    const brst = new mojsLib.Burst({
      radius: { [rd + 15]: 110 },
      angle: 'rand(60, 180)',
      count: 3,
      timeline: { delay },
      parent,
      x,
      children: {
        radius: [5, 3, 7],
        fill: el.colTxt,
        scale: { 1: 0, easing: 'quad.in' },
        pathScale: [0.8, null],
        degreeShift: ['rand(13, 60)', null],
        duration: 1000 / 3,
        easing: 'quint.out'
      }
    });

    return [crcl, brst];
  };

  const crtLoveTl = () => {
    const move = 1000;
    const boom = 200;
    const easing = 'sin.inOut';
    const easingBoom = 'sin.in';
    const easingOut = 'sin.out';
    const opts = { duration: move, easing, opacity: 1 };
    const delta = 150;

    return new mojsLib.Timeline().add([
      new mojsLib.Tween({
        duration: move,
        onStart: () => {
          [el.i, el.l, el.o, el.v, el.e, el.y, el.o2, el.u].forEach((charEl) => {
            charEl.style.opacity = 1;
            charEl.style = 'transform: translate(0px, 0px) rotate(0deg) skew(0deg, 0deg) scale(1, 1); opacity: 1;';
          });
        },
        onComplete: () => {
          [el.l, el.o, el.v, el.e].forEach((charEl) => (charEl.style.opacity = 0));
          el.blop.play().catch(() => {});
        }
      }),

      new mojsLib.Tween({
        duration: move * 2 + boom,
        onComplete: () => {
          [el.y, el.o2].forEach((charEl) => (charEl.style.opacity = 0));
          el.blop.play().catch(() => {});
        }
      }),

      new mojsLib.Tween({
        duration: move * 3 + boom * 2 - delta,
        onComplete: () => {
          el.i.style.opacity = 0;
          el.blop.play().catch(() => {});
        }
      }),

      new mojsLib.Tween({
        duration: move * 3 + boom * 2,
        onComplete: () => {
          el.u.style.opacity = 0;
          el.blup.play().catch(() => {});
        }
      }),

      new mojsLib.Tween({
        duration: 50,
        delay: 4050,
        onUpdate: (progress) => {
          [el.i, el.l, el.o, el.v, el.e, el.y, el.o2, el.u].forEach((charEl) => {
            charEl.style = `transform: translate(0px, 0px) rotate(0deg) skew(0deg, 0deg) scale(1, 1); opacity: ${progress};`;
          });
        },
        onComplete: () => {
          [el.i, el.l, el.o, el.v, el.e, el.y, el.o2, el.u].forEach((charEl) => {
            charEl.style.opacity = 1;
            charEl.style = 'transform: translate(0px, 0px) rotate(0deg) skew(0deg, 0deg) scale(1, 1); opacity: 1;';
          });
        }
      }),

      new mojsLib.Html({ ...opts, el: el.lineLeft, x: { 0: 52 } })
        .then({ duration: boom + move, easing, x: { to: 106 } })
        .then({ duration: boom + move, easing, x: { to: 166 } })
        .then({ duration: 150, easing, x: { to: 176 } })
        .then({ duration: 300 })
        .then({ duration: 350, x: { to: 0 }, easing: easingOut }),

      new mojsLib.Html({ ...opts, el: el.lineRight, x: { 0: -52 } })
        .then({ duration: boom + move, easing, x: { to: -106 } })
        .then({ duration: boom + move, easing, x: { to: -166 } })
        .then({ duration: 150, easing, x: { to: -176 } })
        .then({ duration: 300 })
        .then({ duration: 350, x: { to: 0 }, easing: easingOut }),

      new mojsLib.Html({ ...opts, el: el.i, x: { 0: 34 } })
        .then({ duration: boom, easing: easingBoom, x: { to: 53 } })
        .then({ duration: move, easing, x: { to: 93 } })
        .then({ duration: boom, easing: easingBoom, x: { to: 123 } })
        .then({ duration: move, easing, x: { to: 153 } }),

      new mojsLib.Html({ ...opts, el: el.l, x: { 0: 15 } }),
      new mojsLib.Html({ ...opts, el: el.o, x: { 0: 11 } }),
      new mojsLib.Html({ ...opts, el: el.v, x: { 0: 3 } }),
      new mojsLib.Html({ ...opts, el: el.e, x: { 0: -3 } }),

      new mojsLib.Html({ ...opts, el: el.y, x: { 0: -20 } })
        .then({ duration: boom, easing: easingBoom, x: { to: -53 } })
        .then({ duration: move, easing, x: { to: -77 } }),

      new mojsLib.Html({ ...opts, el: el.o2, x: { 0: -27 } })
        .then({ duration: boom, easing: easingBoom, x: { to: -54 } })
        .then({ duration: move, easing, x: { to: -84 } }),

      new mojsLib.Html({ ...opts, el: el.u, x: { 0: -32 } })
        .then({ duration: boom, easing: easingBoom, x: { to: -53 } })
        .then({ duration: move, easing, x: { to: -89 } })
        .then({ duration: boom, easing: easingBoom, x: { to: -120 } })
        .then({ duration: move, easing, x: { to: -147 } }),

      new mojsLib.Shape({
        parent: el.container,
        shape: 'heart',
        delay: move,
        fill: el.colHeart,
        x: -64,
        scale: { 0: 0.95, easing: easingHeart },
        duration: 500
      })
        .then({ x: { to: -62, easing }, scale: { to: 0.65, easing }, duration: boom + move - 500 })
        .then({ duration: boom - 50, x: { to: -14 }, scale: { to: 0.9 }, easing: easingBoom })
        .then({ duration: 125, scale: { to: 0.8 }, easing: easingOut })
        .then({ duration: 125, scale: { to: 0.85 }, easing: easingOut })
        .then({ duration: move - 200, scale: { to: 0.45 }, easing })
        .then({ delay: -75, duration: 150, x: { to: 0 }, scale: { to: 0.9 }, easing: easingBoom })
        .then({ duration: 125, scale: { to: 0.8 }, easing: easingOut })
        .then({ duration: 125, scale: { to: 0.85 }, easing: easingOut })
        .then({ duration: 125 })
        .then({ duration: 350, scale: { to: 0 }, easing: easingOut }),

      ...crtBoom(move, -64, 46),
      ...crtBoom(move * 2 + boom, 18, 34),
      ...crtBoom(move * 3 + boom * 2 - delta, -64, 34),
      ...crtBoom(move * 3 + boom * 2, 45, 34)
    ]);
  };

  const loveTl = crtLoveTl().play();
  const replayId = window.setInterval(() => {
    loveTl.replay();
  }, REPLAY_INTERVAL);

  targetEl.__homeLoveCleanup?.();
  targetEl.__homeLoveCleanup = () => {
    window.clearInterval(replayId);
    loveTl.stop();
  };

  const volume = 0.2;
  el.blup.volume = volume;
  el.blop.volume = volume;
}
