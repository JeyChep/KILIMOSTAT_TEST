import React, { useState } from 'react';
import { Download, Upload, Plus, Check, X } from 'lucide-react';
import { Domain } from '../types';

interface DataTableProps {
  domains: Domain[];
  loading: boolean;
  onImport: () => void;
  onExport: () => void;
  onAddDomain: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ 
  domains, 
  loading, 
  onImport, 
  onExport, 
  onAddDomain 
}) => {
  const [selectedDomains, setSelectedDomains] = useState<number[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDomains(domains.map(d => d.id));
    } else {
      setSelectedDomains([]);
    }
  };

  const handleSelectDomain = (domainId: number, checked: boolean) => {
    if (checked) {
      setSelectedDomains(prev => [...prev, domainId]);
    } else {
      setSelectedDomains(prev => prev.filter(id => id !== domainId));
    }
  };

  const handleAction = () => {
    if (selectedAction && selectedDomains.length > 0) {
      console.log(`Executing ${selectedAction} on domains:`, selectedDomains);
      // Implement action logic here
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Select domain to change</h2>
          <div className="flex space-x-3">
            <button
              onClick={onImport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>IMPORT</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>EXPORT</span>
            </button>
            <button
              onClick={onAddDomain}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>ADD DOMAIN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Action:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">--------</option>
            <option value="delete">Delete selected domains</option>
            <option value="export">Export selected domains</option>
          </select>
          <button
            onClick={handleAction}
            disabled={!selectedAction || selectedDomains.length === 0}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Go
          </button>
          <span className="text-sm text-gray-600">
            {selectedDomains.length} of {domains.length} selected
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedDomains.length === domains.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NAME
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CODE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SUBSECTOR
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-4 w-4 rounded"></div></td>
                  <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div></td>
                  <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div></td>
                  <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div></td>
                  <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div></td>
                </tr>
              ))
            ) : (
              domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(domain.id)}
                      onChange={(e) => handleSelectDomain(domain.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {domain.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {domain.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {domain.code || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {domain.subsector || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;