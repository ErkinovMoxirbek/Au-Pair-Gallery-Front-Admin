import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  MessageCircle, 
  Calendar, 
  Settings,
  LogOut 
} from 'lucide-react';
import authService from '../../services/authService';
import { clearAuth } from '../../utils/tokenManager';

const navItems = [
  { to: '/dashboard/overview', icon: LayoutDashboard, label: 'Übersicht' },
  { to: '/dashboard/users', icon: Users, label: 'Benutzer' },
  { to: '/dashboard/families', icon: Home, label: 'Familien' },
  { to: '/dashboard/candidates', icon: Users, label: 'Kandidaten' },
  { to: '/dashboard/applications', icon: MessageCircle, label: 'Bewerbungen' },
  { to: '/dashboard/calendar', icon: Calendar, label: 'Kalender' },
  { to: '/dashboard/settings', icon: Settings, label: 'Einstellungen' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      navigate('/');
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-600">Au Pair Gallery</h2>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-3 text-red-600 hover:bg-red-50 transition-colors mt-8"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Abmelden
        </button>
      </nav>
    </div>
  );
}
