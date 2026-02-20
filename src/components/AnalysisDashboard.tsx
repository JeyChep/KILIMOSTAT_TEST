import React, { useState, useEffect, useMemo } from 'react';
import { Download, Loader2, TrendingUp, TrendingDown, Minus, BarChart2, Table2, ChevronRight } from 'lucide-react';
import { Domain, SubDomain, Element, KilimoDataRecord, apiService } from '../services/apiService';
import { County } from '../services/countyService';

interface AnalysisDashboardProps {
  county: County;
  domain: Domain;
}

interface SubdomainStats {
  subdomain: SubDomain;
  records: KilimoDataRecord[];
  elements: Element[];
  years: number[];
  byElement: Map<string, { name: string; values: Map<number, number> }>;
  byYear: Map<number, number>;
  itemCategories: Map<string, number>;
}

function parseVal(v: string) { return parseFloat(v) || 0; }
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default function AnalysisDashboard({ county, domain }: AnalysisDashboardProps) {
  const [subdomainStats, setSubdomainStats] = useState<SubdomainStats[]>([]);
  const [activeSubdomainIdx, setActiveSubdomainIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setActiveSubdomainIdx(0);

    async function load() {
      try {
        const subdomains = await apiService.getSubdomainsByDomain(domain.id);
        if (!subdomains.length || cancelled) { setLoading(false); return; }

        const allElements = await apiService.getElements();
        const allItems = await apiService.getItems();

        const statsArr: SubdomainStats[] = [];

        for (const sd of subdomains) {
          if (cancelled) return;

          const elements = allElements.filter(e => e.subdomain === sd.id);
          const elementIds = elements.map(e => e.id);

          const records = await apiService.getKilimoData({
            counties: [parseInt(county.id)],
            subdomain: sd.id,
          });

          const yearSet = new Set<number>();
          const byElement = new Map<string, { name: string; values: Map<number, number> }>();
          const byYear = new Map<number, number>();
          const itemCategories = new Map<string, number>();

          for (const rec of records) {
            const yr = parseInt(rec.refyear);
            const val = parseVal(rec.value);
            if (!yr || isNaN(yr)) continue;
            yearSet.add(yr);

            if (!byElement.has(rec.element)) {
              byElement.set(rec.element, { name: rec.element, values: new Map() });
            }
            const eEntry = byElement.get(rec.element)!;
            eEntry.values.set(yr, (eEntry.values.get(yr) || 0) + val);

            byYear.set(yr, (byYear.get(yr) || 0) + val);

            if (rec.item) {
              const matchingItem = allItems.find(it => it.name === rec.item);
              if (matchingItem) {
                const catId = matchingItem.itemcategory.toString();
                itemCategories.set(catId, (itemCategories.get(catId) || 0) + val);
              }
            }
          }

          const years = Array.from(yearSet).sort((a, b) => a - b);

          statsArr.push({ subdomain: sd, records, elements, years, byElement, byYear, itemCategories });
        }

        if (!cancelled) {
          setSubdomainStats(statsArr);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [county.id, domain.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading statistics for {county.name}…</p>
        </div>
      </div>
    );
  }

  if (!subdomainStats.length) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-1">No data available</p>
          <p className="text-sm text-gray-500">{county.name} — {domain.name}</p>
        </div>
      </div>
    );
  }

  const active = subdomainStats[activeSubdomainIdx];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{domain.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{county.name} County</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('charts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'charts' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <BarChart2 className="w-4 h-4" /> Charts
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Table2 className="w-4 h-4" /> Table
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {subdomainStats.map((sd, i) => (
            <button
              key={sd.subdomain.id}
              onClick={() => setActiveSubdomainIdx(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                i === activeSubdomainIdx
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sd.subdomain.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {active.records.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No records for {active.subdomain.name}</p>
          </div>
        ) : (
          viewMode === 'charts'
            ? <ChartsView stats={active} county={county} />
            : <TableView stats={active} county={county} />
        )}
      </div>
    </div>
  );
}

function ChartsView({ stats, county }: { stats: SubdomainStats; county: County }) {
  const { years, byYear, byElement, itemCategories, subdomain } = stats;

  const allYearVals = years.map(yr => byYear.get(yr) || 0);
  const totalAll = allYearVals.reduce((a, b) => a + b, 0);
  const latestYr = years[years.length - 1];
  const latestVal = byYear.get(latestYr) || 0;
  const prevYr = years[years.length - 2];
  const prevVal = prevYr ? (byYear.get(prevYr) || 0) : 0;
  const yoyChange = prevVal > 0 ? ((latestVal - prevVal) / prevVal) * 100 : 0;
  const peakYr = years.reduce((best, yr) => (byYear.get(yr) || 0) > (byYear.get(best) || 0) ? yr : best, years[0]);
  const peakVal = byYear.get(peakYr) || 0;
  const nonZeroYears = years.filter(yr => (byYear.get(yr) || 0) > 0);

  const elementEntries = Array.from(byElement.entries())
    .map(([name, data]) => {
      const total = Array.from(data.values.values()).reduce((a, b) => a + b, 0);
      return { name, total, latestVal: data.values.get(latestYr) || 0 };
    })
    .filter(e => e.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const recent10 = years.slice(-10);
  const recent10Vals = recent10.map(yr => byYear.get(yr) || 0);
  const maxRecent = Math.max(...recent10Vals, 1);

  const catEntries = Array.from(itemCategories.entries())
    .map(([id, val]) => ({ id, val }))
    .filter(e => e.val > 0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 6);
  const catTotal = catEntries.reduce((s, e) => s + e.val, 0);

  const COLORS = ['#0d9488', '#0891b2', '#2563eb', '#16a34a', '#d97706', '#dc2626', '#9333ea', '#db2777'];

  function exportCSV() {
    const header = ['Year', 'Total Value', ...elementEntries.map(e => `"${e.name}"`)].join(',');
    const rows = years.map(yr => {
      const totVal = byYear.get(yr) || 0;
      const elVals = elementEntries.map(e => byElement.get(e.name)?.values.get(yr) || 0);
      return [yr, totVal, ...elVals].join(',');
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${county.name}_${subdomain.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Latest Year Total"
          value={fmtNum(latestVal)}
          sub={`${latestYr}`}
          trend={yoyChange}
        />
        <StatCard
          label="Peak Value"
          value={fmtNum(peakVal)}
          sub={`${peakYr}`}
        />
        <StatCard
          label="Cumulative Total"
          value={fmtNum(totalAll)}
          sub={`${years[0]}–${years[years.length - 1]}`}
        />
        <StatCard
          label="Years with Data"
          value={`${nonZeroYears.length}`}
          sub={`out of ${years.length}`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ChartHeader title={`${subdomain.name} — Annual Trend`} sub={`${years[0]}–${latestYr} • ${county.name}`} onExport={exportCSV} />
          <div className="p-6">
            <AreaTrendChart years={years} values={allYearVals} color="#0d9488" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ChartHeader title="Last 10 Years — Bar Chart" sub={`${recent10[0] || ''}–${latestYr}`} onExport={exportCSV} />
          <div className="p-6">
            <BarChart years={recent10} values={recent10Vals} max={maxRecent} color="#0891b2" />
          </div>
        </div>
      </div>

      {elementEntries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ChartHeader
            title={`Elements Breakdown — ${latestYr}`}
            sub={`Top ${elementEntries.length} indicators for ${county.name}`}
            onExport={exportCSV}
          />
          <div className="p-6 space-y-3">
            {elementEntries.map((el, i) => {
              const pct = latestVal > 0 ? (el.latestVal / latestVal) * 100 : 0;
              return (
                <div key={el.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-800 font-medium truncate max-w-[240px]" title={el.name}>{el.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400 text-xs">{pct.toFixed(1)}%</span>
                      <span className="font-mono font-semibold text-gray-900 w-20 text-right">{fmtNum(el.latestVal)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {catEntries.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ChartHeader title="Item Categories Distribution" sub={`Cumulative share for ${county.name}`} onExport={exportCSV} />
          <div className="p-6">
            <div className="flex gap-8 items-start">
              <DonutChart segments={catEntries.map((e, i) => ({ label: `Cat ${e.id}`, value: e.val, color: COLORS[i % COLORS.length] }))} total={catTotal} />
              <div className="flex-1 space-y-2.5">
                {catEntries.map((e, i) => (
                  <div key={e.id}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm text-gray-700">Category {e.id}</span>
                      </div>
                      <span className="text-sm font-mono font-semibold text-gray-900">{fmtNum(e.val)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-full rounded-full" style={{ width: `${catTotal > 0 ? (e.val / catTotal) * 100 : 0}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableView({ stats, county }: { stats: SubdomainStats; county: County }) {
  const { years, byElement, byYear, subdomain } = stats;
  const displayYears = years.length > 15 ? years.filter((_, i) => i % Math.ceil(years.length / 15) === 0 || i === years.length - 1) : years;
  const elementEntries = Array.from(byElement.entries()).filter(([, d]) => Array.from(d.values.values()).some(v => v > 0));

  function exportCSV() {
    const header = ['Element', ...displayYears.map(String)].join(',');
    const rows = elementEntries.map(([name, data]) =>
      [`"${name}"`, ...displayYears.map(yr => data.values.get(yr) || 0)].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${county.name}_${subdomain.name}_table.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{subdomain.name} — Data Table</h3>
          <p className="text-sm text-gray-500">{county.name} County</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide border-r border-gray-200">Element</th>
              {displayYears.map(yr => (
                <th key={yr} className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{yr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elementEntries.map(([name, data], idx) => (
              <tr key={name} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-teal-50/20 transition-colors`}>
                <td className="sticky left-0 bg-inherit px-5 py-3 border-r border-gray-200 font-medium text-gray-900 text-sm max-w-[200px] truncate" title={name}>{name}</td>
                {displayYears.map(yr => {
                  const val = data.values.get(yr) || 0;
                  return (
                    <td key={yr} className="px-4 py-3 text-right font-mono text-gray-700 whitespace-nowrap">
                      {val > 0 ? fmtNum(val) : <span className="text-gray-300">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
              <td className="sticky left-0 bg-gray-50 px-5 py-3 border-r border-gray-200 text-gray-900 text-sm">Total</td>
              {displayYears.map(yr => (
                <td key={yr} className="px-4 py-3 text-right font-mono text-teal-700">
                  {fmtNum(byYear.get(yr) || 0)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, trend }: { label: string; value: string; sub: string; trend?: number }) {
  const TrendIcon = trend === undefined ? null : trend > 2 ? TrendingUp : trend < -2 ? TrendingDown : Minus;
  const trendColor = trend === undefined ? '' : trend > 2 ? 'text-green-600' : trend < -2 ? 'text-red-600' : 'text-gray-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{sub}</p>
        {TrendIcon && trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

function ChartHeader({ title, sub, onExport }: { title: string; sub: string; onExport: () => void }) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
      </div>
      <button onClick={onExport} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors shadow-sm">
        <Download className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AreaTrendChart({ years, values, color }: { years: number[]; values: number[]; color: string }) {
  if (!years.length || !values.some(v => v > 0)) return <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data</div>;

  const max = Math.max(...values, 1);
  const W = 100; const H = 60;
  const PAD = { top: 4, right: 2, bottom: 10, left: 10 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (years.length <= 1 ? iW / 2 : (i / (years.length - 1)) * iW);
  const toY = (v: number) => PAD.top + iH - (v / max) * iH;

  const pts = values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPts = `${toX(0)},${PAD.top + iH} ${pts} ${toX(values.length - 1)},${PAD.top + iH}`;

  const gridVals = [0, max * 0.5, max];
  const labelYears = years.length <= 8 ? years : [years[0], years[Math.floor(years.length / 2)], years[years.length - 1]];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`ag-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridVals.map((g, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={toY(g)} x2={W - PAD.right} y2={toY(g)} stroke="#e5e7eb" strokeWidth="0.3" />
          <text x={PAD.left - 1} y={toY(g) + 0.8} textAnchor="end" fontSize="2.5" fill="#9ca3af">{fmtNum(g)}</text>
        </g>
      ))}
      {labelYears.map(yr => {
        const i = years.indexOf(yr);
        return <text key={yr} x={toX(i)} y={H - 0.5} textAnchor="middle" fontSize="2.5" fill="#9ca3af">{yr}</text>;
      })}
      <polygon points={areaPts} fill={`url(#ag-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => v > 0 && <circle key={i} cx={toX(i)} cy={toY(v)} r="0.8" fill={color} />)}
    </svg>
  );
}

function BarChart({ years, values, max, color }: { years: number[]; values: number[]; max: number; color: string }) {
  if (!years.length) return <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data</div>;

  return (
    <div className="h-52 flex flex-col">
      <div className="flex-1 flex items-end gap-1 pb-6 relative">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 w-10 text-right pr-1">
          <span>{fmtNum(max)}</span>
          <span>{fmtNum(max / 2)}</span>
          <span>0</span>
        </div>
        <div className="flex-1 flex items-end gap-1 ml-10">
          {values.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
              <div
                className="w-full rounded-t transition-opacity hover:opacity-80 min-h-0"
                style={{ height: `${max > 0 ? (v / max) * 100 : 0}%`, backgroundColor: color, minHeight: v > 0 ? '3px' : '0' }}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-gray-400">
          <span>{years[0]}</span>
          {years.length > 2 && <span>{years[Math.floor(years.length / 2)]}</span>}
          <span>{years[years.length - 1]}</span>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const R = 36; const CX = 50; const CY = 50;
  let angle = -90;

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0">
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const sweep = pct * 360;
        const start = angle;
        const end = angle + sweep;
        const x1 = CX + R * Math.cos((start * Math.PI) / 180);
        const y1 = CY + R * Math.sin((start * Math.PI) / 180);
        const x2 = CX + R * Math.cos((end * Math.PI) / 180);
        const y2 = CY + R * Math.sin((end * Math.PI) / 180);
        angle = end;
        if (pct < 0.001) return null;
        return (
          <path
            key={i}
            d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2} Z`}
            fill={seg.color}
            stroke="white"
            strokeWidth="1"
          />
        );
      })}
      <circle cx={CX} cy={CY} r={R * 0.6} fill="white" />
      <text x={CX} y={CY - 2} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#111827">{fmtNum(total)}</text>
      <text x={CX} y={CY + 7} textAnchor="middle" fontSize="4" fill="#6b7280">Total</text>
    </svg>
  );
}
