'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Building2, Save, ArrowLeft } from 'lucide-react';

const nomeContatto = (c: any) =>
  c.tipo === 'AZIENDA'
    ? c.ragioneSociale || 'Azienda senza nome'
    : `${c.nome || ''} ${c.cognome || ''}`.trim() || 'Senza nome';

export default function NuovoImmobilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    titolo: '',
    tipo: 'APPARTAMENTO',
    stato: 'DISPONIBILE',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    prezzo: '',
    superficie: '',
    locali: '',
    bagni: '',
    piano: '',
    descrizione: '',
    caratteristiche: [] as string[],
    ownerId: '',
    ownerIds: [] as string[],
    acceptsExchange: false,
    exchangeNotes: '',
    note: '',
  });

  const tipiImmobile = [
    { value: 'APPARTAMENTO', label: 'Appartamento' },
    { value: 'VILLA',        label: 'Villa'         },
    { value: 'UFFICIO',      label: 'Ufficio'       },
    { value: 'NEGOZIO',      label: 'Negozio'       },
    { value: 'MAGAZZINO',    label: 'Magazzino'     },
    { value: 'TERRENO',      label: 'Terreno'       },
    { value: 'GARAGE',       label: 'Garage'        },
    { value: 'ALTRO',        label: 'Altro'         },
  ];

  const caratteristicheOptions = [
    'Ascensore', 'Balcone', 'Terrazzo', 'Giardino', 'Box auto', 'Cantina',
    'Riscaldamento autonomo', 'Riscaldamento centralizzato', 'Aria condizionata',
    'Arredato', 'Nuovo', 'Da ristrutturare',
    'Classe energetica A', 'Classe energetica B', 'Classe energetica C',
    'Classe energetica D', 'Classe energetica E', 'Classe energetica F',
    'Classe energetica G',
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleCaratteristica = (value: string) => {
    setFormData(prev => ({
      ...prev,
      caratteristiche: prev.caratteristiche.includes(value)
        ? prev.caratteristiche.filter(c => c !== value)
        : [...prev.caratteristiche, value],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
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
        router.push('/immobili');
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title="Nuovo Immobile" showBackButton onBack={() => router.back()} />

        <main className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

            {/* Dati Base */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Dati Base
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titolo *</label>
                  <input type="text" name="titolo" required value={formData.titolo} onChange={handleChange} className="input-field" placeholder="Es. Bilocale centro storico" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Immobile</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange} className="input-field">
                    {tipiImmobile.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                  <select name="stato" value={formData.stato} onChange={handleChange} className="input-field">
                    <option value="DISPONIBILE">Disponibile</option>
                    <option value="OPTIONATO">Opzionato</option>
                    <option value="VENDUTO">Venduto</option>
                    <option value="AFFITTATO">Affittato</option>
                    <option value="RITIRATO">Ritirato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€)</label>
                  <input type="number" name="prezzo" value={formData.prezzo} onChange={handleChange} className="input-field" placeholder="Es. 250000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (m²)</label>
                  <input type="number" name="superficie" value={formData.superficie} onChange={handleChange} className="input-field" placeholder="Es. 85" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locali</label>
                  <input type="number" name="locali" value={formData.locali} onChange={handleChange} className="input-field" placeholder="Es. 3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bagni</label>
                  <input type="number" name="bagni" value={formData.bagni} onChange={handleChange} className="input-field" placeholder="Es. 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Piano</label>
                  <input type="text" name="piano" value={formData.piano} onChange={handleChange} className="input-field" placeholder="Es. 3° piano" />
                </div>
              </div>
            </div>

            {/* Proprietari */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">👥 Proprietari</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proprietario</label>
                  <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="input-field">
                    <option value="">— Seleziona un proprietario —</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {nomeContatto(contact)}
                      </option>
                    ))}
                  </select>
                </div>
                {contacts.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nessun contatto disponibile — aggiungine uno dalla sezione Contatti.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-3">Seleziona uno o più proprietari aggiuntivi:</p>
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
                    {formData.ownerIds.length > 0 && (
                      <p className="text-xs text-blue-600 mt-2">
                        {formData.ownerIds.length} proprietario/i selezionato/i
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Localizzazione */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Localizzazione</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                  <input type="text" name="indirizzo" value={formData.indirizzo} onChange={handleChange} className="input-field" placeholder="Es. Via Roma 15" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                  <input type="text" name="citta" value={formData.citta} onChange={handleChange} className="input-field" placeholder="Es. Galliate" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                  <input type="text" name="cap" value={formData.cap} onChange={handleChange} className="input-field" placeholder="Es. 28066" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} className="input-field" placeholder="Es. NO" />
                </div>
              </div>
            </div>

            {/* Caratteristiche */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Caratteristiche</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {caratteristicheOptions.map(char => (
                  <label key={char} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.caratteristiche.includes(char)}
                      onChange={() => toggleCaratteristica(char)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600"
                    />
                    <span className="text-sm text-gray-700">{char}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Descrizione */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrizione</h2>
              <textarea name="descrizione" value={formData.descrizione} onChange={handleChange} rows={4} className="input-field" placeholder="Descrizione dell'immobile..." />
            </div>

            {/* Note interne */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Note Interne</h2>
              <textarea name="note" value={formData.note} onChange={handleChange} rows={3} className="input-field" placeholder="Note visibili solo internamente..." />
            </div>

            {/* Permuta */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Permuta</h2>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  name="acceptsExchange"
                  checked={formData.acceptsExchange}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <div>
                  <span className="font-medium text-gray-900">Accetta permuta</span>
                  <p className="text-sm text-gray-500">L'immobile può essere dato in permuta</p>
                </div>
              </label>
              {formData.acceptsExchange && (
                <textarea name="exchangeNotes" value={formData.exchangeNotes} onChange={handleChange} rows={3} className="input-field" placeholder="Descrivi le condizioni preferite per la permuta..." />
              )}
            </div>

            {/* Permuta */}
            <div className="card bg-purple-50 border-purple-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Permuta</h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="acceptsExchange" checked={formData.acceptsExchange} onChange={handleChange} className="rounded" />
                    <span className="text-sm font-medium text-gray-700">Accetta permuta</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note permuta</label>
                  <textarea name="exchangeNotes" value={formData.exchangeNotes} onChange={handleChange} rows={3} className="input-field" placeholder="Descrivi le condizioni di permuta accettate..." />
                </div>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex justify-end gap-3 pb-6">
              <button type="button" onClick={() => router.back()} className="btn-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Annulla
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvataggio...' : 'Salva Immobile'}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}