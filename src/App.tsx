import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { FollowUps } from './pages/FollowUps';
import { WebsiteFormDemo } from './pages/WebsiteFormDemo';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { LeadFormModal } from './components/LeadFormModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ILead, IDashboardStats } from './types';
import { api } from './services/api';

const CRMAppContent: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data states
  const [leads, setLeads] = useState<ILead[]>([]);
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ILead | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete confirmation modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all leads and dashboard stats
  const fetchData = useCallback(async (showLoading = false) => {
    if (!isAuthenticated) return;
    try {
      if (showLoading) setIsLoadingData(true);
      setIsRefreshing(true);
      const [leadsData, statsData] = await Promise.all([
        api.getLeads(),
        api.getDashboardStats(),
      ]);
      setLeads(leadsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      showToast(err.message || 'Failed to refresh CRM data', 'error');
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData(true);
    }
  }, [isAuthenticated, fetchData]);

  // Handle lead submission (Add or Edit)
  const handleLeadFormSubmit = async (formData: Partial<ILead>) => {
    try {
      if (editingLead) {
        await api.updateLead(editingLead._id, formData);
        showToast('Lead updated successfully!', 'success');
      } else {
        await api.createLead(formData);
        showToast('New client lead created successfully!', 'success');
      }
      setIsLeadFormOpen(false);
      setEditingLead(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save lead', 'error');
      throw err;
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (lead: ILead) => {
    setEditingLead(lead);
    setIsLeadFormOpen(true);
    setIsDetailOpen(false);
  };

  // Open Detail Modal
  const handleOpenDetail = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsDetailOpen(true);
  };

  // Trigger Delete confirmation
  const handleTriggerDelete = (leadId: string, leadName: string) => {
    setLeadToDelete({ id: leadId, name: leadName });
    setIsDeleteDialogOpen(true);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteLead(leadToDelete.id);
      showToast(`Lead "${leadToDelete.name}" and related records deleted`, 'success');
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);
      setIsDetailOpen(false);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete lead', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle lead creation from simulator
  const handleSimulatorLeadCreated = async (leadId: string) => {
    await fetchData();
    handleOpenDetail(leadId);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Initializing LeadPulse CRM...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        leadsCount={leads.length}
        followupsDueCount={stats?.summary?.followupsDue || 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Navbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddLeadModal={() => {
            setEditingLead(null);
            setIsLeadFormOpen(true);
          }}
          onOpenWebSimulator={() => setActiveTab('simulator')}
          onRefresh={() => fetchData()}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              isLoading={isLoadingData}
              onOpenLeadDetail={handleOpenDetail}
              onOpenAddLeadModal={() => {
                setEditingLead(null);
                setIsLeadFormOpen(true);
              }}
              onOpenWebSimulator={() => setActiveTab('simulator')}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'leads' && (
            <Leads
              leads={leads}
              isLoading={isLoadingData}
              onRefresh={() => fetchData()}
              onOpenAddModal={() => {
                setEditingLead(null);
                setIsLeadFormOpen(true);
              }}
              onOpenEditModal={handleOpenEdit}
              onOpenDetailModal={handleOpenDetail}
              onConfirmDelete={handleTriggerDelete}
            />
          )}

          {activeTab === 'followups' && (
            <FollowUps
              leads={leads}
              onOpenLeadDetail={handleOpenDetail}
              onRefreshData={() => fetchData()}
            />
          )}

          {activeTab === 'simulator' && (
            <WebsiteFormDemo onLeadCreated={handleSimulatorLeadCreated} />
          )}

          {activeTab === 'settings' && (
            <Settings
              stats={stats}
              leads={leads}
              onDataReset={() => fetchData(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <LeadFormModal
        isOpen={isLeadFormOpen}
        onClose={() => {
          setIsLeadFormOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleLeadFormSubmit}
        initialData={editingLead}
      />

      <LeadDetailModal
        isOpen={isDetailOpen}
        leadId={selectedLeadId}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLeadId(null);
        }}
        onEditLead={(lead) => handleOpenEdit(lead)}
        onDeleteLead={handleTriggerDelete}
        onStatusChangeSuccess={() => fetchData()}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Client Lead Record"
        message={`Are you sure you want to permanently delete "${leadToDelete?.name}"? All associated notes and follow-up reminders will also be deleted. This action cannot be undone.`}
        confirmText="Yes, Delete Lead"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setLeadToDelete(null);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CRMAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
