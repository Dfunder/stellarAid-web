import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  isLoggedIn?: boolean;
  user?: {
    name: string;
    avatar?: string;
    email: string;
  };
}

export default function MainLayout({ children, isLoggedIn = false, user }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar isLoggedIn={isLoggedIn} user={user} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}