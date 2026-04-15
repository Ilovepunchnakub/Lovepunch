export const qs = (id) => document.getElementById(id);
export const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

export function toast(msg) {
  const t = qs('toast');
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2200);
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
