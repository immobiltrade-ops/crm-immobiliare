import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/db';
import { Activity } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const contactId = searchParams.get('contactId');
    const propertyId = searchParams.get('propertyId');
    const opportunityId = searchParams.get('opportunityId');

    let activities = db.activities;

    if (status) {
      activities = activities.filter(a => a.status === status);
    }

    if (assignedTo) {
      activities = activities.filter(a => a.assignedTo === assignedTo);
    }

    if (contactId) {
      activities = activities.filter(a => a.contactId === contactId);
    }

    if (propertyId) {
      activities = activities.filter(a => a.propertyId === propertyId);
    }

    if (opportunityId) {
      activities = activities.filter(a => a.opportunityId === opportunityId);
    }

    // Arricchisci con dati correlati
    const enrichedActivities = activities.map(activity => {
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

    return NextResponse.json(enrichedActivities);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero delle attività' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newActivity: Activity = {
      id: generateId(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.activities.push(newActivity);

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'attività' },
      { status: 500 }
    );
  }
}
