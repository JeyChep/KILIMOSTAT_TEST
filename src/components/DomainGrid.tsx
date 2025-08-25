import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Download } from 'lucide-react';
import { apiService, Domain, SubDomain, County, Element, Item, ItemCategory, Subsector } from '../services/apiService';

interface DomainGridProps {
  loading: boolean;
  onDomainClick?: (domain: Domain) => void;
}

const DomainGrid: React.FC<DomainGridProps> = ({ loading: externalLoading, onDomainClick }) => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set());
  const [selectedSubdomain, setSelectedSubdomain] = useState<SubDomain | null>(null);
  const [subdomains, setSubdomains] = useState<SubDomain[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [elements, setElements] = useState<Element[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection states
  const [selectedCounties, setSelectedCounties] = useState<Set<number>>(new Set());
  const [selectedElements, setSelectedElements] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());

  // Filter states
  const [countryFilter, setCountryFilter] = useState('');
  const [elementFilter, setElementFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [domainsData, subsectorsData, subdomainsData, countiesData, elementsData, itemsData, itemCategoriesData] = await Promise.all([
          apiService.getDomains(),
          apiService.getSubsectors(),
          apiService.getSubdomains(),
          apiService.getCounties(),
          apiService.getElements(),
          apiService.getItems(),
          apiService.getItemCategories()
        ]);

        setDomains(domainsData);
        setSubsectors(subsectorsData);
        setSubdomains(subdomainsData);
        setCounties(countiesData);
        setElements(elementsData);
        setItems(itemsData);
        setItemCategories(itemCategoriesData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleDomain = (domainId: number) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const handleSubdomainClick = (subdomain: SubDomain) => {
    setSelectedSubdomain(subdomain);
  };

  const handleBackToDomains = () => {
    setSelectedSubdomain(null);
  };

  const getDomainIcon = (name: string) => {
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
      'Primary Supply': '📦',
      'Macro Economic': '📊'
    };

    for (const [key, emoji] of Object.entries(iconMap)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return '📊';
  };

  const getSubsectorName = (subsectorId: number) => {
    const subsector = subsectors.find(s => s.id === subsectorId);
    return subsector?.name || 'Unknown';
  };

  const getSubdomainsByDomain = (domainId: number) => {
    return subdomains.filter(subdomain => subdomain.domain === domainId);
  };

  const getFilteredCounties = () => {
    return counties.filter(county =>
      county.name.toLowerCase().includes(countryFilter.toLowerCase())
    );
  };

  const getFilteredElements = () => {
    if (!selectedSubdomain) return [];
    const subdomainElements = elements.filter(element => element.subdomain === selectedSubdomain.id);
    return subdomainElements.filter(element =>
      element.name.toLowerCase().includes(elementFilter.toLowerCase())
    );
  };

  const getFilteredItems = () => {
    return items.filter(item =>
      item.name.toLowerCase().includes(itemFilter.toLowerCase())
    );
  };

  const getFilteredYears = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => currentYear - i);
    return years.filter(year =>
      year.toString().includes(yearFilter)
    );
  };

  const toggleSelection = (id: number, selectedSet: Set<number>, setSelectedSet: React.Dispatch<React.SetStateAction<Set<number>>>) => {
    const newSet = new Set(selectedSet);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedSet(newSet);
  };

  const selectAll = (items: any[], selectedSet: Set<number>, setSelectedSet: React.Dispatch<React.SetStateAction<Set<number>>>) => {
    const allIds = items.map(item => item.id);
    setSelectedSet(new Set(allIds));
  };

  const clearAll = (setSelectedSet: React.Dispatch<React.SetStateAction<Set<number>>>) => {
    setSelectedSet(new Set());
  };

  if (loading || externalLoading) {
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

  if (selectedSubdomain) {
    const filteredCounties = getFilteredCounties();
    const filteredElements = getFilteredElements();
    const filteredItems = getFilteredItems();
    const filteredYears = getFilteredYears();

    return (
      <div className="bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{selectedSubdomain.name}</h1>
          </div>
          <button
            onClick={handleBackToDomains}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to domains</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-blue-500 text-blue-600 py-2 px-1 text-sm font-medium">
              DOWNLOAD DATA
            </button>
            <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
              VISUALIZE DATA
            </button>
            <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
              METADATA
            </button>
          </nav>
        </div>

        {/* Data Selection Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Counties */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">COUNTIES</h3>
                <span className="text-xs text-gray-500">M49</span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Filter results e.g. nairobi"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredCounties.slice(0, 10).map((county) => (
                  <label key={county.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCounties.has(county.id)}
                      onChange={() => toggleSelection(county.id, selectedCounties, setSelectedCounties)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{county.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => selectAll(filteredCounties, selectedCounties, setSelectedCounties)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={() => clearAll(setSelectedCounties)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Elements */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">ELEMENTS</h3>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Filter results e.g. area harvested"
                  value={elementFilter}
                  onChange={(e) => setElementFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredElements.slice(0, 8).map((element) => (
                  <label key={element.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedElements.has(element.id)}
                      onChange={() => toggleSelection(element.id, selectedElements, setSelectedElements)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{element.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => selectAll(filteredElements, selectedElements, setSelectedElements)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={() => clearAll(setSelectedElements)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedSubdomain.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {selectedSubdomain.description || 'Agricultural and livestock statistics covering various indicators and measurements.'}
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Show More</button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Bulk Downloads
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">All Data</button>
                  <span className="text-xs text-gray-500">23.9 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">All Data Normalized</button>
                  <span className="text-xs text-gray-500">32.33 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Kenya</button>
                  <span className="text-xs text-gray-500">4.1 MB</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Last Update</h4>
              <p className="text-sm text-gray-600">June 11, 2025</p>
            </div>
          </div>
        </div>

        {/* Items and Years */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">ITEMS</h3>
                <span className="text-xs text-gray-500">CPC</span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Filter results e.g. maize, wheat"
                  value={itemFilter}
                  onChange={(e) => setItemFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {itemCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button className="text-sm text-blue-600 hover:text-blue-800">Select All</button>
                <button className="text-sm text-blue-600 hover:text-blue-800">Clear All</button>
              </div>
            </div>
          </div>

          {/* Years */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">YEARS</h3>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Filter results e.g. 2023"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredYears.map((year) => (
                  <label key={year} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedYears.has(year)}
                      onChange={() => toggleSelection(year, selectedYears, setSelectedYears)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{year}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => selectAll(filteredYears.map(y => ({ id: y })), selectedYears, setSelectedYears)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={() => clearAll(setSelectedYears)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No domains found</h3>
        <p className="text-gray-600">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {domains.map((domain) => {
        const domainSubdomains = getSubdomainsByDomain(domain.id);
        return (
          <div key={domain.id} className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleDomain(domain.id)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                {expandedDomains.has(domain.id) ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <div className="text-2xl">{getDomainIcon(domain.name)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{domain.name}</h3>
                  <p className="text-sm text-gray-600">{getSubsectorName(domain.subsector)}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {domainSubdomains.length} subdomains
              </div>
            </button>

            {expandedDomains.has(domain.id) && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {domainSubdomains.map((subdomain) => (
                    <button
                      key={subdomain.id}
                      onClick={() => handleSubdomainClick(subdomain)}
                      className="text-left p-3 rounded-md hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="text-blue-600 hover:text-blue-800 font-medium">
                        {subdomain.name}
                      </div>
                      {subdomain.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {subdomain.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DomainGrid;