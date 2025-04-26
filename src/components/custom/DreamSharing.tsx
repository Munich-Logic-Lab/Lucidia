"use client";

import Image from "next/image";

import { SIcon } from "@/components/icons";

import { DreamAvatarGroup } from "./DreamAvatarGroup";

export function DreamSharing() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center">
        <div className="flex items-center">
          <SIcon className="h-7 w-7 translate-y-[9px]" />
          <h2 className="-ml-1 translate-x-[-4px] text-lg font-medium">
            hare your dream image
          </h2>
        </div>
      </div>
      <DreamAvatarGroup />

      <div className="relative mt-4 h-full">
        <Image
          src="/images/77627641.jpg"
          alt="Dream visualization"
          width={1200}
          height={800}
          className="h-[600px] w-full rounded-md object-cover"
        />
        <div className="absolute right-0 bottom-4 left-0 flex justify-center gap-4">
          <button className="rounded-full bg-white/80 p-2 shadow-md">
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
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </button>
          <button className="rounded-full bg-white/80 p-2 shadow-md">
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
          </button>
        </div>
      </div>
    </div>
  );
}
