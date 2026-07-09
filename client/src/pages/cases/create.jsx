import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import caseApi from '../../features/cases/case.api.js';
import clientApi from '../../features/clients/client.api.js';
import userApi from '../../features/users/user.api.js';  // ← BUNU EKLE!
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const CaseCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    case_number: '',
    court_name: '',
    court_type: '',
    case_type: '',
    subject: '',
    description: '',
    status: 'preparation',
    client_id: '',
    assigned_to: '',  // ← BUNU EKLE!
    priority: 'normal',
    estimated_value: '',
  });
  const [errors, setErrors] = useState({});

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

  // ✅ Avukat listesini getir
  const { data: lawyersData } = useQuery({
    queryKey: ['users', { role: 'lawyer' }],
    queryFn: () => userApi.getAll({ role: 'lawyer' }),
  });

  const clients = clientsData?.data?.data || [];
  const lawyers = lawyersData?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => caseApi.create(data),
    onSuccess: (response) => {
      toast.success('Dava başarıyla oluşturuldu');
      navigate(`/cases/${response.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
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
    if (!formData.title) newErrors.title = 'Dava adı gereklidir';
    if (!formData.client_id) newErrors.client_id = 'Müvekkil seçilmelidir';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      ...formData,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
      assigned_to: formData.assigned_to || null,  // ← BURASI ÖNEMLİ!
    };
    mutation.mutate(submitData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/cases" className="text-blue-600 hover:underline">
            ← Davalar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Yeni Dava
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Input
            label="Dava Adı *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Esas Numarası"
              name="case_number"
              value={formData.case_number}
              onChange={handleChange}
            />
            <Input
              label="Mahkeme"
              name="court_name"
              value={formData.court_name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mahkeme Türü"
              name="court_type"
              value={formData.court_type}
              onChange={handleChange}
              placeholder="Örn: Asliye Hukuk, Sulh Hukuk, Ağır Ceza"
            />
            <Input
              label="Dava Türü"
              name="case_type"
              value={formData.case_type}
              onChange={handleChange}
              placeholder="Örn: İş Davası, Tazminat, Boşanma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Müvekkil *
            </label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.client_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Müvekkil seçin</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} {client.company_name ? `(${client.company_name})` : ''}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
            )}
          </div>

          {/* ✅ AVUKAT ATAMA DROPDOWN - EKLENDİ! */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Atanan Avukat
            </label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Avukat seçin</option>
              {lawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.first_name} {lawyer.last_name}
                </option>
              ))}
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
              <option value="preparation">Hazırlık</option>
              <option value="active">Devam Ediyor</option>
              <option value="hearing">Duruşmada</option>
              <option value="appeal">İstinaf</option>
              <option value="cassation">Temyiz</option>
              <option value="concluded">Sonuçlandı</option>
              <option value="archived">Arşivlendi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Öncelik
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Düşük</option>
              <option value="normal">Normal</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
          </div>

          <Input
            label="Tahmini Değer (TL)"
            name="estimated_value"
            type="number"
            value={formData.estimated_value}
            onChange={handleChange}
            placeholder="0.00"
          />

          <Input
            label="Konu"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={mutation.isPending}>
              Dava Oluştur
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/cases')}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CaseCreate;