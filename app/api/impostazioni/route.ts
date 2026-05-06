import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.agencySettings.findFirst();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching agency settings:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle impostazioni' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nomeAgenzia,
      indirizzo,
      citta,
      cap,
      provincia,
      telefono,
      email,
      piva,
      sito,
      notificaVisita,
      notificaOpportunita,
      notificaScadenza,
    } = body;

    const existing = await prisma.agencySettings.findFirst();

    const data = {
      nomeAgenzia,
      indirizzo,
      citta,
      cap,
      provincia,
      telefono,
      email,
      piva,
      sito,
      notificaVisita,
      notificaOpportunita,
      notificaScadenza,
    };

    const settings = await prisma.agencySettings.upsert({
      where: { id: existing?.id ?? '' },
      update: data,
      create: data,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving agency settings:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio delle impostazioni' },
      { status: 500 }
    );
  }
}
