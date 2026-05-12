'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Mail, Phone, MapPin, X, Plus, Edit, Trash2, Building, User } from 'lucide-react';

interface Contact {
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
  codiceFiscale?: string;
  partitaIva?: string;
  ruoli: string[];
  note?: string;
  createdAt?: string;
}

const ruoliLabels: Record<string, string> = {
  PROPRIETARIO: 'Proprietario',
  ACQUIRENTE: 'Acquirente',
  CONDUTTORE: 'Conduttore',
  LOCATORE: 'Locatore',
  INVESTITORE: 'Investitore',
  PARTNER: 'Partner',
};

const nomeContatto = (c: Contact) =>
  c.tipo === 'PERSONA_FISICA'
    ? `${c.nome || ''} ${c.cognome || ''}`.trim() || 'Senza nome'
    : c.ragioneSociale || 'Senza ragione sociale';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [searchQuery, filterRole]);

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterRole) params.append('role', filterRole);

      const response = await fetch(`/api/contacts?${params}`);
      if (!response.ok) { setContacts([]); return; }
      const data = await response.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setContacts(list);
    } catch (error) {
      console.error('Errore nel caricamento dei contatti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Sei sicuro di voler eliminare questo contatto?')) return;
    try {
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      fetchContacts();
    } catch (error) {
      console.error('Errore eliminazione:', error);
    }
  };

  const handleEdit = (contact: Contact, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingContact(contact);
    setShowModal(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header
          title="Contatti"
          onNewClick={() => { setEditingContact(null); setShowModal(true); }}
          newButtonText="Nuovo Contatto"
          showSearch
          onSearch={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Filtri ruolo */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterRole('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterRole === '' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Tutti
              </button>
              {Object.entries(ruoliLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterRole(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterRole === key ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : !Array.isArray(contacts) || contacts.length === 0 ? (
            <div className="card text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun contatto trovato</h3>
              <p className="text-gray-600 mb-4">Inizia aggiungendo il tuo primo contatto</p>
              <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nuovo Contatto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <Link 
                  key={contact.id} 
                  href={`/contatti/${contact.id}`}
                  className="card hover:shadow-md transition-shadow cursor-pointer block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${contact.tipo === 'AZIENDA' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        {contact.tipo === 'AZIENDA'
                          ? <Building className="w-6 h-6 text-purple-600" />
                          : <User className="w-6 h-6 text-blue-600" />
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{nomeContatto(contact)}</h3>
                        <p className="text-xs text-gray-500">{contact.tipo === 'AZIENDA' ? 'Azienda' : 'Persona'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleEdit(contact, e)}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(contact.id, e)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {(contact.cellulare || contact.telefono) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{contact.cellulare || contact.telefono}</span>
                      </div>
                    )}
                    {contact.indirizzo && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{contact.indirizzo}{contact.citta ? `, ${contact.citta}` : ''}</span>
                      </div>
                    )}
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
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <ContactModal
          contact={editingContact}
          onClose={() => { setShowModal(false); setEditingContact(null); }}
          onSave={() => { setShowModal(false); setEditingContact(null); fetchContacts(); }}
        />
      )}
    </div>
  );
}

function ContactModal({
  contact,
  onClose,
  onSave,
}: {
  contact: Contact | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    tipo: contact?.tipo || 'PERSONA_FISICA',
    nome: contact?.nome || '',
    cognome: contact?.cognome || '',
    ragioneSociale: contact?.ragioneSociale || '',
    email: contact?.email || '',
    telefono: contact?.telefono || '',
    cellulare: contact?.cellulare || '',
    indirizzo: contact?.indirizzo || '',
    citta: contact?.citta || '',
    cap: contact?.cap || '',
    provincia: contact?.provincia || '',
    codiceFiscale: contact?.codiceFiscale || '',
    partitaIva: contact?.partitaIva || '',
    ruoli: contact?.ruoli || [] as string[],
    note: contact?.note || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts';
      const method = contact ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) onSave();
      else console.error('Errore salvataggio:', await response.text());
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    }
  };

  const toggleRuolo = (ruolo: string) => {
    setFormData(prev => ({
      ...prev,
      ruoli: prev.ruoli.includes(ruolo)
        ? prev.ruoli.filter(r => r !== ruolo)
        : [...prev.ruoli, ruolo],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {contact ? 'Modifica Contatto' : 'Nuovo Contatto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="PERSONA_FISICA"
                  checked={formData.tipo === 'PERSONA_FISICA'}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                />
                <span>Persona</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="AZIENDA"
                  checked={formData.tipo === 'AZIENDA'}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                />
                <span>Azienda</span>
              </label>
            </div>
          </div>

          {/* Nome / Cognome o Ragione Sociale */}
          {formData.tipo === 'PERSONA_FISICA' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                <input
                  type="text"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ragione Sociale *</label>
              <input
                type="text"
                required
                value={formData.ragioneSociale}
                onChange={(e) => setFormData({ ...formData, ragioneSociale: e.target.value })}
                className="input-field"
              />
            </div>
          )}

          {/* Email e Telefono */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cellulare</label>
              <input
                type="tel"
                value={formData.cellulare}
                onChange={(e) => setFormData({ ...formData, cellulare: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Indirizzo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
              <input
                type="text"
                value={formData.indirizzo}
                onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
              <input
                type="text"
                value={formData.citta}
                onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
              <input
                type="text"
                value={formData.cap}
                onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Codice Fiscale / P.IVA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale</label>
              <input
                type="text"
                value={formData.codiceFiscale}
                onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
              <input
                type="text"
                value={formData.partitaIva}
                onChange={(e) => setFormData({ ...formData, partitaIva: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Ruoli */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ruoli</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ruoliLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleRuolo(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.ruoli.includes(key)
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Pulsanti */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" className="btn-primary flex-1">Salva</button>
            <button type="button" onClick={onClose} className="btn-secondary">Annulla</button>
          </div>

        </form>
      </div>
    </div>
  );
}