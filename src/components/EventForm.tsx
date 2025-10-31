import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type EventFormProps = {
  event: Event | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'seminar' | 'workshop' | 'tech_fest' | 'concert'>('seminar');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setCategory(event.category);
      setLocation(event.location);
      const date = new Date(event.event_date);
      setEventDate(date.toISOString().slice(0, 16));
      setCapacity(event.capacity.toString());
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        title,
        description,
        category,
        location,
        event_date: new Date(eventDate).toISOString(),
        capacity: parseInt(capacity),
        ...(event ? {} : { created_by: user?.id }),
      };

      if (event) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {event ? 'Edit Event' : 'Create New Event'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
              <option value="tech_fest">Tech Fest</option>
              <option value="concert">Concert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Date & Time
          </label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
