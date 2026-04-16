import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div>
      <h1>Hello NextJS</h1>
      <Link href={"/flashcard"}>
        <Button>Go to flashcard</Button>
      </Link>
      <Link href={"/exam"}>
        <Button>Go to exam</Button>
      </Link>
    </div>
  );
}
