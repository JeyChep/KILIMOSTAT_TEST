import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface County {
  type: string;
  properties: {
    ADM1_EN: string;
    ADM1_PCODE: string;
    [key: string]: any;
  };
  geometry: any;
}

interface CountyMapProps {
  selectedCounty?: string;
  onCountySelect?: (countyName: string) => void;
}

export default function CountyMap({ selectedCounty, onCountySelect }: CountyMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/ke_counties.geojson')
      .then(response => response.json())
      .then(data => {
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load county data');
        setLoading(false);
        console.error('Error loading GeoJSON:', err);
      });
  }, []);

  const style = (feature: any) => {
    const countyName = feature.properties.ADM1_EN;
    const isSelected = countyName === selectedCounty;

    return {
      fillColor: isSelected ? '#3b82f6' : '#10b981',
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#1e40af' : '#047857',
      fillOpacity: isSelected ? 0.7 : 0.4
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const countyName = feature.properties.ADM1_EN;

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          fillOpacity: 0.7
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        const isSelected = countyName === selectedCounty;
        layer.setStyle({
          weight: isSelected ? 3 : 1,
          fillOpacity: isSelected ? 0.7 : 0.4
        });
      },
      click: () => {
        if (onCountySelect) {
          onCountySelect(countyName);
        }
      }
    });

    layer.bindPopup(`<strong>${countyName}</strong>`);
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[0.0236, 37.9062]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={style}
            onEachFeature={onEachFeature}
            key={selectedCounty}
          />
        )}
      </MapContainer>
    </div>
  );
}
