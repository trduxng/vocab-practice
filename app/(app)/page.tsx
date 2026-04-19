"use client";

import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HomePage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>

        <p className="text-muted-foreground">
          Học từ vựng theo hệ thống Spaced Repetition
        </p>

        <div className="flex gap-2 pt-2">
          <Badge className="transition hover:scale-105">Active Learning</Badge>
          <Badge variant="secondary" className="transition hover:scale-105">
            AI-ready
          </Badge>
        </div>
      </div>

      {/* MODE */}
      <div className="grid md:grid-cols-3 gap-5">
        {[
          {
            title: "Flashcard",
            desc: "Học bằng cách lật thẻ",
            href: "/flashcard",
          },
          {
            title: "Exam",
            desc: "Kiểm tra như thi thật",
            href: "/exam",
          },
          {
            title: "Review",
            desc: "Ôn tập thông minh",
            href: "/review",
          },
        ].map((item) => (
          <Card
            key={item.title}
            className={cn(
              "group transition-all duration-300",
              "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]",
            )}
          >
            <CardHeader className="font-semibold flex items-center justify-between">
              {item.title}

              {/* dot indicator */}
              <div className="w-2 h-2 rounded-full bg-primary opacity-60 group-hover:opacity-100 transition" />
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.desc}</p>

              <Link href={item.href}>
                <Button className="w-full transition group-hover:scale-[1.02]">
                  Start
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-5">
        {[
          ["Total Words", "1,240"],
          ["Learned", "320"],
          ["Need Review", "58"],
        ].map(([label, value]) => (
          <Card
            key={label}
            className="transition hover:shadow-md hover:-translate-y-[2px]"
          >
            <CardContent className="p-5 space-y-1">
              <div className="text-sm text-muted-foreground">{label}</div>

              <div className="text-2xl font-bold tracking-tight">{value}</div>

              {/* subtle underline */}
              <div className="h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
