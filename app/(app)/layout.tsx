import React, { ReactNode } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex bg-muted/30">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-5 font-bold text-lg">Vocab Master</div>

        <Separator />

        <nav className="p-3 space-y-1 text-sm">
          {[
            ["Dashboard", "/"],
            ["Flashcard", "/flashcard"],
            ["Exam", "/exam"],
            ["Review", "/review"],
            ["Decks", "/deck"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 rounded hover:bg-muted transition"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 text-xs text-muted-foreground">
          Spaced Repetition System
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-white flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">Learning System</div>

          <Button size="sm" variant="outline">
            Profile
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default HomeLayout;
