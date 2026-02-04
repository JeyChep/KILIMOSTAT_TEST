import { useState } from 'react';
import CountyMap from './CountyMap';
import { Domain } from '../types';
import { Check } from 'lucide-react';

interface SelectedIndicatorsProps {
  domains: Domain[];
  loading: boolean;
}

export default function SelectedIndicators({ domains, loading }: SelectedIndicatorsProps) {
  const [selectedCounty, setSelectedCounty] = useState<string | undefined>(undefined);
  const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);

  const handleIndicatorToggle = (domainId: number) => {
    setSelectedIndicators(prev =>
      prev.includes(domainId)
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  const handleCountySelect = (countyName: string) => {
    setSelectedCounty(countyName);
  };

  const selectedDomains = domains.filter(d => selectedIndicators.includes(d.id));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Indicators</h2>
        <p className="text-gray-600 mb-4">
          Choose indicators to visualize on the county map below.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {domains.slice(0, 12).map((domain) => (
              <button
                key={domain.id}
                onClick={() => handleIndicatorToggle(domain.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedIndicators.includes(domain.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{domain.name}</h3>
                    {domain.code && (
                      <p className="text-xs text-gray-500 mt-1">{domain.code}</p>
                    )}
                  </div>
                  {selectedIndicators.includes(domain.id) && (
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedDomains.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Selected Indicators ({selectedDomains.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedDomains.map(domain => (
                <span
                  key={domain.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {domain.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">County Map</h2>
        <p className="text-gray-600 mb-4">
          Click on any county to select it and view indicator data for that region.
        </p>

        {selectedCounty && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-900">
              Selected County: <span className="font-bold">{selectedCounty}</span>
            </p>
            {selectedDomains.length > 0 && (
              <p className="text-sm text-green-700 mt-1">
                Showing {selectedDomains.length} indicator(s) for this county
              </p>
            )}
          </div>
        )}

        <CountyMap
          selectedCounty={selectedCounty}
          onCountySelect={handleCountySelect}
        />
      </div>
    </div>
  );
}
