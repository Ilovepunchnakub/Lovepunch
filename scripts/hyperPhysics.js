// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/hyperPhysics.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - (2 ** (-10 * t));
}

export function mapSpeedToBeta(speed) {
  return clamp(0.06 + speed * 0.12, 0.06, 0.985);
}

export function createMetricState() {
  return {
    phase: 0,
    shimmer: Math.random() * 100,
    turbulence: Math.random() * Math.PI * 2,
    instability: 0,
    shock: 0,
    beta: 0.08,
    gamma: 1.003,
    lensingStrength: 0.055,
    beaming: 1.03,
    rearRedShift: 0.92,
    frontBlueShift: 1.06
  };
}

export function updateMetricState({ state, dt, speed, speedDelta }) {
  const beta = mapSpeedToBeta(speed);
  const gamma = 1 / Math.sqrt(Math.max(0.0018, 1 - beta ** 2));

  state.phase += dt;
  state.shimmer += dt * (0.22 + beta * 0.18);
  state.turbulence += dt * (0.8 + beta * 0.35);

  const fluctuation =
    Math.sin(state.phase * 1.5) * 0.0035 +
    Math.sin(state.phase * 0.83 + state.turbulence) * 0.0024 +
    Math.sin(state.phase * 2.7 + state.shimmer * 0.4) * 0.0018;

  const speedImpulse = clamp(Math.abs(speedDelta) * 0.28, 0, 0.22);
  state.instability = clamp(lerp(state.instability, 0.012 + fluctuation + speedImpulse, dt * 4.4), 0, 0.3);

  const shockTarget = clamp(Math.abs(speedDelta) * 0.65 + beta * 0.04, 0, 1);
  state.shock = lerp(state.shock, shockTarget, dt * 5.6);

  state.beta = beta;
  state.gamma = gamma;
  state.lensingStrength = 0.04 + beta * 0.15;
  state.beaming = 1 + (gamma - 1) * 1.45;
  state.rearRedShift = clamp(1 / (1 + beta * 0.72), 0.42, 1);
  state.frontBlueShift = clamp(1 + beta * 1.65, 1, 2.35);
}

function aberration(cosTheta, beta) {
  return (cosTheta + beta) / (1 + beta * cosTheta);
}

export function projectRelativisticStar({ star, width, height, metric, camera }) {
  const { dx, dy, dz, radiusSeed, temp, twinkleSeed, pulse } = star;

  const cosThetaPrime = aberration(dz, metric.beta);
  const sinThetaPrime = Math.sqrt(Math.max(0, 1 - cosThetaPrime ** 2));

  const angle = Math.atan2(dy, dx);
  const radial = sinThetaPrime;

  const turbulence =
    Math.sin(metric.phase * 2.5 + twinkleSeed) * metric.instability * 0.48 +
    Math.sin(metric.phase * 1.2 + pulse * 0.7) * metric.instability * 0.34;

  const lensRadius = Math.max(0.035, radial);
  const lensDeflect = metric.lensingStrength / (lensRadius * 16 + 0.35);
  const compressed = radial * (1 - metric.beta * 0.58) + lensDeflect + turbulence;

  const focal = camera.focalPx;
  const px = width * 0.5 + Math.cos(angle) * compressed * focal;
  const py = height * 0.5 + Math.sin(angle) * compressed * focal;

  const distScale = 0.35 + (1 - radiusSeed) * 1.45;
  const beaming = Math.max(0.01, (1 + metric.beta * cosThetaPrime) ** 3);
  const intensity = beaming * distScale * metric.beaming;

  const blueMix = clamp((cosThetaPrime + 1) * 0.5, 0, 1);
  const doppler = lerp(metric.rearRedShift, metric.frontBlueShift, blueMix);

  const baseSize = clamp(0.3 + intensity * 0.24, 0.25, 3.6);
  const blur = clamp(2.2 + metric.instability * 24 + (1 - radial) * 2.2, 0.8, 9);

  const shiftedTemp = clamp(temp * doppler, 1800, 20000);
  return {
    x: px,
    y: py,
    intensity,
    shiftedTemp,
    size: baseSize,
    blur,
    edge: radial,
    visible: Number.isFinite(px) && Number.isFinite(py)
  };
}

export function temperatureToRGB(kelvin) {
  const t = kelvin / 100;

  let r;
  let g;
  let b;

  if (t <= 66) {
    r = 255;
    g = 99.47 * Math.log(t) - 161.12;
    b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  } else {
    r = 329.7 * ((t - 60) ** -0.1332);
    g = 288.12 * ((t - 60) ** -0.0755);
    b = 255;
  }

  return {
    r: Math.round(clamp(r, 0, 255)),
    g: Math.round(clamp(g, 0, 255)),
    b: Math.round(clamp(b, 0, 255))
  };
}
