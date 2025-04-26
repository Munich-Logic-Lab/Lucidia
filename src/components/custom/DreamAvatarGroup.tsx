"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DreamAvatarGroup() {
  return (
    <div className="my-4 flex space-x-2">
      <Avatar className="h-10 w-10 bg-purple-200">
        <AvatarFallback className="text-purple-700">FK</AvatarFallback>
      </Avatar>
      <Avatar className="h-10 w-10 bg-pink-200">
        <AvatarFallback className="text-pink-700">AD</AvatarFallback>
      </Avatar>
      <Avatar className="h-10 w-10 bg-purple-100">
        <AvatarFallback className="text-purple-600">NY</AvatarFallback>
      </Avatar>
    </div>
  );
}
