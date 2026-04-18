import { qs } from './utils.js';
import { renderLovePlayground } from './lovePlayground/template.js';
import { initLovePlaygroundScene } from './lovePlayground/game.js';

export function createLovePlayground({ navigator }) {
  const pageId = 'love-play';
  const host = qs('lovePlayWrap');
  const closeBtn = qs('lovePlayClose');
  let destroyScene = null;

  function mountScene() {
    if (!host) return;
    destroyScene?.();
    host.innerHTML = renderLovePlayground();

    const wrap = host.querySelector('[data-love-play]');
    const bear = host.querySelector('[data-bear]');
    if (!wrap || !bear) return;
    destroyScene = initLovePlaygroundScene({ wrapper: wrap, bearEl: bear });
  }

  function close({ navigate = true } = {}) {
    destroyScene?.();
    destroyScene = null;
    if (host) host.innerHTML = '';
    if (navigate && navigator.current() === pageId) {
      navigator.go('cards', { skipLoader: true });
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
    destroy: () => {
      close({ navigate: false });
    }
  };
}
