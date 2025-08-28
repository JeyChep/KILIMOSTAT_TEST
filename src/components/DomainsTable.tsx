import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { apiService, Domain, SubDomain } from '../services/apiService';

interface DomainWithSubdomains extends Domain {
  subdomains: SubDomain[];
}

const DomainsTable: React.FC = () => {
  const [domains, setDomains] = useState<DomainWithSubdomains[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<DomainWithSubdomains[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load domains and subdomains from API
        const [domainsData, subdomainsData] = await Promise.all([
          apiService.getDomains(),
          apiService.getSubdomains()
        ]);

        // Combine domains with their subdomains
        const domainsWithSubdomains: DomainWithSubdomains[] = domainsData.map(domain => ({
          ...domain,
          subdomains: subdomainsData.filter(subdomain => subdomain.domain === domain.id)
        }));

        setDomains(domainsWithSubdomains);
        setFilteredDomains(domainsWithSubdomains);
      } catch (err) {
        console.error('Failed to load domains data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load domains data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredDomains(domains);
    } else {
      const filtered = domains.filter(domain =>
        domain.name.toLowerCase().includes(query.toLowerCase()) ||
        domain.subdomains.some(subdomain =>
          subdomain.name.toLowerCase().includes(query.toLowerCase())
        )
      );
      setFilteredDomains(filtered);
    }
  };

  const getDomainIcon = (domainName: string) => {
    const iconMap: { [key: string]: string } = {
      'Crops': '🌾',
      'Livestock': '🐄',
      'Fisheries': '🐟',
      'Land': '🌍',
      'Inputs': '⚙️',
      'Trade': '🚢',
      'Prices': '💰',
      'Nutrition': '🍎',
      'Population': '👥',
      'Economic': '📈',
      'Investment': '💼',
      'Primary Supply': '📦'
    };

    for (const [key, emoji] of Object.entries(iconMap)) {
      if (domainName.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return '📊';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading domains...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Filter the domain list e.g. crops, food security, fertilizers"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-600"
          />
        </div>
      </div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDomains.map((domain) => (
          <div key={domain.id} className="border-b border-gray-200 pb-6">
            {/* Domain Header */}
            <div className="flex items-start space-x-3 mb-4">
              <div className="text-2xl mt-1">{getDomainIcon(domain.name)}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {domain.name}
                </h3>
              </div>
            </div>

            {/* Subdomains */}
            <div className="ml-9 space-y-2">
              {domain.subdomains.length > 0 ? (
                domain.subdomains.map((subdomain) => (
                  <div key={subdomain.id}>
                    <button className="text-blue-600 hover:text-blue-800 hover:underline text-left">
                      {subdomain.name}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm italic">
                  No subdomains available
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDomains.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No domains found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default DomainsTable;