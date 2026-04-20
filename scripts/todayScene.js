import { qs } from './utils.js';

const markup = `
<svg class="today-game-svg" id="todayGameSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" overflow="visible">
  <linearGradient id="ArcGradient"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="50%" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <path id="arc" fill="none" stroke="url(#ArcGradient)" stroke-width="4" d="M100,250c250-400,550-400,800,0" pointer-events="none"/>
  <defs><g id="arrow"><line x2="60" fill="none" stroke="#888" stroke-width="2" /><polygon fill="#888" points="64 0 58 2 56 0 58 -2" /><polygon fill="#88ce02" points="2 -3 -4 -3 -1 0 -4 3 2 3 5 0" /></g></defs>
  <g id="target"><path fill="#FFF" d="M924.2,274.2c-21.5,21.5-45.9,19.9-52,3.2c-4.4-12.1,2.4-29.2,14.2-41c11.8-11.8,29-18.6,41-14.2 C944.1,228.3,945.7,252.8,924.2,274.2z"/><path fill="#F4531C" d="M915.8,265.8c-14.1,14.1-30.8,14.6-36,4.1c-4.1-8.3,0.5-21.3,9.7-30.5s22.2-13.8,30.5-9.7 C930.4,235,929.9,251.7,915.8,265.8z"/><path fill="#FFF" d="M908.9,258.9c-8,8-17.9,9.2-21.6,3.5c-3.2-4.9-0.5-13.4,5.6-19.5c6.1-6.1,14.6-8.8,19.5-5.6 C918.1,241,916.9,250.9,908.9,258.9z"/><path fill="#F4531C" d="M903.2,253.2c-2.9,2.9-6.7,3.6-8.3,1.7c-1.5-1.8-0.6-5.4,2-8c2.6-2.6,6.2-3.6,8-2 C906.8,246.5,906.1,250.2,903.2,253.2z"/></g>
  <g id="bow" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke" pointer-events="none"><polyline fill="none" stroke="#ddd" points="88,200 88,250 88,300"/><path fill="none" stroke="#88ce02" stroke-width="3" stroke-linecap="round" d="M88,300 c0-10.1,12-25.1,12-50s-12-39.9-12-50"/></g>
  <g class="arrow-angle"><use x="100" y="250" xlink:href="#arrow"/></g>
  <clipPath id="mask"><polygon opacity=".5" points="0,0 1500,0 1500,200 970,290 950,240 925,220 875,280 890,295 920,310 0,350" pointer-events="none"/></clipPath>
  <g class="arrows" clip-path="url(#mask)" pointer-events="none"></g>
  <g class="feedback" opacity="0" transform="translate(318, 130) rotate(0)">
    <text id="todayFeedbackText" x="0" y="0" fill="#F4531C" font-size="72" font-style="italic" font-weight="900" letter-spacing="2">LOVE YOU</text>
  </g>
</svg>
<span class="today-game-hint">Draw back an arrow and launch it!</span>`;

export function createTodayScene({ navigator }) {
  const pageId = 'today';
  const root = qs('todayGameRoot');
  const closeBtn = qs('todayClose');
  let cleanup = () => {};

  function mount() {
    if (!root) return;
    cleanup();
    root.innerHTML = markup;

    const svg = root.querySelector('#todayGameSvg');
    const arrows = root.querySelector('.arrows');
    const cursor = svg.createSVGPoint();

    let randomAngle = 0;
    const target = { x: 900, y: 249.5 };
    const lineSegment = { x1: 875, y1: 280, x2: 925, y2: 220 };
    const pivot = { x: 100, y: 250 };

    const getMouseSVG = (e) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      return cursor.matrixTransform(svg.getScreenCTM().inverse());
    };

    const aim = (e) => {
      const point = getMouseSVG(e);
      point.x = Math.min(point.x, pivot.x - 7);
      point.y = Math.max(point.y, pivot.y + 7);
      const dx = point.x - pivot.x;
      const dy = point.y - pivot.y;
      const angle = Math.atan2(dy, dx) + randomAngle;
      const bowAngle = angle - Math.PI;
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 50);
      const scale = Math.min(Math.max(distance / 30, 1), 2);

      TweenMax.to('#bow', 0.3, { scaleX: scale, rotation: `${bowAngle}rad`, transformOrigin: 'right center' });
      TweenMax.to('.arrow-angle', 0.3, { rotation: `${bowAngle}rad`, svgOrigin: '100 250' });
      TweenMax.to('.arrow-angle use', 0.3, { x: -distance });
      TweenMax.to('#bow polyline', 0.3, { attr: { points: `88,200 ${Math.min(pivot.x - (1 / scale) * distance, 88)},250 88,300` } });

      const radius = distance * 9;
      const offset = { x: Math.cos(bowAngle) * radius, y: Math.sin(bowAngle) * radius };
      const arcWidth = offset.x * 3;

      TweenMax.to('#arc', 0.3, {
        attr: { d: `M100,250c${offset.x},${offset.y},${arcWidth - offset.x},${offset.y + 50},${arcWidth},50` },
        autoAlpha: distance / 60
      });
    };

    const getIntersection = (segment1, segment2) => {
      const dx1 = segment1.x2 - segment1.x1;
      const dy1 = segment1.y2 - segment1.y1;
      const dx2 = segment2.x2 - segment2.x1;
      const dy2 = segment2.y2 - segment2.y1;
      const cx = segment1.x1 - segment2.x1;
      const cy = segment1.y1 - segment2.y1;
      const denominator = dy2 * dx1 - dx2 * dy1;
      if (denominator === 0) return null;
      const ua = (dx2 * cy - dy2 * cx) / denominator;
      const ub = (dx1 * cy - dy1 * cx) / denominator;
      return { x: segment1.x1 + ua * dx1, y: segment1.y1 + ua * dy1, segment1: ua >= 0 && ua <= 1, segment2: ub >= 0 && ub <= 1 };
    };

    const feedbackGroup = root.querySelector('.feedback');
    const feedbackText = root.querySelector('#todayFeedbackText');

    const showMessage = ({
      text,
      color,
      size = 72,
      x = 320,
      y = 124,
      rotation = 0
    }) => {
      if (!feedbackGroup || !feedbackText) return;
      TweenMax.killTweensOf(feedbackGroup);
      TweenMax.set(feedbackGroup, { autoAlpha: 1, x, y, rotation, scale: 1 });
      feedbackText.textContent = text;
      feedbackText.setAttribute('fill', color);
      feedbackText.setAttribute('font-size', `${size}`);
      TweenMax.fromTo(feedbackGroup, 0.45, { scale: 0.58, y: y + 14 }, { scale: 1, y, ease: Back.easeOut });
      TweenMax.to(feedbackGroup, 0.28, { delay: 0.95, scale: 0.88, autoAlpha: 0, ease: Back.easeIn });
    };

    const hitTest = (tween) => {
      const arrow = tween.target[0];
      const transform = arrow._gsTransform;
      const radians = (transform.rotation * Math.PI) / 180;
      const arrowSegment = { x1: transform.x, y1: transform.y, x2: Math.cos(radians) * 60 + transform.x, y2: Math.sin(radians) * 60 + transform.y };
      const intersection = getIntersection(arrowSegment, lineSegment);
      if (intersection?.segment1 && intersection?.segment2) {
        tween.pause();
        const dx = intersection.x - target.x;
        const dy = intersection.y - target.y;
        showMessage(
          Math.sqrt(dx * dx + dy * dy) < 7
            ? { text: 'LOVE YOU', color: '#F4531C', size: 72, x: 292, y: 108, rotation: 0 }
            : { text: 'HIT!', color: '#ffcc00', size: 82, x: 430, y: 112, rotation: 10 }
        );
      }
    };

    const onMiss = () => showMessage({ text: 'MISS YOU', color: '#b7bbc2', size: 62, x: 256, y: 196, rotation: 0 });

    const loose = () => {
      window.removeEventListener('pointermove', aim);
      window.removeEventListener('pointerup', loose);
      TweenMax.to('#bow', 0.4, { scaleX: 1, transformOrigin: 'right center', ease: Elastic.easeOut });
      TweenMax.to('#bow polyline', 0.4, { attr: { points: '88,200 88,250 88,300' }, ease: Elastic.easeOut });
      const newArrow = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      newArrow.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow');
      arrows.appendChild(newArrow);
      const path = MorphSVGPlugin.pathDataToBezier('#arc');
      TweenMax.to([newArrow], 0.5, { force3D: true, bezier: { type: 'cubic', values: path, autoRotate: ['x', 'y', 'rotation'] }, onUpdate: hitTest, onUpdateParams: ['{self}'], onComplete: onMiss, ease: Linear.easeNone });
      TweenMax.to('#arc', 0.3, { opacity: 0 });
      TweenMax.set('.arrow-angle use', { opacity: 0 });
    };

    const draw = (e) => {
      randomAngle = Math.random() * Math.PI * 0.03 - 0.015;
      TweenMax.to('.arrow-angle use', 0.3, { opacity: 1 });
      window.addEventListener('pointermove', aim, { passive: false });
      window.addEventListener('pointerup', loose);
      aim(e);
    };

    aim({ clientX: 320, clientY: 300 });
    window.addEventListener('pointerdown', draw, { passive: false });

    cleanup = () => {
      window.removeEventListener('pointerdown', draw);
      window.removeEventListener('pointermove', aim);
      window.removeEventListener('pointerup', loose);
      root.innerHTML = '';
      cleanup = () => {};
    };
  }

  function open() {
    navigator.go(pageId).then(() => {
      if (navigator.current() === pageId) mount();
    });
  }

  function close({ navigate = true } = {}) {
    if (navigate && navigator.current() === pageId) navigator.go('promise', { skipLoader: true });
    cleanup();
  }

  function init() {
    closeBtn?.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navigator.current() === pageId) {
        event.preventDefault();
        close();
      }
    });
  }

  return { init, open, close, destroy: cleanup };
}
