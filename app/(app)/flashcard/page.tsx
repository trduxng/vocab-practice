"use client";

import React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const Flashcard = () => {
  const [flip, setFlip] = useState(false);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Progress value={30} />

      {/* CARD */}
      <div className="flex justify-center py-10">
        <div
          onClick={() => setFlip(!flip)}
          className="w-[420px] h-[260px] cursor-pointer perspective-1000"
        >
          <div
            className={cn(
              "relative w-full h-full transition-transform duration-500",
              flip && "rotate-y-180",
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* FRONT */}
            <Card className="absolute w-full h-full flex items-center justify-center backface-hidden">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Word</div>
                <div className="text-3xl font-bold">Abandon</div>
              </div>
            </Card>

            {/* BACK */}
            <Card className="absolute w-full h-full flex items-center justify-center rotate-y-180 backface-hidden">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Meaning</div>
                <div className="text-xl">Từ bỏ</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" className="hover:scale-105 transition">
          Again
        </Button>
        <Button variant="secondary" className="hover:scale-105 transition">
          Hard
        </Button>
        <Button className="hover:scale-105 transition">Easy</Button>
      </div>
    </div>
  );
};

export default Flashcard;
