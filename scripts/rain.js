import { CFG } from './config.js';
import { qs, wait } from './utils.js';

export function createRainController() {
  let rainCount = 0;

  function spawnRain() {
    const particle = document.createElement('button');
    particle.className = 'rain-particle';
    particle.style.left = `${8 + Math.random() * 84}%`;
    particle.style.setProperty('--dur', `${7 + Math.random() * 2.8}s`);
    particle.style.setProperty('--delay', `${Math.random() * 0.35}s`);
    particle.textContent = CFG.RAIN_MSGS[Math.floor(Math.random() * CFG.RAIN_MSGS.length)];
    qs('rainLayer').appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }

  async function doRain() {
    const btn = qs('rainBtn');
    btn.disabled = true;
    btn.classList.add('loading');
    qs('rainStatus').textContent = 'กำลังเตรียมความรักให้...';
    document.body.classList.add('rain-focus');
    await wait(800);

    rainCount += 1;
    qs('rainCount').textContent = `กดไปแล้ว: ${rainCount} ครั้ง`;
    qs('rainStatus').textContent = 'พร้อมส่งข้อความรอบถัดไปแล้ว';

    for (let i = 0; i < 12; i += 1) {
      setTimeout(spawnRain, i * 250);
    }

    setTimeout(() => document.body.classList.remove('rain-focus'), 9300);
    btn.classList.remove('loading');
    btn.disabled = false;
  }

  function init() {
    qs('rainBtn').addEventListener('click', doRain);
  }

  return { init };
}
