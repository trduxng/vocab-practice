import React, { ReactNode } from "react";

const LandingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <header>Landing Page header</header>
      {children}
      <footer>Landing Page footer</footer>
    </div>
  );
};

export default LandingLayout;
