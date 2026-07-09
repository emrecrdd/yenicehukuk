import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import taskApi from '../../features/tasks/task.api.js';
import caseApi from '../../features/cases/case.api.js';
import clientApi from '../../features/clients/client.api.js';
import userApi from '../../features/users/user.api.js';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const TaskCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'normal',
    due_date: '',
    assigned_to: '',
    case_id: '',
    client_id: '',
  });
  const [errors, setErrors] = useState({});

  // ✅ Admin değilse assigned_to'yu otomatik doldur
  useEffect(() => {
    if (user?.role !== 'admin' && user?.id) {
      setFormData(prev => ({
        ...prev,
        assigned_to: user.id
      }));
    }
  }, [user]);

  // ✅ Tüm kullanıcıları getir
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll(),
  });

  const { data: casesData } = useQuery({
    queryKey: ['cases', { limit: 100 }],
    queryFn: () => caseApi.getAll({ limit: 100 }),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

  const users = usersData?.data?.data || [];
  const cases = casesData?.data?.data || [];
  const clients = clientsData?.data?.data || [];

  // ✅ Admin ise herkesi göster, değilse sadece kendini
  const assignableUsers = user?.role === 'admin'
    ? users
    : users.filter(u => u.id === user.id);

  const mutation = useMutation({
    mutationFn: (data) => taskApi.create(data),
    onSuccess: () => {
      toast.success('Görev başarıyla oluşturuldu');
      navigate('/tasks');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Görev oluşturulamadı');
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
    if (!formData.title) newErrors.title = 'Görev adı gereklidir';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ✅ Admin değilse user.id'yi kullan
    const assignedTo = user?.role !== 'admin' ? user?.id : formData.assigned_to;

    const submitData = {
      ...formData,
      assigned_to: assignedTo || null,
      case_id: formData.case_id || null,
      client_id: formData.client_id || null,
      due_date: formData.due_date || null,
    };

    mutation.mutate(submitData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/tasks" className="text-blue-600 hover:underline">
            ← Görevler
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ✅ Yeni Görev
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Input
            label="Görev Adı *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Görev başlığı..."
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
              placeholder="Görev açıklaması..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="pending">Bekliyor</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Son Tarih
              </label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ✅ Atanan Kişi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Atanan Kişi
            </label>
            
            {user?.role === 'admin' ? (
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Atanacak kişi seçin</option>
                {assignableUsers.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.first_name} {person.last_name}
                    {person.role === 'admin' && ' (Admin)'}
                    {person.role === 'lawyer' && ' (Avukat)'}
                    {person.role === 'intern' && ' (Stajyer)'}
                    {person.role === 'secretary' && ' (Sekreter)'}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name} (Kendin)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İlişkili Dava
              </label>
              <select
                name="case_id"
                value={formData.case_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Dava seçin (isteğe bağlı)</option>
                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İlişkili Müvekkil
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Müvekkil seçin (isteğe bağlı)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}  {/* ✅ SADECE BURASI DEĞİŞTİ */}
                    {client.company_name && ` (${client.company_name})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={mutation.isPending}>
              ✅ Görev Oluştur
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/tasks')}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TaskCreate;