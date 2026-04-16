import { wait } from './utils.js';

export function createHourCelebration() {
  let lock = false;

  async function show(cardEl, hourCount) {
    if (!cardEl || lock) return;
    lock = true;

    const badge = document.createElement('div');
    badge.className = 'hour-wow-badge';
    badge.textContent = `ครบ ${hourCount.toLocaleString('th-TH')} ชั่วโมงแล้ว 🎉`;
    cardEl.appendChild(badge);

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

    await wait(2100);
    badge.classList.add('out');
    await wait(500);
    badge.remove();
    lock = false;
  }

  return { show };
}
