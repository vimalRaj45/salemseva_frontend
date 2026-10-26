import React from 'react';
import { 
  TrendingUp, 
  RotateCcw, 
  IndianRupee, 
  Clock, 
  Filter, 
  Eye, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight, 
  Receipt, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Mail, 
  Target,
  ExternalLink
} from 'lucide-react';

/**
 * Executive Business Intelligence & Revenue Ledger View
 * Recreates the exact layout, density, and telemetry of the Shazu Soft Control Panel
 * for the Salem Home Services / Shazu One platform.
 */
export default function ExecutiveBIView({
  metrics = {
    grossRevenue: 150,
    verifiedCount: 3,
    pendingRevenue: 0,
    pendingCount: 0,
    conversionRate: 0.0,
    convertedLeads: 0,
    totalTraffic: 3565,
    contactInquiries: 5,
    todayViews: 6
  },
  transactions = [
    {
      id: 'tx_1',
      date: '13/10/2026',
      clientName: 'Kusum Rani',
      clientEmail: 'ku24pmsm02@cujammu.ac.in',
      serviceName: 'AI tools for Effective Research Article Writing',
      fee: 'Free',
      utr: 'N/A (Free)',
      status: 'VERIFIED'
    },
    {
      id: 'tx_2',
      date: '7/10/2026',
      clientName: 'Dr Minakshi Sharma',
      clientEmail: 'minakshisharma@mru.edu.in',
      serviceName: 'AI tools for Effective Research Article Writing',
      fee: 'Free',
      utr: 'N/A (Free)',
      status: 'VERIFIED'
    },
    {
      id: 'tx_3',
      date: '16/9/2026',
      clientName: 'Vikas Sanjeev Laljani',
      clientEmail: 'vikaslaljani@gmail.com',
      serviceName: 'DIGITAL MARKETING',
      fee: '50',
      utr: '662546433743',
      status: 'VERIFIED'
    },
    {
      id: 'tx_4',
      date: '15/9/2026',
      clientName: 'Mahewary manthan Maheshbhai',
      clientEmail: 'devignabenmaheshwari77@gmail.com',
      serviceName: 'DIGITAL MARKETING',
      fee: '50',
      utr: 'CICAgiPje1pWvXQ',
      status: 'VERIFIED'
    },
    {
      id: 'tx_5',
      date: '15/9/2026',
      clientName: 'Meet Prajapati',
      clientEmail: 'meetp07016@gmail.com',
      serviceName: 'DIGITAL MARKETING',
      fee: '50',
      utr: '314725744179',
      status: 'VERIFIED'
    }
  ],
  onRefresh = () => {},
  onViewRegister = () => {},
  onViewCrm = () => {}
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Card with Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span>Executive Business Intelligence & Revenue Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monetary collection metrics, UTR verification status, and conversion pipeline
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors active:scale-95 border border-slate-200"
          aria-label="Refresh executive telemetry"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 2. 4 Core Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Collections (Deep Forest Emerald Card) */}
        <div className="bg-gradient-to-br from-[#123B32] to-[#2F5B4E] text-white p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-white/80">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Collections</span>
            <div className="p-2 bg-white/10 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-sans tracking-tight">
              {formatCurrency(metrics.grossRevenue)}
            </div>
            <div className="text-[11px] text-emerald-200 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              <span>{metrics.verifiedCount} verified paid entries</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending UTR Verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending UTR Verification</span>
            <div className="p-2 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-sans text-amber-700 tracking-tight">
              {formatCurrency(metrics.pendingRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" aria-hidden="true" />
              <span>{metrics.pendingCount} transactions awaiting check</span>
            </div>
          </div>
        </div>

        {/* Card 3: CRM Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">CRM Conversion Rate</span>
            <div className="p-2 bg-blue-50 rounded-xl flex items-center justify-center">
              <Filter className="w-4 h-4 text-blue-600" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-sans text-slate-900 tracking-tight">
              {(metrics.conversionRate || 0).toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Target className="w-3 h-3 text-blue-500" aria-hidden="true" />
              <span>{metrics.convertedLeads} deals converted / won</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Inquiries & Traffic */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Inquiries & Traffic</span>
            <div className="p-2 bg-purple-50 rounded-xl flex items-center justify-center">
              <Eye className="w-4 h-4 text-purple-600" aria-hidden="true" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black font-sans text-slate-900 tracking-tight">
              {new Intl.NumberFormat('en-IN').format(metrics.totalTraffic || 3565)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-purple-500" aria-hidden="true" />
              <span>{metrics.contactInquiries} contact CRM inquiries</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. 2-Column Section: Lead Pipeline Funnel & Financial Transactions Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1-Col: Lead Conversion Pipeline Funnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold font-sans text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#C47D4C]" aria-hidden="true" />
            <span>Lead Conversion Pipeline</span>
          </h3>
          
          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-600">New Inquiries</span>
                <span className="font-mono text-slate-900">{metrics.contactInquiries}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-600">Contacted / In Discussion</span>
                <span className="font-mono text-slate-900">0</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-600">Proposal / Quote Sent</span>
                <span className="font-mono text-slate-900">0</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-600">Won / Converted Deals</span>
                <span className="font-mono text-slate-900">0</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Gross Lead Volume:</span>
            <button
              type="button"
              onClick={onViewCrm}
              className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View CRM</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right 2-Col: Recent Financial Transactions Ledger Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-sans text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>Recent Financial Transactions Ledger</span>
            </h3>
            <button
              type="button"
              onClick={onViewRegister}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Full Register</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="p-3">DATE</th>
                  <th scope="col" className="p-3">CLIENT / ATTENDEE</th>
                  <th scope="col" className="p-3">EVENT / SERVICE</th>
                  <th scope="col" className="p-3">FEE</th>
                  <th scope="col" className="p-3">TRANSACTION ID / UTR</th>
                  <th scope="col" className="p-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      <div>{tx.clientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.clientEmail}</div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {tx.serviceName}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {tx.fee === 'Free' ? (
                        <span className="text-emerald-600 font-semibold">Free</span>
                      ) : (
                        <span className="text-emerald-700">{tx.fee}</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10.5px] border border-slate-200">
                        {tx.utr}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: Live Web Traffic & Page Views Telemetry */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold font-sans text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Live Web Traffic & Page Views Telemetry</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time visitor device breakdown, route impressions, and daily traffic trend
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
              <span>Today: {metrics.todayViews || 6} views</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" aria-hidden="true"></span>
              <span>All-Time: {new Intl.NumberFormat('en-IN').format(metrics.totalTraffic || 3565)} views</span>
            </span>
          </div>
        </div>

        {/* 3-Panel Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Sub-panel 1: Device Distribution */}
          <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Device Distribution</span>
              </span>
              <span className="text-emerald-700 font-mono">38% Mobile</span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-slate-400" aria-hidden="true" /> Mobile Users
                  </span>
                  <span className="font-mono font-semibold">1337 (38%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Laptop className="w-3 h-3 text-slate-400" aria-hidden="true" /> Desktop / Laptop
                  </span>
                  <span className="font-mono font-semibold">1973 (55%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Tablet className="w-3 h-3 text-slate-400" aria-hidden="true" /> Tablet Devices
                  </span>
                  <span className="font-mono font-semibold">255 (7%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-panel 2: Top Visited Pages */}
          <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                <span>Top Visited Pages</span>
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              {[
                { route: 'index.html', views: 1856, percent: 100 },
                { route: 'events', views: 368, percent: 20 },
                { route: 'careers', views: 309, percent: 17 },
                { route: 'events.html', views: 141, percent: 8 },
                { route: 'careers.html', views: 117, percent: 6 },
                { route: 'about.html', views: 98, percent: 5 }
              ].map((page) => (
                <div key={page.route}>
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span className="font-mono text-slate-800 font-medium">{page.route}</span>
                    <span className="font-mono text-blue-600 font-semibold">{page.views} views</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${page.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-panel 3: 7-Day Traffic Trend (Responsive SVG Area Sparkline) */}
          <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                <span>7-Day Traffic Trend</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Last 7 Days</span>
            </div>

            {/* SVG Sparkline Graph */}
            <div className="py-2">
              <svg className="w-full h-24 overflow-visible" viewBox="0 0 280 80">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area under curve */}
                <path
                  d="M 10 70 L 45 65 L 85 55 L 125 58 L 165 40 L 205 48 L 245 25 L 275 30 L 275 75 L 10 75 Z"
                  fill="url(#trendGradient)"
                />
                {/* Line path */}
                <path
                  d="M 10 70 L 45 65 L 85 55 L 125 58 L 165 40 L 205 48 L 245 25 L 275 30"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Active Points */}
                {[
                  { cx: 10, cy: 70 },
                  { cx: 45, cy: 65 },
                  { cx: 85, cy: 55 },
                  { cx: 125, cy: 58 },
                  { cx: 165, cy: 40 },
                  { cx: 205, cy: 48 },
                  { cx: 245, cy: 25 },
                  { cx: 275, cy: 30 }
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r={i === 7 ? '3.5' : '2'}
                    className={i === 7 ? 'fill-blue-600 stroke-white stroke-2' : 'fill-blue-500'}
                  />
                ))}
              </svg>
            </div>

            {/* Date Labels below chart */}
            <div className="flex justify-between text-[9px] font-mono text-slate-400 border-t border-slate-200/60 pt-1.5">
              <span>19 Oct</span>
              <span>20 Oct</span>
              <span>21 Oct</span>
              <span>22 Oct</span>
              <span>23 Oct</span>
              <span>24 Oct</span>
              <span>25 Oct</span>
              <span>26 Oct</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
