// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/home.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { CFG } from './config.js';
import { qs, pad } from './utils.js';
import { createHourCelebration } from './homeCelebrations.js';
import { createAnniversaryExperience } from './anniversaryExperience.js';
import { mountHomeLoveAnimation } from './homeLoveAnimation.js';
import { TEXT_CONTENT } from './siteTextContent.js';

export function createHomeController() {
  let timer;
  let lastHourMilestone = -1;

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

    qs('stM').textContent = TEXT_CONTENT.app.home.monthStat(Math.floor(dayFloor / 30));
    qs('stN').textContent = TEXT_CONTENT.app.home.nightStat(totalDays);
    qs('stMr').textContent = TEXT_CONTENT.app.home.morningStat(totalDays);

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
    qs('daysSince').textContent = TEXT_CONTENT.app.home.daysSince(CFG.START.getDate(), CFG.START.getMonth() + 1, thYear);
  }

  function closeProfile() {
    document.body.classList.remove('profile-open');
    qs('profilePanel').classList.remove('show');
    const toggle = qs('profileToggle');
    if (toggle) toggle.checked = false;
  }

  // แสดง/ซ่อนปุ่ม My Love Profile เฉพาะหน้าแรก
  function setProfileToggleVisibility(visible) {
    const toggleWrap = qs('profileToggleWrap');
    if (!toggleWrap) return;
    toggleWrap.hidden = !visible;
    toggleWrap.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function fillProfile() {
    mountHomeLoveAnimation(qs('homeTitle'), TEXT_CONTENT.app.home.greeting(CFG.HER_NAME));
    Object.entries(CFG.PROFILE).forEach(([key, value]) => {
      const el = qs(`pf-${key}`);
      if (el) el.textContent = value;
    });

    qs('profileToggle').addEventListener('change', (e) => {
      e.stopPropagation();
      const opened = Boolean(e.target?.checked);
      document.body.classList.toggle('profile-open', opened);
      qs('profilePanel').classList.toggle('show', opened);
    });

    document.addEventListener('pointerdown', (e) => {
      if (!document.body.classList.contains('profile-open')) return;
      if (e.target.closest('#profilePanel') || e.target.closest('#profileToggleWrap')) return;
      closeProfile();
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
    start();
  }

  function destroy() {}

  return { init, start, stop, closeProfile, destroy, closeTransientLayers };
}
