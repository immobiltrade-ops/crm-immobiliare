import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        properties: true,
        opportunities: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contatto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del contatto' },
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

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        tipo: body.tipo,
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
        ruoli: body.ruoli,
        interessi: body.interessi,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        note: body.note,
        consensoPrivacy: body.consensoPrivacy,
        consensoMarketing: body.consensoMarketing,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del contatto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contact.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del contatto' },
      { status: 500 }
    );
  }
}
