import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = db.opportunities.find(o => o.id === params.id);
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunità non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity);
  } catch (error) {
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
    const index = db.opportunities.findIndex(o => o.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Opportunità non trovata' },
        { status: 404 }
      );
    }

    db.opportunities[index] = {
      ...db.opportunities[index],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(db.opportunities[index]);
  } catch (error) {
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
    const index = db.opportunities.findIndex(o => o.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Opportunità non trovata' },
        { status: 404 }
      );
    }

    db.opportunities.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'opportunità' },
      { status: 500 }
    );
  }
}
