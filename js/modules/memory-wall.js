const MAX = 20;

export function initMemoryWall({ userId, showToast }){
  const key = `soft-love-photos:${userId}`;
  const input = document.getElementById('memoryFileInput');
  const grid = document.getElementById('memoryGrid');
  const empty = document.getElementById('memoryEmpty');
  const modal = document.getElementById('memoryModal');
  let filter = 'all';
  let items = load(key);

  function persist(){
    try{
      localStorage.setItem(key, JSON.stringify(items.slice(0, MAX)));
    }catch(error){
      showToast?.('พื้นที่จัดเก็บเต็มแล้ว ลองลบรูปบางส่วน');
    }
  }

  function render(){
    const list = items.filter((item) => filter === 'all' || item.tag === filter);
    grid.innerHTML = list.map((item) => `
      <article class="polaroid" data-id="${item.id}" style="--tilt:${Math.floor(Math.random() * 7) - 3}deg;">
        <span class="date-badge">${item.date}</span>
        <img src="${item.dataUrl}" alt="memory"/>
        <input class="caption-edit" value="${item.caption || ''}" maxlength="50"/>
        <span class="tag-pill">${item.tag}</span>
      </article>`).join('');
    empty.hidden = list.length > 0;
  }

  document.getElementById('memoryAddBtn')?.addEventListener('click', () => input?.click());
  input?.addEventListener('change', async () => {
    const files = Array.from(input.files || []);
    if(items.length + files.length > MAX) showToast?.('แนะนำเก็บไม่เกิน 20 รูป');
    for(const file of files.slice(0, Math.max(0, MAX - items.length))){
      const dataUrl = await compressImage(file);
      items.unshift({ id: crypto.randomUUID(), dataUrl, caption: '', date: new Date().toLocaleDateString('th-TH'), tag: 'Everyday' });
    }
    persist(); render();
  });

  document.getElementById('memoryFilterBar')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-filter]');
    if(!btn) return;
    filter = btn.dataset.filter;
    document.querySelectorAll('#memoryFilterBar button').forEach((item) => item.classList.toggle('active', item === btn));
    grid.classList.add('fade');
    setTimeout(() => { render(); grid.classList.remove('fade'); }, 180);
  });

  let holdTimer = 0;
  grid?.addEventListener('pointerdown', (event) => {
    const card = event.target.closest('.polaroid');
    if(!card) return;
    holdTimer = window.setTimeout(() => {
      if(confirm('ลบรูปนี้ไหม?')){
        items = items.filter((item) => item.id !== card.dataset.id);
        persist(); render();
      }
    }, 600);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => grid?.addEventListener(evt, () => clearTimeout(holdTimer)));

  grid?.addEventListener('click', (event) => {
    const card = event.target.closest('.polaroid');
    if(!card) return;
    const item = items.find((entry) => entry.id === card.dataset.id);
    if(!item) return;
    modal.querySelector('img').src = item.dataUrl;
    modal.dataset.id = item.id;
    modal.classList.add('show');
  });

  grid?.addEventListener('change', (event) => {
    const inputEl = event.target.closest('.caption-edit');
    if(!inputEl) return;
    const card = inputEl.closest('.polaroid');
    const item = items.find((entry) => entry.id === card.dataset.id);
    if(item){ item.caption = inputEl.value; persist(); }
  });

  modal?.querySelector('[data-close]')?.addEventListener('click', () => modal.classList.remove('show'));
  modal?.querySelector('[data-delete]')?.addEventListener('click', () => {
    const id = modal.dataset.id;
    items = items.filter((entry) => entry.id !== id);
    persist(); render();
    modal.classList.remove('show');
  });

  render();
}

async function compressImage(file){
  const bitmap = await createImageBitmap(file);
  const maxSide = 800;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.7);
}

function load(key){
  try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch{ return []; }
}
