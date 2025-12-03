import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  // Demo mode: always redirect to 404 (no admin functionality)
  return <Navigate to="/404" replace />;
};

  return <>{children}</>;
};