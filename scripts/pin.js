import { qs, toast } from './utils.js';

export function createPinController({ onUnlock }) {
  let startY = null;
  let unlocked = false;
  const SWIPE_THRESHOLD = 90;

  function enterHome() {
    if (unlocked) return;
    unlocked = true;
    qs('pg-pin').classList.remove('active');
    qs('mainNav').style.display = 'flex';
    toast('เข้าใช้งานสำเร็จ ✨');
    onUnlock();
  }

  function bindSlideUp() {
    const card = qs('pinCard');
    const entry = qs('slideEntry');

    const onStart = (y) => { startY = y; };
    const onMove = (y) => {
      if (unlocked || startY === null) return;
      const delta = startY - y;
      if (delta > SWIPE_THRESHOLD) enterHome();
    };
    const onEnd = () => { startY = null; };

    card.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
    card.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
    card.addEventListener('touchend', onEnd);
    card.addEventListener('touchcancel', onEnd);
    card.addEventListener('mousedown', (e) => onStart(e.clientY));
    card.addEventListener('mousemove', (e) => { if (e.buttons) onMove(e.clientY); });
    card.addEventListener('mouseup', onEnd);
    card.addEventListener('mouseleave', onEnd);
    entry.addEventListener('click', enterHome);
  }

  function init() {
    bindSlideUp();
  }

  return { init };
}
