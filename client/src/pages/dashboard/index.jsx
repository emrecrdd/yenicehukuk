import { useAuth } from '../../app/providers/auth.provider.jsx';
import { useQuery } from '@tanstack/react-query';
import dashboardApi from '../../features/dashboard/dashboard.api.js';
import eventApi from '../../features/events/event.api.js';
import meetingApi from '../../features/meetings/meeting.api.js';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import Badge from '../../components/ui/Badge.jsx';  // ✅ EKLENDI

const Dashboard = () => {
  const { user } = useAuth();

  // Dashboard istatistikleri
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: hearingsData, isLoading: hearingsLoading } = useQuery({
    queryKey: ['dashboard-hearings'],
    queryFn: () => dashboardApi.getHearings(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => dashboardApi.getTasks(),
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Meeting'leri getir
  const { data: meetingsData } = useQuery({
    queryKey: ['dashboard-meetings'],
    queryFn: () => meetingApi.getUpcoming(),
    staleTime: 5 * 60 * 1000,
  });

  const meetings = meetingsData?.data?.data || [];

  // Bugünkü toplantılar
  const todayMeetings = meetings.filter(m => 
    dayjs(m.start_date).isSame(dayjs(), 'day')
  );

  // ✅ Boş gün widget'ı için
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();

  const { data: calendarData } = useQuery({
    queryKey: ['calendar-events', currentYear, currentMonth],
    queryFn: () => eventApi.getCalendarEvents({ year: currentYear, month: currentMonth }),
    staleTime: 5 * 60 * 1000,
  });

  const events = calendarData?.data?.data || [];

  // ✅ TÜM ETKİNLİKLERİ BİRLEŞTİR (Events + Meetings)
  const allEvents = [
    ...events,
    ...meetings.map(m => ({
      id: `meeting-${m.id}`,
      title: m.title,
      start: m.start_date,
      end: m.end_date || m.start_date,
      type: 'meeting',
      status: m.status,
    }))
  ];

  // ✅ allEvents ile hesapla (artık toplantılar da dahil)
  const getWeeklyEmptyDays = () => {
    const today = dayjs();
    const startOfWeek = today.startOf('week');
    const endOfWeek = today.endOf('week');
    
    let emptyCount = 0;
    let currentDay = startOfWeek;
    
    while (currentDay.isBefore(endOfWeek) || currentDay.isSame(endOfWeek, 'day')) {
      const dayEvents = allEvents.filter(event => dayjs(event.start).isSame(currentDay, 'day'));
      if (dayEvents.length === 0) {
        emptyCount++;
      }
      currentDay = currentDay.add(1, 'day');
    }
    
    return emptyCount;
  };

  const weeklyEmptyDays = getWeeklyEmptyDays();

  const stats = statsData?.data?.data || {};
  const hearings = hearingsData?.data?.data || [];
  const tasks = tasksData?.data?.data || [];

  const statCards = [
    { label: 'Toplam Müvekkil', value: stats.totalClients || 0, icon: '👤', color: 'bg-blue-500', link: '/clients' },
    { label: 'Aktif Davalar', value: stats.activeCases || 0, icon: '📁', color: 'bg-green-500', link: '/cases' },
    { label: 'Toplam Belge', value: stats.totalDocuments || 0, icon: '📄', color: 'bg-purple-500', link: '/documents' },
    { label: 'Bekleyen Görev', value: stats.pendingTasks || 0, icon: '✅', color: 'bg-orange-500', link: '/tasks' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority) => {
    const labels = { critical: 'Kritik', high: 'Yüksek', normal: 'Normal', low: 'Düşük' };
    return labels[priority] || priority;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
      case 'in_progress': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'scheduled':
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Planlandı',
      ongoing: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
      pending: 'Bekliyor',
      in_progress: 'Devam Ediyor',
    };
    return labels[status] || status;
  };

  // ✅ allEvents ile ayın boş gün oranını hesapla
  const allDays = [];
  const daysInMonth = dayjs().daysInMonth();
  for (let i = 1; i <= daysInMonth; i++) {
    const date = dayjs().date(i);
    const dayEvents = allEvents.filter(event => dayjs(event.start).isSame(date, 'day'));
    allDays.push({ date, events: dayEvents });
  }
  const totalDays = allDays.length;
  const emptyCount = allDays.filter(d => d.events.length === 0).length;
  const emptyRatio = totalDays > 0 ? Math.round((emptyCount / totalDays) * 100) : 0;

  // ✅ İSTATİSTİK WIDGET'I
  const hearingCount = events.filter(e => e.event_type === 'hearing').length;
  const meetingCount = meetings.length;
  const taskCount = events.filter(e => e.type === 'task').length;
  
  // En yoğun günü bul
  let busiestDay = null;
  let maxEvents = 0;
  allDays.forEach(d => {
    if (d.events.length > maxEvents) {
      maxEvents = d.events.length;
      busiestDay = d;
    }
  });

  if (statsLoading || hearingsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hoş Geldin, {user?.first_name}! 👋
        </h1>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString('tr-TR')}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Extra Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💰 Finans</h2>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Toplam Tahsilat</span>
              <span className="font-bold text-green-600">{stats.totalReceived?.toLocaleString('tr-TR')} TL</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Bekleyen Tahsilat</span>
              <span className="font-bold text-yellow-600">{stats.totalPendingPayments?.toLocaleString('tr-TR')} TL</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Hızlı Erişim</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/clients/create" className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <span className="text-2xl block">👤</span>
              <span className="text-sm">Müvekkil Ekle</span>
            </Link>
            <Link to="/cases/create" className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <span className="text-2xl block">📁</span>
              <span className="text-sm">Dava Aç</span>
            </Link>
            <Link to="/documents/upload" className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <span className="text-2xl block">📄</span>
              <span className="text-sm">Belge Yükle</span>
            </Link>
            <Link to="/tasks/create" className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
              <span className="text-2xl block">✅</span>
              <span className="text-sm">Görev Ekle</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ İSTATİSTİK WIDGET'I */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Bu Ayın İstatistikleri ({dayjs().format('MMMM YYYY')})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">⚖️ Duruşma</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{hearingCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">🤝 Toplantı</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{meetingCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">📄 Görev</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{taskCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">🟢 Boş Gün</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{emptyCount}</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📅 En Yoğun Gün: 
            {busiestDay && busiestDay.events.length > 0 ? (
              <span className="font-medium text-gray-900 dark:text-white">
                {dayjs(busiestDay.date).format('DD MMMM YYYY')} ({busiestDay.events.length} etkinlik)
              </span>
            ) : 'Veri yok'}
          </p>
        </div>
      </div>

      {/* ✅ BOŞ GÜN WIDGET'I */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🗓️ Bu Hafta Boş Günler</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">{weeklyEmptyDays}</div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bu hafta {weeklyEmptyDays} boş günün var</p>
              <p className="text-xs text-gray-500">
                {weeklyEmptyDays > 3 ? 'Harika! Zamanın bol ' : 
                 weeklyEmptyDays > 1 ? 'Değerlendirmek için fırsat var 💪' : 
                 'Yoğun bir hafta geçireceksin 📋'}
              </p>
            </div>
          </div>
         
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Ayın Durumu ({dayjs().format('MMMM')})
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">🟢 Boş Gün</span>
              <div className="flex-1 mx-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${emptyRatio}%` }}></div>
              </div>
              <span className="text-sm font-medium">{emptyRatio}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">🟡 Dolu Gün</span>
              <div className="flex-1 mx-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${100 - emptyRatio}%` }}></div>
              </div>
              <span className="text-sm font-medium">{100 - emptyRatio}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {dayjs().format('MMMM YYYY')} ayında {totalDays} günün {emptyCount}'ü boş
          </p>
        </div>
      </div>

      {/* Bugünkü Duruşmalar & Toplantılar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bugünkü Duruşmalar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⏰ Bugünkü Duruşmalar</h2>
          {hearings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Bugün duruşma yok</p>
          ) : (
            <div className="space-y-3">
              {hearings.map((hearing) => (
                <div key={hearing.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {dayjs(hearing.start_date).format('HH:mm')} - {hearing.case?.client?.first_name} {hearing.case?.client?.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hearing.location || 'Yer belirtilmemiş'}
                    </p>
                    {hearing.case && (
                      <p className="text-xs text-gray-500">Dava: {hearing.case.title}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(hearing.status)}`}>
                    {getStatusLabel(hearing.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bugünkü Toplantılar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🤝 Bugünkü Toplantılar</h2>
          {todayMeetings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Bugün toplantı yok</p>
          ) : (
            <div className="space-y-3">
              {todayMeetings.map((meeting) => (
                <Link key={meeting.id} to={`/meetings/${meeting.id}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{meeting.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dayjs(meeting.start_date).format('HH:mm')}
                      {meeting.case && ` • ${meeting.case.title}`}
                      {meeting.client && ` • ${meeting.client.first_name} ${meeting.client.last_name}`}
                    </p>
                  </div>
                  <Badge 
                    variant={meeting.status === 'scheduled' ? 'warning' : 
                             meeting.status === 'ongoing' ? 'info' : 
                             meeting.status === 'completed' ? 'success' : 'danger'}
                  >
                    {meeting.status === 'scheduled' ? 'Planlandı' :
                     meeting.status === 'ongoing' ? 'Devam Ediyor' :
                     meeting.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;