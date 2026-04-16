const CARD_THEMES = [
  {
    className: 'theme-sakura',
    icon: '🌸',
    items: ['🌸', '✨', '💗', '🫧'],
    intervalMs: 320,
    durationMs: 6200
  },
  {
    className: 'theme-hearts',
    icon: '💖',
    items: ['💘', '💞', '💕', '💓'],
    intervalMs: 340,
    durationMs: 6400
  },
  {
    className: 'theme-stars',
    icon: '⭐',
    items: ['⭐', '🌟', '✨', '💫'],
    intervalMs: 360,
    durationMs: 6600
  },
  {
    className: 'theme-moon',
    icon: '🌙',
    items: ['🌙', '☁️', '🌌', '✨'],
    intervalMs: 390,
    durationMs: 6500
  }
];

export function pickCardTheme(index) {
  return CARD_THEMES[index % CARD_THEMES.length];
}

export function startModalThemeFx({ layer, theme }) {
  if (!layer || !theme) return () => {};

  layer.innerHTML = '';
  layer.className = `modal-fx-layer ${theme.className}`;

  let active = true;
  const started = performance.now();
  const spawnTimers = [];

  const spawn = () => {
    if (!active) return;
    const item = document.createElement('span');
    item.className = 'modal-fx-item';
    item.textContent = theme.items[Math.floor(Math.random() * theme.items.length)];
    item.style.left = `${10 + Math.random() * 80}%`;
    item.style.setProperty('--dur', `${4.5 + Math.random() * 2.6}s`);
    item.style.setProperty('--delay', `${Math.random() * 0.4}s`);
    item.style.setProperty('--drift', `${(Math.random() - 0.5) * 46}px`);
    layer.appendChild(item);

    setTimeout(() => item.remove(), 7400);
  };

  const loop = () => {
    if (!active) return;
    if (performance.now() - started > theme.durationMs) return;
    spawn();
    spawnTimers.push(setTimeout(loop, theme.intervalMs));
  };

  loop();

  return () => {
    active = false;
    spawnTimers.forEach((timer) => clearTimeout(timer));
    layer.innerHTML = '';
  };
}
