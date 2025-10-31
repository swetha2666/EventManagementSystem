import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Event = {
  id: string;
  title: string;
  description: string;
  category: 'seminar' | 'workshop' | 'tech_fest' | 'concert';
  location: string;
  event_date: string;
  capacity: number;
  registered_count: number;
  image_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export type Registration = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'confirmed' | 'cancelled';
  registered_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
};
