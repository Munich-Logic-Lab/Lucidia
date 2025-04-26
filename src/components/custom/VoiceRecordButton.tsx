"use client";

import { useSidebar } from "@/components/ui/sidebar";

import RecordButton from "../icons/Recordbutton";

export function VoiceRecordButton() {
  const { state } = useSidebar();

  if (state === "collapsed") return null;

  return (
    <div className="mx-auto flex flex-col items-center py-4">
      <button
        className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-transparent transition-all duration-200 hover:opacity-80"
        onClick={() => console.log("Voice record clicked")}
      >
        <RecordButton className="h-full w-full text-current" />
      </button>
      <span className="mt-2 text-center text-sm">
        Click to record your voice
      </span>
    </div>
  );
}
