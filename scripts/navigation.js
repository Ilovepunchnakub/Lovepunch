import { qs } from './utils.js';

export function createNavigator({ onPage }) {
  let current = 'home';

  function go(page) {
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
