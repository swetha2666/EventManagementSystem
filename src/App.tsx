import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { EventList } from './components/EventList';
import { MyRegistrations } from './components/MyRegistrations';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'events' | 'admin' | 'my-registrations'>('events');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      {currentView === 'events' && <EventList />}
      {currentView === 'my-registrations' && <MyRegistrations />}
      {currentView === 'admin' && <AdminDashboard />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
