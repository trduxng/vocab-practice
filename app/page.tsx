import { Button } from "@/components/ui/button";
import { link } from "fs";

export default function Home() {
  return (
    <div>
      <h1>Hello Next.JS !</h1>
      <Button variant={"destructive"} size={"default"}>
        Click Me
      </Button>
    </div>
  );
}
