"use client";

import { DreamRecorder } from "./DreamRecorder";

export function DreamSidebar() {
  return (
    <aside className="border-border hidden w-1/4 shrink-0 border-l bg-white p-6 lg:block">
      <DreamRecorder />
    </aside>
  );
}
