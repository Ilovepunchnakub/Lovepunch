const THEMES = [
  { id: 'sakura', name: '🌸 Sakura', bg1: '#fff0f5', bg2: '#ffe0ec', acc: '#f472b6', txt: '#7a5a95' },
  { id: 'galaxy', name: '🌌 Galaxy', bg1: '#0d0a1e', bg2: '#1a1035', acc: '#a78bfa', txt: '#e9e1ff' },
  { id: 'ocean', name: '🌊 Ocean', bg1: '#e0f7fa', bg2: '#b2ebf2', acc: '#0288d1', txt: '#21546a' },
  { id: 'sunset', name: '🌅 Sunset', bg1: '#fff3e0', bg2: '#ffe0b2', acc: '#f57c00', txt: '#845544' },
  { id: 'forest', name: '🌿 Forest', bg1: '#e8f5e9', bg2: '#c8e6c9', acc: '#388e3c', txt: '#355d37' },
  { id: 'candy', name: '🍬 Candy', bg1: '#fce4ec', bg2: '#f8bbd0', acc: '#e91e63', txt: '#7d3554' }
];

export function initTheme({ userId, showToast }){
  const key = `soft-love-settings:${userId || 'guest'}`;
  const root = document.documentElement;
  const state = loadSettings(key);
  applyThemeState(state);

  const grid = document.getElementById('themePresetGrid');
  if(grid){
    grid.innerHTML = THEMES.map((theme) => `
      <button class="theme-card ${state.themeId === theme.id ? 'active' : ''}" data-theme="${theme.id}" type="button">
        <span class="theme-strip" style="background:linear-gradient(90deg,${theme.bg1},${theme.bg2});"></span>
        <strong>${theme.name}</strong>
      </button>
    `).join('');

    grid.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-theme]');
      if(!btn) return;
      const theme = THEMES.find((item) => item.id === btn.dataset.theme);
      if(!theme) return;
      state.themeId = theme.id;
      state.bg = theme.bg1;
      state.acc = theme.acc;
      state.txt = theme.txt;
      applyThemeState(state);
      persist(key, state);
      Array.from(grid.children).forEach((el) => el.classList.toggle('active', el === btn));
    });
  }

  bindColor('customBgPicker', 'bg', key, state);
  bindColor('customAccPicker', 'acc', key, state);
  bindColor('customTxtPicker', 'txt', key, state);

  const fontSlider = document.getElementById('fontSizeSlider');
  const fontLabel = document.getElementById('fontSizeLabel');
  if(fontSlider){
    fontSlider.value = String(state.fontSize || 16);
    fontLabel.textContent = `${fontSlider.value}px`;
    fontSlider.addEventListener('input', () => {
      state.fontSize = Number(fontSlider.value);
      root.style.setProperty('--font-size-base', `${state.fontSize}px`);
      fontLabel.textContent = `${state.fontSize}px`;
      persist(key, state);
    });
  }

  ['hearts', 'cursor', 'blob'].forEach((type) => {
    const el = document.getElementById(`toggle-${type}`);
    if(!el) return;
    el.checked = state.animations[type] !== false;
    el.addEventListener('change', () => {
      state.animations[type] = el.checked;
      document.body.dataset[`anim${type}`] = String(el.checked);
      persist(key, state);
    });
  });

  const langToggle = document.getElementById('langToggle');
  if(langToggle){
    langToggle.value = state.lang || 'th';
    langToggle.addEventListener('change', () => {
      state.lang = langToggle.value;
      document.documentElement.lang = state.lang;
      persist(key, state);
      showToast?.(state.lang === 'th' ? 'เปลี่ยนภาษาแล้ว' : 'Language switched');
    });
  }

  document.getElementById('resetThemeBtn')?.addEventListener('click', () => {
    const sakura = THEMES[0];
    state.themeId = sakura.id;
    state.bg = sakura.bg1;
    state.acc = sakura.acc;
    state.txt = sakura.txt;
    applyThemeState(state);
    persist(key, state);
  });

  return { applyThemeState: () => applyThemeState(state) };
}

function bindColor(id, keyName, storageKey, state){
  const el = document.getElementById(id);
  if(!el) return;
  el.value = state[keyName] || el.value;
  el.addEventListener('input', () => {
    state[keyName] = el.value;
    applyThemeState(state);
    persist(storageKey, state);
  });
}

function applyThemeState(state){
  const root = document.documentElement;
  root.style.setProperty('--bg1', state.bg);
  root.style.setProperty('--bg2', state.bg2 || state.bg);
  root.style.setProperty('--acc', state.acc);
  root.style.setProperty('--txt', state.txt);
  root.style.setProperty('--font-size-base', `${state.fontSize || 16}px`);
  root.style.setProperty('--theme-name', `"${state.themeId || 'Sakura'}"`);
  root.style.setProperty('--animation-speed', String(state.animationSpeed || 1));
}

function loadSettings(key){
  const fallback = { themeId: 'sakura', bg: '#fff0f5', bg2: '#ffe0ec', acc: '#f472b6', txt: '#7a5a95', fontSize: 16, lang: 'th', animations: { hearts: true, cursor: true, blob: true } };
  try{ return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') }; }catch{ return fallback; }
}

function persist(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}
