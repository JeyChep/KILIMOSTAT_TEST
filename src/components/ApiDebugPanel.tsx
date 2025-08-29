import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/apiService';

const ApiDebugPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [testing, setTesting] = useState(false);

  const testEndpoints = async () => {
    setTesting(true);
    const results: { [key: string]: any } = {};

    const endpoints = [
      { name: 'Counties (Mock)', method: () => apiService.getCounties() },
      { name: 'Domains (Mock)', method: () => apiService.getDomains() },
      { name: 'Subdomains (Mock)', method: () => apiService.getSubdomains() },
      { name: 'Elements (Mock)', method: () => apiService.getElements() },
      { name: 'Items (Mock)', method: () => apiService.getItems() },
      { name: 'Units (Mock)', method: () => apiService.getUnits() },
      { name: 'Subsectors (Mock)', method: () => apiService.getSubsectors() },
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const data = await endpoint.method();
        const endTime = Date.now();
        
        results[endpoint.name] = {
          status: 'success',
          count: data.length,
          responseTime: endTime - startTime,
          sample: data.slice(0, 2)
        };
      } catch (error) {
        results[endpoint.name] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test kilimo data with minimal params
    try {
      const startTime = Date.now();
      const kilimoData = await apiService.getKilimoData({
        counties: [1],
        elements: [1],
        years: [2023]
      });
      const endTime = Date.now();
      
      results['KilimoData (Mock)'] = {
        status: 'success',
        count: kilimoData.length,
        responseTime: endTime - startTime,
        sample: kilimoData.slice(0, 2)
      };
    } catch (error) {
      results['KilimoData (Mock)'] = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-w-md">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Bug className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">API Debug</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Endpoint Tests</h3>
              <button
                onClick={testEndpoints}
                disabled={testing}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test All'}</span>
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(testResults).map(([name, result]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    {result.status === 'success' ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    <span className="text-xs font-medium text-gray-700">{name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.status === 'success' ? (
                      <span>{result.count} items ({result.responseTime}ms)</span>
                    ) : (
                      <span className="text-red-600">Error</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(testResults).length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Troubleshooting Tips:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Currently using mock data for development</li>
                      <li>• All data is simulated for testing purposes</li>
                      <li>• Switch to real API when ready for production</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDebugPanel;