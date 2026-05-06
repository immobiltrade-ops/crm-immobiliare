import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function generateInternalCode(citta: string | undefined, prezzo: number | undefined): string {
  const prefix = (citta || 'IMM').substring(0, 3).toUpperCase();
  if (!prezzo) return prefix;
  const priceK = Math.round(prezzo / 1000);
  return `${prefix}${priceK}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        owners: {
          include: {
            contact: true,
          },
        },
        opportunities: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Immobile non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'immobile' },
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

    const internalCode = body.internalCode || generateInternalCode(body.citta, body.prezzo);

    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        titolo:          body.titolo,
        tipo:            body.tipo,
        stato:           body.stato,
        prezzo:          body.prezzo,
        superficie:      body.superficie,
        locali:          body.locali,
        bagni:           body.bagni,
        piano:           body.piano,
        indirizzo:       body.indirizzo,
        citta:           body.citta,
        cap:             body.cap,
        provincia:       body.provincia,
        descrizione:     body.descrizione,
        caratteristiche: body.caratteristiche || [],
        acceptsExchange: body.acceptsExchange || false,
        exchangeNotes:   body.exchangeNotes,
        internalCode,
        note:            body.note,
      },
    });

    if (Array.isArray(body.ownerIds)) {
      await prisma.propertyOwner.deleteMany({
        where: { propertyId: params.id },
      });

      if (body.ownerIds.length > 0) {
        await prisma.propertyOwner.createMany({
          data: body.ownerIds.map((contactId: string) => ({
            propertyId: params.id,
            contactId,
          })),
          skipDuplicates: true,
        });
      }
    }

    if (body.ownerId) {
      await prisma.propertyOwner.upsert({
        where: {
          propertyId_contactId: {
            propertyId: params.id,
            contactId: body.ownerId,
          },
        },
        create: {
          propertyId: params.id,
          contactId: body.ownerId,
        },
        update: {},
      });
    }

    const result = await prisma.property.findUnique({
      where: { id: params.id },
      include: { owners: { include: { contact: true } } },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'immobile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.property.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'immobile' },
      { status: 500 }
    );
  }
}