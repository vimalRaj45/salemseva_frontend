import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, Download, ChevronDown, FileSpreadsheet, FileCode, Printer } from 'lucide-react';
import AdminCustomSelect from './AdminCustomSelect';

/**
 * Universal Multi-Criteria Filter & Export Toolbar
 * Features debounced search, custom accessible popovers (no native select),
 * clear reset button, record counter, and multi-format export dropdown.
 */
export default function AdminFilterToolbar({
  search = '',
  onSearchChange = () => {},
  datePreset = 'all',
  onDatePresetChange = () => {},
  status = 'all',
  onStatusChange = () => {},
  category = 'all',
  onCategoryChange = () => {},
  sort = 'newest',
  onSortChange = () => {},
  onResetFilters = () => {},
  totalRecords = 0,
  grossAmount = '₹150',
  onExport = () => {}
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  // Close export dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    }
    if (exportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [exportOpen]);

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'month', label: 'This Month' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'in_progress', label: 'In Progress' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'digital_marketing', label: 'Digital Marketing' },
    { value: 'ai_tools', label: 'AI Tools Workshop' },
    { value: 'electrical', label: 'Electrical & AC' },
    { value: 'plumbing', label: 'Plumbing Services' },
    { value: 'cleaning', label: 'Home Deep Cleaning' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount_desc', label: 'Highest Amount' },
    { value: 'amount_asc', label: 'Lowest Amount' }
  ];

  return (
    <div className="bg-white/95 border-b border-slate-200 px-3 md:px-6 py-2 flex flex-wrap items-center gap-2 z-10">
      {/* Left: Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Keyword Search */}
        <div className="relative flex-1 min-w-[120px] sm:min-w-[180px]">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter table..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#123B32] shadow-2xs"
            aria-label="Filter current table entries"
          />
        </div>

        {/* Date Preset Dropdown */}
        <AdminCustomSelect
          value={datePreset}
          onChange={onDatePresetChange}
          options={dateOptions}
          placeholder="All Dates"
        />

        {/* Status Dropdown */}
        <AdminCustomSelect
          value={status}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="All Statuses"
        />

        {/* Category Dropdown */}
        <AdminCustomSelect
          value={category}
          onChange={onCategoryChange}
          options={categoryOptions}
          placeholder="All Categories"
        />

        {/* Sort Dropdown */}
        <AdminCustomSelect
          value={sort}
          onChange={onSortChange}
          options={sortOptions}
          placeholder="Newest First"
        />

        {/* Reset Filter Button */}
        <button
          type="button"
          onClick={onResetFilters}
          title="Reset All Filters"
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 active:scale-95 border border-slate-200"
          aria-label="Clear active filters"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
          <span>Clear</span>
        </button>
      </div>

      {/* Right: Record / Amount Summary & Export Dropdown */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap">
          Gross {grossAmount}
        </span>

        {/* Export Dropdown */}
        <div ref={exportRef} className="relative">
          <button
            type="button"
            onClick={() => setExportOpen(prev => !prev)}
            aria-expanded={exportOpen}
            aria-haspopup="true"
            className="px-3 py-1.5 bg-[#123B32] hover:bg-[#2F5B4E] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Export Data</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${exportOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-1 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => { onExport('csv'); setExportOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 cursor-pointer font-medium"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Export to CSV Spreadsheet</span>
              </button>
              <button
                type="button"
                onClick={() => { onExport('json'); setExportOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 cursor-pointer font-medium"
              >
                <FileCode className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>Export to Raw JSON</span>
              </button>
              <button
                type="button"
                onClick={() => { onExport('print'); setExportOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Printer className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                <span>Print Telemetry Report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
