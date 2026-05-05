import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const city = searchParams.get('city');

    const where: any = {};

    if (search) {
      where.OR = [
        { titolo: { contains: search, mode: 'insensitive' } },
        { indirizzo: { contains: search, mode: 'insensitive' } },
        { citta: { contains: search, mode: 'insensitive' } },
        { descrizione: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.stato = status;
    if (type) where.tipo = type;
    if (city) where.citta = { equals: city, mode: 'insensitive' };

    const properties = await prisma.property.findMany({
      where,
      include: {
        owners: {
          include: { contact: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli immobili' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const property = await prisma.property.create({
      data: {
        titolo: body.titolo,
        tipo: body.tipo || 'APPARTAMENTO',
        stato: body.stato || 'DISPONIBILE',
        prezzo: body.prezzo,
        superficie: body.superficie,
        locali: body.locali,
        bagni: body.bagni,
        piano: body.piano,
        indirizzo: body.indirizzo,
        citta: body.citta,
        cap: body.cap,
        provincia: body.provincia,
        descrizione: body.descrizione,
        caratteristiche: body.caratteristiche || [],
        acceptsExchange: body.acceptsExchange || false,
        exchangeNotes: body.exchangeNotes,
        note: body.note,
      },
    });

    // Collega i proprietari se forniti
    if (Array.isArray(body.ownerIds) && body.ownerIds.length > 0) {
      await prisma.propertyOwner.createMany({
        data: body.ownerIds.map((contactId: string) => ({
          propertyId: property.id,
          contactId,
        })),
        skipDuplicates: true,
      });
    }

    const result = await prisma.property.findUnique({
      where: { id: property.id },
      include: { owners: { include: { contact: true } } },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'immobile' },
      { status: 500 }
    );
  }
}
