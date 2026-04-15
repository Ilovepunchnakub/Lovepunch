import { createNavigator } from './navigation.js';
import { createPinController } from './pin.js';
import { createHomeController } from './home.js';
import { initCards } from './cards.js';
import { createRainController } from './rain.js';
import { createHyperController } from './hyper.js';
import { createFingerController } from './finger.js';

const home = createHomeController();
const rain = createRainController();
const hyper = createHyperController();
const finger = createFingerController();

const nav = createNavigator({
  onPage: (page) => {
    if (page === 'home') home.start();
    else home.stop();

    if (page === 'hyper') hyper.startExperience();
    else hyper.stop();

    if (page === 'finger') finger.reset();
  }
});

const pin = createPinController({ onUnlock: () => nav.go('home') });

pin.init();
home.init();
initCards();
rain.init();
hyper.init();
finger.init();
nav.init();
