"use client";

import React, { useState } from "react";

import { DreamSharing } from "@/components/custom/DreamSharing";
import { ThreePlyViewer } from "@/components/custom/ThreePlyViewer";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <div className="h-full min-h-[calc(100vh-8rem)] bg-white">
      {/* Three.js PLY Viewer */}

      {isViewerOpen && (
        <ThreePlyViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="h-full w-full px-4">
        <main className="flex h-full flex-col">
          {/* Debug button */}
          {/* TODO: 
          <div className="mt-4 mb-4 flex justify-center">
            <Button
              onClick={() => setIsViewerOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Debug: Open PLY Viewer (Three.js)
            </Button>
          </div>
          */}

          {/* Dream sharing section */}
          <DreamSharing />
        </main>
        <Toaster />
      </div>
    </div>
  );
}
