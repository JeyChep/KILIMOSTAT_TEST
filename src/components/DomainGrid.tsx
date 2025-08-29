import React, { useState, useEffect } from 'react';
import { Domain } from '../types';
import { Download, FileText, Calendar, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';

interface DomainGridProps {
  domains: Domain[];
  loading: boolean;
  onDomainClick: (domain: Domain) => void;
}

interface SubDomain {
  id: number;
  name: string;
  code: string;
  description: string;
  domain: number;
}

interface County {
  id: number;
  name: string;
  code: string;
}

interface Element {
  id: number;
  name: string;
  code: string;
  description: string;
  subdomain: number;
}

interface Item {
  id: number;
  name: string;
  code: string;
  description: string;
  element: string;
  itemcategory: string;
  periodicity: string;
}

export const DomainGrid: React.FC<DomainGridProps> = ({ domains, loading, onDomainClick }) => {
  const [counties, setCounties] = useState<County[]>([]);
  const [elements, setElements] = useState<Element[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [subdomains, setSubdomains] = useState<SubDomain[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<Set<number>>(new Set());
  const [selectedElements, setSelectedElements] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
  const [countySearch, setCountySearch] = useState('');
  const [elementSearch, setElementSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [countiesData, elementsData, itemsData, subdomainsData] = await Promise.all([
          apiService.getCounties(),
          apiService.getElements(),
          apiService.getItems(),
          apiService.getSubdomains()
        ]);
        
        setCounties(countiesData);
        setElements(elementsData);
        setItems(itemsData);
        setSubdomains(subdomainsData);
      } catch (error) {
        console.error('Failed to load reference data:', error);
      }
    };

    loadReferenceData();
  }, []);

  const toggleCounty = (countyId: number) => {
    const newSelected = new Set(selectedCounties);
    if (newSelected.has(countyId)) {
      newSelected.delete(countyId);
    } else {
      newSelected.add(countyId);
    }
    setSelectedCounties(newSelected);
  };

  const toggleElement = (elementId: number) => {
    const newSelected = new Set(selectedElements);
    if (newSelected.has(elementId)) {
      newSelected.delete(elementId);
    } else {
      newSelected.add(elementId);
    }
    setSelectedElements(newSelected);
  };

  const toggleItem = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleYear = (year: number) => {
    const newSelected = new Set(selectedYears);
    if (newSelected.has(year)) {
      newSelected.delete(year);
    } else {
      newSelected.add(year);
    }
    setSelectedYears(newSelected);
  };

  const selectAllCounties = () => {
    setSelectedCounties(new Set(counties.map(c => c.id)));
  };

  const clearAllCounties = () => {
    setSelectedCounties(new Set());
  };

  const selectAllElements = () => {
    setSelectedElements(new Set(elements.map(e => e.id)));
  };

  const clearAllElements = () => {
    setSelectedElements(new Set());
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(items.map(i => i.id)));
  };

  const clearAllItems = () => {
    setSelectedItems(new Set());
  };

  const selectAllYears = () => {
    setSelectedYears(new Set(years));
  };

  const clearAllYears = () => {
    setSelectedYears(new Set());
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
      'Primary Supply': '📦',
      'Macro Economic': '📊'
    };

    for (const [key, emoji] of Object.entries(iconMap)) {
      if (domainName.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return '📊';
  };

  const filteredCounties = counties.filter(county =>
    county.name.toLowerCase().includes(countySearch.toLowerCase())
  );

  const filteredElements = elements.filter(element =>
    element.name.toLowerCase().includes(elementSearch.toLowerCase())
  );

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const filteredYears = years.filter(year =>
    year.toString().includes(yearSearch)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left section - 2x2 grid for main cards */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Counties Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Counties</h3>
              </div>
              
              <input
                type="text"
                placeholder="Filter counties..."
                value={countySearch}
                onChange={(e) => setCountySearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                <div className="p-3 space-y-2">
                  {filteredCounties.slice(0, 10).map((county) => (
                    <label key={county.id} className="flex items-center hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCounties.has(county.id)}
                        onChange={() => toggleCounty(county.id)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{county.name}</span>
                    </label>
                  ))}
                  {filteredCounties.length > 10 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{filteredCounties.length - 10} more counties
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                <button 
                  onClick={selectAllCounties}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Select All
                </button>
                <button 
                  onClick={clearAllCounties}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Elements Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Elements</h3>
              </div>
              
              <input
                type="text"
                placeholder="Filter elements..."
                value={elementSearch}
                onChange={(e) => setElementSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
              />
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                <div className="p-3 space-y-2">
                  {filteredElements.slice(0, 8).map((element) => (
                    <label key={element.id} className="flex items-center hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedElements.has(element.id)}
                        onChange={() => toggleElement(element.id)}
                        className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{element.name}</span>
                    </label>
                  ))}
                  {filteredElements.length > 8 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{filteredElements.length - 8} more elements
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                <button 
                  onClick={selectAllElements}
                  className="text-xs text-green-600 hover:underline"
                >
                  Select All
                </button>
                <button 
                  onClick={clearAllElements}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Items</h3>
              </div>
              
              <input
                type="text"
                placeholder="Filter results e.g. maize, wheat"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
              />
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                <div className="p-3 space-y-2">
                  {filteredItems.slice(0, 8).map((item) => (
                    <label key={item.id} className="flex items-center hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </label>
                  ))}
                  {filteredItems.length > 8 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{filteredItems.length - 8} more items
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                <button 
                  onClick={selectAllItems}
                  className="text-xs text-purple-600 hover:underline"
                >
                  Select All
                </button>
                <button 
                  onClick={clearAllItems}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Years Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-orange-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Years</h3>
              </div>
              
              <input
                type="text"
                placeholder="Filter results e.g. 2023"
                value={yearSearch}
                onChange={(e) => setYearSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
              />
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                <div className="p-3 space-y-2">
                  {filteredYears.slice(0, 8).map((year) => (
                    <label key={year} className="flex items-center hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedYears.has(year)}
                        onChange={() => toggleYear(year)}
                        className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{year}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                <button 
                  onClick={selectAllYears}
                  className="text-xs text-orange-600 hover:underline"
                >
                  Select All
                </button>
                <button 
                  onClick={clearAllYears}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar - Long card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 h-full">
          <div className="p-6 space-y-6">
            {/* Domain List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Domains</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {domains.map((domain) => {
                  const domainSubdomains = subdomains.filter(sub => sub.domain === domain.id);
                  const isExpanded = expandedDomains.has(domain.id);
                  
                  return (
                    <div key={domain.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleDomain(domain.id)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getDomainIcon(domain.name)}</span>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{domain.name}</div>
                            {domain.code && (
                              <div className="text-xs text-gray-500 font-mono">{domain.code}</div>
                            )}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      
                      {isExpanded && domainSubdomains.length > 0 && (
                        <div className="px-3 pb-3 space-y-1">
                          {domainSubdomains.map((subdomain) => (
                            <div key={subdomain.id} className="ml-6 py-1">
                              <button 
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left"
                                onClick={() => console.log('Subdomain clicked:', subdomain)}
                              >
                                {subdomain.name}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bulk Downloads */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Download className="w-5 h-5 text-yellow-700 mr-2" />
                <h4 className="font-semibold text-yellow-800">Bulk Downloads</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">All Data</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">23.9 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-sm text-blue-600 hover:underline text-left">All Data Normalized</button>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">32.33 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-sm text-blue-600 hover:underline text-left">All Area Groups</button>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">7.29 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-sm text-blue-600 hover:underline text-left">Africa</button>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">4.1 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-sm text-blue-600 hover:underline text-left">Americas</button>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">3.42 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-sm text-blue-600 hover:underline text-left">Asia</button>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">4.47 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-sm text-blue-600 hover:underline text-left">Europe</button>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">3.7 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <button className="text-sm text-blue-600 hover:underline text-left">Oceania</button>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">763 KB</span>
                </div>
              </div>
            </div>

            {/* Last Update */}
            <div>
              <h4 className="font-semibold text-blue-600 text-sm mb-2">Last Update</h4>
              <p className="text-sm text-gray-600">January 20, 2025</p>
            </div>

            {/* Related Documents */}
            <div>
              <h4 className="font-semibold text-blue-600 text-sm mb-3">Related Documents</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <button className="text-sm text-blue-600 hover:underline text-left">Change of units for yield/carcass weight</button>
                </div>
                <div className="flex items-start">
                  <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <button className="text-sm text-blue-600 hover:underline text-left">Methodology - Crops and Livestock</button>
                </div>
                <div className="flex items-start">
                  <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <button className="text-sm text-blue-600 hover:underline text-left">Agricultural production data standards</button>
                </div>
              </div>
            </div>

            {/* Suggested Reading */}
            <div>
              <h4 className="font-semibold text-orange-600 text-sm mb-2">Suggested Reading</h4>
              <div className="flex items-start">
                <FileText className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <button className="text-sm text-orange-600 hover:underline text-left">Analytical brief on agricultural statistics</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};