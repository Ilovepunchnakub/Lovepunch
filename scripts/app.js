import { createNavigator } from './navigation.js';
import { createHomeController } from './home.js';
import { initCards } from './cards.js';
import { createRainController } from './rain.js';
import { createHyperController } from './hyper.js';
import { createFingerController } from './finger.js';
import { createLovePlayground } from './lovePlayground.js';
import { createTodayScene } from './todayScene.js';
import { createDreamScene } from './dreamScene.js';
import { initEntryGate } from './entryGate.js';
import { initNavDock } from './navDock.js';
import { initInteractionEffects } from './effects.js';
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
  }
});
const lovePlayground = createLovePlayground({ navigator: nav });
const todayScene = createTodayScene({ navigator: nav });
const dreamScene = createDreamScene({ navigator: nav });

function bootMainApp() {
  home.init();
  cards = initCards({
    onOpenLoveScene: () => lovePlayground.open(),
    onOpenTodayScene: () => todayScene.open(),
    onOpenDreamScene: () => dreamScene.open()
  });
  rain.init();
  hyper.init();
  finger.init();
  lovePlayground.init();
  todayScene.init();
  dreamScene.init();
  nav.init();
  initNavDock();
  initInteractionEffects();
  nav.go('home', { skipLoader: true });
}

document.addEventListener('app:close-transient-layers', () => {
  cards?.close?.({ restoreFocus: false });
  finger.dismissPopup({ restoreFocus: false, force: true });
  lovePlayground.close({ navigate: false });
  todayScene.close({ navigate: false });
  dreamScene.close({ navigate: false });
  home.closeTransientLayers();
});

bootMainApp();
initEntryGate({
  completionLoader: entryCompletionLoader,
  onUnlocked: () => {
    document.body.classList.add('unlocked');
  }
});
