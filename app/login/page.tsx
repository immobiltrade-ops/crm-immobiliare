'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  const handleSubmit = async () => {
    setErrore('');
    if (!form.email || !form.password) {
      setErrore('Inserisci email e password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email:    form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setErrore('Email o password non corretti.');
      } else {
        router.push('/');
        router.refresh();
      }
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
            <p className="text-xs text-gray-500">Accedi al tuo account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                className="input-field pl-10"
                placeholder="la-tua@email.it"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          ImmobilTrade CRM — accesso riservato
        </p>

      </div>
    </div>
  );
}