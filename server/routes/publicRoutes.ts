import { Router, Request, Response } from 'express';
import { dbStore, getDatabaseStatus } from '../config/db.ts';

const router = Router();

// Public website contact form submission endpoint
router.post('/contact', (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, company, message, budget, serviceNeeded } = req.body;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ success: false, message: 'Please provide your full name.' });
      return;
    }

    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, message: 'Please provide your contact phone number.' });
      return;
    }

    const companyName = company && company.trim() ? company.trim() : 'Independent Client';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lead = dbStore.createLead({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: companyName,
      leadSource: 'Website',
      status: 'New',
      budget: budget || 'To be discussed',
      message: message || (serviceNeeded ? `Inquiry regarding: ${serviceNeeded}` : 'Website form submission'),
      followUpDate: tomorrow.toISOString(),
      lastContactedAt: null,
    });

    // Create an automated follow-up reminder for the admin
    dbStore.createFollowUp({
      leadId: lead._id,
      leadName: lead.fullName,
      leadCompany: lead.company,
      title: `Contact website inquiry from ${lead.fullName}`,
      dueDate: tomorrow.toISOString(),
      priority: 'High',
      notes: message ? `Client note: ${message}` : 'New lead received via website contact form',
    });

    // Create initial note recording form receipt
    dbStore.createNote({
      leadId: lead._id,
      author: 'System Contact Form',
      content: `Lead generated automatically from website contact form.${budget ? ` Budget: ${budget}.` : ''}`,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted and registered in our CRM.',
      leadId: lead._id,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to process inquiry', error: error.message });
  }
});

// Seed or reset demo data
router.post('/seed', async (_req: Request, res: Response) => {
  try {
    await dbStore.resetAndSeed();
    res.json({
      success: true,
      message: 'Database successfully seeded with realistic demo data!',
      dbInfo: getDatabaseStatus(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to seed database', error: error.message });
  }
});

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: getDatabaseStatus(),
  });
});

export default router;
