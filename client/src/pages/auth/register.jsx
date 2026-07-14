import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../features/auth/auth.hook.js';
import { Eye, EyeOff, Mail, Lock, User, Users } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'intern',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'Ad gereklidir';
    if (!formData.last_name) newErrors.last_name = 'Soyad gereklidir';
    if (!formData.email) newErrors.email = 'E-posta gereklidir';
    if (!formData.password) newErrors.password = 'Şifre gereklidir';
    if (formData.password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/login');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="w-full">
      {/* Başlık */}
      <div className="hidden lg:block mb-8">
        <h2 className="text-2xl font-bold text-white">Hesap Oluştur</h2>
        <p className="text-sm text-blue-300/50">Yeni hesap oluşturun</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ad Soyad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-200/80 mb-1.5">
              Ad *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" />
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ad"
                className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-blue-300/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            {errors.first_name && (
              <p className="mt-1.5 text-sm text-red-400">{errors.first_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200/80 mb-1.5">
              Soyad *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" />
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Soyad"
                className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-blue-300/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            {errors.last_name && (
              <p className="mt-1.5 text-sm text-red-400">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-blue-200/80 mb-1.5">
            E-posta *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@firma.com"
              className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-blue-300/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Şifre */}
        <div>
          <label className="block text-sm font-medium text-blue-200/80 mb-1.5">
            Şifre *
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-12 pl-11 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-blue-300/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/40 hover:text-blue-300/70 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Şifre Tekrar */}
        <div>
          <label className="block text-sm font-medium text-blue-200/80 mb-1.5">
            Şifre Tekrar *
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-12 pl-11 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-blue-300/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/40 hover:text-blue-300/70 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-blue-200/80 mb-1.5">
            Rol
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer"
            >
              <option value="admin" className="bg-[#0f2847]">Yönetici</option>
              <option value="lawyer" className="bg-[#0f2847]">Avukat</option>
              <option value="intern" className="bg-[#0f2847]">Stajyer</option>
              <option value="secretary" className="bg-[#0f2847]">Sekreter</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/40 pointer-events-none">
              ▼
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={register.isPending}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {register.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kayıt yapılıyor...
            </span>
          ) : (
            'Kayıt Ol'
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#0f2847] text-blue-300/30">veya</span>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-blue-300/50">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Giriş Yap
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;