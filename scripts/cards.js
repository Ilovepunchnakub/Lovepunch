import { CFG } from './config.js';
import { qs } from './utils.js';
import { pickCardTheme, startModalThemeFx } from './cardEffects.js';

let stopModalFx = null;

export function initCards() {
  const grid = qs('cardsGrid');
  CFG.CARD_DATA.forEach(([emoji, title, text], idx) => {
    const card = document.createElement('button');
    card.className = 'fc';
    card.style.setProperty('--d', `${idx * 40}ms`);
    card.style.setProperty('--tilt', `${idx % 2 === 0 ? -1 : 1}`);
    card.innerHTML = `<div><div class="emoji">${emoji}</div><h4>${title}</h4></div>`;
    card.addEventListener('pointerdown', () => card.classList.add('pressing'));
    card.addEventListener('pointerup', () => card.classList.remove('pressing'));
    card.addEventListener('pointerleave', () => card.classList.remove('pressing'));
    card.addEventListener('click', () => openCard({ title, text, idx, icon: emoji }));
    grid.appendChild(card);
  });

  qs('modalClose').addEventListener('click', closeCard);
  qs('modalBtn').addEventListener('click', closeCard);
}

function openCard({ title, text, idx, icon }) {
  const theme = pickCardTheme(idx);
  qs('modalTitle').textContent = `${icon} ${title}`;
  qs('modalText').textContent = text;
  qs('cardModal').classList.add('show');

  const card = qs('modalCard');
  card.classList.remove('flip-in');
  void card.offsetWidth;
  card.classList.add('flip-in');

  if (stopModalFx) stopModalFx();
  stopModalFx = startModalThemeFx({
    layer: qs('cardFxLayer'),
    theme
  });
}

function closeCard() {
  qs('cardModal').classList.remove('show');
  if (stopModalFx) {
    stopModalFx();
    stopModalFx = null;
  }
}
