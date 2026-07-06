import React, { useState, useMemo } from 'react';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (val: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  pageSize?: number;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
  filterSelectors?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No records found',
  emptyIcon = ICONS.schools,
  pageSize = 8,
  loading = false,
  onRowClick,
  renderExpandedRow,
  filterSelectors
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<keyof T>(columns[0].key);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(q))
      );
    }
    rows.sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      
      const cmp = typeof av === 'number' 
        ? av - (bv as number) 
        : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [search, sortCol, sortDir, data]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: keyof T) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-[#2a2d3a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#1a1d27]/50">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder={searchPlaceholder} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400" />
          </div>
          {filterSelectors}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-[#1a1d27]/80 border-b border-slate-100 dark:border-[#2a2d3a]">
              {columns.map(col => (
                <th key={String(col.key)} onClick={() => col.sortable !== false && toggleSort(col.key)}
                  className={`px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 ${col.sortable !== false ? 'cursor-pointer hover:text-slate-800 dark:hover:text-slate-300' : ''} select-none whitespace-nowrap`}>
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable !== false && sortCol === col.key && (
                      <Icon d={sortDir === 'asc' ? ICONS.arrowUp : ICONS.arrowDown} className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-[#2a2d3a]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">Loading...</p>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <Icon d={emptyIcon} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">{emptyMessage}</p>
                </td>
              </tr>
            ) : paginated.map((row, i) => {
              const rowId = row.id || String(i);
              return (
                <React.Fragment key={rowId}>
                  <tr className="group hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => {
                      if (onRowClick) onRowClick(row);
                      if (renderExpandedRow) setExpandedId(expandedId === rowId ? null : rowId);
                    }}>
                    {columns.map(col => (
                      <td key={String(col.key)} className="px-4 py-3.5">
                        {col.render ? col.render(row[col.key], row) : String(row[col.key] || '-')}
                      </td>
                    ))}
                  </tr>
                  {expandedId === rowId && renderExpandedRow && (
                    <tr className="bg-blue-50/30 dark:bg-blue-950/10">
                      <td colSpan={columns.length} className="px-6 py-4">
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/30 dark:bg-[#1a1d27]/30">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-700 dark:text-slate-200">{paginated.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(page * pageSize, filtered.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> entries
        </p>
        <div className="flex items-center gap-1.5">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-90" />
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button key={idx} onClick={() => setPage(idx + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${page === idx + 1 ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
              {idx + 1}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Icon d={ICONS.chevronRight} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
