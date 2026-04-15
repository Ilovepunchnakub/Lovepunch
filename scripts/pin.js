import { CFG } from './config.js';
import { qs, toast } from './utils.js';

export function createPinController({ onUnlock }) {
  let pinVal = '';
  let unlocked = false;

  function render() {
    document.querySelectorAll('.pd').forEach((el, i) => el.classList.toggle('on', i < pinVal.length));
  }

  function clearWithError(msg) {
    qs('pinErr').textContent = msg;
    qs('pinCard').classList.add('shake');
    setTimeout(() => qs('pinCard').classList.remove('shake'), 420);
    pinVal = '';
    render();
    if (navigator.vibrate) navigator.vibrate([80, 20, 80]);
  }

  function successUnlock() {
    unlocked = true;
    qs('pinErr').textContent = '';
    qs('unlockOverlay').classList.add('show');
    qs('unlockHint').classList.add('show');
    toast('ปลดล็อกสำเร็จ ✨ ปัดขึ้นเพื่อเข้าใช้งาน');
  }

  function checkPin() {
    if (pinVal !== CFG.PIN) return clearWithError('PIN ไม่ถูกต้อง ลองใหม่อีกครั้งนะ');
    successUnlock();
  }

  function append(n) {
    if (unlocked || pinVal.length >= 4) return;
    qs('pinErr').textContent = '';
    pinVal += n;
    render();
    if (pinVal.length === 4) setTimeout(checkPin, 120);
  }

  function removeLast() {
    if (unlocked) return;
    pinVal = pinVal.slice(0, -1);
    render();
  }

  function clearAll() {
    if (unlocked) return;
    pinVal = '';
    render();
  }

  function swipeToEnter() {
    if (!unlocked) return;
    qs('pg-pin').classList.remove('active');
    qs('mainNav').style.display = 'flex';
    onUnlock();
  }

  function pressKey(k) {
    if (/^\d$/.test(k)) append(k);
    else if (k === '⌫') removeLast();
    else clearAll();
  }

  function bindKeyEvent(btn, key) {
    const triggerPress = () => pressKey(key);

    if (window.PointerEvent) {
      btn.addEventListener('pointerup', triggerPress);
      return;
    }

    btn.addEventListener('click', triggerPress);
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      triggerPress();
    }, { passive: false });
  }

  function initKeypad() {
    const keys = ['1','2','3','4','5','6','7','8','9','ล้าง','0','⌫'];
    const wrap = qs('keypad');
    wrap.innerHTML = '';
    keys.forEach((k) => {
      const btn = document.createElement('button');
      btn.className = 'kb';
      btn.type = 'button';
      btn.textContent = k;
      btn.dataset.key = k;
      bindKeyEvent(btn, k);
      wrap.appendChild(btn);
    });
  }

  function bindSwipe() {
    let y0 = null;
    const card = qs('pinCard');
    const onStart = (y) => { y0 = y; };
    const onMove = (y) => {
      if (!unlocked || y0 === null) return;
      const delta = y0 - y;
      if (delta > 90) swipeToEnter();
    };

    card.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
    card.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
    card.addEventListener('mousedown', (e) => onStart(e.clientY));
    card.addEventListener('mousemove', (e) => { if (e.buttons) onMove(e.clientY); });
    qs('unlockOverlay').addEventListener('click', swipeToEnter);
  }

  function init() {
    initKeypad();
    bindSwipe();
    render();
  }

  return { init };
}
