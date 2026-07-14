import { NavLink } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import { ROLES } from '../../constants/roles.js';
import {
  LayoutDashboard,
  Users,
  Folder,
  FileText,
  Files,
  Calendar,
  CheckSquare,
  Search,
  Settings,
  Sparkles,
  Wallet,
  Shield,
  ClipboardList,
  Gavel,
} from 'lucide-react';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Anasayfa', icon: LayoutDashboard },
    { path: '/clients', label: 'Müvekkiller', icon: Users },
    { path: '/cases', label: 'Davalar', icon: Folder },
    { path: '/documents', label: 'Belgeler', icon: FileText },
    { path: '/templates', label: 'Şablonlar', icon: Files },
    { path: '/meetings', label: 'Toplantılar', icon: Calendar },
    { path: '/tasks', label: 'Görevler', icon: CheckSquare },
    { path: '/calendar', label: 'Takvim', icon: Calendar },
    { path: '/finance', label: 'Finans', icon: Wallet },
    { path: '/ai', label: 'AI Asistan', icon: Sparkles },
    { path: '/search', label: 'Arama', icon: Search },
    { path: '/settings', label: 'Ayarlar', icon: Settings },
  ];

  const adminMenuItems = [
    { path: '/users', label: 'Kullanıcılar', icon: Shield },
    { path: '/audit-logs', label: 'Denetim Logları', icon: ClipboardList },
  ];

  const isAdmin = user?.role === ROLES.ADMIN;
  const userInitials = (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '');

  const renderNavLink = (item, onClick) => {
    const Icon = item.icon;

    return (
      <NavLink key={item.path} to={item.path} onClick={onClick}>
        {({ isActive }) => (
          <div
            className={`flex items-center gap-3 mx-3 my-1 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-gradient-to-b from-[#061942] via-[#08265f] to-[#061942] border-r border-[#1f3c7a] overflow-hidden z-30">
        {/* Kullanıcı */}
        <div className="flex-shrink-0 px-4 pt-5 pb-3">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center font-semibold text-white text-sm border border-white/10">
                {userInitials || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] text-blue-300/50">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-white/5 mx-5" />

        {/* Menü */}
        <nav className="flex-1 overflow-hidden px-2 py-3">
          {menuItems.map((item) => renderNavLink(item))}

          {isAdmin && (
            <>
              <div className="px-4 mt-4 mb-2">
                <p className="text-[9px] uppercase tracking-[2px] text-blue-300/30 font-semibold">
                  Yönetim
                </p>
              </div>
              {adminMenuItems.map((item) => renderNavLink(item))}
            </>
          )}
        </nav>

        {/* Desen */}
        <div className="sidebar-pattern" />
      </aside>

      {/* Mobile Sidebar */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#061942] via-[#08265f] to-[#061942] text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto shadow-2xl ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Logo */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Gavel className="text-yellow-400" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg tracking-tight text-white">Derkenar</h2>
                <p className="text-[9px] uppercase tracking-wider text-blue-300/50">
                  Hukuk Büro Yönetim Sistemi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center font-semibold text-white text-sm border border-white/10">
                {userInitials || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] text-blue-300/50">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-white/5 mx-5" />

        <nav className="px-2 py-3 pb-6">
          {menuItems.map((item) => renderNavLink(item, onClose))}

          {isAdmin && (
            <>
              <div className="px-4 mt-4 mb-2">
                <p className="text-[9px] uppercase tracking-[2px] text-blue-300/30 font-semibold">
                  Yönetim
                </p>
              </div>
              {adminMenuItems.map((item) => renderNavLink(item, onClose))}
            </>
          )}
        </nav>

        <div className="sidebar-pattern" />
      </div>
    </>
  );
};

export default Sidebar;