import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Abbreviation, County, Flag, Item, ItemCategory, Element, Unit } from '../types';

interface DataSection {
  id: string;
  title: string;
  data: any[];
  columns: { key: string; label: string; width?: string }[];
}

const DefinitionsStandards: React.FC = () => {
  const [sections, setSections] = useState<DataSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [abbreviations, counties, flags, items, itemCategories, elements, units] = await Promise.all([
          dataService.getAbbreviations(),
          dataService.getCounties(),
          dataService.getFlags(),
          dataService.getItems(),
          dataService.getItemCategories(),
          dataService.getElements(),
          dataService.getUnits()
        ]);

        const newSections: DataSection[] = [
          {
            id: 'abbreviations',
            title: 'Abbreviations',
            data: abbreviations,
            columns: [
              { key: 'abbr', label: 'Abbreviation', width: '15%' },
              { key: 'description', label: 'Description', width: '60%' },
              { key: 'slug', label: 'Slug', width: '15%' },
              { key: 'id', label: 'ID', width: '10%' }
            ]
          },
          {
            id: 'counties',
            title: 'Counties',
            data: counties,
            columns: [
              { key: 'id', label: 'ID', width: '15%' },
              { key: 'name', label: 'County Name', width: '60%' },
              { key: 'code', label: 'Code', width: '25%' }
            ]
          },
          {
            id: 'elements',
            title: 'Elements',
            data: elements,
            columns: [
              { key: 'id', label: 'ID', width: '10%' },
              { key: 'name', label: 'Element Name', width: '40%' },
              { key: 'code', label: 'Code', width: '15%' },
              { key: 'description', label: 'Description', width: '25%' },
              { key: 'subdomain', label: 'Subdomain', width: '10%' }
            ]
          },
          {
            id: 'flags',
            title: 'Flags',
            data: flags,
            columns: [
              { key: 'id', label: 'ID', width: '15%' },
              { key: 'name', label: 'Flag Name', width: '50%' },
              { key: 'code', label: 'Code', width: '20%' },
              { key: 'description', label: 'Description', width: '15%' }
            ]
          },
          {
            id: 'items',
            title: 'Items',
            data: items,
            columns: [
              { key: 'id', label: 'ID', width: '8%' },
              { key: 'name', label: 'Item Name', width: '35%' },
              { key: 'code', label: 'Code', width: '12%' },
              { key: 'element', label: 'Element', width: '12%' },
              { key: 'itemcategory', label: 'Category', width: '12%' },
              { key: 'periodicity', label: 'Periodicity', width: '12%' },
              { key: 'description', label: 'Description', width: '9%' }
            ]
          },
          {
            id: 'itemCategories',
            title: 'Item Categories',
            data: itemCategories,
            columns: [
              { key: 'id', label: 'ID', width: '15%' },
              { key: 'name', label: 'Category Name', width: '50%' },
              { key: 'code', label: 'Code', width: '20%' },
              { key: 'description', label: 'Description', width: '15%' }
            ]
          },
          {
            id: 'units',
            title: 'Units',
            data: units,
            columns: [
              { key: 'id', label: 'ID', width: '15%' },
              { key: 'name', label: 'Unit Name', width: '40%' },
              { key: 'abbreviation', label: 'Abbreviation', width: '20%' },
              { key: 'description', label: 'Description', width: '25%' }
            ]
          }
        ];

        setSections(newSections);
      } catch (error) {
        console.error('Failed to load definitions data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const filterData = (data: any[], searchQuery: string) => {
    if (!searchQuery) return data;
    
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading definitions and standards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Definitions and Standards</h1>
          
          {/* Search */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search definitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">List</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sections.map((section) => {
              const filteredData = filterData(section.data, searchQuery);
              const isExpanded = expandedSections.has(section.id);

              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      {section.title}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {filteredData.length} items
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              {section.columns.map((column) => (
                                <th
                                  key={column.key}
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  style={{ width: column.width }}
                                >
                                  {column.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length > 0 ? (
                              filteredData.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50">
                                  {section.columns.map((column) => (
                                    <td
                                      key={column.key}
                                      className="px-4 py-3 text-sm text-gray-900 break-words"
                                    >
                                      {String(item[column.key] || '-')}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={section.columns.length}
                                  className="px-4 py-8 text-center text-gray-500"
                                >
                                  No items found matching your search
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefinitionsStandards;