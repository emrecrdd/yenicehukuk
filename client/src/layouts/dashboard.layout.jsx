import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* ✅ İçerik kayar, alt boşluk bırakır */}
        <main className="flex-1 p-4 md:p-6 pb-32 lg:pb-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* ✅ MobileNav her zaman en altta */}
        <div className="lg:hidden flex-shrink-0">
          <MobileNav />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;