// ===== ศูนย์รวมข้อความทั้งเว็บ (แก้ไฟล์นี้ไฟล์เดียว) =====

export const TEXT_CONTENT = {
  meta: {
    pageTitle: 'For Punch 💕'
  },

  // ข้อความที่ bind ตรงจาก HTML ผ่าน data-text-key
  sections: {
    PAGE_TITLE: 'For Punch 💕',
    ENTRY_TAG: 'Heart Unlock',
    ENTRY_TITLE: 'My heart is yours',
    ENTRY_SUB: 'กดค้างหรือแตะเพิ่มหัวใจให้เต็มคั้บ',
    ENTRY_HINT_IDLE: 'กดค้างหรือแตะเพิ่มได้เลยคั้บเธอ...',
    LOADER_SUB: 'แมวน้อยกำลังพาเธอไปนะคั้บ...',

    HOME_HERO_TAG: '✨ FOR YOUR EYES ONLY ✨',
    HOME_CARD_TITLE: 'Ionic Bond',
    HOME_COUNTDOWN_TITLE: 'Countdown to the important day',

    STATS_MONTHS_LABEL: 'เดือนที่ผ่านมา',
    STATS_NIGHTS_LABEL: 'คืนที่คิดถึงกัน',
    STATS_MORNINGS_LABEL: 'เช้าที่นึกถึงกัน',
    STATS_HEART_LABEL: 'หัวใจเต้นเพื่อเธอ',

    PROFILE_TITLE: 'Profile Punch',
    PROFILE_LABEL_NAME: 'ชื่อ:',
    PROFILE_LABEL_AGE: 'อายุ:',
    PROFILE_LABEL_BIRTHDAY: 'วันเกิด:',
    PROFILE_LABEL_BLOOD: 'กรุ๊ปเลือด:',
    PROFILE_LABEL_HOBBY: 'งานอดิเรก:',
    PROFILE_LABEL_FAVORITE: 'ของโปรด:',

    TODAY_CLOSE: 'ปิด ✕',
    THANKS_CLOSE: 'ปิด ✕',
    DREAM_CLOSE: 'ปิด ✕',

    LOVE_LETTER_PAGE_TITLE: 'ความรัก 💕',
    LOVE_LETTER_PAGE_GUIDE: 'ซีน Love Letter: แตะที่ซองจดหมาย แล้วเลือกคำตอบได้เลยน้า',
    LOVE_LETTER_PAGE_TIP: 'เคล็ดลับ: กด Esc (คอม) หรือปุ่มปิด เพื่อกลับหน้าแรก',

    RAIN_TITLE: 'โปรยข้อความหวาน 💝',
    RAIN_DESC: 'กดปุ่มแล้วข้อความหวานจะโปรยลงมาแบบไม่บังข้อมูลหลัก',
    RAIN_BUTTON: 'เริ่มโปรยข้อความ',
    RAIN_STATUS_READY: 'พร้อมโปรยข้อความหวาน',

    FINGER_TITLE: 'ยืนยันตัวตน',
    FINGER_HINT_IDLE: 'แตะค้างเพื่อสแกนลายนิ้วมือ 👆',

    ANNIV_COUNTDOWN_TITLE: 'นับถอยหลังเซอร์ไพรส์วันครบรอบ',
    ANNIV_COUNTDOWN_SUBTITLE: 'วินาทีสุดท้ายกำลังเริ่มแล้ว ✨',
    ANNIV_POPUP_TITLE: 'Happy Anniversary 💞',
    ANNIV_PREPARE_TEXT: 'เตรียมแสดงข้อความ...',

    NAV_HOME: 'หน้าแรก',
    NAV_RAIN: 'โปรยรัก',
    NAV_HYPER: 'จักรวาล',
    NAV_FINGER: 'หัวใจ',
    NAV_BEAR: 'หมี',
    NAV_FLOWER: 'ดอกไม้',

    BGM_GATE_TITLE: 'เปิดเพลงพื้นหลัง 🎵',
    BGM_GATE_DESC: 'เพื่อประสบการณ์เต็มรูปแบบ กรุณากดปุ่มด้านล่างเพื่อเปิดเพลงพื้นหลัง',
    BGM_GATE_BUTTON: 'เปิดเพลงตอนนี้'
  },

  // ข้อความ dynamic ของ logic
  app: {
    entryGate: {
      hintLoading: 'กำลังยืนยันตัวตน...',
      hintReset: 'ปล่อยแล้วรีเซ็ตนะคั้บ กดค้างใหม่เพื่อเติมหัวใจ',
      hintCompleted: 'เติมครบ 100% แล้ว',
      hintProgress: (pct) => `เติมแล้ว ${pct}% กดเพิ่มได้อีกนะ`
    },

    home: {
      greeting: (name) => `สวัสดี${name} 🌸`,
      daysSince: (d, m, y) => `เริ่มคบกันตั้งแต่ ${d}/${m}/${y}`,
      monthStat: (v) => `${v} เดือน`,
      nightStat: (v) => `${v} คืน`,
      morningStat: (v) => `${v} เช้า`,
      toastFxUnlocked: 'ปลดล็อกเอฟเฟกต์สำเร็จ ✨',
      toastFxTest: (count, target) => `ทดสอบเอฟเฟกต์: ${count}/${target}`,
      toastCountdownStart: 'เริ่มนับถอยหลังทดสอบแล้ว 💫',
      toastCountdownTest: (count, target) => `ทดสอบนับถอยหลัง: ${count}/${target}`
    },

    rain: {
      statusPreparing: 'กำลังเตรียมความรักให้...',
      statusReadyNext: 'พร้อมส่งข้อความรอบถัดไปแล้ว',
      countLabel: (count) => `กดไปแล้ว: ${count} ครั้ง`
    },

    finger: {
      phases: [
        'เชื่อมต่อคลังข้อมูลหัวใจ...',
        'ถอดรหัสลายนิ้วมือชั้นที่ 1',
        'สแกนความถี่ชีพจรแห่งความทรงจำ',
        'ซิงก์คีย์ลับกับเซิร์ฟเวอร์ Soul-Link',
        'วิเคราะห์รอยยิ้มและค่าความอบอุ่น',
        'ยืนยันความปลอดภัยระดับ Heart Shield',
        'ค้นหาข้อมูลพิเศษของคนสำคัญ',
        'เตรียมผลสรุปสุดท้าย'
      ],
      popupLoadingTitle: 'กำลังโหลดข้อมูลความลับ',
      popupDoneTitle: 'ตรวจสอบเสร็จสิ้น 💖',
      dismissIn: (sec) => `แตะจอเพื่อปิดได้ใน ${sec} วิ...`,
      dismissReady: 'แตะตรงไหนก็ได้เพื่อปิดหน้าต่างนี้',
      hintIdle: 'แตะค้างเพื่อสแกนลายนิ้วมือ 👆',
      hintHolding: 'กดค้างไว้... ระบบกำลังตรวจจับลายนิ้วมือ',
      hintReading: 'กำลังอ่านลายนิ้วมือ...',
      hintDone: 'ตรวจสอบเสร็จสิ้นแล้ว',
      msgDone: 'สำเร็จ! ระบบยืนยันตัวตนด้วยหัวใจเรียบร้อย'
    },

    hyper: {
      uiIdleMessage: 'กดเริ่มเดินทาง แล้วออกท่องไปในจักรวาลของเรา ✨',
      uiDoneText: 'จบข้อความแล้ว กดเริ่มเพื่อเล่นซ้ำได้',
      uiStartButton: 'เริ่มเดินทาง',
      uiLoadingLog: (pct) => `โหลดระบบนำทาง ${pct}%`,
      uiFinalTitle: 'Love Forever',
      uiFinalButton: 'กดเพื่อจบ',
      loadingPreparing: 'กำลังเตรียม hyperspace...',
      loadingReady: 'พร้อมเข้าสู่เส้นทางของเราแล้ว',
      intro: 'เตรียมตัวเข้าสู่ hyperspace ของเรา ✨'
    },

    today: {
      hint: 'Draw back an arrow and launch it!',
      feedbackLove: 'LOVE YOU',
      feedbackHit: 'HIT!',
      feedbackMiss: 'MISS YOU'
    },

    anniversary: {
      closeIn: (sec) => `แตะที่ไหนก็ได้เพื่อปิด (พร้อมใน ${sec} วินาที)`,
      closeReady: 'แตะที่ไหนก็ได้เพื่อกลับสู่หน้าแรก 💫',
      prepareText: 'เตรียมแสดงข้อความ...',
      blessingFallback: 'สุขสันต์วันครบรอบนะคนเก่งของฉัน 💕'
    },

    homeLove: {
      fallbackTitle: 'I LOVE YOU'
    },

    loveLetter: {
      catDanceAlt: 'แมวกำลังเต้น'
    },

    bgm: {
      warnMissing: '[BGM] playback blocked or source missing:'
    }
  },

  // กลุ่มข้อความข้อมูลหลัก (เคยกระจายในหลายไฟล์)
  data: {
    herName: 'ที่รัก',
    profile: {
      name: 'Babe',
      age: '22 ปี',
      birthday: '14 มิถุนายน',
      blood: 'O',
      hobby: 'ถ่ายรูป / ฟังเพลง / กอดเรา',
      favorite: 'ดอกไม้สีชมพู'
    },
    hyperMessages: [
      'จากมุมหนึ่งของจักรวาล… ฉันยังมองหาเธอเสมอ',
      'ทุกแสงดาวที่พุ่งผ่าน เหมือนบอกว่ารักเธอมากขึ้นทุกวัน',
      'ต่อให้เวลาเร็วแค่ไหน ฉันก็อยากช้าลงตอนอยู่กับเธอ',
      'เธอคือเหตุผลที่การเดินทางทุกครั้งมีความหมาย',
      'ฉันเก็บทุกเสียงหัวเราะของเธอไว้ในห้องนักบินแห่งความทรงจำ',
      'แม้จะผ่านกาแล็กซีไกลแค่ไหน ใจฉันก็ยังล็อกพิกัดที่เธอ',
      'เมื่อเข้าสู่แสงเหนือของ hyperspace ฉันเห็นภาพเราจับมือกันชัดที่สุด',
      'ปลายทางของฉันไม่ใช่ที่ไหน… แต่คือเธอ 💖'
    ],
    annivBlessings: [
      'สุขสันต์วันครบรอบนะคนเก่งของฉัน 💖 ขอบคุณที่เป็นความสบายใจในทุกวัน',
      'ทุกวินาทีที่มีเธอคือของขวัญล้ำค่าที่สุดสำหรับฉัน รักเธอเสมอ 🌷',
      'ขอให้เราจับมือกันแบบนี้ไปทุกเทศกาล ทุกฤดู และทุกความฝันเลยนะ ✨'
    ],
    rainMessages: [
      'รักเธอมาก 💕',
      'คิดถึงเธอ 🌸',
      'ขอบคุณที่มาเป็นของฉัน 💝',
      'เธอทำให้โลกสวยขึ้น 🌍',
      'อยากกอดเธอ 🤗',
      'อยู่ด้วยกันไปนานๆนะ ✨',
      'เธอคือเซฟโซนของหัวใจฉัน 🫶',
      'ทุกวันกับเธอคือของขวัญ 🎁'
    ],
    loveLetter: {
      envelopeLabel: '♡ จดหมายถึงเธอ ♡',
      titleInitial: 'จะเป็นวาเลนไทน์ของเราไหม?',
      titleAccepted: 'เย้~ ตกลงแล้วน้าา 💖',
      finalHtml: '<strong>เดตวาเลนไทน์:</strong> ร้าน Meow เวลา 19:00 น. แต่งตัวสวยๆ นะ 💐',
      yesAlt: 'ตกลง',
      noAlt: 'ยังไม่ตกลง'
    }
  }
};

export function applySectionTexts() {
  document.title = TEXT_CONTENT.meta.pageTitle;
  document.querySelectorAll('[data-text-key]').forEach((node) => {
    const key = node.getAttribute('data-text-key');
    const value = key ? TEXT_CONTENT.sections[key] : undefined;
    if (value) node.textContent = value;
  });
}
