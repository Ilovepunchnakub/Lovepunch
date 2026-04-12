const MOODS = [
  { emoji: '😴', label: 'ง่วง', bless: 'ง่วงก็พักก่อนน้า' },
  { emoji: '😊', label: 'สดใส', bless: 'สดใสแบบนี้โลกสดใสตามเลย' },
  { emoji: '🥰', label: 'Happy', bless: 'ดีใจที่เธอมีความสุขนะ' },
  { emoji: '😤', label: 'เครียด', bless: 'พักก่อนนะ เดี๋ยวก็ดีขึ้น' },
  { emoji: '🤒', label: 'ไม่สบาย', bless: 'ดูแลตัวเองดี ๆ นะ เราเป็นห่วง' },
  { emoji: '😢', label: 'เศร้า', bless: 'กอด ๆ นะ เดี๋ยวผ่านไปด้วยกัน' },
  { emoji: '🤩', label: 'ตื่นเต้น', bless: 'ตื่นเต้นไปด้วยกันเลย!' },
  { emoji: '😌', label: 'สงบ', bless: 'ใจสงบคือของขวัญที่ดีมาก' },
  { emoji: '🤔', label: 'กังวล', bless: 'ทีละเรื่องนะ เราอยู่ข้าง ๆ' },
  { emoji: '💪', label: 'มุ่งมั่น', bless: 'สุดยอดเลย ลุยเต็มที่!' }
];

export function initMood({ userId, showToast }){
  const today = formatDate(new Date());
  const key = `soft-love-mood:${userId}:${today}`;
  const picker = document.getElementById('moodPicker');
  const noteEl = document.getElementById('moodNote');
  const count = document.getElementById('moodCharCount');
  const blessing = document.getElementById('moodBlessing');
  let selected = null;

  if(picker){
    picker.innerHTML = MOODS.map((m) => `<button type="button" class="mood-btn" data-emoji="${m.emoji}" title="${m.label}">${m.emoji}<small>${m.label}</small></button>`).join('');
    picker.addEventListener('click', (event) => {
      const btn = event.target.closest('.mood-btn');
      if(!btn) return;
      selected = btn.dataset.emoji;
      navigator.vibrate?.(30);
      picker.querySelectorAll('.mood-btn').forEach((item) => item.classList.toggle('selected', item === btn));
      const m = MOODS.find((item) => item.emoji === selected);
      blessing.textContent = m?.bless || '';
    });
  }

  noteEl?.addEventListener('input', () => {
    const len = noteEl.value.length;
    if(len > 200) noteEl.value = noteEl.value.slice(0, 200);
    count.textContent = `${noteEl.value.length}/200`;
  });

  document.getElementById('saveMoodBtn')?.addEventListener('click', () => {
    if(!selected){ showToast?.('เลือกอารมณ์ก่อนนะ'); return; }
    localStorage.setItem(key, JSON.stringify({ emoji: selected, note: noteEl?.value || '', date: today }));
    showToast?.('บันทึกแล้วนะ');
    renderHistory(userId);
  });

  renderHistory(userId);
}

function renderHistory(userId){
  const strip = document.getElementById('moodWeekStrip');
  const pop = document.getElementById('moodHistoryPopover');
  if(!strip) return;
  const start = startOfWeek(new Date());
  const days = [...Array(7)].map((_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  strip.innerHTML = days.map((date) => {
    const d = formatDate(date);
    const entry = readMood(userId, d);
    return `<button class="day-pill" data-date="${d}" type="button"><span>${['อา','จ','อ','พ','พฤ','ศ','ส'][date.getDay()]}</span><strong>${entry?.emoji || '○'}</strong></button>`;
  }).join('');

  strip.onclick = (event) => {
    const btn = event.target.closest('[data-date]');
    if(!btn) return;
    const data = readMood(userId, btn.dataset.date);
    pop.textContent = data?.note || 'ไม่มีโน้ตของวันนี้';
  };
}

function readMood(userId, date){
  try{ return JSON.parse(localStorage.getItem(`soft-love-mood:${userId}:${date}`) || 'null'); }catch{ return null; }
}
function formatDate(d){ return d.toISOString().slice(0, 10); }
function startOfWeek(date){ const d = new Date(date); d.setDate(d.getDate() - d.getDay()); return d; }
