"use client";

import { useRouter } from "next/navigation";

import { AuthSignIn, AuthSignUp, Home as HomeRoute } from "@/routes";
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  User,
  UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { signOut, useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

import { DIcon, DiceIcon } from "../icons";
import { CustomSidebarTrigger } from "./CustomSidebarTrigger";
import Logo from "./logo";

// Sample dream journal entries (replace with actual data)
const dreamEntries = [
  {
    id: 1,
    title: "Flying Over Mountains",
    description: "I was soaring above snow-capped peaks with eagles...",
  },
  {
    id: 2,
    title: "Lost in the Forest",
    description: "Wandering through an ancient forest with glowing trees...",
  },
  {
    id: 3,
    title: "Ocean Adventure",
    description:
      "Swimming with colorful fish and discovering underwater cities...",
  },
  {
    id: 4,
    title: "Space Journey",
    description: "Visiting distant planets and meeting strange beings...",
  },
];

const navItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="icon" className="px-2">
      <SidebarHeader className="relative p-6">
        <HomeRoute.Link
          className={cn(
            "absolute top-1/2 left-2",
            "data-[state=closed]:hidden",
          )}
        >
          <Logo className="h-6 w-auto" />
        </HomeRoute.Link>

        {/* Use the custom trigger instead */}
        <CustomSidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="h-full pt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dream Journal Entries */}
        <SidebarGroup className="pt-8 group-data-[collapsible=icon]:hidden">
          <div
            className="absolute top-0 left-2 py-2 transition-opacity duration-200"
            data-sidebar-label
          >
            <div className="flex items-center">
              <DIcon className="h-7 w-7 translate-x-[8px]" />
              <h2 className="text-sidebar-foreground/70 text-[18px] leading-[22px] font-normal tracking-[0.72px]">
                ream journal
              </h2>
            </div>
          </div>
          <SidebarGroupContent>
            <div className="mt-2 max-h-[60vh] space-y-4 overflow-y-auto px-3 py-2">
              {dreamEntries.map((dream) => (
                <Card
                  key={dream.id}
                  className="bg-muted/30 rounded-2xl p-4 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg"
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg font-bold">
                      {dream.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {dream.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end p-0 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-center"
                    >
                      <DiceIcon className="h-4 w-4" />
                      Tap to Create Video
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/images/77627641.jpg" alt="@its-Satyajit" />
                  <AvatarFallback>User</AvatarFallback>
                </Avatar>
                <span>{session.user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => router.push(HomeRoute()),
                    },
                  })
                }
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col gap-2">
            <AuthSignIn.Link>
              <Button variant="outline" className="w-full justify-start">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </AuthSignIn.Link>
            <AuthSignUp.Link>
              <Button variant="default" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </AuthSignUp.Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
