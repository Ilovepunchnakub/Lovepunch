import { qs } from './utils.js';
import { renderLovePlayground } from './lovePlaygroundView.js';

const FEED_DISTANCE = 108;

export function createLovePlayground({ navigator }) {
  const pageId = 'love-play';
  const host = qs('lovePlayWrap');
  const closeBtn = qs('lovePlayClose');
  let detachDrag = null;

  function distanceBetween(a, b) {
    const ax = a.left + a.width / 2;
    const ay = a.top + a.height / 2;
    const bx = b.left + b.width / 2;
    const by = b.top + b.height / 2;
    return Math.hypot(ax - bx, ay - by);
  }

  function mountScene() {
    if (!host) return;
    host.innerHTML = renderLovePlayground();

    const wrap = host.querySelector('[data-love-play]');
    const donut = host.querySelector('[data-donut]');
    const bear = host.querySelector('[data-bear]');
    if (!wrap || !donut || !bear) return;

    let dragging = false;
    let pointerId = null;

    function clamp(v, min, max) {
      return Math.min(max, Math.max(min, v));
    }

    function updateDonut(clientX, clientY) {
      const rect = wrap.getBoundingClientRect();
      const x = clamp(clientX - rect.left - donut.offsetWidth / 2, 0, rect.width - donut.offsetWidth);
      const y = clamp(clientY - rect.top - donut.offsetHeight / 2, 0, rect.height - donut.offsetHeight);
      donut.style.left = `${x}px`;
      donut.style.top = `${y}px`;

      const donutRect = donut.getBoundingClientRect();
      const bearRect = bear.getBoundingClientRect();
      const fed = distanceBetween(donutRect, bearRect) < FEED_DISTANCE;
      bear.classList.toggle('fed', fed);
    }

    function onPointerDown(event) {
      dragging = true;
      pointerId = event.pointerId;
      donut.classList.add('dragging');
      donut.setPointerCapture(pointerId);
      updateDonut(event.clientX, event.clientY);
      event.preventDefault();
    }

    function onPointerMove(event) {
      if (!dragging || event.pointerId !== pointerId) return;
      updateDonut(event.clientX, event.clientY);
    }

    function endDrag(event) {
      if (event.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      donut.classList.remove('dragging');
    }

    donut.addEventListener('pointerdown', onPointerDown);
    donut.addEventListener('pointermove', onPointerMove);
    donut.addEventListener('pointerup', endDrag);
    donut.addEventListener('pointercancel', endDrag);

    detachDrag = () => {
      donut.removeEventListener('pointerdown', onPointerDown);
      donut.removeEventListener('pointermove', onPointerMove);
      donut.removeEventListener('pointerup', endDrag);
      donut.removeEventListener('pointercancel', endDrag);
      detachDrag = null;
    };
  }

  function close() {
    if (navigator.current() === pageId) {
      navigator.go('cards');
    }
  }

  function open() {
    mountScene();
    navigator.go(pageId);
  }

  function init() {
    closeBtn?.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (navigator.current() !== pageId) return;
      event.preventDefault();
      close();
    });
  }

  return {
    init,
    open,
    close,
    destroy: () => {
      detachDrag?.();
      if (host) host.innerHTML = '';
    }
  };
}
