/**
 * 墨流し GPU 流體 shader 組。
 * 求解器結構(advection / curl / vorticity / divergence / pressure Jacobi /
 * gradient subtract / splat,ping-pong 雙 FBO)參考 Pavel Dobryakov 的
 * WebGL-Fluid-Simulation(MIT)重寫;顯示層改為吸收模型 + 和紙紋理。
 */

export const baseVertex = /* glsl */ `
precision highp float;
attribute vec3 position;
varying vec2 vUv;
void main () {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** 注入:在 uPoint 處以高斯衰減把 uColor 加進場(速度場加力、染料場加墨) */
export const splatFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float uAspectRatio;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
void main () {
  vec2 p = vUv - uPoint;
  p.x *= uAspectRatio;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`;

/** 平流:沿速度場回溯取樣,並以 dissipation 緩慢衰減 */
export const advectionFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;
void main () {
  vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
  vec4 result = texture2D(uSource, coord);
  float decay = 1.0 + uDissipation * uDt;
  gl_FragColor = result / decay;
}
`;

export const curlFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
void main () {
  float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
  float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`;

/** 渦度約束:把數值耗散掉的小漩渦補回來(CURL 控制強度) */
export const vorticityFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlStrength;
uniform float uDt;
uniform vec2 uTexelSize;
void main () {
  float L = texture2D(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture2D(uCurl, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture2D(uCurl, vUv - vec2(0.0, uTexelSize.y)).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * uDt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

export const divergenceFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
void main () {
  vec2 vL = vUv - vec2(uTexelSize.x, 0.0);
  vec2 vR = vUv + vec2(uTexelSize.x, 0.0);
  vec2 vT = vUv + vec2(0.0, uTexelSize.y);
  vec2 vB = vUv - vec2(0.0, uTexelSize.y);
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

/** 壓力場衰減(每幀 ×uValue,讓解穩定) */
export const clearFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uValue;
void main () {
  gl_FragColor = uValue * texture2D(uTexture, vUv);
}
`;

/** Jacobi 迭代解壓力 Poisson 方程 */
export const pressureFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;
void main () {
  float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

/** 減去壓力梯度 → 無散度速度場(不可壓縮流) */
export const gradientSubtractFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
void main () {
  float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

/**
 * 顯示層:染料場存的是「吸收量」。
 * 和紙 = 底色 × 高/中/低頻纖維 noise + 極淡 vignette;
 * 墨色 = paper * exp(-absorption)(減法混色,墨沉進紙裡);
 * 夜墨模式 = 墨的本色(提亮)覆於暗紙,濃墨成霧灰、彩墨成粉彩。
 */
export const displayFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uDye;
uniform vec3 uPaper;
uniform float uDark;
uniform float uNoiseStrength;
uniform float uAspect;

float hash (vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise (vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main () {
  vec3 absorption = texture2D(uDye, vUv).rgb;

  // 和紙纖維:高頻(橫/直向拉長)+ 中頻斑駁 + 低頻雲狀
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  float fiberH = vnoise(p * vec2(340.0, 70.0));
  float fiberV = vnoise(p * vec2(60.0, 300.0));
  float mid = vnoise(p * 34.0);
  float low = vnoise(p * 6.5);
  float fiber = fiberH * 0.34 + fiberV * 0.16 + mid * 0.22 + low * 0.28;
  vec3 paper = uPaper * (1.0 - uNoiseStrength * (fiber - 0.5));

  // 纖維讓墨略為咬色,邊緣不死平
  absorption *= 1.0 + 0.18 * (fiber - 0.5);

  // 全域濃度微降 15%:配合內容走廊遮罩提升文字可讀性
  absorption *= 0.85;

  // 減法混色
  vec3 trans = exp(-absorption);
  vec3 litColor = paper * trans;

  // 夜墨
  float cover = 1.0 - (trans.r + trans.g + trans.b) / 3.0;
  vec3 body = pow(trans, vec3(0.5));
  vec3 darkColor = mix(paper, body, smoothstep(0.0, 0.85, cover));

  vec3 color = mix(litColor, darkColor, uDark);

  // 極淡 vignette
  float d = length(vUv - 0.5);
  color *= mix(1.0, 0.93, smoothstep(0.35, 0.85, d));

  gl_FragColor = vec4(color, 1.0);
}
`;
