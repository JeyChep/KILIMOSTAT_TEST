export interface County {
  id: string;
  name: string;
  code: string;
  coordinates?: [number, number];
}

const COUNTY_COORDINATES: { [key: string]: [number, number] } = {
  'Mombasa': [-4.0435, 39.6682],
  'Kwale': [-4.1822, 39.4520],
  'Kilifi': [-3.6309, 39.8490],
  'Tana River': [-1.8622, 40.1170],
  'Lamu': [-2.2717, 40.9020],
  'Taita-Taveta': [-3.3167, 38.4800],
  'Garissa': [-0.4536, 39.6401],
  'Wajir': [1.7471, 40.0630],
  'Mandera': [3.9366, 41.8670],
  'Marsabit': [2.3284, 37.9891],
  'Isiolo': [0.3556, 37.5820],
  'Meru': [0.0469, 37.6500],
  'Tharaka-Nithi': [-0.2908, 37.7280],
  'Embu': [-0.5317, 37.4570],
  'Kitui': [-1.3668, 38.0106],
  'Machakos': [-1.5177, 37.2634],
  'Makueni': [-2.2795, 37.8270],
  'Nyandarua': [-0.1800, 36.4800],
  'Nyeri': [-0.4197, 36.9475],
  'Kirinyaga': [-0.6599, 37.3830],
  'Murang\'a': [-0.7830, 37.0830],
  'Kiambu': [-1.1714, 36.8356],
  'Turkana': [3.3100, 35.5660],
  'West Pokot': [1.6207, 35.3670],
  'Samburu': [1.2153, 36.9450],
  'Trans-Nzoia': [1.0582, 34.9510],
  'Uasin Gishu': [0.5530, 35.3020],
  'Elgeyo-Marakwet': [0.8280, 35.4780],
  'Nandi': [0.1836, 35.1270],
  'Baringo': [0.4684, 36.0890],
  'Laikipia': [0.3556, 36.7820],
  'Nakuru': [-0.3031, 36.0800],
  'Narok': [-1.0833, 35.8710],
  'Kajiado': [-2.0982, 36.7820],
  'Kericho': [-0.3676, 35.2860],
  'Bomet': [-0.8010, 35.3090],
  'Kakamega': [0.2827, 34.7519],
  'Vihiga': [0.0667, 34.7200],
  'Bungoma': [0.5635, 34.5608],
  'Busia': [0.4344, 34.2420],
  'Siaya': [0.0620, 34.2880],
  'Kisumu': [-0.0917, 34.7680],
  'Homa Bay': [-0.5273, 34.4570],
  'Migori': [-1.0634, 34.4731],
  'Kisii': [-0.6774, 34.7797],
  'Nyamira': [-0.5669, 34.9340],
  'Nairobi': [-1.2921, 36.8219],
  'National': [-0.0236, 37.9062]
};

export class CountyService {
  private counties: County[] = [];

  async loadCounties(): Promise<County[]> {
    try {
      const response = await fetch('/data/County-2025-08-18.csv');
      const text = await response.text();

      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');

      this.counties = lines.slice(1).map(line => {
        const values = line.split(',');
        const county: County = {
          id: values[0]?.trim() || '',
          name: values[1]?.trim() || '',
          code: values[2]?.trim() || '',
          coordinates: COUNTY_COORDINATES[values[1]?.trim()] || [0, 37]
        };
        return county;
      }).filter(county => county.name && county.name !== 'National');

      return this.counties;
    } catch (error) {
      console.error('Error loading counties:', error);
      return [];
    }
  }

  getCountiesByLetter(): Map<string, County[]> {
    const grouped = new Map<string, County[]>();

    this.counties.forEach(county => {
      const firstLetter = county.name.charAt(0).toUpperCase();
      if (!grouped.has(firstLetter)) {
        grouped.set(firstLetter, []);
      }
      grouped.get(firstLetter)!.push(county);
    });

    grouped.forEach(counties => {
      counties.sort((a, b) => a.name.localeCompare(b.name));
    });

    return new Map([...grouped.entries()].sort());
  }

  getCountyById(id: string): County | undefined {
    return this.counties.find(c => c.id === id);
  }

  getCountyByName(name: string): County | undefined {
    return this.counties.find(c => c.name === name);
  }
}

export const countyService = new CountyService();
