import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, CreditCard, Building2, DoorOpen,
  ShieldCheck, Activity, FileText, AlertTriangle, User,
  LogOut, Menu, X, ChevronRight, Bell, Shield
} from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useI18n } from '../i18n/I18nProvider';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', roles: ['admin','student','teacher','security'] },
  { to: '/users', icon: Users, labelKey: 'nav.users', roles: ['admin'] },
  { to: '/badges', icon: CreditCard, labelKey: 'nav.badges', roles: ['admin'] },
  { to: '/buildings', icon: Building2, labelKey: 'nav.buildings', roles: ['admin'] },
  { to: '/doors', icon: DoorOpen, labelKey: 'nav.doors', roles: ['admin'] },
  { to: '/permissions', icon: ShieldCheck, labelKey: 'nav.permissions', roles: ['admin'] },
  { to: '/simulation', icon: Activity, labelKey: 'nav.simulation', roles: ['admin','security'] },
  { to: '/logs', icon: FileText, labelKey: 'nav.logs', roles: ['admin','security'] },
  { to: '/incidents', icon: AlertTriangle, labelKey: 'nav.incidents', roles: ['admin','security'] },
  { to: '/profile', icon: User, labelKey: 'nav.profile', roles: ['admin','student','teacher','security'] },
];

const ROLE_COLORS = {
  admin: 'badge-purple',
  security: 'badge-blue',
  teacher: 'badge-yellow',
  student: 'badge-green',
};

function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useI18n();

  const handleLogout = async () => {
    await logout();
    toast.success(t('nav.logout'));
    navigate('/login');
  };

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-100 text-sm">{t('common.appName')}</p>
            <p className="text-xs text-slate-500">{t('common.university')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNav.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={17} />
            <span className="flex-1">{t(labelKey)}</span>
            <ChevronRight size={13} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-slate-300">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName}</p>
            <span className={`${ROLE_COLORS[user?.role]} text-xs`}>{t(`roles.${user?.role}`)}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={15} />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900/80 border-r border-slate-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-slate-900 border-r border-slate-800 z-50">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 btn-ghost p-1">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-1.5">
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <LanguageSelector />
          <button className="btn-ghost p-1.5 relative">
            <Bell size={17} />
          </button>
          <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-400">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
