import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { cognome: { contains: search, mode: 'insensitive' } },
        { ragioneSociale: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.ruoli = { has: role };
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei contatti' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const contact = await prisma.contact.create({
      data: {
        tipo: body.tipo || 'PERSONA_FISICA',
        nome: body.nome,
        cognome: body.cognome,
        ragioneSociale: body.ragioneSociale,
        email: body.email,
        telefono: body.telefono,
        cellulare: body.cellulare,
        indirizzo: body.indirizzo,
        citta: body.citta,
        cap: body.cap,
        provincia: body.provincia,
        codiceFiscale: body.codiceFiscale,
        partitaIva: body.partitaIva,
        ruoli: body.ruoli || [],
        interessi: body.interessi || [],
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        note: body.note,
        consensoPrivacy: body.consensoPrivacy || false,
        consensoMarketing: body.consensoMarketing || false,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione del contatto' },
      { status: 500 }
    );
  }
}

