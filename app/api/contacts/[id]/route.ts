import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = db.contacts.find(c => c.id === params.id);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contatto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
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
    const index = db.contacts.findIndex(c => c.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Contatto non trovato' },
        { status: 404 }
      );
    }

    db.contacts[index] = {
      ...db.contacts[index],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(db.contacts[index]);
  } catch (error) {
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
    const index = db.contacts.findIndex(c => c.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Contatto non trovato' },
        { status: 404 }
      );
    }

    db.contacts.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del contatto' },
      { status: 500 }
    );
  }
}
