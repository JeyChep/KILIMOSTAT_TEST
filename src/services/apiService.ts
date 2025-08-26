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
  kilimodata: string;
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

export interface DataExportOptions {
  outputType: 'table' | 'pivot';
  fileType: 'csv' | 'xls';
  thousandSeparator: 'none' | 'comma' | 'period';
  includeFlags: boolean;
  includeNotes: boolean;
  includeCodes: boolean;
  includeUnits: boolean;
  includeNullValues: boolean;
}
class ApiService {
  private endpoints: ApiEndpoints | null = null;

  private async getEndpoints(): Promise<ApiEndpoints> {
    if (this.endpoints) {
      return this.endpoints;
    }

    try {
      const response = await fetch(API_BASE_URL + '/');
      if (!response.ok) {
        throw new Error(`Failed to fetch endpoints: ${response.statusText}`);
      }
      this.endpoints = await response.json();
      return this.endpoints!;
    } catch (error) {
      console.error('Failed to fetch API endpoints:', error);
      throw error;
    }
  }

  private async request<T>(url: string): Promise<T[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error(`Failed to fetch data from ${url}:`, error);
      throw error;
    }
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

  async getSubdomainsByDomain(domainId: number): Promise<SubDomain[]> {
    const subdomains = await this.getSubdomains();
    return subdomains.filter(subdomain => subdomain.domain === domainId);
  }

  async getElementsBySubdomain(subdomainId: number): Promise<Element[]> {
    const elements = await this.getElements();
    return elements.filter(element => element.subdomain === subdomainId);
  }

  async getItemsByCategory(categoryId: number): Promise<Item[]> {
    const items = await this.getItems();
    return items.filter(item => item.itemcategory === categoryId);
  }

  async getKilimoData(params: KilimoDataParams): Promise<KilimoDataRecord[]> {
    const endpoints = await this.getEndpoints();
    const searchParams = new URLSearchParams();
    
    if (params.counties?.length) {
      params.counties.forEach(id => searchParams.append('county', id.toString()));
    }
    if (params.elements?.length) {
      params.elements.forEach(id => searchParams.append('element', id.toString()));
    }
    if (params.items?.length) {
      params.items.forEach(id => searchParams.append('item', id.toString()));
    }
    if (params.years?.length) {
      params.years.forEach(year => searchParams.append('refyear', year.toString()));
    }
    if (params.subdomain) {
      searchParams.append('subdomain', params.subdomain.toString());
    }

    const url = `${endpoints.kilimodata}?${searchParams.toString()}`;
    return this.request<KilimoDataRecord>(url);
  }

  async downloadKilimoData(params: KilimoDataParams, options: DataExportOptions): Promise<Blob> {
    const endpoints = await this.getEndpoints();
    const searchParams = new URLSearchParams();
    
    // Add data selection parameters
    if (params.counties?.length) {
      params.counties.forEach(id => searchParams.append('county', id.toString()));
    }
    if (params.elements?.length) {
      params.elements.forEach(id => searchParams.append('element', id.toString()));
    }
    if (params.items?.length) {
      params.items.forEach(id => searchParams.append('item', id.toString()));
    }
    if (params.years?.length) {
      params.years.forEach(year => searchParams.append('refyear', year.toString()));
    }
    if (params.subdomain) {
      searchParams.append('subdomain', params.subdomain.toString());
    }

    // Add export options
    searchParams.append('format', options.fileType);
    searchParams.append('output_type', options.outputType);
    searchParams.append('thousand_separator', options.thousandSeparator);
    searchParams.append('include_flags', options.includeFlags.toString());
    searchParams.append('include_notes', options.includeNotes.toString());
    searchParams.append('include_codes', options.includeCodes.toString());
    searchParams.append('include_units', options.includeUnits.toString());
    searchParams.append('include_null_values', options.includeNullValues.toString());

    const url = `${endpoints.kilimodata}/export/?${searchParams.toString()}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      return response.blob();
    } catch (error) {
      console.error(`Failed to download data from ${url}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();