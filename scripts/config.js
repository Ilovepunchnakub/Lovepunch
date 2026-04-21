// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/config.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
export const CFG = {
  PIN: '0614',
  START: new Date('2026-03-14T00:24:00'),
  HER_NAME: 'Punch',
  PROFILE: {
    name: 'Punch Luv💗',
    age: '23 ปี',
    birthday: '30 พฤศจิกายน 2546',
    blood: 'O',
    hobby: 'ถ่ายรูป / ฟังเพลง / กอด',
    favorite: 'Cat'
  },
  HYPER_MESSAGES: [
    'You make my heart smile',
    'All of me loves all of you',
    'You are my favorite notification',
    'Happier with you ',
    'You are the best thing that’s ever been mine',
    'My heart is and always will be yours อ่านต่อได้ที่',
    'I fall in love with you over and over again',
    'Still crushing on you, even though we’re together 💖'
  ],
  ANNIV_BLESSINGS: [
    'สุขสันต์วันครบรอบนะคนเก่งของฉัน 💖 ขอบคุณที่เป็นความสบายใจในทุกวัน',
    'ทุกวินาทีที่มีเธอคือของขวัญล้ำค่าที่สุดสำหรับฉัน รักเธอเสมอ 🌷',
    'ขอให้เราจับมือกันแบบนี้ไปทุกเทศกาล ทุกฤดู และทุกความฝันเลยนะ ✨'
  ],
  RAIN_MSGS: [
    'เธอน่ารักมาก 💕',
    'คิดถึงเธอ 🌸',
    'ขอบคุณที่มาเจอกันนะ 💝',
    'เธอทำให้โลกดูดีขึ้น 🌍',
    'อยากกอดเธอ 🤗',
    'อยู่ด้วยกันไปนานๆนะ ✨',
    'เธอคือเซฟโซนของหัวใจเค้า 🫶',
    'ทุกวันกับเธอคือของขวัญ 🎁'
    'อยากอยู่กับเธอๆวัน ✨'
    'Miss you 💓'
    'Luv 🌷'
    'อย่าไปไหนนะ 🥲'
  ]
};
