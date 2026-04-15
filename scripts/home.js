import { CFG } from './config.js';
import { qs, pad } from './utils.js';

export function createHomeController() {
  let timer;

  function updateHome() {
    const now = new Date();
    const diff = Math.max(0, now - CFG.START);

    const totalDays = Math.ceil(diff / 86400000);
    const dayFloor = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    qs('durD').textContent = totalDays.toLocaleString('th-TH');
    qs('durH').textContent = hours.toLocaleString('th-TH');
    qs('durM').textContent = mins.toLocaleString('th-TH');
    qs('durS').textContent = secs.toLocaleString('th-TH');

    qs('stM').textContent = `${Math.floor(dayFloor / 30)} เดือน`;
    qs('stN').textContent = `${totalDays} คืน`;
    qs('stMr').textContent = `${totalDays} เช้า`;

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

  function fillProfile() {
    qs('homeTitle').textContent = `สวัสดี${CFG.HER_NAME} 🌸`;
    Object.entries(CFG.PROFILE).forEach(([key, value]) => {
      const el = qs(`pf-${key}`);
      if (el) el.textContent = value;
    });

    qs('profileToggle').addEventListener('click', () => {
      const opened = document.body.classList.toggle('profile-open');
      qs('profilePanel').classList.toggle('show', opened);
    });
  }

  function start() {
    updateHome();
    clearInterval(timer);
    timer = setInterval(updateHome, 1000);
  }

  function stop() {
    clearInterval(timer);
  }

  function init() {
    fillProfile();
    start();
  }

  return { init, start, stop };
}
