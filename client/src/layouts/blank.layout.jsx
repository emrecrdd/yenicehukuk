import { Outlet } from 'react-router-dom';

const BlankLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default BlankLayout;