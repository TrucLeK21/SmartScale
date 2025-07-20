import React, { ReactNode } from "react";
import NavbarComponent from "../components/NavbarComponent/NavbarComponent";
import ToastProvider from "../components/ToastProviderComponent/ToastProvider";
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
        <ToastProvider />
      </main>
    </div>
  );
};

export default MainLayout;
