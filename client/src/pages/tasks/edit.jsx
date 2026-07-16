import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
} from '../../features/tasks/task.query.js';
import { useUsers } from '../../features/users/user.query.js';
import { useCases } from '../../features/cases/case.query.js';
import { useClients } from '../../features/clients/client.query.js';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';

// ======================================================
// SABİTLER
// ======================================================

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'normal',
  due_date: '',
  assigned_to: '',
  case_id: '',
  client_id: '',
  estimated_hours: '',
};

// ======================================================
// COMPONENT
// ======================================================

const TaskEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  // ✅ HOOK'lar
  const { data, isLoading: taskLoading } = useTask(id);
  const { data: usersData } = useUsers();
  const { data: casesData } = useCases({ limit: 100 });
  const { data: clientsData } = useClients({ limit: 100 });
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const task = data?.data?.data;
  const users = usersData?.data?.data || [];
  const cases = casesData?.data?.data || [];
  const clients = clientsData?.data?.data || [];

  // ✅ Admin değilse kendine ata
  useEffect(() => {
    if (user?.role !== 'admin' && user?.id) {
      setFormData((prev) => ({
        ...prev,
        assigned_to: user.id,
      }));
    }
  }, [user]);

  // ✅ Task geldiğinde form'u doldur
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'normal',
        due_date: task.due_date
          ? new Date(task.due_date).toISOString().slice(0, 16)
          : '',
        assigned_to: task.assigned_to || '',
        case_id: task.case_id || '',
        client_id: task.client_id || '',
        estimated_hours: task.estimated_hours || '',
      });
    }
  }, [task]);

  // ✅ useMemo ile optimize et
  const assignableUsers = useMemo(() => {
    if (user?.role === 'admin') return users;
    return users.filter((u) => u.id === user?.id);
  }, [users, user]);

  // ======================================================
  // HANDLERS
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: 'Görev adı gereklidir' });
      return;
    }

    const assignedTo =
      user?.role !== 'admin' ? user?.id : formData.assigned_to;

    const submitData = {
      ...formData,
      assigned_to: assignedTo || null,
      case_id: formData.case_id || null,
      client_id: formData.client_id || null,
      due_date: formData.due_date || null,
      estimated_hours: formData.estimated_hours
        ? parseFloat(formData.estimated_hours)
        : null,
    };

    updateMutation.mutate(
      { id, data: submitData },
      {
        onSuccess: () => navigate('/tasks'),
      }
    );
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `"${task?.title}" görevini silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`
      )
    ) {
      deleteMutation.mutate(id, {
        onSuccess: () => navigate('/tasks'),
      });
    }
  };

  // ======================================================
  // LOADING / ERROR
  // ======================================================

  if (taskLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Görev Bulunamadı
        </h2>
        <Link
          to="/tasks"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Görevlere Dön
        </Link>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/tasks/${id}`} className="text-blue-600 hover:underline">
            ← Görev Detayı
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ✏️ Görev Düzenle
          </h1>
          <p className="text-sm text-gray-500">{task.title} görevini düzenle</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ⏱️ Tahmini Süre (Saat)
            </label>
            <input
              type="number"
              name="estimated_hours"
              value={formData.estimated_hours}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: 2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              👤 Atanan Kişi
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
                📁 İlişkili Dava
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
                👤 İlişkili Müvekkil
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
                    {client.name}
                    {client.company_name && ` (${client.company_name})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={updateMutation.isPending}>
              💾 Güncelle
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/tasks/${id}`)}
            >
              İptal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
            >
              🗑️ Sil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TaskEdit;