import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../app/providers/auth.provider.jsx';

const MobileLayout = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/clients', label: 'Müvekkiller', icon: '👤' },
    { path: '/cases', label: 'Davalar', icon: '📁' },
    { path: '/documents', label: 'Belgeler', icon: '📄' },
    { path: '/tasks', label: 'Görevler', icon: '✅' },
    { path: '/calendar', label: 'Takvim', icon: '📅' },
    { path: '/finance', label: 'Finans', icon: '💰' },
    { path: '/ai', label: 'AI Asistan', icon: '🤖' },
    { path: '/search', label: 'Arama', icon: '🔍' },
    { path: '/settings', label: 'Ayarlar', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ☰
            </button>
            <h1 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
              ⚖️ LegalSystem
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  ⚖️ LegalSystem
                </h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                🚪 Çıkış Yap
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="p-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
        <div className="flex justify-around py-2">
          {[
            { path: '/dashboard', icon: '📊', label: 'Ana' },
            { path: '/clients', icon: '👤', label: 'Müvekkil' },
            { path: '/cases', icon: '📁', label: 'Davalar' },
            { path: '/documents', icon: '📄', label: 'Belgeler' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-1 text-xs ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;