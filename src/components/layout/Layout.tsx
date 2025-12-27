import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      
      {/* Hidden Admin Link */}
      <Link
        to="/admin/login"
        className="fixed bottom-4 right-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors z-40 text-lg leading-none"
      >
        .
      </Link>
    </div>
  );
};

export default Layout;
