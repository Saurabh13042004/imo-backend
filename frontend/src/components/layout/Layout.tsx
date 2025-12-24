import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchHeader } from '@/components/search/SearchHeader';
import { Footer } from '@/components/layout/Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const showFooter = !location.pathname.includes('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <SearchHeader />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};
