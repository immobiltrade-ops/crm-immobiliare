'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Property } from '@/types';
import { MapPin, Edit } from 'lucide-react';
import Link from 'next/link';

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [searchQuery]);

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/properties?${params}`);
      if (!response.ok) {
        console.error('Errore HTTP properties:', response.status);
        setProperties([]);
        return;
      }
      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.properties)
        ? data.properties
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setProperties(list);
    } catch (error) {
      console.error('Errore:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, { label: string; class: string }> = {
    DISPONIBILE: { label: 'Disponibile', class: 'badge-success' },
    OPTIONATO: { label: 'Opzionato', class: 'badge-warning' },
    VENDUTO: { label: 'Venduto', class: 'badge-gray' },
    AFFITTATO: { label: 'Affittato', class: 'badge-info' },
    RITIRATO: { label: 'Ritirato', class: 'badge-danger' },
    available: { label: 'Disponibile', class: 'badge-success' },
    optioned: { label: 'Opzionato', class: 'badge-warning' },
    sold: { label: 'Venduto', class: 'badge-gray' },
    rented: { label: 'Affittato', class: 'badge-info' },
    withdrawn: { label: 'Ritirato', class: 'badge-danger' },
  };

  const categoryLabels: Record<string, string> = {
    APPARTAMENTO: 'Appartamento',
    VILLA: 'Villa',
    UFFICIO: 'Ufficio',
    NEGOZIO: 'Negozio',
    MAGAZZINO: 'Magazzino',
    TERRENO: 'Terreno',
    GARAGE: 'Garage',
    ALTRO: 'Altro',
    apartment: 'Appartamento',
    villa: 'Villa',
    office: 'Ufficio',
    shop: 'Negozio',
    warehouse: 'Magazzino',
    land: 'Terreno',
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header
          title="Immobili"
          newButtonText="Nuovo Immobile"
          showSearch
          onSearch={setSearchQuery}
          onNewClick={() => router.push('/immobili/nuovo')}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : !Array.isArray(properties) || properties.length === 0 ? (
            <div className="card text-center py-16 text-gray-500">
              Nessun immobile trovato.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="card hover:shadow-md transition-shadow flex flex-col">

                  {/* Riga superiore: stato + pulsante modifica */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono text-gray-500">{property.internalCode}</span>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${statusLabels[property.stato || property.status || '']?.class || 'badge-gray'}`}>
                        {statusLabels[property.stato || property.status || '']?.label || property.stato || property.status || 'N/D'}
                      </span>
                      <Link
                        href={`/immobili/${property.id}`}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors"
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Titolo tipo + permuta — cliccabile */}
                  <Link href={`/immobili/${property.id}`} className="flex items-center gap-2 mb-2 group">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {categoryLabels[property.tipo || property.category || ''] || 'Immobile'}
                    </h3>
                    {property.acceptsExchange && (
                      <span className="badge badge-permuta">Permuta</span>
                    )}
                  </Link>

                  {/* Indirizzo */}
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      {property.indirizzo || property.address || property.addressMasked || 'Indirizzo non disponibile'}
                      {(property.citta || property.city) ? `, ${property.citta || property.city}` : ''}
                    </span>
                  </div>

                  {/* Proprietario */}
                  {property.owner && (() => {
                    const owner = property.owner as any;
                    return (
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                        <span className="font-medium">Proprietario:</span>
                        <span>
                          {owner.tipo === 'PERSONA_FISICA'
                            ? `${owner.nome || ''} ${owner.cognome || ''}`.trim() || 'Nome non disponibile'
                            : owner.ragioneSociale || 'Ragione sociale non disponibile'
                          }
                        </span>
                      </div>
                    );
                  })()}

                  {/* Superfice / locali / piano */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">{property.superficie || property.surface || 0}m²</div>
                      <div className="text-xs text-gray-500">Superficie</div>
                    </div>
                    {(property.locali || property.rooms) && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{property.locali || property.rooms}</div>
                        <div className="text-xs text-gray-500">Locali</div>
                      </div>
                    )}
                    {(property.piano || property.floor) && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{property.piano || property.floor}°</div>
                        <div className="text-xs text-gray-500">Piano</div>
                      </div>
                    )}
                  </div>

                  {/* Prezzo */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
                    <div className="text-2xl font-bold text-gray-900">
                      €{((property.prezzo || property.price) ?? 0).toLocaleString('it-IT')}
                    </div>
                    {property.exclusive && (
                      <span className="badge badge-info">Esclusiva</span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}