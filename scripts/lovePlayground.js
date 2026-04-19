import { qs } from './utils.js';
import { renderLovePlayground } from './lovePlayground/template.js';
import { initLovePlaygroundScene } from './lovePlayground/game.js';

export function createLovePlayground({ navigator }) {
  const pageId = 'love-play';
  const host = qs('lovePlayWrap');
  const closeBtn = qs('lovePlayClose');
  let destroyScene = null;


  function normalizeLegacyMarkup(scope) {
    if (!scope) return;
    const classMap = {
      'cheek-wrapper': 'lp-cheek-wrapper',
      'mouth-wrapper': 'lp-mouth-wrapper',
      'ear': 'lp-ear',
      'round': 'lp-round',
      'face': 'lp-face',
      'inner-face': 'lp-inner-face',
      'eye': 'lp-eye',
      'nose': 'lp-nose',
      'cheeks': 'lp-cheeks',
      'flex-center': 'lp-flex-center',
      'limbs': 'lp-limbs',
      'hands': 'lp-hands',
      'hand': 'lp-hand',
      'flip': 'lp-flip',
      'feet': 'lp-feet',
      'foot': 'lp-foot',
      'ears': 'lp-ears',
      'inner-ears': 'lp-inner-ears',
      'food': 'lp-food',
      'donut': 'lp-donut',
      'object': 'lp-object'
    };

    Object.entries(classMap).forEach(([legacy, modern]) => {
      scope.querySelectorAll(`.${legacy}`).forEach((node) => node.classList.add(modern));
    });
  }

  function mountScene() {
    if (!host) return;
    destroyScene?.();
    host.innerHTML = renderLovePlayground();

    const wrap = host.querySelector('[data-love-play], .lp-wrapper, .wrapper');
    const bear = host.querySelector('[data-bear], .lp-bear, .bear');

    if (wrap && !wrap.classList.contains('lp-wrapper')) wrap.classList.add('lp-wrapper');
    if (bear && !bear.classList.contains('lp-bear')) bear.classList.add('lp-bear', 'lp-object');
    normalizeLegacyMarkup(wrap);

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
