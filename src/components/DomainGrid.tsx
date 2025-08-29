import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Download, ChevronLeft } from 'lucide-react';
import { apiService, Domain, SubDomain, County, Element, Item, ItemCategory, Subsector, DataExportOptions } from '../services/apiService';
import DataViewer from './DataViewer';

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
  const [selectedItemCategories, setSelectedItemCategories] = useState<Set<number>>(new Set());
  const [showItemCategories, setShowItemCategories] = useState(true);

  // Output options
  const [outputType, setOutputType] = useState<'table' | 'pivot'>('table');
  const [fileType, setFileType] = useState<'csv' | 'xls'>('csv');
  const [thousandSeparator, setThousandSeparator] = useState<'none' | 'comma' | 'period'>('none');
  const [includeFlags, setIncludeFlags] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeCodes, setIncludeCodes] = useState(true);
  const [includeUnits, setIncludeUnits] = useState(true);
  const [includeNullValues, setIncludeNullValues] = useState(false);

  // Data viewer
  const [showDataViewer, setShowDataViewer] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Filter states
  const [countryFilter, setCountryFilter] = useState('');
  const [elementFilter, setElementFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading domain grid data...');

        const [domainsData, subsectorsData, subdomainsData, countiesData, elementsData, itemsData, itemCategoriesData] = await Promise.all([
          apiService.getDomains(),
          apiService.getSubsectors(),
          apiService.getSubdomains(),
          apiService.getCounties(),
          apiService.getElements(),
          apiService.getItems(),
          apiService.getItemCategories()
        ]);

        console.log('Data loaded successfully:', {
          domains: domainsData.length,
          subsectors: subsectorsData.length,
          subdomains: subdomainsData.length,
          counties: countiesData.length,
          elements: elementsData.length,
          items: itemsData.length,
          itemCategories: itemCategoriesData.length
        });

        setDomains(domainsData);
        setSubsectors(subsectorsData);
        setSubdomains(subdomainsData);
        setCounties(countiesData);
        setElements(elementsData);
        setItems(itemsData);
        setItemCategories(itemCategoriesData);
      } catch (err) {
        console.error('Failed to load data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        
        // Show user-friendly error message
        alert(`Unable to connect to Kilimostat API: ${errorMessage}\n\nPlease check:\n1. Internet connection\n2. API server status\n3. Network firewall settings\n\nUsing local data for now.`);
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
    // Reset item selections when changing subdomain
    setSelectedItems(new Set());
    setSelectedItemCategories(new Set());
    setShowItemCategories(true);
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
    if (!counties || counties.length === 0) return [];
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
    if (!selectedSubdomain) return [];
    const subdomainItems = items.filter(item => {
      const itemElements = elements.filter(e => e.id === item.element);
      return itemElements.some(e => e.subdomain === selectedSubdomain.id);
    });
    
    if (selectedItemCategories.size > 0) {
      return subdomainItems.filter(item => 
        selectedItemCategories.has(item.itemcategory) &&
        item.name.toLowerCase().includes(itemFilter.toLowerCase())
      );
    }
    
    return subdomainItems.filter(item =>
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

  const getFilteredItemCategories = () => {
    if (!selectedSubdomain) return [];
    const subdomainItems = items.filter(item => {
      const itemElements = elements.filter(e => e.id === item.element);
      return itemElements.some(e => e.subdomain === selectedSubdomain.id);
    });
    
    const categoryIds = [...new Set(subdomainItems.map(item => item.itemcategory))];
    const subdomainCategories = itemCategories.filter(category => categoryIds.includes(category.id));
    
    return subdomainCategories.filter(category =>
      category.name.toLowerCase().includes(itemCategoryFilter.toLowerCase())
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

  const handleShowData = () => {
    if (selectedCounties.size === 0 || selectedElements.size === 0 || selectedYears.size === 0) {
      alert('Please select at least one county, element, and year to view data.');
      return;
    }
    console.log('Show data clicked with selections:', {
      counties: Array.from(selectedCounties),
      elements: Array.from(selectedElements),
      items: Array.from(selectedItems),
      years: Array.from(selectedYears),
      subdomain: selectedSubdomain?.id
    });
    setShowDataViewer(true);
  };

  const handleDownloadData = async () => {
    if (selectedCounties.size === 0 || selectedElements.size === 0 || selectedYears.size === 0) {
      alert('Please select at least one county, element, and year to download data.');
      return;
    }

    try {
      setDownloading(true);
      console.log('Download data clicked with selections:', {
        counties: Array.from(selectedCounties),
        elements: Array.from(selectedElements),
        items: Array.from(selectedItems),
        years: Array.from(selectedYears),
        subdomain: selectedSubdomain?.id
      });

      const params = {
        counties: Array.from(selectedCounties),
        elements: Array.from(selectedElements),
        items: selectedItems.size > 0 ? Array.from(selectedItems) : undefined,
        years: Array.from(selectedYears),
        subdomain: selectedSubdomain!.id
      };

      const options: DataExportOptions = {
        outputType,
        fileType,
        thousandSeparator,
        includeFlags,
        includeNotes,
        includeCodes,
        includeUnits,
        includeNullValues
      };

      const blob = await apiService.downloadKilimoData(params, options);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kilimostat-data-${selectedSubdomain!.name.toLowerCase().replace(/\s+/g, '-')}.${fileType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setDownloading(false);
    }
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
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-md">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left side: 2x2 grid for data selection */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Counties */}
            <div className="bg-white border border-green-200 rounded-lg shadow-lg">
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
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredCounties.map((county) => (
                  <label key={county.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCounties.has(county.id)}
                      onChange={() => toggleSelection(county.id, selectedCounties, setSelectedCounties)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{county.name}</span>
                  </label>
                ))}
                {filteredCounties.length === 0 && (
                  <div className="text-sm text-gray-500 italic">No counties found</div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Showing {filteredCounties.length} of {counties.length} counties
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => selectAll(filteredCounties, selectedCounties, setSelectedCounties)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Select All
                </button>
                <button
                  onClick={() => clearAll(setSelectedCounties)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Elements */}
            <div className="bg-white border border-green-200 rounded-lg shadow-lg">
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
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredElements.map((element) => (
                  <label key={element.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedElements.has(element.id)}
                      onChange={() => toggleSelection(element.id, selectedElements, setSelectedElements)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{element.name}</span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Showing {filteredElements.length} elements
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => selectAll(filteredElements, selectedElements, setSelectedElements)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Select All
                </button>
                <button
                  onClick={() => clearAll(setSelectedElements)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Items */}
            <div className="bg-white border border-green-200 rounded-lg shadow-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {showItemCategories ? 'ITEMS' : 'ITEM CATEGORIES'}
                </h3>
                <span className="text-xs text-gray-500">CPC</span>
              </div>
              {!showItemCategories && (
                <button
                  onClick={() => {
                    setShowItemCategories(true);
                    setSelectedItemCategories(new Set());
                    setItemFilter(''); // Clear item filter when going back
                  }}
                  className="mt-2 text-xs text-green-600 hover:text-green-800 flex items-center"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Back to Categories
                </button>
              )}
            </div>
            <div className="p-4">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder={showItemCategories ? "Filter categories e.g. crops" : "Filter items e.g. maize, wheat"}
                  value={showItemCategories ? itemCategoryFilter : itemFilter}
                  onChange={(e) => showItemCategories ? setItemCategoryFilter(e.target.value) : setItemFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {showItemCategories ? (
                  getFilteredItemCategories().map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        console.log('Selected item category:', category);
                        setSelectedItemCategories(new Set([category.id]));
                        setShowItemCategories(false);
                        setItemFilter(''); // Clear item filter when switching to items view
                      }}
                      className="w-full flex items-center space-x-2 p-2 hover:bg-green-50 rounded-md text-left"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        ({getFilteredItems().filter(item => item.itemcategory === category.id).length} items)
                      </span>
                    </button>
                  ))
                ) : (
                  getFilteredItems().map((item) => (
                    <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelection(item.id, selectedItems, setSelectedItems)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </label>
                  ))
                )}
                {showItemCategories && getFilteredItemCategories().length === 0 && (
                  <div className="text-sm text-gray-500 italic">No item categories found for this subdomain</div>
                )}
                {!showItemCategories && getFilteredItems().length === 0 && (
                  <div className="text-sm text-gray-500 italic">
                    No items found in selected category. 
                    <button 
                      onClick={() => {
                        setShowItemCategories(true);
                        setSelectedItemCategories(new Set());
                      }}
                      className="text-green-600 hover:text-green-800 ml-1"
                    >
                      Go back to categories
                    </button>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {showItemCategories 
                  ? `${getFilteredItemCategories().length} categories available`
                  : `${getFilteredItems().length} items available`
                }
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                {!showItemCategories && (
                  <>
                    <button
                      onClick={() => selectAll(getFilteredItems(), selectedItems, setSelectedItems)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => clearAll(setSelectedItems)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Clear All
                    </button>
                  </>
                )}
                {showItemCategories && (
                  <div className="text-xs text-gray-500">
                    Click a category to view items
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Years */}
            <div className="bg-white border border-green-200 rounded-lg shadow-lg">
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
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredYears.map((year) => (
                  <label key={year} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedYears.has(year)}
                      onChange={() => toggleSelection(year, selectedYears, setSelectedYears)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{year}</span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {filteredYears.length} years available
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => selectAll(filteredYears.map(y => ({ id: y })), selectedYears, setSelectedYears)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Select All
                </button>
                <button
                  onClick={() => clearAll(setSelectedYears)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          </div>

          {/* Right sidebar: Info Cards */}
          <div className="space-y-6">
            {/* Domain Details Card */}
            <div className="bg-white border border-green-200 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedSubdomain.name}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {selectedSubdomain.description || 'Agricultural and livestock statistics covering various indicators and measurements.'}
            </p>
              <button className="text-green-600 hover:text-green-800 text-sm font-medium">Show More</button>
          </div>

            {/* Last Update Card */}
            <div className="bg-white border border-green-200 rounded-lg shadow-lg p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Last Update</h4>
              <p className="text-sm text-gray-600 mb-2">June 11, 2025</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Data freshness: 75%</p>
          </div>

            {/* Bulk Downloads Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Download className="h-4 w-4 mr-2 text-green-600" />
              Bulk Downloads
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">All Data</button>
                <span className="text-xs text-gray-500">23.9 MB</span>
              </div>
              <div className="flex justify-between items-center">
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">All Data Normalized</button>
                <span className="text-xs text-gray-500">32.33 MB</span>
              </div>
              <div className="flex justify-between items-center">
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">Kenya</button>
                <span className="text-xs text-gray-500">4.1 MB</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Output Options */}
        <div className="mt-8 bg-white border border-green-200 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Output Options</h3>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Output Type */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Output Type</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="outputType"
                    value="table"
                    checked={outputType === 'table'}
                    onChange={(e) => setOutputType(e.target.value as 'table')}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Table</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="outputType"
                    value="pivot"
                    checked={outputType === 'pivot'}
                    onChange={(e) => setOutputType(e.target.value as 'pivot')}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Pivot</span>
                </label>
              </div>
            </div>

            {/* File Type */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">File Type</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="fileType"
                    value="csv"
                    checked={fileType === 'csv'}
                    onChange={(e) => setFileType(e.target.value as 'csv')}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">CSV</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="fileType"
                    value="xls"
                    checked={fileType === 'xls'}
                    onChange={(e) => setFileType(e.target.value as 'xls')}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">XLS</span>
                </label>
              </div>
            </div>

            {/* Thousand Separator */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Thousand Separator in 'Show Data'</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="thousandSeparator"
                    value="none"
                    checked={thousandSeparator === 'none'}
                    onChange={(e) => setThousandSeparator(e.target.value as 'none')}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">None</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="thousandSeparator"
                    value="comma"
                    checked={thousandSeparator === 'comma'}
                    onChange={(e) => setThousandSeparator(e.target.value as 'comma')}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Comma</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="thousandSeparator"
                    value="period"
                    checked={thousandSeparator === 'period'}
                    onChange={(e) => setThousandSeparator(e.target.value as 'period')}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Period</span>
                </label>
              </div>
            </div>

            {/* Output Formatting Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Output Formatting Options</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeFlags}
                    onChange={(e) => setIncludeFlags(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Flags</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => setIncludeNotes(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Notes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCodes}
                    onChange={(e) => setIncludeCodes(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Codes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeUnits}
                    onChange={(e) => setIncludeUnits(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Units</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeNullValues}
                    onChange={(e) => setIncludeNullValues(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Null Values</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleShowData}
            disabled={selectedCounties.size === 0 || selectedElements.size === 0 || selectedYears.size === 0}
            className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            <span>🔍</span>
            <span>Show Data</span>
          </button>
          <button
            onClick={handleDownloadData}
            disabled={downloading || selectedCounties.size === 0 || selectedElements.size === 0 || selectedYears.size === 0}
            className="flex items-center space-x-2 px-8 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download Data</span>
              </>
            )}
          </button>
        </div>

        {/* Data Viewer Modal */}
        {showDataViewer && selectedSubdomain && (
          <DataViewer
            selectedCounties={selectedCounties}
            selectedElements={selectedElements}
            selectedItems={selectedItems}
            selectedYears={selectedYears}
            subdomainId={selectedSubdomain.id}
            onClose={() => setShowDataViewer(false)}
          />
        )}
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