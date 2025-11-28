import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DashboardStats, PipelineData } from '@/types';

export async function GET() {
  try {
    const activeOpportunities = db.opportunities.filter(o => o.status === 'active');
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const stats: DashboardStats = {
      totalContacts: db.contacts.length,
      activeLeads: db.contacts.filter(c => c.roles.includes('buyer') || c.roles.includes('tenant')).length,
      totalProperties: db.properties.length,
      availableProperties: db.properties.filter(p => p.status === 'available').length,
      activeOpportunities: activeOpportunities.length,
      opportunitiesValue: activeOpportunities.reduce((sum, o) => sum + o.expectedValue, 0),
      thisMonthActivities: db.activities.filter(a => 
        new Date(a.createdAt) >= thisMonth
      ).length,
      conversionRate: activeOpportunities.length > 0 
        ? (db.opportunities.filter(o => o.status === 'won').length / db.opportunities.length) * 100 
        : 0,
    };

    // Pipeline data
    const stageOrder = ['new_lead', 'qualified', 'visit', 'proposal', 'negotiation', 'closing'];
    const pipelineData: PipelineData[] = stageOrder.map(stage => {
      const opps = activeOpportunities.filter(o => o.stage === stage);
      return {
        stage: stage as any,
        count: opps.length,
        value: opps.reduce((sum, o) => sum + o.expectedValue, 0),
      };
    });

    // Recent activities
    const recentActivities = db.activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(activity => {
        const contact = activity.contactId ? db.contacts.find(c => c.id === activity.contactId) : null;
        const property = activity.propertyId ? db.properties.find(p => p.id === activity.propertyId) : null;
        const assignee = db.users.find(u => u.id === activity.assignedTo);

        return {
          ...activity,
          contact,
          property,
          assignee,
        };
      });

    return NextResponse.json({
      stats,
      pipelineData,
      recentActivities,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati dashboard' },
      { status: 500 }
    );
  }
}
