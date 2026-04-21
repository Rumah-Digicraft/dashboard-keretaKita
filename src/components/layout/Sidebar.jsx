import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Calendar, MapPin, Tag, LogOut, TrainFront, Ticket, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Logout Gagal',
        text: 'Terjadi kesalahan saat mencoba logout.',
      });
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Jadwal KA', path: '/schedules', icon: Calendar },
    { name: 'Stasiun', path: '/stations', icon: MapPin },
    { name: 'Tarif Khusus', path: '/special-fares', icon: Tag },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700">
        <TrainFront className="w-8 h-8 text-kai-orange" />
        <div>
          <h1 className="font-bold text-lg leading-tight">Kereta Kita</h1>
          <p className="text-xs text-slate-400">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-kai-blue text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}

        <div className="pt-4 pb-2 px-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KAI Commuter</p>
        </div>
        
        <Link
          to="/commuter-maps"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/commuter-maps')
              ? 'bg-kai-blue text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Peta Rute Commuter</span>
        </Link>

        <Link
          to="/commuter-fares"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/commuter-fares')
              ? 'bg-kai-blue text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span className="font-medium">Tarif Perjalanan</span>
        </Link>

        <Link
          to="/commuter-schedules"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/commuter-schedules')
              ? 'bg-kai-blue text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="font-medium">Jadwal Commuter</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
