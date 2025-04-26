"use client";

import React from "react";

import { DreamSharing } from "@/components/custom/DreamSharing";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden bg-white">
      {/* Main content */}
      <div className="container mx-auto h-full max-w-5xl px-4">
        <main className="flex h-full flex-col py-8">
          {/* Dream sharing section */}
          <DreamSharing />
        </main>
      </div>
    </div>
  );
}
