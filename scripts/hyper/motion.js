// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/hyper/motion.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import {
  BASE_SPEED_UNITS,
  DEPTH,
  SPEED_GAIN_UNITS,
  SPREAD_X,
  SPREAD_Y
} from './constants.js';
import { respawnStar } from './starfield.js';

export function advanceStarfield({ positions, starCount, dt, speed, cameraZ }) {
  const velocity = BASE_SPEED_UNITS + speed * SPEED_GAIN_UNITS;
  const speedRatio = Math.min(1, speed / 15);

  for (let i = 0; i < starCount; i += 1) {
    const idx = i * 3;
    const zDepth = Math.min(1, (-positions[idx + 2]) / DEPTH);
    const parallaxBoost = 0.84 + (1 - zDepth) * 2.1;

    positions[idx + 2] += velocity * dt * parallaxBoost;

    if (positions[idx + 2] > cameraZ + 6) {
      respawnStar(positions, i);
      continue;
    }

    const radialScale = 0.0008 + speedRatio * 0.0029;
    positions[idx] += positions[idx] * radialScale * dt * 60;
    positions[idx + 1] += positions[idx + 1] * radialScale * dt * 60;

    if (Math.abs(positions[idx]) > SPREAD_X || Math.abs(positions[idx + 1]) > SPREAD_Y) {
      respawnStar(positions, i);
    }
  }
}
