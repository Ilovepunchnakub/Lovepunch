// ===== จุดรวมข้อความ/ค่าที่แก้ได้ทั้งหมด =====
// ใช้ไฟล์นี้เป็นที่เดียวสำหรับแก้ copywriting และพารามิเตอร์ข้อความ

export const EDITABLE_TEXT = {
  HER_NAME: 'Punch',

  PROFILE: {
    name: 'Punch Luv💗',
    age: '23 ปี',
    birthday: '30 พฤศจิกายน 2546',
    blood: 'O',
    hobby: 'ถ่ายรูป / ฟังเพลง / กอด',
    favorite: 'Cat'
  },

  UI_TEXT: {
    ENTRY_GATE: {
      tag: 'Heart Unloc',
      title: 'My heart is yours',
      subtitle: 'แตะหัวใจเพื่อไปหน้าหลักได้เลยคั้บ',
      buttonAriaLabel: 'Tap heart to continue',
      idleHint: 'แตะหัวใจหนึ่งครั้ง แล้วรอ Loading ได้เลยคั้บ...',
      loadingHint: 'กำลังพาเข้าสู่หน้าหลัก...',
      doneHint: 'เรียบร้อยแล้ว ไปหน้าหลักกัน 💖'
    },
    RAIN: {
      preparing: 'กำลังเตรียมความรักให้...',
      ready: 'พร้อมส่งข้อความรอบถัดไปแล้ว',
      count: (count) => `กดไปแล้ว: ${count} ครั้ง`
    },
    FINGER: {
      holdHint: 'แตะค้างเพื่อสแกนลายนิ้วมือคั้บคนน่ารัก 💓',
      holdingHint: 'กดค้างไว้... ระบบกำลังตรวจจับลายนิ้วมือคั้บบ',
      scanningHint: 'กำลังอ่านลายนิ้วมือ...',
      doneHint: 'ตรวจสอบเสร็จสิ้นแล้ว  ✅',
      doneMessage: 'สำเร็จ! ระบบยืนยันตัวตนด้วยหัวใจเรียบร้อยคั้บ..💖'
    }
  },

  ENTRY_GATE_TUNING: {
    holdMs: 2400,
    tapThresholdMs: 220,
    tapIncrement: 0.24,
    sparkleSteps: 14
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
    'ทุกวันกับเธอคือของขวัญ 🎁',
    'อยากอยู่กับเธอทุกวัน ✨',
    'Miss you 💓',
    'Luv 🌷',
    'อย่าไปไหนนะ 🥲'
  ]
};
