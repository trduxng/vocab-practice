import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Menu } from "lucide-react";
import { Search } from "lucide-react";
import { Shuffle } from "lucide-react";
import { Volume2 } from "lucide-react";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="m-0 p-0">
      <header className="bg-blue-400 flex justify-between">
        <div>
          <div className="logo">
            <a href="">MemorizeMe</a>
          </div>
          <div className="user">
            <Button>Log in</Button>
            <Button>Sign up</Button>
            <Button>
              <Menu />
            </Button>
          </div>
        </div>
        <nav></nav>
      </header>
      <main>
        <div className="search">
          <h1>Look up a word, learn it forever</h1>
          <div className="search-bar">
            <Input placeholder="Search words or vocabulary lists from books, exams or textbooks"></Input>
            <Button>
              <Search />
            </Button>
          </div>
          <div className="random-words">
            <Button>
              <Shuffle />
              Random Words
            </Button>
          </div>
        </div>
        <div className="word-day">
          <h3>Word Of The Day</h3>
          <div>
            <div className="flex">
              <a href="" className="text-3xl">
                word today...
              </a>
              <Button>
                <Volume2 />
              </Button>
            </div>
            <p>meanings</p>
            <p>examples</p>
          </div>
        </div>
        <div className="common-confused">
          <div className="header">
            <a href="">Commonly Confused Words</a>
            <p>A comprehensive guide to correct word choice</p>
          </div>
          <div className="confused-content flex">
            <Card className="border-2 shadow ml-2 mr-3">
              <h2>confused words....</h2>
              <p>meanings...</p>
              <Button>
                read more
                <ChevronRight />
              </Button>
            </Card>
            <Card className="border-2 shadow ml-2 mr-3">
              <h2>confused words....</h2>
              <p>meanings...</p>
              <Button>
                read more
                <ChevronRight />
              </Button>
            </Card>
            <Card className="border-2 shadow ml-2 mr-3">
              <h2>confused words....</h2>
              <p>meanings...</p>
              <Button>
                read more
                <ChevronRight />
              </Button>
            </Card>
            <Card className="border-2 shadow ml-2 mr-3">
              <h2>confused words....</h2>
              <p>meanings...</p>
              <Button>
                read more
                <ChevronRight />
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
