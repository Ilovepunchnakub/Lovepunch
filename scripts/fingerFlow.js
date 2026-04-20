// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/fingerFlow.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

import { wait } from './utils.js';

const PHASES = [
  'เชื่อมต่อคลังข้อมูลหัวใจ...',
  'ถอดรหัสลายนิ้วมือชั้นที่ 1',
  'สแกนความถี่ชีพจรแห่งความทรงจำ',
  'ซิงก์คีย์ลับกับเซิร์ฟเวอร์ Soul-Link',
  'วิเคราะห์รอยยิ้มและค่าความอบอุ่น',
  'ยืนยันความปลอดภัยระดับ Heart Shield',
  'ค้นหาข้อมูลพิเศษของคนสำคัญ',
  'เตรียมผลสรุปสุดท้าย'
];

export async function runFingerScan({ onStep }) {
  const totalMs = 4800;
  const stepMs = Math.floor(totalMs / PHASES.length);

  for (let i = 0; i < PHASES.length; i += 1) {
    const pct = Math.min(100, Math.round(((i + 1) / PHASES.length) * 100));
    onStep({ text: PHASES[i], pct });
    await wait(stepMs);
  }
}
