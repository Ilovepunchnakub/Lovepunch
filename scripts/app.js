import { createNavigator } from './navigation.js';
import { createHomeController } from './home.js';
import { createRainController } from './rain.js';
import { createHyperController } from './hyper.js';
import { createFingerController } from './finger.js';
import { createTodayScene } from './todayScene.js';
import { createDreamScene } from './dreamScene.js';
import { createThankYouBearPage } from './thankYouBear.js';
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
const todayScene = createTodayScene({ navigator: nav });
const dreamScene = createDreamScene({ navigator: nav });
const thankYouBearPage = createThankYouBearPage({ navigator: nav });

function bootMainApp() {
  home.init();
  rain.init();
  hyper.init();
  finger.init();
  todayScene.init();
  dreamScene.init();
  thankYouBearPage.init();
  nav.init();
  initNavDock();
  initInteractionEffects();
  initClickSound();
  nav.go('home', { skipLoader: true });
}

document.addEventListener('app:close-transient-layers', () => {
  finger.dismissPopup({ restoreFocus: false, force: true });
  todayScene.close({ navigate: false });
  dreamScene.close({ navigate: false });
  thankYouBearPage.close({ navigate: false });
  home.closeTransientLayers();
});

bootMainApp();
initEntryGate({
  completionLoader: entryCompletionLoader,
  onUnlocked: () => {
    document.body.classList.add('unlocked');
  }
});
