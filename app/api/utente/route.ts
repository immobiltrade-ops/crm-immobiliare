export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, email: true, ruolo: true, createdAt: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Errore caricamento utenti:', error);
    return NextResponse.json({ error: 'Errore nel recupero utenti' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ error: 'Email obbligatoria' }, { status: 400 });
    }
    const data: any = {
      name:  body.name  || '',
      email: body.email,
      ruolo: body.ruolo || 'AGENTE',
    };
    if (body.password && body.password.length >= 6) {
      data.password = await bcrypt.hash(body.password, 12);
    }
    const user = await prisma.user.create({
      data,
      select: { id: true, name: true, email: true, ruolo: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email già in uso' }, { status: 409 });
    }
    console.error('Errore creazione utente:', error);
    return NextResponse.json({ error: 'Errore nella creazione utente' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }
    const data: any = {
      name:  body.name,
      email: body.email,
      ruolo: body.ruolo,
    };
    if (body.password && body.password.length >= 6) {
      data.password = await bcrypt.hash(body.password, 12);
    }
    const user = await prisma.user.update({
      where: { id: body.id },
      data,
      select: { id: true, name: true, email: true, ruolo: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email già in uso' }, { status: 409 });
    }
    console.error('Errore aggiornamento utente:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento utente' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }
    const count = await prisma.user.count();
    if (count <= 1) {
      return NextResponse.json({ error: 'Impossibile eliminare l\'unico utente' }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore eliminazione utente:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione utente' }, { status: 500 });
  }
}