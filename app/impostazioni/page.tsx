'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Building2, User, Bell, Shield, Download, Check } from 'lucide-react';

type Tab = 'agenzia' | 'utente' | 'notifiche' | 'privacy';

interface AgencyForm {
  nomeAgenzia: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  telefono: string;
  email: string;
  piva: string;
  sito: string;
}

interface NotificheForm {
  notificaVisita: boolean;
  notificaOpportunita: boolean;
  notificaScadenza: boolean;
}

const emptyAgency: AgencyForm = {
  nomeAgenzia: '',
  indirizzo: '',
  citta: '',
  cap: '',
  provincia: '',
  telefono: '',
  email: '',
  piva: '',
  sito: '',
};

const emptyNotifiche: NotificheForm = {
  notificaVisita: true,
  notificaOpportunita: true,
  notificaScadenza: true,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('agenzia');

  const [agencyForm, setAgencyForm] = useState<AgencyForm>(emptyAgency);
  const [notificheForm, setNotificheForm] = useState<NotificheForm>(emptyNotifiche);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [agencySaved, setAgencySaved] = useState(false);
  const [utenteSaved, setUtenteSaved] = useState(false);
  const [notificheSaved, setNotificheSaved] = useState(false);

  const [agencySaving, setAgencySaving] = useState(false);
  const [notificheSaving, setNotificheSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/impostazioni');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setAgencyForm({
            nomeAgenzia: data.nomeAgenzia ?? '',
            indirizzo: data.indirizzo ?? '',
            citta: data.citta ?? '',
            cap: data.cap ?? '',
            provincia: data.provincia ?? '',
            telefono: data.telefono ?? '',
            email: data.email ?? '',
            piva: data.piva ?? '',
            sito: data.sito ?? '',
          });
          setNotificheForm({
            notificaVisita: data.notificaVisita ?? true,
            notificaOpportunita: data.notificaOpportunita ?? true,
            notificaScadenza: data.notificaScadenza ?? true,
          });
        }
      }
    } catch (err) {
      console.error('Errore caricamento impostazioni:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveAgency = async () => {
    setAgencySaving(true);
    try {
      const res = await fetch('/api/impostazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...agencyForm, ...notificheForm }),
      });
      if (res.ok) {
        setAgencySaved(true);
        setTimeout(() => setAgencySaved(false), 2500);
      }
    } catch (err) {
      console.error('Errore salvataggio agenzia:', err);
    } finally {
      setAgencySaving(false);
    }
  };

  const saveNotifiche = async () => {
    setNotificheSaving(true);
    try {
      const res = await fetch('/api/impostazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...agencyForm, ...notificheForm }),
      });
      if (res.ok) {
        setNotificheSaved(true);
        setTimeout(() => setNotificheSaved(false), 2500);
      }
    } catch (err) {
      console.error('Errore salvataggio notifiche:', err);
    } finally {
      setNotificheSaving(false);
    }
  };

  const exportCSV = async (endpoint: string, filename: string) => {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const data: Record<string, unknown>[] = await res.json();
      const list = Array.isArray(data) ? data : (data as { data?: unknown[]; contacts?: unknown[]; properties?: unknown[] }).data ?? (data as { contacts?: unknown[] }).contacts ?? (data as { properties?: unknown[] }).properties ?? [];
      if (!Array.isArray(list) || list.length === 0) return;

      const headers = Object.keys(list[0] as object);
      const rows = (list as Record<string, unknown>[]).map((row) =>
        headers.map((h) => {
          const val = row[h];
          const str = val == null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Errore export CSV:', err);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'agenzia', label: 'Profilo Agenzia', icon: <Building2 className="w-4 h-4" /> },
    { id: 'utente', label: 'Profilo Utente', icon: <User className="w-4 h-4" /> },
    { id: 'notifiche', label: 'Notifiche', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Dati e Privacy', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title="Impostazioni" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Tab bar */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Profilo Agenzia */}
            {activeTab === 'agenzia' && (
              <div className="card space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Profilo Agenzia</h3>

                {loadingSettings ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Agenzia</label>
                        <input
                          type="text"
                          className="input-field"
                          value={agencyForm.nomeAgenzia}
                          onChange={(e) => setAgencyForm({ ...agencyForm, nomeAgenzia: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                        <input
                          type="text"
                          className="input-field"
                          value={agencyForm.indirizzo}
                          onChange={(e) => setAgencyForm({ ...agencyForm, indirizzo: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                          <input
                            type="text"
                            className="input-field"
                            value={agencyForm.citta}
                            onChange={(e) => setAgencyForm({ ...agencyForm, citta: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                          <input
                            type="text"
                            className="input-field"
                            value={agencyForm.cap}
                            onChange={(e) => setAgencyForm({ ...agencyForm, cap: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                        <input
                          type="text"
                          className="input-field"
                          maxLength={2}
                          value={agencyForm.provincia}
                          onChange={(e) => setAgencyForm({ ...agencyForm, provincia: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                          <input
                            type="tel"
                            className="input-field"
                            value={agencyForm.telefono}
                            onChange={(e) => setAgencyForm({ ...agencyForm, telefono: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            className="input-field"
                            value={agencyForm.email}
                            onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">P.IVA</label>
                          <input
                            type="text"
                            className="input-field"
                            value={agencyForm.piva}
                            onChange={(e) => setAgencyForm({ ...agencyForm, piva: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sito Web</label>
                          <input
                            type="url"
                            className="input-field"
                            value={agencyForm.sito}
                            onChange={(e) => setAgencyForm({ ...agencyForm, sito: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={saveAgency}
                        disabled={agencySaving}
                        className="btn btn-primary"
                      >
                        {agencySaving ? 'Salvataggio...' : 'Salva'}
                      </button>
                      {agencySaved && (
                        <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                          <Check className="w-4 h-4" /> Salvato
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Profilo Utente */}
            {activeTab === 'utente' && (
              <div className="card space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Profilo Utente</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      className="input-field"
                      defaultValue="Admin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      defaultValue="admin@agenzia.it"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ruolo</label>
                    <input
                      type="text"
                      className="input-field bg-gray-50"
                      defaultValue="Amministratore"
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => { setUtenteSaved(true); setTimeout(() => setUtenteSaved(false), 2500); }}
                    className="btn btn-primary"
                  >
                    Salva
                  </button>
                  {utenteSaved && (
                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                      <Check className="w-4 h-4" /> Salvato
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Notifiche */}
            {activeTab === 'notifiche' && (
              <div className="card space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Notifiche</h3>

                {loadingSettings ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <ToggleRow
                        label="Promemoria Visite"
                        description="Ricevi una notifica prima di ogni visita programmata"
                        checked={notificheForm.notificaVisita}
                        onChange={(v) => setNotificheForm({ ...notificheForm, notificaVisita: v })}
                      />
                      <ToggleRow
                        label="Nuove Opportunità"
                        description="Notifica quando viene creata una nuova opportunità"
                        checked={notificheForm.notificaOpportunita}
                        onChange={(v) => setNotificheForm({ ...notificheForm, notificaOpportunita: v })}
                      />
                      <ToggleRow
                        label="Scadenze"
                        description="Avviso per scadenze di mandati e appuntamenti"
                        checked={notificheForm.notificaScadenza}
                        onChange={(v) => setNotificheForm({ ...notificheForm, notificaScadenza: v })}
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={saveNotifiche}
                        disabled={notificheSaving}
                        className="btn btn-primary"
                      >
                        {notificheSaving ? 'Salvataggio...' : 'Salva'}
                      </button>
                      {notificheSaved && (
                        <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                          <Check className="w-4 h-4" /> Salvato
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Dati e Privacy */}
            {activeTab === 'privacy' && (
              <div className="card space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Dati e Privacy</h3>

                <p className="text-sm text-gray-500">
                  Esporta i tuoi dati in formato CSV. I file scaricati conterranno tutti i record presenti nel sistema.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => exportCSV('/api/contacts', 'contatti.csv')}
                    className="btn btn-secondary w-full sm:w-auto flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Esporta Contatti CSV
                  </button>

                  <button
                    onClick={() => exportCSV('/api/properties', 'immobili.csv')}
                    className="btn btn-secondary w-full sm:w-auto flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Esporta Immobili CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
