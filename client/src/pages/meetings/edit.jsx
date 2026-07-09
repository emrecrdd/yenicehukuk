import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import meetingApi from '../../features/meetings/meeting.api.js';
import caseApi from '../../features/cases/case.api.js';
import clientApi from '../../features/clients/client.api.js';
import userApi from '../../features/users/user.api.js';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const MeetingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    meeting_type: 'other',
    case_id: '',
    client_id: '',
    assigned_to: '',
    status: 'scheduled',
    attendees: [],
    meeting_link: '',
    notes: '',
  });
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeRole, setAttendeeRole] = useState('');

  // ✅ Admin değilse assigned_to'yu otomatik doldur
  useEffect(() => {
    if (user?.role !== 'admin' && user?.id) {
      setFormData(prev => ({
        ...prev,
        assigned_to: user.id
      }));
    }
  }, [user]);

  const { data: meetingData, isLoading: meetingLoading } = useQuery({
    queryKey: ['meeting', id],
    queryFn: () => meetingApi.getOne(id),
    enabled: !!id,
  });

  const { data: casesData } = useQuery({
    queryKey: ['cases', { limit: 100 }],
    queryFn: () => caseApi.getAll({ limit: 100 }),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll(),
  });

  const meeting = meetingData?.data;
  const cases = casesData?.data?.data || [];
  const clients = clientsData?.data?.data || [];
  const users = usersData?.data?.data || [];

  // ✅ Admin ise herkesi göster, değilse sadece kendini
  const assignableUsers = user?.role === 'admin'
    ? users
    : users.filter(u => u.id === user.id);

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        start_date: meeting.start_date ? new Date(meeting.start_date).toISOString().slice(0, 16) : '',
        end_date: meeting.end_date ? new Date(meeting.end_date).toISOString().slice(0, 16) : '',
        location: meeting.location || '',
        meeting_type: meeting.meeting_type || 'other',
        case_id: meeting.case_id || '',
        client_id: meeting.client_id || '',
        assigned_to: meeting.assigned_to || '',
        status: meeting.status || 'scheduled',
        attendees: meeting.attendees || [],
        meeting_link: meeting.meeting_link || '',
        notes: meeting.notes || '',
      });
    }
  }, [meeting]);

  const updateMutation = useMutation({
    mutationFn: (data) => meetingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', id] });
      toast.success('Toplantı başarıyla güncellendi');
      navigate('/meetings');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplantı güncellenemedi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => meetingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Toplantı silindi');
      navigate('/meetings');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Toplantı silinemedi');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAttendee = () => {
    if (attendeeName.trim()) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, { name: attendeeName.trim(), role: attendeeRole || 'Katılımcı' }],
      }));
      setAttendeeName('');
      setAttendeeRole('');
    }
  };

  const handleRemoveAttendee = (index) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Admin değilse user.id'yi kullan
    const assignedTo = user?.role !== 'admin' ? user?.id : formData.assigned_to;

    const submitData = {
      ...formData,
      case_id: formData.case_id || null,
      client_id: formData.client_id || null,
      assigned_to: assignedTo || null,
      attendees: formData.attendees,
    };

    updateMutation.mutate(submitData);
  };

  const handleDelete = () => {
    if (window.confirm('Bu toplantıyı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate();
    }
  };

  if (meetingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Toplantı Bulunamadı</h2>
        <Link to="/meetings" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Toplantılara Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/meetings/${id}`} className="text-blue-600 hover:underline">
            ← Toplantı Detayı
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ✏️ Toplantı Düzenle
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Input
            label="Başlık *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Toplantı başlığı..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Toplantı ile ilgili notlar..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Başlangıç Tarihi *"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
            />
            <Input
              label="Bitiş Tarihi"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Yer"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Toplantı yeri..."
          />

          <Input
            label="Toplantı Linki (Zoom/Teams)"
            name="meeting_link"
            value={formData.meeting_link}
            onChange={handleChange}
            placeholder="https://zoom.us/..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Toplantı Türü
            </label>
            <select
              name="meeting_type"
              value={formData.meeting_type}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="client">👤 Müvekkil Görüşmesi</option>
              <option value="internal">🏢 İç Toplantı</option>
              <option value="phone">📞 Telefon Görüşmesi</option>
              <option value="other">📌 Diğer</option>
            </select>
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
                    {client.first_name} {client.last_name}
                    {client.company_name && ` (${client.company_name})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ✅ Atanan Avukat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Atanan Avukat
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              👥 Katılımcılar
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                placeholder="Katılımcı adı"
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={attendeeRole}
                onChange={(e) => setAttendeeRole(e.target.value)}
                placeholder="Rol"
                className="w-32 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="button" variant="secondary" onClick={handleAddAttendee}>
                Ekle
              </Button>
            </div>
            {formData.attendees.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.attendees.map((attendee, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                  >
                    {attendee.name} {attendee.role && `(${attendee.role})`}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Toplantı sonrası notlar..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={updateMutation.isPending}>
              💾 Güncelle
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`/meetings/${id}`)}>
              İptal
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
              🗑️ Sil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MeetingEdit;