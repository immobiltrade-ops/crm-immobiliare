'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Users, Building2, Target, Calendar, TrendingUp, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const nomeContatto = (c: any) => {
  if (!c) return '';
  if (c.tipo === 'AZIENDA') return c.ragioneSociale || 'Azienda';
  return `${c.nome || ''} ${c.cognome || ''}`.trim() || 'Senza nome';
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalContatti: 0,
    immobiliDisponibili: 0,
    opportunitaAttive: 0,
    appuntamentiOggi: 0,
    valorePortafoglio: 0,
  });
  const [appuntamentiOggi, setAppuntamentiOggi] = useState<any[]>([]);
  const [ultimiImmobili, setUltimiImmobili] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const oggi = format(new Date(), 'yyyy-MM-dd');
      const [contatti, immobili, opportunita, appuntamenti] = await Promise.all([
        fetch('/api/contacts').then(r => r.ok ? r.json() : []),
        fetch('/api/properties').then(r => r.ok ? r.json() : []),
        fetch('/api/opportunities').then(r => r.ok ? r.json() : []),
        fetch(`/api/activities?date=${oggi}`).then(r => r.ok ? r.json() : []),
      ]);

      const listaContatti    = Array.isArray(contatti)     ? contatti     : contatti?.data     ?? [];
      const listaImmobili    = Array.isArray(immobili)     ? immobili     : immobili?.data     ?? [];
      const listaOpp         = Array.isArray(opportunita)  ? opportunita  : opportunita?.data  ?? [];
      const listaApp         = Array.isArray(appuntamenti) ? appuntamenti : appuntamenti?.data ?? [];

      const disponibili  = listaImmobili.filter((p: any) => p.stato === 'DISPONIBILE');
      const attive       = listaOpp.filter((o: any) => !['CLOSED_WON', 'CLOSED_LOST'].includes(o.stato));
      const valore       = disponibili.reduce((sum: number, p: any) => sum + (p.prezzo || 0), 0);

      setStats({
        totalContatti:       listaContatti.length,
        immobiliDisponibili: disponibili.length,
        opportunitaAttive:   attive.length,
        appuntamentiOggi:    listaApp.length,
        valorePortafoglio:   valore,
      });

      setAppuntamentiOggi(listaApp.slice(0, 5));
      setUltimiImmobili(listaImmobili.slice(0, 4));
    } catch (error) {
      console.error('Errore dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Contatti',           value: stats.totalContatti,       icon: Users,     color: 'bg-blue-50 text-blue-600',   href: '/contatti'   },
    { label: 'Immobili disponibili', value: stats.immobiliDisponibili, icon: Building2, color: 'bg-green-50 text-green-600', href: '/immobili'   },
    { label: 'Opportunità attive', value: stats.opportunitaAttive,   icon: Target,    color: 'bg-orange-50 text-orange-600', href: '/opportunita' },
    { label: 'Appuntamenti oggi',  value: stats.appuntamentiOggi,    icon: Calendar,  color: 'bg-purple-50 text-purple-600', href: '/agenda'     },
  ];

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header title="Dashboard" />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title="Dashboard" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Statistiche */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map(({ label, value, icon: Icon, color, href }) => (
                <div
                  key={label}
                  onClick={() => router.push(href)}
                  className="card cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Valore portafoglio */}
            <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm">Valore portafoglio disponibile</p>
                  <p className="text-3xl font-bold mt-1">
                    €{stats.valorePortafoglio.toLocaleString('it-IT')}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Euro className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Appuntamenti oggi */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Appuntamenti oggi — {format(new Date(), 'd MMMM', { locale: it })}
                  </h2>
                  <button onClick={() => router.push('/agenda')} className="text-sm text-primary-600 hover:underline">
                    Vai all'agenda →
                  </button>
                </div>

                {Array.isArray(appuntamentiOggi) && appuntamentiOggi.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nessun appuntamento oggi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.isArray(appuntamentiOggi) && appuntamentiOggi.map((app: any) => (
                      <div key={app.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{app.titolo}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(app.data), 'HH:mm')}
                            {app.durata && ` • ${app.durata} min`}
                            {app.contact && ` • ${nomeContatto(app.contact)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ultimi immobili */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Ultimi immobili inseriti</h2>
                  <button onClick={() => router.push('/immobili')} className="text-sm text-primary-600 hover:underline">
                    Vedi tutti →
                  </button>
                </div>

                {Array.isArray(ultimiImmobili) && ultimiImmobili.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nessun immobile inserito</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.isArray(ultimiImmobili) && ultimiImmobili.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/immobili/${p.id}`)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{p.titolo}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {p.indirizzo || 'Indirizzo non disponibile'}{p.citta ? `, ${p.citta}` : ''}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="font-semibold text-gray-900">
                            {p.prezzo ? `€${p.prezzo.toLocaleString('it-IT')}` : '—'}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.stato === 'DISPONIBILE' ? 'bg-green-100 text-green-700' :
                            p.stato === 'VENDUTO'     ? 'bg-gray-100 text-gray-600'  :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {p.stato}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
