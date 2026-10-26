import React from 'react';
import { 
  TrendingUp, 
  Filter, 
  Ticket, 
  Calendar, 
  Award, 
  QrCode, 
  Briefcase, 
  FileSpreadsheet, 
  Shield, 
  Megaphone,
  Radio,
  Wrench,
  Users,
  CreditCard,
  Clock
} from 'lucide-react';

/**
 * Horizontal Navigation Tabs Bar
 * Touch-scrollable sticky bar with pill buttons, colored badges, and active state indicators.
 */
export default function AdminHorizontalTabs({
  activeTab = 'analytics',
  onSelectTab = () => {},
  badgeCounts = {}
}) {
  const tabs = [
    {
      id: 'analytics',
      label: 'Dashboard & BI',
      icon: TrendingUp,
      iconColor: 'text-emerald-600'
    },
    {
      id: 'leads',
      label: 'Leads CRM',
      icon: Filter,
      iconColor: 'text-[#C47D4C]',
      badge: badgeCounts.leads || 5,
      badgeBg: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'registrations',
      label: 'Event Registrations & UTRs',
      icon: Ticket,
      iconColor: 'text-emerald-700',
      badge: badgeCounts.registrations || 5,
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      iconColor: 'text-amber-600',
      badge: badgeCounts.events || 11,
      badgeBg: 'bg-amber-100 text-amber-700'
    },
    {
      id: 'certificates',
      label: 'Provide Certificate',
      icon: Award,
      iconColor: 'text-amber-500',
      badge: badgeCounts.certificates || 0,
      badgeBg: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'attendance',
      label: 'Attendance Hub',
      icon: QrCode,
      iconColor: 'text-emerald-600',
      badge: 'LIVE',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'careers',
      label: 'Careers',
      icon: Briefcase,
      iconColor: 'text-purple-600',
      badge: badgeCounts.careers || 3,
      badgeBg: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'applications',
      label: 'Job Applications',
      icon: FileSpreadsheet,
      iconColor: 'text-sky-600',
      badge: badgeCounts.applications || 3,
      badgeBg: 'bg-sky-100 text-sky-700'
    },
    {
      id: 'memberships',
      label: 'Memberships',
      icon: Shield,
      iconColor: 'text-emerald-800',
      badge: badgeCounts.memberships || 6,
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      iconColor: 'text-blue-600',
      badge: badgeCounts.announcements || 0,
      badgeBg: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'ops',
      label: 'Live Dispatch Queue',
      icon: Radio,
      iconColor: 'text-sky-600',
      badge: badgeCounts.activeBookings || 0,
      badgeBg: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'technicians',
      label: 'Technicians Fleet',
      icon: Wrench,
      iconColor: 'text-indigo-600',
      badge: badgeCounts.techCount || 0,
      badgeBg: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'customers',
      label: 'Customers 360',
      icon: Users,
      iconColor: 'text-slate-600',
      badge: badgeCounts.customerCount || 0,
      badgeBg: 'bg-slate-100 text-slate-800'
    },
    {
      id: 'settlements',
      label: 'Escrow & Settlements',
      icon: CreditCard,
      iconColor: 'text-emerald-600',
      badge: 'Razorpay',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'traceability',
      label: 'Audit Trail',
      icon: Clock,
      iconColor: 'text-teal-600',
      badge: badgeCounts.auditCount || 0,
      badgeBg: 'bg-teal-100 text-teal-800'
    }
  ];

  return (
    <nav 
      aria-label="Admin Navigation Tabs"
      className="sticky top-14 z-20 bg-white border-b border-slate-200 px-3 md:px-6 py-1.5 flex items-center justify-start overflow-x-auto whitespace-nowrap shadow-xs no-scrollbar touch-pan-x"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="flex items-center gap-1.5 py-0.5 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold 
                transition-all duration-150 cursor-pointer select-none
                ${isActive
                  ? 'bg-[#123B32] text-white shadow-sm ring-1 ring-[#123B32]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.iconColor}`} 
                aria-hidden="true" 
              />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span 
                  className={`
                    px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md leading-none
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : (tab.badgeBg || 'bg-slate-100 text-slate-700')
                    }
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
