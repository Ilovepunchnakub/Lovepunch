const BEAR_SVG = `
  <div class="love-bear" data-bear>
    <div class="love-bear-ear left"></div>
    <div class="love-bear-ear right"></div>
    <div class="love-bear-face">
      <span class="eye left"></span>
      <span class="eye right"></span>
      <span class="nose"></span>
      <span class="mouth"></span>
    </div>
  </div>
`;

const DONUT_SVG = `
  <button class="love-donut" data-donut aria-label="ลากโดนัทไปให้หมี">
    <span class="love-donut-hole"></span>
    <span class="love-donut-sprinkles" aria-hidden="true"></span>
  </button>
`;

export function renderLovePlayground() {
  return `
    <div class="love-play-inner" data-love-play>
      ${BEAR_SVG}
      ${DONUT_SVG}
    </div>
  `;
}
