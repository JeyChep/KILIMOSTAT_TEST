import React from 'react';
import { County } from '../services/countyService';

interface CountyListProps {
  counties: Map<string, County[]>;
  onCountySelect: (county: County) => void;
  selectedCounty: County | null;
}

export default function CountyList({ counties, onCountySelect, selectedCounty }: CountyListProps) {
  const letters = Array.from(counties.keys());

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">COUNTIES</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {letters.map(letter => (
          <div key={letter}>
            <h3 className="text-3xl font-light text-gray-400 mb-4">{letter}</h3>
            <div className="space-y-2">
              {counties.get(letter)?.map(county => (
                <button
                  key={county.id}
                  onClick={() => onCountySelect(county)}
                  className={`block text-left w-full px-2 py-1 rounded text-sm transition-colors ${
                    selectedCounty?.id === county.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {county.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
