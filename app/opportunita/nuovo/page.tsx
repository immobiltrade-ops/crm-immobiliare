'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { opportunityStatusLabels } from '@/lib/constants';

export default function NuovaOpportunitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    titolo: '',
    tipo: 'VENDITA',
    stato: 'LEAD',
    valore: '',
    contactId: '',
    propertyId: '',
    note: '',
  });

  useEffect(() => {
    fetchContacts();
    fetchProperties();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Errore nel caricamento contatti:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Errore nel caricamento immobili:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titolo: formData.titolo,
          tipo: formData.tipo,
          stato: formData.stato,
          valore: formData.valore ? parseFloat(formData.valore) : null,
          contactId: formData.contactId || null,
          propertyId: formData.propertyId || null,
          note: formData.note,
        }),
      });

      if (response.ok) {
        router.push('/opportunita');
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
        <Header
          title="Nuova Opportunità"
          showBackButton
          onBack={() => router.back()}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Dettagli Opportunità</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Titolo</label>
                  <input
                    name="titolo"
                    value={formData.titolo}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Titolo opportunità"
                  />
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="VENDITA">Vendita</option>
                    <option value="LOCAZIONE">Locazione</option>
                  </select>
                </div>
                <div>
                  <label className="label">Stato</label>
                  <select
                    name="stato"
                    value={formData.stato}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {Object.entries(opportunityStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Valore (€)</label>
                  <input
                    type="number"
                    name="valore"
                    value={formData.valore}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Es. 250000"
                  />
                </div>
                <div>
                  <label className="label">Contatto</label>
                  <select
                    name="contactId"
                    value={formData.contactId}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Seleziona contatto...</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.tipo === 'PERSONA_FISICA'
                          ? `${contact.nome || ''} ${contact.cognome || ''}`.trim() || 'Contatto senza nome'
                          : contact.ragioneSociale || 'Ragione sociale non disponibile'
                        }
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Immobile</label>
                  <select
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Seleziona immobile...</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.titolo || property.address || 'Immobile senza titolo'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Note</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Note aggiuntive..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => router.back()} className="btn btn-secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Indietro
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  Salva Opportunità
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}