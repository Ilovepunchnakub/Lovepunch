import { createNavigator } from './navigation.js';
import { createHomeController } from './home.js';
import { initCards } from './cards.js';
import { createRainController } from './rain.js';
import { createHyperController } from './hyper.js';
import { createFingerController } from './finger.js';
import { initEntryGate } from './entryGate.js';
import { initNavDock } from './navDock.js';
import { initInteractionEffects } from './effects.js';
import { createFakePageLoader } from './fakePageLoader.js';

const home = createHomeController();
const rain = createRainController();
const hyper = createHyperController();
const finger = createFingerController();
const transitionLoader = createFakePageLoader();
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

function bootMainApp() {
  home.init();
  cards = initCards();
  rain.init();
  hyper.init();
  finger.init();
  nav.init();
  initNavDock();
  initInteractionEffects();
  nav.go('home', { skipLoader: true });
}

document.addEventListener('app:close-transient-layers', () => {
  cards?.close?.({ restoreFocus: false });
  finger.dismissPopup({ restoreFocus: false, force: true });
  home.closeTransientLayers();
});

bootMainApp();
initEntryGate({
  transitionLoader,
  onUnlocked: () => {
    document.body.classList.add('unlocked');
  }
});
