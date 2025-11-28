import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/db';
import { Contact } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    let contacts = db.contacts;

    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(c => 
        c.name?.toLowerCase().includes(searchLower) ||
        c.surname?.toLowerCase().includes(searchLower) ||
        c.companyName?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower)
      );
    }

    if (role) {
      contacts = contacts.filter(c => c.roles.includes(role as any));
    }

    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero dei contatti' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newContact: Contact = {
      id: generateId(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.contacts.push(newContact);

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nella creazione del contatto' },
      { status: 500 }
    );
  }
}
