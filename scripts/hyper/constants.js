// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/hyper/constants.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
export const STAR_COUNT = 3600;
export const DEPTH = 2800;
export const SPREAD_X = 1400;
export const SPREAD_Y = 920;
export const MAX_SPEED = 15;
export const MIN_SPEED = 0.35;
export const BASE_SPEED_UNITS = 210;
export const SPEED_GAIN_UNITS = 420;
