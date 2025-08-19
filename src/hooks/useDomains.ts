import { useState, useEffect, useCallback } from 'react';
import { Domain, SearchFilters } from '../types';
import { apiService } from '../services/api';

export const useDomains = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    subsector: '',
    sortBy: 'name',
  });

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for now - replace with API call when backend is ready
      const mockDomains = getMockDomains();
      let filteredDomains = mockDomains;

      // Apply filters to mock data
      if (filters.query) {
        filteredDomains = filteredDomains.filter(domain =>
          domain.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          domain.code.toLowerCase().includes(filters.query.toLowerCase())
        );
      }

      if (filters.subsector) {
        filteredDomains = filteredDomains.filter(domain =>
          domain.subsector === filters.subsector
        );
      }

      // Apply sorting
      if (filters.sortBy === 'name') {
        filteredDomains.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filters.sortBy === 'code') {
        filteredDomains.sort((a, b) => a.code.localeCompare(b.code));
      }

      setDomains(filteredDomains);
    } catch (err) {
      console.error('Failed to fetch domains:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch domains');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const exportDomains = useCallback(async (domainIds?: number[]) => {
    try {
      // Mock export functionality - replace with API call when backend is ready
      // const blob = await apiService.exportDomains(domainIds);
      
      // Create a mock CSV content for export
      const domainsToExport = domainIds 
        ? domains.filter(domain => domainIds.includes(domain.id))
        : domains;
      
      const csvContent = [
        'ID,Name,Code,Subsector',
        ...domainsToExport.map(domain => 
          `${domain.id},"${domain.name}","${domain.code}","${domain.subsector}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kilimostat-domains.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export domains:', err);
      setError(err instanceof Error ? err.message : 'Failed to export domains');
    }
  }, [domains]);

  return {
    domains,
    loading,
    error,
    filters,
    updateFilters,
    fetchDomains,
    exportDomains,
  };
};

// Mock data for fallback
const getMockDomains = (): Domain[] => [
  { id: 1, name: 'Crops', code: 'CR', subsector: 'Crops' },
  { id: 2, name: 'Livestock', code: 'LS', subsector: 'Livestock' },
  { id: 3, name: 'Fisheries', code: 'FS', subsector: 'Fisheries' },
  { id: 4, name: 'Land, Inputs and Sustainability', code: 'LIS', subsector: 'Land, Inputs and Sustainability' },
  { id: 5, name: 'Investments and Financing', code: 'IF', subsector: 'Investments and Financing' },
  { id: 6, name: 'Trade', code: 'TR', subsector: 'Trade' },
  { id: 7, name: 'Prices', code: 'PR', subsector: 'Prices' },
  { id: 8, name: 'Early Warning, Nutrition and Food Security', code: 'EWNFS', subsector: 'Early Warning, Nutrition and Food Security' },
  { id: 9, name: 'Population and Employment', code: 'PE', subsector: 'Population and Employment' },
];