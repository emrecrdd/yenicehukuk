import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Arka Plan Desenleri */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] bg-repeat"></div>
      </div>
      
      {/* Sağ Üst Köşe Işık */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      {/* Sol Alt Köşe Işık */}
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        
        {/* SOL - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#0d2240] to-[#061942] relative overflow-hidden">
          
          {/* Terazi Filigranı */}
          <div className="absolute -bottom-20 -right-20 text-9xl text-white/5">⚖️</div>
          
          {/* Nokta Deseni */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-32 left-32 w-2 h-2 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-4 h-4 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/20 rounded-full"></div>
          </div>

          {/* Logo ve Başlık */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 flex items-center justify-center border border-yellow-400/20 shadow-lg shadow-yellow-500/10">
                <span className="text-3xl">⚖️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Derkenar</h1>
                <p className="text-sm text-blue-300/60 font-medium tracking-wider">Hukuk Büro Yönetim Sistemi</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Hukuk büronuzu<br />
              <span className="text-blue-400">tek platformda yönetin</span>
            </h2>
            <p className="text-blue-300/60 text-lg">
              Müvekkil, dava, belge ve finans yönetimini bir araya getiren akıllı sistem.
            </p>
          </div>

          {/* Özellikler */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-blue-200/80">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">👥</span>
              </div>
              <div>
                <p className="font-semibold text-white">Müvekkil Yönetimi</p>
                <p className="text-sm text-blue-300/50">Tüm müvekkillerinizi tek yerden takip edin</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-blue-200/80">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📄</span>
              </div>
              <div>
                <p className="font-semibold text-white">Akıllı Belge Yönetimi</p>
                <p className="text-sm text-blue-300/50">Belgelerinizi organize edin, anında erişin</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-blue-200/80">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <p className="font-semibold text-white">Yapay Zeka Destekli Asistan</p>
                <p className="text-sm text-blue-300/50">Akıllı öneriler ve otomatik analiz</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-blue-200/80">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <p className="font-semibold text-white">Finans ve Tahsilat Takibi</p>
                <p className="text-sm text-blue-300/50">Ödemeleri ve giderleri kolayca yönetin</p>
              </div>
            </div>
          </div>

          {/* Alt Kısım */}
          <div className="pt-8 border-t border-white/5">
            <p className="text-sm text-blue-300/40 italic">
              "Hukuk bir sanattır, biz yazılımla güçlendiririz."
            </p>
          </div>
        </div>

        {/* SAĞ - Login Formu */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 flex items-center justify-center border border-yellow-400/20">
                  <span className="text-2xl">⚖️</span>
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white">Derkenar</h2>
                  <p className="text-xs text-blue-300/50 font-medium">Hukuk Büro Yönetim Sistemi</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white">Hoş Geldiniz</h3>
              <p className="text-sm text-blue-300/50">Hesabınıza giriş yapın</p>
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;