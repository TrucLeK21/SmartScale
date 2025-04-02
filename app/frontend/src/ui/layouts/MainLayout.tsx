import React, { ReactNode } from "react";
import NavbarComponent from "../components/NavbarComponent";

interface LayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <NavbarComponent />
      <main className="container">{children}</main>
    </div>
  );
};

export default MainLayout;
