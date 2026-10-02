import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mini_crm_db.json');

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin';
  createdAt: string;
}

export interface ILead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  leadSource: 'Website' | 'LinkedIn' | 'Instagram' | 'Referral' | 'Advertisement' | 'Other';
  status: 'New' | 'Contacted' | 'Converted';
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

interface DatabaseSchema {
  users: IUser[];
  leads: ILead[];
  notes: INote[];
  followups: IFollowUp[];
}

let isMongooseConnected = false;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read database from file
function readDbFile(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading JSON DB file:', error);
  }
  return { users: [], leads: [], notes: [], followups: [] };
}

// Write database to file
function writeDbFile(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing JSON DB file:', error);
  }
}

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB via MONGODB_URI...');
      await mongoose.connect(mongoUri);
      isMongooseConnected = true;
      console.log('Successfully connected to MongoDB!');
      return;
    } catch (err) {
      console.warn('MongoDB connection failed, falling back to persistent document store:', err);
    }
  }

  console.log(`Database engine: Persistent File-backed Document Database active at ${DB_FILE}`);
  // Initialize default data if empty
  const current = readDbFile();
  if (!current.users || current.users.length === 0) {
    await seedDefaultData();
  }
}

export function getDatabaseStatus() {
  const current = readDbFile();
  return {
    engine: isMongooseConnected ? 'MongoDB (Mongoose)' : 'Persistent Document Database (ACID JSON File)',
    isMongoose: isMongooseConnected,
    dbPath: DB_FILE,
    leadsCount: current.leads.length,
    usersCount: current.users.length,
    notesCount: current.notes.length,
    followupsCount: current.followups.length,
  };
}

export const dbStore = {
  // USERS
  findUserByEmail(email: string): IUser | undefined {
    const db = readDbFile();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id: string): IUser | undefined {
    const db = readDbFile();
    return db.users.find((u) => u._id === id);
  },

  createUser(user: Omit<IUser, '_id' | 'createdAt'>): IUser {
    const db = readDbFile();
    const newUser: IUser = {
      ...user,
      _id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDbFile(db);
    return newUser;
  },

  // LEADS
  getLeads(filter?: { status?: string; leadSource?: string; search?: string; sort?: 'newest' | 'oldest' }): ILead[] {
    const db = readDbFile();
    let leads = [...db.leads];

    if (filter?.status && filter.status !== 'All') {
      leads = leads.filter((l) => l.status === filter.status);
    }

    if (filter?.leadSource && filter.leadSource !== 'All') {
      leads = leads.filter((l) => l.leadSource === filter.leadSource);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      leads = leads.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q)
      );
    }

    // Sort
    leads.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return filter?.sort === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    return leads;
  },

  getLeadById(id: string): ILead | undefined {
    const db = readDbFile();
    return db.leads.find((l) => l._id === id);
  },

  createLead(data: Omit<ILead, '_id' | 'createdAt' | 'updatedAt'>): ILead {
    const db = readDbFile();
    const now = new Date().toISOString();
    const newLead: ILead = {
      ...data,
      _id: 'lead_' + Date.now() + Math.random().toString(36).substring(2, 7),
      createdAt: now,
      updatedAt: now,
    };
    db.leads.unshift(newLead);
    writeDbFile(db);
    return newLead;
  },

  updateLead(id: string, updates: Partial<ILead>): ILead | null {
    const db = readDbFile();
    const index = db.leads.findIndex((l) => l._id === id);
    if (index === -1) return null;

    db.leads[index] = {
      ...db.leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDbFile(db);
    return db.leads[index];
  },

  deleteLead(id: string): boolean {
    const db = readDbFile();
    const initialCount = db.leads.length;
    db.leads = db.leads.filter((l) => l._id !== id);
    // Also cascade delete related notes and followups
    db.notes = db.notes.filter((n) => n.leadId !== id);
    db.followups = db.followups.filter((f) => f.leadId !== id);

    if (db.leads.length !== initialCount) {
      writeDbFile(db);
      return true;
    }
    return false;
  },

  // NOTES
  getNotesByLeadId(leadId: string): INote[] {
    const db = readDbFile();
    return db.notes
      .filter((n) => n.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createNote(data: { leadId: string; author: string; content: string }): INote {
    const db = readDbFile();
    const now = new Date().toISOString();
    const newNote: INote = {
      _id: 'note_' + Date.now() + Math.random().toString(36).substring(2, 7),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    db.notes.push(newNote);
    writeDbFile(db);
    return newNote;
  },

  updateNote(id: string, content: string): INote | null {
    const db = readDbFile();
    const index = db.notes.findIndex((n) => n._id === id);
    if (index === -1) return null;

    db.notes[index].content = content;
    db.notes[index].updatedAt = new Date().toISOString();
    writeDbFile(db);
    return db.notes[index];
  },

  deleteNote(id: string): boolean {
    const db = readDbFile();
    const initialCount = db.notes.length;
    db.notes = db.notes.filter((n) => n._id !== id);
    if (db.notes.length !== initialCount) {
      writeDbFile(db);
      return true;
    }
    return false;
  },

  // FOLLOW-UPS
  getFollowUps(): IFollowUp[] {
    const db = readDbFile();
    return [...db.followups].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  getFollowUpsByLeadId(leadId: string): IFollowUp[] {
    const db = readDbFile();
    return db.followups.filter((f) => f.leadId === leadId);
  },

  createFollowUp(data: {
    leadId: string;
    leadName: string;
    leadCompany: string;
    title: string;
    dueDate: string;
    priority?: 'Low' | 'Medium' | 'High';
    notes?: string;
  }): IFollowUp {
    const db = readDbFile();
    const newFollowUp: IFollowUp = {
      _id: 'fu_' + Date.now() + Math.random().toString(36).substring(2, 7),
      leadId: data.leadId,
      leadName: data.leadName,
      leadCompany: data.leadCompany,
      title: data.title,
      dueDate: data.dueDate,
      priority: data.priority || 'Medium',
      completed: false,
      completedAt: null,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    db.followups.push(newFollowUp);

    // Update lead's followUpDate
    const leadIndex = db.leads.findIndex((l) => l._id === data.leadId);
    if (leadIndex !== -1) {
      db.leads[leadIndex].followUpDate = data.dueDate;
    }

    writeDbFile(db);
    return newFollowUp;
  },

  updateFollowUp(id: string, updates: Partial<IFollowUp>): IFollowUp | null {
    const db = readDbFile();
    const index = db.followups.findIndex((f) => f._id === id);
    if (index === -1) return null;

    if (updates.completed !== undefined) {
      updates.completedAt = updates.completed ? new Date().toISOString() : null;
    }

    db.followups[index] = {
      ...db.followups[index],
      ...updates,
    };
    writeDbFile(db);
    return db.followups[index];
  },

  deleteFollowUp(id: string): boolean {
    const db = readDbFile();
    const initialCount = db.followups.length;
    db.followups = db.followups.filter((f) => f._id !== id);
    if (db.followups.length !== initialCount) {
      writeDbFile(db);
      return true;
    }
    return false;
  },

  resetAndSeed: seedDefaultData,
};

export async function seedDefaultData(): Promise<void> {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const now = new Date();

  const getDateOffset = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const sampleUsers: IUser[] = [
    {
      _id: 'usr_admin_default',
      name: 'Future Interns Admin',
      email: 'admin@futureinterns.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleLeads: ILead[] = [
    {
      _id: 'lead_demo_01',
      fullName: 'Aarav Patel',
      email: 'aarav.patel@techflow.io',
      phone: '+91 98765 43210',
      company: 'TechFlow Solutions',
      leadSource: 'Website',
      status: 'New',
      budget: '$5,000 - $10,000',
      message: 'Inquired via website contact form regarding enterprise web application redesign.',
      followUpDate: getDateOffset(1),
      createdAt: getDateOffset(-1),
      updatedAt: getDateOffset(-1),
    },
    {
      _id: 'lead_demo_02',
      fullName: 'Sophia Martinez',
      email: 's.martinez@apexbrands.com',
      phone: '+1 (555) 234-8901',
      company: 'Apex Brand Studio',
      leadSource: 'LinkedIn',
      status: 'Contacted',
      lastContactedAt: getDateOffset(-2),
      budget: '$15,000+',
      message: 'Connected through LinkedIn InMail regarding custom CRM module development.',
      followUpDate: getDateOffset(0), // due today
      createdAt: getDateOffset(-4),
      updatedAt: getDateOffset(-2),
    },
    {
      _id: 'lead_demo_03',
      fullName: 'Rohan Sharma',
      email: 'rohan@sharmalogistics.in',
      phone: '+91 98230 11223',
      company: 'Sharma Logistics India',
      leadSource: 'Referral',
      status: 'Converted',
      lastContactedAt: getDateOffset(-1),
      budget: '$20,000',
      message: 'Referred by past client Vikram. Contract signed for fleet dispatch portal.',
      followUpDate: null,
      createdAt: getDateOffset(-10),
      updatedAt: getDateOffset(-1),
    },
    {
      _id: 'lead_demo_04',
      fullName: 'Emily Chen',
      email: 'emily@luminaryhealth.org',
      phone: '+1 (555) 492-7711',
      company: 'Luminary Health',
      leadSource: 'Instagram',
      status: 'New',
      budget: '$8,000',
      message: 'Saw our UI/UX showcase on Instagram and reached out for patient intake system.',
      followUpDate: getDateOffset(3),
      createdAt: getDateOffset(-2),
      updatedAt: getDateOffset(-2),
    },
    {
      _id: 'lead_demo_05',
      fullName: 'Marcus Vance',
      email: 'mvance@vanceholdings.co.uk',
      phone: '+44 20 7946 0912',
      company: 'Vance Capital Partners',
      leadSource: 'Advertisement',
      status: 'Contacted',
      lastContactedAt: getDateOffset(-3),
      budget: '$30,000+',
      message: 'Clicked Google Search ad for fintech web portal modernization.',
      followUpDate: getDateOffset(-1), // overdue
      createdAt: getDateOffset(-7),
      updatedAt: getDateOffset(-3),
    },
    {
      _id: 'lead_demo_06',
      fullName: 'Priya Iyer',
      email: 'priya.iyer@cloudscale.net',
      phone: '+91 97112 33445',
      company: 'CloudScale AI',
      leadSource: 'Website',
      status: 'Converted',
      lastContactedAt: getDateOffset(-2),
      budget: '$12,500',
      message: 'Submitted website contact form with RFP attached. Proposal accepted.',
      followUpDate: null,
      createdAt: getDateOffset(-14),
      updatedAt: getDateOffset(-2),
    },
    {
      _id: 'lead_demo_07',
      fullName: 'David Kowalski',
      email: 'david@greenleafventures.com',
      phone: '+1 (555) 678-9012',
      company: 'GreenLeaf Ventures',
      leadSource: 'Other',
      status: 'New',
      budget: '$4,000',
      message: 'Met at regional startup networking summit; needs MVP landing and booking flow.',
      followUpDate: getDateOffset(2),
      createdAt: getDateOffset(-1),
      updatedAt: getDateOffset(-1),
    },
    {
      _id: 'lead_demo_08',
      fullName: 'Ananya Deshmukh',
      email: 'ananya@nexusfintech.io',
      phone: '+91 99887 66554',
      company: 'Nexus FinTech',
      leadSource: 'LinkedIn',
      status: 'Contacted',
      lastContactedAt: getDateOffset(-1),
      budget: '$18,000',
      message: 'Reached out after reading our tech case study on scalable backend architecture.',
      followUpDate: getDateOffset(1),
      createdAt: getDateOffset(-5),
      updatedAt: getDateOffset(-1),
    },
    {
      _id: 'lead_demo_09',
      fullName: 'Liam O’Connor',
      email: 'liam@dublindesignworks.ie',
      phone: '+353 1 496 0123',
      company: 'Dublin Design Works',
      leadSource: 'Website',
      status: 'New',
      budget: '$6,500',
      message: 'Submitted website form requesting audit of existing legacy CRM setup.',
      followUpDate: getDateOffset(4),
      createdAt: getDateOffset(0),
      updatedAt: getDateOffset(0),
    },
    {
      _id: 'lead_demo_10',
      fullName: 'Neha Verma',
      email: 'neha@edunextacademy.com',
      phone: '+91 98450 77889',
      company: 'EduNext Academy',
      leadSource: 'Referral',
      status: 'Converted',
      lastContactedAt: getDateOffset(-3),
      budget: '$14,000',
      message: 'Student management module integration completed and delivered successfully.',
      followUpDate: null,
      createdAt: getDateOffset(-20),
      updatedAt: getDateOffset(-3),
    },
  ];

  const sampleNotes: INote[] = [
    {
      _id: 'note_demo_01',
      leadId: 'lead_demo_01',
      author: 'Future Interns Admin',
      content: 'Received initial website submission. Client is looking for 8-week delivery timeframe.',
      createdAt: getDateOffset(-1),
      updatedAt: getDateOffset(-1),
    },
    {
      _id: 'note_demo_02',
      leadId: 'lead_demo_02',
      author: 'Future Interns Admin',
      content: 'Completed discovery call on Zoom. Shared portfolio deck with design system examples.',
      createdAt: getDateOffset(-2),
      updatedAt: getDateOffset(-2),
    },
    {
      _id: 'note_demo_03',
      leadId: 'lead_demo_03',
      author: 'Future Interns Admin',
      content: 'Contract and SLA signed. Project kickoff scheduled for Monday 10:00 AM.',
      createdAt: getDateOffset(-1),
      updatedAt: getDateOffset(-1),
    },
    {
      _id: 'note_demo_04',
      leadId: 'lead_demo_05',
      author: 'Future Interns Admin',
      content: 'Sent detailed rate card and architectural outline. Awaiting CFO sign-off.',
      createdAt: getDateOffset(-3),
      updatedAt: getDateOffset(-3),
    },
  ];

  const sampleFollowUps: IFollowUp[] = [
    {
      _id: 'fu_demo_01',
      leadId: 'lead_demo_02',
      leadName: 'Sophia Martinez',
      leadCompany: 'Apex Brand Studio',
      title: 'Send formal statement of work (SOW) & pricing tiers',
      dueDate: getDateOffset(0),
      priority: 'High',
      completed: false,
      completedAt: null,
      notes: 'Prepare quote with React and Express full stack scope.',
      createdAt: getDateOffset(-2),
    },
    {
      _id: 'fu_demo_02',
      leadId: 'lead_demo_01',
      leadName: 'Aarav Patel',
      leadCompany: 'TechFlow Solutions',
      title: 'Schedule initial product requirements discovery session',
      dueDate: getDateOffset(1),
      priority: 'Medium',
      completed: false,
      completedAt: null,
      notes: 'Email calendar invite link with Google Meet.',
      createdAt: getDateOffset(-1),
    },
    {
      _id: 'fu_demo_03',
      leadId: 'lead_demo_05',
      leadName: 'Marcus Vance',
      leadCompany: 'Vance Capital Partners',
      title: 'Follow up on executive proposal feedback',
      dueDate: getDateOffset(-1),
      priority: 'High',
      completed: false,
      completedAt: null,
      notes: 'Call UK office phone number if email receives no response.',
      createdAt: getDateOffset(-4),
    },
    {
      _id: 'fu_demo_04',
      leadId: 'lead_demo_08',
      leadName: 'Ananya Deshmukh',
      leadCompany: 'Nexus FinTech',
      title: 'Share API architecture documentation & compliance questionnaire',
      dueDate: getDateOffset(1),
      priority: 'Low',
      completed: false,
      completedAt: null,
      notes: 'Highlight SOC2 and secure role-based access patterns.',
      createdAt: getDateOffset(-1),
    },
  ];

  writeDbFile({
    users: sampleUsers,
    leads: sampleLeads,
    notes: sampleNotes,
    followups: sampleFollowUps,
  });

  console.log('Database successfully seeded with realistic demo data for Future Interns Task 2!');
}
