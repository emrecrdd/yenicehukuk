import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-64';
  const marginLeft = isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar - Collapsible */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Ana İçerik */}
      <div className={`flex-1 flex flex-col min-w-0 ${marginLeft}`}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <div className="lg:hidden flex-shrink-0">
          <MobileNav />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;