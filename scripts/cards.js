import { qs } from './utils.js';
import { pickCardTheme, startModalThemeFx } from './cardEffects.js';

const CARD_ITEMS = [
  { id: 'today', emoji: '🌸', title: 'วันนี้', text: 'วันนี้มีเธออยู่ ทุกอย่างดูสดใสขึ้นมาก' },
  { id: 'love', emoji: '💕', title: 'ความรัก', text: 'รักเธอมากกว่า ที่จะบรรยายเป็นคำพูดได้เลย' },
  { id: 'dream', emoji: '✨', title: 'ความฝัน', text: 'เธอคือความฝัน ที่กลายเป็นความจริงของฉัน' },
  { id: 'thanks', emoji: '🙏', title: 'ขอบคุณครับ', text: 'ขอบคุณที่เลือกฉัน ขอบคุณที่รักฉัน ขอบคุณที่มีอยู่' },
  { id: 'promise', emoji: '🌙', title: 'สัญญา', text: 'สัญญาว่าจะอยู่เคียงข้างเธอทุกวัน ทุกคืน ไม่ว่าจะเกิดอะไรขึ้น' },
  { id: 'world', emoji: '🌍', title: 'โลก', text: 'โลกนี้สวยขึ้นมาก เพราะมีเธออยู่ในนั้น' },
  { id: 'heart', emoji: '💗', title: 'หัวใจ', text: 'ทุกการเต้นของหัวใจฉัน มีชื่อเธออยู่ด้วย' },
  { id: 'star', emoji: '⭐', title: 'ดาว', text: 'เธอคือดาวที่สว่างที่สุด ในชีวิตฉัน' }
];

let stopModalFx = null;
let lastFocusedElement = null;
let modalKeydownHandler = null;

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('hidden') && el.offsetParent !== null);
}

function trapDialogFocus(event, dialog) {
  if (event.key !== 'Tab') return;
  const focusable = getFocusableElements(dialog);
  if (!focusable.length) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function initCards({ onOpenLoveScene, onOpenTodayScene, onOpenDreamScene, onOpenThanksScene, onOpenPromiseScene } = {}) {
  const grid = qs('cardsGrid');
  if (!grid) {
    console.warn('[cards] #cardsGrid not found. Skipping cards initialization.');
    return { close: closeCard };
  }

  CARD_ITEMS.forEach((item, idx) => {
    const { id, emoji, title, text } = item;
    const card = document.createElement('button');
    card.className = 'fc';
    card.style.setProperty('--d', `${idx * 40}ms`);
    card.style.setProperty('--tilt', `${idx % 2 === 0 ? -1 : 1}`);
    card.innerHTML = `<div><div class="emoji">${emoji}</div><h4>${title}</h4></div>`;
    card.addEventListener('pointerdown', () => card.classList.add('pressing'));
    card.addEventListener('pointerup', () => card.classList.remove('pressing'));
    card.addEventListener('pointerleave', () => card.classList.remove('pressing'));
    card.addEventListener('click', () => {
      if (id === 'love' && typeof onOpenLoveScene === 'function') {
        onOpenLoveScene();
        return;
      }
      if (id === 'today' && typeof onOpenTodayScene === 'function') {
        onOpenTodayScene();
        return;
      }
      if (id === 'dream' && typeof onOpenDreamScene === 'function') {
        onOpenDreamScene();
        return;
      }
      if (id === 'thanks' && typeof onOpenThanksScene === 'function') {
        onOpenThanksScene();
        return;
      }
      if (id === 'promise' && typeof onOpenPromiseScene === 'function') {
        onOpenPromiseScene();
        return;
      }
      openCard({ title, text, idx, icon: emoji });
    });
    grid.appendChild(card);
  });

  qs('modalClose').addEventListener('click', closeCard);
  qs('modalBtn').addEventListener('click', closeCard);

  return { close: closeCard };
}

function openCard({ title, text, idx, icon }) {
  const activeEl = document.activeElement;
  if (activeEl instanceof HTMLElement) lastFocusedElement = activeEl;

  const theme = pickCardTheme(idx);
  qs('modalTitle').textContent = `${icon} ${title}`;
  qs('modalText').textContent = text;
  qs('cardModal').classList.add('show');
  qs('cardModal').setAttribute('aria-hidden', 'false');

  const card = qs('modalCard');
  card.classList.remove('flip-in');
  void card.offsetWidth;
  card.classList.add('flip-in');
  qs('modalBtn').focus();

  modalKeydownHandler = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCard();
      return;
    }
    trapDialogFocus(event, card);
  };
  document.addEventListener('keydown', modalKeydownHandler);

  if (stopModalFx) stopModalFx();
  stopModalFx = startModalThemeFx({
    layer: qs('cardFxLayer'),
    theme
  });
}

function closeCard({ restoreFocus = true } = {}) {
  qs('cardModal').classList.remove('show');
  qs('cardModal').setAttribute('aria-hidden', 'true');
  if (stopModalFx) {
    stopModalFx();
    stopModalFx = null;
  }
  if (modalKeydownHandler) {
    document.removeEventListener('keydown', modalKeydownHandler);
    modalKeydownHandler = null;
  }
  if (restoreFocus && lastFocusedElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}
