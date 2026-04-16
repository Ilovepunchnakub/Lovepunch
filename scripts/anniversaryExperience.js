import { wait } from './utils.js';

export function createAnniversaryExperience({ blessings }) {
  const overlay = document.getElementById('annivOverlay');
  const countBox = document.getElementById('annivCountBox');
  const counter = document.getElementById('annivCountdown');
  const popup = document.getElementById('annivPopup');
  const text = document.getElementById('annivTypedText');
  const exit = document.getElementById('annivExitHint');

  let active = false;
  let completed = false;
  let unlockedClose = false;

  function pickBlessing() {
    return blessings[Math.floor(Math.random() * blessings.length)] || 'สุขสันต์วันครบรอบนะคนเก่งของฉัน 💕';
  }

  function setStage(stage) {
    if (!overlay) return;
    overlay.classList.toggle('countdown-mode', stage === 'countdown');
    overlay.classList.toggle('popup-mode', stage === 'popup');
  }

  async function typeText(message) {
    text.textContent = '';
    for (let i = 0; i < message.length; i += 1) {
      text.textContent += message[i];
      await wait(40 + Math.random() * 22);
    }
  }

  async function revealPopup() {
    setStage('popup');
    popup.classList.add('show');
    await typeText(pickBlessing());

    for (let i = 3; i >= 1; i -= 1) {
      exit.textContent = `แตะที่ไหนก็ได้เพื่อปิด (พร้อมใน ${i} วินาที)`;
      await wait(1000);
    }

    unlockedClose = true;
    exit.textContent = 'แตะที่ไหนก็ได้เพื่อกลับสู่หน้าแรก 💫';
  }

  function close() {
    if (!active || !unlockedClose) return;
    overlay.classList.remove('show');
    popup.classList.remove('show');
    setStage('countdown');
    document.body.classList.remove('anniv-focus');
    active = false;
  }

  async function runCountdownAndPopup() {
    popup.classList.remove('show');
    text.textContent = '';
    exit.textContent = 'เตรียมแสดงข้อความ...';

    document.body.classList.add('anniv-focus');
    overlay.classList.add('show');
    setStage('countdown');

    for (let sec = 10; sec >= 0; sec -= 1) {
      counter.textContent = sec.toString().padStart(2, '0');
      counter.classList.remove('pulse');
      void counter.offsetWidth;
      counter.classList.add('pulse');
      await wait(1000);
    }

    await revealPopup();
  }

  async function startSequence({ markCompleted }) {
    if (active) return;

    active = true;
    unlockedClose = false;
    if (markCompleted) completed = true;

    await runCountdownAndPopup();
  }

  function tick(leftMs) {
    if (leftMs <= 10_000 && !completed) {
      startSequence({ markCompleted: true });
    } else if (leftMs > 25_000) {
      completed = false;
    }
  }

  function playTestCountdown() {
    startSequence({ markCompleted: false });
  }

  function init() {
    overlay?.addEventListener('click', close);
    countBox?.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    popup?.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  return { init, tick, playTestCountdown };
}
