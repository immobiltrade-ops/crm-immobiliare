'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Calendar, Phone, Mail, Target, Clock, User, Building2, X, Edit, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

const nomeContatto = (c: any) => {
  if (!c) return '';
  if (c.tipo === 'AZIENDA') return c.ragioneSociale || 'Azienda senza nome';
  return `${c.nome || ''} ${c.cognome || ''}`.trim() || 'Contatto senza nome';
};

interface Appointment {
  id: string;
  titolo: string;
  tipo: string;
  data: string;
  durata?: number;
  contactId?: string;
  propertyId?: string;
  note?: string;
  contact?: any;
  property?: any;
}

export default function AgendaPage() {
  const [activities, setActivities] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Appointment | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  const emptyForm = {
    titolo: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    ora: format(new Date(), 'HH:mm'),
    tipo: 'VISITA',
    contactId: '',
    propertyId: '',
    durata: '',
    note: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchActivities(); }, [selectedDate]);
  useEffect(() => { fetchContacts(); fetchProperties(); }, []);

  const fetchActivities = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/activities?date=${dateStr}`);
      if (!response.ok) { setActivities([]); return; }
      const data = await response.json();
      setActivities(Array.isArray(data) ? data : data?.data ?? []);
    } catch { setActivities([]); }
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

  const openNew = () => {
    setEditingActivity(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (activity: Appointment) => {
    setEditingActivity(activity);
    const d = parseISO(activity.data);
    setFormData({
      titolo:     activity.titolo || '',
      data:       format(d, 'yyyy-MM-dd'),
      ora:        format(d, 'HH:mm'),
      tipo:       activity.tipo || 'VISITA',
      contactId:  activity.contactId || '',
      propertyId: activity.propertyId || '',
      durata:     activity.durata?.toString() || '',
      note:       activity.note || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo appuntamento?')) return;
    try {
      await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      fetchActivities();
    } catch {}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = new Date(`${formData.data}T${formData.ora}`);
    const url    = editingActivity ? `/api/activities/${editingActivity.id}` : '/api/activities';
    const method = editingActivity ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titolo:     formData.titolo,
          tipo:       formData.tipo,
          data:       dateTime.toISOString(),
          durata:     formData.durata ? parseInt(formData.durata) : null,
          contactId:  formData.contactId  || null,
          propertyId: formData.propertyId || null,
          note:       formData.note,
        }),
      });
      if (response.ok) {
        setShowModal(false);
        fetchActivities();
      }
    } catch (error) {
      console.error('Errore salvataggio:', error);
    }
  };

  const tipoIcons: Record<string, any> = {
    CHIAMATA: Phone,
    EMAIL:    Mail,
    VISITA:   Building2,
    RIUNIONE: Calendar,
    ALTRO:    Target,
  };

  const tipoColori: Record<string, string> = {
    VISITA:   'bg-blue-50 border-blue-500',
    CHIAMATA: 'bg-green-50 border-green-500',
    RIUNIONE: 'bg-purple-50 border-purple-500',
    EMAIL:    'bg-yellow-50 border-yellow-500',
    ALTRO:    'bg-gray-50 border-gray-400',
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getActivitiesForDate = (date: Date) =>
    activities
      .filter(a => isSameDay(parseISO(a.data), date))
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const weekDays = getWeekDays();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title="Agenda" newButtonText="Nuovo Appuntamento" onNewClick={openNew} />

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : !Array.isArray(activities) ? (
            <div className="card text-center py-16 text-gray-500">
              Errore nel caricamento delle attività.
            </div>
          ) : (
            <>
              {/* Settimana */}
              <div className="card mb-6">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, idx) => {
                    const dayActivities = getActivitiesForDate(day);
                    const isToday    = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          isSelected ? 'bg-primary-600 text-white'
                          : isToday  ? 'bg-primary-50 text-primary-700'
                          : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-xs font-medium">{format(day, 'EEE', { locale: it })}</div>
                        <div className="text-2xl font-bold mt-1">{format(day, 'd')}</div>
                        {dayActivities.length > 0 && (
                          <div className={`text-xs mt-1 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                            {dayActivities.length} att.
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lista attività */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Attività del {format(selectedDate, 'd MMMM yyyy', { locale: it })}
                </h3>

                <div className="space-y-3">
                  {Array.isArray(getActivitiesForDate(selectedDate)) && getActivitiesForDate(selectedDate).map((activity) => {
                    const Icon = tipoIcons[activity.tipo?.toUpperCase()] || Target;
                    return (
                      <div
                        key={activity.id}
                        className={`p-4 rounded-lg border-l-4 ${tipoColori[activity.tipo?.toUpperCase()] || 'bg-gray-50 border-gray-400'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white shadow-sm">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {activity.titolo || 'Appuntamento senza titolo'}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {format(parseISO(activity.data), 'HH:mm')}
                                </span>
                                <button
                                  onClick={() => openEdit(activity)}
                                  className="p-1 text-gray-400 hover:text-primary-600 hover:bg-white rounded transition-colors"
                                  title="Modifica"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(activity.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                                  title="Elimina"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-500 mb-2">
                              {activity.tipo}
                              {activity.durata && ` • ${activity.durata} min`}
                            </p>

                            {activity.note && (
                              <p className="text-sm text-gray-700 mb-2">{activity.note}</p>
                            )}

                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              {activity.contact && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {nomeContatto(activity.contact)}
                                </div>
                              )}
                              {activity.property && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {activity.property.titolo || activity.property.indirizzo || 'Immobile'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {getActivitiesForDate(selectedDate).length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Nessuna attività programmata per questo giorno</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingActivity ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
                </h2>
                <p className="text-sm text-gray-500">Inserisci i dettagli e salva.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titolo *</label>
                <input
                  name="titolo"
                  value={formData.titolo}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Es. Visita appartamento Via Roma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                  <input type="date" name="data" value={formData.data} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ora *</label>
                  <input type="time" name="ora" value={formData.ora} onChange={handleChange} required className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange} className="input-field">
                    <option value="VISITA">Visita</option>
                    <option value="CHIAMATA">Chiamata</option>
                    <option value="RIUNIONE">Riunione</option>
                    <option value="EMAIL">Email</option>
                    <option value="ALTRO">Altro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durata (min)</label>
                  <input type="number" name="durata" value={formData.durata} onChange={handleChange} className="input-field" placeholder="60" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contatto</label>
                <select name="contactId" value={formData.contactId} onChange={handleChange} className="input-field">
                  <option value="">— Nessun contatto —</option>
                  {Array.isArray(contacts) && contacts.map(c => (
                    <option key={c.id} value={c.id}>{nomeContatto(c)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immobile</label>
                <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="input-field">
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
                <textarea name="note" value={formData.note} onChange={handleChange} rows={3} className="input-field" placeholder="Dettagli aggiuntivi" />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="submit" className="btn-primary flex-1">
                  {editingActivity ? 'Salva Modifiche' : 'Salva Appuntamento'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annulla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}