import { ILead, ILeadDetail, INote, IFollowUp, IDashboardStats, IUser } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('mini_crm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed with status ' + res.status);
  }
  return data;
}

export const api = {
  // AUTH
  async login(email: string, password: string): Promise<{ token: string; user: IUser }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<{ success: boolean; token: string; user: IUser }>(res);
    return { token: data.token, user: data.user };
  },

  async getMe(): Promise<IUser> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ success: boolean; user: IUser }>(res);
    return data.user;
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    }).catch(() => {});
  },

  // LEADS
  async getLeads(params?: {
    status?: string;
    leadSource?: string;
    search?: string;
    sort?: 'newest' | 'oldest';
  }): Promise<ILead[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.leadSource && params.leadSource !== 'All') query.set('leadSource', params.leadSource);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/leads?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ success: boolean; data: ILead[] }>(res);
    return data.data;
  },

  async getLeadById(id: string): Promise<ILeadDetail> {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ success: boolean; data: ILeadDetail }>(res);
    return data.data;
  },

  async createLead(leadData: Partial<ILead>): Promise<ILead> {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(leadData),
    });
    const data = await handleResponse<{ success: boolean; data: ILead }>(res);
    return data.data;
  },

  async updateLead(id: string, updates: Partial<ILead>): Promise<ILead> {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ success: boolean; data: ILead }>(res);
    return data.data;
  },

  async deleteLead(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse<{ success: boolean }>(res);
  },

  // NOTES
  async getLeadNotes(leadId: string): Promise<INote[]> {
    const res = await fetch(`${API_BASE}/leads/${leadId}/notes`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ success: boolean; data: INote[] }>(res);
    return data.data;
  },

  async createNote(leadId: string, content: string): Promise<INote> {
    const res = await fetch(`${API_BASE}/leads/${leadId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ content }),
    });
    const data = await handleResponse<{ success: boolean; data: INote }>(res);
    return data.data;
  },

  async updateNote(noteId: string, content: string): Promise<INote> {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ content }),
    });
    const data = await handleResponse<{ success: boolean; data: INote }>(res);
    return data.data;
  },

  async deleteNote(noteId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse<{ success: boolean }>(res);
  },

  // FOLLOW-UPS
  async getFollowUps(status?: 'pending' | 'completed' | 'all'): Promise<IFollowUp[]> {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/followups${query}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ success: boolean; data: IFollowUp[] }>(res);
    return data.data;
  },

  async createFollowUp(
    leadId: string,
    followUpData: { title: string; dueDate: string; priority?: string; notes?: string }
  ): Promise<IFollowUp> {
    const res = await fetch(`${API_BASE}/leads/${leadId}/followups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(followUpData),
    });
    const data = await handleResponse<{ success: boolean; data: IFollowUp }>(res);
    return data.data;
  },

  async updateFollowUp(id: string, updates: Partial<IFollowUp>): Promise<IFollowUp> {
    const res = await fetch(`${API_BASE}/followups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ success: boolean; data: IFollowUp }>(res);
    return data.data;
  },

  async deleteFollowUp(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/followups/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    await handleResponse<{ success: boolean }>(res);
  },

  // DASHBOARD STATS
  async getDashboardStats(): Promise<IDashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ success: boolean; data: IDashboardStats }>(res);
    return data.data;
  },

  // PUBLIC CONTACT FORM SUBMISSION
  async submitContactForm(formData: {
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    serviceNeeded?: string;
    budget?: string;
    message?: string;
  }): Promise<{ message: string; leadId: string }> {
    const res = await fetch(`${API_BASE}/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return handleResponse(res);
  },

  // RE-SEED DEMO DATA
  async reseedData(): Promise<any> {
    const res = await fetch(`${API_BASE}/public/seed`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
