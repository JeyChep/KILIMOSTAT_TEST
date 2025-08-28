import { useState, useEffect, useCallback } from 'react';
import { SearchFilters } from '../types';
import { Domain, apiService } from '../services/apiService';

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

      // Fetch domains from API
      const domainsData = await apiService.getDomains();
      let filteredDomains = domainsData;

      // Apply filters
      if (filters.query) {
        filteredDomains = filteredDomains.filter(domain =>
          domain.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          (domain.code && domain.code.toLowerCase().includes(filters.query.toLowerCase()))
        );
      }

      if (filters.subsector) {
        filteredDomains = filteredDomains.filter(domain =>
          domain.subsector.toString() === filters.subsector
        );
      }

      // Apply sorting
      if (filters.sortBy === 'name') {
        filteredDomains.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filters.sortBy === 'code') {
        filteredDomains.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
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
      const domainsToExport = domainIds 
        ? domains.filter(domain => domainIds.includes(domain.id))
        : domains;
      
      const csvContent = [
        'ID,Name,Code,Description,Subsector',
        ...domainsToExport.map(domain => 
          `${domain.id},"${domain.name}","${domain.code || ''}","${domain.description || ''}","${domain.subsector}"`
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
    }
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
  }
  )
}