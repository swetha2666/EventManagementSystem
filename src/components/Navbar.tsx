import { Calendar, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavbarProps = {
  onNavigate: (view: 'events' | 'admin' | 'my-registrations') => void;
  currentView: string;
};

export function Navbar({ onNavigate, currentView }: NavbarProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('events')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'events'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Events
            </button>

            <button
              onClick={() => onNavigate('my-registrations')}
              className={`text-sm font-medium transition-colors ${
                currentView === 'my-registrations'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Registrations
            </button>

            {profile?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`text-sm font-medium transition-colors ${
                  currentView === 'admin'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Admin Dashboard
              </button>
            )}

            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{profile?.full_name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
