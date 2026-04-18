import { qs } from './utils.js';

export function createNavigator({ onPage, transitionLoader }) {
  let current = 'home';
  let switching = false;

  function closeTransientLayers() {
    // Ensure modal/backdrop layers never block interactions after page switches.
    qs('cardModal')?.classList.remove('show');
    qs('cardModal')?.setAttribute('aria-hidden', 'true');
    qs('fpPopup')?.classList.remove('show');
    qs('fpPopup')?.setAttribute('aria-hidden', 'true');
    qs('annivOverlay')?.classList.remove('show');
    document.body.classList.remove('anniv-focus');
  }

  function applyPage(page) {
    document.dispatchEvent(new CustomEvent('app:close-transient-layers', {
      detail: {
        from: current,
        to: page
      }
    }));
    closeTransientLayers();
    document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));
    qs(`pg-${page}`).classList.add('active');
    document.querySelectorAll('.ni').forEach((el) => el.classList.toggle('on', el.dataset.page === page));
    current = page;
    onPage(page);
  }

  async function go(page, { skipLoader = false } = {}) {
    if (!page || switching) return;
    const isSamePage = page === current;
    if (isSamePage && !skipLoader) return;

    switching = true;
    try {
      if (skipLoader || !transitionLoader) {
        applyPage(page);
      } else {
        await transitionLoader.run({
          minMs: 1500,
          beforeSwitch: () => applyPage(page)
        });
      }
    } finally {
      switching = false;
    }
  }

  function init() {
    document.querySelectorAll('.ni').forEach((el) => {
      el.addEventListener('click', () => {
        go(el.dataset.page);
      });
    });
  }

  return { init, go, current: () => current };
}
