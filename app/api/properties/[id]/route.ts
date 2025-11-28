import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = db.properties.find(p => p.id === params.id);
    
    if (!property) {
      return NextResponse.json(
        { error: 'Immobile non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
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
    const index = db.properties.findIndex(p => p.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Immobile non trovato' },
        { status: 404 }
      );
    }

    db.properties[index] = {
      ...db.properties[index],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(db.properties[index]);
  } catch (error) {
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
    const index = db.properties.findIndex(p => p.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Immobile non trovato' },
        { status: 404 }
      );
    }

    db.properties.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'immobile' },
      { status: 500 }
    );
  }
}
