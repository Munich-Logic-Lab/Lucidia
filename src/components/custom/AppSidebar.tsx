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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { signOut, useSession } from "@/lib/auth/auth-client";

import Logo from "./logo";

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <HomeRoute.Link>
          <Logo className="h-6 w-auto" />
        </HomeRoute.Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-10">
          {/* We use an absolute positioned label that doesn't affect layout */}
          <div
            className="absolute top-0 left-2 py-2 transition-opacity duration-200"
            data-sidebar-label
          >
            <span className="text-sidebar-foreground/70 text-xs font-medium">
              Navigation
            </span>
          </div>
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
      </SidebarContent>
      <SidebarFooter className="p-4">
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
