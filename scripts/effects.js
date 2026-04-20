// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/effects.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
export function initInteractionEffects() {
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#lovePlayWrap')) return;

    // ตัด .fc ออกเพราะลบระบบการ์ดแล้ว
    const target = e.target.closest('button, .soft-card, .ni');
    if (!target) return;

    target.classList.add('tap-pop');
    setTimeout(() => target.classList.remove('tap-pop'), 240);

    const burst = document.createElement('span');
    burst.className = 'click-burst';
    burst.style.left = `${e.clientX}px`;
    burst.style.top = `${e.clientY}px`;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 520);
  });
}
