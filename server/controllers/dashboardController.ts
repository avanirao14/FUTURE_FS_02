import { Request, Response } from 'express';
import { dbStore, getDatabaseStatus } from '../config/db.ts';

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    const leads = dbStore.getLeads();
    const followups = dbStore.getFollowUps();

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'New').length;
    const contactedLeads = leads.filter((l) => l.status === 'Contacted').length;
    const convertedLeads = leads.filter((l) => l.status === 'Converted').length;

    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Follow-ups due: incomplete follow-ups where due date is on or before end of today
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const followupsDue = followups.filter((f) => {
      if (f.completed) return false;
      const due = new Date(f.dueDate);
      return due <= endOfToday;
    }).length;

    // Upcoming pending followups (top 5)
    const upcomingFollowups = followups
      .filter((f) => !f.completed)
      .slice(0, 5);

    // Recent leads (top 5)
    const recentLeads = leads.slice(0, 5);

    // Lead Source distribution
    const sourceDistribution: Record<string, number> = {
      Website: 0,
      LinkedIn: 0,
      Instagram: 0,
      Referral: 0,
      Advertisement: 0,
      Other: 0,
    };

    leads.forEach((l) => {
      if (sourceDistribution[l.leadSource] !== undefined) {
        sourceDistribution[l.leadSource]++;
      } else {
        sourceDistribution['Other'] = (sourceDistribution['Other'] || 0) + 1;
      }
    });

    // Status distribution
    const statusDistribution = {
      New: newLeads,
      Contacted: contactedLeads,
      Converted: convertedLeads,
    };

    const dbInfo = getDatabaseStatus();

    res.json({
      success: true,
      data: {
        summary: {
          totalLeads,
          newLeads,
          contactedLeads,
          convertedLeads,
          conversionRate,
          followupsDue,
        },
        recentLeads,
        upcomingFollowups,
        sourceDistribution,
        statusDistribution,
        dbInfo,
      },
    });
  } catch (error: any) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard statistics', error: error.message });
  }
}
