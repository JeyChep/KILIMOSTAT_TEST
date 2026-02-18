import { apiService, KilimoDataParams, KilimoDataRecord } from './apiService';
import { County } from './countyService';
import { Domain } from './apiService';

export interface IndicatorData {
  years: number[];
  values: { [elementId: number]: number[] };
  elements: { id: number; name: string; code: string }[];
  items: { id: number; name: string }[];
}

export class IndicatorService {
  async getIndicatorDataForCountyAndDomain(
    county: County,
    domain: Domain
  ): Promise<IndicatorData> {
    try {
      const currentYear = new Date().getFullYear();
      const startYear = 1990;
      const years = Array.from(
        { length: currentYear - startYear + 1 },
        (_, i) => startYear + i
      );

      const subdomains = await apiService.getSubdomainsByDomain(domain.id);

      if (subdomains.length === 0) {
        return this.getEmptyIndicatorData();
      }

      const subdomain = subdomains[0];
      const elements = await apiService.getElementsBySubdomain(subdomain.id);

      if (elements.length === 0) {
        return this.getEmptyIndicatorData();
      }

      const topElements = elements.slice(0, 3);
      const elementIds = topElements.map(e => e.id);

      const params: KilimoDataParams = {
        counties: [parseInt(county.id)],
        elements: elementIds,
        years: years,
        subdomain: subdomain.id
      };

      const kilimoData = await apiService.getKilimoData(params);

      const valuesByElement: { [elementId: number]: number[] } = {};
      elementIds.forEach(id => {
        valuesByElement[id] = new Array(years.length).fill(0);
      });

      kilimoData.forEach((record: KilimoDataRecord) => {
        const yearIndex = years.indexOf(parseInt(record.refyear));
        if (yearIndex !== -1 && valuesByElement[record.element]) {
          const value = parseFloat(record.value) || 0;
          valuesByElement[record.element][yearIndex] = value;
        }
      });

      const items = await apiService.getItemsBySubdomain(subdomain.id);

      return {
        years,
        values: valuesByElement,
        elements: topElements.map(e => ({ id: e.id, name: e.name, code: e.code })),
        items: items.slice(0, 5).map(i => ({ id: i.id, name: i.name }))
      };
    } catch (error) {
      console.error('Error fetching indicator data:', error);
      return this.getEmptyIndicatorData();
    }
  }

  private getEmptyIndicatorData(): IndicatorData {
    return {
      years: [],
      values: {},
      elements: [],
      items: []
    };
  }

  aggregateDataByYear(data: IndicatorData): { years: number[]; values: number[] } {
    const aggregated = data.years.map((year, index) => {
      const sum = Object.values(data.values).reduce((acc, elementValues) => {
        return acc + (elementValues[index] || 0);
      }, 0);
      return sum;
    });

    return {
      years: data.years,
      values: aggregated
    };
  }

  getRecentYears(data: IndicatorData, count: number = 10): { years: number[]; values: number[] } {
    const recentYears = data.years.slice(-count);
    const aggregated = recentYears.map((year, index) => {
      const yearIndex = data.years.indexOf(year);
      const sum = Object.values(data.values).reduce((acc, elementValues) => {
        return acc + (elementValues[yearIndex] || 0);
      }, 0);
      return sum;
    });

    return {
      years: recentYears,
      values: aggregated
    };
  }

  getTwoElementComparison(data: IndicatorData): {
    years: number[];
    element1: number[];
    element2: number[];
    element1Name: string;
    element2Name: string;
  } {
    const elements = data.elements.slice(0, 2);

    if (elements.length < 2) {
      return {
        years: [],
        element1: [],
        element2: [],
        element1Name: '',
        element2Name: ''
      };
    }

    return {
      years: data.years,
      element1: data.values[elements[0].id] || [],
      element2: data.values[elements[1].id] || [],
      element1Name: elements[0].name,
      element2Name: elements[1].name
    };
  }

  getLatestDistribution(data: IndicatorData): {
    element1Value: number;
    element2Value: number;
    element1Name: string;
    element2Name: string;
  } {
    const elements = data.elements.slice(0, 2);

    if (elements.length < 2 || data.years.length === 0) {
      return {
        element1Value: 0,
        element2Value: 0,
        element1Name: '',
        element2Name: ''
      };
    }

    const latestIndex = data.years.length - 1;
    const element1Values = data.values[elements[0].id] || [];
    const element2Values = data.values[elements[1].id] || [];

    return {
      element1Value: element1Values[latestIndex] || 0,
      element2Value: element2Values[latestIndex] || 0,
      element1Name: elements[0].name,
      element2Name: elements[1].name
    };
  }
}

export const indicatorService = new IndicatorService();
