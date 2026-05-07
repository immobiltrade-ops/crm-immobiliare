export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Controlla se esiste già un amministratore con password
    const adminConPassword = await prisma.user.findFirst({
      where: {
        ruolo: 'AMMINISTRATORE',
        password: { not: null },
      },
    });

    if (adminConPassword) {
      return NextResponse.json(
        { error: 'Setup già completato. Usa la pagina di login.' },
        { status: 403 }
      );
    }

    // Trova il primo amministratore senza password
    const admin = await prisma.user.findFirst({
      where: { ruolo: 'AMMINISTRATORE' },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Nessun utente amministratore trovato. Contatta il supporto.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password troppo corta — minimo 6 caratteri.' },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(body.password, 12);

    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore setup:', error);
    return NextResponse.json(
      { error: 'Errore durante il setup.' },
      { status: 500 }
    );
  }
}