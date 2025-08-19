import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Domain } from '../types';

interface DomainCardProps {
  domain: Domain;
  onClick: () => void;
}

const DomainCard: React.FC<DomainCardProps> = ({ domain, onClick }) => {
  const getIcon = (name: string) => {
    // Map domain names to appropriate icons based on FAOSTAT categories
    const iconMap: { [key: string]: string } = {
      'Production': '🌾',
      'Population': '👥',
      'Trade': '🚢',
      'Prices': '💰',
      'Nutrition': '🍎',
      'Investment': '💼',
      'Food Security': '🛡️',
      'Climate Change': '🌍',
      'Forestry': '🌲',
      'Fisheries': '🐟',
      'Livestock': '🐄',
      'Land': '🌍',
      'Economic': '📈',
      'Primary Supply': '📦',
      'Macro Economic': '📊',
      'Market Prices': '💱',
    };

    for (const [key, emoji] of Object.entries(iconMap)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return '📊'; // Default icon
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{getIcon(domain.name)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {domain.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {domain.subsector}
            </p>
            {domain.code && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Code: {domain.code}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  );
};

export default DomainCard;