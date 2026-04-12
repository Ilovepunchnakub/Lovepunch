import { START, MILESTONE, KEYS, ANNIVERSARY_BASE, HARDCODED_USERS } from "./js/config.js";
import { initLoginGate } from "./js/modules/login-gate.js";
import { initCounter } from "./js/modules/counter.js";
import { loadUserState, saveUserState, primeUserState } from "./js/modules/local-storage-sync.js";
import { bindBlessingButton, initMemoryPlaylist } from "./js/modules/dashboard-menu-features.js";

/*
  Performance-first controller:
  - remove heavy audio synthesis (Web Audio API oscillators)
  - one shared RAF scheduler for UI updates
  - no particle effects / no nested loops / throttled input handlers
*/

const $ = {
  body: document.body,
  appMain: document.getElementById("appMain"),
  bgColorPicker: document.getElementById("bgColorPicker"),
  toast: document.getElementById("toast"),
  memoryChips: document.getElementById("memoryChips"),
  memoryQuote: document.getElementById("memoryQuote"),
  blessingBtn: document.getElementById("blessingBtn"),
  openLoveCardBtn: document.getElementById("openLoveCardBtn"),
  openSignatureBtn: document.getElementById("openSignatureBtn"),
  confirmSignatureBtn: document.getElementById("confirmSignatureBtn"),
  clearSignatureBtn: document.getElementById("clearSignatureBtn"),
  signatureModal: document.getElementById("signatureModal"),
  signatureCanvas: document.getElementById("signatureCanvas"),
  sigPlaceholder: document.getElementById("sigPlaceholder"),
  loveCardModal: document.getElementById("loveCardModal"),
  loveCardGate: document.getElementById("loveCardGate"),
  loveCardMessage: document.getElementById("loveCardMessage"),
  heartChargeBtn: document.getElementById("heartChargeBtn"),
  anniversaryView: document.getElementById("anniversaryView"),
  anniversaryDateLabel: document.getElementById("anniversaryDateLabel"),
  annivDays: document.getElementById("annivDays"),
  annivHours: document.getElementById("annivHours"),
  annivMinutes: document.getElementById("annivMinutes"),
  annivSeconds: document.getElementById("annivSeconds"),
  hamburgerBtn: document.getElementById("hamburgerBtn"),
  menuCloseBtn: document.getElementById("menuCloseBtn"),
  sideMenu: document.getElementById("sideMenu"),
  sideMenuBackdrop: document.getElementById("sideMenuBackdrop"),
  sideMenuItems: Array.from(document.querySelectorAll(".side-nav-item")),
  closeButtons: Array.from(document.querySelectorAll("[data-close]")),
  annivOverlay: document.getElementById("annivOverlay")
};

let currentUserId = localStorage.getItem(KEYS.userId) || "";
void primeUserState(currentUserId);

/* ------------------------- Audio (MP3 pool) ------------------------- */
const audioMap = {
  tap: createPooledAudio("audio/tap.mp3", 3),
  success: createPooledAudio("audio/success.mp3", 2),
  beep: createPooledAudio("audio/beep.mp3", 1)
};

function createPooledAudio(src, poolSize){
  const pool = [];
  for(let i = 0; i < poolSize; i += 1){
    const a = new Audio(src);
    a.preload = "auto";
    a.playsInline = true;
    a.load();
    pool.push(a);
  }
  return { pool, cursor: 0 };
}

function playSound(name){
  const group = audioMap[name];
  if(!group) return;
  const item = group.pool[group.cursor];
  group.cursor = (group.cursor + 1) % group.pool.length;
  item.currentTime = 0;
  void item.play().catch(() => {});
}

/* Binary support: allow optional prefetch as ArrayBuffer (non-blocking). */
["audio/tap.mp3", "audio/success.mp3", "audio/beep.mp3"].forEach((src) => {
  fetch(src).then((r) => r.arrayBuffer()).catch(() => {});
});

/* --------------------------- Core counter --------------------------- */
initCounter({ startDate: START, milestoneDays: MILESTONE });

/* --------------------------- Toast helper --------------------------- */
let toastTimer = 0;
function showToast(message){
  if(!$.toast) return;
  $.toast.textContent = message;
  $.toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => $.toast?.classList.remove("show"), 2200);
}

/* ----------------------- BG color / user state ---------------------- */
function applyBackgroundColor(hex){
  if(!hex) return;
  document.documentElement.style.setProperty("--bg1", hex);
  localStorage.setItem(KEYS.bgColor, hex);
}

const savedBg = localStorage.getItem(KEYS.bgColor);
if(savedBg) applyBackgroundColor(savedBg);

$.bgColorPicker?.addEventListener("change", () => {
  const color = $.bgColorPicker?.value;
  if(!color) return;
  applyBackgroundColor(color);
  if(currentUserId) void saveUserState(currentUserId, { background_color: color });
  playSound("tap");
}, { passive: true });

/* ---------------------------- Menu features -------------------------- */
const memoryFeature = initMemoryPlaylist({
  memoryChips: $.memoryChips,
  memoryQuote: $.memoryQuote,
  storageKey: KEYS.memory,
  saveRemote: (safe) => {
    if(currentUserId) void saveUserState(currentUserId, { memory_index: safe });
  },
  playSound
});

/* ----------------------------- Modals ------------------------------- */
function openModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  if(id === "signatureModal") resizeCanvas();
}

function closeModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  if(id === "loveCardModal") stopCharge();
}

$.closeButtons.forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close || ""), { passive: true });
});

$.openLoveCardBtn?.addEventListener("click", () => {
  resetLoveCardGate();
  openModal("loveCardModal");
  playSound("tap");
}, { passive: true });

$.openSignatureBtn?.addEventListener("click", () => {
  openModal("signatureModal");
  playSound("tap");
}, { passive: true });

/* ----------------------- Love card hold-to-fill ---------------------- */
let chargeRAF = 0;
let chargeStart = 0;
let chargeValue = 0;
const CHARGE_MS = 1200;

function resetLoveCardGate(){
  chargeValue = 0;
  $.heartChargeBtn?.style.setProperty("--fill", "0%");
  $.loveCardMessage?.classList.remove("show");
  if($.loveCardGate) $.loveCardGate.style.display = "grid";
}

function chargeStep(now){
  const ratio = Math.min(1, (now - chargeStart) / CHARGE_MS);
  chargeValue = ratio * 100;
  $.heartChargeBtn?.style.setProperty("--fill", `${chargeValue}%`);

  if(ratio >= 1){
    chargeRAF = 0;
    $.heartChargeBtn?.classList.remove("charging");
    if($.loveCardGate) $.loveCardGate.style.display = "none";
    $.loveCardMessage?.classList.add("show");
    playSound("success");
    return;
  }
  chargeRAF = requestAnimationFrame(chargeStep);
}

function startCharge(){
  if(chargeRAF || !$.heartChargeBtn) return;
  chargeStart = performance.now() - (chargeValue / 100) * CHARGE_MS;
  $.heartChargeBtn.classList.add("charging");
  chargeRAF = requestAnimationFrame(chargeStep);
}

function stopCharge(){
  $.heartChargeBtn?.classList.remove("charging");
  if(chargeRAF){
    cancelAnimationFrame(chargeRAF);
    chargeRAF = 0;
  }
}

$.heartChargeBtn?.addEventListener("mousedown", startCharge);
$.heartChargeBtn?.addEventListener("touchstart", startCharge, { passive: true });
["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) => {
  $.heartChargeBtn?.addEventListener(evt, stopCharge, { passive: true });
});

/* ------------------------- Signature canvas -------------------------- */
const canvas = $.signatureCanvas;
const ctx = canvas?.getContext("2d", { alpha: false });
let drawing = false;
let hasSignature = false;

function resizeCanvas(){
  if(!canvas || !ctx) return;
  const r = canvas.getBoundingClientRect();
  if(!r.width || !r.height) return;
  const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.floor(r.width * ratio);
  canvas.height = Math.floor(r.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#bb4ad4";
}

function pointFromEvent(event){
  if(!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;
  return { x: source.clientX - rect.left, y: source.clientY - rect.top };
}

function onStart(event){
  if(!ctx) return;
  const p = pointFromEvent(event);
  drawing = true;
  hasSignature = true;
  $.sigPlaceholder && ($.sigPlaceholder.style.opacity = "0");
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
}

function onMove(event){
  if(!drawing || !ctx) return;
  if(event.cancelable) event.preventDefault();
  const p = pointFromEvent(event);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

function onEnd(){
  if(!ctx) return;
  drawing = false;
  ctx.closePath();
}

canvas?.addEventListener("mousedown", onStart);
canvas?.addEventListener("touchstart", onStart, { passive: true });
canvas?.addEventListener("mousemove", onMove);
canvas?.addEventListener("touchmove", onMove, { passive: false });
canvas?.addEventListener("mouseup", onEnd);
canvas?.addEventListener("mouseleave", onEnd);
canvas?.addEventListener("touchend", onEnd, { passive: true });
canvas?.addEventListener("touchcancel", onEnd, { passive: true });

$.clearSignatureBtn?.addEventListener("click", () => {
  if(!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasSignature = false;
  $.sigPlaceholder && ($.sigPlaceholder.style.opacity = "1");
  playSound("tap");
}, { passive: true });

$.confirmSignatureBtn?.addEventListener("click", () => {
  if(!hasSignature){
    showToast("กรุณาเซ็นชื่อก่อนนะคะ");
    return;
  }
  closeModal("signatureModal");
  showToast("Promise confirmed");
  playSound("success");
}, { passive: true });

window.addEventListener("resize", throttle(resizeCanvas, 250), { passive: true });
resizeCanvas();

bindBlessingButton({
  blessingBtn: $.blessingBtn,
  showToast,
  playSound
});

/* ---------------------- Menu + view switching ------------------------ */
let currentView = "dashboard";
let annivTarget = getNextAnniversary(Date.now());

function openMenu(){
  $.sideMenu?.classList.add("show");
  $.sideMenuBackdrop?.classList.add("show");
  $.hamburgerBtn?.setAttribute("aria-expanded", "true");
}
function closeMenu(){
  $.sideMenu?.classList.remove("show");
  $.sideMenuBackdrop?.classList.remove("show");
  $.hamburgerBtn?.setAttribute("aria-expanded", "false");
}
function setView(view){
  currentView = view;
  const isAnniv = view === "anniversary";
  $.appMain.style.display = isAnniv ? "none" : "";
  $.anniversaryView?.classList.toggle("show", isAnniv);
  $.anniversaryView?.setAttribute("aria-hidden", String(!isAnniv));
  $.sideMenuItems.forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  closeMenu();
}

$.hamburgerBtn?.addEventListener("click", openMenu, { passive: true });
$.menuCloseBtn?.addEventListener("click", closeMenu, { passive: true });
$.sideMenuBackdrop?.addEventListener("click", closeMenu, { passive: true });
$.sideMenuItems.forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.view || "dashboard"), { passive: true });
});

/* ----------------------- Anniversary countdown ----------------------- */
function pad(n, len = 2){
  return String(n).padStart(len, "0");
}

function getNextAnniversary(baseMs){
  const now = new Date(baseMs);
  const base = new Date(ANNIVERSARY_BASE);
  const next = new Date(base);
  const months = (now.getFullYear() - base.getFullYear()) * 12 + (now.getMonth() - base.getMonth());
  next.setMonth(base.getMonth() + Math.max(0, months));
  if(next.getTime() <= now.getTime()) next.setMonth(next.getMonth() + 1);
  return next;
}

function updateAnniversary(nowMs){
  if(nowMs >= annivTarget.getTime()) annivTarget = getNextAnniversary(nowMs + 1000);
  const sec = Math.max(0, Math.floor((annivTarget.getTime() - nowMs) / 1000));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  $.annivDays && ($.annivDays.textContent = pad(d, 3));
  $.annivHours && ($.annivHours.textContent = pad(h));
  $.annivMinutes && ($.annivMinutes.textContent = pad(m));
  $.annivSeconds && ($.annivSeconds.textContent = pad(s));
  $.anniversaryDateLabel && ($.anniversaryDateLabel.textContent = `วันครบรอบถัดไป: ${annivTarget.toLocaleString("th-TH")}`);

  if(currentView === "anniversary" && sec <= 3){
    $.annivOverlay?.classList.add("show");
    $.annivOverlay?.setAttribute("aria-hidden", "false");
    $.annivOverlay && ($.annivOverlay.textContent = "Happy Anniversary");
  }else if($.annivOverlay?.classList.contains("show")){
    $.annivOverlay.classList.remove("show");
    $.annivOverlay.setAttribute("aria-hidden", "true");
    $.annivOverlay.textContent = "";
  }
}

/* --------------------- Single RAF scheduler loop --------------------- */
let rafId = 0;
let lastSecond = -1;

function frame(){
  const nowMs = Date.now();
  const sec = Math.floor(nowMs / 1000);

  if(sec !== lastSecond){
    lastSecond = sec;
    updateAnniversary(nowMs);
  }

  rafId = requestAnimationFrame(frame);
}

function startLoop(){
  if(rafId) return;
  rafId = requestAnimationFrame(frame);
}

function stopLoop(){
  if(!rafId) return;
  cancelAnimationFrame(rafId);
  rafId = 0;
}

document.addEventListener("visibilitychange", () => {
  if(document.hidden) stopLoop();
  else startLoop();
}, { passive: true });

/* ----------------------------- Login gate ---------------------------- */
initLoginGate({
  users: HARDCODED_USERS,
  onLoginSuccess: (user) => {
    currentUserId = user.userId;
    localStorage.setItem(KEYS.userId, currentUserId);

    void loadUserState(currentUserId)
      .then((state) => {
        const memoryIdx = Number(state?.memory_index);
        if(Number.isFinite(memoryIdx)) memoryFeature.setActiveMemory(memoryIdx);
        if(typeof state?.background_color === "string") applyBackgroundColor(state.background_color);
      })
      .catch(() => {});

    playSound("success");
  }
});

/* unlock audio only via explicit user interaction */
window.addEventListener("pointerdown", () => playSound("tap"), { once: true, passive: true });
startLoop();

function throttle(fn, wait){
  let last = 0;
  let timer = 0;
  return (...args) => {
    const now = Date.now();
    const remain = wait - (now - last);
    if(remain <= 0){
      last = now;
      fn(...args);
      return;
    }
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      last = Date.now();
      fn(...args);
    }, remain);
  };
}
