const API_BASE_URL = '/kilimostat-api';
const INTERNAL_API_ORIGIN = 'https://10.101.100.251';
const INTERNAL_API_PATH_PREFIX = '/en/kilimostat-api';

function toProxyUrl(url: string): string {
  if (url.startsWith(INTERNAL_API_ORIGIN + INTERNAL_API_PATH_PREFIX)) {
    return url.replace(INTERNAL_API_ORIGIN + INTERNAL_API_PATH_PREFIX, API_BASE_URL);
  }
  return url;
}

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
  kilimodata_pagination: string;
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

export interface KilimoDataRecord {
  id: number;
  county: string;
  subsector: string;
  domain: string;
  subdomain: string;
  element: string;
  item: string;
  source: string;
  flag: string;
  unit: string;
  region: string;
  refyear: string;
  value: string;
  note: string;
  date_created: string;
  date_updated: string;
}

export interface KilimoDataParams {
  counties?: number[];
  elements?: number[];
  items?: number[];
  years?: number[];
  subdomain?: number;
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

    const response = await fetch(`${API_BASE_URL}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch API endpoints: ${response.status} ${response.statusText}`);
    }
    const raw = await response.json();
    this.endpoints = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, toProxyUrl(v as string)])
    ) as ApiEndpoints;
    return this.endpoints!;
  }

  private async fetchAllPages<T>(url: string): Promise<T[]> {
    const results: T[] = [];
    let nextUrl: string | null = url;

    while (nextUrl) {
      const response = await fetch(nextUrl);
      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        results.push(...data);
        nextUrl = null;
      } else if (data.results && Array.isArray(data.results)) {
        results.push(...data.results);
        nextUrl = data.next ? toProxyUrl(data.next) : null;
      } else {
        results.push(data);
        nextUrl = null;
      }
    }

    return results;
  }

  async getCounties(): Promise<County[]> {
    const endpoints = await this.getEndpoints();
    return this.fetchAllPages<County>(endpoints.counties);
  }

  async getDomains(): Promise<Domain[]> {
    const endpoints = await this.getEndpoints();
    return this.fetchAllPages<Domain>(endpoints.domains);
  }

  async getSubdomains(): Promise<SubDomain[]> {
    const endpoints = await this.getEndpoints();
    return this.fetchAllPages<SubDomain>(endpoints.subdomains);
  }

  async getElements(): Promise<Element[]> {
    const endpoints = await this.getEndpoints();
    return this.fetchAllPages<Element>(endpoints.elements);
  }

  async getItems(): Promise<Item[]> {
    const endpoints = await this.getEndpoints();
    return this.fetchAllPages<Item>(endpoints.items);
  }

  async getItemCategories(): Promise<ItemCategory[]> {
    const endpoints = await this.getEndpoints();
    return this.fetchAllPages<ItemCategory>(endpoints.itemcategories);
  }

  async getUnits(): Promise<Unit[]> {
    const endpoints = await this.getEndpoints();
    return this.fetchAllPages<Unit>(endpoints.units);
  }

  async getSubsectors(): Promise<Subsector[]> {
    const endpoints = await this.getEndpoints();
    return this.fetchAllPages<Subsector>(endpoints.subsectors);
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

    const url = `${endpoints.kilimodata_pagination}?${searchParams.toString()}`;
    return this.fetchAllPages<KilimoDataRecord>(url);
  }

  async downloadKilimoData(params: KilimoDataParams, options: DataExportOptions): Promise<Blob> {
    const data = await this.getKilimoData(params);

    if (data.length === 0) {
      throw new Error('No data available for download');
    }

    const headers = [
      'County',
      'Subsector',
      'Domain',
      'Subdomain',
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

    data.forEach(record => {
      let value = record.value;
      if (options.thousandSeparator === 'comma') {
        value = parseFloat(record.value).toLocaleString();
      } else if (options.thousandSeparator === 'period') {
        value = parseFloat(record.value).toLocaleString('de-DE');
      }

      const row = [
        `"${record.county}"`,
        `"${record.subsector}"`,
        `"${record.domain}"`,
        `"${record.subdomain}"`,
        `"${record.element}"`,
        `"${record.item}"`,
        record.refyear,
        value,
        ...(options.includeUnits ? [`"${record.unit}"`] : []),
        `"${record.region}"`,
        ...(options.includeFlags ? [`"${record.flag || ''}"`] : []),
        ...(options.includeNotes ? [`"${record.note || ''}"`] : [])
      ];

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}

export const apiService = new ApiService();
