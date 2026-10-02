import { Request, Response } from 'express';
import { dbStore } from '../config/db.ts';

export async function getFollowUps(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.query;
    let followups = dbStore.getFollowUps();

    if (status === 'pending') {
      followups = followups.filter((f) => !f.completed);
    } else if (status === 'completed') {
      followups = followups.filter((f) => f.completed);
    }

    res.json({
      success: true,
      count: followups.length,
      data: followups,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch follow-ups', error: error.message });
  }
}

export async function createFollowUpForLead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params; // lead id
    const { title, dueDate, priority, notes } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Follow-up title is required.' });
      return;
    }
    if (!dueDate) {
      res.status(400).json({ success: false, message: 'Due date is required.' });
      return;
    }

    const lead = dbStore.getLeadById(id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    const followup = dbStore.createFollowUp({
      leadId: lead._id,
      leadName: lead.fullName,
      leadCompany: lead.company,
      title: title.trim(),
      dueDate,
      priority: priority || 'Medium',
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: followup,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to schedule follow-up', error: error.message });
  }
}

export async function updateFollowUp(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, dueDate, priority, completed, notes } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title.trim();
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (priority !== undefined) updates.priority = priority;
    if (completed !== undefined) updates.completed = Boolean(completed);
    if (notes !== undefined) updates.notes = notes;

    const updated = dbStore.updateFollowUp(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Follow-up item not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Follow-up updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update follow-up', error: error.message });
  }
}

export async function deleteFollowUp(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteFollowUp(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Follow-up item not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Follow-up deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete follow-up', error: error.message });
  }
}
