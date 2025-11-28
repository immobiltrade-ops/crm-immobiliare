'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Building2, User, TrendingUp, Calendar } from 'lucide-react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities');
      const data = await response.json();
      setOpportunities(data);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { id: 'new_lead', label: 'Nuovo Lead', color: 'bg-gray-100' },
    { id: 'qualified', label: 'Qualificato', color: 'bg-blue-100' },
    { id: 'visit', label: 'Visita', color: 'bg-purple-100' },
    { id: 'proposal', label: 'Proposta', color: 'bg-yellow-100' },
    { id: 'negotiation', label: 'Trattativa', color: 'bg-orange-100' },
    { id: 'closing', label: 'Chiusura', color: 'bg-green-100' },
  ];

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage === stageId && opp.status === 'active');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title="Opportunità" />
        
        <main className="flex-1 overflow-x-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="flex gap-4 min-w-max">
              {stages.map((stage) => {
                const stageOpps = getOpportunitiesByStage(stage.id);
                const totalValue = stageOpps.reduce((sum, opp) => sum + opp.expectedValue, 0);

                return (
                  <div key={stage.id} className="flex-shrink-0 w-80">
                    <div className={`${stage.color} rounded-lg p-3 mb-3`}>
                      <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {stageOpps.length} opportunità • €{(totalValue / 1000).toFixed(0)}k
                      </div>
                    </div>

                    <div className="space-y-3">
                      {stageOpps.map((opp) => (
                        <div key={opp.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <span className={`badge ${
                              opp.type === 'sale' ? 'badge-success' : 'badge-info'
                            }`}>
                              {opp.type === 'sale' ? 'Vendita' : 'Locazione'}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {opp.probability}%
                            </span>
                          </div>

                          {opp.property && (
                            <div className="flex items-start gap-2 mb-2">
                              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-gray-900 font-medium">
                                {opp.property.address}
                              </div>
                            </div>
                          )}

                          {opp.contact && (
                            <div className="flex items-start gap-2 mb-3">
                              <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-gray-600">
                                {opp.contact.type === 'company' 
                                  ? opp.contact.companyName
                                  : `${opp.contact.name} ${opp.contact.surname || ''}`}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div className="text-lg font-bold text-gray-900">
                              €{(opp.expectedValue / 1000).toFixed(0)}k
                            </div>
                            {opp.expectedCloseDate && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(opp.expectedCloseDate).toLocaleDateString('it-IT', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </div>
                            )}
                          </div>

                          {opp.agent && (
                            <div className="mt-2 text-xs text-gray-500">
                              Agente: {opp.agent.name}
                            </div>
                          )}
                        </div>
                      ))}

                      {stageOpps.length === 0 && (
                        <div className="card text-center py-8 text-gray-400">
                          Nessuna opportunità
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
