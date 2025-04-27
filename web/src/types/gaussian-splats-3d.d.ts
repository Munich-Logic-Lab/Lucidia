// Type definitions for @mkkellogg/gaussian-splats-3d
declare module "@mkkellogg/gaussian-splats-3d" {
  export class Viewer {
    constructor(options?: {
      parent?: HTMLElement;
      cameraUp?: number[];
      initialCameraPosition?: number[];
      initialCameraLookAt?: number[];
      selfDrivenMode?: boolean;
      antialiased?: boolean;
      useBuiltInControls?: boolean;
      sphericalHarmonicsDegree?: number;
      focalAdjustment?: number;
      threeScene?: THREE.Scene;
      camera?: THREE.Camera;
      renderer?: THREE.WebGLRenderer;
      renderMode?: number;
      webXRMode?: number;
      ignoreDevicePixelRatio?: boolean;
      sceneRevealMode?: number;
      dynamicScene?: boolean;
      halfPrecisionCovariancesOnGPU?: boolean;
      gpuAcceleratedSort?: boolean;
      integerBasedSort?: boolean;
      enableSIMDInSort?: boolean;
      sharedMemoryForWorkers?: boolean;
      splatSortDistanceMapPrecision?: number;
      logLevel?: number;
      enableOptionalEffects?: boolean;
      inMemoryCompressionLevel?: number;
      freeIntermediateSplatData?: boolean;
      sceneFadeInRateMultiplier?: number;
    });

    addSplatScene(
      path: string,
      options?: {
        format?: number;
        splatAlphaRemovalThreshold?: number;
        showLoadingUI?: boolean;
        position?: number[];
        rotation?: number[];
        scale?: number[];
        progressiveLoad?: boolean;
      },
    ): Promise<void>;

    start(): void;
    dispose(): void;
    setSize(width: number, height: number): void;
    update(): void;
    render(): void;
  }

  export class DropInViewer {
    constructor(options?: { gpuAcceleratedSort?: boolean });

    addSplatScenes(
      scenes: Array<{
        path: string;
        splatAlphaRemovalThreshold?: number;
        rotation?: number[];
        scale?: number[];
        position?: number[];
      }>,
    ): Promise<void>;
  }

  export class PlyLoader {
    static loadFromURL(
      url: string,
      onProgress?: (progress: number) => void,
      progressiveLoad?: boolean,
      onProgressiveLoadSectionProgress?: (progress: number) => void,
      minimumAlpha?: number,
      compressionLevel?: number,
      optimizeSplatData?: boolean,
      sphericalHarmonicsDegree?: number,
      headers?: Record<string, string>,
    ): Promise<any>;
  }

  export class KSplatLoader {
    static downloadFile(splatBuffer: any, fileName: string): void;
  }

  export enum WebXRMode {
    None = 0,
    VR = 1,
    AR = 2,
  }

  export enum RenderMode {
    Always = 0,
    OnChange = 1,
    Never = 2,
  }

  export enum SceneRevealMode {
    Default = 0,
    Gradual = 1,
    Instant = 2,
  }

  export enum LogLevel {
    None = 0,
    Error = 1,
    Warning = 2,
    Info = 3,
  }

  export enum SceneFormat {
    Ply = 0,
    Splat = 1,
    KSplat = 2,
  }

  export enum SplatRenderMode {
    ThreeD = 0,
    TwoD = 1,
  }
}
