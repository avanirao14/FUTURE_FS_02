import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  MessageSquare,
  DollarSign,
  Flag,
} from 'lucide-react';
import { ILeadDetail, INote, IFollowUp, LeadStatus } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';

interface LeadDetailModalProps {
  isOpen: boolean;
  leadId: string | null;
  onClose: () => void;
  onEditLead: (lead: ILeadDetail) => void;
  onDeleteLead: (leadId: string, leadName: string) => void;
  onStatusChangeSuccess?: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  leadId,
  onClose,
  onEditLead,
  onDeleteLead,
  onStatusChangeSuccess,
}) => {
  const [lead, setLead] = useState<ILeadDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'followups'>('overview');

  // Notes state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  // Follow-up state
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [newFollowUpTitle, setNewFollowUpTitle] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  const [newFollowUpPriority, setNewFollowUpPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newFollowUpNotes, setNewFollowUpNotes] = useState('');

  const { showToast } = useToast();

  const fetchLeadDetails = async () => {
    if (!leadId) return;
    try {
      setIsLoading(true);
      const data = await api.getLeadById(leadId);
      setLead(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load lead details', 'error');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setNewFollowUpDate(tomorrow.toISOString().split('T')[0]);
    } else {
      setLead(null);
    }
  }, [isOpen, leadId]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    try {
      const updated = await api.updateLead(lead._id, { status: newStatus });
      setLead((prev) => (prev ? { ...prev, ...updated } : null));
      showToast(`Status updated to "${newStatus}"`, 'success');
      if (onStatusChangeSuccess) onStatusChangeSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // NOTE HANDLERS
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNoteContent.trim()) return;

    try {
      setIsAddingNote(true);
      const note = await api.createNote(lead._id, newNoteContent.trim());
      setLead((prev) => (prev ? { ...prev, notes: [note, ...prev.notes] } : null));
      setNewNoteContent('');
      showToast('Note added successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add note', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;
    try {
      const updated = await api.updateNote(noteId, editNoteContent.trim());
      setLead((prev) =>
        prev
          ? {
              ...prev,
              notes: prev.notes.map((n) => (n._id === noteId ? updated : n)),
            }
          : null
      );
      setEditingNoteId(null);
      showToast('Note updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update note', 'error');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.deleteNote(noteId);
      setLead((prev) =>
        prev
          ? {
              ...prev,
              notes: prev.notes.filter((n) => n._id !== noteId),
            }
          : null
      );
      showToast('Note deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete note', 'error');
    }
  };

  // FOLLOW-UP HANDLERS
  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newFollowUpTitle.trim() || !newFollowUpDate) return;

    try {
      const fu = await api.createFollowUp(lead._id, {
        title: newFollowUpTitle.trim(),
        dueDate: new Date(newFollowUpDate).toISOString(),
        priority: newFollowUpPriority,
        notes: newFollowUpNotes.trim(),
      });
      setLead((prev) => (prev ? { ...prev, followups: [...prev.followups, fu], followUpDate: fu.dueDate } : null));
      setNewFollowUpTitle('');
      setNewFollowUpNotes('');
      setIsAddingFollowUp(false);
      showToast('Follow-up scheduled successfully', 'success');
      if (onStatusChangeSuccess) onStatusChangeSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to create follow-up', 'error');
    }
  };

  const handleToggleFollowUp = async (fu: IFollowUp) => {
    try {
      const updated = await api.updateFollowUp(fu._id, { completed: !fu.completed });
      setLead((prev) =>
        prev
          ? {
              ...prev,
              followups: prev.followups.map((item) => (item._id === fu._id ? updated : item)),
            }
          : null
      );
      showToast(
        updated.completed ? 'Follow-up marked as completed' : 'Follow-up marked as pending',
        'success'
      );
      if (onStatusChangeSuccess) onStatusChangeSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to update follow-up', 'error');
    }
  };

  const handleDeleteFollowUp = async (fuId: string) => {
    try {
      await api.deleteFollowUp(fuId);
      setLead((prev) =>
        prev
          ? {
              ...prev,
              followups: prev.followups.filter((f) => f._id !== fuId),
            }
          : null
      );
      showToast('Follow-up deleted', 'info');
      if (onStatusChangeSuccess) onStatusChangeSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete follow-up', 'error');
    }
  };

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
    if (!dateStr) return 'Not scheduled';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl relative my-6 text-left flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          {lead ? (
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#172554] tracking-tight truncate">
                  {lead.fullName}
                </h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadgeClass(lead.status)}`}>
                  {lead.status}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  {lead.leadSource}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {lead.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Created {formatDate(lead.createdAt)}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-10 w-48 bg-slate-100 rounded animate-pulse" />
          )}

          <div className="flex items-center gap-2 shrink-0">
            {lead && (
              <>
                <button
                  onClick={() => onEditLead(lead)}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-xs"
                  title="Edit Lead"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteLead(lead._id, lead.fullName)}
                  className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors shadow-xs"
                  title="Delete Lead"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Status Bar */}
        {lead && (
          <div className="px-5 sm:px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">Change Pipeline Status:</span>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              {(['New', 'Contacted', 'Converted'] as LeadStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    lead.status === st
                      ? st === 'New'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : st === 'Contacted'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-100 px-6 gap-6 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Notes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-semibold">
              {lead?.notes?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'followups'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Follow-ups</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-semibold">
              {lead?.followups?.length || 0}
            </span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading && !lead ? (
            <div className="py-12 text-center text-slate-500 text-sm">Loading lead information...</div>
          ) : !lead ? (
            <div className="py-12 text-center text-slate-500 text-sm">Lead details not available.</div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium">Email Address</span>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm text-slate-800 hover:text-blue-600 transition-colors font-medium break-all"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium">Phone Number</span>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-sm text-slate-800 hover:text-blue-600 transition-colors font-medium"
                    >
                      {lead.phone}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium">Estimated Budget</span>
                  <div className="mt-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm text-slate-800 font-medium">
                      {lead.budget || 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium">Next Follow-up Due</span>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-sm text-slate-800 font-medium">
                      {formatDate(lead.followUpDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inquiry Message / Requirements */}
              {lead.message && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <h4 className="text-xs font-semibold text-[#172554] uppercase tracking-wider mb-2">
                    Client Inquiry / Message
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                    {lead.message}
                  </p>
                </div>
              )}

              {/* Activity Timeline */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-semibold text-[#172554] uppercase tracking-wider mb-3">
                  Activity Timeline
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Created Date:</span>
                    <span className="text-slate-800 font-medium">{formatDateTime(lead.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Last Modified:</span>
                    <span className="text-slate-800 font-medium">{formatDateTime(lead.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Last Contacted:</span>
                    <span className="text-slate-800 font-medium">
                      {lead.lastContactedAt ? formatDateTime(lead.lastContactedAt) : 'Not contacted yet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'notes' ? (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Add Activity Note
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Enter meeting notes, call summary, or lead update..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                  />
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteContent.trim()}
                    className="self-end px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3 pt-2">
                {lead.notes.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">No notes recorded for this lead yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Add an internal note or discussion note above.</p>
                  </div>
                ) : (
                  lead.notes.map((note) => (
                    <div
                      key={note._id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-700">{note.author}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{formatDateTime(note.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingNoteId(note._id);
                              setEditNoteContent(note.content);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title="Edit Note"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {editingNoteId === note._id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            rows={2}
                            value={editNoteContent}
                            onChange={(e) => setEditNoteContent(e.target.value)}
                            className="w-full bg-white border border-blue-500 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateNote(note._id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Follow-Up Form Toggle */}
              {!isAddingFollowUp ? (
                <button
                  onClick={() => setIsAddingFollowUp(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule New Follow-up Reminder</span>
                </button>
              ) : (
                <form
                  onSubmit={handleAddFollowUp}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-[#172554] uppercase tracking-wider">
                      Schedule Follow-up
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingFollowUp(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Action / Task Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call client regarding proposal feedback"
                      value={newFollowUpTitle}
                      onChange={(e) => setNewFollowUpTitle(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Due Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newFollowUpDate}
                        onChange={(e) => setNewFollowUpDate(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                      <select
                        value={newFollowUpPriority}
                        onChange={(e) => setNewFollowUpPriority(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Have pricing breakdown ready on call"
                      value={newFollowUpNotes}
                      onChange={(e) => setNewFollowUpNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingFollowUp(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      Save Reminder
                    </button>
                  </div>
                </form>
              )}

              {/* Follow-ups List */}
              <div className="space-y-2.5 pt-2">
                {lead.followups.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">No follow-ups recorded.</p>
                    <p className="text-xs text-slate-400 mt-1">Schedule a check-in or callback reminder above.</p>
                  </div>
                ) : (
                  lead.followups.map((fu) => {
                    const isOverdue = !fu.completed && new Date(fu.dueDate) < new Date();
                    return (
                      <div
                        key={fu._id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          fu.completed
                            ? 'bg-slate-50/70 border-slate-200 opacity-60'
                            : isOverdue
                            ? 'bg-rose-50/80 border-rose-200'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleFollowUp(fu)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                          title={fu.completed ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {fu.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-400 hover:border-emerald-600" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold truncate ${
                                fu.completed ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {fu.title}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
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

                          <div className="flex flex-wrap items-center gap-3 text-xs mt-1 text-slate-500">
                            <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-semibold' : ''}`}>
                              <Calendar className="w-3.5 h-3.5" />
                              Due: {formatDate(fu.dueDate)} {isOverdue && '(Overdue)'}
                            </span>
                            {fu.completed && fu.completedAt && (
                              <span className="text-emerald-700 text-[11px] font-medium">
                                Completed {formatDate(fu.completedAt)}
                              </span>
                            )}
                          </div>

                          {fu.notes && (
                            <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 p-2 rounded border border-slate-100">
                              "{fu.notes}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteFollowUp(fu._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded"
                          title="Delete follow-up"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
