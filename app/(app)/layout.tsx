"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const nav = [
  { name: "Dashboard", href: "/" },
  { name: "Flashcard", href: "/flashcard" },
  { name: "Exam", href: "/exam" },
  { name: "Review", href: "/review" },
];

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* SIDEBAR */}
        <Sidebar className="border-r bg-card">
          <div className="p-5 text-lg font-semibold tracking-tight">
            Vocab System
          </div>

          <Separator />

          <nav className="p-3 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm transition-all duration-200",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow"
                    : "hover:bg-muted hover:translate-x-1",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto p-4 flex items-center gap-3">
            <Avatar>
              <AvatarFallback>HP</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">HoangPhuc</div>
              <div className="text-xs text-muted-foreground">Student</div>
            </div>
          </div>
        </Sidebar>

        {/* MAIN */}
        <div className="flex-1 flex flex-col">
          {/* TOPBAR */}
          <header className="h-14 border-b flex items-center justify-between px-6 backdrop-blur bg-background/70 sticky top-0 z-10 transition">
            <div className="text-sm text-muted-foreground">Learning System</div>
          </header>

          {/* CONTENT */}
          <main className="flex-1 p-6 overflow-auto animate-in fade-in duration-300">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default HomeLayout;
