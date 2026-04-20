// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/clickSound.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

// ตัวเลือก element ที่ถือว่า "กดได้"
const CLICKABLE_SELECTOR = 'button, .soft-btn, .ni, .profile-toggle';

export function initClickSound() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  let lastPlay = 0;

  // โทนเสียงนุ่ม ๆ คล้ายหยดน้ำ (water drop)
  const playWaterDrop = () => {
    const now = performance.now();
    if (now - lastPlay < 55) return;
    lastPlay = now;

    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1200, t);
    lowpass.Q.setValueAtTime(1.25, t);

    const oscMain = ctx.createOscillator();
    oscMain.type = 'sine';
    oscMain.frequency.setValueAtTime(760, t);
    oscMain.frequency.exponentialRampToValueAtTime(420, t + 0.18);

    const oscBody = ctx.createOscillator();
    oscBody.type = 'triangle';
    oscBody.frequency.setValueAtTime(420, t);
    oscBody.frequency.exponentialRampToValueAtTime(260, t + 0.22);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, t);
    subGain.gain.exponentialRampToValueAtTime(0.03, t + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);

    oscMain.connect(master);
    oscBody.connect(subGain);

    master.connect(lowpass);
    subGain.connect(lowpass);
    lowpass.connect(ctx.destination);

    oscMain.start(t);
    oscBody.start(t + 0.008);
    oscMain.stop(t + 0.24);
    oscBody.stop(t + 0.28);
  };

  document.addEventListener('pointerdown', (event) => {
    const clickable = event.target.closest(CLICKABLE_SELECTOR);
    if (!clickable) return;
    playWaterDrop();
  });
}
