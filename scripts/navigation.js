import { qs } from './utils.js';

export function createNavigator({ onPage }) {
  let current = 'home';

  function closeTransientLayers() {
    // Ensure modal/backdrop layers never block interactions after page switches.
    qs('cardModal')?.classList.remove('show');
    qs('fpPopup')?.classList.remove('show');
  }

  function go(page) {
    closeTransientLayers();
    document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));
    qs(`pg-${page}`).classList.add('active');
    document.querySelectorAll('.ni').forEach((el) => el.classList.toggle('on', el.dataset.page === page));
    current = page;
    onPage(page);
  }

  function init() {
    document.querySelectorAll('.ni').forEach((el) => el.addEventListener('click', () => go(el.dataset.page)));
  }

  return { init, go, current: () => current };
}
