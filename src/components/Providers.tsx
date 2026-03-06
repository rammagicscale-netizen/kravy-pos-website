"use client";

import { SidebarProvider } from "@/components/SidebarContext";
import { SearchProvider } from "@/components/SearchContext";
import ThemeProvider from "@/components/ThemeProvider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <SearchProvider>
          {children}
        </SearchProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
