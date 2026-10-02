import React from 'react';
import {
  Users,
  UserPlus,
  PhoneCall,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ArrowRight,
  Globe,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { IDashboardStats, ILead, LeadStatus } from '../types';
import { ActiveTab } from '../components/Sidebar';

interface DashboardProps {
  stats: IDashboardStats | null;
  isLoading: boolean;
  onOpenLeadDetail: (leadId: string) => void;
  onOpenAddLeadModal: () => void;
  onOpenWebSimulator: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  isLoading,
  onOpenLeadDetail,
  onOpenAddLeadModal,
  onOpenWebSimulator,
  onNavigateTab,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm" />
          <div className="h-72 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm" />
        </div>
      </div>
    );
  }

  const { summary, recentLeads, upcomingFollowups, sourceDistribution, statusDistribution } = stats;

  const statCards = [
    {
      label: 'Total Leads',
      value: summary.totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100',
      badge: 'All Time',
    },
    {
      label: 'New Inquiries',
      value: summary.newLeads,
      icon: UserPlus,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100',
      badge: 'Action Required',
    },
    {
      label: 'Contacted',
      value: summary.contactedLeads,
      icon: PhoneCall,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-100',
      badge: 'In Pipeline',
    },
    {
      label: 'Converted',
      value: summary.convertedLeads,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
      badge: `${summary.conversionRate}% Rate`,
    },
    {
      label: 'Follow-ups Due',
      value: summary.followupsDue,
      icon: Calendar,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-100',
      badge: summary.followupsDue > 0 ? 'Urgent' : 'Clear',
      isWarning: summary.followupsDue > 0,
    },
  ];

  const getStatusBadgeClass = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Converted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-white border border-blue-100 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded border border-blue-200">
              Future Interns • Task 2
            </span>
            <span className="text-xs text-slate-500 font-medium">Client Lead Management System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172554] tracking-tight">
            Mini CRM Pipeline Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
            Manage incoming inquiries from website forms, track conversion stages, and manage follow-ups effectively.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenWebSimulator}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <Globe className="w-4 h-4 text-teal-600" />
            <span>Test Website Form</span>
          </button>
          <button
            onClick={onOpenAddLeadModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl bg-white border ${
                card.isWarning ? 'border-rose-200' : 'border-slate-200/90'
              } shadow-sm transition-transform hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                <div className={`p-2 rounded-xl border ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#172554] tracking-tight">
                  {card.value}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  card.isWarning
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Stage Bar */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172554]">Lead Conversion Pipeline</h3>
              <p className="text-xs text-slate-500">Distribution across current lead lifecycle stages</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{summary.conversionRate}% Conversion</span>
            </div>
          </div>

          {/* Progress Segment Bar */}
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{
                width: `${summary.totalLeads > 0 ? (statusDistribution.New / summary.totalLeads) * 100 : 0}%`,
              }}
              className="bg-blue-600 transition-all duration-500"
              title={`New: ${statusDistribution.New}`}
            />
            <div
              style={{
                width: `${summary.totalLeads > 0 ? (statusDistribution.Contacted / summary.totalLeads) * 100 : 0}%`,
              }}
              className="bg-amber-500 transition-all duration-500"
              title={`Contacted: ${statusDistribution.Contacted}`}
            />
            <div
              style={{
                width: `${summary.totalLeads > 0 ? (statusDistribution.Converted / summary.totalLeads) * 100 : 0}%`,
              }}
              className="bg-emerald-600 transition-all duration-500"
              title={`Converted: ${statusDistribution.Converted}`}
            />
          </div>

          {/* Stage Cards */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-xs font-semibold text-slate-700">New Leads</span>
              </div>
              <p className="text-xl font-bold text-[#172554] mt-1.5">{statusDistribution.New}</p>
              <span className="text-[11px] text-slate-500 font-medium">
                {summary.totalLeads > 0 ? Math.round((statusDistribution.New / summary.totalLeads) * 100) : 0}% of total
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-slate-700">Contacted</span>
              </div>
              <p className="text-xl font-bold text-[#172554] mt-1.5">{statusDistribution.Contacted}</p>
              <span className="text-[11px] text-slate-500 font-medium">
                {summary.totalLeads > 0 ? Math.round((statusDistribution.Contacted / summary.totalLeads) * 100) : 0}% of total
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">Converted</span>
              </div>
              <p className="text-xl font-bold text-[#172554] mt-1.5">{statusDistribution.Converted}</p>
              <span className="text-[11px] text-slate-500 font-medium">
                {summary.totalLeads > 0 ? Math.round((statusDistribution.Converted / summary.totalLeads) * 100) : 0}% of total
              </span>
            </div>
          </div>
        </div>

        {/* Lead Sources Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#172554]">Lead Generation Sources</h3>
            <p className="text-xs text-slate-500">Acquisition channels performance</p>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(sourceDistribution).map(([source, count]) => {
              const percentage = summary.totalLeads > 0 ? Math.round((count / summary.totalLeads) * 100) : 0;
              return (
                <div key={source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{source}</span>
                    <span className="text-slate-500 font-semibold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${
                        source === 'Website'
                          ? 'bg-blue-600'
                          : source === 'LinkedIn'
                          ? 'bg-sky-500'
                          : source === 'Instagram'
                          ? 'bg-rose-500'
                          : source === 'Referral'
                          ? 'bg-emerald-500'
                          : source === 'Advertisement'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Leads & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads Table (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172554]">Recent Leads</h3>
              <p className="text-xs text-slate-500">Latest prospect entries recorded in the CRM</p>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-lg">Lead / Company</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No leads registered yet.
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead: ILead) => (
                    <tr
                      key={lead._id}
                      onClick={() => onOpenLeadDetail(lead._id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {lead.fullName}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate max-w-[160px]">
                          {lead.company}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {lead.leadSource}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${getStatusBadgeClass(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(lead.createdAt)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-blue-600 font-medium group-hover:underline">Details →</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming / Due Follow-ups (1 Col) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172554]">Upcoming Follow-ups</h3>
              <p className="text-xs text-slate-500">Scheduled reminders</p>
            </div>
            <button
              onClick={() => onNavigateTab('followups')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingFollowups.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No pending follow-ups scheduled.
              </div>
            ) : (
              upcomingFollowups.map((fu) => {
                const isOverdue = new Date(fu.dueDate) < new Date();
                return (
                  <div
                    key={fu._id}
                    onClick={() => onOpenLeadDetail(fu.leadId)}
                    className={`p-3.5 rounded-xl border cursor-pointer hover:border-slate-300 transition-all ${
                      isOverdue
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{fu.title}</p>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                          fu.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : fu.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {fu.priority}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 truncate max-w-[120px]">{fu.leadName}</span>
                      <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />
                        {formatDate(fu.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
