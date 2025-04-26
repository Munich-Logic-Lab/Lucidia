"use client";

import React from "react";

import { DreamSharing } from "@/components/custom/DreamSharing";

export default function Home() {
  return (
    <div className="h-full min-h-[calc(100vh-8rem)] bg-white">
      {/* Main content */}
      <div className="h-full w-full px-4">
        <main className="flex h-full flex-col">
          {/* Dream sharing section */}
          <DreamSharing />
        </main>
      </div>
    </div>
  );
}
