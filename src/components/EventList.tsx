import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { EventCard } from './EventCard';

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadEvents();
    loadRegistrations();
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, categoryFilter]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('event_id')
        .eq('user_id', user.id)
        .eq('status', 'confirmed');

      if (error) throw error;
      setRegisteredEvents(new Set(data?.map((r) => r.event_id) || []));
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((event) => event.category === categoryFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;

    setRegisteringId(eventId);
    try {
      const { error } = await supabase.from('registrations').insert([
        {
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed',
        },
      ]);

      if (error) throw error;

      const { error: updateError } = await supabase.rpc('increment_registered_count', {
        event_id: eventId,
      });

      if (!updateError) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, registered_count: e.registered_count + 1 } : e
          )
        );
      }

      setRegisteredEvents((prev) => new Set(prev).add(eventId));
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for event. Please try again.');
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Events</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
              <option value="tech_fest">Tech Fest</option>
              <option value="concert">Concert</option>
            </select>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              isRegistered={registeredEvents.has(event.id)}
              loading={registeringId === event.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
