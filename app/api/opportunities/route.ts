import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/db';
import { Opportunity } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const agentId = searchParams.get('agentId');

    let opportunities = db.opportunities;

    if (status) {
      opportunities = opportunities.filter(o => o.status === status);
    }

    if (stage) {
      opportunities = opportunities.filter(o => o.stage === stage);
    }

    if (agentId) {
      opportunities = opportunities.filter(o => o.agentId === agentId);
    }

    // Arricchisci con dati di property e contact
    const enrichedOpportunities = opportunities.map(opp => {
      const property = db.properties.find(p => p.id === opp.propertyId);
      const contact = db.contacts.find(c => c.id === opp.contactId);
      const agent = db.users.find(u => u.id === opp.agentId);

      return {
        ...opp,
        property,
        contact,
        agent,
      };
    });

    return NextResponse.json(enrichedOpportunities);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero delle opportunità' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newOpportunity: Opportunity = {
      id: generateId(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.opportunities.push(newOpportunity);

    return NextResponse.json(newOpportunity, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'opportunità' },
      { status: 500 }
    );
  }
}
