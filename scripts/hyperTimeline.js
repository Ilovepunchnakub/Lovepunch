import { wait } from './utils.js';

const PREPARE_DELAY_MS = 5600;
const WELCOME_HOLD_MS = 3800;
const PRE_MESSAGE_ANIMATION_MS = 1350;
const HOLD_MS = 5000;
const TRAVEL_MS = 5600;

export async function playHyperTimeline({
  messages,
  showMessage,
  setSpeed,
  onBeforeStart,
  onDone,
  isCancelled
}) {
  await wait(PREPARE_DELAY_MS);
  if (isCancelled()) return;

  onBeforeStart();
  await wait(WELCOME_HOLD_MS);
  if (isCancelled()) return;

  for (let i = 0; i < messages.length; i += 1) {
    if (isCancelled()) return;

    const stage = i + 1;
    const cruiseSpeed = 1 + stage * 0.52;

    setSpeed(0.05, true);
    await wait(PRE_MESSAGE_ANIMATION_MS);
    if (isCancelled()) return;

    showMessage(messages[i]);
    await wait(HOLD_MS);
    if (isCancelled()) return;

    await accelerateSmoothly(1, cruiseSpeed, 1150, setSpeed, isCancelled);
    if (isCancelled()) return;

    setSpeed(cruiseSpeed);
    await wait(TRAVEL_MS);
  }

  onDone();
}

async function accelerateSmoothly(from, to, durationMs, setSpeed, isCancelled) {
  const step = 100;
  const loops = Math.max(1, Math.floor(durationMs / step));

  for (let i = 0; i <= loops; i += 1) {
    if (isCancelled()) return;
    const t = i / loops;
    const eased = from + (to - from) * easeInOut(t);
    setSpeed(eased);
    await wait(step);
  }
}

function easeInOut(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - ((-2 * t + 2) ** 3) / 2;
}
