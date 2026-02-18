import React from 'react';
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { County } from '../services/countyService';

interface CountyMapProps {
  county: County;
}

export default function CountyMap({ county }: CountyMapProps) {
  const [lat, lng] = county.coordinates || [0, 37];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div
            className="absolute inset-0 bg-blue-200 opacity-30 blur-3xl rounded-full"
            style={{
              width: '400px',
              height: '400px',
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%'
            }}
          />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500 rounded-full shadow-lg mb-4 animate-pulse">
              <MapPin className="w-12 h-12 text-white" fill="white" />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{county.name} County</h3>
              <div className="text-sm text-gray-500 space-y-1">
                <p>County Code: <span className="font-medium text-gray-700">{county.code}</span></p>
                <p>Coordinates: <span className="font-medium text-gray-700">{lat.toFixed(4)}°, {lng.toFixed(4)}°</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors">
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors">
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors">
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs text-gray-600">
          <p className="font-medium">Kenya County Map</p>
          <p className="text-gray-500">Interactive visualization</p>
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
