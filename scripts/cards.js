import { CFG } from './config.js';
import { qs } from './utils.js';

export function initCards() {
  const grid = qs('cardsGrid');
  CFG.CARD_DATA.forEach(([emoji, title, text], idx) => {
    const card = document.createElement('button');
    card.className = 'fc';
    card.style.setProperty('--d', `${idx * 40}ms`);
    card.innerHTML = `<div><div class="emoji">${emoji}</div><h4>${title}</h4></div>`;
    card.addEventListener('click', () => openCard(title, text));
    grid.appendChild(card);
  });

  qs('modalClose').addEventListener('click', closeCard);
  qs('modalBtn').addEventListener('click', closeCard);
}

function openCard(title, text) {
  qs('modalTitle').textContent = title;
  qs('modalText').textContent = text;
  qs('cardModal').classList.add('show');
  qs('modalCard').classList.remove('flip-in');
  requestAnimationFrame(() => qs('modalCard').classList.add('flip-in'));
}

function closeCard() {
  qs('cardModal').classList.remove('show');
}
