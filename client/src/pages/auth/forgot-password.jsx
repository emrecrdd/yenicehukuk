import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
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
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bir hata oluştu.');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kontrol Et!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            E-postanızı kontrol edin ve linke tıklayarak şifrenizi sıfırlayın.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 text-blue-600 hover:underline"
          >
            ← Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔑 Şifre Sıfırlama
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            ← Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;