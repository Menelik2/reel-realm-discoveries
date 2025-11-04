import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';
import { MovieDetailsSkeleton } from './movie-details/MovieDetailsSkeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children?: React.ReactNode;
}

const checkAdminRole = async (userId: string | undefined) => {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .limit(1);

  if (error) {
    console.error('Error checking admin role:', error);
    return false;
  }

  return data.length > 0;
};

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: () => checkAdminRole(user?.id),
    enabled: !!user,
  });

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <MovieDetailsSkeleton />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
