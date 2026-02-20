import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Plus, BarChart2, Table2, TrendingUp, Download,
  ChevronDown, Loader2, RefreshCw, Layers, Tag
} from 'lucide-react';
import { apiService, Domain, SubDomain, ItemCategory, KilimoDataRecord } from '../services/apiService';
import { countyService, County } from '../services/countyService';

const PALETTE = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed'];

interface CountySeriesData {
  county: County;
  values: number[];
  color: string;
}

type ViewMode = 'line' | 'bar' | 'table';

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default function CompareData() {
  const [allCounties, setAllCounties] = useState<County[]>([]);
  const [allDomains, setAllDomains] = useState<Domain[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<County[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  const [subdomains, setSubdomains] = useState<SubDomain[]>([]);
  const [selectedSubdomain, setSelectedSubdomain] = useState<SubDomain | null>(null);
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);

  const [yearFrom, setYearFrom] = useState(2010);
  const [yearTo, setYearTo] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('line');
  const [seriesData, setSeriesData] = useState<CountySeriesData[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingSubdomains, setLoadingSubdomains] = useState(false);
  const [countySearch, setCountySearch] = useState('');
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeta() {
      setLoadingMeta(true);
      try {
        await countyService.loadCounties();
        const grouped = countyService.getCountiesByLetter();
        const flat: County[] = [];
        grouped.forEach(arr => flat.push(...arr));
        flat.sort((a, b) => a.name.localeCompare(b.name));
        setAllCounties(flat);
        const domains = await apiService.getDomains();
        setAllDomains(domains);
      } catch {
        setError('Failed to load counties or domains.');
      } finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (!selectedDomain) {
      setSubdomains([]);
      setSelectedSubdomain(null);
      setItemCategories([]);
      setSelectedCategory(null);
      return;
    }
    let cancelled = false;
    setLoadingSubdomains(true);
    setSubdomains([]);
    setSelectedSubdomain(null);
    setItemCategories([]);
    setSelectedCategory(null);

    apiService.getSubdomainsByDomain(selectedDomain.id).then(async sds => {
      if (cancelled) return;
      setSubdomains(sds);
      if (sds.length) {
        setSelectedSubdomain(sds[0]);
        const cats = await apiService.getItemCategoriesBySubdomain(sds[0].id);
        if (!cancelled) setItemCategories(cats);
      }
    }).finally(() => { if (!cancelled) setLoadingSubdomains(false); });

    return () => { cancelled = true; };
  }, [selectedDomain]);

  useEffect(() => {
    if (!selectedSubdomain) { setItemCategories([]); setSelectedCategory(null); return; }
    let cancelled = false;
    apiService.getItemCategoriesBySubdomain(selectedSubdomain.id).then(cats => {
      if (!cancelled) { setItemCategories(cats); setSelectedCategory(null); }
    });
    return () => { cancelled = true; };
  }, [selectedSubdomain]);

  const fetchComparison = useCallback(async () => {
    if (!selectedDomain || selectedCounties.length === 0 || !selectedSubdomain) return;
    setLoading(true);
    setError(null);
    try {
      const yearRange = Array.from({ length: yearTo - yearFrom + 1 }, (_, i) => yearFrom + i);
      setYears(yearRange);

      const countyIds = selectedCounties.map(c => parseInt(c.id)).filter(n => !isNaN(n));
      const records: KilimoDataRecord[] = await apiService.getKilimoData({
        counties: countyIds,
        years: yearRange,
        subdomain: selectedSubdomain.id,
      });

      let filteredRecords = records;
      if (selectedCategory) {
        const allItems = await apiService.getItems();
        const catItemNames = new Set(allItems.filter(it => it.itemcategory === selectedCategory.id).map(it => it.name));
        filteredRecords = records.filter(r => catItemNames.has(r.item));
      }

      const aggregated = new Map<string, Map<number, number>>();
      for (const c of selectedCounties) aggregated.set(c.name.toLowerCase(), new Map());

      for (const rec of filteredRecords) {
        const key = rec.county.toLowerCase();
        if (!aggregated.has(key)) continue;
        const yr = parseInt(rec.refyear);
        const val = parseFloat(rec.value) || 0;
        const yearMap = aggregated.get(key)!;
        yearMap.set(yr, (yearMap.get(yr) || 0) + val);
      }

      const series: CountySeriesData[] = selectedCounties.map((county, idx) => ({
        county,
        color: PALETTE[idx % PALETTE.length],
        values: yearRange.map(yr => aggregated.get(county.name.toLowerCase())?.get(yr) || 0),
      }));
      setSeriesData(series);
    } catch {
      setError('Failed to load comparison data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, selectedSubdomain, selectedCategory, selectedCounties, yearFrom, yearTo]);

  function addCounty(county: County) {
    if (selectedCounties.find(c => c.id === county.id)) return;
    if (selectedCounties.length >= 5) return;
    setSelectedCounties(prev => [...prev, county]);
    setCountySearch('');
    setShowCountyDropdown(false);
  }

  function removeCounty(id: string) {
    setSelectedCounties(prev => prev.filter(c => c.id !== id));
  }

  const filteredCounties = allCounties.filter(
    c => c.name.toLowerCase().includes(countySearch.toLowerCase()) && !selectedCounties.find(s => s.id === c.id)
  );
  const filteredDomains = allDomains.filter(d => d.name.toLowerCase().includes(domainSearch.toLowerCase()));
  const canFetch = selectedCounties.length > 0 && selectedDomain !== null && selectedSubdomain !== null;
  const hasData = seriesData.length > 0 && years.length > 0;
  const allMax = hasData ? Math.max(...seriesData.flatMap(s => s.values), 1) : 1;
  const latestValues = hasData ? seriesData.map(s => ({ county: s.county, value: s.values[s.values.length - 1] || 0, color: s.color })) : [];
  const barMax = Math.max(...latestValues.map(v => v.value), 1);
  const yearOptions = Array.from({ length: 35 }, (_, i) => 1990 + i);

  const activeLabel = [
    selectedDomain?.name,
    selectedSubdomain?.name,
    selectedCategory ? `(${selectedCategory.name})` : null,
  ].filter(Boolean).join(' › ');

  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Data</h1>
          <p className="text-gray-600">Compare agricultural indicators across counties at subdomain and item category level.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Configure Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Counties <span className="text-gray-400 font-normal">(up to 5)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedCounties.map((county, idx) => (
                  <span key={county.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}>
                    {county.name}
                    <button onClick={() => removeCounty(county.id)} className="ml-1 hover:opacity-75"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 cursor-text focus-within:ring-2 focus-within:ring-blue-500" onClick={() => setShowCountyDropdown(true)}>
                  <Plus className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={selectedCounties.length >= 5 ? 'Max 5 counties' : 'Add a county…'}
                    value={countySearch}
                    onChange={e => { setCountySearch(e.target.value); setShowCountyDropdown(true); }}
                    onFocus={() => setShowCountyDropdown(true)}
                    disabled={selectedCounties.length >= 5}
                    className="outline-none flex-1 text-sm bg-transparent disabled:text-gray-400"
                  />
                </div>
                {showCountyDropdown && filteredCounties.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCounties.slice(0, 20).map(county => (
                      <button key={county.id} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors" onMouseDown={() => addCounty(county)}>
                        {county.name}
                      </button>
                    ))}
                  </div>
                )}
                {showCountyDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowCountyDropdown(false)} />}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <div className="relative">
                <button
                  className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
                  onClick={() => setShowDomainDropdown(!showDomainDropdown)}
                >
                  <span className={selectedDomain ? 'text-gray-900 truncate' : 'text-gray-400'}>{selectedDomain ? selectedDomain.name : 'Select domain…'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-1" />
                </button>
                {showDomainDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                      <input type="text" placeholder="Search domains…" value={domainSearch} onChange={e => setDomainSearch(e.target.value)} className="w-full text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500" autoFocus />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredDomains.map(domain => (
                        <button key={domain.id} className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${selectedDomain?.id === domain.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`} onMouseDown={() => { setSelectedDomain(domain); setShowDomainDropdown(false); setDomainSearch(''); }}>
                          {domain.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {showDomainDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowDomainDropdown(false)} />}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Range</label>
              <div className="flex items-center gap-2">
                <select value={yearFrom} onChange={e => setYearFrom(parseInt(e.target.value))} className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  {yearOptions.map(y => <option key={y} value={y} disabled={y > yearTo}>{y}</option>)}
                </select>
                <span className="text-gray-400 text-sm">–</span>
                <select value={yearTo} onChange={e => setYearTo(parseInt(e.target.value))} className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  {yearOptions.map(y => <option key={y} value={y} disabled={y < yearFrom}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {selectedDomain && (
            <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-gray-400" /> Subdomain
                  {loadingSubdomains && <Loader2 className="w-3 h-3 animate-spin text-gray-400 ml-1" />}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {subdomains.map(sd => (
                    <button key={sd.id} onClick={() => setSelectedSubdomain(sd)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSubdomain?.id === sd.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {sd.name}
                    </button>
                  ))}
                  {!loadingSubdomains && subdomains.length === 0 && <span className="text-sm text-gray-400">No subdomains found</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-gray-400" /> Item Category
                  <span className="text-gray-400 font-normal text-xs">(optional filter)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!selectedCategory ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    All
                  </button>
                  {itemCategories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedCategory?.id === cat.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {canFetch
                ? `Comparing ${selectedCounties.length} ${selectedCounties.length === 1 ? 'county' : 'counties'} • ${activeLabel} • ${yearFrom}–${yearTo}`
                : 'Select at least one county, a domain, and a subdomain to compare'}
            </div>
            <button
              onClick={fetchComparison}
              disabled={!canFetch || loading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Loading…' : 'Compare'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
        )}

        {hasData && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{activeLabel}</h2>
                <p className="text-sm text-gray-500">{yearFrom}–{yearTo}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                  <ViewButton active={viewMode === 'line'} onClick={() => setViewMode('line')} icon={TrendingUp} label="Trend" />
                  <ViewButton active={viewMode === 'bar'} onClick={() => setViewMode('bar')} icon={BarChart2} label="Bar" />
                  <ViewButton active={viewMode === 'table'} onClick={() => setViewMode('table')} icon={Table2} label="Table" />
                </div>
                <button
                  onClick={() => doExportCSV(seriesData, years, selectedDomain, selectedSubdomain, selectedCategory)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            {viewMode === 'line' && <LineCompareChart series={seriesData} years={years} label={activeLabel} allMax={allMax} />}
            {viewMode === 'bar' && <BarCompareChart latestValues={latestValues} barMax={barMax} label={activeLabel} latestYear={years[years.length - 1]} />}
            {viewMode === 'table' && <TableView series={seriesData} years={years} label={activeLabel} />}

            <SummaryCards series={seriesData} years={years} />
          </div>
        )}

        {!hasData && !loading && canFetch && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
            <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-1">Ready to compare</p>
            <p className="text-gray-400 text-sm">Click "Compare" to load data for your selection</p>
          </div>
        )}

        {!hasData && !loading && !canFetch && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
            <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-1">Set up your comparison</p>
            <p className="text-gray-400 text-sm">Choose counties, a domain, and a subdomain above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Icon className="w-4 h-4" />{label}
    </button>
  );
}

function LineCompareChart({ series, years, label, allMax }: { series: CountySeriesData[]; years: number[]; label: string; allMax: number }) {
  if (!series.length || !years.length) return null;
  const W = 100; const H = 80;
  const PAD = { top: 5, right: 2, bottom: 12, left: 10 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const toX = (i: number) => PAD.left + (years.length <= 1 ? innerW / 2 : (i / (years.length - 1)) * innerW);
  const toY = (v: number) => PAD.top + innerH - (allMax === 0 ? 0 : (v / allMax) * innerH);
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => allMax * f);
  const labelYears = years.length <= 10 ? years : years.filter((_, i) => i === 0 || i === years.length - 1 || i % Math.ceil(years.length / 5) === 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{label} — Trend Over Time</h3>
        <p className="text-sm text-gray-500">{years[0]} – {years[years.length - 1]}</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-4">
        {series.map(s => (
          <div key={s.county.id} className="flex items-center gap-2">
            <div className="w-6 h-1 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-gray-700">{s.county.name}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '320px' }} preserveAspectRatio="none">
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={toY(g)} x2={W - PAD.right} y2={toY(g)} stroke="#e5e7eb" strokeWidth="0.3" />
            <text x={PAD.left - 1} y={toY(g) + 0.8} textAnchor="end" fontSize="2.5" fill="#9ca3af">{fmtNum(g)}</text>
          </g>
        ))}
        {labelYears.map(yr => {
          const i = years.indexOf(yr);
          return <text key={yr} x={toX(i)} y={H - 1} textAnchor="middle" fontSize="2.5" fill="#9ca3af">{yr}</text>;
        })}
        {series.map(s => {
          const pts = s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
          const areaBottom = toY(0);
          const areaPts = `${toX(0)},${areaBottom} ${s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')} ${toX(s.values.length - 1)},${areaBottom}`;
          return (
            <g key={s.county.id}>
              <polygon points={areaPts} fill={s.color} opacity="0.07" />
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map((v, i) => v > 0 && <circle key={i} cx={toX(i)} cy={toY(v)} r="0.9" fill={s.color} />)}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BarCompareChart({ latestValues, barMax, label, latestYear }: { latestValues: { county: County; value: number; color: string }[]; barMax: number; label: string; latestYear: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{label} — County Comparison</h3>
        <p className="text-sm text-gray-500">Latest year: {latestYear}</p>
      </div>
      <div className="space-y-4">
        {latestValues.slice().sort((a, b) => b.value - a.value).map(({ county, value, color }) => (
          <div key={county.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800">{county.name}</span>
              <span className="text-sm text-gray-600 font-mono">{fmtNum(value)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barMax > 0 ? (value / barMax) * 100 : 0}%`, backgroundColor: color, minWidth: value > 0 ? '4px' : '0' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableView({ series, years, label }: { series: CountySeriesData[]; years: number[]; label: string }) {
  const displayYears = years.length > 20 ? years.filter((_, i) => i % Math.ceil(years.length / 20) === 0 || i === years.length - 1) : years;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{label} — Data Table</h3>
        <p className="text-sm text-gray-500">Values aggregated by county and year</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">County</th>
              {displayYears.map(yr => <th key={yr} className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">{yr}</th>)}
            </tr>
          </thead>
          <tbody>
            {series.map((s, idx) => (
              <tr key={s.county.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="sticky left-0 bg-inherit px-6 py-3 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="font-medium text-gray-800">{s.county.name}</span>
                  </div>
                </td>
                {displayYears.map(yr => {
                  const i = years.indexOf(yr);
                  const val = i >= 0 ? s.values[i] : 0;
                  return (
                    <td key={yr} className="px-4 py-3 text-right font-mono text-gray-700 whitespace-nowrap">
                      {val > 0 ? fmtNum(val) : <span className="text-gray-300">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCards({ series, years }: { series: CountySeriesData[]; years: number[] }) {
  if (!series.length || !years.length) return null;
  const cards = series.map(s => {
    const nonZero = s.values.filter(v => v > 0);
    const latest = s.values[s.values.length - 1] || 0;
    const earliest = s.values.find(v => v > 0) || 0;
    const avg = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
    const max = nonZero.length > 0 ? Math.max(...nonZero) : 0;
    const trend = earliest > 0 ? ((latest - earliest) / earliest) * 100 : 0;
    return { county: s.county, color: s.color, latest, avg, max, trend, nonZero: nonZero.length };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map(card => (
        <div key={card.county.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: card.color }} />
            <h4 className="font-semibold text-gray-900 text-sm truncate">{card.county.name}</h4>
          </div>
          <div className="space-y-2">
            <Stat label="Latest value" value={fmtNum(card.latest)} />
            <Stat label="Average" value={fmtNum(Math.round(card.avg))} />
            <Stat label="Peak" value={fmtNum(card.max)} />
            <Stat label="Overall trend" value={card.trend !== 0 ? `${card.trend > 0 ? '+' : ''}${card.trend.toFixed(1)}%` : '—'} valueClass={card.trend > 0 ? 'text-green-600' : card.trend < 0 ? 'text-red-600' : 'text-gray-500'} />
            <Stat label="Data points" value={`${card.nonZero} yrs`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, valueClass = 'text-gray-900' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function doExportCSV(series: CountySeriesData[], years: number[], domain: Domain | null, subdomain: SubDomain | null, category: ItemCategory | null) {
  const header = ['County', ...years.map(String)].join(',');
  const rows = series.map(s => [`"${s.county.name}"`, ...s.values.map(String)].join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compare_${subdomain?.name ?? domain?.name ?? 'data'}${category ? '_' + category.name : ''}_${years[0]}_${years[years.length - 1]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
