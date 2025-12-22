import { supabase } from '@/lib/supabase';

export interface Clinic {
  id: string;
  name: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  price_credit?: number;
  price_money?: number;
  installments?: number;
  is_active?: boolean;
  active?: boolean;
  status?: string;
}

export interface ClinicColumn {
  name: string;
  type: string;
  nullable: boolean;
  default_value: any;
}

export interface TableStructure {
  columns: ClinicColumn[];
  hasColumn: (columnName: string) => boolean;
  getRequiredFields: () => string[];
}

/**
 * Serviço para detectar automaticamente a estrutura da tabela clinics
 * e adaptar as queries conforme as colunas disponíveis
 */
export class ClinicService {
  private static tableStructure: TableStructure | null = null;

  /**
   * Detecta a estrutura da tabela clinics
   */
  private static async detectTableStructure(): Promise<TableStructure> {
    try {
      // Query para obter informações das colunas (funciona em PostgreSQL)
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'clinics' });

      if (error || !data) {
        // Fallback: tentar buscar uma linha para ver as colunas
        const { data: sampleData } = await supabase
          .from('clinics')
          .select('*')
          .limit(1);

        if (sampleData && sampleData.length > 0) {
          const columns = Object.keys(sampleData[0]).map(key => ({
            name: key,
            type: 'unknown',
            nullable: true,
            default_value: null
          }));

          return {
            columns,
            hasColumn: (columnName: string) => columns.some(col => col.name === columnName),
            getRequiredFields: () => ['id', 'name']
          };
        }

        // Fallback final: assumir estrutura mínima
        return {
          columns: [
            { name: 'id', type: 'uuid', nullable: false, default_value: null },
            { name: 'name', type: 'text', nullable: false, default_value: null }
          ],
          hasColumn: (columnName: string) => ['id', 'name'].includes(columnName),
          getRequiredFields: () => ['id', 'name']
        };
      }

      const columns = data as ClinicColumn[];
      return {
        columns,
        hasColumn: (columnName: string) => columns.some(col => col.name === columnName),
        getRequiredFields: () => ['id', 'name']
      };
    } catch (error) {
      console.error('Erro ao detectar estrutura da tabela:', error);
      // Fallback: estrutura mínima
      return {
        columns: [],
        hasColumn: (columnName: string) => false,
        getRequiredFields: () => ['id', 'name']
      };
    }
  }

  /**
   * Obtém a estrutura da tabela (com cache)
   */
  private static async getTableStructure(): Promise<TableStructure> {
    if (!this.tableStructure) {
      this.tableStructure = await this.detectTableStructure();
    }
    return this.tableStructure;
  }

  /**
   * Constrói a query de seleção baseada nas colunas disponíveis
   */
  private static buildSelectQuery(): string {
    const structure = this.tableStructure;
    if (!structure) return 'id, name';

    const fields = ['id', 'name'];
    
    // Adicionar campos opcionais se existirem
    if (structure.hasColumn('city')) fields.push('city');
    if (structure.hasColumn('state')) fields.push('state');
    if (structure.hasColumn('latitude')) fields.push('latitude');
    if (structure.hasColumn('longitude')) fields.push('longitude');
    if (structure.hasColumn('price_credit')) fields.push('price_credit');
    if (structure.hasColumn('price_money')) fields.push('price_money');
    if (structure.hasColumn('installments')) fields.push('installments');
    if (structure.hasColumn('is_active')) fields.push('is_active');
    if (structure.hasColumn('active')) fields.push('active');
    if (structure.hasColumn('status')) fields.push('status');

    return fields.join(', ');
  }

  /**
   * Constrói filtros de ativo baseado nas colunas disponíveis
   */
  private static buildActiveFilter(structure: TableStructure): any {
    const filters = [];

    if (structure.hasColumn('is_active')) {
      filters.push({ column: 'is_active', value: true });
    }
    if (structure.hasColumn('active')) {
      filters.push({ column: 'active', value: true });
    }
    if (structure.hasColumn('status')) {
      filters.push({ column: 'status', value: 'active' });
    }

    return filters;
  }

  /**
   * Aplica filtros dinamicamente na query
   */
  private static applyFilters(query: any, structure: TableStructure, options: {
    city?: string;
    state?: string;
    onlyActive?: boolean;
  } = {}): any {
    let modifiedQuery = query;

    // Filtro por cidade
    if (options.city && structure.hasColumn('city')) {
      modifiedQuery = modifiedQuery.ilike('city', `%${options.city}%`);
    }

    // Filtro por estado
    if (options.state && structure.hasColumn('state')) {
      modifiedQuery = modifiedQuery.ilike('state', `%${options.state}%`);
    }

    // Filtro de ativo
    if (options.onlyActive) {
      const activeFilters = this.buildActiveFilter(structure);
      
      if (activeFilters.length > 0) {
        // Usar OR para múltiplos campos de ativo
        const orConditions = activeFilters.map(f => `${f.column}.eq.${f.value}`).join(',');
        modifiedQuery = modifiedQuery.or(orConditions);
      }
    }

    return modifiedQuery;
  }

  /**
   * Busca todas as clínicas com fallback para estruturas mínimas
   */
  static async getAllClinics(options: {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    onlyActive?: boolean;
  } = {}): Promise<Clinic[]> {
    try {
      const structure = await this.getTableStructure();
      const selectQuery = this.buildSelectQuery();
      
      let query = supabase
        .from('clinics')
        .select(selectQuery);

      // Aplicar filtros
      query = this.applyFilters(query, structure, { onlyActive: options.onlyActive });

      // Ordenação
      if (options.orderBy && structure.hasColumn(options.orderBy)) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection === 'asc' 
        });
      } else {
        query = query.order('name', { ascending: true });
      }

      // Limite
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar clínicas:', error);
        
        // Fallback: tentar buscar apenas com campos obrigatórios
        const fallbackQuery = await supabase
          .from('clinics')
          .select('id, name')
          .order('name');

        if (fallbackQuery.error) {
          throw fallbackQuery.error;
        }

        // Adicionar dados mockados para campos faltantes
        return (fallbackQuery.data || []).map(clinic => this.enrichWithMockData(clinic));
      }

      // Enriquecer dados se necessário
      return (data || []).map(clinic => this.enrichClinicData(clinic, structure));

    } catch (error) {
      console.error('Erro crítico ao buscar clínicas:', error);
      
      // Fallback final: retornar clínicas mock
      return this.getMockClinics();
    }
  }

  /**
   * Busca clínicas por cidade com fallback
   */
  static async getClinicsByCity(city: string, state?: string): Promise<Clinic[]> {
    try {
      const structure = await this.getTableStructure();
      
      // Se não tiver coluna city, usar fallback
      if (!structure.hasColumn('city')) {
        const allClinics = await this.getAllClinics({ onlyActive: true });
        return this.filterClinicsByLocation(allClinics, city, state);
      }

      const selectQuery = this.buildSelectQuery();
      
      let query = supabase
        .from('clinics')
        .select(selectQuery)
        .ilike('city', `%${city}%`);

      if (state && structure.hasColumn('state')) {
        query = query.ilike('state', `%${state}%`);
      }

      query = this.applyFilters(query, structure, { onlyActive: true });
      query = query.order('name');

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(clinic => this.enrichClinicData(clinic, structure));

    } catch (error) {
      console.error('Erro ao buscar clínicas por cidade:', error);
      
      // Fallback: buscar todas e filtrar
      const allClinics = await this.getAllClinics({ onlyActive: true });
      return this.filterClinicsByLocation(allClinics, city, state);
    }
  }

  /**
   * Busca clínicas próximas (se houver coordenadas)
   */
  static async getNearbyClinics(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 50
  ): Promise<Clinic[]> {
    try {
      const structure = await this.getTableStructure();
      
      // Se não houver colunas de coordenadas, usar fallback por cidade
      if (!structure.hasColumn('latitude') || !structure.hasColumn('longitude')) {
        return this.getClinicsByCity('Trindade', 'GO'); // Fallback para Trindade/GO
      }

      const selectQuery = this.buildSelectQuery();
      
      const { data, error } = await supabase
        .from('clinics')
        .select(selectQuery)
        .gte('latitude', latitude - 0.5) // Aproximação simples
        .lte('latitude', latitude + 0.5)
        .gte('longitude', longitude - 0.5)
        .lte('longitude', longitude + 0.5)
        .order('name');

      if (error) {
        throw error;
      }

      const clinics = (data || []).map(clinic => this.enrichClinicData(clinic, structure));
      
      // Calcular distâncias reais e filtrar
      return clinics
        .map(clinic => ({
          ...clinic,
          distance: this.calculateDistance(latitude, longitude, clinic.latitude!, clinic.longitude!)
        }))
        .filter(clinic => clinic.distance <= radiusKm)
        .sort((a, b) => (a.distance || 999) - (b.distance || 999));

    } catch (error) {
      console.error('Erro ao buscar clínicas próximas:', error);
      return this.getMockClinics();
    }
  }

  /**
   * Enriquece dados da clínica com informações padrão se necessário
   */
  private static enrichClinicData(clinic: any, structure: TableStructure): Clinic {
    const enriched = { ...clinic };

    // Adicionar localização padrão se não existir
    if (!structure.hasColumn('city') || !enriched.city) {
      enriched.city = 'Trindade';
    }
    if (!structure.hasColumn('state') || !enriched.state) {
      enriched.state = 'GO';
    }
    if (!structure.hasColumn('latitude') || !enriched.latitude) {
      enriched.latitude = -16.6493;
    }
    if (!structure.hasColumn('longitude') || !enriched.longitude) {
      enriched.longitude = -49.4886;
    }

    // Garantir que está ativa
    if (structure.hasColumn('is_active')) {
      enriched.is_active = enriched.is_active !== false;
    } else if (structure.hasColumn('active')) {
      enriched.active = enriched.active !== false;
    } else if (structure.hasColumn('status')) {
      enriched.status = enriched.status || 'active';
    }

    return enriched;
  }

  /**
   * Adiciona dados mockados para clínicas sem informações completas
   */
  private static enrichWithMockData(clinic: any): Clinic {
    return {
      id: clinic.id,
      name: clinic.name,
      city: 'Trindade',
      state: 'GO',
      latitude: -16.6493 + (Math.random() - 0.5) * 0.01,
      longitude: -49.4886 + (Math.random() - 0.5) * 0.01,
      price_credit: 1500 + Math.random() * 1000,
      price_money: 1200 + Math.random() * 800,
      installments: 12,
      is_active: true
    };
  }

  /**
   * Filtra clínicas por localização (fallback)
   */
  private static filterClinicsByLocation(clinics: Clinic[], city: string, state?: string): Clinic[] {
    return clinics.filter(clinic => {
      const matchesCity = !city || clinic.city?.toLowerCase().includes(city.toLowerCase());
      const matchesState = !state || clinic.state?.toLowerCase().includes(state.toLowerCase());
      return matchesCity && matchesState;
    });
  }

  /**
   * Calcula distância entre dois pontos (Haversine)
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(value: number): number {
    return value * Math.PI / 180;
  }

  /**
   * Retorna clínicas mock para fallback total
   */
  private static getMockClinics(): Clinic[] {
    return [
      {
        id: 'mock-trindade-1',
        name: 'Clínica Odontológica Trindade',
        city: 'Trindade',
        state: 'GO',
        latitude: -16.6493,
        longitude: -49.4886,
        price_credit: 1500,
        price_money: 1200,
        installments: 12,
        is_active: true
      },
      {
        id: 'mock-trindade-2',
        name: 'Sorriso Premium Trindade',
        city: 'Trindade',
        state: 'GO',
        latitude: -16.6469,
        longitude: -49.4889,
        price_credit: 1800,
        price_money: 1500,
        installments: 12,
        is_active: true
      },
      {
        id: 'mock-goiania-1',
        name: 'Clínica Centro Odontológico',
        city: 'Goiânia',
        state: 'GO',
        latitude: -16.6869,
        longitude: -49.2648,
        price_credit: 2000,
        price_money: 1700,
        installments: 12,
        is_active: true
      }
    ];
  }

  /**
   * Limpa o cache da estrutura da tabela
   */
  static clearCache(): void {
    this.tableStructure = null;
  }
}

// Exportar funções individuais para uso mais simples
export const clinicService = {
  getAllClinics: ClinicService.getAllClinics.bind(ClinicService),
  getClinicsByCity: ClinicService.getClinicsByCity.bind(ClinicService),
  getNearbyClinics: ClinicService.getNearbyClinics.bind(ClinicService),
  clearCache: ClinicService.clearCache.bind(ClinicService)
};