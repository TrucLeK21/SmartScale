import React, { ReactNode } from "react";
import NavbarComponent from "../components/NavbarComponent";
import "./MainLayout.css"

interface LayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <NavbarComponent />
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
