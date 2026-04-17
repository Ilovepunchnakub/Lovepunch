import { wait, qs } from './utils.js';

const SEGMENT_COUNT = 30;

export function createFakePageLoader() {
  const overlay = qs('globalFakeLoader');
  const cat = overlay?.querySelector('[data-loader-cat]');
  let lockCount = 0;

  if (cat && cat.children.length === 0) {
    for (let i = 0; i < SEGMENT_COUNT; i += 1) {
      const segment = document.createElement('span');
      segment.className = 'fake-loader-cat__segment';
      segment.style.setProperty('--delay', `${(i * -0.05).toFixed(2)}s`);
      cat.appendChild(segment);
    }
  }

  function applyState() {
    if (!overlay) return;
    const show = lockCount > 0;
    overlay.classList.toggle('show', show);
    overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function show() {
    lockCount += 1;
    applyState();
  }

  function hide() {
    lockCount = Math.max(0, lockCount - 1);
    applyState();
  }

  async function run({ minMs = 1400, beforeSwitch } = {}) {
    show();
    try {
      beforeSwitch?.();
      await wait(minMs);
    } finally {
      hide();
    }
  }

  return {
    show,
    hide,
    run,
    isVisible: () => lockCount > 0
  };
}
