import { qs } from './utils.js';

export function initNavDock() {
  const nav = qs('mainNav');
  const toggle = qs('navDockToggle');

  function setCollapsed(collapsed) {
    nav.classList.toggle('collapsed', collapsed);
    toggle.classList.toggle('open', !collapsed);
    toggle.querySelector('span').textContent = collapsed ? '＋' : '×';
  }

  setCollapsed(true);

  toggle.addEventListener('click', () => {
    const collapsed = nav.classList.contains('collapsed');
    setCollapsed(!collapsed);
  });
}
