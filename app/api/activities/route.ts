export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const contactId = searchParams.get('contactId');
    const propertyId = searchParams.get('propertyId');

    const where: any = {};

    if (contactId) {
      where.contactId = contactId;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);
      where.data = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        contact: true,
        property: true,
      },
      orderBy: { data: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli appuntamenti' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const appointment = await prisma.appointment.create({
      data: {
        titolo: body.titolo,
        tipo: body.tipo || 'VISITA',
        data: new Date(body.data),
        durata: body.durata,
        contactId: body.contactId,
        propertyId: body.propertyId,
        note: body.note,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'appuntamento' },
      { status: 500 }
    );
  }
}

