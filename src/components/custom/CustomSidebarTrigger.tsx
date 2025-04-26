"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

import { DoubleArrowIcon } from "../icons";

interface CustomSidebarTriggerProps {
  className?: string;
}

export function CustomSidebarTrigger({ className }: CustomSidebarTriggerProps) {
  // Get sidebar state from context
  const { open, setOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-4 w-4 shrink-0 rounded-md bg-transparent",
        // Position differently based on open state
        open ? "absolute right-6" : "absolute left-4",
        className,
      )}
      onClick={() => setOpen(!open)}
      aria-label={open ? "Close sidebar" : "Open sidebar"}
    >
      <DoubleArrowIcon
        className={cn(
          "h-4 w-4 transition-transform duration-500 ease-in-out",
          open ? "-rotate-0" : "rotate-180",
        )}
      />
    </Button>
  );
}
