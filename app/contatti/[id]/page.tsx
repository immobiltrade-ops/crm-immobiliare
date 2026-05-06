'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Mail, Phone, MapPin, Building, User } from 'lucide-react';

interface ContactDetail {
  id: string;
  tipo: string;
  nome?: string;
  cognome?: string;
  ragioneSociale?: string;
  email?: string;
  telefono?: string;
  cellulare?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  ruoli: string[];
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  ownedProperties?: PropertyOwner[];
  opportunities?: OpportunitySummary[];
}

interface PropertyOwner {
  id: string;
  property: PropertySummary;
}

interface PropertySummary {
  id: string;
  titolo: string;
  tipo?: string;
  stato?: string;
  prezzo?: number;
  indirizzo?: string;
  citta?: string;
}

interface OpportunitySummary {
  id: string;
  titolo: string;
  tipo: string;
  stato: string;
  valore?: number;
  property?: { id: string; titolo?: string; indirizzo?: string };
}

const nomeContatto = (c: ContactDetail) =>
  c.tipo === 'AZIENDA'
    ? c.ragioneSociale || 'Azienda senza nome'
    : `${c.nome || ''} ${c.cognome || ''}`.trim() || 'Senza nome';

const ruoliLabels: Record<string, string> = {
  PROPRIETARIO: 'Proprietario',
  ACQUIRENTE: 'Acquirente',
  CONDUTTORE: 'Conduttore',
  LOCATORE: 'Locatore',
  INVESTITORE: 'Investitore',
  PARTNER: 'Partner',
};

export default function ContattoDettaglioPage() {
  const router = useRouter();
  const params = useParams();
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const id = params.id as string;
    fetchContact(id).finally(() => setLoading(false));
  }, [params.id]);

  const fetchContact = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`);
      if (!response.ok) {
        setContact(null);
        return;
      }
      const data = await response.json();
      setContact(data);
    } catch (error) {
      console.error('Errore nel caricamento del contatto:', error);
      setContact(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header title="Dettaglio Contatto" showBackButton onBack={() => router.back()} />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </main>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header title="Dettaglio Contatto" showBackButton onBack={() => router.back()} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Contatto non trovato</p>
              <button onClick={() => router.push('/contatti')} className="btn-primary mt-4">
                Torna ai contatti
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title={nomeContatto(contact)} showBackButton onBack={() => router.back()} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{nomeContatto(contact)}</h1>
                  <p className="text-sm text-gray-500">{contact.tipo === 'AZIENDA' ? 'Azienda' : 'Persona'}</p>
                </div>
                {Array.isArray(contact.ruoli) && contact.ruoli.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {contact.ruoli.map((ruolo) => (
                      <span key={ruolo} className="badge badge-info">
                        {ruoliLabels[ruolo] || ruolo}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {(contact.cellulare || contact.telefono) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{contact.cellulare || contact.telefono}</span>
                  </div>
                )}
                {contact.indirizzo && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{contact.indirizzo}{contact.citta ? `, ${contact.citta}` : ''}</span>
                  </div>
                )}
              </div>

              {contact.note && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Note</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{contact.note}</p>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Immobili collegati</h2>
              {contact.ownedProperties && contact.ownedProperties.length > 0 ? (
                <div className="space-y-3">
                  {contact.ownedProperties.map((owner) => (
                    <div key={owner.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{owner.property.titolo}</div>
                      <div className="text-sm text-gray-600">
                        Tipo: {owner.property.tipo || 'N/D'} | Stato: {owner.property.stato || 'N/D'} | Prezzo: €{(owner.property.prezzo || 0).toLocaleString('it-IT')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nessun immobile collegato.</p>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Opportunità collegate</h2>
              {contact.opportunities && contact.opportunities.length > 0 ? (
                <div className="space-y-3">
                  {contact.opportunities.map((opp) => (
                    <div key={opp.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{opp.titolo}</div>
                      <div className="text-sm text-gray-600">
                        Stato: {opp.stato} | Valore: €{(opp.valore || 0).toLocaleString('it-IT')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nessuna opportunità collegata.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
