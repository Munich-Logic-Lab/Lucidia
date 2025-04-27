"use client";

import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { AlertCircle, X } from "lucide-react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

import { Button } from "@/components/ui/button";

interface ThreePlyViewerProps {
  isOpen: boolean;
  onClose: () => void;
  filePath?: string;
}

export function ThreePlyViewer({
  isOpen,
  onClose,
  filePath = "/generated_20250427_073743.ply",
}: ThreePlyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);
  const pointsRef = useRef<THREE.Points | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"points" | "mesh" | "both">(
    "points",
  );

  // Setup Three.js scene
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Reset state
    setError(null);
    setIsLoading(true);
    setViewMode("points");

    let mounted = true;

    // Initialize Three.js components
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    // Add ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 1.0)); // Increased intensity

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add another light from the opposite direction for better illumination
    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-10, -10, -10);
    scene.add(backLight);

    // Create camera with the correct up vector
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.up.set(0, -1, 0); // This fixes the orientation to match standard PLY files
    cameraRef.current = camera;

    // Create renderer with better settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // Helps with color accuracy
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Use SRGB color space for better colors
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // Create toggle button for view modes
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Toggle View Mode";
    toggleButton.style.position = "absolute";
    toggleButton.style.bottom = "4rem";
    toggleButton.style.right = "1rem";
    toggleButton.style.zIndex = "50";
    toggleButton.style.padding = "0.75rem 1rem";
    toggleButton.style.borderRadius = "0.375rem";
    toggleButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    toggleButton.style.color = "white";
    toggleButton.style.fontSize = "0.875rem";
    toggleButton.style.cursor = "pointer";

    // Function to toggle between points, mesh, and both
    toggleButton.onclick = () => {
      if (!pointsRef.current || !meshRef.current) return;

      if (viewMode === "points") {
        setViewMode("mesh");
        pointsRef.current.visible = false;
        meshRef.current.visible = true;
      } else if (viewMode === "mesh") {
        setViewMode("both");
        pointsRef.current.visible = true;
        meshRef.current.visible = true;
      } else {
        setViewMode("points");
        pointsRef.current.visible = true;
        meshRef.current.visible = false;
      }
    };

    container.appendChild(toggleButton);

    // Load PLY file
    const loader = new PLYLoader();

    loader.load(
      filePath,
      // onLoad callback
      (geometry) => {
        if (!mounted) return;

        // Center the geometry
        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
          const center = new THREE.Vector3();
          geometry.boundingBox.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);

          // Adjust scale if needed based on bounding box
          const size = new THREE.Vector3();
          geometry.boundingBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);

          // Position camera at a good distance
          camera.position.set(0, 0, maxDim * 1.5);

          // Set controls target to center
          controls.target.set(0, 0, 0);
          controls.update();
        }

        // Check if the geometry has color attributes
        const hasVertexColors = geometry.hasAttribute("color");
        console.log("Geometry has vertex colors:", hasVertexColors);

        // Process color attributes
        if (hasVertexColors) {
          // Log the first few colors for debugging
          if (geometry.hasAttribute("color")) {
            console.log(
              "Color attribute exists with type:",
              geometry.attributes.color.array.constructor.name,
            );
            console.log(
              "First few color values:",
              Array.from(geometry.attributes.color.array).slice(0, 12),
            );

            // For non-normalized colors (0-255 instead of 0-1), normalize them
            const colorAttrib = geometry.attributes.color;
            if (colorAttrib && colorAttrib.array.length > 0) {
              // Check if colors seem to be in 0-255 range
              let needsNormalization = false;
              for (let i = 0; i < Math.min(20, colorAttrib.array.length); i++) {
                if (colorAttrib.array[i] > 1.1) {
                  // if any value is clearly > 1
                  needsNormalization = true;
                  break;
                }
              }

              // Normalize if needed
              if (needsNormalization) {
                console.log("Normalizing colors from 0-255 to 0-1 range");
                for (let i = 0; i < colorAttrib.array.length; i++) {
                  colorAttrib.array[i] /= 255.0;
                }
                colorAttrib.needsUpdate = true;
              }

              // Enhance colors by boosting saturation slightly
              for (let i = 0; i < colorAttrib.array.length; i += 3) {
                const r = colorAttrib.array[i];
                const g = colorAttrib.array[i + 1];
                const b = colorAttrib.array[i + 2];

                // Convert to HSL to boost saturation
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                let h,
                  s,
                  l = (max + min) / 2;

                if (max === min) {
                  h = s = 0; // achromatic
                } else {
                  const d = max - min;
                  s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                  else if (max === g) h = (b - r) / d + 2;
                  else h = (r - g) / d + 4;

                  h /= 6;
                }

                // Boost saturation by 20%
                s = Math.min(1, s * 1.2);

                // Convert back to RGB
                if (s === 0) {
                  // achromatic
                  colorAttrib.array[i] = l;
                  colorAttrib.array[i + 1] = l;
                  colorAttrib.array[i + 2] = l;
                } else {
                  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                  const p = 2 * l - q;

                  const hueToRGB = (p: number, q: number, t: number) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                  };

                  colorAttrib.array[i] = hueToRGB(p, q, h + 1 / 3);
                  colorAttrib.array[i + 1] = hueToRGB(p, q, h);
                  colorAttrib.array[i + 2] = hueToRGB(p, q, h - 1 / 3);
                }
              }

              colorAttrib.needsUpdate = true;
            }
          }
        } else {
          // If no vertex colors, create them based on position
          const colorAttribute = new THREE.Float32BufferAttribute(
            new Float32Array(geometry.attributes.position.count * 3),
            3,
          );

          // Generate colors based on position for better visualization
          for (let i = 0; i < geometry.attributes.position.count; i++) {
            const x = geometry.attributes.position.getX(i);
            const y = geometry.attributes.position.getY(i);
            const z = geometry.attributes.position.getZ(i);

            // Normalize values between 0-1 based on position
            const normalizedPos = new THREE.Vector3(x, y, z);
            if (geometry.boundingBox) {
              normalizedPos.sub(geometry.boundingBox.min);
              normalizedPos.divide(
                new THREE.Vector3().subVectors(
                  geometry.boundingBox.max,
                  geometry.boundingBox.min,
                ),
              );
            }

            // Set RGB values based on position - brighter colors
            colorAttribute.setXYZ(
              i,
              0.5 + 0.5 * normalizedPos.x,
              0.5 + 0.5 * normalizedPos.y,
              0.5 + 0.5 * normalizedPos.z,
            );
          }

          // Add the color attribute to the geometry
          geometry.setAttribute("color", colorAttribute);
        }

        // Helper function to create a circular point texture
        const createCircleTexture = (size: number, color: string) => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          if (!context) return null;

          // Draw a circle
          const radius = size / 2;
          context.beginPath();
          context.arc(radius, radius, radius, 0, 2 * Math.PI, false);
          context.fillStyle = color;
          context.fill();

          // Create texture from canvas
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          return texture;
        };

        // Create an improved point material with better size and round points
        const pointsMaterial = new THREE.PointsMaterial({
          size: 0.08, // Larger point size for better visibility
          vertexColors: true,
          sizeAttenuation: true,
          transparent: true,
          alphaTest: 0.1,
          depthWrite: true,
          map: createCircleTexture(256, "#ffffff"),
        });

        // Create a clone of the geometry for the mesh
        const meshGeometry = geometry.clone();

        // Compute vertex normals for the mesh geometry if not present
        if (!meshGeometry.hasAttribute("normal")) {
          meshGeometry.computeVertexNormals();
        }

        // Create a material for the mesh - adjusted for better colors
        const meshMaterial = new THREE.MeshStandardMaterial({
          vertexColors: true, // Use vertex colors for the mesh
          flatShading: false, // Smooth shading
          roughness: 0.7, // Less shiny
          metalness: 0.1, // Slightly metallic for better light response
          side: THREE.DoubleSide, // Render both sides of faces
          envMapIntensity: 0.5, // Subtle environment reflections
        });

        // Create points mesh with standard material
        const points = new THREE.Points(geometry, pointsMaterial);
        scene.add(points);
        pointsRef.current = points;

        // Create surface mesh (hidden by default)
        const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
        mesh.visible = false; // Start with mesh hidden
        scene.add(mesh);
        meshRef.current = mesh;

        // Update loading state
        if (mounted) {
          setIsLoading(false);

          // Start animation loop
          const animate = () => {
            if (!mounted) return;

            frameIdRef.current = requestAnimationFrame(animate);

            if (controlsRef.current) {
              controlsRef.current.update();
            }

            if (rendererRef.current && cameraRef.current && sceneRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
          };

          animate();
        }
      },
      // onProgress callback
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      // onError callback
      (err: unknown) => {
        console.error("Error loading PLY:", err);
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(`Failed to load PLY file: ${errorMessage}`);
          setIsLoading(false);
        }
      },
    );

    // Handle window resize
    const handleResize = () => {
      if (
        !mounted ||
        !containerRef.current ||
        !rendererRef.current ||
        !cameraRef.current
      )
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      mounted = false;

      // Cancel animation frame
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }

      // Remove toggle button
      if (toggleButton.parentNode) {
        toggleButton.parentNode.removeChild(toggleButton);
      }

      // Dispose of Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();

        // Remove canvas from DOM
        if (
          rendererRef.current.domElement &&
          rendererRef.current.domElement.parentNode
        ) {
          rendererRef.current.domElement.parentNode.removeChild(
            rendererRef.current.domElement,
          );
        }

        rendererRef.current = null;
      }

      // Clean up controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      // Clear scene
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }

      // Clear camera
      cameraRef.current = null;

      // Clear mesh references
      pointsRef.current = null;
      meshRef.current = null;

      // Remove resize listener
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, filePath]);

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

      {/* View mode indicator */}
      {!error && !isLoading && (
        <div className="absolute top-4 right-4 z-50 rounded bg-black/70 p-2 text-sm text-white">
          View Mode:{" "}
          {viewMode === "points"
            ? "Point Cloud"
            : viewMode === "mesh"
              ? "Surface Mesh"
              : "Both"}
        </div>
      )}

      {/* Controls help */}
      {!error && !isLoading && (
        <div className="absolute bottom-4 left-4 z-50 rounded bg-black/70 p-3 text-sm text-white">
          <p>Controls:</p>
          <ul className="mt-1 space-y-1">
            <li>Left click + drag to rotate</li>
            <li>Right click + drag to pan</li>
            <li>Scroll to zoom</li>
          </ul>
        </div>
      )}
    </div>
  );
}
