import { START } from '../config.js';

export function initStats({ userId }){
  const togetherMs = Date.now() - START.getTime();
  const photos = read(`soft-love-photos:${userId}`, []).length;
  const wishes = read(`soft-love-wishes:${userId}`, []);
  const done = wishes.filter((w) => w.done).length;
  const journals = Object.keys(localStorage).filter((k) => k.startsWith(`soft-love-journal:${userId}:`));
  const moods = Object.keys(localStorage)
    .filter((k) => k.startsWith(`soft-love-mood:${userId}:`))
    .map((k) => read(k, null)?.emoji)
    .filter(Boolean);
  const topMood = mode(moods) || '○';

  document.getElementById('statTogether').textContent = humanDuration(togetherMs);
  document.getElementById('statPhotos').textContent = `${photos} รูป`;
  document.getElementById('statWishes').textContent = `${done}/${wishes.length} รายการ`;
  document.getElementById('statJournal').textContent = `${journals.length} วัน`;
  document.getElementById('statMood').textContent = `${topMood} (${moods.filter((m) => m === topMood).length} ครั้ง)`;
  document.getElementById('statBless').textContent = `${Number(localStorage.getItem('soft-love-blessing-count') || 0)} ครั้ง`;

  const streak = calcStreak(journals.map((k) => k.slice(-10)));
  document.getElementById('journalStreak').textContent = streak;
  document.getElementById('streakMessage').textContent = streak ? `บันทึก Journal ติดต่อกัน ${streak} วัน 🔥` : 'เริ่มบันทึกวันนี้เลยนะ';

  const mins = Math.floor(togetherMs / 60000);
  document.getElementById('breakdownCoffee').textContent = Math.floor(mins / 20);
  document.getElementById('breakdownMovie').textContent = Math.floor(mins / 120);
  document.getElementById('breakdownFlight').textContent = Math.floor(mins / 360);

  renderAchievements(Math.floor(togetherMs / 86400000));
  renderMoodChart(userId);
}

function renderMoodChart(userId){
  const svg = document.getElementById('moodBarChart');
  if(!svg) return;
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const mood = read(`soft-love-mood:${userId}:${key}`, {}).emoji || '○';
    return { label: d.toLocaleDateString('th-TH', { weekday: 'short' }), mood };
  });
  svg.innerHTML = days.map((day, i) => `<g transform="translate(${i * 45 + 20},0)"><rect x="0" y="${day.mood === '○' ? 80 : 20}" width="28" height="${day.mood === '○' ? 20 : 80}" rx="8" fill="var(--acc)" opacity="0.6"></rect><text x="14" y="115" text-anchor="middle" font-size="10">${day.label}</text><text x="14" y="15" text-anchor="middle">${day.mood}</text></g>`).join('');
}

function renderAchievements(days){
  const milestones = [[7, '🌱 First Week'], [30, '💕 One Month'], [100, '⭐ 100 Days'], [180, '🌙 Half Year']];
  const wrap = document.getElementById('achievementBadges');
  wrap.innerHTML = milestones.map(([n, label]) => `<div class="badge ${days >= n ? 'unlocked' : ''}">${label}${days >= n ? '' : ' 🔒'}</div>`).join('');
}

function read(key, fallback){ try{ return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }catch{ return fallback; } }
function mode(arr){ return [...new Set(arr)].sort((a, b) => arr.filter((x) => x === b).length - arr.filter((x) => x === a).length)[0]; }
function humanDuration(ms){ const d = Math.floor(ms / 86400000); const h = Math.floor((ms % 86400000) / 3600000); return `${d} วัน ${h} ชั่วโมง`; }
function calcStreak(dates){
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  while(set.has(cursor.toISOString().slice(0, 10))){ streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}
