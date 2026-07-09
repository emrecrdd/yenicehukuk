import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import clientApi from '../../features/clients/client.api.js';
import userApi from '../../features/users/user.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const ClientEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: clientData, isLoading: clientLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientApi.getOne(id),
    enabled: !!id,
  });

  const [formData, setFormData] = useState({
    name: '',                      // ✅ Ad Soyad / Unvan
    identification_number: '',     // ✅ TCKNO / VKN
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    notes: '',
    client_type: 'individual',     // ✅ Müvekkil Türü
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clientData?.data?.data) {
      const client = clientData.data.data;
      setFormData({
        name: client.name || '',
        identification_number: client.identification_number || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        district: client.district || '',
        notes: client.notes || '',
        client_type: client.client_type || 'individual',
        status: client.status || 'active',
      });
    }
  }, [clientData]);

  const mutation = useMutation({
    mutationFn: (data) => clientApi.update(id, data),
    onSuccess: () => {
      toast.success('Müvekkil başarıyla güncellendi');
      navigate(`/clients/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Müvekkil güncellenemedi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientApi.delete(id),
    onSuccess: () => {
      toast.success('Müvekkil başarıyla silindi');
      navigate('/clients');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Müvekkil silinemedi');
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
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Bu müvekkili silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      deleteMutation.mutate();
    }
  };

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/clients/${id}`} className="text-blue-600 hover:underline">
            ← Müvekkile Dön
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Müvekkil Düzenle
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* ✅ Ad Soyad / Unvan */}
          <Input
            label="Ad Soyad / Unvan *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Örn: Ahmet Yılmaz veya ABC Şirketi"
          />

          {/* ✅ TCKNO / VKN */}
          <Input
            label="TCKNO / VKN"
            name="identification_number"
            value={formData.identification_number}
            onChange={handleChange}
            placeholder="12345678901 veya 1234567890"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              Güncelle
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`/clients/${id}`)}>
              İptal
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
              Sil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClientEdit;