"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Loader, Play, Square } from "lucide-react";

import { SIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { DreamAvatarGroup } from "./DreamAvatarGroup";
import { DreamRecorder } from "./DreamRecorder";

export function DreamSharing() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dreamViz, setDreamViz] = useState<string | null>();
  const [plyModelUrl, setPlyModelUrl] = useState<string | null>();
  const [plyStatus, setPlyStatus] = useState<string>("");

  const handleGenerateVideo = async () => {
    // In a real implementation, this would call an API to generate a video
    // based on the dream description
    setIsGenerating(true);

    // Simulate a delay for the generation process
    setTimeout(() => {
      setIsGenerating(false);
      // In a real implementation, this would update with a newly generated image/video
    }, 3000);
  };

  // Listen for dream image and 3D model generation events
  useEffect(() => {
    const handleDreamImageGenerated = (event: CustomEvent) => {
      const { imageUrl } = event.detail;
      if (imageUrl) {
        setDreamViz(imageUrl);
        setIsGenerating(false);
      }
    };

    const handleImageGenerationStart = () => {
      setIsGenerating(true);
      setPlyModelUrl(undefined);
      setPlyStatus("");
    };

    const handleImageGenerationEnd = () => {
      setIsGenerating(false);
    };

    const handleImageReset = () => {
      // Reset the image when starting a new session
      setDreamViz(undefined);
      setPlyModelUrl(undefined);
      setPlyStatus("");
      setIsGenerating(false);
    };

    // Custom event for PLY model completion
    const handlePlyModelCompleted = (event: CustomEvent) => {
      const { plyUrl } = event.detail;
      if (plyUrl) {
        setPlyModelUrl(plyUrl);
        setPlyStatus("completed");
      }
    };

    // Add event listeners
    window.addEventListener(
      "dreamImageGenerated",
      handleDreamImageGenerated as EventListener,
    );

    window.addEventListener(
      "dreamImageGenerationStart",
      handleImageGenerationStart as EventListener,
    );

    window.addEventListener(
      "dreamImageGenerationEnd",
      handleImageGenerationEnd as EventListener,
    );

    window.addEventListener(
      "dreamImageReset",
      handleImageReset as EventListener,
    );

    window.addEventListener(
      "dreamPlyModelCompleted",
      handlePlyModelCompleted as EventListener,
    );

    // Clean up
    return () => {
      window.removeEventListener(
        "dreamImageGenerated",
        handleDreamImageGenerated as EventListener,
      );

      window.removeEventListener(
        "dreamImageGenerationStart",
        handleImageGenerationStart as EventListener,
      );

      window.removeEventListener(
        "dreamImageGenerationEnd",
        handleImageGenerationEnd as EventListener,
      );

      window.removeEventListener(
        "dreamImageReset",
        handleImageReset as EventListener,
      );

      window.removeEventListener(
        "dreamPlyModelCompleted",
        handlePlyModelCompleted as EventListener,
      );
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 pr-4">
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-center">
            <div className="flex items-center">
              <SIcon className="h-7 w-7 translate-y-[9px]" />
              <h2 className="-ml-1 translate-x-[-4px] text-[18px] leading-[23px] font-bold tracking-[1.53px]">
                hare your dream
              </h2>
            </div>
          </div>
          <DreamAvatarGroup />

          <div className="relative h-full min-h-[500px]">
            <Image
              src={dreamViz || "/images/placeholder-dream.png"}
              alt="Dream visualization"
              fill={true}
              className={`rounded-md object-cover ${isGenerating ? "opacity-50" : ""}`}
            />

            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="rounded-xl bg-black/50 p-6 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                  <p className="text-lg font-medium text-white">
                    Generating dream visualizations...
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Creating an image and 3D model from your dream description.
                    <br />
                    This may take a minute or two.
                  </p>

                  <div className="mx-auto mt-4 max-w-xs">
                    <div className="mb-2 flex justify-between text-xs text-white/80">
                      <span>Image processing:</span>
                      <span>{dreamViz ? "Complete" : "In progress..."}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{
                          width: dreamViz ? "100%" : "60%",
                          transition: "width 1s ease-in-out",
                        }}
                      ></div>
                    </div>

                    <div className="mt-3 mb-2 flex justify-between text-xs text-white/80">
                      <span>3D model processing:</span>
                      <span>
                        {plyStatus === "completed"
                          ? "Complete"
                          : "In progress..."}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{
                          width:
                            plyStatus === "completed"
                              ? "100%"
                              : dreamViz
                                ? "50%"
                                : "20%",
                          transition: "width 1s ease-in-out",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3D Model Status - Shows loading or download button */}
            {dreamViz && (
              <div className="absolute right-4 bottom-4">
                {plyModelUrl && plyStatus === "completed" ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="animate-pulse-slow flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-indigo-700"
                    onClick={() => window.open(plyModelUrl, "_blank")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L4 6v12l8 4 8-4V6l-8-4z"
                        fill="white"
                        fillOpacity="0.2"
                      />
                      <path
                        d="M12 22V10M4 6l8-4 8 4M4 18l8 4 8-4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 12l8 4 8-4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Download 3D Model (.ply)
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex cursor-not-allowed items-center gap-2 bg-white/80 text-black opacity-90 shadow-md"
                    disabled
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 animate-pulse text-purple-600"
                    >
                      <path
                        fill="currentColor"
                        d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 4L8 8v2l4-2 4 2V8l-4-2z"
                      />
                    </svg>
                    Creating 3D Model...
                  </Button>
                )}
              </div>
            )}

            {!dreamViz && !isGenerating && (
              <div className="absolute inset-0 mt-8 flex flex-col items-center justify-center px-4 text-white">
                <p className="text-center text-xl font-medium">
                  Start talking about your dream
                </p>
                <p className="mt-2 text-center">
                  We'll create an image and 3D model based on the scene you
                  describe
                </p>
                <div className="mt-6 max-w-md rounded-lg bg-black/40 p-4">
                  <h3 className="mb-2 text-lg font-medium">How it works:</h3>
                  <ol className="list-decimal space-y-2 pl-5">
                    <li>Click the record button and describe your dream</li>
                    <li>Answer a few questions about visual details</li>
                    <li>The AI will create a text prompt for visualization</li>
                    <li>An image of your dream scene will appear here</li>
                    <li>A 3D model will be generated for download</li>
                  </ol>
                </div>
              </div>
            )}
            {/*
            <div className="absolute right-0 bottom-4 left-0 flex justify-center gap-4">
              <Button
                onClick={handlePlayPause}
                className="rounded-full bg-white/80 p-3 shadow-md"
                disabled={isGenerating}
              >
                {isPlaying ? (
                  <Square className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                onClick={handleGenerateVideo}
                className="rounded-full bg-white/80 p-3 shadow-md"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader className="h-6 w-6 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  </svg>
                )}
              </Button>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Dream Recording Sidebar */}
      <aside className="border-border hidden w-1/3 shrink-0 border-l bg-white p-6 lg:block">
        <DreamRecorder />
      </aside>
    </div>
  );
}
