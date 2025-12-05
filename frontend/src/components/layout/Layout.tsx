import { ReactNode } from 'react';
import { SearchHeader } from '@/components/search/SearchHeader';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <SearchHeader />
      {children}
    </>
  );
};
