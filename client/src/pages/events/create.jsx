import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import eventApi from '../../features/events/event.api.js';
import userApi from '../../features/users/user.api.js';
import { useAuth } from '../../app/providers/auth.provider.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const EventCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const caseIdFromUrl = searchParams.get('case');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hearing_type: 'other',
    last_hearing_result: '',
    opposing_counsel: '',
    expense_status: 'pending',
    start_date: '',
    end_date: '',
    location: '',
    court_room: '',
    judge_name: '',
    status: 'scheduled',
    case_id: caseIdFromUrl || '',
    assigned_to: '',
    is_all_day: false,
    reminder_minutes: 30,
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

  // ✅ Katılımcılar state
  const [attendeesInput, setAttendeesInput] = useState('');
  const [attendeesRole, setAttendeesRole] = useState('diger');
  const [attendees, setAttendees] = useState([]);

  // ✅ Rol seçenekleri
  const roleOptions = [
    { value: 'avukat', label: 'Avukat', icon: '⚖️' },
    { value: 'karsi_taraf_avukati', label: 'Karşı Taraf Avukatı', icon: '⚖️' },
    { value: 'tanik', label: 'Tanık', icon: '🗣️' },
    { value: 'bilirkişi', label: 'Bilirkişi', icon: '🔬' },
    { value: 'uzman', label: 'Uzman', icon: '🎯' },
    { value: 'tercüman', label: 'Tercüman', icon: '🌐' },
    { value: 'gözlemci', label: 'Gözlemci', icon: '👁️' },
    { value: 'diger', label: 'Diğer', icon: '👤' },
  ];

  // ✅ Tüm kullanıcıları getir
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll(),
  });

  const users = usersData?.data?.data || [];

  // ✅ Admin ise herkesi göster, değilse sadece kendini
  const assignableUsers = user?.role === 'admin'
    ? users
    : users.filter(u => u.id === user.id);

  const mutation = useMutation({
    mutationFn: (data) => eventApi.create(data),
    onSuccess: (response) => {
      toast.success('Duruşma başarıyla eklendi');
      const event = response.data.data;
      if (event.case_id) {
        navigate(`/cases/${event.case_id}`);
      } else {
        navigate('/calendar');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Duruşma eklenemedi');
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Katılımcı fonksiyonları
  const addAttendee = () => {
    const name = attendeesInput.trim();
    if (name) {
      setAttendees([...attendees, { name, role: attendeesRole }]);
      setAttendeesInput('');
    }
  };

  const removeAttendee = (index) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAttendee();
    }
  };

  // ✅ DÜZELTİLDİ - Tarihler UTC'ye çevriliyor
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Başlık gereklidir';
    if (!formData.start_date) newErrors.start_date = 'Başlangıç tarihi gereklidir';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const assignedTo = user?.role !== 'admin' ? user?.id : formData.assigned_to;

    // ✅ Tarihleri UTC'ye çevir
    const startDate = formData.start_date ? new Date(formData.start_date) : null;
    const endDate = formData.end_date ? new Date(formData.end_date) : null;

    mutation.mutate({
      ...formData,
      event_type: 'hearing',
      assigned_to: assignedTo || null,
      case_id: formData.case_id || null,
      start_date: startDate ? startDate.toISOString() : null,
      end_date: endDate ? endDate.toISOString() : null,
      attendees: attendees.map(a => ({ name: a.name, role: a.role || 'diger' })),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={caseIdFromUrl ? `/cases/${caseIdFromUrl}` : '/calendar'} 
                className="text-blue-600 hover:underline">
            ← Geri Dön
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ⚖️ Yeni Duruşma
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
            error={errors.title}
            placeholder="Örn: Ön İnceleme Duruşması"
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
              placeholder="Duruşma ile ilgili notlar..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duruşma Türü
            </label>
            <select
              name="hearing_type"
              value={formData.hearing_type}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="preliminary">Ön İnceleme</option>
              <option value="investigation">Tahkikat</option>
              <option value="expert_examination">Bilirkişi İncelemesi</option>
              <option value="witness_hearing">Tanık Dinlenmesi</option>
              <option value="final_decision">Karar Duruşması</option>
              <option value="other">Diğer</option>
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
              <option value="scheduled">Planlandı</option>
              <option value="ongoing">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Başlangıç Tarihi *"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              error={errors.start_date}
            />
            <Input
              label="Bitiş Tarihi"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Mahkeme"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Mahkeme adı"
            />
            <Input
              label="Salon"
              name="court_room"
              value={formData.court_room}
              onChange={handleChange}
              placeholder="Salon no"
            />
            <Input
              label="Hakim"
              name="judge_name"
              value={formData.judge_name}
              onChange={handleChange}
              placeholder="Hakim adı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Son Duruşma Sonucu
            </label>
            <textarea
              name="last_hearing_result"
              value={formData.last_hearing_result}
              onChange={handleChange}
              rows="2"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bilirkişi raporu beklenecek, tanıklar dinlenecek..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Input
              label="Karşı Taraf Avukatı"
              name="opposing_counsel"
              value={formData.opposing_counsel}
              onChange={handleChange}
              placeholder="Av. Ahmet Yılmaz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Masraf / Harç Durumu
            </label>
            <select
              name="expense_status"
              value={formData.expense_status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="paid">Ödendi</option>
              <option value="pending">Bekliyor</option>
              <option value="not_applicable">Yok</option>
            </select>
          </div>

          {/* Katılımcılar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              👥 Katılımcılar
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={attendeesInput}
                onChange={(e) => setAttendeesInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Katılımcı adı yaz"
              />
              <select
                value={attendeesRole}
                onChange={(e) => setAttendeesRole(e.target.value)}
                className="sm:w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              <Button type="button" size="sm" onClick={addAttendee} className="sm:w-auto">
                Ekle
              </Button>
            </div>
            
            {attendees.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attendees.map((attendee, index) => {
                  const role = roleOptions.find(r => r.value === attendee.role);
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {role?.icon || '👤'} {attendee.name} ({role?.label || attendee.role})
                      <button
                        type="button"
                        onClick={() => removeAttendee(index)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Katılımcı eklemek için isim yaz, rol seç ve Ekle butonuna tıkla</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hatırlatma (dakika)
              </label>
              <select
                name="reminder_minutes"
                value={formData.reminder_minutes}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Hatırlatma yok</option>
                <option value="5">5 dakika</option>
                <option value="10">10 dakika</option>
                <option value="15">15 dakika</option>
                <option value="30">30 dakika</option>
                <option value="60">1 saat</option>
                <option value="120">2 saat</option>
                <option value="1440">1 gün</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                name="is_all_day"
                checked={formData.is_all_day}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Tüm gün etkinlik
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={mutation.isPending}>
              ⚖️ Duruşma Ekle
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                if (caseIdFromUrl) {
                  navigate(`/cases/${caseIdFromUrl}`);
                } else {
                  navigate('/calendar');
                }
              }}
            >
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
  
export default EventCreate;