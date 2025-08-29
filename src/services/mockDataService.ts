import { County, Domain, SubDomain, Element, Item, ItemCategory, Unit, Subsector, KilimoDataRecord, KilimoDataParams } from './apiService';

class MockDataService {
  // Mock Counties
  private mockCounties: County[] = [
    { id: 1, name: 'Nairobi', code: '47' },
    { id: 2, name: 'Mombasa', code: '1' },
    { id: 3, name: 'Kisumu', code: '42' },
    { id: 4, name: 'Nakuru', code: '32' },
    { id: 5, name: 'Eldoret', code: '27' },
    { id: 6, name: 'Kiambu', code: '22' },
    { id: 7, name: 'Meru', code: '12' },
    { id: 8, name: 'Machakos', code: '16' },
    { id: 9, name: 'Kakamega', code: '37' },
    { id: 10, name: 'Nyeri', code: '19' }
  ];

  // Mock Subsectors
  private mockSubsectors: Subsector[] = [
    { id: 1, name: 'Crops', code: 'CR', description: 'Crop production and agriculture' },
    { id: 2, name: 'Livestock', code: 'LV', description: 'Livestock and animal husbandry' },
    { id: 3, name: 'Fisheries', code: 'FS', description: 'Fisheries and aquaculture' },
    { id: 4, name: 'Land', code: 'LN', description: 'Land use and management' },
    { id: 5, name: 'Economics', code: 'EC', description: 'Economic indicators and performance' }
  ];

  // Mock Domains
  private mockDomains: Domain[] = [
    { id: 1, name: 'Crops Productivity', code: 'CP', description: 'Crop production statistics', subsector: 1 },
    { id: 2, name: 'Livestock Productivity', code: 'LP', description: 'Livestock production statistics', subsector: 2 },
    { id: 3, name: 'Fisheries Productivity', code: 'FP', description: 'Fisheries production statistics', subsector: 3 },
    { id: 4, name: 'Land', code: 'LN', description: 'Land use and management', subsector: 4 },
    { id: 5, name: 'Economic Performance', code: 'EP', description: 'Economic indicators', subsector: 5 },
    { id: 6, name: 'Trade (Primary Supply)', code: 'TP', description: 'Trade and supply chain', subsector: 5 },
    { id: 7, name: 'Market Prices (Commodities)', code: 'MP', description: 'Market prices for commodities', subsector: 5 },
    { id: 8, name: 'Nutrition', code: 'NT', description: 'Nutrition indicators', subsector: 5 },
    { id: 9, name: 'Population', code: 'PP', description: 'Population statistics', subsector: 5 }
  ];

  // Mock Subdomains
  private mockSubdomains: SubDomain[] = [
    { id: 1, name: 'Crops Primary', code: 'CP', description: 'Primary crop production', domain: 1 },
    { id: 2, name: 'Crops Processed', code: 'CR', description: 'Processed crop products', domain: 1 },
    { id: 3, name: 'Livestock Primary', code: 'LP', description: 'Primary livestock production', domain: 2 },
    { id: 4, name: 'Livestock Products', code: 'LR', description: 'Livestock products', domain: 2 },
    { id: 5, name: 'Production Quantity (Fisheries)', code: 'PQ', description: 'Fish production quantities', domain: 3 },
    { id: 6, name: 'Forest Area', code: 'FA', description: 'Forest coverage and management', domain: 4 },
    { id: 7, name: 'Fertilizer', code: 'FT', description: 'Fertilizer usage and supply', domain: 4 },
    { id: 8, name: 'Seeds and Seedlings', code: 'SD', description: 'Seeds and planting materials', domain: 4 },
    { id: 9, name: 'Gross Domestic Product', code: 'GD', description: 'GDP indicators', domain: 5 },
    { id: 10, name: 'Wholesale Prices', code: 'WP', description: 'Wholesale market prices', domain: 7 },
    { id: 11, name: 'Export Quantity (Crops)', code: 'EQ', description: 'Crop export quantities', domain: 6 },
    { id: 12, name: 'Stunting', code: 'ST', description: 'Child stunting indicators', domain: 8 },
    { id: 13, name: 'Population Size', code: 'PS', description: 'Population statistics', domain: 9 }
  ];

  // Mock Elements
  private mockElements: Element[] = [
    { id: 1, name: 'Crop Area', code: 'CA', description: 'Area under cultivation', subdomain: 1 },
    { id: 2, name: 'Production Quantity (Crops)', code: 'PQ', description: 'Crop production quantity', subdomain: 1 },
    { id: 3, name: 'Crop Yield', code: 'YD', description: 'Crop yield per hectare', subdomain: 1 },
    { id: 4, name: 'Production Quantity (Livestock)', code: 'PQT', description: 'Livestock production quantity', subdomain: 3 },
    { id: 5, name: 'Livestock Population', code: 'PP', description: 'Number of livestock', subdomain: 3 },
    { id: 6, name: 'Fresh Water Fish', code: 'FW', description: 'Fresh water fish production', subdomain: 5 },
    { id: 7, name: 'Marine Fish', code: 'MF', description: 'Marine fish production', subdomain: 5 },
    { id: 8, name: 'Fertilizer Apparent Consumption', code: 'FA', description: 'Fertilizer consumption', subdomain: 7 },
    { id: 9, name: 'Seed Primary', code: 'SP', description: 'Primary seed production', subdomain: 8 },
    { id: 10, name: 'GDP Agriculture', code: 'GA', description: 'Agricultural GDP', subdomain: 9 }
  ];

  // Mock Item Categories
  private mockItemCategories: ItemCategory[] = [
    { id: 1, name: 'Cereals', code: 'CER', description: 'Cereal crops' },
    { id: 2, name: 'Legumes', code: 'LEG', description: 'Leguminous crops' },
    { id: 3, name: 'Vegetables', code: 'VEG', description: 'Vegetable crops' },
    { id: 4, name: 'Fruits', code: 'FRT', description: 'Fruit crops' },
    { id: 5, name: 'Livestock Primary', code: 'LVP', description: 'Primary livestock' },
    { id: 6, name: 'Fisheries', code: 'FSH', description: 'Fish and aquatic products' },
    { id: 7, name: 'Nutrition', code: 'NUT', description: 'Nutritional indicators' }
  ];

  // Mock Items
  private mockItems: Item[] = [
    // Cereals
    { id: 1, name: 'Maize (Crop Area)', code: 'MCA', description: 'Maize cultivation area', element: 1, itemcategory: 1, periodicity: 'Yearly' },
    { id: 2, name: 'Maize (Production Quantity)', code: 'MPD', description: 'Maize production quantity', element: 2, itemcategory: 1, periodicity: 'Yearly' },
    { id: 3, name: 'Maize (Yield)', code: 'MYD', description: 'Maize yield per hectare', element: 3, itemcategory: 1, periodicity: 'Yearly' },
    { id: 4, name: 'Wheat (Crop Area)', code: 'WCA', description: 'Wheat cultivation area', element: 1, itemcategory: 1, periodicity: 'Yearly' },
    { id: 5, name: 'Wheat (Production Quantity)', code: 'WPD', description: 'Wheat production quantity', element: 2, itemcategory: 1, periodicity: 'Yearly' },
    { id: 6, name: 'Rice (Crop Area)', code: 'RCA', description: 'Rice cultivation area', element: 1, itemcategory: 1, periodicity: 'Yearly' },
    
    // Legumes
    { id: 7, name: 'Common Beans (Crop Area)', code: 'BCA', description: 'Common beans cultivation area', element: 1, itemcategory: 2, periodicity: 'Yearly' },
    { id: 8, name: 'Common Beans (Production Quantity)', code: 'BPD', description: 'Common beans production', element: 2, itemcategory: 2, periodicity: 'Yearly' },
    { id: 9, name: 'Green Grams (Crop Area)', code: 'GCA', description: 'Green grams cultivation area', element: 1, itemcategory: 2, periodicity: 'Yearly' },
    
    // Vegetables
    { id: 10, name: 'Tomato (Crop Area)', code: 'TCA', description: 'Tomato cultivation area', element: 1, itemcategory: 3, periodicity: 'Yearly' },
    { id: 11, name: 'Onion (Production Quantity)', code: 'OPD', description: 'Onion production quantity', element: 2, itemcategory: 3, periodicity: 'Yearly' },
    
    // Livestock
    { id: 12, name: 'Cattle (Dairy)', code: 'CDR', description: 'Dairy cattle', element: 4, itemcategory: 5, periodicity: 'Yearly' },
    { id: 13, name: 'Cattle (Beef)', code: 'CBF', description: 'Beef cattle', element: 4, itemcategory: 5, periodicity: 'Yearly' },
    { id: 14, name: 'Goats (Meat)', code: 'GOAM', description: 'Meat goats', element: 4, itemcategory: 5, periodicity: 'Yearly' },
    
    // Fisheries
    { id: 15, name: 'Tilapia', code: 'TIL', description: 'Tilapia fish', element: 6, itemcategory: 6, periodicity: 'Yearly' },
    { id: 16, name: 'Sardines', code: 'SAR', description: 'Sardine fish', element: 7, itemcategory: 6, periodicity: 'Yearly' }
  ];

  // Mock Units
  private mockUnits: Unit[] = [
    { id: 1, name: 'Hectare', abbreviation: 'Ha', description: 'Unit of area measurement' },
    { id: 2, name: 'Kilograms', abbreviation: 'Kg', description: 'Unit of weight' },
    { id: 3, name: 'Kenya Shillings', abbreviation: 'Ksh', description: 'Currency unit' },
    { id: 4, name: 'Litres', abbreviation: 'L', description: 'Unit of volume' },
    { id: 5, name: 'Metric Tonnes', abbreviation: 'MT', description: 'Unit of weight (1000 kg)' },
    { id: 6, name: 'Head', abbreviation: 'Head', description: 'Count of livestock' },
    { id: 7, name: 'Tons per Hectare', abbreviation: 'Ton/Ha', description: 'Yield measurement' },
    { id: 8, name: 'Tonnes', abbreviation: 'T', description: 'Unit of weight' },
    { id: 9, name: 'Number', abbreviation: 'No.', description: 'Count' },
    { id: 10, name: 'Percentage', abbreviation: '%', description: 'Percentage' }
  ];

  async getCounties(): Promise<County[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockCounties];
  }

  async getDomains(): Promise<Domain[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...this.mockDomains];
  }

  async getSubdomains(): Promise<SubDomain[]> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return [...this.mockSubdomains];
  }

  async getElements(): Promise<Element[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockElements];
  }

  async getItems(): Promise<Item[]> {
    await new Promise(resolve => setTimeout(resolve, 450));
    return [...this.mockItems];
  }

  async getItemCategories(): Promise<ItemCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...this.mockItemCategories];
  }

  async getUnits(): Promise<Unit[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.mockUnits];
  }

  async getSubsectors(): Promise<Subsector[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.mockSubsectors];
  }

  async getSubdomainsByDomain(domainId: number): Promise<SubDomain[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockSubdomains.filter(subdomain => subdomain.domain === domainId);
  }

  async getElementsBySubdomain(subdomainId: number): Promise<Element[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockElements.filter(element => element.subdomain === subdomainId);
  }

  async getItemsByCategory(categoryId: number): Promise<Item[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockItems.filter(item => item.itemcategory === categoryId);
  }

  async getItemsBySubdomain(subdomainId: number): Promise<Item[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const elements = await this.getElementsBySubdomain(subdomainId);
    const elementIds = elements.map(e => e.id);
    return this.mockItems.filter(item => elementIds.includes(item.element));
  }

  async getItemCategoriesBySubdomain(subdomainId: number): Promise<ItemCategory[]> {
    const items = await this.getItemsBySubdomain(subdomainId);
    const categoryIds = [...new Set(items.map(item => item.itemcategory))];
    return this.mockItemCategories.filter(category => categoryIds.includes(category.id));
  }

  async getKilimoData(params: KilimoDataParams): Promise<KilimoDataRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate longer API call
    
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
            const element = this.mockElements.find(e => e.id === elementId);
            
            if (element?.name.includes('Area')) {
              value = (Math.random() * 50000 + 1000).toFixed(0); // Hectares
            } else if (element?.name.includes('Production')) {
              value = (Math.random() * 100000 + 5000).toFixed(0); // Tonnes
            } else if (element?.name.includes('Yield')) {
              value = (Math.random() * 5 + 1).toFixed(2); // Tons per hectare
            } else if (element?.name.includes('Population')) {
              value = (Math.random() * 1000000 + 10000).toFixed(0); // Head count
            } else {
              value = (Math.random() * 10000).toFixed(2);
            }

            mockData.push({
              id: idCounter++,
              region: 'Kenya',
              refyear: year.toString(),
              value: value,
              note: `Generated data for ${year}`,
              date_created: new Date().toISOString(),
              date_updated: new Date().toISOString(),
              county: countyId,
              subsector: params.subdomain || 1,
              domain: 1,
              subdomain: params.subdomain || 1,
              element: elementId,
              item: itemId,
              unit: this.getUnitForElement(elementId),
              flag: Math.random() > 0.8 ? 1 : 0, // 20% chance of having a flag
              source: 1
            });
          });
        });
      });
    });
    
    return mockData;
  }

  private getUnitForElement(elementId: number): number {
    const element = this.mockElements.find(e => e.id === elementId);
    if (!element) return 1;
    
    if (element.name.includes('Area')) return 1; // Hectares
    if (element.name.includes('Production')) return 5; // Metric Tonnes
    if (element.name.includes('Yield')) return 7; // Tons per Hectare
    if (element.name.includes('Population')) return 6; // Head
    if (element.name.includes('Price')) return 3; // Kenya Shillings
    
    return 2; // Default to Kilograms
  }

  async downloadKilimoData(params: KilimoDataParams, options: any): Promise<Blob> {
    const data = await this.getKilimoData(params);
    
    // Convert to CSV
    const headers = [
      'County',
      'Element', 
      'Item',
      'Year',
      'Value',
      'Unit',
      'Region',
      'Flag',
      'Note'
    ];
    
    const csvRows = [headers.join(',')];
    
    data.forEach(record => {
      const county = this.mockCounties.find(c => c.id === record.county)?.name || record.county.toString();
      const element = this.mockElements.find(e => e.id === record.element)?.name || record.element.toString();
      const item = this.mockItems.find(i => i.id === record.item)?.name || record.item.toString();
      const unit = this.mockUnits.find(u => u.id === record.unit)?.abbreviation || '';
      
      const row = [
        `"${county}"`,
        `"${element}"`,
        `"${item}"`,
        record.refyear,
        record.value,
        `"${unit}"`,
        `"${record.region}"`,
        record.flag?.toString() || '',
        `"${record.note || ''}"`
      ];
      
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}

export const mockDataService = new MockDataService();