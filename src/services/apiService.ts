const API_BASE_URL = 'https://10.101.100.251/en/kilimostat-api';

export interface ApiEndpoints {
  counties: string;
  institutions: string;
  subsectors: string;
  domains: string;
  subdomains: string;
  elements: string;
  itemcategories: string;
  items: string;
  units: string;
  kilimodataPagination: string;
}

export interface County {
  id: number;
  name: string;
  code: string;
}

export interface Domain {
  id: number;
  name: string;
  code: string;
  description: string;
  subsector: number;
}

export interface SubDomain {
  id: number;
  name: string;
  code: string;
  description: string;
  domain: number;
}

export interface Element {
  id: number;
  name: string;
  code: string;
  description: string;
  subdomain: number;
}

export interface Item {
  id: number;
  name: string;
  code: string;
  description: string;
  element: number;
  itemcategory: number;
  periodicity: string;
}

export interface ItemCategory {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  description: string;
}

export interface Subsector {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface KilimoDataParams {
  counties?: number[];
  elements?: number[];
  items?: number[];
  years?: number[];
  subdomain?: number;
  page?: number;
}

export interface KilimoDataRecord {
  id: number;
  region: string;
  refyear: string;
  value: string;
  note: string;
  date_created: string;
  date_updated: string;
  county: number;
  subsector: number;
  domain: number;
  subdomain: number;
  element: number;
  item: number;
  unit: number;
  flag: number;
  source: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class ApiService {
  private endpoints: ApiEndpoints | null = null;

  private async getEndpoints(): Promise<ApiEndpoints> {
    if (this.endpoints) return this.endpoints;

    try {
      console.log('Fetching API endpoints from:', API_BASE_URL);
      const response = await fetch(API_BASE_URL + '/');
      if (!response.ok) {
        throw new Error(`Failed to fetch API endpoints: ${response.status} ${response.statusText}`);
      }
      this.endpoints = await response.json();
      return this.endpoints!;
    } catch (error) {
      console.error('Failed to fetch API endpoints:', error);
      // fallback hardcoded endpoints
      this.endpoints = {
        counties: `${API_BASE_URL}/counties/`,
        institutions: `${API_BASE_URL}/institutions/`,
        subsectors: `${API_BASE_URL}/subsectors/`,
        domains: `${API_BASE_URL}/domains/`,
        subdomains: `${API_BASE_URL}/subdomains/`,
        elements: `${API_BASE_URL}/elements/`,
        itemcategories: `${API_BASE_URL}/itemcategories/`,
        items: `${API_BASE_URL}/items/`,
        units: `${API_BASE_URL}/units/`,
        kilimodataPagination: `${API_BASE_URL}/kilimodata_pagination/`
      };
      return this.endpoints;
    }
  }

  private async request<T>(url: string): Promise<T[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  }

  async getCounties(): Promise<County[]> {
    const endpoints = await this.getEndpoints();
    return this.request<County>(endpoints.counties);
  }

  async getDomains(): Promise<Domain[]> {
    const endpoints = await this.getEndpoints();
    return this.request<Domain>(endpoints.domains);
  }

  async getSubdomains(): Promise<SubDomain[]> {
    const endpoints = await this.getEndpoints();
    return this.request<SubDomain>(endpoints.subdomains);
  }

  async getElements(): Promise<Element[]> {
    const endpoints = await this.getEndpoints();
    return this.request<Element>(endpoints.elements);
  }

  async getItems(): Promise<Item[]> {
    const endpoints = await this.getEndpoints();
    return this.request<Item>(endpoints.items);
  }

  async getItemCategories(): Promise<ItemCategory[]> {
    const endpoints = await this.getEndpoints();
    return this.request<ItemCategory>(endpoints.itemcategories);
  }

  async getUnits(): Promise<Unit[]> {
    const endpoints = await this.getEndpoints();
    return this.request<Unit>(endpoints.units);
  }

  async getSubsectors(): Promise<Subsector[]> {
    const endpoints = await this.getEndpoints();
    return this.request<Subsector>(endpoints.subsectors);
  }

  /**
   * Paginated data fetcher
   */
  async getKilimoDataPaginated(
    params: KilimoDataParams
  ): Promise<PaginatedResponse<KilimoDataRecord>> {
    const endpoints = await this.getEndpoints();
    const searchParams = new URLSearchParams();

    if (params.counties?.length) searchParams.set('county', `[${params.counties.join(',')}]`);
    if (params.elements?.length) searchParams.set('element', `[${params.elements.join(',')}]`);
    if (params.items?.length) searchParams.set('item', `[${params.items.join(',')}]`);
    if (params.years?.length) searchParams.set('refyear', `[${params.years.join(',')}]`);
    if (params.subdomain) searchParams.set('subdomain', params.subdomain.toString());
    if (params.page) searchParams.set('page', params.page.toString());

    const url = `${endpoints.kilimodataPagination}?${searchParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      count: data.count,
      next: data.next ? decodeURIComponent(data.next) : null,
      previous: data.previous ? decodeURIComponent(data.previous) : null,
      results: data.results || []
    };
  }

  /**
   * Backward-compatible alias: get first page only
   */
  async getKilimoData(params: KilimoDataParams): Promise<KilimoDataRecord[]> {
    const page1 = await this.getKilimoDataPaginated({ ...params, page: params.page ?? 1 });
    return page1.results;
  }
}

export const apiService = new ApiService();
