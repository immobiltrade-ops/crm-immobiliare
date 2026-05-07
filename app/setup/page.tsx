'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ password: '', conferma: '' });
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  const handleSubmit = async () => {
    setErrore('');
    if (!form.password) { setErrore('Inserisci una password.'); return; }
    if (form.password.length < 6) { setErrore('La password deve avere almeno 6 caratteri.'); return; }
    if (form.password !== form.conferma) { setErrore('Le password non coincidono.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setErrore(data.error || 'Errore durante il setup.'); return; }
      router.push('/login');
    } catch {
      setErrore('Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Building2 className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CRM Immobiliare</h1>
            <p className="text-xs text-gray-500">Primo accesso</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Imposta la tua password</h2>
          <p className="text-sm text-gray-500">
            Questa schermata appare una sola volta. Imposta la password per l'account amministratore.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="Minimo 6 caratteri"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conferma Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="Ripeti la password"
                value={form.conferma}
                onChange={(e) => setForm({ ...form, conferma: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {errore && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errore}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? 'Salvataggio...' : 'Imposta Password e Accedi'}
          </button>
        </div>

      </div>
    </div>
  );
}