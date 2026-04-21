// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/hourMilestoneFx.js =====
// หน้าที่หลัก:
// - รวมเอฟเฟกต์ประกอบช่วงครบรอบทุก 1 ชั่วโมง (confetti, glow ring, badge)
// - แยกจาก homeCelebrations.js เพื่อคงโครงสร้างแบบ modular
// =============================================

export function spawnHourEffects(cardEl) {
  if (!cardEl) return;

  const flash = document.createElement('span');
  flash.className = 'hour-wow-flash';
  cardEl.appendChild(flash);

  const ring = document.createElement('span');
  ring.className = 'hour-wow-ring';
  cardEl.appendChild(ring);

  for (let i = 0; i < 24; i += 1) {
    const confetti = document.createElement('span');
    confetti.className = 'hour-wow-confetti';
    confetti.textContent = i % 3 === 0 ? '💖' : i % 3 === 1 ? '✨' : '💫';
    const theta = (i / 24) * Math.PI * 2;
    const dist = 80 + Math.random() * 130;
    confetti.style.setProperty('--theta', `${(i / 24) * 360}deg`);
    confetti.style.setProperty('--x', `${Math.cos(theta) * dist}px`);
    confetti.style.setProperty('--y', `${Math.sin(theta) * dist}px`);
    confetti.style.setProperty('--delay', `${Math.round(Math.random() * 130)}ms`);
    cardEl.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove());
  }

  flash.addEventListener('animationend', () => flash.remove());
  ring.addEventListener('animationend', () => ring.remove());
}
