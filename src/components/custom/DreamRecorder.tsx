"use client";

import { useState } from "react";

import { RIcon, RecordbuttonIcon } from "@/components/icons";
import { Textarea } from "@/components/ui/textarea";

export function DreamRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [dreamText, setDreamText] = useState("");

  const handleRecord = () => {
    console.log("Voice record clicked");
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center">
        <RIcon className="h-6 w-6 translate-y-[-4px]" />
        <h2 className="translate-x-[-4px] text-[18px] leading-[22px] font-normal tracking-[0.72px]">
          ecord your dream
        </h2>
      </div>

      <div className="mb-6 grow">
        <Textarea
          placeholder="Write me more what you have dreamt..."
          className="min-h-[200px] w-full resize-none rounded-md border p-3"
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
        />
      </div>

      <div className="mx-auto mb-4 flex items-center justify-center">
        <button
          className="flex items-center justify-center rounded-full bg-transparent transition-all duration-200 hover:opacity-80"
          onClick={handleRecord}
        >
          <RecordbuttonIcon className="h-full w-full text-current" />
        </button>
      </div>
    </div>
  );
}
