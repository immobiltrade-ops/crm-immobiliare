import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Count contacts
    const totalContacts = await prisma.contact.count();

    // Count properties
    const totalProperties = await prisma.property.count();
    const availableProperties = await prisma.property.count({
      where: { stato: 'DISPONIBILE' },
    });

    // Count opportunities
    const activeOpportunities = await prisma.opportunity.count({
      where: { stato: 'LEAD' },
    });

    const wonOpportunities = await prisma.opportunity.count({
      where: { stato: 'CLOSED_WON' },
    });

    // Calculate total value of active opportunities
    const opportunitiesWithValue = await prisma.opportunity.findMany({
      where: { stato: 'LEAD' },
      select: { valore: true },
    });
    const opportunitiesValue = opportunitiesWithValue.reduce(
      (sum: number, o: { valore: number | null }) => sum + (o.valore || 0),
      0
    );

    // Count appointments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthActivities = await prisma.appointment.count({
      where: {
        data: { gte: startOfMonth },
      },
    });

    // Calculate conversion rate
    const totalOpportunities = await prisma.opportunity.count();
    const conversionRate = totalOpportunities > 0 
      ? (wonOpportunities / totalOpportunities) * 100 
      : 0;

    const stats = {
      totalContacts,
      activeLeads: totalContacts, // Using total contacts as proxy
      totalProperties,
      availableProperties,
      activeOpportunities,
      opportunitiesValue,
      thisMonthActivities,
      conversionRate,
    };

    // Pipeline data by type (using stato as stage)
    const stageOrder = ['LEAD', 'NEGOTIATION', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST'];
    const pipelineData = await Promise.all(
      stageOrder.map(async (stage) => {
        const opps = await prisma.opportunity.findMany({
          where: { stato: stage },
          select: { valore: true },
        });
        return {
          stage,
          count: opps.length,
          value: opps.reduce((sum: number, o: { valore: number | null }) => sum + (o.valore || 0), 0),
        };
      })
    );

    // Recent appointments
    const recentActivities = await prisma.appointment.findMany({
      orderBy: { data: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      stats,
      pipelineData,
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati dashboard' },
      { status: 500 }
    );
  }
}
