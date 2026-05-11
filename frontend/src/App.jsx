import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BonusesList from './pages/BonusesList';
import BonusForm from './pages/BonusForm';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-base-200">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/bonuses" element={<ProtectedRoute><BonusesList currentUser={user} /></ProtectedRoute>} />
          <Route path="/bonuses/new" element={<ProtectedRoute><BonusForm /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold">Employés</h1>
              <p className="mt-4">Liste des employés à venir...</p>
            </div>
          </ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
