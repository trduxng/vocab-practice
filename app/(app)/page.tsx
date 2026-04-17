import React from "react";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HomePage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HERO */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back 👋</h1>
        <p className="text-muted-foreground mt-1">
          Học từ vựng theo hệ thống Spaced Repetition
        </p>

        <div className="flex gap-2 mt-3">
          <Badge>Active Learning</Badge>
          <Badge variant="secondary">AI-ready</Badge>
        </div>
      </div>

      {/* MODE GRID */}
      <div className="grid md:grid-cols-3 gap-4">
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
          <Card key={item.title} className="hover:shadow-lg transition">
            <CardHeader className="font-semibold">{item.title}</CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.desc}</p>

              <Link href={item.href}>
                <Button className="w-full">Start</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["Total Words", "1,240"],
          ["Learned", "320"],
          ["Need Review", "58"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
