import { NavLink } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import { ROLES } from '../../constants/roles.js';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/clients', label: 'Müvekkiller', icon: '👤' },
    { path: '/cases', label: 'Davalar', icon: '📁' },
    { path: '/documents', label: 'Belgeler', icon: '📄' },
    { path: '/templates', label: 'Şablonlar', icon: '📋' },  // ✅ EKLENDI
    { path: '/meetings', label: 'Toplantılar', icon: '🤝' },
    { path: '/tasks', label: 'Görevler', icon: '✅' },
    { path: '/calendar', label: 'Takvim', icon: '📅' },
    { path: '/finance', label: 'Finans', icon: '💰' },
    { path: '/ai', label: 'AI Asistan', icon: '🤖' },
    { path: '/search', label: 'Arama', icon: '🔍' },
    { path: '/settings', label: 'Ayarlar', icon: '⚙️' },
  ];

  const adminMenuItems = [
    { path: '/users', label: 'Kullanıcılar', icon: '👥' },
    { path: '/audit-logs', label: 'Denetim Logları', icon: '📋' },
  ];

  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-gray-800 dark:bg-gray-900 text-white overflow-y-auto">
        <div className="p-4">
          <h1 className="text-xl font-bold">⚖️ LegalSystem</h1>
          <p className="text-sm text-gray-400">{user?.first_name} {user?.last_name}</p>
        </div>
        <nav className="mt-8 pb-8">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="px-4 py-1 text-xs text-gray-500 uppercase">Yönetim</p>
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 dark:bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <h1 className="text-xl font-bold">⚖️ LegalSystem</h1>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <nav className="mt-8 pb-8">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="px-4 py-1 text-xs text-gray-500 uppercase">Yönetim</p>
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;