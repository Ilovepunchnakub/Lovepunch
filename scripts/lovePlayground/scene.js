// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/lovePlayground/scene.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

import { Bear } from './bear.js';

export function initLovePlaygroundScene({ wrapper, bearEl }) {
  if (!wrapper || !bearEl) return () => {};

  const bear = new Bear({
    el: bearEl,
    container: wrapper,
    wrapper,
    size: { w: 70, h: 90 },
    maxSize: { w: 90, h: 100 },
    offset: { x: null, y: null }
  });

  bear.setPos();

  return () => {
    bear.destroy();
    wrapper.innerHTML = '';
  };
}
