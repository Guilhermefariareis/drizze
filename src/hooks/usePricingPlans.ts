import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string;
  features: string[];
  is_popular: boolean | null;
  is_active: boolean | null;
  plan_type: 'patient' | 'clinic' | 'clinic_advanced';
  display_order: number | null;
  created_at: string | null;
}

export function usePricingPlans(planType: 'patient' | 'clinic' | 'clinic_advanced' = 'clinic') {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .eq('plan_type', planType)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [planType]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans
  };
}