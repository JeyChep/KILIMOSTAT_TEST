import React, { useState } from 'react';
import { apiService } from '../services/apiService';

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [testing, setTesting] = useState(false);

  const testEndpoint = async (name: string, testFunction: () => Promise<any>) => {
    try {
      console.log(`Testing ${name}...`);
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [name]: {
          success: true,
          data: result,
          count: Array.isArray(result) ? result.length : 'N/A'
        }
      }));
      console.log(`${name} test successful:`, result);
    } catch (error) {
      console.error(`${name} test failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults({});

    // Test basic endpoints
    await testEndpoint('Counties', () => apiService.getCounties());
    await testEndpoint('Domains', () => apiService.getDomains());
    await testEndpoint('Subdomains', () => apiService.getSubdomains());
    await testEndpoint('Elements', () => apiService.getElements());
    await testEndpoint('Items', () => apiService.getItems());
    await testEndpoint('Item Categories', () => apiService.getItemCategories());
    await testEndpoint('Units', () => apiService.getUnits());
    await testEndpoint('Subsectors', () => apiService.getSubsectors());

    // Test kilimodata with minimal params
    await testEndpoint('KilimoData (minimal)', () => 
      apiService.getKilimoData({
        counties: [1], // Machakos
        elements: [1], // Crop Area
        years: [2023],
        subdomain: 1 // Crops Primary
      })
    );

    setTesting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">API Connectivity Test</h3>
        <button
          onClick={runAllTests}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {testing ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(testResults).map(([name, result]) => (
          <div key={name} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium text-gray-900">{name}</span>
            </div>
            <div className="text-sm text-gray-600">
              {result.success ? (
                <span className="text-green-600">
                  ✓ Success ({result.count} items)
                </span>
              ) : (
                <span className="text-red-600" title={result.error}>
                  ✗ Failed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Check the browser console for detailed logs and error messages.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApiTest;