declare module '@mkkellogg/gaussian-splats-3d' {
  import { Camera, Scene, WebGLRenderer } from 'three';

  export interface ViewerOptions {
    cameraUp?: number[];
    initialCameraPosition?: number[];
    initialCameraLookAt?: number[];
    sharedMemoryForWorkers?: boolean;
    integerBasedSort?: boolean;
    halfPrecisionCovariancesOnGPU?: boolean;
    devicePixelRatio?: number;
    enableOptionalEffects?: boolean;
    webXRMode?: string;
    renderMode?: string;
    sceneRevealMode?: string;
    antialiased?: boolean;
    focalAdjustment?: number;
    logLevel?: string;
    rootElement?: HTMLElement;
  }

  export interface SplatSceneOptions {
    progressiveLoad?: boolean;
    splatAlphaRemovalThreshold?: number;
    showLoadingUI?: boolean;
    position?: number[];
    rotation?: number[];
    scale?: number[];
  }

  export class Viewer {
    constructor(options?: ViewerOptions);
    addSplatScene(path: string, options?: SplatSceneOptions): Promise<void>;
    init(renderer: WebGLRenderer, camera: Camera, scene: Scene): void;
    start(): void;
    stop(): void;
    dispose(): void;
    update(): void;
    render(): void;
  }
}
