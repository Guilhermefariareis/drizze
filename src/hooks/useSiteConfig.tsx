import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteConfig {
  site_logo?: {
    url: string;
    fileName?: string;
  };
  hero_title?: string;
  hero_subtitle?: string;
  contact_info?: {
    phone: string;
    email: string;
    address: string;
  };
}

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  const fetchSiteConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_configurations')
        .select('config_key, config_value');

      if (error) throw error;

      const configObject: SiteConfig = {};
      data?.forEach((item) => {
        const key = item.config_key as keyof SiteConfig;
        configObject[key] = item.config_value as any;
      });

      setConfig(configObject);
    } catch (error) {
      console.error('Error fetching site config:', error);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, refetch: fetchSiteConfig };
};