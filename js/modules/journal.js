export function initJournal({ userId, showToast }){
  const date = new Date();
  const todayKey = date.toISOString().slice(0, 10);
  const storageKey = `soft-love-journal:${userId}:${todayKey}`;
  const textarea = document.getElementById('journalTodayText');
  const status = document.getElementById('journalSaveStatus');
  const list = document.getElementById('journalTimeline');
  const search = document.getElementById('journalSearch');
  const title = document.getElementById('journalTodayDate');

  title.textContent = date.toLocaleDateString('th-TH-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const saved = localStorage.getItem(storageKey) || '';
  textarea.value = saved;
  autoResize(textarea);

  let timer = 0;
  textarea.addEventListener('input', () => {
    autoResize(textarea);
    clearTimeout(timer);
    timer = setTimeout(() => {
      const text = textarea.value.slice(0, 2000);
      localStorage.setItem(storageKey, text);
      status.textContent = 'บันทึกแล้ว ✓';
      renderTimeline(userId, search.value);
    }, 2000);
  });

  document.getElementById('journalTags')?.addEventListener('click', (event) => {
    const tag = event.target.closest('[data-tag]')?.dataset.tag;
    if(!tag) return;
    textarea.value += ` ${tag}`;
    textarea.dispatchEvent(new Event('input'));
  });

  search?.addEventListener('input', () => renderTimeline(userId, search.value));
  document.getElementById('journalCalendarToggle')?.addEventListener('click', () => {
    document.getElementById('journalCalendar').classList.toggle('show');
    buildCalendar(userId);
  });

  document.getElementById('journalExportBtn')?.addEventListener('click', () => {
    const entries = collectEntries(userId).map((item) => `${item.date}\n${item.text}\n`).join('\n');
    const blob = new Blob([entries], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `journal-${userId}.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast?.('Export แล้ว');
  });

  renderTimeline(userId, '');
}

function renderTimeline(userId, query){
  const list = document.getElementById('journalTimeline');
  const entries = collectEntries(userId).filter((entry) => !query || entry.text.includes(query));
  list.innerHTML = entries.map((entry) => `<article class="journal-item"><button class="journal-expand" type="button"><strong>${entry.date}</strong><p>${truncate(entry.text)}</p></button><div class="journal-full">${entry.text}</div></article>`).join('');
  list.querySelectorAll('.journal-expand').forEach((btn) => btn.addEventListener('click', () => btn.parentElement.classList.toggle('open')));
}

function collectEntries(userId){
  const prefix = `soft-love-journal:${userId}:`;
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 365)
    .map((key) => ({ date: key.slice(-10), text: localStorage.getItem(key) || '' }));
}

function buildCalendar(userId){
  const wrap = document.getElementById('journalCalendar');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  const entries = new Set(collectEntries(userId).map((item) => item.date));
  wrap.innerHTML = [...Array(total)].map((_, i) => {
    const d = new Date(year, month, i + 1).toISOString().slice(0, 10);
    return `<button type="button" class="cal-day ${entries.has(d) ? 'has-entry' : ''}" data-date="${d}">${i + 1}</button>`;
  }).join('');
  wrap.onclick = (event) => {
    const date = event.target.closest('[data-date]')?.dataset.date;
    if(!date) return;
    const text = localStorage.getItem(`soft-love-journal:${userId}:${date}`) || 'ไม่มีบันทึก';
    alert(`${date}\n\n${text}`);
  };
}

function autoResize(el){ el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
function truncate(text){ return text.split('\n').slice(0, 2).join(' ').slice(0, 120); }
