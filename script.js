import { START, ANNIVERSARY_BASE, HARDCODED_USERS } from './js/config.js';

const el = {
  pinGate: document.getElementById('pinGate'),
  appMain: document.getElementById('appMain'),
  loginForm: document.getElementById('loginForm'),
  loginPin: document.getElementById('loginPin'),
  loginStatus: document.getElementById('loginStatus'),
  pinPad: document.getElementById('pinPad'),
  pinDots: Array.from(document.querySelectorAll('#pinDots .dot')),
  pinClearBtn: document.getElementById('pinClearBtn'),
  pinBackspaceBtn: document.getElementById('pinBackspaceBtn'),
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  coupleSince: document.getElementById('coupleSince'),
  annivDays: document.getElementById('annivDays'),
  annivHours: document.getElementById('annivHours'),
  annivMinutes: document.getElementById('annivMinutes'),
  annivSeconds: document.getElementById('annivSeconds'),
  anniversaryDateLabel: document.getElementById('anniversaryDateLabel'),
  loveCardMessage: document.getElementById('loveCardMessage'),
  newCardBtn: document.getElementById('newCardBtn')
};

const loveCards = [
  'ขอบคุณที่อยู่ข้างกันเสมอนะ 💗',
  'ทุกวันธรรมดา กลายเป็นวันพิเศษเพราะเธอ',
  'ไม่ว่าจะเหนื่อยแค่ไหน ขอแค่จับมือกันไว้ก็พอ',
  'รักแบบค่อย ๆ โตไปด้วยกัน คือรักที่ดีที่สุด',
  'เธอคือบ้านที่ปลอดภัยที่สุดของใจเรา'
];

function pad(value, length = 2) {
  return String(value).padStart(length, '0');
}

function formatThaiDate(date) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date);
}

function applyPinDots() {
  const count = el.loginPin.value.length;
  el.pinDots.forEach((dot, index) => dot.classList.toggle('filled', index < count));
}

function setStatus(text, type = '') {
  el.loginStatus.textContent = text;
  el.loginStatus.classList.remove('error', 'success');
  if (type) el.loginStatus.classList.add(type);
}

function unlock(userId) {
  sessionStorage.setItem('love-core-unlocked', '1');
  sessionStorage.setItem('love-core-user', userId);
  document.body.classList.remove('locked');
  document.body.classList.add('unlocked');
  el.appMain.setAttribute('aria-hidden', 'false');
  el.pinGate.setAttribute('aria-hidden', 'true');
  setStatus('ปลดล็อกสำเร็จ', 'success');
  startCounters();
}

function validatePin(pin) {
  return HARDCODED_USERS.find((user) => user.pin === pin);
}

function submitPin() {
  const pin = el.loginPin.value;
  if (pin.length < 4) {
    setStatus('PIN ต้องมี 4 หลัก', 'error');
    return;
  }
  const user = validatePin(pin);
  if (!user) {
    el.loginPin.value = '';
    applyPinDots();
    setStatus('PIN ไม่ถูกต้อง', 'error');
    return;
  }
  unlock(user.userId);
}

function setupPinGate() {
  const unlocked = sessionStorage.getItem('love-core-unlocked') === '1';
  if (unlocked) {
    const userId = sessionStorage.getItem('love-core-user') || HARDCODED_USERS[0]?.userId || 'guest';
    unlock(userId);
    return;
  }

  el.pinPad.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const digit = button.dataset.digit;
    if (digit && el.loginPin.value.length < 4) {
      el.loginPin.value += digit;
      applyPinDots();
      setStatus('');
      if (el.loginPin.value.length === 4) submitPin();
      return;
    }

    if (button === el.pinClearBtn) {
      el.loginPin.value = '';
      applyPinDots();
      setStatus('ล้าง PIN แล้ว');
      return;
    }

    if (button === el.pinBackspaceBtn) {
      el.loginPin.value = el.loginPin.value.slice(0, -1);
      applyPinDots();
    }
  });

  el.loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitPin();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key >= '0' && event.key <= '9' && el.loginPin.value.length < 4) {
      el.loginPin.value += event.key;
      applyPinDots();
      if (el.loginPin.value.length === 4) submitPin();
    }
    if (event.key === 'Backspace') {
      el.loginPin.value = el.loginPin.value.slice(0, -1);
      applyPinDots();
    }
    if (event.key === 'Escape') {
      el.loginPin.value = '';
      applyPinDots();
    }
  });

  applyPinDots();
}

function getNextAnniversary(base, now = new Date()) {
  const month = base.getMonth();
  const date = base.getDate();
  const hours = base.getHours();
  const minutes = base.getMinutes();
  const seconds = base.getSeconds();

  let candidate = new Date(now.getFullYear(), month, date, hours, minutes, seconds);
  if (candidate <= now) {
    candidate = new Date(now.getFullYear() + 1, month, date, hours, minutes, seconds);
  }
  return candidate;
}

function startCounters() {
  el.coupleSince.textContent = `เริ่มคบกัน: ${formatThaiDate(START)}`;

  function tick() {
    const now = new Date();

    const relationshipMs = Math.max(0, now.getTime() - START.getTime());
    const total = Math.floor(relationshipMs / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    el.days.textContent = pad(d, 3);
    el.hours.textContent = pad(h);
    el.minutes.textContent = pad(m);
    el.seconds.textContent = pad(s);

    const nextAnniversary = getNextAnniversary(ANNIVERSARY_BASE, now);
    const countdownSec = Math.max(0, Math.floor((nextAnniversary.getTime() - now.getTime()) / 1000));
    const ad = Math.floor(countdownSec / 86400);
    const ah = Math.floor((countdownSec % 86400) / 3600);
    const am = Math.floor((countdownSec % 3600) / 60);
    const as = countdownSec % 60;

    el.annivDays.textContent = pad(ad, 3);
    el.annivHours.textContent = pad(ah);
    el.annivMinutes.textContent = pad(am);
    el.annivSeconds.textContent = pad(as);
    el.anniversaryDateLabel.textContent = `วันครบรอบถัดไป: ${formatThaiDate(nextAnniversary)}`;
  }

  tick();
  window.setInterval(tick, 1000);
}

function setupLoveCards() {
  let current = 0;
  el.newCardBtn.addEventListener('click', () => {
    current = (current + 1 + Math.floor(Math.random() * (loveCards.length - 1))) % loveCards.length;
    el.loveCardMessage.textContent = loveCards[current];
  });
}

setupPinGate();
setupLoveCards();
