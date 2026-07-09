import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">⚖️</div>
            <h1 className="text-4xl font-bold mb-4">LegalSystem</h1>
            <p className="text-xl text-blue-100 mb-8">
              Hukuk Büro Yönetim Sistemi
            </p>
            <div className="space-y-4 text-blue-100/80">
              <p>📋 Müvekkil ve Dava Yönetimi</p>
              <p>📄 Akıllı Belge Yönetimi</p>
              <p>🤖 Yapay Zeka Destekli Asistan</p>
              <p>💰 Finans ve Tahsilat Takibi</p>
            </div>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm">
                "Hukuk büronuzu tek platformda yönetin"
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <div className="text-4xl mb-2">⚖️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                LegalSystem
              </h2>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;