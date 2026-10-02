import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Download,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ILead, LeadSource, LeadStatus } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface LeadsProps {
  leads: ILead[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (lead: ILead) => void;
  onOpenDetailModal: (leadId: string) => void;
  onConfirmDelete: (leadId: string, leadName: string) => void;
}

export const Leads: React.FC<LeadsProps> = ({
  leads,
  isLoading,
  onRefresh,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
  onConfirmDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedFollowUp, setSelectedFollowUp] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const { showToast } = useToast();

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Status filter
    if (selectedStatus !== 'All') {
      result = result.filter((l) => l.status === selectedStatus);
    }

    // Source filter
    if (selectedSource !== 'All') {
      result = result.filter((l) => l.leadSource === selectedSource);
    }

    // Follow-up filter
    if (selectedFollowUp !== 'All') {
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();

      if (selectedFollowUp === 'Today') {
        result = result.filter((l) => l.followUpDate && l.followUpDate.split('T')[0] === todayStr);
      } else if (selectedFollowUp === 'Overdue') {
        result = result.filter((l) => l.followUpDate && new Date(l.followUpDate) < now);
      } else if (selectedFollowUp === 'Upcoming') {
        result = result.filter((l) => l.followUpDate && new Date(l.followUpDate) >= now);
      } else if (selectedFollowUp === 'None') {
        result = result.filter((l) => !l.followUpDate);
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'oldest' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [leads, selectedStatus, selectedSource, selectedFollowUp, searchTerm, sortOrder]);

  const handleQuickStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await api.updateLead(leadId, { status: newStatus });
      showToast(`Lead status updated to ${newStatus}`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      showToast('No leads to export', 'info');
      return;
    }

    const headers = ['Full Name', 'Company', 'Email', 'Phone', 'Source', 'Status', 'Follow-up Date', 'Created Date'];
    const rows = filteredLeads.map((l) => [
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${l.company.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.leadSource}"`,
      `"${l.status}"`,
      `"${l.followUpDate ? l.followUpDate.split('T')[0] : 'None'}"`,
      `"${l.createdAt.split('T')[0]}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads exported to CSV successfully', 'success');
  };

  const getStatusBadge = (status: LeadStatus) => {
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
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Control Bar: Search, Filters & Actions */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, company, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end lg:self-center">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
              title="Export filtered leads to CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Lead</span>
            </button>
          </div>
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            >
              <option value="All">All Sources</option>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Follow-up Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Follow-up:</span>
            <select
              value={selectedFollowUp}
              onChange={(e) => setSelectedFollowUp(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            >
              <option value="All">All Reminders</option>
              <option value="Today">Due Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Upcoming">Upcoming</option>
              <option value="None">No Follow-up</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table / Responsive Cards */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Contact / Lead</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Follow-up Due</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-6 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-800">No leads match your filter criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try clearing filters or adding a new lead.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date();
                  return (
                    <tr
                      key={lead._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onOpenDetailModal(lead._id)}
                    >
                      {/* Name & Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172554] group-hover:text-blue-600 transition-colors">
                          {lead.fullName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{lead.email}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{lead.company}</span>
                        </div>
                        {lead.budget && (
                          <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                            Budget: {lead.budget}
                          </span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                          {lead.leadSource}
                        </span>
                      </td>

                      {/* Status with Quick Toggle */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={lead.status}
                          onChange={(e) => handleQuickStatusChange(lead._id, e.target.value as LeadStatus)}
                          className={`text-xs px-2.5 py-1 rounded-full border font-semibold bg-white cursor-pointer focus:outline-none shadow-2xs ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                        </select>
                      </td>

                      {/* Follow-up Due */}
                      <td className="py-3.5 px-4 text-xs">
                        {lead.followUpDate ? (
                          <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatDate(lead.followUpDate)}</span>
                            {isOverdue && <span className="text-[10px] text-rose-600 uppercase font-bold">(Overdue)</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(lead.createdAt)}
                      </td>

                      {/* Action Buttons */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenDetailModal(lead._id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                            title="View Lead Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(lead)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                            title="Edit Lead"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onConfirmDelete(lead._id, lead.fullName)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No leads match your filter criteria.
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead._id}
                onClick={() => onOpenDetailModal(lead._id)}
                className="p-4 space-y-3 active:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-[#172554] text-base">{lead.fullName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{lead.company}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                    {lead.leadSource}
                  </span>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onOpenEditModal(lead)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onConfirmDelete(lead._id, lead.fullName)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 bg-white border border-slate-200 rounded-lg shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{filteredLeads.length}</strong> of{' '}
            <strong className="text-slate-800 font-semibold">{leads.length}</strong> total leads
          </span>
          {filteredLeads.length < leads.length && (
            <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Filtered
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
