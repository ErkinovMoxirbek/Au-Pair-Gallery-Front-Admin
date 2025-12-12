import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <ToastProvider>
      <Routes>
      <Route path="/" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/overview" element={<Overview />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/dashboard/families" element={<Families />} />
          <Route path="/dashboard/candidates" element={<Candidates />} />
          <Route path="/dashboard/applications" element={<Applications />} />
          <Route path="/dashboard/calendar" element={<Calendar />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Overview />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-8 text-center">404 - Sahifa topilmadi</div>} />
    </Routes>
    </ToastProvider>
    
  );
}

export default App;