// ===== ตั้งค่าเอฟเฟกต์คลิก (แก้ไฟล์นี้ไฟล์เดียว) =====
// ใช้ได้ทั้งมือถือและคอม โดยระบบหลักจะอ่านค่าจาก object ด้านล่างนี้

export const CLICK_EFFECT_CONFIG = {
  cursorEmoji: '💕',
  particleEmojis: ['💖', '💗', '💓', '💝', '🌸', '💕', '✨'],
  floatingMessages: ['uwu~', 'น่ารัก!', 'cute!', '♡', 'มุ้งมิ้ง~'],
  particleCount: 10,
  particleDistance: { min: 60, max: 160 },
  particleDuration: { min: 0.6, max: 1.1 },
  rippleDurationMs: 600,
  messageChance: 0.4
};
