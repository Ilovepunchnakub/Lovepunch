// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/homeSecretTests.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
const TAP_TARGET = 10;
const RESET_MS = 12000;

export function attachSecretTapTest({ element, onTrigger, onProgress }) {
  if (!element || typeof onTrigger !== 'function') return () => {};

  let tapCount = 0;
  let resetTimer = null;

  const notifyProgress = () => {
    if (typeof onProgress === 'function') {
      onProgress({ count: tapCount, target: TAP_TARGET });
    }
  };

  const resetCounter = () => {
    tapCount = 0;
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    notifyProgress();
  };

  const queueReset = () => {
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      resetCounter();
    }, RESET_MS);
  };

  const onTap = () => {
    tapCount += 1;
    notifyProgress();

    if (tapCount >= TAP_TARGET) {
      resetCounter();
      onTrigger();
      return;
    }

    queueReset();
  };

  element.addEventListener('pointerdown', onTap);

  return () => {
    resetCounter();
    element.removeEventListener('pointerdown', onTap);
  };
}
