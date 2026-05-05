export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunità non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'opportunità' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        titolo: body.titolo,
        tipo: body.tipo,
        stato: body.stato,
        valore: body.valore,
        contactId: body.contactId,
        propertyId: body.propertyId,
        note: body.note,
      },
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'opportunità' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.opportunity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'opportunità' },
      { status: 500 }
    );
  }
}
