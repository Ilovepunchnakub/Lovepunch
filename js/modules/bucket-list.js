export function initBucketList({ userId, showToast }){
  const key = `soft-love-wishes:${userId}`;
  const listEl = document.getElementById('wishesList');
  const ring = document.getElementById('wishProgressRing');
  let filter = 'all';
  let items = load(key);

  function save(){ localStorage.setItem(key, JSON.stringify(items)); render(); }

  function render(){
    const filtered = items.filter((item) => {
      if(filter === 'all') return true;
      if(filter === 'pending') return !item.done;
      if(filter === 'completed') return item.done;
      return item.category === filter;
    });

    listEl.innerHTML = filtered.map((item) => `<li class="wish-item ${item.done ? 'done' : ''}" draggable="true" data-id="${item.id}">
      <label><input type="checkbox" ${item.done ? 'checked' : ''}/> <span>${item.text}</span></label>
      <small>${item.category} • ${new Date(item.createdAt).toLocaleDateString('th-TH')}</small>
      <button class="wish-remove" type="button">×</button>
    </li>`).join('');

    const done = items.filter((item) => item.done).length;
    const total = items.length || 1;
    const pct = Math.round((done / total) * 100);
    ring?.style.setProperty('--pct', String(pct));
    document.getElementById('wishProgressLabel').textContent = `${done}/${items.length} รายการสำเร็จ`;
    document.getElementById('wishProgressPct').textContent = `${pct}%`;

    if(items.length > 0 && done === items.length){
      showToast?.('ครบ 100% แล้ว! 🎉');
      document.body.classList.add('emoji-shower');
      setTimeout(() => document.body.classList.remove('emoji-shower'), 1200);
    }
  }

  document.getElementById('wishAddForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = document.getElementById('wishText').value.trim();
    const category = document.getElementById('wishCategory').value;
    if(!text) return;
    items.unshift({ id: crypto.randomUUID(), text, category, done: false, doneAt: null, createdAt: new Date().toISOString() });
    document.getElementById('wishText').value = '';
    save();
  });

  document.getElementById('wishFilterBar')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-filter]');
    if(!btn) return;
    filter = btn.dataset.filter;
    document.querySelectorAll('#wishFilterBar button').forEach((item) => item.classList.toggle('active', item === btn));
    render();
  });

  listEl?.addEventListener('change', (event) => {
    const li = event.target.closest('.wish-item');
    if(!li) return;
    const item = items.find((entry) => entry.id === li.dataset.id);
    if(!item) return;
    item.done = event.target.checked;
    item.doneAt = item.done ? new Date().toISOString() : null;
    if(item.done) li.classList.add('confetti-pop');
    save();
  });

  listEl?.addEventListener('click', (event) => {
    const li = event.target.closest('.wish-item');
    if(!li || !event.target.closest('.wish-remove')) return;
    items = items.filter((entry) => entry.id !== li.dataset.id);
    save();
  });

  let dragId = null;
  listEl?.addEventListener('dragstart', (event) => { dragId = event.target.dataset.id; });
  listEl?.addEventListener('dragover', (event) => event.preventDefault());
  listEl?.addEventListener('drop', (event) => {
    const targetId = event.target.closest('.wish-item')?.dataset.id;
    if(!dragId || !targetId || dragId === targetId) return;
    const from = items.findIndex((item) => item.id === dragId);
    const to = items.findIndex((item) => item.id === targetId);
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    save();
  });

  render();
}
function load(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch{ return []; } }
