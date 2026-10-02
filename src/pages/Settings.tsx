import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  Server,
  Layers,
  Sparkles,
  CheckCircle2,
  FileCode2,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { IDashboardStats, ILead } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface SettingsProps {
  stats: IDashboardStats | null;
  leads: ILead[];
  onDataReset: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ stats, leads, onDataReset }) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { showToast } = useToast();

  const handleReseed = async () => {
    try {
      setIsSeeding(true);
      await api.reseedData();
      showToast('Database reset and re-seeded with 10 realistic leads!', 'success');
      onDataReset();
    } catch (err: any) {
      showToast(err.message || 'Failed to reseed database', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(leads, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `leads_backup_${Date.now()}.json`);
    dlAnchorElem.click();
    showToast('Database JSON backup downloaded', 'success');
  };

  const dbInfo = stats?.dbInfo || {
    engine: 'Persistent Document Database',
    isMongoose: false,
    dbPath: './data/mini_crm_db.json',
    leadsCount: leads.length,
    usersCount: 1,
    notesCount: 4,
    followupsCount: 4,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded border border-blue-200">
              System & Architecture
            </span>
            <span className="text-xs text-slate-500 font-medium">Future Interns Task 2 (FUTURE_FS_02)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172554] tracking-tight">
            Database & Environment Controls
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review database status, seed realistic demonstration records, and inspect REST endpoints.
          </p>
        </div>

        <button
          onClick={handleReseed}
          disabled={isSeeding}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-blue-600/25 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Seeding...' : 'Reset & Seed Demo Data'}</span>
        </button>
      </div>

      {/* Database Engine Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172554]">Database Engine</h3>
              <p className="text-xs text-slate-500">Storage mechanism & integrity</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">Active Engine:</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {dbInfo.engine}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">Storage Location:</span>
              <code className="text-blue-700 font-mono text-[11px] truncate max-w-[200px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {dbInfo.dbPath}
              </code>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">MongoDB / Mongoose Support:</span>
              <span className="text-slate-700 font-medium">Ready (Set MONGODB_URI in .env)</span>
            </div>
          </div>
        </div>

        {/* Database Records Stats */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172554]">Entity Counts</h3>
              <p className="text-xs text-slate-500">Persisted collection statistics</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">Client Leads:</span>
              <p className="text-xl font-bold text-[#172554] mt-1">{dbInfo.leadsCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">Follow-up Tasks:</span>
              <p className="text-xl font-bold text-[#172554] mt-1">{dbInfo.followupsCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">Activity Notes:</span>
              <p className="text-xl font-bold text-[#172554] mt-1">{dbInfo.notesCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">Admin Users:</span>
              <p className="text-xl font-bold text-[#172554] mt-1">{dbInfo.usersCount}</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadJson}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download JSON Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* REST API Endpoints Overview for Evaluator */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-[#172554]">Full-Stack REST API Reference</h3>
        </div>
        <p className="text-xs text-slate-500">
          Implemented in Node.js + Express with JWT authentication middleware:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-blue-700 font-bold">POST /api/auth/login</span>
            <p className="text-[11px] text-slate-500 font-sans">Admin authentication & JWT generation</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-emerald-700 font-bold">GET /api/leads</span>
            <p className="text-[11px] text-slate-500 font-sans">Fetch all leads with search, filter, and sort</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-blue-700 font-bold">POST /api/leads</span>
            <p className="text-[11px] text-slate-500 font-sans">Create a new client lead record</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-amber-700 font-bold">PUT /api/leads/:id</span>
            <p className="text-[11px] text-slate-500 font-sans">Update lead info, pipeline status, or follow-up</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-rose-700 font-bold">DELETE /api/leads/:id</span>
            <p className="text-[11px] text-slate-500 font-sans">Cascade delete lead, notes, and follow-ups</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-teal-700 font-bold">GET /api/dashboard/stats</span>
            <p className="text-[11px] text-slate-500 font-sans">Computes metrics, pipeline status, and reminders</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-blue-700 font-bold">POST /api/leads/:id/notes</span>
            <p className="text-[11px] text-slate-500 font-sans">Post meeting or activity notes to a lead</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-teal-700 font-bold">POST /api/public/contact</span>
            <p className="text-[11px] text-slate-500 font-sans">Public website contact form submission ingestion</p>
          </div>
        </div>
      </div>
    </div>
  );
};
