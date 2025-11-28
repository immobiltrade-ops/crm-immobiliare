'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Property } from '@/types';
import { Building2, MapPin, Euro, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';

export default function PropertiesPage() {
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
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, { label: string; class: string }> = {
    available: { label: 'Disponibile', class: 'badge-success' },
    optioned: { label: 'Opzionato', class: 'badge-warning' },
    sold: { label: 'Venduto', class: 'badge-gray' },
    rented: { label: 'Affittato', class: 'badge-info' },
    withdrawn: { label: 'Ritirato', class: 'badge-danger' },
  };

  const categoryLabels: Record<string, string> = {
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
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono text-gray-500">{property.internalCode}</span>
                    <span className={`badge ${statusLabels[property.status]?.class || 'badge-gray'}`}>
                      {statusLabels[property.status]?.label || property.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{categoryLabels[property.category]}</h3>
                  
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{property.address}, {property.city}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">{property.surface}m²</div>
                      <div className="text-xs text-gray-500">Superficie</div>
                    </div>
                    {property.rooms && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{property.rooms}</div>
                        <div className="text-xs text-gray-500">Locali</div>
                      </div>
                    )}
                    {property.floor !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{property.floor}°</div>
                        <div className="text-xs text-gray-500">Piano</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        €{property.price.toLocaleString('it-IT')}
                      </div>
                      {property.type === 'commercial' && property.price < 10000 && (
                        <div className="text-xs text-gray-500">/mese</div>
                      )}
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
