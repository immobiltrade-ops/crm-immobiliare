'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Calendar, Phone, Mail, Clock, User, Building2, ArrowLeft, Edit, Trash2, Save, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import Link from 'next/link';

interface Appointment {
  id: string;
  titolo: string;
  tipo: string;
  data: string;
  durata?: number;
  contactId?: string;
  propertyId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  contact?: {
    id: string;
    tipo: string;
    firstName?: string;
    lastName?: string;
    ragioneSociale?: string;
    email?: string;
    telefono?: string;
    cellulare?: string;
  };
  property?: {
    id: string;
    titolo: string;
    indirizzo?: string;
    citta?: string;
    tipo: string;
  };
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    titolo: '',
    tipo: 'VISITA',
    data: '',
    ora: '',
    durata: '',
    contactId: '',
    propertyId: '',
    note: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchAppointment();
    }
  }, [params.id]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
        initializeForm(data);
      } else {
        router.push('/agenda');
      }
    } catch (error) {
      console.error('Errore:', error);
      router.push('/agenda');
    } finally {
      setLoading(false);
    }
  };

  const initializeForm = (appt: Appointment) => {
    const dataObj = new Date(appt.data);
    setFormData({
      titolo: appt.titolo || '',
      tipo: appt.tipo || 'VISITA',
      data: format(dataObj, 'yyyy-MM-dd'),
      ora: format(dataObj, 'HH:mm'),
      durata: appt.durata?.toString() || '',
      contactId: appt.contactId || '',
      propertyId: appt.propertyId || '',
      note: appt.note || '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.titolo.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }

    setSaving(true);
    try {
      const dateTime = new Date(`${formData.data}T${formData.ora}`);
      const response = await fetch(`/api/activities/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titolo: formData.titolo,
          tipo: formData.tipo,
          data: dateTime.toISOString(),
          durata: formData.durata ? parseInt(formData.durata) : undefined,
          contactId: formData.contactId || undefined,
          propertyId: formData.propertyId || undefined,
          note: formData.note,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAppointment(updatedData);
        setShowEditModal(false);
        // Ricarica i dati aggiornati
        fetchAppointment();
      } else {
        alert('Errore nel salvataggio');
      }
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      alert('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return;

    try {
      const response = await fetch(`/api/activities/${params.id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/agenda');
      } else {
        alert('Errore nell\'eliminazione');
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      alert('Errore nell\'eliminazione');
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
          <Header title="Dettaglio Appuntamento" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
          <Header title="Dettaglio Appuntamento" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="card text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Appuntamento non trovato</h3>
              <p className="text-gray-600 mb-4">L'appuntamento richiesto non esiste o è stato eliminato.</p>
              <Link href="/agenda" className="btn btn-primary">
                Torna all'Agenda
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const appointmentTime = format(parseISO(appointment.data), 'HH:mm');
  const appointmentDate = format(parseISO(appointment.data), 'd MMMM yyyy', { locale: it });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title="Dettaglio Appuntamento" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/agenda" className="btn btn-secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna all'Agenda
                </Link>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{appointment.titolo || 'Appuntamento senza titolo'}</h1>
                  <p className="text-gray-600">{appointment.tipo || 'Appuntamento'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Elimina
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <p className="text-sm text-gray-900">{appointment.tipo || 'Non specificato'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Data e Ora</label>
                        <p className="text-sm text-gray-900">{appointmentDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ora</label>
                        <p className="text-sm text-gray-900 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {appointmentTime}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Durata</label>
                        <p className="text-sm text-gray-900">
                          {appointment.durata ? `${appointment.durata} minuti` : 'Non specificata'}
                        </p>
                      </div>
                    </div>

                    {appointment.note && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{appointment.note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Creato</p>
                        <p className="text-xs text-gray-600">
                          {format(parseISO(appointment.createdAt), 'dd/MM/yyyy HH:mm', { locale: it })}
                        </p>
                      </div>
                    </div>
                    
                    {appointment.updatedAt && appointment.updatedAt !== appointment.createdAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Modificato</p>
                          <p className="text-xs text-gray-600">
                            {format(parseISO(appointment.updatedAt), 'dd/MM/yyyy HH:mm', { locale: it })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact */}
                {appointment.contact && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contatto</h3>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.contact.tipo === 'AZIENDA'
                            ? appointment.contact.ragioneSociale
                            : `${appointment.contact.firstName ?? ''} ${appointment.contact.lastName ?? ''}`.trim() || 'Contatto senza nome'}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.contact.tipo === 'AZIENDA' ? 'Azienda' : 'Persona'}</p>
                      </div>
                    </div>
                    
                    {appointment.contact.telefono && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.contact.telefono}</span>
                      </div>
                    )}

                    {appointment.contact.cellulare && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.contact.cellulare}</span>
                      </div>
                    )}
                    
                    {appointment.contact.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{appointment.contact.email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Property */}
                {appointment.property && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Immobile</h3>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.property.indirizzo || 'Indirizzo non disponibile'}</p>
                        <p className="text-sm text-gray-600">{appointment.property.citta || ''}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Modifica Appuntamento</h2>
                <p className="text-sm text-gray-500">Aggiorna i dettagli dell'appuntamento.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                <input
                  type="text"
                  name="titolo"
                  value={formData.titolo}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Titolo appuntamento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
                  <input
                    type="time"
                    name="ora"
                    value={formData.ora}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="VISITA">Visita</option>
                    <option value="CHIAMATA">Chiamata</option>
                    <option value="RIUNIONE">Riunione</option>
                    <option value="ALTRO">Altro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durata (minuti)</label>
                  <input
                    type="number"
                    name="durata"
                    value={formData.durata}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Es. 30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Dettagli aggiuntivi"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salva
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}