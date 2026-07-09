import { NavLink } from 'react-router-dom';

const MobileNav = () => {
  const items = [
    { path: '/dashboard', icon: '📊', label: 'Ana' },
    { path: '/clients', icon: '👤', label: 'Müvekkil' },
    { path: '/cases', icon: '📁', label: 'Davalar' },
    { path: '/documents', icon: '📄', label: 'Belgeler' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
      <div className="flex justify-around py-2">
        {items.map((item) => (
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
  );
};

export default MobileNav;