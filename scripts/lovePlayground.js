import { qs } from './utils.js';
import { renderLovePlayground } from './lovePlayground/template.js';
import { initLovePlaygroundScene } from './lovePlayground/game.js';

export function createLovePlayground({ navigator }) {
  const pageId = 'love-play';
  const host = qs('lovePlayWrap');
  const closeBtn = qs('lovePlayClose');
  let destroyScene = null;

  function unmountScene() {
    destroyScene?.();
    destroyScene = null;
    document.body.classList.remove('lp-no-select');
    if (host) host.innerHTML = '';
  }

  function mountScene() {
    if (!host) return;
    unmountScene();
    host.innerHTML = renderLovePlayground();

    const wrap = host.querySelector('[data-love-play]');
    const bear = host.querySelector('[data-bear]');
    if (!wrap || !bear) return;
    destroyScene = initLovePlaygroundScene({ wrapper: wrap, bearEl: bear });
  }

  function close() {
    unmountScene();
    if (navigator.current() === pageId) {
      navigator.go('cards');
    }
  }

  function open() {
    mountScene();
    navigator.go(pageId);
  }

  function init() {
    closeBtn?.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (navigator.current() !== pageId) return;
      event.preventDefault();
      close();
    });
  }

  return {
    init,
    open,
    close,
    destroy: unmountScene
  };
}
