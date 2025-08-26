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
      console.log('Making request to:', url);
      const response = await fetch(url);
      console.log(`Response for ${url}:`, response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response for ${url}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. URL: ${url}`);
      }
      const data = await response.json();
      console.log(`Data received from ${url}:`, Array.isArray(data) ? `Array with ${data.length} items` : typeof data);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error(`Failed to fetch data from ${url}:`, error);
      throw error;
    }
  }

  async getCounties(): Promise<County[]> {
    const endpoints = await this.getEndpoints();
    console.log('Fetching counties from:', endpoints.counties);
    return this.request<County>(endpoints.counties);
  }

  async getDomains(): Promise<Domain[]> {
    const endpoints = await this.getEndpoints();
    console.log('Fetching domains from:', endpoints.domains);
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

  async getItemsBySubdomain(subdomainId: number): Promise<Item[]> {
    const items = await this.getItems();
    const elements = await this.getElementsBySubdomain(subdomainId);
    const elementIds = elements.map(e => e.id);
    return items.filter(item => elementIds.includes(item.element));
  }

  async getItemCategoriesBySubdomain(subdomainId: number): Promise<ItemCategory[]> {
    const items = await this.getItemsBySubdomain(subdomainId);
    const categoryIds = [...new Set(items.map(item => item.itemcategory))];
    const allCategories = await this.getItemCategories();
    return allCategories.filter(category => categoryIds.includes(category.id));
  }

  async getKilimoData(params: KilimoDataParams): Promise<KilimoDataRecord[]> {
    const endpoints = await this.getEndpoints();
    console.log('Available endpoints:', endpoints);
    
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
    try {
      console.log('Fetching data from:', url);
      console.log('Search params:', searchParams.toString());
      console.log('Request parameters:', params);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${errorText}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Handle different response formats
      if (Array.isArray(data)) {
        console.log('Returning array data, length:', data.length);
        return data;
      } else if (data.results && Array.isArray(data.results)) {
        console.log('Returning data.results, length:', data.results.length);
        return data.results;
      } else if (data.data && Array.isArray(data.data)) {
        console.log('Returning data.data, length:', data.data.length);
        return data.data;
      } else {
        console.warn('Unexpected API response format:', data);
        console.warn('Available keys:', Object.keys(data));
        return [];
      }
    } catch (error) {
      console.error(`Failed to fetch kilimo data from ${url}:`, error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - check if the API server is running and accessible');
      }
      throw error;
    }
  }

  async downloadKilimoData(params: KilimoDataParams, options: DataExportOptions): Promise<Blob> {
    try {
      // First get the data
      const data = await this.getKilimoData(params);
      
      if (data.length === 0) {
        throw new Error('No data available for download');
      }
      
      // Convert to CSV format
      const headers = [
        'County',
        'Element', 
        'Item',
        'Year',
        'Value',
        ...(options.includeUnits ? ['Unit'] : []),
        'Region',
        ...(options.includeFlags ? ['Flag'] : []),
        ...(options.includeNotes ? ['Note'] : [])
      ];
      
      const csvRows = [headers.join(',')];
      
      // Get reference data for names
      const [counties, elements, items, units] = await Promise.all([
        this.getCounties(),
        this.getElements(), 
        this.getItems(),
        this.getUnits()
      ]);
      
      data.forEach(record => {
        const county = counties.find(c => c.id === record.county)?.name || record.county.toString();
        const element = elements.find(e => e.id === record.element)?.name || record.element.toString();
        const item = items.find(i => i.id === record.item)?.name || record.item.toString();
        const unit = units.find(u => u.id === record.unit)?.abbreviation || '';
        
        let value = record.value;
        if (options.thousandSeparator === 'comma') {
          value = parseFloat(record.value).toLocaleString();
        } else if (options.thousandSeparator === 'period') {
          value = parseFloat(record.value).toLocaleString('de-DE');
        }
        
        const row = [
          `"${county}"`,
          `"${element}"`,
          `"${item}"`,
          record.refyear,
          value,
          ...(options.includeUnits ? [`"${unit}"`] : []),
          `"${record.region}"`,
          ...(options.includeFlags ? [record.flag?.toString() || ''] : []),
          ...(options.includeNotes ? [`"${record.note || ''}"`] : [])
        ];
        
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      console.error('Failed to download data:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();