import { qs } from './utils.js';
import { renderLoveLetter } from './loveLetter/template.js';
import { LOVE_LETTER_CONTENT } from './loveLetter/content.js';

export function createLoveLetterPage({ navigator }) {
  const pageId = 'love-play';
  const host = qs('lovePlayWrap');
  const closeBtn = qs('lovePlayClose');
  let detach = () => {};

  function moveNoButton(noBtn, wrapper) {
    const wrapperRect = wrapper.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = Math.max(24, wrapperRect.width / 2 - btnRect.width / 2 - 10);
    const maxY = Math.max(24, wrapperRect.height / 2 - btnRect.height / 2 - 8);

    const moveX = (Math.random() * 2 - 1) * maxX;
    const moveY = (Math.random() * 2 - 1) * maxY;

    noBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
    wrapper.style.setProperty('--no-x', `${moveX}px`);
    wrapper.style.setProperty('--no-y', `${moveY}px`);
  }

  function mount() {
    if (!host) return;
    host.innerHTML = renderLoveLetter();

    const root = host.querySelector('[data-love-letter]');
    const envelopeScreen = root?.querySelector('[data-envelope-screen]');
    const letterScreen = root?.querySelector('[data-letter-screen]');
    const letterWindow = root?.querySelector('[data-letter-window]');
    const yesBtn = root?.querySelector('[data-yes]');
    const noBtn = root?.querySelector('[data-no]');
    const noWrap = root?.querySelector('[data-no-wrap]');
    const title = root?.querySelector('[data-title]');
    const cat = root?.querySelector('[data-cat]');
    const finalText = root?.querySelector('[data-final]');
    const buttons = root?.querySelector('[data-buttons]');

    if (!root || !envelopeScreen || !letterScreen || !letterWindow || !yesBtn || !noBtn || !noWrap || !title || !cat || !finalText || !buttons) return;

    let yesScale = 1;
    const onOpenEnvelope = () => {
      envelopeScreen.classList.add('is-hidden');
      letterScreen.classList.add('is-open');
      letterScreen.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => letterWindow.classList.add('open'));
    };

    const onNo = () => {
      moveNoButton(noBtn, noWrap);
      yesScale = Math.min(2.2, yesScale + 0.12);
      yesBtn.style.transform = `scale(${yesScale})`;
      yesBtn.classList.remove('ll-pop');
      void yesBtn.offsetWidth;
      yesBtn.classList.add('ll-pop');
    };

    const onYes = () => {
      title.textContent = LOVE_LETTER_CONTENT.titleAccepted;
      cat.src = 'assets/images/love-letter/cat-dance.svg';
      cat.alt = 'แมวกำลังเต้น';
      buttons.classList.add('is-gone');
      letterWindow.classList.add('final');
      finalText.hidden = false;
      finalText.classList.add('is-show');
      letterWindow.classList.remove('ll-shake');
      void letterWindow.offsetWidth;
      letterWindow.classList.add('ll-shake');
    };

    const onEnvelopeKey = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onOpenEnvelope();
    };

    envelopeScreen.addEventListener('click', onOpenEnvelope);
    envelopeScreen.addEventListener('keydown', onEnvelopeKey);
    noBtn.addEventListener('mouseover', onNo);
    noBtn.addEventListener('pointerdown', onNo);
    noBtn.addEventListener('touchstart', onNo, { passive: true });
    yesBtn.addEventListener('click', onYes);

    detach = () => {
      envelopeScreen.removeEventListener('click', onOpenEnvelope);
      envelopeScreen.removeEventListener('keydown', onEnvelopeKey);
      noBtn.removeEventListener('mouseover', onNo);
      noBtn.removeEventListener('pointerdown', onNo);
      noBtn.removeEventListener('touchstart', onNo);
      yesBtn.removeEventListener('click', onYes);
    };
  }

  function close({ navigate = true } = {}) {
    detach();
    detach = () => {};
    if (host) host.innerHTML = '';
    if (navigate && navigator.current() === pageId) {
      navigator.go('home', { skipLoader: true });
    }
  }

  function open() {
    mount();
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
    destroy: () => close({ navigate: false })
  };
}
