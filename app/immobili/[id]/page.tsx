'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { MapPin, Euro, Home, Edit, RefreshCw, X, Plus, Trash2 } from 'lucide-react';

interface Contact {
  id: string;
  tipo: string;
  nome?: string;
  cognome?: string;
  ragioneSociale?: string;
}

interface PropertyOwner {
  id: string;
  contactId: string;
  quota?: number;
  contact: Contact;
}

interface Opportunity {
  id: string;
  titolo?: string;
  stato?: string;
  valore?: number;
  contact?: Contact;
}

interface PropertyDetail {
  id: string;
  titolo: string;
  tipo: string;
  stato: string;
  prezzo?: number;
  superficie?: number;
  locali?: number;
  bagni?: number;
  piano?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  descrizione?: string;
  caratteristiche: string[];
  acceptsExchange: boolean;
  exchangeNotes?: string;
  internalCode?: string;
  note?: string;
  owners?: PropertyOwner[];
  owner?: Contact | null;
  opportunities?: Opportunity[];
  createdAt: string;
  updatedAt: string;
}

const nomeContatto = (c: Contact) =>
  c.tipo === 'AZIENDA'
    ? c.ragioneSociale || 'Azienda senza nome'
    : `${c.nome || ''} ${c.cognome || ''}`.trim() || 'Senza nome';

export default function DettaglioImmobilePage() {
  const router = useRouter();
  const params = useParams();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    titolo: '',
    tipo: 'APPARTAMENTO',
    stato: 'DISPONIBILE',
    prezzo: '',
    superficie: '',
    locali: '',
    bagni: '',
    piano: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    descrizione: '',
    caratteristiche: [] as string[],
    ownerId: '',
    ownerIds: [] as string[],
    acceptsExchange: false,
    exchangeNotes: '',
    internalCode: '',
    note: '',
  });

  useEffect(() => {
    if (params.id) {
      const id = params.id as string;
      fetchProperty(id);
      fetchPropertyOpportunities(id);
    }
    fetchContacts();
  }, [params.id]);

  useEffect(() => {
    if (showEditForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showEditForm]);

  const fetchProperty = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) return;
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setContacts(list);
    } catch (error) {
      console.error('Errore nel caricamento contatti:', error);
    }
  };

  const fetchPropertyOpportunities = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/opportunities?propertyId=${encodeURIComponent(propertyId)}`);
      if (!response.ok) {
        setOpportunities([]);
        return;
      }
      const data = await response.json();
      setOpportunities(Array.isArray(data) ? data : data?.data ?? []);
    } catch (error) {
      console.error('Errore nel caricamento delle opportunità:', error);
      setOpportunities([]);
    }
  };

  const handleEdit = () => {
    if (!property) return;
    setFormData({
      titolo:          property.titolo || '',
      tipo:            property.tipo || 'APPARTAMENTO',
      stato:           property.stato || 'DISPONIBILE',
      prezzo:          property.prezzo?.toString() || '',
      superficie:      property.superficie?.toString() || '',
      locali:          property.locali?.toString() || '',
      bagni:           property.bagni?.toString() || '',
      piano:           property.piano || '',
      indirizzo:       property.indirizzo || '',
      citta:           property.citta || '',
      cap:             property.cap || '',
      provincia:       property.provincia || '',
      descrizione:     property.descrizione || '',
      caratteristiche: property.caratteristiche || [],
      ownerId:         property.owners?.[0]?.contactId || '',
      ownerIds:        property.owners?.map(o => o.contactId) || [],
      acceptsExchange: property.acceptsExchange || false,
      exchangeNotes:   property.exchangeNotes || '',
      internalCode:    property.internalCode || '',
      note:            property.note || '',
    });
    setShowEditForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleOwner = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      ownerIds: prev.ownerIds.includes(contactId)
        ? prev.ownerIds.filter(id => id !== contactId)
        : [...prev.ownerIds, contactId],
    }));
  };

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          prezzo:     formData.prezzo     ? parseFloat(formData.prezzo)     : null,
          superficie: formData.superficie ? parseFloat(formData.superficie) : null,
          locali:     formData.locali     ? parseInt(formData.locali)       : null,
          bagni:      formData.bagni      ? parseInt(formData.bagni)        : null,
        }),
      });
      if (response.ok) {
        setShowEditForm(false);
        fetchProperty(property.id);
      }
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    } finally {
      setSaving(false);
    }
  };

  const statusLabels: Record<string, { label: string; class: string }> = {
    DISPONIBILE: { label: 'Disponibile', class: 'badge-success' },
    OPTIONATO:   { label: 'Opzionato',   class: 'badge-warning' },
    VENDUTO:     { label: 'Venduto',      class: 'badge-gray'    },
    AFFITTATO:   { label: 'Affittato',    class: 'badge-info'    },
    RITIRATO:    { label: 'Ritirato',     class: 'badge-danger'  },
  };

  const tipoLabels: Record<string, string> = {
    APPARTAMENTO: 'Appartamento',
    VILLA:        'Villa',
    UFFICIO:      'Ufficio',
    NEGOZIO:      'Negozio',
    MAGAZZINO:    'Magazzino',
    TERRENO:      'Terreno',
    GARAGE:       'Garage',
    ALTRO:        'Altro',
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header title="Dettaglio Immobile" showBackButton onBack={() => router.back()} />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </main>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header title="Dettaglio Immobile" showBackButton onBack={() => router.back()} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Immobile non trovato</p>
              <button onClick={() => router.push('/immobili')} className="btn-primary mt-4">
                Torna agli immobili
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
        <Header title={property.titolo} showBackButton onBack={() => router.back()} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header Card */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`badge ${statusLabels[property.stato]?.class || 'badge-gray'}`}>
                    {statusLabels[property.stato]?.label || property.stato}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tipoLabels[property.tipo] || property.tipo}
                  </span>
                  {property.internalCode && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono font-semibold">
                      {property.internalCode}
                    </span>
                  )}
                </div>
                <button onClick={handleEdit} className="btn-primary flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  {showEditForm ? 'Modifica aperta ↓' : 'Modifica'}
                </button>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.titolo}</h1>

              {property.indirizzo && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>{property.indirizzo}{property.citta ? `, ${property.citta}` : ''}</span>
                  {property.cap && <span>- {property.cap}</span>}
                </div>
              )}

              {property.prezzo && (
                <div className="flex items-center gap-2 text-2xl font-bold text-primary-600 mb-4">
                  <Euro className="w-6 h-6" />
                  <span>{property.prezzo.toLocaleString('it-IT')} €</span>
                </div>
              )}

              {/* Proprietari */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Proprietari ({property.owners?.length || 0})
                  </span>
                  <button onClick={handleEdit} className="btn-secondary text-sm">
                    {property.owners && property.owners.length > 0 ? 'Gestisci proprietari' : '+ Aggiungi proprietario'}
                  </button>
                </div>
                {property.owners && property.owners.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {property.owners.map(o => (
                      <span key={o.id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-medium">
                        {nomeContatto(o.contact)}
                        {o.quota && <span className="text-blue-500 text-xs">({o.quota}%)</span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">Nessun proprietario collegato</p>
                )}
              </div>
            </div>

            {/* Opportunità collegate */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Opportunità collegate</h2>
              {opportunities.length > 0 ? (
                <div className="space-y-3">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-semibold text-gray-900">{opp.titolo || 'Opportunità senza titolo'}</span>
                        <span className="text-xs uppercase tracking-wide text-gray-500">{opp.tipo}</span>
                      </div>
                      <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                        <span>Stato: {
                          ({
                            LEAD: 'Interesse',
                            NEGOTIATION: 'In trattativa',
                            PROPOSAL: 'Proposta',
                            CLOSED_WON: 'Conclusa - Venduta',
                            CLOSED_LOST: 'Conclusa - Persa',
                          } as Record<string, string>)[opp.stato ?? ''] || opp.stato || 'N/D'
                        }</span>
                        <span>Valore: €{(opp.valore || 0).toLocaleString('it-IT')}</span>
                      </div>
                      {opp.contact && (
                        <div className="mt-2 text-sm text-gray-600">Contatto: {nomeContatto(opp.contact)}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nessuna opportunità collegata a questo immobile.</p>
              )}
            </div>

            {/* Caratteristiche */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Caratteristiche
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.superficie && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.superficie}</div>
                    <div className="text-sm text-gray-500">m²</div>
                  </div>
                )}
                {property.locali && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.locali}</div>
                    <div className="text-sm text-gray-500">Locali</div>
                  </div>
                )}
                {property.bagni && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bagni}</div>
                    <div className="text-sm text-gray-500">Bagni</div>
                  </div>
                )}
                {property.piano && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.piano}</div>
                    <div className="text-sm text-gray-500">Piano</div>
                  </div>
                )}
              </div>
              {Array.isArray(property.caratteristiche) && property.caratteristiche.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Caratteristiche:</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.caratteristiche.map((char, idx) => (
                      <span key={idx} className="badge badge-info">{char}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Permuta */}
            {property.acceptsExchange && (
              <div className="card border-l-4 border-l-blue-500">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  Permuta
                </h2>
                <span className="badge bg-blue-100 text-blue-700">Accetta permuta</span>
                {property.exchangeNotes && (
                  <p className="mt-2 text-gray-600">{property.exchangeNotes}</p>
                )}
              </div>
            )}

            {/* Descrizione */}
            {property.descrizione && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrizione</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{property.descrizione}</p>
              </div>
            )}

            {/* Note */}
            {property.note && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Note Interne</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{property.note}</p>
              </div>
            )}

            {/* FORM MODIFICA */}
            {showEditForm && (
              <div ref={formRef} className="card border-2 border-primary-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b">
                  ✏️ Modifica Immobile
                </h2>

                <div className="space-y-6">

                  {/* PROPRIETARI */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-3">
                        👥 Proprietario
                      </label>
                      {contacts.length === 0 ? (
                        <p className="text-sm text-blue-600">
                          Nessun contatto disponibile — aggiungine uno dalla sezione Contatti.
                        </p>
                      ) : (
                        <select name="ownerId" value={formData.ownerId} onChange={handleFormChange} className="input-field w-full">
                          <option value="">— Seleziona un proprietario —</option>
                          {contacts.map(contact => (
                            <option key={contact.id} value={contact.id}>
                              {nomeContatto(contact)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-3">
                        👥 Proprietari aggiuntivi
                      </label>
                      {contacts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {contacts.map(contact => {
                            const selected = formData.ownerIds.includes(contact.id);
                            return (
                              <button
                                key={contact.id}
                                type="button"
                                onClick={() => toggleOwner(contact.id)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                  selected
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {selected && <span className="mr-1">✓</span>}
                                {nomeContatto(contact)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {formData.ownerIds.length > 0 && (
                        <p className="text-xs text-blue-600 mt-2">
                          {formData.ownerIds.length} proprietario/i selezionato/i
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dati base */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Dati Base</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                        <input type="text" name="titolo" value={formData.titolo} onChange={handleFormChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Codice Interno
                          <span className="ml-2 text-xs text-gray-400 font-normal">— lascia vuoto per rigenerarlo</span>
                        </label>
                        <input type="text" name="internalCode" value={formData.internalCode} onChange={handleFormChange} className="input-field font-mono" placeholder="Es. GAL320" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Immobile</label>
                        <select name="tipo" value={formData.tipo} onChange={handleFormChange} className="input-field">
                          {Object.entries(tipoLabels).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                        <select name="stato" value={formData.stato} onChange={handleFormChange} className="input-field">
                          {Object.entries(statusLabels).map(([v, { label }]) => (
                            <option key={v} value={v}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€)</label>
                        <input type="number" name="prezzo" value={formData.prezzo} onChange={handleFormChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (m²)</label>
                        <input type="number" name="superficie" value={formData.superficie} onChange={handleFormChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Locali</label>
                        <input type="number" name="locali" value={formData.locali} onChange={handleFormChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bagni</label>
                        <input type="number" name="bagni" value={formData.bagni} onChange={handleFormChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Piano</label>
                        <input type="text" name="piano" value={formData.piano} onChange={handleFormChange} className="input-field" />
                      </div>
                    </div>
                  </div>

                  {/* Localizzazione */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Localizzazione</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                        <input type="text" name="indirizzo" value={formData.indirizzo} onChange={handleFormChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                        <input type="text" name="citta" value={formData.citta} onChange={handleFormChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                        <input type="text" name="cap" value={formData.cap} onChange={handleFormChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                        <input type="text" name="provincia" value={formData.provincia} onChange={handleFormChange} className="input-field" />
                      </div>
                    </div>
                  </div>

                  {/* Descrizione */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                    <textarea name="descrizione" value={formData.descrizione} onChange={handleFormChange} rows={4} className="input-field" />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note Interne</label>
                    <textarea name="note" value={formData.note} onChange={handleFormChange} rows={3} className="input-field" />
                  </div>

                  {/* Permuta */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="acceptsExchange"
                      id="acceptsExchange"
                      checked={formData.acceptsExchange}
                      onChange={handleFormChange}
                      className="w-4 h-4"
                    />
                    <label htmlFor="acceptsExchange" className="text-sm font-medium text-gray-700">
                      Accetta permuta
                    </label>
                  </div>
                  {formData.acceptsExchange && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note permuta</label>
                      <textarea name="exchangeNotes" value={formData.exchangeNotes} onChange={handleFormChange} rows={2} className="input-field" />
                    </div>
                  )}

                  {/* Pulsanti */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button onClick={handleSave} disabled={saving} className="btn-primary">
                      {saving ? 'Salvando...' : 'Salva Modifiche'}
                    </button>
                    <button onClick={() => setShowEditForm(false)} className="btn-secondary">
                      Annulla
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-sm text-gray-500">
              <p>Creato il: {new Date(property.createdAt).toLocaleDateString('it-IT')}</p>
              <p>Ultima modifica: {new Date(property.updatedAt).toLocaleDateString('it-IT')}</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}