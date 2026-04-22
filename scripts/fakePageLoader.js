// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/fakePageLoader.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { wait, qs } from './utils.js';

const SEGMENT_COUNT = 30;

function createOverlayLoader(overlayId, { buildSegments = false } = {}) {
  const overlay = qs(overlayId);
  const cat = overlay?.querySelector('[data-loader-cat]');
  let lockCount = 0;

  if (buildSegments && cat && cat.children.length === 0) {
    for (let i = 0; i < SEGMENT_COUNT; i += 1) {
      const segment = document.createElement('span');
      segment.className = 'fake-loader-cat__segment';
      segment.style.setProperty('--delay', `${(i * 0.02).toFixed(2)}s`);
      segment.style.setProperty('--angle', `${(-20 + i * (40 / (SEGMENT_COUNT - 1))).toFixed(4)}deg`);
      cat.appendChild(segment);
    }
  }

  function applyState() {
    if (!overlay) return;
    const show = lockCount > 0;
    overlay.classList.toggle('show', show);
    overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function show() {
    lockCount += 1;
    applyState();
  }

  function hide() {
    lockCount = Math.max(0, lockCount - 1);
    applyState();
  }

  async function run({ minMs = 1400, beforeSwitch } = {}) {
    show();
    try {
      beforeSwitch?.();
      await wait(minMs);
    } finally {
      hide();
    }
  }

  return {
    show,
    hide,
    run,
    isVisible: () => lockCount > 0
  };
}

export function createFakePageLoader() {
  return createOverlayLoader('globalFakeLoader', { buildSegments: true });
}

export function createEntryCompletionLoader() {
  return createOverlayLoader('entryCompletionLoader');
}
