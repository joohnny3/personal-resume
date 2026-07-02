import type * as THREE from "three";
import { INKS, hexToAbsorption } from "./inks";
import {
  advectionFrag,
  baseVertex,
  clearFrag,
  curlFrag,
  displayFrag,
  divergenceFrag,
  gradientSubtractFrag,
  pressureFrag,
  splatFrag,
  vorticityFrag,
} from "./shaders";

type ThreeModule = typeof THREE;

/** 求解參數基準(PLAN.md 步驟 4);行動裝置降解析度 */
const PARAMS = {
  SIM_RES: 256,
  DYE_RES: 1280,
  PRESSURE_ITER: 28,
  VEL_DISSIPATION: 0.16,
  DYE_DISSIPATION: 0.07,
  CURL: 14,
  SPLAT_RADIUS: 0.0026,
  SPLAT_FORCE: 5200,
  PRESSURE_DECAY: 0.8,
};

const LIGHT_PAPER = { r: 0.957, g: 0.937, b: 0.89 }; // #f4efe3 和紙
const DARK_PAPER = { r: 0.086, g: 0.086, b: 0.102 }; // #16161a 夜墨
const NOISE_LIGHT = 0.11;
const NOISE_DARK = 0.07;

interface DoubleFbo {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  texelSize: THREE.Vector2;
  swap(): void;
}

interface SplatCmd {
  u: number;
  v: number;
  fx: number;
  fy: number;
  dyeStrength: number;
  radiusScale: number;
  ink: number;
}

export class FluidSim {
  private T: ThreeModule;
  private canvas: HTMLCanvasElement;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private mesh!: THREE.Mesh;
  private geometry!: THREE.BufferGeometry;

  private splatMat!: THREE.RawShaderMaterial;
  private advectionMat!: THREE.RawShaderMaterial;
  private curlMat!: THREE.RawShaderMaterial;
  private vorticityMat!: THREE.RawShaderMaterial;
  private divergenceMat!: THREE.RawShaderMaterial;
  private clearMat!: THREE.RawShaderMaterial;
  private pressureMat!: THREE.RawShaderMaterial;
  private gradientMat!: THREE.RawShaderMaterial;
  private displayMat!: THREE.RawShaderMaterial;

  private velocity!: DoubleFbo;
  private dye!: DoubleFbo;
  private pressure!: DoubleFbo;
  private divergenceRT!: THREE.WebGLRenderTarget;
  private curlRT!: THREE.WebGLRenderTarget;

  private queue: SplatCmd[] = [];
  private pointers = new Map<number, { x: number; y: number }>();
  private inkIndex = 0;
  private inkAbsorptions = INKS.map((ink) => hexToAbsorption(ink.hex));

  private paperCur = { ...LIGHT_PAPER };
  private paperTgt = { ...LIGHT_PAPER };
  private darkCur = 0;
  private darkTgt = 0;

  private simRes: number;
  private dyeRes: number;
  private dprCap: number;

  private raf = 0;
  private lastTime = 0;
  private disposed = false;
  private resizeTimer: ReturnType<typeof setTimeout> | undefined;
  private themeObserver?: MutationObserver;

  constructor(canvas: HTMLCanvasElement, three: ThreeModule) {
    this.canvas = canvas;
    this.T = three;
    const coarse =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    this.simRes = coarse ? 192 : PARAMS.SIM_RES;
    this.dyeRes = coarse ? 720 : PARAMS.DYE_RES;
    this.dprCap = coarse ? 1.5 : 2;
  }

  /** 回傳 false = 環境不支援(無 WebGL2 / 無 float render target),留在靜態和紙 */
  init(): boolean {
    const T = this.T;
    const gl = this.canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) return false;
    if (!gl.getExtension("EXT_color_buffer_float")) return false;

    this.renderer = new T.WebGLRenderer({
      canvas: this.canvas,
      context: gl,
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.dprCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.camera = new T.Camera();
    this.scene = new T.Scene();
    this.geometry = new T.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new T.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
    );

    this.splatMat = this.mat(splatFrag, {
      uTarget: { value: null },
      uAspectRatio: { value: 1 },
      uColor: { value: new T.Vector3() },
      uPoint: { value: new T.Vector2() },
      uRadius: { value: PARAMS.SPLAT_RADIUS },
    });
    this.advectionMat = this.mat(advectionFrag, {
      uVelocity: { value: null },
      uSource: { value: null },
      uTexelSize: { value: new T.Vector2() },
      uDt: { value: 0.016 },
      uDissipation: { value: PARAMS.VEL_DISSIPATION },
    });
    this.curlMat = this.mat(curlFrag, {
      uVelocity: { value: null },
      uTexelSize: { value: new T.Vector2() },
    });
    this.vorticityMat = this.mat(vorticityFrag, {
      uVelocity: { value: null },
      uCurl: { value: null },
      uCurlStrength: { value: PARAMS.CURL },
      uDt: { value: 0.016 },
      uTexelSize: { value: new T.Vector2() },
    });
    this.divergenceMat = this.mat(divergenceFrag, {
      uVelocity: { value: null },
      uTexelSize: { value: new T.Vector2() },
    });
    this.clearMat = this.mat(clearFrag, {
      uTexture: { value: null },
      uValue: { value: PARAMS.PRESSURE_DECAY },
    });
    this.pressureMat = this.mat(pressureFrag, {
      uPressure: { value: null },
      uDivergence: { value: null },
      uTexelSize: { value: new T.Vector2() },
    });
    this.gradientMat = this.mat(gradientSubtractFrag, {
      uPressure: { value: null },
      uVelocity: { value: null },
      uTexelSize: { value: new T.Vector2() },
    });
    this.displayMat = this.mat(displayFrag, {
      uDye: { value: null },
      uPaper: { value: new T.Vector3(LIGHT_PAPER.r, LIGHT_PAPER.g, LIGHT_PAPER.b) },
      uDark: { value: 0 },
      uNoiseStrength: { value: NOISE_LIGHT },
      uAspect: { value: 1 },
    });

    this.mesh = new T.Mesh(this.geometry, this.displayMat);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    this.initFramebuffers();
    this.syncThemeTarget(true);

    this.themeObserver = new MutationObserver(() => this.syncThemeTarget(false));
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerRelease);
    window.addEventListener("pointercancel", this.onPointerRelease);
    window.addEventListener("resize", this.onResize);

    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.frame);
    return true;
  }

  setInk(index: number) {
    this.inkIndex = Math.max(0, Math.min(INKS.length - 1, index));
  }

  /** 於正規化座標(0~1,左上原點)滴一滴墨;供初始墨與除錯用 */
  splatAt(x: number, y: number, ink = this.inkIndex, strength = 0.9) {
    const angle = Math.random() * Math.PI * 2;
    this.queue.push({
      u: x,
      v: 1 - y,
      fx: Math.cos(angle) * 60,
      fy: Math.sin(angle) * 60,
      dyeStrength: strength,
      radiusScale: 2.4,
      ink,
    });
  }

  /** 開場墨:靜候互動前,紙上先有幾滴溫和的流動 */
  dropInitialInk() {
    const drops: [number, number, number, number, number][] = [
      // [x, y, ink, fx, fy]
      [0.3, 0.38, 0, 70, 25],
      [0.52, 0.55, 1, -55, -35],
      [0.68, 0.4, 2, 40, 45],
      [0.58, 0.3, 3, -45, 30],
    ];
    for (const [x, y, ink, fx, fy] of drops) {
      this.queue.push({
        u: x,
        v: 1 - y,
        fx,
        fy,
        dyeStrength: 0.75,
        radiusScale: 2.2,
        ink,
      });
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.resizeTimer);
    this.themeObserver?.disconnect();
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerRelease);
    window.removeEventListener("pointercancel", this.onPointerRelease);
    window.removeEventListener("resize", this.onResize);
    this.disposeFramebuffers();
    for (const m of [
      this.splatMat,
      this.advectionMat,
      this.curlMat,
      this.vorticityMat,
      this.divergenceMat,
      this.clearMat,
      this.pressureMat,
      this.gradientMat,
      this.displayMat,
    ]) {
      m?.dispose();
    }
    this.geometry?.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }

  // ---------- 內部 ----------

  private mat(frag: string, uniforms: Record<string, THREE.IUniform>) {
    return new this.T.RawShaderMaterial({
      vertexShader: baseVertex,
      fragmentShader: frag,
      uniforms,
      depthTest: false,
      depthWrite: false,
      blending: this.T.NoBlending,
    });
  }

  private createRT(w: number, h: number): THREE.WebGLRenderTarget {
    const T = this.T;
    const rt = new T.WebGLRenderTarget(w, h, {
      wrapS: T.ClampToEdgeWrapping,
      wrapT: T.ClampToEdgeWrapping,
      minFilter: T.LinearFilter,
      magFilter: T.LinearFilter,
      format: T.RGBAFormat,
      type: T.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });
    rt.texture.generateMipmaps = false;
    return rt;
  }

  private createDoubleFbo(w: number, h: number): DoubleFbo {
    let read = this.createRT(w, h);
    let write = this.createRT(w, h);
    return {
      get read() {
        return read;
      },
      get write() {
        return write;
      },
      texelSize: new this.T.Vector2(1 / w, 1 / h),
      swap() {
        const tmp = read;
        read = write;
        write = tmp;
      },
    };
  }

  /** 依畫面比例配置場解析度(短邊 = res,長邊等比) */
  private getResolution(res: number): [number, number] {
    const w = this.renderer.domElement.width;
    const h = this.renderer.domElement.height;
    let aspect = w / h;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(res);
    const max = Math.round(res * aspect);
    return w > h ? [max, min] : [min, max];
  }

  private initFramebuffers() {
    this.disposeFramebuffers();
    const [sw, sh] = this.getResolution(this.simRes);
    const [dw, dh] = this.getResolution(this.dyeRes);
    this.velocity = this.createDoubleFbo(sw, sh);
    this.pressure = this.createDoubleFbo(sw, sh);
    this.dye = this.createDoubleFbo(dw, dh);
    this.divergenceRT = this.createRT(sw, sh);
    this.curlRT = this.createRT(sw, sh);
  }

  private disposeFramebuffers() {
    for (const fbo of [this.velocity, this.pressure, this.dye]) {
      if (!fbo) continue;
      fbo.read.dispose();
      fbo.write.dispose();
    }
    this.divergenceRT?.dispose();
    this.curlRT?.dispose();
  }

  private blit(target: THREE.WebGLRenderTarget | null, material: THREE.RawShaderMaterial) {
    this.mesh.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
  }

  private syncThemeTarget(immediate: boolean) {
    const dark = document.documentElement.classList.contains("dark");
    this.paperTgt = dark ? { ...DARK_PAPER } : { ...LIGHT_PAPER };
    this.darkTgt = dark ? 1 : 0;
    if (immediate) {
      this.paperCur = { ...this.paperTgt };
      this.darkCur = this.darkTgt;
    }
  }

  private toUv(x: number, y: number): [number, number] {
    return [x / window.innerWidth, 1 - y / window.innerHeight];
  }

  private onPointerDown = (e: PointerEvent) => {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const [u, v] = this.toUv(e.clientX, e.clientY);
    const angle = Math.random() * Math.PI * 2;
    // 滴墨
    this.queue.push({
      u,
      v,
      fx: Math.cos(angle) * 50,
      fy: Math.sin(angle) * 50,
      dyeStrength: 0.9,
      radiusScale: 2.4,
      ink: this.inkIndex,
    });
  };

  private onPointerMove = (e: PointerEvent) => {
    const prev = this.pointers.get(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!prev) return;
    const dx = (e.clientX - prev.x) / window.innerWidth;
    const dy = (e.clientY - prev.y) / window.innerHeight;
    if (dx === 0 && dy === 0) return;
    const dragging = (e.buttons & 1) === 1 || e.pointerType === "touch";
    const [u, v] = this.toUv(e.clientX, e.clientY);
    // 拖曳 = 注墨 + 推流;懸浮滑過 = 只推動既有墨流
    const force = PARAMS.SPLAT_FORCE * (dragging ? 1 : 0.45);
    this.queue.push({
      u,
      v,
      fx: dx * force,
      fy: -dy * force,
      dyeStrength: dragging ? 0.3 : 0,
      radiusScale: 1,
      ink: this.inkIndex,
    });
    if (this.queue.length > 64) this.queue.splice(0, this.queue.length - 64);
  };

  private onPointerRelease = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
  };

  private onResize = () => {
    if (this.disposed) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.dprCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    clearTimeout(this.resizeTimer);
    // 場尺寸重配會清空墨跡,等使用者停止調整視窗再做
    this.resizeTimer = setTimeout(() => {
      if (!this.disposed) this.initFramebuffers();
    }, 200);
  };

  private applySplat(cmd: SplatCmd) {
    const aspect = this.canvas.width / this.canvas.height;
    let radius = PARAMS.SPLAT_RADIUS * cmd.radiusScale;
    if (aspect > 1) radius *= aspect;

    const u = this.splatMat.uniforms;
    u.uAspectRatio.value = aspect;
    (u.uPoint.value as THREE.Vector2).set(cmd.u, cmd.v);
    u.uRadius.value = radius;

    // 速度場加力
    u.uTarget.value = this.velocity.read.texture;
    (u.uColor.value as THREE.Vector3).set(cmd.fx, cmd.fy, 0);
    this.blit(this.velocity.write, this.splatMat);
    this.velocity.swap();

    // 染料場加墨(吸收向量)
    if (cmd.dyeStrength > 0) {
      const a = this.inkAbsorptions[cmd.ink];
      u.uTarget.value = this.dye.read.texture;
      (u.uColor.value as THREE.Vector3).set(
        a[0] * cmd.dyeStrength,
        a[1] * cmd.dyeStrength,
        a[2] * cmd.dyeStrength,
      );
      this.blit(this.dye.write, this.splatMat);
      this.dye.swap();
    }
  }

  private step(dt: number) {
    const simTexel = this.velocity.texelSize;

    let u = this.curlMat.uniforms;
    u.uVelocity.value = this.velocity.read.texture;
    (u.uTexelSize.value as THREE.Vector2).copy(simTexel);
    this.blit(this.curlRT, this.curlMat);

    u = this.vorticityMat.uniforms;
    u.uVelocity.value = this.velocity.read.texture;
    u.uCurl.value = this.curlRT.texture;
    u.uDt.value = dt;
    (u.uTexelSize.value as THREE.Vector2).copy(simTexel);
    this.blit(this.velocity.write, this.vorticityMat);
    this.velocity.swap();

    u = this.divergenceMat.uniforms;
    u.uVelocity.value = this.velocity.read.texture;
    (u.uTexelSize.value as THREE.Vector2).copy(simTexel);
    this.blit(this.divergenceRT, this.divergenceMat);

    u = this.clearMat.uniforms;
    u.uTexture.value = this.pressure.read.texture;
    this.blit(this.pressure.write, this.clearMat);
    this.pressure.swap();

    u = this.pressureMat.uniforms;
    u.uDivergence.value = this.divergenceRT.texture;
    (u.uTexelSize.value as THREE.Vector2).copy(simTexel);
    for (let i = 0; i < PARAMS.PRESSURE_ITER; i++) {
      u.uPressure.value = this.pressure.read.texture;
      this.blit(this.pressure.write, this.pressureMat);
      this.pressure.swap();
    }

    u = this.gradientMat.uniforms;
    u.uPressure.value = this.pressure.read.texture;
    u.uVelocity.value = this.velocity.read.texture;
    (u.uTexelSize.value as THREE.Vector2).copy(simTexel);
    this.blit(this.velocity.write, this.gradientMat);
    this.velocity.swap();

    u = this.advectionMat.uniforms;
    (u.uTexelSize.value as THREE.Vector2).copy(simTexel);
    u.uDt.value = dt;
    u.uVelocity.value = this.velocity.read.texture;
    u.uSource.value = this.velocity.read.texture;
    u.uDissipation.value = PARAMS.VEL_DISSIPATION;
    this.blit(this.velocity.write, this.advectionMat);
    this.velocity.swap();

    u.uVelocity.value = this.velocity.read.texture;
    u.uSource.value = this.dye.read.texture;
    u.uDissipation.value = PARAMS.DYE_DISSIPATION;
    this.blit(this.dye.write, this.advectionMat);
    this.dye.swap();
  }

  private lerpTheme(dt: number) {
    const k = 1 - Math.exp(-10 * dt);
    this.paperCur.r += (this.paperTgt.r - this.paperCur.r) * k;
    this.paperCur.g += (this.paperTgt.g - this.paperCur.g) * k;
    this.paperCur.b += (this.paperTgt.b - this.paperCur.b) * k;
    this.darkCur += (this.darkTgt - this.darkCur) * k;
  }

  private frame = (t: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.frame);
    // 分頁隱藏時 rAF 自動暫停;回前景後 dt 有上限,不會爆衝
    const dt = Math.min(Math.max((t - this.lastTime) / 1000, 0.0001), 0.033);
    this.lastTime = t;

    this.lerpTheme(dt);

    const pending = this.queue.splice(0, 64);
    for (const cmd of pending) this.applySplat(cmd);

    this.step(dt);

    const u = this.displayMat.uniforms;
    u.uDye.value = this.dye.read.texture;
    (u.uPaper.value as THREE.Vector3).set(this.paperCur.r, this.paperCur.g, this.paperCur.b);
    u.uDark.value = this.darkCur;
    u.uNoiseStrength.value = NOISE_LIGHT + (NOISE_DARK - NOISE_LIGHT) * this.darkCur;
    u.uAspect.value = this.canvas.width / this.canvas.height;
    this.blit(null, this.displayMat);
  };
}
