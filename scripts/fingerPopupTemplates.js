// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/fingerPopupTemplates.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
export function loadingMarkup() {
  return `
    <div class="scan-shell wow">
      <div class="scan-radar-wrap">
        <canvas class="scan-radar-canvas" id="scanRadarCanvas" width="320" height="320"></canvas>
        <div class="scan-radar-grid" aria-hidden="true"></div>
        <p class="scan-percent" id="scanPercent">0%</p>
      </div>
      <div class="scan-meter"><span id="scanMeterBar"></span></div>
      <p class="scan-tip">กำลังตรวจสอบโหมดลับแบบเรียลไทม์... โปรดรอสักครู่</p>
      <section class="scan-log-panel" aria-live="polite">
        <p class="scan-log-title">SYSTEM LOG</p>
        <ul class="scan-log" id="scanLog"></ul>
      </section>
    </div>`;
}

export function completeMarkup() {
  return `
    <div class="scan-complete">
      <div class="complete-badge">✔ ผ่านการยืนยัน</div>
      <p id="fpCountdown" class="scan-tip">แตะจอเพื่อปิดได้ใน 3 วิ...</p>
      <p class="long-love">ขอบคุณที่อยู่กับฉันในทุกช่วงเวลา ทั้งวันที่เก่งและวันที่อ่อนล้า เธอทำให้คำว่าบ้านมีความหมายมากขึ้นทุกวัน ฉันอยากใช้ทุกเช้าทุกคืนไปกับเธอ อยากเติบโตไปด้วยกัน และอยากจับมือเธอไปเรื่อยๆ ไม่ว่าโลกจะเปลี่ยนไปแค่ไหน รักเธอที่สุดนะคนเก่งของฉัน 🤍</p>
    </div>`;
}
