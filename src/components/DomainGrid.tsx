import React from 'react';
import { Domain } from '../types';
import { Download, FileText, Calendar, MapPin } from 'lucide-react';

interface DomainGridProps {
  domains: Domain[];
  loading: boolean;
  onDomainClick: (domain: Domain) => void;
}

export const DomainGrid: React.FC<DomainGridProps> = ({ domains, loading, onDomainClick }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left section - 2x2 grid for main cards */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Counties Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Counties</h3>
            </div>
            <div className="space-y-3">
              <div className="max-h-32 overflow-y-auto">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Afghanistan</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Albania</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Algeria</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <button className="text-xs text-blue-600 hover:underline">Select All</button>
                <button className="text-xs text-gray-500 hover:underline">Clear All</button>
              </div>
            </div>
          </div>

          {/* Elements Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Elements</h3>
            </div>
            <div className="space-y-3">
              <div className="max-h-32 overflow-y-auto">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Area harvested</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Yield</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Production Quantity</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <button className="text-xs text-blue-600 hover:underline">Select All</button>
                <button className="text-xs text-gray-500 hover:underline">Clear All</button>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Items</h3>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Filter results e.g. abaca, manila hemp, raw"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="max-h-24 overflow-y-auto">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Crops, primary</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Crops Processed</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <button className="text-xs text-blue-600 hover:underline">Select All</button>
                <button className="text-xs text-gray-500 hover:underline">Clear All</button>
              </div>
            </div>
          </div>

          {/* Years Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Years</h3>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Filter results e.g. 2023"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="max-h-24 overflow-y-auto">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">2019</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">2018</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">2017</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <button className="text-xs text-blue-600 hover:underline">Select All</button>
                <button className="text-xs text-gray-500 hover:underline">Clear All</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar - Long card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 h-full">
          <div className="space-y-6">
            {/* Domain Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Domain Information</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                This domain contains data recorded for 278 products, covering the following categories: 1) CROPS PRIMARY: Cereals, Citrus Fruit, Fibre Crops...
                <button className="text-blue-600 hover:underline ml-1">Show More</button>
              </p>
            </div>

            {/* Bulk Downloads */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Download className="w-5 h-5 text-yellow-700 mr-2" />
                <h4 className="font-semibold text-yellow-800">Bulk Downloads</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">All Data</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">23.9 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">All Data Normalized</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">32.33 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">All Area Groups</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">7.29 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">Africa</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">4.1 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">Americas</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">3.42 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">Asia</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">4.47 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">Europe</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">3.7 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">Oceania</span>
                  <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">763 KB</span>
                </div>
              </div>
            </div>

            {/* Last Update */}
            <div>
              <h4 className="font-semibold text-blue-600 text-sm mb-2">Last Update</h4>
              <p className="text-sm text-gray-600">June 11, 2025</p>
            </div>

            {/* Related Documents */}
            <div>
              <h4 className="font-semibold text-blue-600 text-sm mb-3">Related Documents</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <a href="#" className="text-sm text-blue-600 hover:underline">Change of units for yield/carcass weight</a>
                </div>
                <div className="flex items-start">
                  <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <a href="#" className="text-sm text-blue-600 hover:underline">Hen Eggs technical conversion factor</a>
                </div>
                <div className="flex items-start">
                  <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <a href="#" className="text-sm text-blue-600 hover:underline">Methodology - Crops and Livestock</a>
                </div>
                <div className="flex items-start">
                  <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <a href="#" className="text-sm text-blue-600 hover:underline">Revision of the agriculture production data domain</a>
                </div>
              </div>
            </div>

            {/* Suggested Reading */}
            <div>
              <h4 className="font-semibold text-orange-600 text-sm mb-2">Suggested Reading</h4>
              <div className="flex items-start">
                <FileText className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <a href="#" className="text-sm text-orange-600 hover:underline">Analytical brief</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};