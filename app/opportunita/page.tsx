'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Building2, User, Edit, Trash2, X, Plus } from 'lucide-react';

interface Opportunity {
  id: string;
  titolo: string;
  tipo: string;
  stato: string;
  valore?: number;
  contactId?: string;
  propertyId?: string;
  note?: string;
  contact?: any;
  property?: any;
  createdAt?: string;
}

const statoLabels: Record<string, { label: string; color: string }> = {
  NEW:         { label: 'Lead',        color: 'bg-gray-100' },
  NEGOTIATION: { label: 'Trattativa',  color: 'bg-orange-100' },
  PROPOSAL:    { label: 'Proposta',    color: 'bg-yellow-100' },
  CLOSED_WON:  { label: 'Chiusa vinta', color: 'bg-green-100' },
  CLOSED_LOST: { label: 'Chiusa persa', color: 'bg-red-100' },
};

const tipoLabels: Record<string, string> = {
  VENDITA:   'Vendita',
  LOCAZIONE: 'Locazione',
  PERMUTA:   'Permuta',
};

const nomeContatto = (c: any) => {
  if (!c) return '';
  if (c.tipo === 'AZIENDA') return c.ragioneSociale || 'Azienda senza nome';
  return `${c.nome || ''} ${c.cognome || ''}`.trim() || 'Contatto senza nome';
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [detailOpp, setDetailOpp] = useState<Opportunity | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchOpportunities(), fetchContacts(), fetchProperties()]);
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/opportunities');
      if (!res.ok) { setOpportunities([]); return; }
      const data = await res.json();
      setOpportunities(Array.isArray(data) ? data : data?.data ?? []);
    } catch { setOpportunities([]); }
    finally { setLoading(false); }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      if (!res.ok) return;
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      if (!res.ok) return;
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questa opportunità?')) return;
    try {
      await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
      fetchOpportunities();
    } catch {}
  };

  const openNew = () => { setEditingOpp(null); setShowModal(true); };
  const openEdit = (opp: Opportunity) => { setEditingOpp(opp); setShowModal(true); };

  const stages = Object.entries(statoLabels);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header
          title="Opportunità"
          newButtonText="Nuova Opportunità"
          onNewClick={openNew}
        />

        <main className="flex-1 overflow-x-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : !Array.isArray(opportunities) ? (
            <div className="card text-center py-16 text-gray-500">
              Errore nel caricamento delle opportunità.
            </div>
          ) : (
            <div className="flex gap-4 min-w-max">
              {stages.map(([stageId, { label, color }]) => {
                const stageOpps = opportunities.filter(o => o.stato === stageId);
                const totalValue = stageOpps.reduce((sum, o) => sum + (o.valore || 0), 0);

                return (
                  <div key={stageId} className="flex-shrink-0 w-80">
                    {/* Intestazione colonna */}
                    <div className={`${color} rounded-lg p-3 mb-3`}>
                      <h3 className="font-semibold text-gray-900">{label}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {stageOpps.length} opportunità • €{(totalValue / 1000).toFixed(0)}k
                      </div>
                    </div>

                    {/* Pulsante aggiungi nella colonna */}
                    <button
                      onClick={openNew}
                      className="w-full mb-3 flex items-center justify-center gap-1 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Aggiungi
                    </button>

                    <div className="space-y-3">
                      {stageOpps.map((opp) => (
                        <div
                          key={opp.id}
                          className="card hover:shadow-md transition-shadow"
                        >
                          {/* Riga superiore: tipo + azioni */}
                          <div className="flex items-start justify-between mb-2">
                            <span className={`badge ${opp.tipo === 'VENDITA' ? 'badge-success' : 'badge-info'}`}>
                              {tipoLabels[opp.tipo] || opp.tipo}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEdit(opp)}
                                className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                                title="Modifica"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(opp.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                                title="Elimina"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Titolo — cliccabile per dettaglio */}
                          <div
                            className="font-medium text-gray-900 mb-2 cursor-pointer hover:text-primary-600"
                            onClick={() => setDetailOpp(opp)}
                          >
                            {opp.titolo || 'Senza titolo'}
                          </div>

                          {/* Immobile collegato */}
                          {opp.property && (
                            <div className="flex items-start gap-2 mb-1">
                              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600">
                                {opp.property.titolo || opp.property.indirizzo || 'Immobile'}
                              </span>
                            </div>
                          )}

                          {/* Contatto collegato */}
                          {opp.contact && (
                            <div className="flex items-start gap-2 mb-2">
                              <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{nomeContatto(opp.contact)}</span>
                            </div>
                          )}

                          {/* Valore */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                            <span className="text-lg font-bold text-gray-900">
                              €{(opp.valore || 0).toLocaleString('it-IT')}
                            </span>
                          </div>
                        </div>
                      ))}

                      {stageOpps.length === 0 && (
                        <div className="card text-center py-8 text-gray-400 text-sm">
                          Nessuna opportunità
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal crea / modifica */}
      {showModal && (
        <OppModal
          opp={editingOpp}
          contacts={contacts}
          properties={properties}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchOpportunities(); }}
        />
      )}

      {/* Modal dettaglio */}
      {detailOpp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{detailOpp.titolo || 'Opportunità'}</h2>
              <button onClick={() => setDetailOpp(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo</span>
                <span className="font-medium">{tipoLabels[detailOpp.tipo] || detailOpp.tipo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stato</span>
                <span className="font-medium">{statoLabels[detailOpp.stato]?.label || detailOpp.stato}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valore</span>
                <span className="font-bold text-lg">€{(detailOpp.valore || 0).toLocaleString('it-IT')}</span>
              </div>
              {detailOpp.contact && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Contatto</span>
                  <span className="font-medium">{nomeContatto(detailOpp.contact)}</span>
                </div>
              )}
              {detailOpp.property && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Immobile</span>
                  <span className="font-medium">{detailOpp.property.titolo || detailOpp.property.indirizzo}</span>
                </div>
              )}
              {detailOpp.note && (
                <div>
                  <span className="text-gray-500 block mb-1">Note</span>
                  <p className="text-gray-700 bg-gray-50 rounded p-2">{detailOpp.note}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => { setDetailOpp(null); openEdit(detailOpp); }} className="btn-primary flex-1">
                Modifica
              </button>
              <button onClick={() => setDetailOpp(null)} className="btn-secondary">
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OppModal({
  opp, contacts, properties, onClose, onSave,
}: {
  opp: Opportunity | null;
  contacts: any[];
  properties: any[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    titolo:     opp?.titolo     || '',
    tipo:       opp?.tipo       || 'VENDITA',
    stato:      opp?.stato      || 'NEW',
    valore:     opp?.valore?.toString() || '',
    contactId:  opp?.contactId  || '',
    propertyId: opp?.propertyId || '',
    note:       opp?.note       || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url    = opp ? `/api/opportunities/${opp.id}` : '/api/opportunities';
      const method = opp ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valore: formData.valore ? parseFloat(formData.valore) : null,
          contactId:  formData.contactId  || null,
          propertyId: formData.propertyId || null,
        }),
      });
      if (res.ok) onSave();
      else console.error('Errore salvataggio:', await res.text());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {opp ? 'Modifica Opportunità' : 'Nuova Opportunità'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo *</label>
            <input
              type="text"
              required
              value={formData.titolo}
              onChange={e => setFormData({ ...formData, titolo: e.target.value })}
              className="input-field"
              placeholder="Es. Vendita bilocale Via Roma"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} className="input-field">
                <option value="VENDITA">Vendita</option>
                <option value="LOCAZIONE">Locazione</option>
                <option value="PERMUTA">Permuta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select value={formData.stato} onChange={e => setFormData({ ...formData, stato: e.target.value })} className="input-field">
                {Object.entries(statoLabels).map(([k, { label }]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valore (€)</label>
            <input
              type="number"
              value={formData.valore}
              onChange={e => setFormData({ ...formData, valore: e.target.value })}
              className="input-field"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contatto collegato</label>
            <select value={formData.contactId} onChange={e => setFormData({ ...formData, contactId: e.target.value })} className="input-field">
              <option value="">— Nessun contatto —</option>
              {Array.isArray(contacts) && contacts.map(c => (
                <option key={c.id} value={c.id}>{nomeContatto(c)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Immobile collegato</label>
            <select value={formData.propertyId} onChange={e => setFormData({ ...formData, propertyId: e.target.value })} className="input-field">
              <option value="">— Nessun immobile —</option>
              {Array.isArray(properties) && properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.titolo || p.indirizzo || 'Immobile senza titolo'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              rows={3}
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" className="btn-primary flex-1">Salva</button>
            <button type="button" onClick={onClose} className="btn-secondary">Annulla</button>
          </div>
        </form>
      </div>
    </div>
  );
}