// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/config.js =====
// หน้าที่หลัก:
// - รวมค่าตั้งต้นหลักของแอป (วันที่เริ่มต้น, โปรไฟล์, ข้อความต่าง ๆ)
// - จุดเดียวสำหรับปรับ "ข้อความ" โดยไม่ต้องไล่แก้หลายไฟล์
// วิธีใช้งาน:
// - แก้ข้อความใน scripts/editableText.js เป็นหลักได้เลย
// =============================================
import { EDITABLE_TEXT } from './editableText.js';

export const CFG = {
  PIN: '0614',
  START: new Date('2026-03-14T00:24:00'),
  HER_NAME: EDITABLE_TEXT.HER_NAME,

  PROFILE: EDITABLE_TEXT.PROFILE,
  UI_TEXT: EDITABLE_TEXT.UI_TEXT,
  ENTRY_GATE_TUNING: EDITABLE_TEXT.ENTRY_GATE_TUNING,

  HYPER_MESSAGES: EDITABLE_TEXT.HYPER_MESSAGES,
  ANNIV_BLESSINGS: EDITABLE_TEXT.ANNIV_BLESSINGS,
  RAIN_MSGS: EDITABLE_TEXT.RAIN_MSGS
};
