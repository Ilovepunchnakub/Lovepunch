// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/loveLetter/template.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { LOVE_LETTER_CONTENT } from './content.js';

export function renderLoveLetter() {
  return `
    <section class="love-letter" data-love-letter>
      <div class="ll-envelope-screen" data-envelope-screen role="button" tabindex="0" aria-label="เปิดจดหมาย">
        <img src="assets/images/love-letter/envelope.svg" alt="ซองจดหมาย" class="ll-envelope-img" />
        <p class="ll-envelope-text">${LOVE_LETTER_CONTENT.envelopeLabel}</p>
      </div>

      <div class="ll-letter-screen" data-letter-screen aria-hidden="true">
        <article class="ll-letter-window" data-letter-window>
          <h3 class="ll-title" data-title>${LOVE_LETTER_CONTENT.titleInitial}</h3>

          <img src="assets/images/love-letter/cat-heart.svg" class="ll-cat" data-cat alt="แมวถือหัวใจ" />

          <div class="ll-buttons" data-buttons>
            <button type="button" class="ll-btn ll-yes" data-yes aria-label="${LOVE_LETTER_CONTENT.yesAlt}">
              <img src="assets/images/love-letter/yes.svg" alt="${LOVE_LETTER_CONTENT.yesAlt}" />
            </button>

            <div class="ll-no-wrap" data-no-wrap>
              <button type="button" class="ll-btn ll-no" data-no aria-label="${LOVE_LETTER_CONTENT.noAlt}">
                <img src="assets/images/love-letter/no.svg" alt="${LOVE_LETTER_CONTENT.noAlt}" />
              </button>
            </div>
          </div>

          <p class="ll-final-text" data-final hidden>${LOVE_LETTER_CONTENT.finalHtml}</p>
        </article>
      </div>
    </section>
  `;
}
