import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <nav className="border-2 border-b-black flex">Flashcard nav</nav>
      {children}
    </div>
  );
};

export default layout;
