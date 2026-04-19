import { Bear } from './bear.js';

export function initLovePlaygroundScene({ wrapper, bearEl }) {
  if (!wrapper || !bearEl) return () => {};

  const bear = new Bear({
    el: bearEl,
    container: wrapper,
    wrapper,
    size: { w: 70, h: 90 },
    maxSize: { w: 90, h: 100 },
    offset: { x: null, y: null }
  });

  bear.setPos();

  return () => {
    bear.destroy();
    wrapper.innerHTML = '';
  };
}
