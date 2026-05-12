import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import BadgesPage from './pages/BadgesPage';
import BuildingsPage from './pages/BuildingsPage';
import DoorsPage from './pages/DoorsPage';
import PermissionsPage from './pages/PermissionsPage';
import AccessSimulationPage from './pages/AccessSimulationPage';
import LogsPage from './pages/LogsPage';
import IncidentsPage from './pages/IncidentsPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected - Dashboard Layout */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin only */}
        <Route path="/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="/badges" element={<ProtectedRoute roles={['admin']}><BadgesPage /></ProtectedRoute>} />
        <Route path="/buildings" element={<ProtectedRoute roles={['admin']}><BuildingsPage /></ProtectedRoute>} />
        <Route path="/doors" element={<ProtectedRoute roles={['admin']}><DoorsPage /></ProtectedRoute>} />
        <Route path="/permissions" element={<ProtectedRoute roles={['admin']}><PermissionsPage /></ProtectedRoute>} />

        {/* Admin + Security */}
        <Route path="/simulation" element={<ProtectedRoute roles={['admin','security']}><AccessSimulationPage /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute roles={['admin','security']}><LogsPage /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute roles={['admin','security']}><IncidentsPage /></ProtectedRoute>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
