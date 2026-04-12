export function initMiniGame({ userId, showToast }){
  const key = `soft-love-game:${userId}`;
  let state = load(key);
  const clickBtn = document.getElementById('loveClickBtn');
  const lpEl = document.getElementById('lpCount');
  const incomeEl = document.getElementById('lpIncome');
  const starsEl = document.getElementById('prestigeStars');

  const upgrades = {
    kiss: { cost: 10, inc: 1, label: '💋 Kiss' },
    hug: { cost: 50, inc: 5, label: '🤗 Hug' },
    letter: { cost: 200, inc: 20, label: '💌 Love Letter' },
    rose: { cost: 1000, inc: 100, label: '🌹 Rose Bouquet' }
  };

  function income(){
    return Object.entries(upgrades).reduce((sum, [name, config]) => sum + config.inc * (state.upgrades[name] || 0), 0);
  }

  function render(){
    lpEl.textContent = `${Math.floor(state.lp)} LP`;
    incomeEl.textContent = `${income()} LP per second`;
    starsEl.textContent = state.prestige;
    document.getElementById('upgradeList').innerHTML = Object.entries(upgrades).map(([name, item]) => `<button class="upgrade-btn" data-up="${name}" type="button">${item.label} (${item.cost})<small>owned: ${state.upgrades[name] || 0}</small></button>`).join('');
    document.getElementById('milestoneMessages').innerHTML = [100, 500, 2000].map((m, i) => `<li class="${state.totalEarned >= m ? 'on' : ''}">${m} LP - Message ${i + 1}</li>`).join('');
  }

  function save(){ localStorage.setItem(key, JSON.stringify(state)); render(); }

  clickBtn?.addEventListener('click', () => {
    state.lp += 1;
    state.totalEarned += 1;
    clickBtn.classList.remove('pop');
    requestAnimationFrame(() => clickBtn.classList.add('pop'));
    navigator.vibrate?.(10);
    save();
  });

  document.getElementById('upgradeList')?.addEventListener('click', (event) => {
    const up = event.target.closest('[data-up]')?.dataset.up;
    if(!up) return;
    const config = upgrades[up];
    if(state.lp < config.cost) return;
    state.lp -= config.cost;
    state.upgrades[up] = (state.upgrades[up] || 0) + 1;
    save();
  });

  document.getElementById('prestigeBtn')?.addEventListener('click', () => {
    if(state.lp < 10000){ showToast?.('ต้องมี 10,000 LP ก่อน'); return; }
    state = { lp: 0, upgrades: { kiss: 0, hug: 0, letter: 0, rose: 0 }, prestige: state.prestige + 1, totalEarned: state.totalEarned };
    save();
  });

  let timer = setInterval(() => { state.lp += income(); state.totalEarned += income(); save(); }, 1000);
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){ clearInterval(timer); }
    else{ clearInterval(timer); timer = setInterval(() => { state.lp += income(); state.totalEarned += income(); save(); }, 1000); }
  });

  render();
}

function load(key){
  try{ return { lp: 0, upgrades: { kiss: 0, hug: 0, letter: 0, rose: 0 }, prestige: 0, totalEarned: 0, ...JSON.parse(localStorage.getItem(key) || '{}') }; }
  catch{ return { lp: 0, upgrades: { kiss: 0, hug: 0, letter: 0, rose: 0 }, prestige: 0, totalEarned: 0 }; }
}
