import { useState } from 'react';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import { useTheme } from '../../app/providers/theme.provider.jsx';
import { useMutation } from '@tanstack/react-query';
import authApi from '../../features/auth/auth.api.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    title: user?.title || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const updateProfile = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Profil güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Güncelleme başarısız');
    },
  });

  const changePassword = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Şifre değiştirildi');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Şifre değiştirilemedi');
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Mevcut şifre gereklidir';
    }
    if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Yeni şifre en az 6 karakter olmalıdır';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const tabs = [
    { id: 'profile', label: '👤 Profil' },
    { id: 'security', label: '🔒 Güvenlik' },
    { id: 'preferences', label: '⚙️ Tercihler' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        ⚙️ Ayarlar
      </h1>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              👤 Profil Bilgileri
            </h2>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ad"
                  name="first_name"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                />
                <Input
                  label="Soyad"
                  name="last_name"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                />
              </div>

              <Input
                label="Telefon"
                name="phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />

              <Input
                label="Ünvan"
                name="title"
                value={profileForm.title}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                placeholder="Örn: Avukat, Stajyer Avukat"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Biyografi
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows="4"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kendiniz hakkında..."
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Email: {user?.email}
                </p>
                <Button type="submit" loading={updateProfile.isPending}>
                  Profili Güncelle
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              🔒 Şifre Değiştir
            </h2>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Mevcut Şifre"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                error={errors.currentPassword}
              />

              <Input
                label="Yeni Şifre"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                error={errors.newPassword}
              />

              <Input
                label="Yeni Şifre (Tekrar)"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
              />

              <Button type="submit" loading={changePassword.isPending}>
                Şifreyi Değiştir
              </Button>
            </form>
          </Card.Body>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              ⚙️ Tercihler
            </h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Tema</p>
                <p className="text-sm text-gray-500">
                  {theme === 'dark' ? 'Koyu tema' : 'Açık tema'} kullanılıyor
                </p>
              </div>
              <Button onClick={toggleTheme}>
                {theme === 'dark' ? '☀️ Açık Mod' : '🌙 Koyu Mod'}
              </Button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Hesap</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rol: {user?.role}</p>
                  <p className="text-sm text-gray-500">Hesap durumu: {user?.is_active ? 'Aktif' : 'Pasif'}</p>
                </div>
                <Button variant="danger" onClick={logout}>
                  🚪 Çıkış Yap
                </Button>
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="font-medium text-red-600 dark:text-red-400">⚠️ Tehlikeli Bölge</p>
              <p className="text-sm text-red-500 dark:text-red-300 mt-1">
                Hesabınızı silmek tüm verilerinizi kalıcı olarak yok eder.
              </p>
              <Button variant="danger" className="mt-2">
                Hesabı Sil
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Settings;