const API_BASE_URL = 'https://kilimostat.kilimo.go.ke/en/kilimostat-api';

// Configuration flag to switch between real API and mock data
const USE_MOCK_DATA = true;

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

  // Check if we should use mock data
  private shouldUseMockData(): boolean {
    return USE_MOCK_DATA || import.meta.env.DEV;
  }

  private async getEndpoints(): Promise<ApiEndpoints> {
    if (this.shouldUseMockData()) {
      // Return mock endpoints (not actually used)
      return {
        counties: '',
        institutions: '',
        subsectors: '',
        domains: '',
        subdomains: '',
        elements: '',
        itemcategories: '',
        items: '',
        units: '',
        kilimodata: ''
      };
    }

    if (this.endpoints) {
      return this.endpoints;
    }

    try {
      console.log('Fetching API endpoints from:', API_BASE_URL);
      const response = await fetch(API_BASE_URL + '/');
      if (!response.ok) {
        console.error('Endpoints request failed:', response.status, response.statusText);
        throw new Error(`Failed to fetch API endpoints: ${response.status} ${response.statusText}`);
      }
      this.endpoints = await response.json();
      console.log('API endpoints loaded:', this.endpoints);
      return this.endpoints!;
    } catch (error) {
      console.error('Failed to fetch API endpoints:', error);
      // Provide fallback endpoints for development
      console.log('Using fallback endpoints...');
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
        kilimodata: `${API_BASE_URL}/kilimodata/`
      };
      return this.endpoints;
    }
  }

  private async request<T>(url: string): Promise<T[]> {
    try {
      console.log('Making API request to:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('API response received:', data);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error(`Network error fetching from ${url}:`, error);
      throw error;
    }
  }

  async getCounties(): Promise<County[]> {
    if (this.shouldUseMockData()) {
      // Use CSV data from public/data directory
      const response = await fetch('/data/County-2025-08-18.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      return lines.slice(1).map(line => {
        const [id, name, code] = line.split(',');
        return { id: parseInt(id), name, code };
      });
    }
    const endpoints = await this.getEndpoints();
    return this.request<County>(endpoints.counties);
  }

  async getDomains(): Promise<Domain[]> {
    if (this.shouldUseMockData()) {
      const response = await fetch('/data/Domain-2025-08-14.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      return lines.slice(1).map(line => {
        const [id, name, code, description, subsector] = line.split(',');
        return { 
          id: parseInt(id), 
          name, 
          code, 
          description, 
          subsector: parseInt(subsector) 
        };
      });
    }
    const endpoints = await this.getEndpoints();
    return this.request<Domain>(endpoints.domains);
  }

  async getSubdomains(): Promise<SubDomain[]> {
    if (this.shouldUseMockData()) {
      const response = await fetch('/data/SubDomain-2025-08-18.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      return lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        return {
          id: parseInt(values[0]),
          name: values[1],
          code: values[2],
          description: values[3],
          domain: parseInt(values[4])
        };
      });
    }
    const endpoints = await this.getEndpoints();
    return this.request<SubDomain>(endpoints.subdomains);
  }

  async getElements(): Promise<Element[]> {
    if (this.shouldUseMockData()) {
      const response = await fetch('/data/Element-2025-08-14.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      return lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        return {
          id: parseInt(values[0]),
          name: values[1],
          code: values[2],
          description: values[3],
          subdomain: parseInt(values[4])
        };
      });
    }
    const endpoints = await this.getEndpoints();
    return this.request<Element>(endpoints.elements);
  }

  async getItems(): Promise<Item[]> {
    if (this.shouldUseMockData()) {
      const response = await fetch('/data/Item-2025-08-14.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      return lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        return {
          id: parseInt(values[0]),
          name: values[1],
          code: values[2],
          description: values[3],
          element: parseInt(values[4]),
          itemcategory: parseInt(values[5]),
          periodicity: values[6]
        };
      });
    }
    const endpoints = await this.getEndpoints();
    return this.request<Item>(endpoints.items);
  }

  async getItemCategories(): Promise<ItemCategory[]> {
    if (this.shouldUseMockData()) {
      const response = await fetch('/data/ItemCategory-2025-08-14.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      return lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        return {
          id: parseInt(values[0]),
          name: values[1],
          code: values[2],
          description: values[3]
        };
      });
    }
    const endpoints = await this.getEndpoints();
    return this.request<ItemCategory>(endpoints.itemcategories);
  }

  async getUnits(): Promise<Unit[]> {
    if (this.shouldUseMockData()) {
      const response = await fetch('/data/Unit-2025-08-18.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      return lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        return {
          id: parseInt(values[0]),
          name: values[1],
          abbreviation: values[2],
          description: values[3]
        };
      });
    }
    const endpoints = await this.getEndpoints();
    return this.request<Unit>(endpoints.units);
  }

  async getSubsectors(): Promise<Subsector[]> {
    if (this.shouldUseMockData()) {
      // Generate subsectors from the existing data
      return [
        { id: 1, name: 'Crops', code: 'CR', description: 'Crop production and agriculture' },
        { id: 2, name: 'Livestock', code: 'LV', description: 'Livestock and animal husbandry' },
        { id: 3, name: 'Fisheries', code: 'FS', description: 'Fisheries and aquaculture' },
        { id: 4, name: 'Land', code: 'LN', description: 'Land use and management' },
        { id: 5, name: 'Economics', code: 'EC', description: 'Economic indicators and performance' },
        { id: 6, name: 'Trade', code: 'TR', description: 'Trade and commerce' },
        { id: 7, name: 'Markets', code: 'MK', description: 'Market information' },
        { id: 8, name: 'Nutrition', code: 'NT', description: 'Nutrition and health' },
        { id: 9, name: 'Population', code: 'PP', description: 'Population statistics' }
      ];
    }
    const endpoints = await this.getEndpoints();
    return this.request<Subsector>(endpoints.subsectors);
  }

  async getSubdomainsByDomain(domainId: number): Promise<SubDomain[]> {
    if (this.shouldUseMockData()) {
      const subdomains = await this.getSubdomains();
      return subdomains.filter(subdomain => subdomain.domain === domainId);
    }
    const subdomains = await this.getSubdomains();
    return subdomains.filter(subdomain => subdomain.domain === domainId);
  }

  async getElementsBySubdomain(subdomainId: number): Promise<Element[]> {
    if (this.shouldUseMockData()) {
      const elements = await this.getElements();
      return elements.filter(element => element.subdomain === subdomainId);
    }
    const elements = await this.getElements();
    return elements.filter(element => element.subdomain === subdomainId);
  }

  async getItemsByCategory(categoryId: number): Promise<Item[]> {
    if (this.shouldUseMockData()) {
      const items = await this.getItems();
      return items.filter(item => item.itemcategory === categoryId);
    }
    const items = await this.getItems();
    return items.filter(item => item.itemcategory === categoryId);
  }

  async getItemsBySubdomain(subdomainId: number): Promise<Item[]> {
    if (this.shouldUseMockData()) {
      const items = await this.getItems();
      const elements = await this.getElementsBySubdomain(subdomainId);
      const elementIds = elements.map(e => e.id);
      return items.filter(item => elementIds.includes(item.element));
    }
    const items = await this.getItems();
    const elements = await this.getElementsBySubdomain(subdomainId);
    const elementIds = elements.map(e => e.id);
    return items.filter(item => elementIds.includes(item.element));
  }

  async getItemCategoriesBySubdomain(subdomainId: number): Promise<ItemCategory[]> {
    if (this.shouldUseMockData()) {
      const items = await this.getItemsBySubdomain(subdomainId);
      const categoryIds = [...new Set(items.map(item => item.itemcategory))];
      const allCategories = await this.getItemCategories();
      return allCategories.filter(category => categoryIds.includes(category.id));
    }
    const items = await this.getItemsBySubdomain(subdomainId);
    const categoryIds = [...new Set(items.map(item => item.itemcategory))];
    const allCategories = await this.getItemCategories();
    return allCategories.filter(category => categoryIds.includes(category.id));
  }

  async getKilimoData(params: KilimoDataParams): Promise<KilimoDataRecord[]> {
    if (this.shouldUseMockData()) {
      // Generate mock data based on selections
      const mockData: KilimoDataRecord[] = [];
      const counties = params.counties || [1, 2, 3];
      const elements = params.elements || [1, 2, 3];
      const items = params.items || [1, 2, 3];
      const years = params.years || [2023, 2024];
      
      let idCounter = 1;
      
      counties.forEach(countyId => {
        elements.forEach(elementId => {
          const relevantItems = items.length > 0 ? items : [1, 2, 3];
          relevantItems.forEach(itemId => {
            years.forEach(year => {
              // Generate realistic values based on element type
              let value: string;
              const elementData = await this.getElements();
              const element = elementData.find(e => e.id === elementId);
              
              if (element?.name.includes('Area')) {
                value = (Math.random() * 50000 + 1000).toFixed(0);
              } else if (element?.name.includes('Production')) {
                value = (Math.random() * 100000 + 5000).toFixed(0);
              } else if (element?.name.includes('Yield')) {
                value = (Math.random() * 5 + 1).toFixed(2);
              } else {
                value = (Math.random() * 10000).toFixed(2);
              }

              mockData.push({
                id: idCounter++,
                region: 'Kenya',
                refyear: year.toString(),
                value: value,
                note: `Sample data for ${year}`,
                date_created: new Date().toISOString(),
                date_updated: new Date().toISOString(),
                county: countyId,
                subsector: params.subdomain || 1,
                domain: 1,
                subdomain: params.subdomain || 1,
                element: elementId,
                item: itemId,
                unit: this.getUnitForElement(elementId),
                flag: Math.random() > 0.8 ? 1 : 0,
                source: 1
              });
            });
          });
        });
      });
      
      return mockData;
    }

    try {
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
      console.log('Fetching data from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        if (response.status === 404) {
          throw new Error('Data endpoint not found. Please check if the API is available.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        }
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data.results && Array.isArray(data.results)) {
        return data.results;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('Unexpected API response format:', data);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch kilimo data:', error);
      // Return mock data for testing
      return this.getMockKilimoData(params);
    }
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private getUnitForElement(elementId: number): number {
    // Simple mapping for mock data
    if (elementId <= 3) return 1; // Area elements use Hectares
    if (elementId <= 6) return 5; // Production elements use Metric Tonnes
    return 2; // Default to Kilograms
  }

  private getMockKilimoData(params: KilimoDataParams): KilimoDataRecord[] {
    // Generate mock data for testing
    const mockData: KilimoDataRecord[] = [];
    const counties = params.counties || [1, 2, 3];
    const elements = params.elements || [1, 2];
    const years = params.years || [2023, 2024];
    
    counties.forEach(county => {
      elements.forEach(element => {
        years.forEach(year => {
          mockData.push({
            id: Math.random() * 1000000,
            region: 'Kenya',
            refyear: year.toString(),
            value: (Math.random() * 10000).toFixed(2),
            note: 'Mock data for testing',
            date_created: new Date().toISOString(),
            date_updated: new Date().toISOString(),
            county: county,
            subsector: params.subdomain || 1,
            domain: 1,
            subdomain: params.subdomain || 1,
            element: element,
            item: params.items?.[0] || 1,
            unit: 1,
            flag: 1,
            source: 1
          });
        });
      });
    });
    
    return mockData;
  }
  async downloadKilimoData(params: KilimoDataParams, options: DataExportOptions): Promise<Blob> {
    if (this.shouldUseMockData()) {
      // Generate CSV from mock data
      const data = await this.getKilimoData(params);
      
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
        
        const row = [
          `"${county}"`,
          `"${element}"`,
          `"${item}"`,
          record.refyear,
          record.value,
          ...(options.includeUnits ? [`"${unit}"`] : []),
          `"${record.region}"`,
          ...(options.includeFlags ? [record.flag?.toString() || ''] : []),
          ...(options.includeNotes ? [`"${record.note || ''}"`] : [])
        ];
        
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }

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