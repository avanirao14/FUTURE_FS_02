import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Building2,
  User,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { IFollowUp, ILead } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface FollowUpsProps {
  leads: ILead[];
  onOpenLeadDetail: (leadId: string) => void;
  onRefreshData: () => void;
}

export const FollowUps: React.FC<FollowUpsProps> = ({
  leads,
  onOpenLeadDetail,
  onRefreshData,
}) => {
  const [followups, setFollowups] = useState<IFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'due' | 'upcoming' | 'completed'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  // New Follow-up Form
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newNotes, setNewNotes] = useState('');

  const { showToast } = useToast();

  const fetchFollowUps = async () => {
    try {
      setIsLoading(true);
      const data = await api.getFollowUps();
      setFollowups(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch follow-ups', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewDueDate(tomorrow.toISOString().split('T')[0]);
    if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0]._id);
    }
  }, [leads]);

  const handleToggleComplete = async (fu: IFollowUp) => {
    try {
      const updated = await api.updateFollowUp(fu._id, { completed: !fu.completed });
      setFollowups((prev) => prev.map((item) => (item._id === fu._id ? updated : item)));
      showToast(
        updated.completed ? 'Follow-up marked as completed!' : 'Follow-up marked as pending',
        'success'
      );
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update follow-up', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteFollowUp(id);
      setFollowups((prev) => prev.filter((f) => f._id !== id));
      showToast('Follow-up deleted', 'info');
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete follow-up', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !newTitle.trim() || !newDueDate) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const fu = await api.createFollowUp(selectedLeadId, {
        title: newTitle.trim(),
        dueDate: new Date(newDueDate).toISOString(),
        priority: newPriority,
        notes: newNotes.trim(),
      });
      setFollowups((prev) => [...prev, fu]);
      setNewTitle('');
      setNewNotes('');
      setIsCreating(false);
      showToast('Follow-up reminder scheduled successfully', 'success');
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create follow-up', 'error');
    }
  };

  const filteredFollowUps = followups.filter((fu) => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const dueDate = new Date(fu.dueDate);

    // Status filter
    if (activeFilter === 'completed') {
      if (!fu.completed) return false;
    } else if (activeFilter === 'due') {
      if (fu.completed || dueDate > endOfToday) return false;
    } else if (activeFilter === 'upcoming') {
      if (fu.completed || dueDate <= endOfToday) return false;
    }

    // Priority filter
    if (selectedPriority !== 'All' && fu.priority !== selectedPriority) {
      return false;
    }

    return true;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header and Quick Stats */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554] tracking-tight">Lead Follow-ups & Reminders</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track customer communications, scheduled calls, and pending proposal reviews.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-blue-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Schedule Form Modal / Collapse */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white border border-blue-200 rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#172554]">Create New Follow-up Checkpoint</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Lead <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              >
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.fullName} — {l.company} ({l.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Action / Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Discuss tech stack requirements and pricing"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority (Urgent)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Follow-up Notes / Context (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Email proposal slide deck first, then phone call at 2:00 PM"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20"
            >
              Schedule Follow-up
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs and Priority Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({followups.length})
          </button>
          <button
            onClick={() => setActiveFilter('due')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'due'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Due Today & Overdue</span>
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              activeFilter === 'upcoming'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs px-2">
          <span className="text-slate-500">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none shadow-xs"
          >
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No follow-ups match this view.</p>
            <p className="text-xs text-slate-500 mt-1">
              {activeFilter === 'due'
                ? 'Great job! You have no overdue or pending follow-ups due today.'
                : 'Schedule a follow-up action for any client lead above.'}
            </p>
          </div>
        ) : (
          filteredFollowUps.map((fu) => {
            const isOverdue = !fu.completed && new Date(fu.dueDate) < new Date();
            return (
              <div
                key={fu._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                  fu.completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-65'
                    : isOverdue
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(fu)}
                    className="mt-1 shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                    title={fu.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {fu.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-400 hover:border-emerald-600" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm sm:text-base font-bold truncate ${
                          fu.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {fu.title}
                      </h4>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
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

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <button
                        onClick={() => onOpenLeadDetail(fu.leadId)}
                        className="flex items-center gap-1.5 text-blue-600 hover:underline font-semibold"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{fu.leadName}</span>
                      </button>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fu.leadCompany}</span>
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due: {formatDate(fu.dueDate)}</span>
                        {isOverdue && <span className="uppercase text-[10px]">(Overdue)</span>}
                      </span>
                    </div>

                    {fu.notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        {fu.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onOpenLeadDetail(fu.leadId)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                  >
                    <span>View Lead</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(fu._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Follow-up"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
