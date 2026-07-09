import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import eventApi from '../../features/events/event.api.js';
import caseApi from '../../features/cases/case.api.js';
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Building2, User, 
  Users, Edit2, Trash2, CalendarDays, AlarmClock,
  Briefcase, Phone, Mail, FileText, StickyNote, CheckSquare,
  Scale, Gavel, DollarSign, AlertCircle, UserCog, UserPlus
} from 'lucide-react';

// ✅ Rol seçenekleri
const roleOptions = [
  { value: 'avukat', label: 'Avukat', icon: '⚖️' },
  { value: 'karsi_taraf_avukati', label: 'Karşı Taraf Avukatı', icon: '⚖️' },
  { value: 'müvekkil', label: 'Müvekkil', icon: '👤' },
  { value: 'davaci', label: 'Davacı', icon: '👤' },
  { value: 'davali', label: 'Davalı', icon: '👤' },
  { value: 'tanik', label: 'Tanık', icon: '🗣️' },
  { value: 'bilirkişi', label: 'Bilirkişi', icon: '🔬' },
  { value: 'uzman', label: 'Uzman', icon: '🎯' },
  { value: 'tercüman', label: 'Tercüman', icon: '🌐' },
  { value: 'gözlemci', label: 'Gözlemci', icon: '👁️' },
  { value: 'diger', label: 'Diğer', icon: '👤' },
];

// ✅ Dava durumu etiketleri (Türkçe)
const getCaseStatusLabel = (status) => {
  const labels = {
    active: 'Devam Ediyor',
    preparation: 'Hazırlık',
    hearing: 'Duruşmada',
    appeal: 'İstinaf',
    cassation: 'Temyiz',
    concluded: 'Sonuçlandı',
    archived: 'Arşivlendi',
  };
  return labels[status] || status;
};

// ✅ Dava durumu renkleri
const getCaseStatusVariant = (status) => {
  const variants = {
    active: 'success',
    preparation: 'warning',
    hearing: 'info',
    appeal: 'warning',
    cassation: 'default',
    concluded: 'default',
    archived: 'danger',
  };
  return variants[status] || 'default';
};

const EventDetail = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getOne(id),
    enabled: !!id,
  });

  const event = data?.data?.data;

  const { data: caseData } = useQuery({
    queryKey: ['case', event?.case_id],
    queryFn: () => caseApi.getOne(event?.case_id),
    enabled: !!event?.case_id,
  });

  const caseItem = caseData?.data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-xl text-red-600 font-semibold">Duruşma bulunamadı</p>
        <Link to="/calendar" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Takvime Dön
        </Link>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatTime = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('tr-TR');
    } catch {
      return '-';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Planlandı',
      ongoing: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status) => {
    const variants = {
      scheduled: 'info',
      ongoing: 'warning',
      completed: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      hearing: 'Duruşma',
      meeting: 'Toplantı',
      deadline: 'Son Tarih',
      reminder: 'Hatırlatma',
      other: 'Diğer',
    };
    return labels[type] || type;
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      hearing: '⚖️',
      meeting: '🤝',
      deadline: '⏰',
      reminder: '🔔',
      other: '📌',
    };
    return icons[type] || '📌';
  };

  const getHearingTypeLabel = (type) => {
    const labels = {
      preliminary: 'Ön İnceleme',
      investigation: 'Tahkikat',
      expert_examination: 'Bilirkişi İncelemesi',
      witness_hearing: 'Tanık Dinlenmesi',
      final_decision: 'Karar Duruşması',
      other: 'Diğer',
    };
    return labels[type] || type;
  };

  const getExpenseStatusLabel = (status) => {
    const labels = {
      paid: 'Ödendi ✅',
      pending: 'Bekliyor ⏳',
      not_applicable: 'Yok',
    };
    return labels[status] || status;
  };

  const getExpenseStatusVariant = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      not_applicable: 'default',
    };
    return variants[status] || 'default';
  };

  // ✅ Rol ikonu ve rengi
  const getRoleIcon = (role) => {
    const icons = {
      'avukat': '⚖️',
      'karsi_taraf_avukati': '⚖️',
      'müvekkil': '👤',
      'davaci': '👤',
      'davali': '👤',
      'tanik': '🗣️',
      'bilirkişi': '🔬',
      'uzman': '🎯',
      'tercüman': '🌐',
      'gözlemci': '👁️',
      'diger': '👤',
    };
    return icons[role?.toLowerCase()] || '👤';
  };

  const getRoleColor = (role) => {
    const colors = {
      'avukat': 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
      'karsi_taraf_avukati': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
      'müvekkil': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
      'davaci': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
      'davali': 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
      'tanik': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
      'bilirkişi': 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
      'uzman': 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400',
      'tercüman': 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400',
      'gözlemci': 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
      'diger': 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400',
    };
    return colors[role?.toLowerCase()] || 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400';
  };

  const getRoleLabel = (role) => {
    const found = roleOptions.find(r => r.value === role);
    return found?.label || role || 'Katılımcı';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
     {/* Header */}
<div className="flex items-center justify-between">
  <div>
    <Link 
      to={event.case_id ? `/cases/${event.case_id}` : '/calendar'} 
      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {event.case_id ? 'Davaya Dön' : 'Takvime Dön'}
    </Link>
    <div className="mt-2">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {event.title}
      </h1>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <Badge variant={getStatusVariant(event.status)}>
          {getStatusLabel(event.status)}
        </Badge>
        <Badge variant="default" className="bg-gray-100 dark:bg-gray-700">
          {getEventTypeLabel(event.event_type)}
        </Badge>
        {event.hearing_type && (
          <Badge variant="default" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {getHearingTypeLabel(event.hearing_type)}
          </Badge>
        )}
      </div>
    </div>
  </div>
  <div className="flex gap-2">
    <Link to={`/events/${event.id}/edit`}>
      <Button variant="outline" size="sm">
        <Edit2 className="w-4 h-4 mr-2" />
        Düzenle
      </Button>
    </Link>
  </div>
</div>
      {/* Ana Kart */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
        <Card.Body className="space-y-6">
          {/* Açıklama */}
          {event.description && (
            <div>
              <p className="text-sm text-gray-500">Açıklama</p>
              <p className="text-gray-900 dark:text-white mt-1">{event.description}</p>
            </div>
          )}

          {/* Dosya / Esas Numarası */}
          {caseItem && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {caseItem.case_number || 'Esas no yok'}
                </span>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {caseItem.court_name || 'Mahkeme yok'}
                </span>
              </div>
            </div>
          )}

          {/* Tarih ve Saat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Başlangıç</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(event.start_date)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(event.start_date)}
                </p>
              </div>
            </div>
            {event.end_date && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Clock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Bitiş</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(event.end_date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(event.end_date)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Yer Bilgileri */}
          {(event.location || event.court_room || event.judge_name) && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📍 Yer Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Yer</p>
                      <p className="font-medium text-gray-900 dark:text-white">{event.location}</p>
                    </div>
                  </div>
                )}
                {event.court_room && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Salon</p>
                      <p className="font-medium text-gray-900 dark:text-white">{event.court_room}</p>
                    </div>
                  </div>
                )}
                {event.judge_name && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Hakim</p>
                      <p className="font-medium text-gray-900 dark:text-white">{event.judge_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ KATILIMCILAR */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                👥 Katılımcılar
              </h3>
              <Badge variant="default" className="bg-gray-100 dark:bg-gray-700">
                {(event.attendees?.length || 0) + (event.opposing_counsel ? 1 : 0) + (event.assignedTo ? 1 : 0)} Kişi
              </Badge>
            </div>

            <div className="space-y-2">
              {/* Atanan Avukat */}
              {event.assignedTo && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-300 text-lg">
                    ⚖️
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.assignedTo?.first_name} {event.assignedTo?.last_name}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Avukat</p>
                  </div>
                </div>
              )}

              {/* Karşı Taraf Avukatı */}
              {event.opposing_counsel && (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center text-red-600 dark:text-red-300 text-lg">
                    ⚖️
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.opposing_counsel}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">Karşı Taraf Avukatı</p>
                  </div>
                </div>
              )}

              {/* Diğer Katılımcılar */}
              {event.attendees && event.attendees.length > 0 && (
                <>
                  {event.attendees.map((attendee, index) => {
                    const role = attendee.role || 'diger';
                    const icon = getRoleIcon(role);
                    const colorClass = getRoleColor(role);
                    const roleLabel = getRoleLabel(role);

                    return (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border ${colorClass}`}>
                        <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-gray-700/50 flex items-center justify-center text-lg">
                          {icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {attendee.name}
                          </p>
                          <p className="text-sm capitalize">
                            {roleLabel}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {(!event.attendees || event.attendees.length === 0) && !event.opposing_counsel && !event.assignedTo && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  Henüz katılımcı eklenmemiş
                </div>
              )}
            </div>
          </div>

          {/* Son Duruşma Sonucu */}
          {event.last_hearing_result && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Son Duruşma Sonucu</p>
                  <p className="text-gray-900 dark:text-white">{event.last_hearing_result}</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Yapılacak İşler (Checklist) */}
          {event.todo_items && event.todo_items.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                ✅ Yapılacak İşler
              </h3>
              <div className="space-y-2">
                {event.todo_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <input 
                      type="checkbox" 
                      checked={item.done || false}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      onChange={() => {}} 
                    />
                    <span className={item.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Masraf / Harç Durumu */}
          {event.expense_status && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Masraf / Harç Durumu</p>
                  <Badge variant={getExpenseStatusVariant(event.expense_status)}>
                    {getExpenseStatusLabel(event.expense_status)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* ✅ İlişkili Dava - TÜRKÇE */}
          {caseItem && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📋 İlişkili Dava</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/cases/${caseItem.id}`}
                    className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {caseItem.title}
                  </Link>
                  <Badge variant={getCaseStatusVariant(caseItem.status)}>
                    {getCaseStatusLabel(caseItem.status)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">📋 Esas No</p>
                    <p className="font-medium text-gray-900 dark:text-white">{caseItem.case_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">🏛️ Mahkeme</p>
                    <p className="font-medium text-gray-900 dark:text-white">{caseItem.court_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">⚖️ Dava Türü</p>
                    <p className="font-medium text-gray-900 dark:text-white">{caseItem.case_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">👤 Müvekkil</p>
                    <Link 
                      to={`/clients/${caseItem.client?.id}`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {caseItem.client?.first_name} {caseItem.client?.last_name || '-'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Müvekkil İletişim */}
          {caseItem?.client && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📞 Müvekkil İletişim</h3>
              <div className="flex flex-wrap gap-2">
                {caseItem.client.phone && (
                  <a 
                    href={`tel:${caseItem.client.phone}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {caseItem.client.phone}
                  </a>
                )}
                {caseItem.client.email && (
                  <a 
                    href={`mailto:${caseItem.client.email}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {caseItem.client.email}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Hatırlatma */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-start gap-3">
              <AlarmClock className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">⏰ Hatırlatma</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {event.reminder_minutes > 0 ? `${event.reminder_minutes} dakika önce` : 'Hatırlatma yok'}
                </p>
              </div>
            </div>
          </div>

          {/* Oluşturulma Bilgisi */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 text-xs text-gray-400">
            <p>👤 Oluşturan: {event.creator?.first_name} {event.creator?.last_name}</p>
            <p>📅 Oluşturulma: {formatDateTime(event.created_at)}</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EventDetail;