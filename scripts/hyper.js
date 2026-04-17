import { CFG } from './config.js';
import { wait, qs } from './utils.js';
import { playHyperTimeline } from './hyperTimeline.js';
import { createHyperThreeBackground } from './hyperThreeBackground.js';
import { createHyperUiReact } from './hyperUiReact.js';

export function createHyperController() {
  let active = false;
  let runningSequence = false;

  const renderer = createHyperThreeBackground({ canvas: qs('hCanvas') });
  const ui = createHyperUiReact({
    mount: qs('hUiRoot'),
    onStart: () => startExperience()
  });

  async function showLoading() {
    renderer.setSpeed(1, true);

    const totalMs = 3600;
    const tick = 120;
    const loops = Math.ceil(totalMs / tick);

    for (let i = 0; i <= loops; i += 1) {
      if (!active || !runningSequence) return;
      const progress = Math.round((i / loops) * 100);
      ui.setLoading({
        text: progress < 100 ? 'กำลังเตรียม hyperspace...' : 'พร้อมเข้าสู่เส้นทางของเราแล้ว',
        progress
      });
      await wait(tick);
    }
  }

  async function runSequence() {
    if (runningSequence) return;
    runningSequence = true;

    await showLoading();
    if (!active || !runningSequence) {
      runningSequence = false;
      return;
    }

    ui.showMessage('เตรียมตัวเข้าสู่ hyperspace ของเรา ✨', {
      holdMs: 3000,
      fadeInMs: 850,
      fadeOutMs: 950
    });

    const completed = await playHyperTimeline({
      messages: CFG.HYPER_MESSAGES,
      showMessage: ui.showMessage,
      setSpeed: renderer.setSpeed,
      isCancelled: () => !active || !runningSequence,
      onBeforeStart: () => {
        renderer.setSpeed(1, true);
      },
      onDone: () => {}
    });

    if (!completed || !active || !runningSequence) {
      runningSequence = false;
      renderer.setSpeed(1.2);
      ui.setIdle();
      return;
    }

    ui.showFinale({
      onFinish: () => {
        if (!active) return;
        runningSequence = false;
        renderer.setSpeed(1.2);
        ui.setIdle();
      }
    });
  }

  function enterPage() {
    active = true;
    runningSequence = false;
    ui.setIdle();
    renderer.start();
  }

  function startExperience() {
    if (!active || runningSequence) return;
    runSequence();
  }

  function stop() {
    active = false;
    runningSequence = false;
    renderer.stop();
    ui.setIdle();
  }

  function init() {
    window.addEventListener('resize', renderer.resize);
    renderer.prepare();
  }

  function destroy() {
    ui.destroy();
  }

  return { init, stop, startExperience, enterPage, destroy };
}
