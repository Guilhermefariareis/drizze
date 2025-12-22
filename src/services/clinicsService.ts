import { supabase } from '@/integrations/supabase/client';

export interface Clinic {
  id: string;
  name: string;
  city: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  is_active?: boolean;
  active?: boolean;
  status?: string;
}

export class ClinicsService {
  /**
   * Carrega clínicas com fallback para diferentes estratégias
   */
  static async loadClinics(options: {
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    maxDistance?: number;
  } = {}): Promise<{
    clinics: Clinic[];
    strategy: string;
    errors: string[];
  }> {
    console.log('[ClinicsService] Iniciando loadClinics com opções:', options);
    const errors: string[] = [];
    const strategies = [
      'nearby_with_coordinates',
      'by_city',
      'by_state',
      'all_active',
      'fallback_all'
    ];

    for (const strategy of strategies) {
      try {
        console.log(`[ClinicsService] Tentando estratégia: ${strategy}`);
        const result = await this.tryLoadClinics(strategy, options);
        console.log(`[ClinicsService] Estratégia ${strategy} retornou ${result.length} clínicas`);
        if (result.length > 0) {
          return {
            clinics: result,
            strategy,
            errors
          };
        }
      } catch (error: any) {
        errors.push(`Erro em ${strategy}: ${error.message}`);
        console.warn(`[ClinicsService] Falha na estratégia ${strategy}:`, error.message);
      }
    }

    return {
      clinics: [],
      strategy: 'none',
      errors
    };
  }

  private static async tryLoadClinics(
    strategy: string, 
    options: {
      city?: string;
      state?: string;
      latitude?: number;
      longitude?: number;
      maxDistance?: number;
    }
  ): Promise<Clinic[]> {
    switch (strategy) {
      case 'nearby_with_coordinates':
        if (!options.latitude || !options.longitude) return [];
        return await this.loadNearbyClinics(options.latitude, options.longitude, options.maxDistance || 100);

      case 'by_city':
        if (!options.city) return [];
        return await this.loadClinicsByCity(options.city);

      case 'by_state':
        if (!options.state) return [];
        return await this.loadClinicsByState(options.state);

      case 'all_active':
        return await this.loadAllActiveClinics();

      case 'fallback_all':
        return await this.loadAllClinics();

      default:
        return [];
    }
  }

  private static async loadNearbyClinics(
    latitude: number, 
    longitude: number, 
    maxDistance: number
  ): Promise<Clinic[]> {
    // Buscar todas as clínicas ativas e filtrar por distância no cliente
    const { data, error } = await supabase
      .from('clinics')
      .select('id,name,city,latitude,longitude,is_active,active,status')
      .or('is_active.eq.true,active.eq.true,status.eq.active')
      .order('name');

    if (error) throw error;
    if (!data) return [];

    return data
      .filter(clinic => clinic.latitude && clinic.longitude)
      .map(clinic => ({
        ...clinic,
        distance: this.calculateDistance(
          latitude, longitude,
          clinic.latitude!, clinic.longitude!
        )
      }))
      .filter(clinic => clinic.distance! <= maxDistance)
      .sort((a, b) => a.distance! - b.distance!);
  }

  private static async loadClinicsByCity(city: string): Promise<Clinic[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select('id,name,city,state,latitude,longitude,is_active,active,status')
      .or('is_active.eq.true,active.eq.true,status.eq.active')
      .ilike('city', `%${city}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  private static async loadClinicsByState(state: string): Promise<Clinic[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select('id,name,city,state,latitude,longitude,is_active,active,status')
      .or('is_active.eq.true,active.eq.true,status.eq.active')
      .ilike('state', `%${state}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  private static async loadAllActiveClinics(): Promise<Clinic[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select('id,name,city,state,latitude,longitude,is_active,active,status')
      .or('is_active.eq.true,active.eq.true,status.eq.active')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  private static async loadAllClinics(): Promise<Clinic[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select('id,name,city,state,latitude,longitude,is_active,active,status')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default ClinicsService;