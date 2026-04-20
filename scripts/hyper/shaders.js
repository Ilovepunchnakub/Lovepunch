// คอมเมนต์ภาษาไทยเพื่ออธิบายไฟล์: scripts/hyper/shaders.js
// ไฟล์นี้เป็นส่วนหนึ่งของระบบเว็บ และถูกแยกเป็นโมดูลเพื่อให้อ่าน/แก้ไขง่าย

export const starVertexShader = `
  attribute float size;
  attribute float seed;

  uniform float uSpeed;
  varying float vDepth;
  varying float vSeed;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depth = clamp((-mvPosition.z) / 2800.0, 0.0, 1.0);
    vDepth = depth;
    vSeed = seed;

    float warpStretch = 1.0 + (uSpeed * 0.14) + (depth * uSpeed * 0.11);
    gl_PointSize = size * (280.0 / -mvPosition.z) * warpStretch;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const starFragmentShader = `
  varying float vDepth;
  varying float vSeed;

  vec3 palette(float t) {
    vec3 a = vec3(0.50, 0.50, 0.55);
    vec3 b = vec3(0.50, 0.40, 0.40);
    vec3 c = vec3(1.00, 1.00, 1.00);
    vec3 d = vec3(0.10, 0.20, 0.32);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float radius = length(centered);

    float laneStretch = mix(1.0, 0.32, clamp(vDepth, 0.0, 1.0));
    float stretched = length(vec2(centered.x * laneStretch, centered.y));

    if (stretched > 0.56) discard;

    float core = smoothstep(0.20, 0.0, stretched);
    float halo = smoothstep(0.56, 0.02, stretched) * 0.6;

    float hueMix = fract(vSeed + vDepth * 0.72);
    vec3 rainbow = palette(hueMix);
    vec3 warm = vec3(1.0, 0.90, 0.84);
    vec3 cool = vec3(0.68, 0.84, 1.0);
    vec3 tint = mix(warm, cool, hueMix);
    vec3 color = mix(rainbow, tint, 0.45);

    float alpha = (core * 0.92 + halo * 0.66) * (0.36 + vDepth * 1.25);
    gl_FragColor = vec4(color, alpha);
  }
`;
