import { Domain, County, SubDomain, Element, Item, ItemCategory, Unit, Subsector } from './apiService';

class CsvDataService {
  private cache = new Map<string, any[]>();

  private async loadCsvData<T>(filename: string, parser: (row: any) => T): Promise<T[]> {
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    try {
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = lines.slice(1).map(line => {
        const values = this.parseCsvLine(line);
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return parser(row);
      }).filter(item => item !== null);

      this.cache.set(filename, data);
      return data;
    } catch (error) {
      console.error(`Failed to load CSV data from ${filename}:`, error);
      return [];
    }
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
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

  async getDomains(): Promise<Domain[]> {
    return this.loadCsvData('Domain-2025-08-14.csv', (row) => {
      if (!row.id || !row.name) return null;
      return {
        id: parseInt(row.id),
        name: row.name.replace(/"/g, ''),
        code: row.code?.replace(/"/g, '') || '',
        description: row.description?.replace(/"/g, '') || '',
        subsector: parseInt(row.subsector) || 0
      };
    });
  }

  async getCounties(): Promise<County[]> {
    return this.loadCsvData('County-2025-08-18.csv', (row) => {
      if (!row.id || !row.name) return null;
      return {
        id: parseInt(row.id),
        name: row.name.replace(/"/g, ''),
        code: row.code?.replace(/"/g, '') || ''
      };
    });
  }

  async getSubdomains(): Promise<SubDomain[]> {
    return this.loadCsvData('SubDomain-2025-08-18.csv', (row) => {
      if (!row.id || !row.name) return null;
      return {
        id: parseInt(row.id),
        name: row.name.replace(/"/g, ''),
        code: row.code?.replace(/"/g, '') || '',
        description: row.description?.replace(/"/g, '') || '',
        domain: parseInt(row.domain) || 0
      };
    });
  }

  async getElements(): Promise<Element[]> {
    return this.loadCsvData('Element-2025-08-14.csv', (row) => {
      if (!row.id || !row.name) return null;
      return {
        id: parseInt(row.id),
        name: row.name.replace(/"/g, ''),
        code: row.code?.replace(/"/g, '') || '',
        description: row.description?.replace(/"/g, '') || '',
        subdomain: parseInt(row.subdomain) || 0
      };
    });
  }

  async getItems(): Promise<Item[]> {
    return this.loadCsvData('Item-2025-08-14.csv', (row) => {
      if (!row.id || !row.name) return null;
      return {
        id: parseInt(row.id),
        name: row.name.replace(/"/g, ''),
        code: row.code?.replace(/"/g, '') || '',
        description: row.description?.replace(/"/g, '') || '',
        element: parseInt(row.element) || 0,
        itemcategory: parseInt(row.itemcategory) || 0,
        periodicity: row.periodicity?.replace(/"/g, '') || ''
      };
    });
  }

  async getItemCategories(): Promise<ItemCategory[]> {
    return this.loadCsvData('ItemCategory-2025-08-14.csv', (row) => {
      if (!row.id || !row.name) return null;
      return {
        id: parseInt(row.id),
        name: row.name.replace(/"/g, ''),
        code: row.code?.replace(/"/g, '') || '',
        description: row.description?.replace(/"/g, '') || ''
      };
    });
  }

  async getUnits(): Promise<Unit[]> {
    return this.loadCsvData('Unit-2025-08-18.csv', (row) => {
      if (!row.id || !row.name) return null;
      return {
        id: parseInt(row.id),
        name: row.name.replace(/"/g, ''),
        abbreviation: row.abbreviation?.replace(/"/g, '') || '',
        description: row.description?.replace(/"/g, '') || ''
      };
    });
  }

  async getSubsectors(): Promise<Subsector[]> {
    // Mock subsectors data since we don't have a CSV file for this
    return [
      { id: 1, name: 'Crops', code: 'CROPS', description: 'Crop production and agriculture' },
      { id: 2, name: 'Livestock', code: 'LIVESTOCK', description: 'Livestock and animal husbandry' },
      { id: 3, name: 'Forestry', code: 'FORESTRY', description: 'Forest resources and management' },
      { id: 4, name: 'Fisheries', code: 'FISHERIES', description: 'Fisheries and aquaculture' }
    ];
  }
}

export const csvDataService = new CsvDataService();