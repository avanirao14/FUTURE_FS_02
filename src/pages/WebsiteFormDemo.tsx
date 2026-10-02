import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle2,
  Globe,
  Building2,
  Mail,
  Phone,
  User,
  DollarSign,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface WebsiteFormDemoProps {
  onLeadCreated: (leadId: string) => void;
}

export const WebsiteFormDemo: React.FC<WebsiteFormDemoProps> = ({ onLeadCreated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    serviceNeeded: 'Full Stack Web Application',
    budget: '$10,000 - $25,000',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  const { showToast } = useToast();

  const handleFillPreset = (preset: 'fintech' | 'ecommerce' | 'saas') => {
    if (preset === 'fintech') {
      setFormData({
        fullName: 'Vikram Sengupta',
        email: 'vikram@paystream.in',
        phone: '+91 98111 22334',
        company: 'PayStream Technologies',
        serviceNeeded: 'Custom Payment Gateway Dashboard',
        budget: '$15,000 - $30,000',
        message: 'Looking for a secure, multi-tenant portal with real-time analytics and webhook management.',
      });
    } else if (preset === 'ecommerce') {
      setFormData({
        fullName: 'Claire Beaumont',
        email: 'claire@luxeapparel.co.uk',
        phone: '+44 20 7123 4567',
        company: 'Luxe Apparel London',
        serviceNeeded: 'B2B E-Commerce & Inventory Management',
        budget: '$20,000+',
        message: 'We require an overhaul of our supplier order management workflow and inventory sync.',
      });
    } else {
      setFormData({
        fullName: 'Daniel Kim',
        email: 'daniel.kim@nexusaistudio.io',
        phone: '+1 (555) 890-1234',
        company: 'Nexus AI Studio',
        serviceNeeded: 'React & Node.js Enterprise Web Platform',
        budget: '$10,000 - $25,000',
        message: 'Need full-stack web development with responsive frontend and robust REST API architecture.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.submitContactForm(formData);
      setSubmittedLeadId(res.leadId);
      showToast('Contact form inquiry submitted directly to the Mini CRM!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      serviceNeeded: 'Full Stack Web Application',
      budget: '$10,000 - $25,000',
      message: '',
    });
    setSubmittedLeadId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Informative Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
          <Globe className="w-4 h-4 text-teal-600" />
          <span>Inbound Lead Generation Simulator</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#172554] tracking-tight">
          Website Contact Form Simulator
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The primary objective of <strong>Task 2 (FUTURE_FS_02)</strong> is managing leads generated from
          website contact forms. Use this form to simulate how an external prospective customer fills out a
          website inquiry and observe it immediately enter the CRM pipeline with status <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">New</span>,
          automated follow-up, and audit note!
        </p>

        {/* Quick Fill Presets */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick Fill Sample Inquiries:</span>
          <button
            type="button"
            onClick={() => handleFillPreset('saas')}
            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors shadow-2xs"
          >
            SaaS Startup
          </button>
          <button
            type="button"
            onClick={() => handleFillPreset('fintech')}
            className="px-2.5 py-1 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg border border-teal-200 transition-colors shadow-2xs"
          >
            FinTech Portal
          </button>
          <button
            type="button"
            onClick={() => handleFillPreset('ecommerce')}
            className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors shadow-2xs"
          >
            Enterprise Retail
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submittedLeadId && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-900">Lead Successfully Ingested into Database!</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                The lead has been recorded in the database with status <span className="font-semibold text-emerald-950">"New"</span>,
                assigned lead source <span className="font-semibold text-emerald-950">"Website"</span>, created an automated follow-up reminder,
                and posted an activity note.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onLeadCreated(submittedLeadId)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>Inspect Lead in CRM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetForm}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      )}

      {/* Website Contact Form UI Mockup */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Mock Browser Header */}
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs text-slate-500 font-mono">https://agency.example.com/contact</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Public Website Form
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="text-left space-y-1">
            <h3 className="text-xl font-bold text-[#172554] tracking-tight">Let's build something remarkable.</h3>
            <p className="text-xs text-slate-500">
              Fill out this inquiry and our solution team will get in touch within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Lin Design Systems"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="maya@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Service Required
              </label>
              <select
                value={formData.serviceNeeded}
                onChange={(e) => setFormData({ ...formData, serviceNeeded: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              >
                <option value="Full Stack Web Application">Full Stack Web Application</option>
                <option value="Custom CRM & Dashboard">Custom CRM & Dashboard</option>
                <option value="REST API & Backend Modernization">REST API & Backend Modernization</option>
                <option value="Cloud Migration & DevOps">Cloud Migration & DevOps</option>
                <option value="UI/UX Redesign & Prototyping">UI/UX Redesign & Prototyping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Project Budget
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                >
                  <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                  <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000+">$25,000+</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Description / Scope Notes
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={3}
                placeholder="Tell us about the project goals, target milestones, and key requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Calls endpoint <code className="text-blue-700 font-mono text-[11px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">POST /api/public/contact</code>
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Submitting...' : 'Submit Contact Inquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
