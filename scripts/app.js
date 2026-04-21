// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/app.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import { createNavigator } from './navigation.js';
import { createHomeController } from './home.js';
import { createRainController } from './rain.js';
import { createHyperController } from './hyper.js';
import { createFingerController } from './finger.js';
import { createLoveLetterPage } from './loveLetter.js';
import { createTodayScene } from './todayScene.js';
import { createDreamScene } from './dreamScene.js';
import { createThankYouBearPage } from './thankYouBear.js';
import { initNavDock } from './navDock.js';
import { initInteractionEffects } from './effects.js';
import { createFakePageLoader } from './fakePageLoader.js';
import { initForcedMusicPrompt } from './forcedMusicPrompt.js';

const home = createHomeController();
const rain = createRainController();
const hyper = createHyperController();
const finger = createFingerController();
const transitionLoader = createFakePageLoader();

const nav = createNavigator({
  transitionLoader,
  onPage: (page) => {
    if (page === 'home') home.start();
    else home.stop();

    if (page === 'hyper') hyper.enterPage();
    else hyper.stop();

    if (page === 'finger') finger.reset();
  }
});
const loveLetterPage = createLoveLetterPage({ navigator: nav });
const todayScene = createTodayScene({ navigator: nav });
const dreamScene = createDreamScene({ navigator: nav });
const thankYouBearPage = createThankYouBearPage({ navigator: nav });

async function bootMainApp() {
  home.init();
  rain.init();
  hyper.init();
  finger.init();
  loveLetterPage.init();
  todayScene.init();
  dreamScene.init();
  thankYouBearPage.init();
  nav.init();
  initNavDock();
  initInteractionEffects();

  await transitionLoader.run({
    minMs: 2600,
    beforeSwitch: () => nav.go('home', { skipLoader: true })
  });

  initForcedMusicPrompt();
}

document.addEventListener('app:close-transient-layers', () => {
  finger.dismissPopup({ restoreFocus: false, force: true });
  loveLetterPage.close({ navigate: false });
  todayScene.close({ navigate: false });
  dreamScene.close({ navigate: false });
  thankYouBearPage.close({ navigate: false });
  home.closeTransientLayers();
});

bootMainApp();
