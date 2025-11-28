'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Activity } from '@/types';
import { Calendar, Phone, Mail, MapPin, Target, Clock, User, Building2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export default function AgendaPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const activityTypeIcons: Record<string, any> = {
    call: Phone,
    email: Mail,
    visit: Building2,
    meeting: Calendar,
    task: Target,
  };

  const activityTypeLabels: Record<string, string> = {
    call: 'Chiamata',
    email: 'Email',
    visit: 'Visita',
    meeting: 'Appuntamento',
    task: 'Task',
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = activity.scheduledDate 
        ? parseISO(activity.scheduledDate)
        : parseISO(activity.createdAt);
      return isSameDay(activityDate, date);
    }).sort((a, b) => {
      const timeA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
      const timeB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
      return timeA - timeB;
    });
  };

  const weekDays = getWeekDays();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header title="Agenda" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Calendar Header */}
              <div className="card mb-6">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, idx) => {
                    const dayActivities = getActivitiesForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          isSelected 
                            ? 'bg-primary-600 text-white'
                            : isToday
                            ? 'bg-primary-50 text-primary-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {format(day, 'EEE', { locale: it })}
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {format(day, 'd')}
                        </div>
                        {dayActivities.length > 0 && (
                          <div className={`text-xs mt-1 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                            {dayActivities.length} attività
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activities List */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Attività del {format(selectedDate, 'd MMMM yyyy', { locale: it })}
                </h3>

                <div className="space-y-3">
                  {getActivitiesForDate(selectedDate).map((activity) => {
                    const Icon = activityTypeIcons[activity.type] || Target;
                    const activityTime = activity.scheduledDate 
                      ? format(parseISO(activity.scheduledDate), 'HH:mm')
                      : null;

                    return (
                      <div 
                        key={activity.id} 
                        className={`p-4 rounded-lg border-l-4 ${
                          activity.status === 'completed'
                            ? 'bg-green-50 border-green-500'
                            : activity.status === 'cancelled'
                            ? 'bg-red-50 border-red-500'
                            : 'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            activity.status === 'completed'
                              ? 'bg-green-100'
                              : activity.status === 'cancelled'
                              ? 'bg-red-100'
                              : 'bg-blue-100'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                              {activityTime && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  {activityTime}
                                </div>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                              {activityTypeLabels[activity.type]}
                            </p>

                            {activity.description && (
                              <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                            )}

                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              {activity.contact && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {activity.contact.type === 'company'
                                    ? activity.contact.companyName
                                    : `${activity.contact.name} ${activity.contact.surname || ''}`}
                                </div>
                              )}

                              {activity.property && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {activity.property.address}
                                </div>
                              )}

                              {activity.assignee && (
                                <div className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  {activity.assignee.name}
                                </div>
                              )}
                            </div>

                            {activity.outcome && (
                              <div className="mt-2 p-2 bg-white rounded text-sm text-gray-700">
                                <strong>Esito:</strong> {activity.outcome}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {getActivitiesForDate(selectedDate).length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Nessuna attività programmata per questo giorno</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
