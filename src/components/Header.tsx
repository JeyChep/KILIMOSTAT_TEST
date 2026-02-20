import React from 'react';
import { Search, Home, Database, TrendingUp, BarChart3, BookOpen } from 'lucide-react';
import ApiStatus from './ApiStatus';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, activeTab, onTabChange }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KILIMOSTAT</h1>
            <nav className="hidden md:flex space-x-1">
              <NavButton icon={Home} label="Home" active={activeTab === 'home'} onClick={() => onTabChange('home')} />
              <NavButton icon={Database} label="Data" active={activeTab === 'data'} onClick={() => onTabChange('data')} />
              <NavButton icon={TrendingUp} label="Selected Indicators" active={activeTab === 'indicators'} onClick={() => onTabChange('indicators')} />
              <NavButton icon={BarChart3} label="Compare Data" active={activeTab === 'compare'} onClick={() => onTabChange('compare')} />
              <NavButton icon={BookOpen} label="Definitions and Standards" active={activeTab === 'definitions'} onClick={() => onTabChange('definitions')} />
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ApiStatus />
            <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search an Indicator or Commodity"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

export default Header;
