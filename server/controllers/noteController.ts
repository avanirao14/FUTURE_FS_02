import { Request, Response } from 'express';
import { dbStore } from '../config/db.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function getNotesByLeadId(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const notes = dbStore.getNotesByLeadId(id);
    res.json({
      success: true,
      data: notes,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve notes', error: error.message });
  }
}

export async function createNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params; // lead id
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Note content cannot be empty.' });
      return;
    }

    const lead = dbStore.getLeadById(id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    const authorName = req.user?.name || 'Administrator';
    const note = dbStore.createNote({
      leadId: id,
      author: authorName,
      content: content.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: note,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create note', error: error.message });
  }
}

export async function updateNote(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Note content cannot be empty.' });
      return;
    }

    const updated = dbStore.updateNote(id, content.trim());
    if (!updated) {
      res.status(404).json({ success: false, message: 'Note not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update note', error: error.message });
  }
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteNote(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Note not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete note', error: error.message });
  }
}
