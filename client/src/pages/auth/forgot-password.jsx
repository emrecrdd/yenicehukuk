import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, ArrowLeft, CheckCircle, Gavel } from 'lucide-react';
import authApi from '../../features/auth/auth.api.js';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (email) => authApi.forgotPassword(email),

    onSuccess: () => {
      setSubmitted(true);
      toast.success('Şifre sıfırlama bağlantısı gönderildi.');
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Bir hata oluştu.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Lütfen e-posta adresinizi girin.');
      return;
    }

    mutation.mutate(email);
  };

  if (submitted) {
    return (
      <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-10">

        <div className="text-center">

          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle size={54} className="text-green-600" />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Mail Gönderildi
          </h2>

          <p className="mt-4 text-gray-500">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Gelen kutunuzu ve spam klasörünüzü kontrol etmeyi unutmayın.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="mt-8 w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition"
          >
            Giriş Sayfasına Dön
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-10">

      <div className="text-center mb-8">

        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0B2F75] to-[#1547B8] flex items-center justify-center mx-auto shadow-lg">
          <Gavel size={40} className="text-yellow-400" />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Şifre Sıfırlama
        </h1>

        <p className="mt-3 text-gray-500">
          E-posta adresinizi girin.
          Size güvenli bir şifre sıfırlama bağlantısı göndereceğiz.
        </p>

      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>

          <label className="block mb-2 text-sm font-semibold text-gray-700">
            E-posta Adresi
          </label>

          <div className="relative">

            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full h-14 rounded-xl border border-gray-300 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-600"
              required
            />

          </div>

        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {mutation.isPending
            ? 'Gönderiliyor...'
            : 'Şifre Sıfırlama Bağlantısı Gönder'}
        </button>

      </form>

      <div className="mt-8 text-center">

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft size={18} />
          Giriş Sayfasına Dön
        </Link>

      </div>

    </div>
  );
};

export default ForgotPassword;