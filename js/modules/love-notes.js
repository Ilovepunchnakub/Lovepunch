const LIMIT = 40;

function read(key){
  try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch{ return []; }
}

function formatDate(ts){
  return new Date(ts).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}

export function initLoveNotes({ userId, showToast }){
  const key = `soft-love-notes:${userId}`;
  const form = document.getElementById('loveNoteForm');
  const input = document.getElementById('loveNoteInput');
  const list = document.getElementById('loveNotesList');
  const empty = document.getElementById('loveNotesEmpty');

  if(!form || !input || !list || !empty) return;

  let notes = read(key);

  const save = () => localStorage.setItem(key, JSON.stringify(notes.slice(0, LIMIT)));

  const render = () => {
    empty.hidden = notes.length > 0;
    if(!notes.length){
      list.innerHTML = '';
      return;
    }

    list.innerHTML = notes.map((note) => `
      <li class="love-note-item" data-id="${note.id}">
        <div>
          <p>${escapeHtml(note.text)}</p>
          <small>${formatDate(note.createdAt)}</small>
        </div>
        <button class="love-note-remove" type="button" aria-label="ลบโน้ตนี้">ลบ</button>
      </li>
    `).join('');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if(!text){
      showToast?.('พิมพ์ข้อความก่อนน้า');
      return;
    }

    notes.unshift({ id: crypto.randomUUID(), text, createdAt: Date.now() });
    notes = notes.slice(0, LIMIT);
    save();
    render();
    input.value = '';
    showToast?.('บันทึก Love Note แล้ว 💗');
  });

  list.addEventListener('click', (event) => {
    const btn = event.target.closest('.love-note-remove');
    if(!btn) return;

    const item = btn.closest('.love-note-item');
    if(!item) return;

    notes = notes.filter((note) => note.id !== item.dataset.id);
    save();
    render();
  });

  render();
}

function escapeHtml(text){
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
