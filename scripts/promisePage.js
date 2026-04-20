import { CFG } from './config.js';
import { qs } from './utils.js';

export function createPromisePage({ navigator }) {
  const pageId = 'promise';
  const headingEl = qs('promiseHeading');
  const messageEl = qs('promiseMessage');
  const ctaBtn = qs('promiseCta');
  const closeBtn = qs('promiseClose');
  let detach = () => {};

  function bindActions() {
    const onClose = () => close();
    const onCta = () => close();

    closeBtn?.addEventListener('click', onClose);
    ctaBtn?.addEventListener('click', onCta);

    detach = () => {
      closeBtn?.removeEventListener('click', onClose);
      ctaBtn?.removeEventListener('click', onCta);
      detach = () => {};
    };
  }

  function syncContent() {
    if (headingEl) headingEl.textContent = CFG.PROMISE_CONTENT.heading;
    if (messageEl) messageEl.textContent = CFG.PROMISE_CONTENT.message;
    if (ctaBtn) ctaBtn.textContent = CFG.PROMISE_CONTENT.cta;
  }

  function init() {
    syncContent();
    bindActions();

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (navigator.current() !== pageId) return;
      event.preventDefault();
      close();
    });
  }

  function open() {
    syncContent();
    navigator.go(pageId);
  }

  function close({ navigate = true } = {}) {
    if (navigate && navigator.current() === pageId) {
      navigator.go('cards', { skipLoader: true });
    }
  }

  return {
    init,
    open,
    close,
    destroy: () => {
      detach();
    }
  };
}
