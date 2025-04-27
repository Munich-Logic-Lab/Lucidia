"use client";

import Image from "next/image";
import { useState } from "react";

import { Loader, Play, Square } from "lucide-react";

import { SIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { DreamAvatarGroup } from "./DreamAvatarGroup";
import { DreamRecorder } from "./DreamRecorder";

export function DreamSharing() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dreamViz, setDreamViz] = useState<string | null>();

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

          <div className="relative h-full">
            <Image
              src={dreamViz || "/images/placeholder-dream.png"}
              alt="Dream visualization"
              fill={true}
              className="rounded-md object-cover"
            />
            {!dreamViz && (
              <div className="absolute inset-0 mt-12 flex flex-col items-center justify-center text-white">
                <p className="text-center text-xl font-medium">
                  Start talking about your dream
                </p>
                <p className="mt-2 text-center">
                  We'll visualize it for you after you share your experience
                </p>
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
