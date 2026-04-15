import { createNavigator } from './navigation.js';
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

    if (page === 'hyper') hyper.enterPage();
    else hyper.stop();

    if (page === 'finger') finger.reset();
  }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 320) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

home.init();
initCards();
rain.init();
hyper.init();
finger.init();
nav.init();
nav.go('home');
