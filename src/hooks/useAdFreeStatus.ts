
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const checkAdFreeStatus = async (userId: string | undefined) => {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .limit(1);

  if (error) {
    console.error('Error fetching ad-free status:', error);
    return false;
  }

  return data.length > 0;
};

export const useAdFreeStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ad-free-status', user?.id],
    queryFn: () => checkAdFreeStatus(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
