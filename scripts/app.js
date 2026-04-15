const CFG = {
  PIN: '0614',
  START: new Date('2024-06-14T00:00:00'),
  HER_NAME: 'ที่รัก'
};

const CARD_DATA = [
  ['🌸', 'วันนี้', 'วันนี้มีเธออยู่ ทุกอย่างดูสดใสขึ้นมาก'],
  ['💕', 'ความรัก', 'รักเธอมากกว่า ที่จะบรรยายเป็นคำพูดได้เลย'],
  ['✨', 'ความฝัน', 'เธอคือความฝัน ที่กลายเป็นความจริงของฉัน'],
  ['🙏', 'ขอบคุณ', 'ขอบคุณที่เลือกฉัน ขอบคุณที่รักฉัน ขอบคุณที่มีอยู่'],
  ['🌙', 'สัญญา', 'สัญญาว่าจะอยู่เคียงข้างเธอทุกวัน ทุกคืน ไม่ว่าจะเกิดอะไรขึ้น'],
  ['🌍', 'โลก', 'โลกนี้สวยขึ้นมาก เพราะมีเธออยู่ในนั้น'],
  ['💗', 'หัวใจ', 'ทุกการเต้นของหัวใจฉัน มีชื่อเธออยู่ด้วย'],
  ['⭐', 'ดาว', 'เธอคือดาวที่สว่างที่สุด ในชีวิตฉัน']
];

const RAIN_MSGS = ['รักเธอมาก 💕', 'คิดถึงเธอ 🌸', 'ขอบคุณที่มาเป็นของฉัน 💝', 'เธอทำให้โลกสวยขึ้น 🌍', 'อยากกอดเธอ 🤗'];

let pinVal = '';
let curPage = 'pin';
let rainCount = 0;
let homeTimer;
let fpState = 'idle';

function qs(id) { return document.getElementById(id); }
function pad(n) { return String(n).padStart(2, '0'); }

function toast(msg) {
  const t = qs('toast');
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2000);
}

function renderPin() {
  document.querySelectorAll('.pd').forEach((el, i) => el.classList.toggle('on', i < pinVal.length));
  const shown = pinVal.split('').map(() => '•').join(' ');
  qs('pinTyped').textContent = `รหัส: ${shown || '_ _ _ _'}`;
}

function checkPin() {
  if (pinVal !== CFG.PIN) {
    qs('pinErr').textContent = 'PIN ไม่ถูกต้อง ลองใหม่อีกครั้งนะ';
    pinVal = '';
    renderPin();
    if (navigator.vibrate) navigator.vibrate([80, 20, 80]);
    return;
  }

  qs('pg-pin').classList.remove('active');
  qs('mainNav').style.display = 'flex';
  go('home');
  initHome();
}

function initKeypad() {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  const wrap = qs('keypad');
  keys.forEach((k) => {
    const btn = document.createElement('button');
    btn.className = 'kb';
    btn.textContent = k;
    if (!k) {
      btn.style.visibility = 'hidden';
    } else {
      btn.addEventListener('click', () => {
        qs('pinErr').textContent = '';
        if (k === '⌫') pinVal = pinVal.slice(0, -1);
        else if (pinVal.length < 4) pinVal += k;
        renderPin();
        if (pinVal.length === 4) setTimeout(checkPin, 120);
      });
    }
    wrap.appendChild(btn);
  });
}

function go(page) {
  document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));
  qs(`pg-${page}`).classList.add('active');
  document.querySelectorAll('.ni').forEach((el) => el.classList.toggle('on', el.dataset.page === page));
  curPage = page;
  if (page !== 'home') clearInterval(homeTimer);
  if (page === 'home') initHome();
  if (page === 'hyper') startWarp();
  if (page === 'finger') resetFinger();
}

function initHome() {
  qs('homeTitle').textContent = `สวัสดี${CFG.HER_NAME} 🌸`;
  updateHome();
  clearInterval(homeTimer);
  homeTimer = setInterval(updateHome, 1000);
}

function updateHome() {
  const now = new Date();
  const diff = now - CFG.START;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor(diff / 1000);

  qs('daysNum').textContent = days.toLocaleString('th-TH');
  qs('durD').textContent = days.toLocaleString('th-TH');
  qs('durH').textContent = hours.toLocaleString('th-TH');
  qs('durM').textContent = mins.toLocaleString('th-TH');
  qs('durS').textContent = secs.toLocaleString('th-TH');

  qs('stM').textContent = `${Math.floor(days / 30)} เดือน`;
  qs('stN').textContent = `${days} คืน`;
  qs('stMr').textContent = `${days} เช้า`;

  const d = CFG.START.getDate();
  let next = new Date(now.getFullYear(), now.getMonth(), d, CFG.START.getHours(), CFG.START.getMinutes(), CFG.START.getSeconds());
  if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, d, CFG.START.getHours(), CFG.START.getMinutes(), CFG.START.getSeconds());
  const left = next - now;

  qs('cdD').textContent = pad(Math.floor(left / 86400000));
  qs('cdH').textContent = pad(Math.floor((left % 86400000) / 3600000));
  qs('cdM').textContent = pad(Math.floor((left % 3600000) / 60000));
  qs('cdS').textContent = pad(Math.floor((left % 60000) / 1000));

  const thYear = CFG.START.getFullYear() + 543;
  qs('daysSince').textContent = `เริ่มคบกันตั้งแต่ ${CFG.START.getDate()}/${CFG.START.getMonth() + 1}/${thYear}`;
}

function initCards() {
  const grid = qs('cardsGrid');
  CARD_DATA.forEach(([emoji, title, text]) => {
    const card = document.createElement('button');
    card.className = 'fc';
    card.innerHTML = `<div><div class="emoji">${emoji}</div><h4>${title}</h4></div>`;
    card.addEventListener('click', () => openCard(title, text));
    grid.appendChild(card);
  });

  qs('modalClose').addEventListener('click', closeCard);
  qs('modalBtn').addEventListener('click', closeCard);
}

function openCard(title, text) {
  qs('modalTitle').textContent = title;
  qs('modalText').textContent = text;
  qs('cardModal').classList.add('show');
}
function closeCard() { qs('cardModal').classList.remove('show'); }

function spawnRain() {
  const particle = document.createElement('div');
  particle.className = 'rain-particle';
  particle.style.left = `${8 + Math.random() * 84}%`;
  particle.style.setProperty('--dur', `${2.2 + Math.random() * 1.8}s`);
  particle.textContent = RAIN_MSGS[Math.floor(Math.random() * RAIN_MSGS.length)];
  qs('rainLayer').appendChild(particle);
  particle.addEventListener('animationend', () => particle.remove());
}

function doRain() {
  rainCount += 1;
  qs('rainCount').textContent = `กดไปแล้ว: ${rainCount} ครั้ง`;
  for (let i = 0; i < 16; i += 1) {
    setTimeout(spawnRain, i * 90);
  }
}

let warpRAF = null;
let stars = [];
function startWarp() {
  const cv = qs('hCanvas');
  const ctx = cv.getContext('2d');
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  stars = Array.from({ length: 220 }, () => ({
    x: (Math.random() - 0.5) * cv.width * 2,
    y: (Math.random() - 0.5) * cv.height * 2,
    z: Math.random() * cv.width
  }));
  qs('hMsgs').classList.add('vis');
  cancelAnimationFrame(warpRAF);

  const draw = () => {
    ctx.fillStyle = 'rgba(16,2,13,0.35)';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const cx = cv.width / 2;
    const cy = cv.height / 2;
    stars.forEach((s) => {
      s.z -= 8;
      if (s.z <= 1) s.z = cv.width;
      const sx = (s.x / s.z) * cv.width + cx;
      const sy = (s.y / s.z) * cv.height + cy;
      ctx.fillStyle = '#ffd1e0';
      ctx.fillRect(sx, sy, 2, 2);
    });
    if (curPage === 'hyper') warpRAF = requestAnimationFrame(draw);
  };
  draw();
}

function resetFinger() {
  fpState = 'idle';
  qs('fpMsg').classList.remove('show');
  qs('fpHint').textContent = 'แตะเพื่อสแกนลายนิ้วมือ 👆';
}

function doScan() {
  if (fpState !== 'idle') return;
  fpState = 'scanning';
  qs('fpHint').textContent = 'กำลังสแกน...';
  setTimeout(() => {
    qs('fpHint').textContent = '✓ ระบุตัวตนสำเร็จ';
    qs('fpMsg').classList.add('show');
    fpState = 'done';
    toast('เข้าสู่โหมดหัวใจแล้ว 💖');
  }, 1200);
}

function bindEvents() {
  document.querySelectorAll('.ni').forEach((el) => {
    el.addEventListener('click', () => go(el.dataset.page));
  });
  qs('rainBtn').addEventListener('click', doRain);
  qs('fpZone').addEventListener('click', doScan);
  qs('hRestart').addEventListener('click', startWarp);
  window.addEventListener('resize', () => { if (curPage === 'hyper') startWarp(); });
}

initKeypad();
initCards();
bindEvents();
renderPin();
