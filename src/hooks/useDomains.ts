import { useState, useEffect, useCallback } from 'react';
import { SearchFilters } from '../types';
<<<<<<< HEAD
import { apiService, Domain } from '../services/apiService';
=======
import { Domain, apiService } from '../services/apiService';
>>>>>>> 468f294544c03a8ff29ab3dc0ad68de3d2c83887

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

<<<<<<< HEAD
      // Fetch domains from Django API
=======
      // Fetch domains from API
>>>>>>> 468f294544c03a8ff29ab3dc0ad68de3d2c83887
      const domainsData = await apiService.getDomains();
      let filteredDomains = domainsData;

      // Apply filters
      if (filters.query) {
        filteredDomains = filteredDomains.filter(domain =>
          domain.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          (domain.code && domain.code.toLowerCase().includes(filters.query.toLowerCase()))
<<<<<<< HEAD
=======
        );
      }

      if (filters.subsector) {
        filteredDomains = filteredDomains.filter(domain =>
          domain.subsector.toString() === filters.subsector
>>>>>>> 468f294544c03a8ff29ab3dc0ad68de3d2c83887
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