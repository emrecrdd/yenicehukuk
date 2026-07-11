import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import caseApi from '../../features/cases/case.api.js';
import clientApi from '../../features/clients/client.api.js';
import userApi from '../../features/users/user.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const CaseCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    judiciary_type: '',
    judiciary_unit: '',
    court_name: '',
    case_number: '',
    court_type: '',
    client_ids: [],
    assigned_to: '',
    status: 'preparation',
    priority: 'normal',
    subject: '',
    description: '',
    opening_date: '',
  });
  const [errors, setErrors] = useState({});

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

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

  const handleClientChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData((prev) => ({ ...prev, client_ids: selectedOptions }));
    if (errors.client_ids) {
      setErrors((prev) => ({ ...prev, client_ids: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.judiciary_type) newErrors.judiciary_type = 'Yargı türü gereklidir';
    if (!formData.judiciary_unit) newErrors.judiciary_unit = 'Yargı birimi gereklidir';
    if (!formData.client_ids || formData.client_ids.length === 0) {
      newErrors.client_ids = 'En az bir müvekkil seçilmelidir';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      ...formData,
      assigned_to: formData.assigned_to || null,
      opening_date: formData.opening_date || null,
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
          {/* YARGI TÜRÜ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Yargı Türü *
            </label>
            <input
              type="text"
              name="judiciary_type"
              value={formData.judiciary_type}
              onChange={handleChange}
              placeholder="Örn: Hukuk, Ceza, İdare, CBS, Arabuluculuk"
              className={`w-full rounded-md border ${
                errors.judiciary_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.judiciary_type && (
              <p className="mt-1 text-sm text-red-600">{errors.judiciary_type}</p>
            )}
          </div>

          {/* YARGI BİRİMİ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Yargı Birimi *
            </label>
            <input
              type="text"
              name="judiciary_unit"
              value={formData.judiciary_unit}
              onChange={handleChange}
              placeholder="Örn: Sulh Hukuk, Asliye Hukuk, Aile Mahkemesi"
              className={`w-full rounded-md border ${
                errors.judiciary_unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.judiciary_unit && (
              <p className="mt-1 text-sm text-red-600">{errors.judiciary_unit}</p>
            )}
          </div>

          {/* DAVA AÇILIŞ TARİHİ */}
          <Input
            label="Dava Açılış Tarihi"
            name="opening_date"
            type="date"
            value={formData.opening_date}
            onChange={handleChange}
          />

          {/* MAHKEME */}
          <Input
            label="Mahkeme"
            name="court_name"
            value={formData.court_name}
            onChange={handleChange}
            placeholder="Mahkeme adı"
          />

          {/* DOSYA NO */}
          <Input
            label="Dosya No"
            name="case_number"
            value={formData.case_number}
            onChange={handleChange}
            placeholder="Esas no"
          />

          {/* MAHKEME TÜRÜ */}
          <Input
            label="Mahkeme Türü"
            name="court_type"
            value={formData.court_type}
            onChange={handleChange}
            placeholder="Örn: Asliye Hukuk, Sulh Hukuk, Ağır Ceza"
          />

          {/* MÜVEKKİLLER (ÇOKLU SEÇİM) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Müvekkil *
            </label>
            <select
              name="client_ids"
              multiple
              value={formData.client_ids}
              onChange={handleClientChange}
              className={`w-full rounded-md border ${
                errors.client_ids ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]`}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.client_type === 'corporate' ? '🏢' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Birden fazla seçmek için Ctrl (Cmd) tuşuna basılı tutun</p>
            {errors.client_ids && (
              <p className="mt-1 text-sm text-red-600">{errors.client_ids}</p>
            )}
          </div>

          {/* ATANAN AVUKAT */}
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

          {/* DURUM */}
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

          {/* ÖNCELİK */}
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

          {/* KONU */}
          <Input
            label="Konu"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Dava konusu"
          />

          {/* AÇIKLAMA */}
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
              placeholder="Dava hakkında detaylı açıklama..."
            />
          </div>

          {/* BUTONLAR */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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