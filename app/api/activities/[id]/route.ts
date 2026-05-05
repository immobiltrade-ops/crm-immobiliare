import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        contact: true,
        property: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appuntamento non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'appuntamento' },
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

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        titolo:     body.titolo,
        tipo:       body.tipo,
        data:       new Date(body.data),
        durata:     body.durata,
        contactId:  body.contactId,
        propertyId: body.propertyId,
        note:       body.note,
      },
      include: {
        contact: true,
        property: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'appuntamento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'appuntamento' },
      { status: 500 }
    );
  }
}