import React from 'react';
import DomainCard from './DomainCard';
import { Domain } from '../types';

interface DomainGridProps {
  domains: Domain[];
  loading: boolean;
  onDomainClick: (domain: Domain) => void;
}

const DomainGrid: React.FC<DomainGridProps> = ({ domains, loading, onDomainClick }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          onClick={() => onDomainClick(domain)}
        />
      ))}
    </div>
  );
};

export default DomainGrid;