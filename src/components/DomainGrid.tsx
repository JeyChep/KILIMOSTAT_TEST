import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { Domain } from '../types';

interface DomainWithSubdomains extends Domain {
  subdomains: any[];
}

interface DomainGridProps {
  domains: Domain[];
  loading: boolean;
  onDomainClick: (domain: Domain) => void;
}

const DomainGrid: React.FC<DomainGridProps> = ({ domains, loading, onDomainClick }) => {
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set());
  const [selectedSubdomain, setSelectedSubdomain] = useState<any>(null);
  const [domainsWithSubdomains, setDomainsWithSubdomains] = useState<DomainWithSubdomains[]>([]);
  const [counties, setCounties] = useState<any[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [itemCategories, setItemCategories] = useState<any[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<Set<number>>(new Set());
  const [selectedElements, setSelectedElements] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Load subdomains, counties, elements, items, and item categories
        const [subdomainsResponse, countiesResponse, elementsResponse, itemsResponse, itemCategoriesResponse] = await Promise.all([
          fetch('/data/SubDomain-2025-08-18.csv'),
          fetch('/data/County-2025-08-18.csv'),
          fetch('/data/Element-2025-08-14.csv'),
          fetch('/data/Item-2025-08-14.csv'),
          fetch('/data/ItemCategory-2025-08-14.csv')
        ]);

        const [subdomainsText, countiesText, elementsText, itemsText, itemCategoriesText] = await Promise.all([
          subdomainsResponse.text(),
          countiesResponse.text(),
          elementsResponse.text(),
          itemsResponse.text(),
          itemCategoriesResponse.text()
        ]);

        // Parse CSVs
        const parseCSV = (text: string) => {
          const lines = text.trim().split('\n');
          const headers = lines[0].split(',');
          return lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
        };

        const subdomains = parseCSV(subdomainsText);
        const countiesData = parseCSV(countiesText);
        const elementsData = parseCSV(elementsText);
        const itemsData = parseCSV(itemsText);
        const itemCategoriesData = parseCSV(itemCategoriesText);

        // Combine domains with subdomains
        const domainsWithSubs = domains.map(domain => ({
          ...domain,
          subdomains: subdomains.filter((sub: any) => parseInt(sub.domain) === domain.id)
        }));

        setDomainsWithSubdomains(domainsWithSubs);
        setCounties(countiesData);
        setElements(elementsData);
        setItems(itemsData);
        setItemCategories(itemCategoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    if (domains.length > 0) {
      loadData();
    }
  }, [domains]);

  const parseCSVLine = (line: string): string[] => {
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
  };

  const toggleDomain = (domainId: number) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const handleSubdomainClick = (subdomain: any) => {
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
    const allIds = items.map(item => parseInt(item.id));
    setSelectedSet(new Set(allIds));
  };

  const clearAll = (setSelectedSet: React.Dispatch<React.SetStateAction<Set<number>>>) => {
    setSelectedSet(new Set());
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (selectedSubdomain) {
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {counties.slice(0, 10).map((county) => (
                  <label key={county.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCounties.has(parseInt(county.id))}
                      onChange={() => toggleSelection(parseInt(county.id), selectedCounties, setSelectedCounties)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{county.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => selectAll(counties, selectedCounties, setSelectedCounties)}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {elements.slice(0, 8).map((element) => (
                  <label key={element.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedElements.has(parseInt(element.id))}
                      onChange={() => toggleSelection(parseInt(element.id), selectedElements, setSelectedElements)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{element.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => selectAll(elements, selectedElements, setSelectedElements)}
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
                <span className="mr-2">📥</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map((year) => (
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
                <button className="text-sm text-blue-600 hover:text-blue-800">Select All</button>
                <button className="text-sm text-blue-600 hover:text-blue-800">Clear All</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (domainsWithSubdomains.length === 0) {
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
      {domainsWithSubdomains.map((domain) => (
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
                <p className="text-sm text-gray-600">{domain.subsector}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {domain.subdomains.length} subdomains
            </div>
          </button>

          {expandedDomains.has(domain.id) && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {domain.subdomains.map((subdomain) => (
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
      ))}
    </div>
  );
};

export default DomainGrid;