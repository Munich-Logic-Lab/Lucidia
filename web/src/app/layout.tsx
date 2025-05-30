import type { Metadata } from "next";
import { cookies } from "next/headers";

import env from "@/env";
import "@/styles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AppSidebar } from "@/components/custom/AppSidebar";
import ReactQueryProvider from "@/components/providers/ReactQuery";
import Footer from "@/components/section/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Lucidia",
  description: "Journaling App for Your Dreams",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get("sidebar_state");
  const defaultOpen = sidebarCookie?.value === "true";

  return (
    <html lang="en">
      <body className="scroll-smooth antialiased">
        <ReactQueryProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className="grid h-screen w-full grid-rows-[1fr_auto]">
              <div className="flex">
                <AppSidebar />
                <main className="w-3/4 flex-grow">
                  <div className="prose-base w-full">{children}</div>
                </main>
              </div>
              <Footer />
            </div>
            {env.NODE_ENV === "development" ? <ReactQueryDevtools /> : null}
            <Toaster />
          </SidebarProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
