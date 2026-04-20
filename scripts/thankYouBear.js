// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/thankYouBear.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { qs } from './utils.js';
import { renderThankYouBear } from './thankYouBear/template.js';
import { initThankYouBearScene } from './thankYouBear/scene.js';

export function createThankYouBearPage({ navigator }) {
  const pageId = 'thanks';
  const host = qs('thanksBearRoot');
  const closeBtn = qs('thanksBearClose');
  let destroyScene = null;

  function mountScene() {
    if (!host) return;
    destroyScene?.();
    host.innerHTML = renderThankYouBear();

    const wrapper = host.querySelector('[data-thanks-wrapper]');
    const bearEl = host.querySelector('[data-thanks-bear]');

    if (!wrapper || !bearEl) return;
    destroyScene = initThankYouBearScene({ wrapper, bearEl });
  }

  function close({ navigate = true } = {}) {
    destroyScene?.();
    destroyScene = null;
    if (host) host.innerHTML = '';

    if (navigate && navigator.current() === pageId) {
      navigator.go('home', { skipLoader: true });
    }
  }

  function open() {
    navigator.go(pageId).then(() => {
      if (navigator.current() === pageId) mountScene();
    });
  }

  function init() {
    closeBtn?.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (navigator.current() !== pageId) return;
      event.preventDefault();
      close();
    });
  }

  return {
    init,
    open,
    close,
    destroy: () => close({ navigate: false })
  };
}
