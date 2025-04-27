"use client";

import { useEffect, useRef, useState } from "react";

import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import { AlertCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DebugPlyViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebugPlyViewer({ isOpen, onClose }: DebugPlyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and clean up viewer when component mounts/unmounts
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Reset state
    setError(null);
    setIsLoading(true);

    let mounted = true;

    // Create container and viewer
    const viewerContainer = document.createElement("div");
    viewerContainer.style.width = "100%";
    viewerContainer.style.height = "100%";
    viewerContainer.style.position = "relative";

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(viewerContainer);
    }

    // Create the viewer with minimal settings
    const viewer = new GaussianSplats3D.Viewer({
      cameraUp: [0, 1, 0],
      initialCameraPosition: [0, 0, 5],
      initialCameraLookAt: [0, 0, 0],
      selfDrivenMode: true,
      useBuiltInControls: true,
      showBackgroundGradient: true,
      sharedMemoryForWorkers: false,
      gpuAcceleratedSort: false,
    });

    viewerRef.current = viewer;

    // Attempt to load a very simple PLY scene
    viewer
      .addSplatScene("/generated_20250427_073743.ply", {
        showLoadingUI: true,
        splatAlphaRemovalThreshold: 5,
      })
      .then(() => {
        if (mounted) {
          viewer.start();
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load PLY:", err);
        if (mounted) {
          setError("Failed to load PLY file: " + (err.message || String(err)));
          setIsLoading(false);
        }
      });

    // Cleanup function
    return () => {
      mounted = false;

      // Delay cleanup to avoid errors
      setTimeout(() => {
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
      }, 100);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-xl text-white">Loading PLY File...</p>
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
    </div>
  );
}
