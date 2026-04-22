// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/effects.js =====
// หน้าที่หลัก:
// - รวมเอฟเฟกต์ interaction ตอนแตะ/คลิกให้ใช้งานได้ทั้งมือถือและคอม
// - แยกค่า configurable ของอีโมจิ/ข้อความไปไว้ที่ clickEffectConfig.js เพื่อแก้ง่าย
// =============================================
import { CLICK_EFFECT_CONFIG as FX } from './clickEffectConfig.js';

function randomIn(min, max) {
  return min + Math.random() * (max - min);
}

function spawnParticles(x, y) {
  for (let i = 0; i < FX.particleCount; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'click-particle';
    particle.textContent = FX.particleEmojis[Math.floor(Math.random() * FX.particleEmojis.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = randomIn(FX.particleDistance.min, FX.particleDistance.max);

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--rot', `${randomIn(-180, 180)}deg`);
    particle.style.setProperty('--dur', `${randomIn(FX.particleDuration.min, FX.particleDuration.max)}s`);
    particle.style.fontSize = `${randomIn(14, 28)}px`;

    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }
}

function spawnRipple(x, y) {
  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.setProperty('--dur-ms', `${FX.rippleDurationMs}ms`);
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function spawnMessage(x, y) {
  if (Math.random() > FX.messageChance) return;

  const msg = document.createElement('span');
  msg.className = 'click-msg';
  msg.textContent = FX.floatingMessages[Math.floor(Math.random() * FX.floatingMessages.length)];
  msg.style.left = `${x + randomIn(-20, 20)}px`;
  msg.style.top = `${y - 22}px`;

  document.body.appendChild(msg);
  msg.addEventListener('animationend', () => msg.remove());
}

function ensurePointerCursor() {
  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!supportsFinePointer) return;

  const cursor = document.createElement('div');
  cursor.id = 'fxCursor';
  cursor.className = 'fx-cursor';
  cursor.textContent = FX.cursorEmoji;
  document.body.appendChild(cursor);

  document.addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  }, { passive: true });
}

export function initInteractionEffects() {
  ensurePointerCursor();

  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#lovePlayWrap')) return;

    const target = e.target.closest('button, .soft-card, .ni');
    if (!target) return;

    target.classList.add('tap-pop');
    setTimeout(() => target.classList.remove('tap-pop'), 240);

    spawnParticles(e.clientX, e.clientY);
    spawnRipple(e.clientX, e.clientY);
    spawnMessage(e.clientX, e.clientY);
  });
}
