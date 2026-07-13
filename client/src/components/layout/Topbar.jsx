import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import { useTheme } from '../../app/providers/theme.provider.jsx';
import { Link } from 'react-router-dom';
import { useUnreadCount, useNotifications, useMarkAllAsRead } from '../../features/notification/notification.hook.js';
import { useSocket } from '../../hooks/useSocket.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import toast from 'react-hot-toast';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const { on, off, isConnected } = useSocket();

  // ✅ Unread count
  const { data: unreadData, refetch: refetchUnread } = useUnreadCount();
  const unreadCount = unreadData?.data?.data?.count || 0;

  // ✅ Notifications list
  const { data: notificationsData, refetch: refetchNotifications } = useNotifications({ limit: 5 });
  const notifications = notificationsData?.data?.data || [];

  // ✅ Mark all as read
  const markAllAsRead = useMarkAllAsRead();

  // ✅ Socket ile bildirim dinle
  useEffect(() => {
    const handleNotification = (data) => {
      console.log('🔔 Yeni bildirim geldi:', data);
      
      // ✅ Bildirim sayısını hemen güncelle
      refetchUnread();
      refetchNotifications();
      
      // ✅ Toast göster
      toast.success(data.title || 'Yeni bildirim');
    };

    on('notification', handleNotification);

    return () => {
      off('notification', handleNotification);
    };
  }, [on, off, refetchUnread, refetchNotifications]);

  // ✅ Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Her 5 saniyede bir sayıyı yenile (daha sık)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchUnread();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchUnread]);

  // ✅ Sayfa görünür olduğunda yenile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchUnread();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchUnread]);

  console.log('📊 Unread count:', unreadCount);
  console.log('📊 Unread data:', unreadData);
  console.log('🔌 Socket connected:', isConnected);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ☰
          </button>
          <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white lg:hidden">
            LegalSystem
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <Link
            to="/search"
            className="hidden md:flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            🔍 Ara...
          </Link>

          {/* Socket Status */}
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Bağlı' : 'Bağlantı yok'} />

          {/* Theme Toggle */}
          <button
            onClick={() => {
              console.log('🔘 Tema butonuna tıklandı!');
              toggleTheme();
            }}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* BİLDİRİMLER */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                refetchUnread();
              }}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markAllAsRead.mutate();
                      }}
                      className="text-xs text-blue-600 hover:underline"
                      disabled={markAllAsRead.isPending}
                    >
                      Tümünü okundu işaretle
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl block mb-2">📭</span>
                      Bildirim yok
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        to={notification.link || '#'}
                        onClick={() => {
                          setShowNotifications(false);
                          refetchUnread();
                        }}
                        className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {dayjs(notification.created_at).fromNow()}
                        </p>
                      </Link>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-sm text-blue-600 hover:underline"
                  >
                    Tüm bildirimleri gör
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
              <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
                {user?.first_name} {user?.last_name}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  👤 Profil
                </Link>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  🚪 Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;