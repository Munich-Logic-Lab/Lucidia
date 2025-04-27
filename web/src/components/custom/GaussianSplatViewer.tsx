"use client";

import { useEffect, useRef, useState } from "react";

import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import { AlertCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface GaussianSplatViewerProps {
  filePath: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GaussianSplatViewer({
  filePath,
  isOpen,
  onClose,
}: GaussianSplatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add loading ref to track loading state even during cleanup
  const isLoadingRef = useRef(true);

  // Initialize and clean up viewer when component mounts/unmounts or when isOpen changes
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Reset state
    setError(null);
    setIsLoading(true);
    isLoadingRef.current = true;

    let mounted = true;
    let abortController = new AbortController();

    // Create and initialize the viewer
    const initViewer = async () => {
      try {
        // Clear any previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        // Create viewer container
        const viewerContainer = document.createElement("div");
        viewerContainer.style.width = "100%";
        viewerContainer.style.height = "100%";
        viewerContainer.style.position = "relative";

        if (containerRef.current) {
          containerRef.current.appendChild(viewerContainer);
        }

        // Create the viewer with simple settings but disable features that cause CORS issues
        const viewer = new GaussianSplats3D.Viewer({
          // Basic camera setup
          cameraUp: [0, 1, 0],
          initialCameraPosition: [0, 0, 5],
          initialCameraLookAt: [0, 0, 0],

          // Core functionality
          selfDrivenMode: true,
          useBuiltInControls: true,
          showBackgroundGradient: true,

          // Disable features causing CORS and SharedArrayBuffer issues
          sharedMemoryForWorkers: false,
          gpuAcceleratedSort: false,

          // Simplified settings
          renderMode: GaussianSplats3D.RenderMode.Always,
          sceneRevealMode: GaussianSplats3D.SceneRevealMode.Instant,
          webXRMode: GaussianSplats3D.WebXRMode.None,
        });

        // Save reference for cleanup
        viewerRef.current = viewer;

        // Load the 3D scene
        const normalizedPath = filePath.startsWith("http")
          ? filePath
          : filePath.startsWith("/")
            ? filePath
            : `/${filePath}`;

        // Check if component is still mounted before proceeding
        if (abortController.signal.aborted) {
          throw new Error("Component unmounted during initialization");
        }

        await viewer.addSplatScene(normalizedPath, {
          showLoadingUI: true,
          splatAlphaRemovalThreshold: 5,
        });

        // Check again if component is still mounted
        if (abortController.signal.aborted) {
          throw new Error("Component unmounted during scene loading");
        }

        // Start rendering
        viewer.start();

        // Auto-fit the camera to the scene
        if (viewer.controls?.reset) {
          viewer.controls.reset();
        }

        // Update loading state
        if (mounted) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      } catch (error) {
        // Only update state if still mounted
        if (mounted && !abortController.signal.aborted) {
          console.error("Error loading 3D scene:", error);
          setError(error instanceof Error ? error.message : String(error));
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    initViewer().catch((err) => {
      if (mounted) {
        console.error("Unhandled error in viewer initialization:", err);
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    });

    // Cleanup function
    return () => {
      // Signal that the component is unmounting
      mounted = false;
      abortController.abort();

      // Handle cleanup differently based on loading state
      if (isLoadingRef.current) {
        console.log("Component unmounted while loading - deferring cleanup");

        // Set a small timeout before cleanup to allow any in-progress operations to complete
        setTimeout(() => {
          if (viewerRef.current) {
            try {
              viewerRef.current.dispose();
            } catch (e) {
              console.error("Error in deferred viewer disposal:", e);
            }
            viewerRef.current = null;
          }

          if (containerRef.current) {
            containerRef.current.innerHTML = "";
          }
        }, 100);
      } else {
        console.log(
          "Component unmounted after loading completed - immediate cleanup",
        );

        // Immediate cleanup is safe when not loading
        if (viewerRef.current) {
          try {
            viewerRef.current.dispose();
          } catch (e) {
            console.error("Error disposing viewer:", e);
          }
          viewerRef.current = null;
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      }
    };
  }, [isOpen, filePath]);

  // Handle window resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (viewerRef.current?.resizeRenderer) {
        try {
          viewerRef.current.resizeRenderer();
        } catch (e) {
          console.error("Error resizing viewer:", e);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-xl text-white">Loading 3D Scene...</p>
          <p className="mt-2 max-w-md text-center text-gray-400">
            This may take a moment as the 3D model is being loaded and rendered.
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <h3 className="mt-4 text-xl font-bold text-white">
            Failed to load 3D scene
          </h3>
          <p className="mt-2 max-w-md text-center text-gray-300">{error}</p>
          <Button
            onClick={onClose}
            className="mt-6 bg-purple-600 hover:bg-purple-700"
          >
            Close Viewer
          </Button>
        </div>
      )}

      {/* Container for the 3D viewer */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      ></div>

      {/* Close button */}
      <Button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 rounded-full bg-black/70 p-2 text-white hover:bg-black/90"
        aria-label="Close 3D viewer"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Controls help */}
      {!error && !isLoading && (
        <div className="absolute bottom-4 left-4 z-50 rounded bg-black/70 p-3 text-sm text-white">
          <p>Controls:</p>
          <ul className="mt-1 space-y-1">
            <li>Left click to set focal point</li>
            <li>Left click + drag to orbit</li>
            <li>Right click + drag to pan</li>
            <li>Scroll to zoom</li>
          </ul>
        </div>
      )}
    </div>
  );
}
