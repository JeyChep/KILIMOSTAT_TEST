import React from 'react';

interface SubsectorTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SubsectorTabs: React.FC<SubsectorTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'domains', label: 'DOMAINS' },
    { id: 'table', label: 'DOMAINS TABLE' },
  ];

  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SubsectorTabs;