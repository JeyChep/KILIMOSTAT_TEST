import React, { useState, useEffect } from 'react';
import { Download, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService, KilimoDataRecord, DataExportOptions, County, Element, Item, Unit } from '../services/apiService';

interface DataViewerProps {
  selectedCounties: Set<number>;
  selectedElements: Set<number>;
  selectedItems: Set<number>;
  selectedYears: Set<number>;
  subdomainId: number;
  onClose: () => void;
}

const DataViewer: React.FC<DataViewerProps> = ({
  selectedCounties,
  selectedElements,
  selectedItems,
  selectedYears,
  subdomainId,
  onClose
}) => {
  const [data, setData] = useState<KilimoDataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counties, setCounties] = useState<County[]>([]);
  const [elements, setElements] = useState<Element[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const itemsPerPage = 50;

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [countiesData, elementsData, itemsData, unitsData] = await Promise.all([
          apiService.getCounties(),
          apiService.getElements(),
          apiService.getItems(),
          apiService.getUnits()
        ]);
        
        setCounties(countiesData);
        setElements(elementsData);
        setItems(itemsData);
        setUnits(unitsData);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    };

    loadReferenceData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (selectedCounties.size === 0 || selectedElements.size === 0 || selectedYears.size === 0) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = {
          counties: Array.from(selectedCounties),
          elements: Array.from(selectedElements),
          items: selectedItems.size > 0 ? Array.from(selectedItems) : undefined,
          years: Array.from(selectedYears),
          subdomain: subdomainId
        };

        const result = await apiService.getKilimoData(params);
        setData(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCounties, selectedElements, selectedItems, selectedYears, subdomainId]);

  const getCountyName = (countyId: number) => {
    const county = counties.find(c => c.id === countyId);
    return county?.name || `County ${countyId}`;
  };

  const getElementName = (elementId: number) => {
    const element = elements.find(e => e.id === elementId);
    return element?.name || `Element ${elementId}`;
  };

  const getItemName = (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    return item?.name || `Item ${itemId}`;
  };

  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id.toString() === unitId);
    return unit?.abbreviation || unit?.name || '';
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Eye className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Data View</h2>
            <span className="text-sm text-gray-500">
              ({data.length} records)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load data</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
                <p className="text-gray-600">Try adjusting your selection criteria</p>
              </div>
            </div>
          ) : (
            <>
              {/* Data Table */}
              <div className="flex-1 overflow-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          County
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Element
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Year
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Value
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Unit
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Flag
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getCurrentPageData().map((record, index) => (
                        <tr key={record.id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                            {getCountyName(record.county)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                            {getElementName(record.element)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                            {getItemName(record.item)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                            {record.year}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right border-b border-gray-100 font-mono">
                            {formatValue(record.value)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                            {record.unit ? getUnitName(record.unit) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center border-b border-gray-100">
                            {record.flag ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {record.flag}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataViewer;