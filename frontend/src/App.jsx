import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterOrganizerPage from './pages/RegisterOrganizerPage';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentResultPage from './pages/PaymentResultPage';
import AdminPage, { DashboardHome } from './pages/admin/AdminPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminVenuesPage from './pages/admin/AdminVenuesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrganizerRequestsPage from './pages/admin/AdminOrganizerRequestsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminCancellationRequestsPage from './pages/admin/AdminCancellationRequestsPage';
import ManagerEventStatsPage from './pages/admin/ManagerEventStatsPage';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1a3e', color: '#fff', border: '1px solid #2a2a4a' },
          success: { iconTheme: { primary: '#00b894', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e17055', secondary: '#fff' } },
        }} />
        <Routes>
          {/* Auth pages (no navbar/footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-organizer" element={<PrivateRoute><RegisterOrganizerPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />

          {/* Main layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
            <Route path="/bookings/:id" element={<PrivateRoute><BookingDetailPage /></PrivateRoute>} />
          </Route>

          {/* Admin layout */}
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<DashboardHome />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="events/:eventId/stats" element={<ManagerEventStatsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="venues" element={<AdminVenuesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="organizer-requests" element={<AdminOrganizerRequestsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="cancellation-requests" element={<AdminCancellationRequestsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
