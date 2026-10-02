export type LeadStatus = 'New' | 'Contacted' | 'Converted';

export type LeadSource =
  | 'Website'
  | 'LinkedIn'
  | 'Instagram'
  | 'Referral'
  | 'Advertisement'
  | 'Other';

export interface ILead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  leadSource: LeadSource;
  status: LeadStatus;
  notesSummary?: string;
  lastContactedAt?: string | null;
  followUpDate?: string | null;
  budget?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INote {
  _id: string;
  leadId: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFollowUp {
  _id: string;
  leadId: string;
  leadName: string;
  leadCompany: string;
  title: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  completedAt?: string | null;
  notes?: string;
  createdAt: string;
}

export interface ILeadDetail extends ILead {
  notes: INote[];
  followups: IFollowUp[];
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IDashboardStats {
  summary: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    convertedLeads: number;
    conversionRate: number;
    followupsDue: number;
  };
  recentLeads: ILead[];
  upcomingFollowups: IFollowUp[];
  sourceDistribution: Record<string, number>;
  statusDistribution: {
    New: number;
    Contacted: number;
    Converted: number;
  };
  dbInfo: {
    engine: string;
    isMongoose: boolean;
    dbPath: string;
    leadsCount: number;
    usersCount: number;
    notesCount: number;
    followupsCount: number;
  };
}
