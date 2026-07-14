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
  Gavel,
  Shield,
  ClipboardList,
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
  const userInitials = user?.first_name?.[0] || '' + user?.last_name?.[0] || '';

  const renderNavLink = (item, onClick) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center gap-3 mx-3 my-1 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-[#0d3f9f] text-white shadow-lg'
              : 'text-blue-100 hover:bg-[#123b88]'
          }`
        }
      >
        <Icon
          size={20}
          strokeWidth={2}
          className={({ isActive }) =>
            isActive ? 'text-white' : 'text-blue-200'
          }
        />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-[#061942] via-[#08265f] to-[#061942] text-white border-r border-[#1f3c7a] overflow-y-auto relative z-30">
        {/* Logo */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/15 flex items-center justify-center">
              <Gavel className="text-yellow-400" size={28} />
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-wide">
                Derkenar
              </h2>
              <p className="text-xs text-blue-200">
                Hukuk Büro Yönetim Sistemi
              </p>
            </div>
          </div>
        </div>

        {/* Kullanıcı Kartı */}
        <div className="mt-6 flex items-center gap-3 px-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white text-lg">
            {userInitials || 'U'}
          </div>
          <div>
            <p className="font-medium text-white">
              {user?.first_name} {user?.last_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="text-xs text-blue-200">Online</span>
            </div>
          </div>
        </div>

        <hr className="border-blue-900 my-6 mx-4" />

        {/* Menü */}
        <nav className="pb-8">
          {menuItems.map((item) => renderNavLink(item))}

          {isAdmin && (
            <>
              <p className="px-6 mt-8 mb-2 text-[11px] uppercase tracking-[2px] text-blue-300 font-semibold">
                Yönetim
              </p>
              {adminMenuItems.map((item) => renderNavLink(item))}
            </>
          )}
        </nav>

        {/* Desen */}
        <div className="sidebar-pattern" />
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#061942] via-[#08265f] to-[#061942] text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/15 flex items-center justify-center">
              <Gavel className="text-yellow-400" size={28} />
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-wide">
                Derkenar
              </h2>
              <p className="text-xs text-blue-200">
                Hukuk Büro Yönetim Sistemi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <hr className="border-blue-900 my-6 mx-4" />

        <nav className="pb-8">
          {menuItems.map((item) => renderNavLink(item, onClose))}

          {isAdmin && (
            <>
              <p className="px-6 mt-8 mb-2 text-[11px] uppercase tracking-[2px] text-blue-300 font-semibold">
                Yönetim
              </p>
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