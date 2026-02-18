import React from 'react';
import { Domain } from '../services/apiService';
import { TrendingUp, Users, Leaf, Fish, DollarSign, BarChart3, MapIcon, Package } from 'lucide-react';

interface TopicSidebarProps {
  domains: Domain[];
  selectedDomain: Domain | null;
  onDomainSelect: (domain: Domain) => void;
}

const DOMAIN_ICONS: { [key: string]: React.ReactNode } = {
  'Crops Productivity': <Leaf className="w-5 h-5" />,
  'Livestock Productivity': <Users className="w-5 h-5" />,
  'Fisheries Productivity': <Fish className="w-5 h-5" />,
  'Economic Performance': <DollarSign className="w-5 h-5" />,
  'Macro Economic Indicators': <TrendingUp className="w-5 h-5" />,
  'Population': <Users className="w-5 h-5" />,
  'Land': <MapIcon className="w-5 h-5" />,
  'Nutrition': <Package className="w-5 h-5" />,
  'Inputs': <BarChart3 className="w-5 h-5" />,
};

export default function TopicSidebar({ domains, selectedDomain, onDomainSelect }: TopicSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Topics</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {domains.map(domain => (
            <button
              key={domain.id}
              onClick={() => onDomainSelect(domain)}
              className={`w-full px-6 py-4 text-left transition-colors flex items-center gap-3 ${
                selectedDomain?.id === domain.id
                  ? 'bg-blue-50 border-l-4 border-blue-600'
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <div className={`${
                selectedDomain?.id === domain.id ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {DOMAIN_ICONS[domain.name] || <BarChart3 className="w-5 h-5" />}
              </div>
              <span className={`text-sm font-medium ${
                selectedDomain?.id === domain.id ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {domain.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
