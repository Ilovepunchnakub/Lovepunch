export function initInteractionEffects() {
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#lovePlayWrap')) return;

    const target = e.target.closest('button, .soft-card, .fc, .ni');
    if (!target) return;

    target.classList.add('tap-pop');
    setTimeout(() => target.classList.remove('tap-pop'), 240);

    const burst = document.createElement('span');
    burst.className = 'click-burst';
    burst.style.left = `${e.clientX}px`;
    burst.style.top = `${e.clientY}px`;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 520);
  });
}
