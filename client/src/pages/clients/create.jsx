import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import clientApi from '../../features/clients/client.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const ClientCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    identification_number: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    notes: '',
    client_type: 'individual',
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => clientApi.create(data),
    onSuccess: () => {
      toast.success('Müvekkil başarıyla oluşturuldu');
      navigate('/clients');
    },
    onError: (error) => {
      const message = error.response?.data?.message || '';
      const newErrors = {};
      
      // ✅ Backend'den gelen hatayı parse et ve input'un altında göster
      if (message.includes('email') || message.includes('Email')) {
        newErrors.email = 'Bu email adresi zaten kullanılıyor. Lütfen farklı bir email girin.';
      } else if (message.includes('phone') || message.includes('Telefon')) {
        newErrors.phone = 'Bu telefon numarası zaten kullanılıyor. Lütfen farklı bir telefon girin.';
      } else if (message.includes('identification_number') || message.includes('TCKNO') || message.includes('VKN')) {
        newErrors.identification_number = 'Bu TCKNO / VKN zaten kullanılıyor. Lütfen kontrol edip tekrar deneyin.';
      } else {
        toast.error(message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }
      
      setErrors(newErrors);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Ad Soyad / Unvan gereklidir';
    
    if (formData.identification_number && !/^[0-9]{10,11}$/.test(formData.identification_number)) {
      newErrors.identification_number = 'TCKNO 11 haneli, VKN 10 haneli olmalıdır';
    }
    
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Telefon numarası 10-11 haneli olmalıdır';
    }
    
    if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/clients" className="text-blue-600 hover:underline">
            ← Müvekkiller
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Yeni Müvekkil
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Input
            label="Ad Soyad / Unvan *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Örn: Ahmet Yılmaz veya ABC Şirketi"
          />

          <Input
            label="TCKNO / VKN"
            name="identification_number"
            value={formData.identification_number}
            onChange={handleChange}
            error={errors.identification_number}
            placeholder="12345678901 veya 1234567890"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />
            <Input
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>

          <Input
            label="Adres"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Şehir"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label="İlçe"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Müvekkil Türü
            </label>
            <select
              name="client_type"
              value={formData.client_type}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="individual">Bireysel</option>
              <option value="corporate">Kurumsal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durum
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
              <option value="archived">Arşiv</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={mutation.isPending}>
              Müvekkil Oluştur
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClientCreate;