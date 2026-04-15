import { START, MILESTONE, KEYS, HARDCODED_USERS } from './js/config.js';
import { initLoginGate } from './js/modules/login-gate.js';
import { initCounter } from './js/modules/counter.js';
import { bindBlessingButton } from './js/modules/dashboard-menu-features.js';
import { createRouter } from './js/modules/router.js';
import { initTheme } from './js/modules/theme.js';
import { initMood } from './js/modules/mood.js';
import { initMemoryWall } from './js/modules/memory-wall.js';
import { initBucketList } from './js/modules/bucket-list.js';
import { initJournal } from './js/modules/journal.js';
import { initStats } from './js/modules/stats.js';
import { initMiniGame } from './js/modules/mini-game.js';
import { initLoveNotes } from './js/modules/love-notes.js';
import { initMusicPlayer } from './js/modules/music-player.js';

const $ = {
  toast: document.getElementById('toast'),
  sideMenu: document.getElementById('sideMenu'),
  sideMenuBackdrop: document.getElementById('sideMenuBackdrop'),
  hamburgerBtn: document.getElementById('hamburgerBtn'),
  menuCloseBtn: document.getElementById('menuCloseBtn'),
  sideMenuItems: Array.from(document.querySelectorAll('.side-nav-item')),
  closeButtons: Array.from(document.querySelectorAll('[data-close]')),
  openLoveCardBtn: document.getElementById('openLoveCardBtn'),
  openSignatureBtn: document.getElementById('openSignatureBtn'),
  loveCardModal: document.getElementById('loveCardModal'),
  signatureModal: document.getElementById('signatureModal'),
  heartChargeBtn: document.getElementById('heartChargeBtn'),
  loveCardGate: document.getElementById('loveCardGate'),
  loveCardMessage: document.getElementById('loveCardMessage'),
  signatureCanvas: document.getElementById('signatureCanvas'),
  sigPlaceholder: document.getElementById('sigPlaceholder'),
  clearSignatureBtn: document.getElementById('clearSignatureBtn'),
  confirmSignatureBtn: document.getElementById('confirmSignatureBtn'),
  blessingBtn: document.getElementById('blessingBtn'),
  currentViewTitle: document.getElementById('currentViewTitle'),
  scrollProgress: document.getElementById('scrollProgress'),
  quickJumpBtn: document.getElementById('quickJumpBtn'),
  quickJumpModal: document.getElementById('quickJumpModal'),
  quickJumpInput: document.getElementById('quickJumpInput'),
  quickJumpList: document.getElementById('quickJumpList'),
  mobileDockItems: Array.from(document.querySelectorAll('#mobileDock .dock-item'))
};

let currentUserId = localStorage.getItem(KEYS.userId) || 'guest';
let toastTimer = 0;

initCounter({ startDate: START, milestoneDays: MILESTONE });
const VIEW_META = {
  dashboard: { title: 'Love Dashboard', desc: 'ภาพรวมทั้งหมด' },
  anniversary: { title: 'Anniversary Countdown', desc: 'นับถอยหลังวันพิเศษ' },
  mood: { title: 'Mood Check-in', desc: 'บันทึกความรู้สึกวันนี้' },
  notes: { title: 'Love Notes', desc: 'ข้อความหวาน ๆ ของเรา' },
  memory: { title: 'Memory Wall', desc: 'ภาพความทรงจำของเรา' },
  music: { title: 'Our Music', desc: 'เล่นเพลงในเครื่องของเรา' },
  wishes: { title: 'Bucket List', desc: 'สิ่งที่อยากทำด้วยกัน' },
  journal: { title: 'Daily Journal', desc: 'ไดอารี่ของเรา' },
  stats: { title: 'Love Statistics', desc: 'สถิติการเดินทางของเรา' },
  game: { title: 'Love Clicker', desc: 'มินิเกมเก็บแต้ม' },
  settings: { title: 'Settings', desc: 'ปรับแต่งการใช้งาน' }
};

let quickJumpIndex = 0;
let quickJumpEntries = [];

const router = createRouter({ onChange: handleViewChange });
router.setView('dashboard');

function showToast(message){
  if(!$.toast) return;
  $.toast.textContent = message;
  $.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $.toast.classList.remove('show'), 2000);
}

function openMenu(){
  $.sideMenu?.classList.add('show');
  $.sideMenuBackdrop?.classList.add('show');
  $.hamburgerBtn?.setAttribute('aria-expanded', 'true');
}
function closeMenu(){
  $.sideMenu?.classList.remove('show');
  $.sideMenuBackdrop?.classList.remove('show');
  $.hamburgerBtn?.setAttribute('aria-expanded', 'false');
}

$.hamburgerBtn?.addEventListener('click', openMenu, { passive: true });
$.menuCloseBtn?.addEventListener('click', closeMenu, { passive: true });
$.sideMenuBackdrop?.addEventListener('click', closeMenu, { passive: true });
$.sideMenuItems.forEach((item) => {
  item.addEventListener('click', () => {
    const view = item.dataset.view || 'dashboard';
    router.setView(view);
    $.sideMenuItems.forEach((target) => target.classList.toggle('active', target === item));
    closeMenu();
  }, { passive: true });
});

document.querySelectorAll('[data-go-view]').forEach((el) => {
  el.addEventListener('click', () => router.setView(el.dataset.goView), { passive: true });
});

$.mobileDockItems.forEach((item) => {
  item.addEventListener('click', () => router.setView(item.dataset.view || 'dashboard'), { passive: true });
});

function handleViewChange(view){
  if(view === 'stats') initStats({ userId: currentUserId });

  const meta = VIEW_META[view] || VIEW_META.dashboard;
  if($.currentViewTitle) $.currentViewTitle.textContent = meta.title;
  document.title = `${meta.title} • Love Dashboard`;

  $.sideMenuItems.forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  $.mobileDockItems.forEach((item) => item.classList.toggle('active', item.dataset.view === view));

  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function openModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

$.closeButtons.forEach((btn) => btn.addEventListener('click', () => closeModal(btn.dataset.close || ''), { passive: true }));
$.openLoveCardBtn?.addEventListener('click', () => {
  $.loveCardGate.style.display = 'grid';
  $.loveCardMessage.classList.remove('show');
  $.heartChargeBtn.style.setProperty('--fill', '0%');
  openModal('loveCardModal');
});
$.openSignatureBtn?.addEventListener('click', () => openModal('signatureModal'));

let chargeRaf = 0;
let chargeStart = 0;
const CHARGE_MS = 1200;
function chargeStep(now){
  const pct = Math.min(1, (now - chargeStart) / CHARGE_MS);
  $.heartChargeBtn?.style.setProperty('--fill', `${pct * 100}%`);
  if(pct >= 1){
    cancelAnimationFrame(chargeRaf);
    chargeRaf = 0;
    $.loveCardGate.style.display = 'none';
    $.loveCardMessage.classList.add('show');
    return;
  }
  chargeRaf = requestAnimationFrame(chargeStep);
}
function startCharge(){ if(!chargeRaf){ chargeStart = performance.now(); chargeRaf = requestAnimationFrame(chargeStep); } }
function stopCharge(){ cancelAnimationFrame(chargeRaf); chargeRaf = 0; }
$.heartChargeBtn?.addEventListener('mousedown', startCharge);
$.heartChargeBtn?.addEventListener('touchstart', startCharge, { passive: true });
['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((evt) => $.heartChargeBtn?.addEventListener(evt, stopCharge, { passive: true }));

const canvas = $.signatureCanvas;
const ctx = canvas?.getContext('2d');
let drawing = false;
let hasSignature = false;

function resizeCanvas(){
  if(!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'var(--acc)';
}
function point(e){ const r = canvas.getBoundingClientRect(); const t = e.touches?.[0] || e; return { x: t.clientX - r.left, y: t.clientY - r.top }; }
function startDraw(e){ drawing = true; hasSignature = true; $.sigPlaceholder.style.opacity = 0; const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
function moveDraw(e){ if(!drawing) return; if(e.cancelable) e.preventDefault(); const p = point(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
function endDraw(){ drawing = false; ctx.closePath(); }
canvas?.addEventListener('mousedown', startDraw);
canvas?.addEventListener('touchstart', startDraw, { passive: true });
canvas?.addEventListener('mousemove', moveDraw);
canvas?.addEventListener('touchmove', moveDraw, { passive: false });
['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((evt) => canvas?.addEventListener(evt, endDraw, { passive: true }));
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();

$.clearSignatureBtn?.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasSignature = false;
  $.sigPlaceholder.style.opacity = 1;
});
$.confirmSignatureBtn?.addEventListener('click', () => {
  if(!hasSignature){ showToast('กรุณาเซ็นชื่อก่อนนะ'); return; }
  closeModal('signatureModal');
  showToast('Promise confirmed');
});

bindBlessingButton({
  blessingBtn: $.blessingBtn,
  showToast: (message) => {
    const n = Number(localStorage.getItem('soft-love-blessing-count') || 0) + 1;
    localStorage.setItem('soft-love-blessing-count', String(n));
    showToast(message);
  }
});

initLoginGate({
  users: HARDCODED_USERS,
  onLoginSuccess: (user) => {
    currentUserId = user.userId;
    localStorage.setItem(KEYS.userId, currentUserId);
    initTheme({ userId: currentUserId, showToast });
    initMood({ userId: currentUserId, showToast });
    initMemoryWall({ userId: currentUserId, showToast });
    initLoveNotes({ userId: currentUserId, showToast });
    initMusicPlayer({ userId: currentUserId, showToast });
    initBucketList({ userId: currentUserId, showToast });
    initJournal({ userId: currentUserId, showToast });
    initStats({ userId: currentUserId });
    initMiniGame({ userId: currentUserId, showToast });
    hydrateDashboard(currentUserId);
  }
});

function hydrateDashboard(userId){
  const photos = JSON.parse(localStorage.getItem(`soft-love-photos:${userId}`) || '[]').length;
  const wishes = JSON.parse(localStorage.getItem(`soft-love-wishes:${userId}`) || '[]');
  const completed = wishes.filter((item) => item.done).length;
  const journalDays = Object.keys(localStorage).filter((key) => key.startsWith(`soft-love-journal:${userId}:`)).length;
  const today = new Date().toISOString().slice(0, 10);
  const todayMood = JSON.parse(localStorage.getItem(`soft-love-mood:${userId}:${today}`) || 'null')?.emoji || '○';

  const q = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  q('quickPhotos', photos);
  q('quickWishes', `${completed}/${wishes.length}`);
  q('quickJournal', journalDays);
  q('quickMood', todayMood);

  const sneak = document.getElementById('wishSneakPeek');
  if(sneak){
    const upcoming = wishes.filter((item) => !item.done).slice(0, 2);
    sneak.innerHTML = upcoming.length ? upcoming.map((item) => `<li>${item.category} ${item.text}</li>`).join('') : '<li>เพิ่มความฝันแรกกันเลย 💕</li>';
  }

  const moodWidget = document.getElementById('todayMoodWidget');
  if(moodWidget){
    moodWidget.innerHTML = todayMood === '○'
      ? '<p>บอกอารมณ์วันนี้หน่อย 🌸</p><div class="mini-moods"><button data-go-view="mood">😊</button><button data-go-view="mood">🥰</button><button data-go-view="mood">😤</button></div>'
      : `<p>วันนี้เธอรู้สึก ${todayMood}</p>`;
  }

  const dayBadge = document.getElementById('todayDayBadge');
  const diffDays = Math.floor((Date.now() - START.getTime()) / 86400000) + 1;
  animateCount(dayBadge, diffDays);

  const quotes = [
    'รักคือการเลือกกันทุกวัน', 'วันนี้ก็ยังชอบเธอเหมือนเดิม', 'ขอบคุณที่อยู่ข้างกัน', 'รอยยิ้มเธอคือพลังใจ', 'โตไปด้วยกันนะ',
    'ทุกวันธรรมดาเพราะเธอเลยพิเศษ', 'กอดแน่น ๆ', 'เราคือทีมเดียวกัน', 'เหนื่อยได้แต่ไม่ท้อนะ', 'รักเธอมากขึ้นทุกวัน',
    'แค่เธอยิ้มก็โอเคแล้ว', 'คืนนี้ฝันดีนะ', 'อยู่กับปัจจุบันที่มีเรา', 'ความสุขเล็ก ๆ รวมกันเป็นรักใหญ่', 'เธอคือบ้านของใจ',
    'ขอบคุณที่เข้าใจกัน', 'รักแบบอ่อนโยนที่สุด', 'เดินไปด้วยกันช้า ๆ ก็ได้', 'ภูมิใจในตัวเธอนะ', 'ดีใจที่มีเธอ'
  ];
  const seed = Number(today.replaceAll('-', '')) % quotes.length;
  typewriter(document.getElementById('dailyQuote'), quotes[seed]);

  document.querySelectorAll('[data-go-view]').forEach((el) => {
    el.addEventListener('click', () => router.setView(el.dataset.goView), { passive: true });
  });
}

function openQuickJump(){
  renderQuickJump($.quickJumpInput?.value || '');
  openModal('quickJumpModal');
  setTimeout(() => $.quickJumpInput?.focus(), 30);
}

function renderQuickJump(query = ''){
  if(!$.quickJumpList) return;
  const text = query.trim().toLowerCase();
  quickJumpEntries = Object.entries(VIEW_META)
    .filter(([view, meta]) => (`${view} ${meta.title} ${meta.desc}`).toLowerCase().includes(text))
    .map(([view, meta]) => ({ view, ...meta }));

  if(!quickJumpEntries.length){
    $.quickJumpList.innerHTML = '<p class="muted">ไม่พบเมนูที่ค้นหา</p>';
    return;
  }

  quickJumpIndex = Math.min(quickJumpIndex, quickJumpEntries.length - 1);
  $.quickJumpList.innerHTML = quickJumpEntries.map((entry, index) => `
    <button type="button" class="quick-jump-option ${index === quickJumpIndex ? 'active' : ''}" data-view="${entry.view}">
      <span>${entry.title}</span>
      <small>${entry.desc}</small>
    </button>
  `).join('');
}

$.quickJumpBtn?.addEventListener('click', openQuickJump, { passive: true });
$.quickJumpInput?.addEventListener('input', (event) => {
  quickJumpIndex = 0;
  renderQuickJump(event.target.value);
});
$.quickJumpList?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-view]');
  if(!btn) return;
  router.setView(btn.dataset.view);
  closeModal('quickJumpModal');
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if((event.metaKey || event.ctrlKey) && key === 'k'){
    event.preventDefault();
    openQuickJump();
    return;
  }

  if(!$.quickJumpModal?.classList.contains('show')) return;

  if(key === 'escape'){
    closeModal('quickJumpModal');
    return;
  }

  if(key === 'arrowdown'){
    event.preventDefault();
    quickJumpIndex = Math.min(quickJumpEntries.length - 1, quickJumpIndex + 1);
    renderQuickJump($.quickJumpInput?.value || '');
  }
  if(key === 'arrowup'){
    event.preventDefault();
    quickJumpIndex = Math.max(0, quickJumpIndex - 1);
    renderQuickJump($.quickJumpInput?.value || '');
  }
  if(key === 'enter' && quickJumpEntries[quickJumpIndex]){
    event.preventDefault();
    router.setView(quickJumpEntries[quickJumpIndex].view);
    closeModal('quickJumpModal');
  }
});

let scrollRaf = 0;
window.addEventListener('scroll', () => {
  if(scrollRaf || !$.scrollProgress) return;
  scrollRaf = requestAnimationFrame(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, scrollTop / max);
    $.scrollProgress.style.transform = `scaleX(${progress})`;
    scrollRaf = 0;
  });
}, { passive: true });

function typewriter(el, text){
  if(!el) return;
  el.textContent = '';
  const chars = [...text];
  let index = 0;
  let lastTime = 0;
  const interval = 35;

  const step = (time) => {
    if(time - lastTime >= interval){
      el.textContent += chars[index] || '';
      index += 1;
      lastTime = time;
    }
    if(index < chars.length) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function animateCount(el, target){
  if(!el) return;
  let current = 0;
  const step = () => {
    current += Math.max(1, Math.ceil((target - current) / 8));
    el.textContent = `Today is Day ${current}`;
    if(current < target) requestAnimationFrame(step);
  };
  step();
}
