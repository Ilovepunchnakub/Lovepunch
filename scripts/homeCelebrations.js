// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/homeCelebrations.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { wait } from './utils.js';
import { spawnHourEffects } from './hourMilestoneFx.js';

export function createHourCelebration() {
  let lock = false;

  async function show(cardEl, hourCount) {
    if (!cardEl || lock) return;
    lock = true;

    const badge = document.createElement('div');
    badge.className = 'hour-wow-badge';
    badge.textContent = `ครบ ${hourCount.toLocaleString('th-TH')} ชั่วโมงแล้ว 🎉`;
    cardEl.appendChild(badge);

    // เอฟเฟกต์หลัก: ประกาย + ring + flash เพื่อให้ดู wow มากขึ้น
    spawnHourEffects(cardEl);

    for (let i = 0; i < 18; i += 1) {
      const sparkle = document.createElement('span');
      sparkle.className = 'hour-wow-spark';
      sparkle.textContent = i % 2 === 0 ? '💖' : '✨';
      sparkle.style.setProperty('--x', `${-44 + Math.random() * 88}px`);
      sparkle.style.setProperty('--y', `${-90 - Math.random() * 140}px`);
      sparkle.style.setProperty('--delay', `${i * 20}ms`);
      cardEl.appendChild(sparkle);
      sparkle.addEventListener('animationend', () => sparkle.remove());
    }

    await wait(2400);
    badge.classList.add('out');
    await wait(500);
    badge.remove();
    lock = false;
  }

  return { show };
}
