'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Settings, User, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title="Impostazioni" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Profilo</h3>
              </div>
              <p className="text-gray-600">Gestisci le informazioni del tuo profilo e le preferenze personali.</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notifiche</h3>
              </div>
              <p className="text-gray-600">Configura come e quando ricevere le notifiche.</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Sicurezza</h3>
              </div>
              <p className="text-gray-600">Gestisci password, autenticazione a due fattori e accessi.</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Dati e Privacy</h3>
              </div>
              <p className="text-gray-600">Esporta i tuoi dati e gestisci le impostazioni sulla privacy.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
