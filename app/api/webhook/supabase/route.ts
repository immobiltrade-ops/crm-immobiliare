import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Tipo per i dati della segnalazione in arrivo da Supabase
interface SegnalazioneWebhook {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    nome_proprietario: string;
    telefono_proprietario: string;
    email_proprietario: string;
    indirizzo: string;
    comune: string;
    zona: string;
    tipologia: string;
    superficie_mq: number;
    piano: string;
    prezzo_richiesto: number;
    disponibilita: string;
    condizioni_immobile: string;
    stato_lead: string;
    motivazione_vendita: string;
    note: string;
  };
  old_record?: any;
}

export async function POST(request: NextRequest) {
  // Verifica header segreto
  const secret = request.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const body: SegnalazioneWebhook = await request.json();

    // Log per debug
    console.log('Webhook ricevuto:', body.type, body.record?.stato_lead);

    // Verifichiamo che sia un UPDATE e che stato_lead sia diventato "acquisito"
    if (body.type !== 'UPDATE') {
      return NextResponse.json({ message: 'Evento ignorato (non UPDATE)' }, { status: 200 });
    }

    const { record, old_record } = body;

    // Verifichiamo che stato_lead sia passato da un altro valore a "acquisito"
    if (record.stato_lead !== 'acquisito') {
      return NextResponse.json({ message: 'Stato lead non acquisito' }, { status: 200 });
    }

    // Se old_record esiste e già era "acquisito", ignoriamo (evita duplicati)
    if (old_record?.stato_lead === 'acquisito') {
      return NextResponse.json({ message: 'Era già acquisito' }, { status: 200 });
    }

    // STEP 1: Creiamo il Contatto con i dati del proprietario
    const nuovoContatto = await prisma.contact.create({
      data: {
        tipo: 'PERSONA_FISICA',
        nome: record.nome_proprietario || 'Nome non disponibile',
        email: record.email_proprietario || '',
        telefono: record.telefono_proprietario || '',
        indirizzo: record.indirizzo || '',
        citta: record.comune || '',
        provincia: '', // Non abbiamo questo dato nella segnalazione
        ruoli: ['PROPRIETARIO'],
        interessi: [record.disponibilita || 'vendita'],
        note: `Importato da segnalazione del ${new Date().toLocaleDateString('it-IT')}\n\nMotivazione vendita: ${record.motivazione_vendita || 'Non specificata'}\n\nNote originali: ${record.note || 'Nessuna nota'}`,
        consensoPrivacy: true,
        consensoMarketing: false,
      },
    });

    console.log('Contatto creato:', nuovoContatto.id);

    // STEP 2: Creiamo l'Opportunità collegata al contatto
    const titoloOpportunita = `${record.tipologia || 'Immobile'} - ${record.comune || 'Località non specificata'}`;
    
    const nuovaOpportunita = await prisma.opportunity.create({
      data: {
        titolo: titoloOpportunita,
        tipo: record.disponibilita === 'affitto' ? 'AFFITTO' : 'VENDITA',
        stato: 'LEAD', // Stato iniziale nel CRM
        valore: record.prezzo_richiesto || 0,
        contactId: nuovoContatto.id,
        note: `Immobile in ${record.zona || 'zona non specificata'}\nTipologia: ${record.tipologia || 'non specificata'}\nSuperficie: ${record.superficie_mq || 0} mq\nPiano: ${record.piano || 'non specificato'}\nCondizioni: ${record.condizioni_immobile || 'non specificate'}\n\nIndirizzo: ${record.indirizzo || 'non specificato'}`,
      },
    });

    console.log('Opportunità creata:', nuovaOpportunita.id);

    return NextResponse.json({
      success: true,
      message: 'Contatto e Opportunità creati con successo',
      contatto: nuovoContatto.id,
      opportunita: nuovaOpportunita.id,
    }, { status: 201 });

  } catch (error) {
    console.error('Errore webhook Supabase:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    }, { status: 500 });
  }
}