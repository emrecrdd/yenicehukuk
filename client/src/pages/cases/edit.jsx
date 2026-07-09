import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import caseApi from '../../features/cases/case.api.js';
import clientApi from '../../features/clients/client.api.js';
import userApi from '../../features/users/user.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const CaseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => caseApi.getOne(id),
    enabled: !!id,
  });

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
    assigned_to: '',
    priority: 'normal',
    estimated_value: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (caseData?.data?.data) {
      const caseItem = caseData.data.data;
      setFormData({
        title: caseItem.title || '',
        case_number: caseItem.case_number || '',
        court_name: caseItem.court_name || '',
        court_type: caseItem.court_type || '',
        case_type: caseItem.case_type || '',
        subject: caseItem.subject || '',
        description: caseItem.description || '',
        status: caseItem.status || 'preparation',
        client_id: caseItem.client_id || '',
        assigned_to: caseItem.assigned_to || '',
        priority: caseItem.priority || 'normal',
        estimated_value: caseItem.estimated_value || '',
      });
    }
  }, [caseData]);

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

  // Fetch lawyers for dropdown
  const { data: lawyersData } = useQuery({
    queryKey: ['users', { role: 'lawyer' }],
    queryFn: () => userApi.getAll({ role: 'lawyer' }),
  });

  const clients = clientsData?.data?.data || [];
  const lawyers = lawyersData?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => caseApi.update(id, data),
    onSuccess: (response) => {
      toast.success('Dava başarıyla güncellendi');
      navigate(`/cases/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Dava güncellenemedi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => caseApi.delete(id),
    onSuccess: () => {
      toast.success('Dava başarıyla silindi');
      navigate('/cases');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Dava silinemedi');
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
      assigned_to: formData.assigned_to || null,
    };
    mutation.mutate(submitData);
  };

  const handleDelete = () => {
    if (window.confirm('Bu davayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      deleteMutation.mutate();
    }
  };

  if (caseLoading) {
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
          <Link to={`/cases/${id}`} className="text-blue-600 hover:underline">
            ← Davaya Dön
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Davayı Düzenle
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
            step="0.01"
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

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={mutation.isPending}>
              Güncelle
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`/cases/${id}`)}>
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

export default CaseEdit;