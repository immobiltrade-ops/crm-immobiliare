'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Contact } from '@/types';
import { Mail, Phone, MapPin, Tag, X, Plus, Edit, Trash2, Building, User } from 'lucide-react';

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
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Errore nel caricamento dei contatti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo contatto?')) return;

    try {
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      fetchContacts();
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
    }
  };

  const roleLabels: Record<string, string> = {
    owner: 'Proprietario',
    buyer: 'Acquirente',
    tenant: 'Conduttore',
    landlord: 'Locatore',
    investor: 'Investitore',
    partner: 'Partner',
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header 
          title="Contatti" 
          onNewClick={() => {
            setEditingContact(null);
            setShowModal(true);
          }}
          newButtonText="Nuovo Contatto"
          showSearch
          onSearch={setSearchQuery}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterRole('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRole === '' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tutti
              </button>
              {Object.entries(roleLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterRole(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterRole === key ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun contatto trovato</h3>
              <p className="text-gray-600 mb-4">Inizia aggiungendo il tuo primo contatto</p>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuovo Contatto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <div key={contact.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        contact.type === 'company' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {contact.type === 'company' ? (
                          <Building className={`w-6 h-6 ${contact.type === 'company' ? 'text-purple-600' : 'text-blue-600'}`} />
                        ) : (
                          <User className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {contact.type === 'company' 
                            ? contact.companyName 
                            : `${contact.name} ${contact.surname || ''}`}
                        </h3>
                        <p className="text-xs text-gray-500">{contact.type === 'company' ? 'Azienda' : 'Persona'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingContact(contact);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
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
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{contact.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {contact.roles.map((role) => (
                      <span key={role} className="badge badge-info">
                        {roleLabels[role]}
                      </span>
                    ))}
                  </div>

                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <ContactModal
          contact={editingContact}
          onClose={() => {
            setShowModal(false);
            setEditingContact(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingContact(null);
            fetchContacts();
          }}
        />
      )}
    </div>
  );
}

function ContactModal({ 
  contact, 
  onClose, 
  onSave 
}: { 
  contact: Contact | null; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Contact>>(
    contact || {
      type: 'person',
      roles: [],
      tags: [],
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts';
      const method = contact ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      onSave();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    }
  };

  const toggleRole = (role: string) => {
    const roles = formData.roles || [];
    setFormData({
      ...formData,
      roles: roles.includes(role as any)
        ? roles.filter(r => r !== role)
        : [...roles, role as any],
    });
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
          {/* Type */}
          <div>
            <label className="label">Tipo</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="person"
                  checked={formData.type === 'person'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="text-primary-600"
                />
                <span>Persona</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="company"
                  checked={formData.type === 'company'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="text-primary-600"
                />
                <span>Azienda</span>
              </label>
            </div>
          </div>

          {/* Name fields */}
          {formData.type === 'person' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Cognome</label>
                <input
                  type="text"
                  value={formData.surname || ''}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="label">Ragione Sociale *</label>
              <input
                type="text"
                required
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="input"
              />
            </div>
          )}

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Telefono</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="label">Indirizzo</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
            />
          </div>

          {/* Roles */}
          <div>
            <label className="label">Ruoli</label>
            <div className="flex flex-wrap gap-2">
              {['owner', 'buyer', 'tenant', 'landlord', 'investor', 'partner'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.roles?.includes(role as any)
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role === 'owner' && 'Proprietario'}
                  {role === 'buyer' && 'Acquirente'}
                  {role === 'tenant' && 'Conduttore'}
                  {role === 'landlord' && 'Locatore'}
                  {role === 'investor' && 'Investitore'}
                  {role === 'partner' && 'Partner'}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Note</label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Salva
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
