import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, X } from 'lucide-react';
import { supabase, Event, Registration } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type EventWithRegistration = Event & { registration_id: string; status: string };

export function MyRegistrations() {
  const [registrations, setRegistrations] = useState<EventWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadRegistrations();
  }, [user]);

  const loadRegistrations = async () => {
    if (!user) return;

    try {
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('id, event_id, status')
        .eq('user_id', user.id)
        .eq('status', 'confirmed');

      if (regError) throw regError;

      if (regData && regData.length > 0) {
        const eventIds = regData.map((r) => r.event_id);
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        if (eventError) throw eventError;

        const combined = eventData?.map((event) => {
          const reg = regData.find((r) => r.event_id === event.id);
          return {
            ...event,
            registration_id: reg!.id,
            status: reg!.status,
          };
        }) || [];

        setRegistrations(combined);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId: string, eventId: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;

    setCancellingId(registrationId);
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) throw error;

      const { error: updateError } = await supabase.rpc('decrement_registered_count', {
        event_id: eventId,
      });

      if (!updateError) {
        setRegistrations((prev) => prev.filter((r) => r.registration_id !== registrationId));
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      alert('Failed to cancel registration. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your registrations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Registrations</h1>

      {registrations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">You haven't registered for any events yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((event) => (
            <div
              key={event.registration_id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {event.registered_count} / {event.capacity} registered
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCancel(event.registration_id, event.id)}
                  disabled={cancellingId === event.registration_id}
                  className="ml-4 flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {cancellingId === event.registration_id ? 'Cancelling...' : 'Cancel'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
