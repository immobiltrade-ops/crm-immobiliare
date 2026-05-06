'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Target, 
  Calendar,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard',    href: '/',            icon: LayoutDashboard },
  { name: 'Contatti',     href: '/contatti',    icon: Users           },
  { name: 'Immobili',     href: '/immobili',    icon: Building2       },
  { name: 'Opportunità',  href: '/opportunita', icon: Target          },
  { name: 'Agenda',       href: '/agenda',      icon: Calendar        },
  { name: 'Impostazioni', href: '/impostazioni',icon: Settings        },
];

const ruoloLabel: Record<string, string> = {
  AMMINISTRATORE: 'Amministratore',
  AGENTE:         'Agente',
  SEGRETERIA:     'Segreteria',
};

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email.charAt(0).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [utente, setUtente] = useState<{ name: string; email: string; ruolo: string } | null>(null);

  useEffect(() => {
    fetch('/api/utente')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const admin = data.find((u: any) => u.ruolo === 'AMMINISTRATORE') || data[0];
          setUtente({ name: admin.name || '', email: admin.email, ruolo: admin.ruolo });
        }
      })
      .catch(() => null);
  }, []);

  const nomeVisibile = utente?.name || utente?.email || 'Utente';
  const iniziali = utente ? getInitials(utente.name, utente.email) : '?';
  const ruolo = utente ? (ruoloLabel[utente.ruolo] || utente.ruolo) : 'Amministratore';

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
            <Building2 className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">CRM Immobiliare</h1>
              <p className="text-xs text-gray-500">Gestione Professionale</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">{iniziali}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{nomeVisibile}</p>
                <p className="text-xs text-gray-500 truncate">{ruolo}</p>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}