import { Abbreviation, County, Flag, Item, ItemCategory, Element, Unit } from '../types';

class DataService {
  private async loadCSV<T>(filename: string, parser: (row: any) => T): Promise<T[]> {
    try {
      const response = await fetch(`/data/${filename}`);
      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      
      return lines.slice(1).map(line => {
        const values = this.parseCSVLine(line);
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return parser(row);
      });
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
      return [];
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

  async getAbbreviations(): Promise<Abbreviation[]> {
    return this.loadCSV('Abbreviation-2025-08-18.csv', (row) => ({
      id: parseInt(row.id) || 0,
      abbr: row.abbr || '',
      slug: row.slug || '',
      description: row.description || '',
      created: row.created || '',
      updated: row.updated || ''
    }));
  }

  async getCounties(): Promise<County[]> {
    return this.loadCSV('County-2025-08-18.csv', (row) => ({
      id: parseInt(row.id) || 0,
      name: row.name || '',
      code: row.code || ''
    }));
  }

  async getFlags(): Promise<Flag[]> {
    return this.loadCSV('Flag-2025-08-14.csv', (row) => ({
      id: parseInt(row.id) || 0,
      name: row.name || '',
      code: row.code || '',
      description: row.description || ''
    }));
  }

  async getItems(): Promise<Item[]> {
    return this.loadCSV('Item-2025-08-14.csv', (row) => ({
      id: parseInt(row.id) || 0,
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
      element: row.element || '',
      itemcategory: row.itemcategory || '',
      periodicity: row.periodicity || ''
    }));
  }

  async getItemCategories(): Promise<ItemCategory[]> {
    return this.loadCSV('ItemCategory-2025-08-14.csv', (row) => ({
      id: parseInt(row.id) || 0,
      name: row.name || '',
      code: row.code || '',
      description: row.description || ''
    }));
  }

  async getElements(): Promise<Element[]> {
    return this.loadCSV('Element-2025-08-14.csv', (row) => ({
      id: parseInt(row.id) || 0,
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
      subdomain: row.subdomain || ''
    }));
  }

  async getUnits(): Promise<Unit[]> {
    return this.loadCSV('Unit-2025-08-18.csv', (row) => ({
      id: parseInt(row.id) || 0,
      name: row.name || '',
      abbreviation: row.abbreviation || '',
      description: row.description || ''
    }));
  }
}

export const dataService = new DataService();