import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/PrivateRoute';

// Pages
import Overview from './pages/dashboard/Overview';
import Users from './pages/dashboard/Users';
import Families from './pages/dashboard/Families';
import Applications from './pages/dashboard/Applications';
import Candidates from './pages/dashboard/Candidates';
import Calendar from './pages/dashboard/Calendar';
import Settings from './pages/dashboard/Settings';
import { ToastProvider } from "./components/shared/toast/ToastProvider";
import ForgotPasswordPage from './pages/dashboard/ForgotPasswordPage';

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>

            <Route index element={<Navigate to="users" replace />} />

            {/* Faqat ADMIN kira oladigan sahifalar */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="overview" element={<Overview />} />
              <Route path="families" element={<Families />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="applications" element={<Applications />} />
            </Route>

            {/* ADMIN va MANAGER kira oladigan sahifalar */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}>
              <Route path="users" element={<Users />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="settings" element={<Settings />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<div className="p-8 text-center">404</div>} />
      </Routes>
    </ToastProvider>
  );
}

export default App;