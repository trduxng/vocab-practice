import { Button } from "@/components/ui/button";

import { Menu } from "lucide-react";
import { Search } from "lucide-react";
import { Shuffle } from "lucide-react";
import { Volume2 } from "lucide-react";

export default function Home() {
  return (
    <div className="m-0 p-0">
      <header className="bg-blue-400 flex justify-between">
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
      </header>
      <main>
        <div className="search">
          <h1>Look up a word, learn it forever</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search words or vocabulary lists from books, exams or textbooks"
            />
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
          
        </div>
      </main>
    </div>
  );
}
