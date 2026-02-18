import React, { useState, useEffect } from 'react';
import { Download, Menu, Loader2 } from 'lucide-react';
import { Domain } from '../services/apiService';
import { County } from '../services/countyService';
import { indicatorService, IndicatorData } from '../services/indicatorService';

interface AnalysisDashboardProps {
  county: County;
  domain: Domain;
}

export default function AnalysisDashboard({ county, domain }: AnalysisDashboardProps) {
  const [indicatorData, setIndicatorData] = useState<IndicatorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await indicatorService.getIndicatorDataForCountyAndDomain(county, domain);
      setIndicatorData(data);
      setLoading(false);
    }

    fetchData();
  }, [county.id, domain.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!indicatorData || indicatorData.years.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No data available for this selection</p>
          <p className="text-sm text-gray-500">{county.name} - {domain.name}</p>
        </div>
      </div>
    );
  }

  const comparison = indicatorService.getTwoElementComparison(indicatorData);
  const distribution = indicatorService.getLatestDistribution(indicatorData);
  const recentTrends = indicatorService.getRecentYears(indicatorData, 10);
  const longTermTrends = indicatorService.getRecentYears(indicatorData, 15);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-gray-400">{domain.code || '📊'}</span> {domain.name}
        </h1>
        <p className="text-gray-600">{county.name} County Analysis</p>
        <p className="text-sm text-gray-500 mt-1">
          {indicatorData.elements.length} indicators • {indicatorData.years.length} years of data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={`${domain.name} Trends`}
          subtitle={`${indicatorData.years[0]} - ${indicatorData.years[indicatorData.years.length - 1]}`}
          type="area"
          data={comparison.element1}
          data2={comparison.element2}
          years={comparison.years}
          label1={comparison.element1Name}
          label2={comparison.element2Name}
        />

        <ChartCard
          title={`${domain.name} Distribution`}
          subtitle={indicatorData.years[indicatorData.years.length - 1]?.toString() || 'Latest'}
          type="pie"
          value1={distribution.element1Value}
          value2={distribution.element2Value}
          label1={distribution.element1Name}
          label2={distribution.element2Name}
        />

        <ChartCard
          title="Recent Trends"
          subtitle="Last 10 years"
          type="bar"
          data={recentTrends.values}
          years={recentTrends.years}
        />

        <ChartCard
          title="Long-term Analysis"
          subtitle="15-year trend"
          type="line"
          data={longTermTrends.values}
          years={longTermTrends.years}
        />
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  type: 'area' | 'pie' | 'bar' | 'line';
  data?: number[];
  data2?: number[];
  years?: number[];
  label1?: string;
  label2?: string;
  value1?: number;
  value2?: number;
}

function ChartCard({
  title,
  subtitle,
  type,
  data = [],
  data2 = [],
  years = [],
  label1 = 'Primary Indicator',
  label2 = 'Secondary Indicator',
  value1 = 0,
  value2 = 0
}: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-teal-100 rounded-lg transition-colors bg-teal-500">
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {type === 'area' && <AreaChart data={data} data2={data2} years={years} label1={label1} label2={label2} />}
        {type === 'pie' && <PieChart value1={value1} value2={value2} label1={label1} label2={label2} />}
        {type === 'bar' && <BarChart data={data} years={years} />}
        {type === 'line' && <LineChart data={data} years={years} />}
      </div>
    </div>
  );
}

function AreaChart({
  data,
  data2,
  years,
  label1,
  label2
}: {
  data: number[];
  data2: number[];
  years: number[];
  label1: string;
  label2: string;
}) {
  if (data.length === 0 || years.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const max = Math.max(...data, ...(data2.length > 0 ? data2 : [0]));

  if (max === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data values to display</div>;
  }

  const points1 = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - (val / max) * 100}`).join(' ');
  const points2 = data2.length > 0
    ? data2.map((val, i) => `${(i / (data2.length - 1)) * 100},${100 - (val / max) * 100}`).join(' ')
    : '';

  return (
    <div className="relative h-64">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.1 }} />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>

        {points2 && <polygon points={`0,100 ${points2} 100,100`} fill="url(#gradient2)" />}
        <polygon points={`0,100 ${points1} 100,100`} fill="url(#gradient1)" />

        <polyline points={points1} fill="none" stroke="#3b82f6" strokeWidth="0.5" />
        {points2 && <polyline points={points2} fill="none" stroke="#ef4444" strokeWidth="0.5" />}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-gray-500">
        <span>{years[0]}</span>
        {years.length > 1 && <span>{years[Math.floor(years.length / 2)]}</span>}
        {years.length > 1 && <span>{years[years.length - 1]}</span>}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-700 text-xs">{label1}</span>
        </div>
        {data2.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-700 text-xs">{label2}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PieChart({
  value1,
  value2,
  label1,
  label2
}: {
  value1: number;
  value2: number;
  label1: string;
  label2: string;
}) {
  const total = value1 + value2;

  if (total === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const percentage1 = (value1 / total) * 100;
  const percentage2 = (value2 / total) * 100;

  const segments = [
    { value: percentage1, label: label1, color: '#3b82f6', rawValue: value1 },
    { value: percentage2, label: label2, color: '#ef4444', rawValue: value2 }
  ];

  let currentAngle = -90;
  const radius = 40;
  const centerX = 50;
  const centerY = 50;

  return (
    <div className="relative h-64 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-64 h-64">
        {segments.map((segment, index) => {
          const angle = (segment.value / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
          const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
          const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
          const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

          const largeArc = angle > 180 ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
            'Z'
          ].join(' ');

          currentAngle += angle;

          return (
            <path
              key={index}
              d={pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: segment.color }}></div>
            <div>
              <div className="font-medium text-gray-700 text-xs truncate max-w-[120px]" title={segment.label}>
                {segment.label}
              </div>
              <div className="text-xs text-gray-500">{segment.value.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, years }: { data: number[], years: number[] }) {
  if (data.length === 0 || years.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const max = Math.max(...data);

  if (max === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data values to display</div>;
  }

  return (
    <div className="relative h-64">
      <div className="h-full flex items-end justify-around gap-1 px-4">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t transition-all hover:opacity-80"
              style={{ height: `${max > 0 ? (value / max) * 100 : 0}%`, minHeight: value > 0 ? '2px' : '0' }}
            ></div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between px-2 text-xs text-gray-500">
        <span>{years[0]}</span>
        {years.length > 1 && <span>{years[Math.floor(years.length / 2)]}</span>}
        {years.length > 1 && <span>{years[years.length - 1]}</span>}
      </div>
    </div>
  );
}

function LineChart({ data, years }: { data: number[], years: number[] }) {
  if (data.length === 0 || years.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const max = Math.max(...data);

  if (max === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data values to display</div>;
  }

  const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - (val / max) * 100}`).join(' ');

  return (
    <div className="relative h-64">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((val, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (val / max) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1"
              fill="#8b5cf6"
              className="hover:r-2 transition-all"
            />
          );
        })}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-gray-500">
        <span>{years[0]}</span>
        {years.length > 1 && <span>{years[Math.floor(years.length / 2)]}</span>}
        {years.length > 1 && <span>{years[years.length - 1]}</span>}
      </div>
    </div>
  );
}
