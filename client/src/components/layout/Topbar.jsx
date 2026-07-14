import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import { useTheme } from '../../app/providers/theme.provider.jsx';
import { Link, useLocation } from 'react-router-dom';
import {
  useUnreadCount,
  useNotifications,
  useMarkAllAsRead,
} from '../../features/notification/notification.hook.js';
import { useSocket } from '../../hooks/useSocket.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import toast from 'react-hot-toast';
import { Bell, Moon, Sun, Search, User, LogOut, Menu, ChevronDown } from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('tr');

// ======================================================
// SAYFA BAŞLIKLARI
// ======================================================

const PAGE_TITLES = {
  '/dashboard': 'Genel Bakış',
  '/clients': 'Müvekkiller',
  '/cases': 'Davalar',
  '/documents': 'Belgeler',
  '/templates': 'Şablonlar',
  '/meetings': 'Toplantılar',
  '/tasks': 'Görevler',
  '/calendar': 'Takvim',
  '/finance': 'Finans',
  '/ai': 'AI Asistan',
  '/search': 'Arama',
  '/settings': 'Ayarlar',
  '/users': 'Kullanıcılar',
  '/audit-logs': 'Denetim Logları',
  '/notifications': 'Bildirimler',
  '/profile': 'Profil',
};

// ======================================================
// BREADCRUMB
// ======================================================

const BREADCRUMBS = {
  '/dashboard': 'Ana Sayfa',
  '/clients': 'Müvekkiller / Listeleme',
  '/clients/create': 'Müvekkiller / Yeni Müvekkil',
  '/cases': 'Davalar / Listeleme',
  '/cases/create': 'Davalar / Yeni Dava',
  '/documents': 'Belgeler / Listeleme',
  '/documents/create': 'Belgeler / Yeni Belge',
  '/templates': 'Şablonlar / Listeleme',
  '/templates/create': 'Şablonlar / Yeni Şablon',
  '/meetings': 'Toplantılar / Listeleme',
  '/meetings/create': 'Toplantılar / Yeni Toplantı',
  '/tasks': 'Görevler / Listeleme',
  '/tasks/create': 'Görevler / Yeni Görev',
  '/calendar': 'Takvim / Genel',
  '/finance': 'Finans / Özet',
  '/ai': 'AI Asistan / Sohbet',
  '/search': 'Arama / Sonuçlar',
  '/settings': 'Ayarlar / Genel',
  '/users': 'Yönetim / Kullanıcılar',
  '/audit-logs': 'Yönetim / Denetim Logları',
  '/notifications': 'Bildirimler / Tümü',
  '/profile': 'Profil / Bilgilerim',
};

// ======================================================
// PATH EŞLEŞTİRME
// ======================================================

const getPageInfo = (path) => {
  if (PAGE_TITLES[path]) {
    return {
      title: PAGE_TITLES[path],
      breadcrumb: BREADCRUMBS[path] || `${PAGE_TITLES[path]} / Ana Sayfa`,
    };
  }

  const basePath = '/' + path.split('/')[1];
  if (PAGE_TITLES[basePath]) {
    return {
      title: PAGE_TITLES[basePath],
      breadcrumb: BREADCRUMBS[basePath] || `${PAGE_TITLES[basePath]} / Detay`,
    };
  }

  return {
    title: 'Sayfa',
    breadcrumb: 'Sayfa / Görüntüleniyor',
  };
};

// ======================================================
// COMPONENT
// ======================================================

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const { on, off, isConnected } = useSocket();

  const { data: unreadCount, refetch: refetchUnread } = useUnreadCount();
  const { data: notificationsData, refetch: refetchNotifications } = useNotifications({ limit: 5 });
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notificationsData?.data?.data || [];

  const currentPath = location.pathname;
  const { title: pageTitle, breadcrumb } = getPageInfo(currentPath);

  useEffect(() => {
    const handleNotification = (data) => {
      refetchUnread();
      refetchNotifications();
      toast.success(data.title || 'Yeni bildirim');
    };

    on('notification', handleNotification);

    return () => {
      off('notification', handleNotification);
    };
  }, [on, off, refetchUnread, refetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/70 dark:bg-[#071b36]/70 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between px-4 md:px-8 h-20">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-xs text-gray-400 dark:text-blue-300/40 font-medium">
              {breadcrumb}
            </p>
          </div>

          <div className="lg:hidden">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search */}
          <div
            className={`hidden md:flex items-center gap-2 px-4 lg:w-80 xl:w-96 h-11 bg-gray-100 dark:bg-[#10294b] rounded-xl border transition-all duration-200 ${
              searchFocused
                ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'border-transparent'
            }`}
          >
            <Search size={18} className="text-gray-400 dark:text-blue-300/40" />
            <input
              type="text"
              placeholder="Hızlı ara..."
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-blue-300/30 focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <span className="text-xs text-gray-400 dark:text-blue-300/30 font-mono">⌘K</span>
          </div>

          {/* Socket Status */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            {isConnected ? 'Sistem Aktif' : 'Bağlantı yok'}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-12 h-7 rounded-full bg-gray-200 dark:bg-[#10294b] transition-colors duration-300 flex items-center px-1 flex-shrink-0"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white dark:bg-yellow-400 shadow-md transform transition-all duration-300 flex items-center justify-center ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
              }`}
            >
              {theme === 'dark' ? (
                <Moon size={12} className="text-gray-800" />
              ) : (
                <Sun size={12} className="text-yellow-500" />
              )}
            </div>
          </button>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                refetchUnread();
              }}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-1rem)] sm:max-w-[360px] bg-white dark:bg-[#0a1628] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead.mutate()}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      disabled={markAllAsRead.isPending}
                    >
                      Tümünü okundu
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <span className="text-3xl block mb-2">📭</span>
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
                        className={`block px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 ${
                          !notification.read ? 'bg-blue-500/5' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-blue-300/30 mt-1">
                          {dayjs(notification.created_at).fromNow()}
                        </p>
                      </Link>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-white/5">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Tümünü gör
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-blue-500/25">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-blue-300/40">
                  {user?.role === 'admin' ? 'Yönetici' : user?.role === 'lawyer' ? 'Avukat' : 'Kullanıcı'}
                </p>
              </div>
              <ChevronDown size={16} className="text-gray-400 dark:text-blue-300/40 hidden lg:block" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0a1628] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl py-1 z-50">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <User size={16} />
                  Profil
                </Link>
                <hr className="my-1 border-white/5" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  Çıkış Yap
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