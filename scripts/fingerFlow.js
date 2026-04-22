// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/fingerFlow.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { wait } from './utils.js';
import { TEXT_CONTENT } from './siteTextContent.js';

const PHASES = TEXT_CONTENT.app.finger.phases;

export async function runFingerScan({ onStep }) {
  const totalMs = 4800;
  const stepMs = Math.floor(totalMs / PHASES.length);

  for (let i = 0; i < PHASES.length; i += 1) {
    const pct = Math.min(100, Math.round(((i + 1) / PHASES.length) * 100));
    onStep({ text: PHASES[i], pct });
    await wait(stepMs);
  }
}
