'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { 
  Users, 
  Building2, 
  Target, 
  TrendingUp,
  Calendar,
  Phone,
  MapPin,
  Euro
} from 'lucide-react';
import { DashboardStats, PipelineData } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipelineData, setPipelineData] = useState<PipelineData[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setStats(data.stats);
      setPipelineData(data.pipelineData);
      setRecentActivities(data.recentActivities);
    } catch (error) {
      console.error('Errore nel caricamento della dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stageLabels: Record<string, string> = {
    new_lead: 'Nuovo Lead',
    qualified: 'Qualificato',
    visit: 'Visita',
    proposal: 'Proposta',
    negotiation: 'Trattativa',
    closing: 'Chiusura',
  };

  const activityTypeLabels: Record<string, string> = {
    call: 'Chiamata',
    email: 'Email',
    visit: 'Visita',
    meeting: 'Appuntamento',
    task: 'Task',
  };

  const activityTypeIcons: Record<string, any> = {
    call: Phone,
    email: MapPin,
    visit: Building2,
    meeting: Calendar,
    task: Target,
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Caricamento...</p>
            </div>
          </div>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contatti Totali</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalContacts || 0}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {stats?.activeLeads || 0} lead attivi
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Immobili</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalProperties || 0}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {stats?.availableProperties || 0} disponibili
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Opportunità Attive</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.activeOpportunities || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {stats?.conversionRate.toFixed(1)}% conversione
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valore Pipeline</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    €{((stats?.opportunitiesValue || 0) / 1000).toFixed(0)}k
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stats?.thisMonthActivities || 0} attività questo mese
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pipeline Chart */}
            <div className="lg:col-span-2 card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Vendite</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="stage" 
                      tickFormatter={(value) => stageLabels[value] || value}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value: any) => [`${value} opportunità`, 'Totale']}
                      labelFormatter={(label) => stageLabels[label] || label}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivities.map((activity) => {
                  const Icon = activityTypeIcons[activity.type] || Target;
                  return (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="p-2 bg-gray-100 rounded-lg h-fit">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activityTypeLabels[activity.type]} • {activity.assignee?.name}
                        </p>
                        {activity.contact && (
                          <p className="text-xs text-gray-600 mt-1">
                            {activity.contact.name} {activity.contact.surname}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.scheduledDate || activity.createdAt).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        {activity.status === 'completed' ? (
                          <span className="badge badge-success">Completata</span>
                        ) : (
                          <span className="badge badge-warning">Pianificata</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
