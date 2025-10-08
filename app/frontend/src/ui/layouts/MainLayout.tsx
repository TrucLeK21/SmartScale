import React, { ReactNode } from "react";
<<<<<<< HEAD
import NavbarComponent from "../components/NavbarComponent";
=======
import NavbarComponent from "../components/NavbarComponent/NavbarComponent";
import ToastProvider from "../components/ToastProviderComponent/ToastProvider";
import "./MainLayout.css"

>>>>>>> combined-version

interface LayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <NavbarComponent />
<<<<<<< HEAD
      <main className="container">{children}</main>
=======
      <main>
        {children}
        <ToastProvider />
      </main>
>>>>>>> combined-version
    </div>
  );
};

export default MainLayout;
