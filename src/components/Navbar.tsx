import React from 'react';
import { Menu, Plus, Send, RefreshCw } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenAddLeadModal: () => void;
  onOpenWebSimulator: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenAddLeadModal,
  onOpenWebSimulator,
  onRefresh,
  isRefreshing = false,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Executive Dashboard',
          subtitle: 'Real-time overview of client leads, conversion pipeline, and follow-ups.',
        };
      case 'leads':
        return {
          title: 'Lead Management',
          subtitle: 'Search, filter, update statuses, and maintain client lead records.',
        };
      case 'followups':
        return {
          title: 'Follow-ups & Tasks',
          subtitle: 'Actionable lead reminders and scheduled contact checkpoints.',
        };
      case 'simulator':
        return {
          title: 'Website Contact Form Simulator',
          subtitle: 'Simulate prospective customer submissions directly into the CRM pipeline.',
        };
      case 'settings':
        return {
          title: 'System & Database Configuration',
          subtitle: 'MongoDB connection status, demo data controls, and export tools.',
        };
      default:
        return { title: 'Mini CRM', subtitle: 'Future Interns Task 2' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#172554] tracking-tight truncate">{title}</h1>
          <p className="hidden sm:block text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        <button
          onClick={onOpenWebSimulator}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-lg transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Simulate Form</span>
        </button>

        <button
          onClick={onOpenAddLeadModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/25 transition-all duration-150 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>
    </header>
  );
};
