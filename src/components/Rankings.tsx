import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BarChart2,
  Table2,
} from 'lucide-react';
import { apiService, KilimoDataRecord, Item, ItemCategory } from '../services/apiService';

const TEAL = '#0d9488';

interface RankingRow {
  rank: number;
  county: string;
  item: string;
  year: string;
  value: number;
  unit: string;
  flag: string;
}

type SortKey = 'rank' | 'county' | 'value' | 'year';
type SortDir = 'asc' | 'desc';

type SidebarCategory = {
  id: string;
  label: string;
  children: { id: string; label: string }[];
};

const SIDEBAR_CATEGORIES: SidebarCategory[] = [
  {
    id: 'crops',
    label: 'Crop Production',
    children: [
      { id: 'crops_counties_by_commodity', label: 'Counties by commodity' },
      { id: 'crops_commodities_by_county', label: 'Commodities by county' },
    ],
  },
  {
    id: 'livestock',
    label: 'Livestock Production',
    children: [
      { id: 'livestock_counties_by_commodity', label: 'Counties by commodity' },
      { id: 'livestock_commodities_by_county', label: 'Commodities by county' },
    ],
  },
];

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function Rankings() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allCategories, setAllCategories] = useState<ItemCategory[]>([]);
  const [allRecords, setAllRecords] = useState<KilimoDataRecord[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const [activeSection, setActiveSection] = useState('crops_counties_by_commodity');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['crops', 'livestock']));
  const [sidebarSearch, setSidebarSearch] = useState('');

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1);
  const [topN, setTopN] = useState<10 | 20 | 47>(10);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const [tableSearch, setTableSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const yearOptions = useMemo(() => Array.from({ length: 30 }, (_, i) => 2024 - i), []);

  useEffect(() => {
    async function load() {
      setLoadingMeta(true);
      try {
        const [items, categories] = await Promise.all([
          apiService.getItems(),
          apiService.getItemCategories(),
        ]);
        setAllItems(items);
        setAllCategories(categories);
        if (items.length > 0) setSelectedItem(items[0]);
      } catch {
      } finally {
        setLoadingMeta(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    let cancelled = false;

    async function fetchData() {
      setLoadingData(true);
      setAllRecords([]);
      try {
        const records = await apiService.getKilimoData({
          items: [selectedItem!.id],
          years: [selectedYear],
        });
        if (!cancelled) setAllRecords(records);
      } catch {
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [selectedItem, selectedYear]);

  const isCommodityMode = activeSection.endsWith('_commodities_by_county');

  const rankings = useMemo((): RankingRow[] => {
    if (allRecords.length === 0) return [];

    const aggregated = new Map<string, { value: number; unit: string; flag: string; item: string }>();

    for (const rec of allRecords) {
      const key = isCommodityMode ? rec.item : rec.county;
      const val = parseFloat(rec.value) || 0;
      const existing = aggregated.get(key);
      if (existing) {
        existing.value += val;
      } else {
        aggregated.set(key, { value: val, unit: rec.unit, flag: rec.flag, item: rec.item });
      }
    }

    const sorted = Array.from(aggregated.entries())
      .sort((a, b) => b[1].value - a[1].value);

    return sorted.map(([key, data], i) => ({
      rank: i + 1,
      county: isCommodityMode ? selectedItem?.name || '' : key,
      item: isCommodityMode ? key : selectedItem?.name || '',
      year: selectedYear.toString(),
      value: data.value,
      unit: data.unit,
      flag: data.flag,
    }));
  }, [allRecords, isCommodityMode, selectedItem, selectedYear]);

  const topRankings = useMemo(() => rankings.slice(0, topN), [rankings, topN]);

  const sortedFiltered = useMemo(() => {
    let rows = topRankings.filter(r => {
      const q = tableSearch.toLowerCase();
      return (
        r.county.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q)
      );
    });
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'rank') cmp = a.rank - b.rank;
      else if (sortKey === 'county') cmp = (isCommodityMode ? a.item : a.county).localeCompare(isCommodityMode ? b.item : b.county);
      else if (sortKey === 'value') cmp = a.value - b.value;
      else if (sortKey === 'year') cmp = a.year.localeCompare(b.year);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [topRankings, tableSearch, sortKey, sortDir, isCommodityMode]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const barMax = topRankings.length > 0 ? Math.max(...topRankings.map(r => r.value), 1) : 1;

  function toggleCategory(id: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exportCSV() {
    const header = ['Rank', isCommodityMode ? 'Commodity' : 'County', 'Item', 'Year', 'Value', 'Unit'].join(',');
    const rows = topRankings.map(r =>
      [r.rank, `"${isCommodityMode ? r.item : r.county}"`, `"${r.item}"`, r.year, r.value, `"${r.unit}"`].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rankings_${selectedItem?.name ?? 'data'}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const itemSearch = useState('')[0];
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const filteredItems = useMemo(() => {
    const q = itemSearchQuery.toLowerCase();
    if (!q) return allItems.slice(0, 50);
    return allItems.filter(i => i.name.toLowerCase().includes(q)).slice(0, 50);
  }, [allItems, itemSearchQuery]);

  const chartTitle = isCommodityMode
    ? `Top ${topN} Commodities — ${selectedYear}`
    : `Top ${topN} Counties — ${selectedItem?.name ?? ''} — ${selectedYear}`;

  const unit = topRankings[0]?.unit || '';

  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a Ranking"
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {SIDEBAR_CATEGORIES.map(cat => {
            const visibleChildren = cat.children.filter(c =>
              !sidebarSearch || c.label.toLowerCase().includes(sidebarSearch.toLowerCase())
            );
            if (sidebarSearch && visibleChildren.length === 0) return null;

            const expanded = expandedCategories.has(cat.id);

            return (
              <div key={cat.id} className="mb-1">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(cat.id)}
                >
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  {cat.label}
                </button>

                {(expanded || sidebarSearch) && (
                  <div className="ml-2">
                    {visibleChildren.map(child => (
                      <button
                        key={child.id}
                        className={`w-full text-left px-8 py-1.5 text-sm transition-colors rounded-md ${
                          activeSection === child.id
                            ? 'bg-teal-50 text-teal-700 font-medium border-l-2 border-teal-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveSection(child.id)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Rankings</h1>
            <p className="text-sm text-gray-500">
              {isCommodityMode ? 'Compare commodities by production across counties' : 'Rank counties by commodity production output'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Item / Commodity</label>
                <div className="relative">
                  <button
                    className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    onClick={() => setShowItemDropdown(!showItemDropdown)}
                  >
                    <span className={selectedItem ? 'text-gray-900 truncate' : 'text-gray-400'}>
                      {selectedItem?.name ?? 'Select item...'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </button>

                  {showItemDropdown && (
                    <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={itemSearchQuery}
                          onChange={e => setItemSearchQuery(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-teal-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {filteredItems.map(item => (
                          <button
                            key={item.id}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                              selectedItem?.id === item.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'
                            }`}
                            onMouseDown={() => {
                              setSelectedItem(item);
                              setShowItemDropdown(false);
                              setItemSearchQuery('');
                            }}
                          >
                            {item.name}
                          </button>
                        ))}
                        {filteredItems.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-400 text-center">No items found</div>
                        )}
                      </div>
                    </div>
                  )}
                  {showItemDropdown && <div className="fixed inset-0 z-20" onClick={() => setShowItemDropdown(false)} />}
                </div>
              </div>

              <div className="min-w-[120px]">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[100px]">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Show Top</label>
                <select
                  value={topN}
                  onChange={e => setTopN(parseInt(e.target.value) as 10 | 20 | 47)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                  <option value={47}>All 47</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'chart' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <BarChart2 className="w-4 h-4" />
                  Chart
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Table2 className="w-4 h-4" />
                  Table
                </button>
              </div>
            </div>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading ranking data...</p>
              </div>
            </div>
          ) : topRankings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
              <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No data found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try selecting a different item or year
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {viewMode === 'chart' && (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <RankingBarChart
                      title={chartTitle}
                      subtitle={`${selectedYear} • ${unit}`}
                      rows={topRankings.slice(0, 10)}
                      barMax={barMax}
                      isCommodityMode={isCommodityMode}
                      onExport={exportCSV}
                    />
                    <TopNSummaryChart
                      title={`Distribution — ${selectedItem?.name ?? ''}`}
                      subtitle={`${selectedYear}`}
                      rows={topRankings.slice(0, 10)}
                      isCommodityMode={isCommodityMode}
                      onExport={exportCSV}
                    />
                  </div>

                  {topN > 10 && (
                    <RankingFullTable
                      title={`Full Top ${topN} — ${selectedItem?.name ?? ''}`}
                      subtitle={selectedYear.toString()}
                      rows={topRankings}
                      isCommodityMode={isCommodityMode}
                      onExport={exportCSV}
                    />
                  )}
                </>
              )}

              {viewMode === 'table' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
                      <p className="text-sm text-gray-500">{selectedYear} • {unit}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={tableSearch}
                          onChange={e => setTableSearch(e.target.value)}
                          className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 w-40"
                        />
                      </div>
                      <button
                        onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        CSV
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <SortTh label="Rank" sortKey="rank" current={sortKey} dir={sortDir} onSort={handleSort} />
                          <SortTh
                            label={isCommodityMode ? 'Commodity' : 'County'}
                            sortKey="county"
                            current={sortKey}
                            dir={sortDir}
                            onSort={handleSort}
                          />
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Item</th>
                          <SortTh label="Year" sortKey="year" current={sortKey} dir={sortDir} onSort={handleSort} />
                          <SortTh label="Value" sortKey="value" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Unit</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Flag</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedFiltered.map((row, idx) => (
                          <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-teal-50/30 transition-colors`}>
                            <td className="px-4 py-3">
                              <RankBadge rank={row.rank} />
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {isCommodityMode ? row.item : row.county}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{row.item}</td>
                            <td className="px-4 py-3 text-gray-600">{row.year}</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                              {formatNum(row.value)}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{row.unit}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{row.flag || '—'}</td>
                          </tr>
                        ))}
                        {sortedFiltered.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No results match your search</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">{rank}</span>;
  if (rank === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold text-xs">{rank}</span>;
  if (rank === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-xs">{rank}</span>;
  return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 text-gray-500 font-medium text-xs">{rank}</span>;
}

function SortTh({
  label, sortKey, current, dir, onSort, align
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: 'right';
}) {
  const active = current === sortKey;
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1 w-full justify-start">
        {label}
        {active ? (
          dir === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />
        ) : (
          <ArrowUpDown className="w-3 h-3 text-gray-300" />
        )}
      </span>
    </th>
  );
}

function RankingBarChart({
  title, subtitle, rows, barMax, isCommodityMode, onExport
}: {
  title: string;
  subtitle: string;
  rows: RankingRow[];
  barMax: number;
  isCommodityMode: boolean;
  onExport: () => void;
}) {
  if (rows.length === 0) return null;

  const W = 100;
  const H = 90;
  const PAD = { top: 8, right: 4, bottom: 28, left: 14 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const barW = innerW / rows.length;
  const barPad = barW * 0.25;

  const gridVals = [0, 0.5, 1].map(f => barMax * f);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 flex items-start justify-between gap-2 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={onExport}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 pt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 280 }} preserveAspectRatio="none">
          {gridVals.map((g, i) => {
            const y = PAD.top + innerH - (g / barMax) * innerH;
            return (
              <g key={i}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="0.3" />
                <text x={PAD.left - 1} y={y + 0.8} textAnchor="end" fontSize="2.5" fill="#9ca3af">
                  {formatNum(g)}
                </text>
              </g>
            );
          })}

          {rows.map((row, i) => {
            const x = PAD.left + i * barW + barPad / 2;
            const bw = barW - barPad;
            const bh = barMax > 0 ? (row.value / barMax) * innerH : 0;
            const y = PAD.top + innerH - bh;
            const label = isCommodityMode ? row.item : row.county;

            return (
              <g key={i}>
                <rect x={x} y={y} width={bw} height={bh} fill={TEAL} rx="0.5" opacity={0.85} />
                <text
                  x={x + bw / 2}
                  y={H - PAD.bottom + 3}
                  textAnchor="middle"
                  fontSize="1.8"
                  fill="#6b7280"
                  transform={`rotate(-40, ${x + bw / 2}, ${H - PAD.bottom + 3})`}
                >
                  {label.length > 12 ? label.slice(0, 11) + '…' : label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: TEAL }} />
          <span>{rows[0]?.item || ''}</span>
        </div>
      </div>
    </div>
  );
}

function TopNSummaryChart({
  title, subtitle, rows, isCommodityMode, onExport
}: {
  title: string;
  subtitle: string;
  rows: RankingRow[];
  isCommodityMode: boolean;
  onExport: () => void;
}) {
  if (rows.length === 0) return null;

  const total = rows.reduce((s, r) => s + r.value, 0);
  const COLORS = [
    '#0d9488', '#0891b2', '#2563eb', '#16a34a', '#d97706',
    '#dc2626', '#9333ea', '#db2777', '#65a30d', '#ca8a04'
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 flex items-start justify-between gap-2 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={onExport}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="space-y-2.5">
          {rows.map((row, i) => {
            const pct = total > 0 ? (row.value / total) * 100 : 0;
            const label = isCommodityMode ? row.item : row.county;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-800 font-medium truncate max-w-[180px]" title={label}>{label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{pct.toFixed(1)}%</span>
                    <span className="font-mono font-semibold text-gray-900 text-xs w-16 text-right">{formatNum(row.value)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RankingFullTable({
  title, subtitle, rows, isCommodityMode, onExport
}: {
  title: string;
  subtitle: string;
  rows: RankingRow[];
  isCommodityMode: boolean;
  onExport: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 flex items-start justify-between border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <button
          onClick={onExport}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                {isCommodityMode ? 'Commodity' : 'County'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Year</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Flag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-teal-50/30 transition-colors`}>
                <td className="px-4 py-2.5">
                  <RankBadge rank={row.rank} />
                </td>
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {isCommodityMode ? row.item : row.county}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{row.item}</td>
                <td className="px-4 py-2.5 text-gray-600">{row.year}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                  {formatNum(row.value)}
                </td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">{row.unit}</td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">{row.flag || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
