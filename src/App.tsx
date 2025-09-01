import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import DefinitionsStandards from './components/DefinitionsStandards';
import DomainGrid from './components/DomainGrid';
import DomainsTable from './components/DomainsTable';
import DataTable from './components/DataTable';
import SubsectorTabs from './components/SubsectorTabs';
import { useDomains } from './hooks/useDomains';
import { Domain } from './services/apiService';

function App() {
  const { domains, loading, error, filters, updateFilters, exportDomains } = useDomains();
  const [activeMainTab, setActiveMainTab] = useState('data');
  const [activeTab, setActiveTab] = useState('domains');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  const handleSearchChange = useCallback((query: string) => {
    updateFilters({ query });
  }, [updateFilters]);

  const handleDomainClick = useCallback((domain: Domain) => {
    setSelectedDomain(domain);
    console.log('Selected domain:', domain);
    // Here you could navigate to a detailed view or open a modal
  }, []);

  const handleImport = useCallback(() => {
    console.log('Import functionality to be implemented');
    // Implement import logic
  }, []);

  const handleExport = useCallback(() => {
    exportDomains();
  }, [exportDomains]);

  const handleAddDomain = useCallback(() => {
    console.log('Add domain functionality to be implemented');
    // Implement add domain logic
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Using mock data for demonstration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchQuery={filters.query} 
        onSearchChange={handleSearchChange}
        activeTab={activeMainTab}
        onTabChange={setActiveMainTab}
      />
      
      {activeMainTab === 'definitions' ? (
        <DefinitionsStandards />
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data</h1>
          <p className="text-gray-600">
            Browse and manage agricultural and economic data domains for statistical analysis.
          </p>
        </div>

        <SubsectorTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {activeTab === 'domains' ? (
          <DomainGrid
            domains={domains}
            loading={loading}
            onDomainClick={handleDomainClick}
          />
        ) : activeTab === 'table' ? (
          <DomainsTable />
        ) : (
          <DataTable
            domains={domains as any[]}
            loading={loading}
            onImport={handleImport}
            onExport={handleExport}
            onAddDomain={handleAddDomain}
          />
        )}

        {selectedDomain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Domain Details</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedDomain.name}</p>
                <p><strong>Code:</strong> {selectedDomain.code || 'N/A'}</p>
                <p><strong>Subsector:</strong> {selectedDomain.subsector}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedDomain(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      )}
      
    </div>
  );
}

export default App;