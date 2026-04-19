const CLICKABLE_SELECTOR = 'button, .soft-btn, .ni, .fc, .profile-toggle';

export function initClickSound() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  let lastPlay = 0;

  const playCuteClick = () => {
    const now = performance.now();
    if (now - lastPlay < 40) return;
    lastPlay = now;

    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const time = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.08, time + 0.022);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, time);
    filter.Q.setValueAtTime(0.8, time);

    gain.connect(filter);
    filter.connect(ctx.destination);

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.setValueAtTime(620, time);
    oscA.frequency.exponentialRampToValueAtTime(760, time + 0.11);

    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.setValueAtTime(430, time);
    oscB.frequency.exponentialRampToValueAtTime(510, time + 0.12);

    oscA.connect(gain);
    oscB.connect(gain);
    oscA.start(time);
    oscB.start(time + 0.005);
    oscA.stop(time + 0.2);
    oscB.stop(time + 0.22);
  };

  document.addEventListener('pointerdown', (event) => {
    const clickable = event.target.closest(CLICKABLE_SELECTOR);
    if (!clickable) return;
    playCuteClick();
  });
}
