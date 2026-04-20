import { qs, randomInt } from './utils.js';

export function createNavigator({ onPage, transitionLoader }) {
  let current = 'home';
  let switching = false;

  function closeTransientLayers() {
    // ปิดเลเยอร์ชั่วคราวที่อาจค้างหลังเปลี่ยนหน้า
    qs('fpPopup')?.classList.remove('show');
    qs('fpPopup')?.setAttribute('aria-hidden', 'true');
    qs('annivOverlay')?.classList.remove('show');
    document.body.classList.remove('anniv-focus');
  }

  function applyPage(page) {
    document.dispatchEvent(new CustomEvent('app:close-transient-layers'));
    closeTransientLayers();

    document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));
    qs(`pg-${page}`).classList.add('active');
    document.querySelectorAll('.ni').forEach((el) => el.classList.toggle('on', el.dataset.page === page));

    current = page;
    onPage(page);
  }

  async function go(page, { skipLoader = false } = {}) {
    if (!page || switching) return;
    const isSamePage = page === current;
    if (isSamePage && !skipLoader) return;

    switching = true;
    try {
      if (skipLoader || !transitionLoader) {
        applyPage(page);
      } else {
        // ให้ Loading สมจริงขึ้น: สุ่มเวลา 3-6 วินาที
        const randomLoaderMs = randomInt(3000, 6000);
        await transitionLoader.run({
          minMs: randomLoaderMs,
          beforeSwitch: () => applyPage(page)
        });
      }
    } finally {
      switching = false;
    }
  }

  function init() {
    document.querySelectorAll('.ni').forEach((el) => {
      el.addEventListener('click', () => {
        const { page, link } = el.dataset;
        if (link) {
          window.location.assign(link);
          return;
        }
        go(page);
      });
    });
  }

  return { init, go, current: () => current };
}
