export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const totalContacts = await prisma.contact.count();

    const totalProperties = await prisma.property.count();
    const availableProperties = await prisma.property.count({
      where: { stato: 'DISPONIBILE' },
    });

    const activeOpportunities = await prisma.opportunity.count({
      where: { stato: { in: ['LEAD', 'NEGOTIATION', 'PROPOSAL'] } },
    });

    const wonOpportunities = await prisma.opportunity.count({
      where: { stato: 'CLOSED_WON' },
    });

    const opportunitiesWithValue = await prisma.opportunity.findMany({
      where: { stato: { in: ['LEAD', 'NEGOTIATION', 'PROPOSAL'] } },
      select: { valore: true },
    });
    const opportunitiesValue = opportunitiesWithValue.reduce(
      (sum: number, o: { valore: number | null }) => sum + (o.valore || 0),
      0
    );

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthActivities = await prisma.appointment.count({
      where: { data: { gte: startOfMonth } },
    });

    const totalOpportunities = await prisma.opportunity.count();
    const conversionRate =
      totalOpportunities > 0
        ? (wonOpportunities / totalOpportunities) * 100
        : 0;

    const activeLeads = await prisma.contact.count({
      where: {
        opportunities: {
          some: { stato: { in: ['LEAD', 'NEGOTIATION', 'PROPOSAL'] } },
        },
      },
    });

    const stats = {
      totalContacts,
      activeLeads,
      totalProperties,
      availableProperties,
      activeOpportunities,
      opportunitiesValue,
      thisMonthActivities,
      conversionRate,
    };

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
          value: opps.reduce(
            (sum: number, o: { valore: number | null }) => sum + (o.valore || 0),
            0
          ),
        };
      })
    );

    const recentActivities = await prisma.appointment.findMany({
      orderBy: { data: 'desc' },
      take: 10,
      include: {
        contact: {
          select: { nome: true, cognome: true },
        },
        property: {
          select: { titolo: true },
        },
      },
    });

    return NextResponse.json({ stats, pipelineData, recentActivities });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati dashboard' },
      { status: 500 }
    );
  }
}