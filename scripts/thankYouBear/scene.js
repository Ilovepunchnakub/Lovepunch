// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/thankYouBear/scene.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

import { initLovePlaygroundScene } from '../lovePlayground/scene.js';

export function initThankYouBearScene({ wrapper, bearEl }) {
  return initLovePlaygroundScene({ wrapper, bearEl });
}
