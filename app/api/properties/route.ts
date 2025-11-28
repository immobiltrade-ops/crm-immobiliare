import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/db';
import { Property } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const city = searchParams.get('city');

    let properties = db.properties;

    if (search) {
      const searchLower = search.toLowerCase();
      properties = properties.filter(p => 
        p.internalCode.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower) ||
        p.city.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      properties = properties.filter(p => p.status === status);
    }

    if (type) {
      properties = properties.filter(p => p.type === type);
    }

    if (city) {
      properties = properties.filter(p => 
        p.city.toLowerCase() === city.toLowerCase()
      );
    }

    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero degli immobili' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newProperty: Property = {
      id: generateId(),
      internalCode: `TO-${generateId()}-2024`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.properties.push(newProperty);

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'immobile' },
      { status: 500 }
    );
  }
}
