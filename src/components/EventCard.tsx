import { Calendar, MapPin, Users, Music, Briefcase, GraduationCap, Zap } from 'lucide-react';
import { Event } from '../lib/supabase';

type EventCardProps = {
  event: Event;
  onRegister: (eventId: string) => void;
  isRegistered: boolean;
  loading?: boolean;
};

const categoryIcons = {
  seminar: GraduationCap,
  workshop: Briefcase,
  tech_fest: Zap,
  concert: Music,
};

const categoryColors = {
  seminar: 'bg-blue-100 text-blue-700',
  workshop: 'bg-green-100 text-green-700',
  tech_fest: 'bg-orange-100 text-orange-700',
  concert: 'bg-pink-100 text-pink-700',
};

export function EventCard({ event, onRegister, isRegistered, loading }: EventCardProps) {
  const Icon = categoryIcons[event.category];
  const colorClass = categoryColors[event.category];
  const spotsLeft = event.capacity - event.registered_count;
  const isFull = spotsLeft <= 0;

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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            <Icon className="h-3.5 w-3.5" />
            <span className="capitalize">{event.category.replace('_', ' ')}</span>
          </span>
          {isFull && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              Full
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
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
              {!isFull && <span className="ml-1 text-green-600 font-medium">({spotsLeft} spots left)</span>}
            </span>
          </div>
        </div>

        <button
          onClick={() => onRegister(event.id)}
          disabled={isRegistered || isFull || loading}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-colors ${
            isRegistered
              ? 'bg-green-100 text-green-700 cursor-default'
              : isFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${loading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {loading ? 'Processing...' : isRegistered ? 'Registered' : isFull ? 'Event Full' : 'Register Now'}
        </button>
      </div>
    </div>
  );
}
