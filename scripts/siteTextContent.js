// ===== ศูนย์รวมข้อความทั้งเว็บ (ภาษาไทย) =====
// แก้ข้อความของแต่ละส่วนจากไฟล์นี้ไฟล์เดียวได้เลย
// วิธีใช้:
// 1) ใส่ data-text-key="KEY_NAME" ให้ element ใน HTML
// 2) เพิ่มข้อความใน TEXT_CONTENT.sections[KEY_NAME]
// 3) ระบบจะ inject ให้อัตโนมัติเมื่อแอปเริ่มทำงาน

export const TEXT_CONTENT = {
  sections: {
    HOME_HERO_TAG: '✨ FOR YOUR EYES ONLY ✨',
    HOME_CARD_TITLE: 'Ionic Bond',
    HOME_COUNTDOWN_TITLE: 'Countdown to the important day',

    STATS_MONTHS_LABEL: 'เดือนที่ผ่านมา',
    STATS_NIGHTS_LABEL: 'คืนที่คิดถึงกัน',
    STATS_MORNINGS_LABEL: 'เช้าที่นึกถึงกัน',
    STATS_HEART_LABEL: 'หัวใจเต้นเพื่อเธอ',

    RAIN_TITLE: 'โปรยข้อความหวาน 💝',
    RAIN_DESC: 'กดปุ่มแล้วข้อความหวานจะโปรยลงมาแบบไม่บังข้อมูลหลัก',
    RAIN_BUTTON: 'เริ่มโปรยข้อความ',
    RAIN_STATUS_READY: 'พร้อมโปรยข้อความหวาน',

    FINGER_TITLE: 'ยืนยันตัวตน',
    FINGER_HINT_IDLE: 'แตะค้างเพื่อสแกนลายนิ้วมือ 👆',

    ANNIV_COUNTDOWN_TITLE: 'นับถอยหลังเซอร์ไพรส์วันครบรอบ',
    ANNIV_COUNTDOWN_SUBTITLE: 'วินาทีสุดท้ายกำลังเริ่มแล้ว ✨',
    ANNIV_POPUP_TITLE: 'Happy Anniversary 💞',
    ANNIV_PREPARE_TEXT: 'เตรียมแสดงข้อความ...'
  }
};

export function applySectionTexts() {
  document.querySelectorAll('[data-text-key]').forEach((node) => {
    const key = node.getAttribute('data-text-key');
    const value = key ? TEXT_CONTENT.sections[key] : undefined;
    if (value) node.textContent = value;
  });
}
