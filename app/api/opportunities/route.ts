export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const contactId = searchParams.get('contactId');
    const propertyId = searchParams.get('propertyId');

    const where: any = {};

    if (status) {
      where.stato = status;
    }

    if (stage) {
      where.stato = stage;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        contact: true,
        property: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle opportunità' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const opportunity = await prisma.opportunity.create({
      data: {
        titolo: body.titolo,
        tipo: body.tipo || 'VENDITA',
        stato: body.stato || 'LEAD',
        valore: body.valore,
        contactId: body.contactId,
        propertyId: body.propertyId,
        note: body.note,
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'opportunità' },
      { status: 500 }
    );
  }
}

