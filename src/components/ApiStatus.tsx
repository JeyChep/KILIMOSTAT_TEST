import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ApiStatusProps {
  className?: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ className = '' }) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('online');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    // Since we're using mock data, always show as online
    setApiStatus('online');
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'checking':
        return 'Checking API...';
      case 'online':
        return 'API Online';
      case 'offline':
        return 'API Offline';
      case 'error':
        return 'API Error';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
      {lastChecked && (
        <span className="text-xs opacity-75">
          Ready
        </span>
      )}
    </div>
  );
};

export default ApiStatus;