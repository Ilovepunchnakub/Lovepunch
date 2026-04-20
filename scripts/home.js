// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/home.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

import { CFG } from './config.js';
import { qs, pad, toast } from './utils.js';
import { createHourCelebration } from './homeCelebrations.js';
import { createAnniversaryExperience } from './anniversaryExperience.js';
import { attachSecretTapTest } from './homeSecretTests.js';
import { mountHomeLoveAnimation } from './homeLoveAnimation.js';

export function createHomeController() {
  let timer;
  let lastHourMilestone = -1;
  let detachDurationSecret = () => {};
  let detachCountdownSecret = () => {};

  const hourCelebration = createHourCelebration();
  const anniversary = createAnniversaryExperience({ blessings: CFG.ANNIV_BLESSINGS });

  function updateHome() {
    const now = new Date();
    const diff = Math.max(0, now - CFG.START);

    const totalDays = Math.ceil(diff / 86400000);
    const dayFloor = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const totalHours = Math.floor(diff / 3600000);

    qs('durD').textContent = totalDays.toLocaleString('th-TH');
    qs('durH').textContent = hours.toLocaleString('th-TH');
    qs('durM').textContent = mins.toLocaleString('th-TH');
    qs('durS').textContent = secs.toLocaleString('th-TH');

    if (totalHours > 0 && totalHours !== lastHourMilestone) {
      hourCelebration.show(document.querySelector('.days-card'), totalHours);
      lastHourMilestone = totalHours;
    }

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

    anniversary.tick(left);

    const thYear = CFG.START.getFullYear() + 543;
    qs('daysSince').textContent = `เริ่มคบกันตั้งแต่ ${CFG.START.getDate()}/${CFG.START.getMonth() + 1}/${thYear}`;
  }

  function closeProfile() {
    document.body.classList.remove('profile-open');
    qs('profilePanel').classList.remove('show');
  }

  // แสดง/ซ่อนปุ่ม My Love Profile เฉพาะหน้าแรก
  function setProfileToggleVisibility(visible) {
    const toggle = qs('profileToggle');
    if (!toggle) return;
    toggle.hidden = !visible;
    toggle.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function fillProfile() {
    mountHomeLoveAnimation(qs('homeTitle'), `สวัสดี${CFG.HER_NAME} 🌸`);
    Object.entries(CFG.PROFILE).forEach(([key, value]) => {
      const el = qs(`pf-${key}`);
      if (el) el.textContent = value;
    });

    qs('profileToggle').addEventListener('click', (e) => {
      e.stopPropagation();
      const opened = document.body.classList.toggle('profile-open');
      qs('profilePanel').classList.toggle('show', opened);
    });

    document.addEventListener('pointerdown', (e) => {
      if (!document.body.classList.contains('profile-open')) return;
      if (e.target.closest('#profilePanel') || e.target.closest('#profileToggle')) return;
      closeProfile();
    });
  }

  function initSecretTests() {
    const durationCard = document.querySelector('.days-card');
    const countdownCard = document.querySelector('.countdown-card');

    detachDurationSecret = attachSecretTapTest({
      element: durationCard,
      onTrigger: () => {
        toast('ปลดล็อกเอฟเฟกต์สำเร็จ ✨');
        hourCelebration.show(durationCard, 1);
      },
      onProgress: ({ count, target }) => {
        if (!count || count >= target) return;
        if (count === 1 || count % 3 === 0) {
          toast(`ทดสอบเอฟเฟกต์: ${count}/${target}`);
        }
      }
    });

    detachCountdownSecret = attachSecretTapTest({
      element: countdownCard,
      onTrigger: () => {
        toast('เริ่มนับถอยหลังทดสอบแล้ว 💫');
        anniversary.playTestCountdown();
      },
      onProgress: ({ count, target }) => {
        if (!count || count >= target) return;
        if (count === 1 || count % 3 === 0) {
          toast(`ทดสอบนับถอยหลัง: ${count}/${target}`);
        }
      }
    });
  }

  function start() {
    setProfileToggleVisibility(true);
    updateHome();
    clearInterval(timer);
    timer = setInterval(updateHome, 1000);
  }

  function stop() {
    setProfileToggleVisibility(false);
    clearInterval(timer);
    closeProfile();
  }

  function closeTransientLayers() {
    anniversary.close({ force: true, restoreFocus: false });
    closeProfile();
  }

  function init() {
    fillProfile();
    anniversary.init();
    initSecretTests();
    start();
  }

  function destroy() {
    detachDurationSecret();
    detachCountdownSecret();
  }

  return { init, start, stop, closeProfile, destroy, closeTransientLayers };
}
