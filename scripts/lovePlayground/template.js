// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/lovePlayground/template.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

export function renderLovePlayground() {
  return `
    <div class="lp-wrapper lp-show-message" data-love-play>
      <div class="lp-bear lp-object" data-bear>
        <div class="lp-ears">
          <div class="lp-inner-ears">
            <div class="lp-ear lp-round"></div>
            <div class="lp-ear lp-round"></div>
          </div>
        </div>
        <div class="lp-face">
          <div class="lp-inner-face">
            <div class="lp-eye"></div>
            <div class="lp-nose"></div>
            <div class="lp-eye"></div>
          </div>
          <div class="lp-cheeks">
            <div class="lp-cheek-wrapper lp-flex-center"></div>
            <div class="lp-mouth-wrapper lp-flex-center"></div>
            <div class="lp-cheek-wrapper lp-flex-center"></div>
          </div>
        </div>
        <div class="lp-limbs">
          <div class="lp-hands">
            <div class="lp-hand"></div>
            <div class="lp-hand lp-flip"></div>
          </div>
          <div class="lp-feet">
            <div class="lp-foot lp-round"></div>
            <div class="lp-foot lp-round"></div>
          </div>
        </div>
      </div>
      <div class="lp-food lp-donut lp-object" data-donut></div>
    </div>
  `;
}
