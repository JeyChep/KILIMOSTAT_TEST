import React, { useState, useEffect } from 'react';
import CountyList from './CountyList';
import CountyMap from './CountyMap';
import TopicSidebar from './TopicSidebar';
import AnalysisDashboard from './AnalysisDashboard';
import { County, countyService } from '../services/countyService';
import { Domain } from '../services/apiService';
import { useDomains } from '../hooks/useDomains';
import { Loader2 } from 'lucide-react';

export default function SelectedIndicators() {
  const [counties, setCounties] = useState<Map<string, County[]>>(new Map());
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const { domains } = useDomains();

  useEffect(() => {
    async function loadCounties() {
      setLoading(true);
      await countyService.loadCounties();
      const groupedCounties = countyService.getCountiesByLetter();
      setCounties(groupedCounties);
      setLoading(false);
    }

    loadCounties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!selectedCounty) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selected Indicators</h1>
          <p className="text-gray-600">
            Select a county to view detailed agricultural and economic indicators with interactive visualizations.
          </p>
        </div>

        <CountyList
          counties={counties}
          onCountySelect={setSelectedCounty}
          selectedCounty={selectedCounty}
        />
      </main>
    );
  }

  if (!selectedDomain) {
    return (
      <div className="flex h-screen">
        <TopicSidebar
          domains={domains}
          selectedDomain={selectedDomain}
          onDomainSelect={setSelectedDomain}
        />

        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedCounty.name} County</h1>
                <p className="text-gray-600 mt-1">Select a topic from the sidebar to view detailed analysis</p>
              </div>
              <button
                onClick={() => setSelectedCounty(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Change County
              </button>
            </div>
          </div>

          <div className="flex-1 p-8">
            <CountyMap county={selectedCounty} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <TopicSidebar
        domains={domains}
        selectedDomain={selectedDomain}
        onDomainSelect={setSelectedDomain}
      />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedDomain(null)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Map
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">{selectedCounty.name} County</h1>
            </div>
            <button
              onClick={() => setSelectedCounty(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Change County
            </button>
          </div>
        </div>

        <AnalysisDashboard county={selectedCounty} domain={selectedDomain} />
      </div>
    </div>
  );
}
