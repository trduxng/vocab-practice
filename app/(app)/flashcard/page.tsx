"use client";

import React from "react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Flashcard = () => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Flashcard Mode</h2>

        <Badge variant="secondary">12 / 100</Badge>
      </div>

      {/* PROGRESS */}
      <Progress value={12} className="h-2" />

      {/* CARD CONTAINER */}
      <div className="flex justify-center py-10">
        <div
          onClick={() => setFlipped(!flipped)}
          className="perspective-1000 w-[420px] h-[260px] cursor-pointer"
        >
          <div
            className={cn(
              "relative w-full h-full transition-transform duration-500",
              flipped ? "rotate-y-180" : "",
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* FRONT */}
            <Card className="absolute w-full h-full flex items-center justify-center backface-hidden">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Word</div>
                <div className="text-3xl font-bold">Abandon</div>
                <div className="text-xs text-muted-foreground mt-4">
                  Click to flip
                </div>
              </div>
            </Card>

            {/* BACK */}
            <Card className="absolute w-full h-full flex items-center justify-center rotate-y-180 backface-hidden">
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">Meaning</div>
                <div className="text-2xl font-semibold">Từ bỏ / Bỏ rơi</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex justify-center gap-3">
        <Button variant="outline">Again</Button>
        <Button variant="secondary">Hard</Button>
        <Button>Easy</Button>
      </div>

      {/* HINT */}
      <div className="text-center text-xs text-muted-foreground">
        Space: flip • 1/2/3: rate
      </div>
    </div>
  );
};

export default Flashcard;
