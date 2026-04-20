import { createNavigator } from './navigation.js';
import { createHomeController } from './home.js';
import { initCards } from './cards.js';
import { createRainController } from './rain.js';
import { createHyperController } from './hyper.js';
import { createFingerController } from './finger.js';
import { createLoveLetterPage } from './loveLetter.js';
import { createTodayScene } from './todayScene.js';
import { createDreamScene } from './dreamScene.js';
import { createThankYouBearPage } from './thankYouBear.js';
import { createPromisePage } from './promisePage.js';
import { initEntryGate } from './entryGate.js';
import { initNavDock } from './navDock.js';
import { initInteractionEffects } from './effects.js';
import { initClickSound } from './clickSound.js';
import { createFakePageLoader, createEntryCompletionLoader } from './fakePageLoader.js';

const home = createHomeController();
const rain = createRainController();
const hyper = createHyperController();
const finger = createFingerController();
const transitionLoader = createFakePageLoader();
const entryCompletionLoader = createEntryCompletionLoader();
let cards = null;

const nav = createNavigator({
  transitionLoader,
  onPage: (page) => {
    if (page === 'home') home.start();
    else home.stop();

    if (page === 'hyper') hyper.enterPage();
    else hyper.stop();

    if (page === 'finger') finger.reset();

    if (page === 'promise') {
      // reserved for promise-page lifecycle hooks
    }
  }
});
const loveLetterPage = createLoveLetterPage({ navigator: nav });
const todayScene = createTodayScene({ navigator: nav });
const dreamScene = createDreamScene({ navigator: nav });
const thankYouBearPage = createThankYouBearPage({ navigator: nav });
const promisePage = createPromisePage({ navigator: nav });

function bootMainApp() {
  home.init();
  cards = initCards({
    onOpenLoveScene: () => loveLetterPage.open(),
    onOpenTodayScene: () => todayScene.open(),
    onOpenDreamScene: () => dreamScene.open(),
    onOpenThanksScene: () => thankYouBearPage.open(),
    onOpenPromiseScene: () => promisePage.open()
  });
  rain.init();
  hyper.init();
  finger.init();
  loveLetterPage.init();
  todayScene.init();
  dreamScene.init();
  thankYouBearPage.init();
  promisePage.init();
  nav.init();
  initNavDock();
  initInteractionEffects();
  initClickSound();
  nav.go('home', { skipLoader: true });
}

document.addEventListener('app:close-transient-layers', () => {
  cards?.close?.({ restoreFocus: false });
  finger.dismissPopup({ restoreFocus: false, force: true });
  loveLetterPage.close({ navigate: false });
  todayScene.close({ navigate: false });
  dreamScene.close({ navigate: false });
  thankYouBearPage.close({ navigate: false });
  promisePage.close({ navigate: false });
  home.closeTransientLayers();
});

bootMainApp();
initEntryGate({
  completionLoader: entryCompletionLoader,
  onUnlocked: () => {
    document.body.classList.add('unlocked');
  }
});
