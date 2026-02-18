import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { County } from '../services/countyService';

interface CountyMapProps {
  county: County;
}

const SELECTED_STYLE: L.PathOptions = {
  fillColor: '#16a34a',
  fillOpacity: 0.5,
  color: '#15803d',
  weight: 2,
};

const DEFAULT_STYLE: L.PathOptions = {
  fillColor: '#93c5fd',
  fillOpacity: 0.2,
  color: '#3b82f6',
  weight: 1,
};

function normalise(s: string) {
  return s.toLowerCase().trim();
}

export default function CountyMap({ county }: CountyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    fetch('/data/ke_county.geojson')
      .then(r => r.json())
      .then(geojson => {
        const layer = L.geoJSON(geojson, {
          style: (feature) => {
            const name = feature?.properties?.COUNTY ?? '';
            return normalise(name) === normalise(county.name)
              ? SELECTED_STYLE
              : DEFAULT_STYLE;
          },
          onEachFeature: (feature, lyr) => {
            const name = feature?.properties?.COUNTY ?? '';
            lyr.bindTooltip(name, { sticky: true });

            if (normalise(name) === normalise(county.name)) {
              lyr.bindPopup(`<strong>${name} County</strong>`, { closeButton: false });
            }
          },
        }).addTo(map);

        geoJsonRef.current = layer;

        const layers = Object.values((layer as any)._layers) as any[];
        const selected = layers.find(l =>
          normalise(l.feature?.properties?.COUNTY ?? '') === normalise(county.name)
        );

        if (selected) {
          map.fitBounds(selected.getBounds(), { padding: [40, 40] });
        } else {
          map.setView([0.0236, 37.9062], 6);
        }
      })
      .catch(() => {
        map.setView([0.0236, 37.9062], 6);
      });

    return () => {
      map.remove();
      mapRef.current = null;
      geoJsonRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!geoJsonRef.current || !mapRef.current) return;

    geoJsonRef.current.setStyle((feature) => {
      const name = feature?.properties?.COUNTY ?? '';
      return normalise(name) === normalise(county.name)
        ? SELECTED_STYLE
        : DEFAULT_STYLE;
    });

    const layers = Object.values((geoJsonRef.current as any)._layers) as any[];
    const selected = layers.find(l =>
      normalise(l.feature?.properties?.COUNTY ?? '') === normalise(county.name)
    );

    if (selected && mapRef.current) {
      mapRef.current.fitBounds(selected.getBounds(), { padding: [40, 40] });
    }
  }, [county]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md">
      <div ref={containerRef} className="w-full h-full min-h-[400px]" />
      <div className="absolute bottom-8 left-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-2 text-xs text-gray-700 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-4 h-3 rounded border border-green-700"
            style={{ background: '#16a34a', opacity: 0.7 }}
          />
          <span>{county.name} County</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-3 rounded border border-blue-400"
            style={{ background: '#93c5fd', opacity: 0.7 }}
          />
          <span>Other Counties</span>
        </div>
      </div>
    </div>
  );
}
