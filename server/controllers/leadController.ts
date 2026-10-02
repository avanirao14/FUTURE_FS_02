import { Request, Response } from 'express';
import { dbStore, ILead } from '../config/db.ts';

const VALID_STATUSES: Array<'New' | 'Contacted' | 'Converted'> = ['New', 'Contacted', 'Converted'];
const VALID_SOURCES: Array<'Website' | 'LinkedIn' | 'Instagram' | 'Referral' | 'Advertisement' | 'Other'> = [
  'Website',
  'LinkedIn',
  'Instagram',
  'Referral',
  'Advertisement',
  'Other',
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getLeads(req: Request, res: Response): Promise<void> {
  try {
    const { status, leadSource, search, sort } = req.query;

    const leads = dbStore.getLeads({
      status: status ? String(status) : undefined,
      leadSource: leadSource ? String(leadSource) : undefined,
      search: search ? String(search) : undefined,
      sort: sort === 'oldest' ? 'oldest' : 'newest',
    });

    res.json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error: any) {
    console.error('getLeads error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leads', error: error.message });
  }
}

export async function getLeadById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const lead = dbStore.getLeadById(id);

    if (!lead) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }

    const notes = dbStore.getNotesByLeadId(id);
    const followups = dbStore.getFollowUpsByLeadId(id);

    res.json({
      success: true,
      data: {
        ...lead,
        notes,
        followups,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch lead details', error: error.message });
  }
}

export async function createLead(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, email, phone, company, leadSource, status, budget, message, followUpDate } = req.body;

    // Validation
    const errors: Record<string, string> = {};

    if (!fullName || !fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }
    if (!email || !email.trim()) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!phone || !phone.trim()) {
      errors.phone = 'Phone number is required.';
    }
    if (!company || !company.trim()) {
      errors.company = 'Company name is required.';
    }

    const finalStatus = (status && VALID_STATUSES.includes(status)) ? status : 'New';
    const finalSource = (leadSource && VALID_SOURCES.includes(leadSource)) ? leadSource : 'Website';

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    const newLead = dbStore.createLead({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company.trim(),
      leadSource: finalSource,
      status: finalStatus,
      budget: budget ? budget.trim() : '',
      message: message ? message.trim() : '',
      followUpDate: followUpDate || null,
      lastContactedAt: finalStatus === 'Contacted' ? new Date().toISOString() : null,
    });

    // If an initial follow-up date was set, also create a follow-up item
    if (followUpDate) {
      dbStore.createFollowUp({
        leadId: newLead._id,
        leadName: newLead.fullName,
        leadCompany: newLead.company,
        title: `Initial follow-up with ${newLead.fullName}`,
        dueDate: followUpDate,
        priority: 'Medium',
        notes: message || 'Lead follow-up created upon lead entry',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead,
    });
  } catch (error: any) {
    console.error('createLead error:', error);
    res.status(500).json({ success: false, message: 'Failed to create lead', error: error.message });
  }
}

export async function updateLead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = dbStore.getLeadById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }

    const { fullName, email, phone, company, leadSource, status, budget, message, followUpDate, lastContactedAt } = req.body;

    const updates: Partial<ILead> = {};

    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (email !== undefined) {
      if (!isValidEmail(email.trim())) {
        res.status(400).json({ success: false, message: 'Invalid email address provided.' });
        return;
      }
      updates.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) updates.phone = phone.trim();
    if (company !== undefined) updates.company = company.trim();
    if (budget !== undefined) updates.budget = budget.trim();
    if (message !== undefined) updates.message = message.trim();
    if (followUpDate !== undefined) updates.followUpDate = followUpDate;

    if (leadSource !== undefined) {
      if (VALID_SOURCES.includes(leadSource)) {
        updates.leadSource = leadSource;
      }
    }

    if (status !== undefined) {
      if (VALID_STATUSES.includes(status)) {
        updates.status = status;
        if (status === 'Contacted' && !existing.lastContactedAt) {
          updates.lastContactedAt = new Date().toISOString();
        }
      }
    }

    if (lastContactedAt !== undefined) {
      updates.lastContactedAt = lastContactedAt;
    }

    const updated = dbStore.updateLead(id, updates);

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update lead', error: error.message });
  }
}

export async function deleteLead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteLead(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }

    res.json({
      success: true,
      message: 'Lead and associated records deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete lead', error: error.message });
  }
}
